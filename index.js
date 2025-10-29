const express = require('express')
const { connect } = require("puppeteer-real-browser")
const fs = require("fs")
const path = require("path")

const app = express()
const port = process.env.PORT || 8080
const authToken = process.env.authToken || null

global.browserLimit = Number(process.env.browserLimit) || 20
global.timeOut = Number(process.env.timeOut) || 60000

const CACHE_DIR = path.join(__dirname, "cache")
const CACHE_FILE = path.join(CACHE_DIR, "cache.json")
const CACHE_TTL = 5 * 60 * 1000 

function loadCache() {
  if (!fs.existsSync(CACHE_FILE)) return {}
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"))
  } catch {
    return {}
  }
}

function saveCache(cache) {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
  }
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8")
}

function readCache(key) {
  const cache = loadCache()
  const entry = cache[key]
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.value
  }
  return null
}

function writeCache(key, value) {
  const cache = loadCache()
  cache[key] = { timestamp: Date.now(), value }
  saveCache(cache)
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

if (process.env.NODE_ENV !== 'development') {
  let server = app.listen(port, () => {
    console.log(`Server running on port ${port}`)
  })
  try {
    server.timeout = global.timeOut
  } catch {}
}

async function createBrowser(proxyServer = null) {
  const connectOptions = {
    headless: false,
    turnstile: true,
    connectOption: { defaultViewport: null },
    disableXvfb: false,
  }
  
  if (proxyServer) {
    connectOptions.args = [`--proxy-server=${proxyServer}`]
  }
  
  const { browser } = await connect(connectOptions)

  const pages = await browser.pages()
  const page = pages[0]

  await page.goto('about:blank')

  await page.setRequestInterception(true)
  page.on('request', (req) => {
    const type = req.resourceType()
    if (["image", "stylesheet", "font", "media"].includes(type)) {
      req.abort()
    } else {
      req.continue()
    }
  })

  return { browser, page }
}

const turnstile = require('./endpoints/turnstile')
const cloudflare = require('./endpoints/cloudflare')

app.post('/cloudflare', async (req, res) => {
  const data = req.body
  if (!data || typeof data.mode !== 'string') {
    return res.status(400).json({ message: 'Bad Request: missing or invalid mode' })
  }
  if (authToken && data.authToken !== authToken) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (global.browserLimit <= 0) {
    return res.status(429).json({ message: 'Too Many Requests' })
  }

  let cacheKey, cached
  if (data.mode === "iuam") {

    cacheKey = JSON.stringify(data)
    cached = readCache(cacheKey)
    if (cached) {
      return res.status(200).json({ ...cached, cached: true })
    }
  }

  global.browserLimit--
  let result
  let browser, page

  try {
    const proxyServer = data.proxy ? `${data.proxy.hostname}:${data.proxy.port}` : null
    const ctx = await createBrowser(proxyServer)
    browser = ctx.browser
    page = ctx.page

    await page.goto('about:blank')

    switch (data.mode) {
      case "turnstile":

        result = await turnstile(data, page)
          .then(token => ({ token }))
          .catch(err => ({ code: 500, message: err.message }))
        break

      case "iuam":

        result = await cloudflare(data, page)
          .then(r => ({ ...r }))
          .catch(err => ({ code: 500, message: err.message }))

        if (!result.code || result.code === 200) {
          writeCache(cacheKey, result)
        }
        break

      default:
        result = { code: 400, message: 'Invalid mode' }
    }
  } catch (err) {
    result = { code: 500, message: err.message }
  } finally {
    if (browser) {
      try { await browser.close() } catch {}
    }
    global.browserLimit++
  }

  res.status(result.code ?? 200).json(result)
})

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' })
})

if (process.env.NODE_ENV === 'development') {
  module.exports = app
}