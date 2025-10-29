async function cloudflare(data, page) {
  return new Promise(async (resolve, reject) => {
    if (!data.domain) return reject(new Error("Missing domain parameter"))

    const startTime = Date.now()
    let isResolved = false
    let userAgent = null

    const cl = setTimeout(() => {
      if (!isResolved) {
        isResolved = true
        const elapsedTime = (Date.now() - startTime) / 1000
        resolve({
          cf_clearance: null,
          user_agent: userAgent,
          elapsed_time: elapsedTime,
        })
      }
    }, 20000)

    try {
      if (data.proxy?.username && data.proxy?.password) {
        await page.authenticate({
          username: data.proxy.username,
          password: data.proxy.password,
        })
      }

      page.removeAllListeners("request")
      page.removeAllListeners("response")
      await page.setRequestInterception(true)

      page.on("request", async (req) => {
        try {
          await req.continue()
        } catch (_) {}
      })

      page.on("response", async (res) => {
        try {
          const url = res.url()
          if (url.includes("/cdn-cgi/challenge-platform/")) {
            const headers = res.headers()
            if (headers["set-cookie"]) {
              const match = headers["set-cookie"].match(/cf_clearance=([^;]+)/)
              if (match) {
                const cf_clearance = match[1]
                const userAgent = (await res.request().headers())["user-agent"]
                const elapsedTime = (Date.now() - startTime) / 1000

                if (!isResolved) {
                  isResolved = true
                  clearTimeout(cl)

                  resolve({
                    cf_clearance,
                    user_agent: userAgent,
                    elapsed_time: elapsedTime,
                  })
                }
              }
            }
          }
        } catch (_) {}
      })

      await page.goto(data.domain, { waitUntil: "domcontentloaded" })
      userAgent = await page.evaluate(() => navigator.userAgent)
    } catch (err) {
      if (!isResolved) {
        isResolved = true
        clearTimeout(cl)
        reject(err)
      }
    }
  })
}

module.exports = cloudflare
