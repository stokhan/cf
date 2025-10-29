# cloudflare bypass with super fast speed 🚀🚀💖

A Node.js service that automates Chromium to bypass **Cloudflare IUAM** and **Turnstile challenges**, returning valid `cf_clearance` cookies or tokens with proxy support.

## 🚀 Features

- **Cloudflare IUAM Bypass**: Automatically solves "I'm Under Attack Mode" challenges super fast within 3.337 seconds 💖
- **Turnstile Challenge Solver**: Handles Cloudflare Turnstile captchas
- **Proxy Support**: Full HTTP proxy integration with authentication
- **Smart Timeout**: 20-second timeout with graceful null responses
- **Browser Management**: Concurrent browser limit control
- **Caching System**: 5-minute TTL cache for IUAM responses
- **Production Ready**: Built with Express.js and error handling

## 📦 Installation

### VPS Installation (Ubuntu/Debian)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Chrome
sudo apt install -y google-chrome-stable

# Install Xvfb for headless display
sudo apt install -y xvfb

# Clone and setup
git clone https://github.com/tanjiro517/cf-bypass-fast
cd cf-bypass
npm install

# Start Xvfb (virtual display)
Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &
export DISPLAY=:99

# Run with PM2 (recommended)
npm install -g pm2
pm2 start index.js --name "cf-bypass"
pm2 startup
pm2 save

# Or run directly
npm start
```

### Local Development
```bash
npm install
npm run dev  # Development mode
npm start    # Production mode
```

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server port |
| `authToken` | `null` | API authentication token |
| `browserLimit` | `20` | Max concurrent browsers |
| `timeOut` | `60000` | Global timeout (ms) |

## 📡 API Endpoints

### POST /cloudflare

Bypass Cloudflare protection and get cookies/tokens.

#### Request Body
```json
{
  "mode": "iuam",
  "domain": "https://olamovies.watch/generate",
}
```

#### Parameters
- **`mode`** (required): `"iuam"` or `"turnstile"`
- **`domain`** (required): Target website URL
- **`proxy`** (optional): Proxy configuration object

#### Response (Success)
```json
{
  "cf_clearance": "eNm9UOgqoNDTP.fmAK9JfvirEmLVpmd.ZWIfdqQxuTc-1758610092-1.2-2NwZwW6nK23HrAH71MtvOek9vCiiS7pUBGIPtra_gSBxYxY2csa6hW0j7i...",
  "user_agent": "Mozilla/5.0...",
  "elapsed_time": 3.05
}
```

#### Response (No Cookie Found)
```json
{
  "cf_clearance": null,
  "user_agent": "Mozilla/5.0...",
  "elapsed_time": 0.0
}
```

#### Response (Turnstile)
```json
{
  "token": "0.xsFjuaQe-ahOJOCPBca6_gO_PYmF6LRrkxMX7s9XY6hdkCydEQocV3IlhGNgxa-X9KGS1lPoWScPSAPsUieuG-gyAazbguBUogGpqX9Ft..."
}
```

## 🌐 Proxy Configuration

The service supports HTTP proxies with authentication:

**Proxy Format**: `username:password@hostname:port`

## 📝 Usage Examples

### run test
```bash
python api_test.py
```

## ⚡ Key Features

### Caching System
- **5-minute TTL** for IUAM responses
- Reduces server load and response time
- Cache key based on request parameters

### Browser Management
- Configurable concurrent browser limit
- Resource optimization (blocks images, CSS, fonts)

## 🛠 Development

### Project Structure
```
cf-bypass/
├── endpoints/
│   ├── cloudflare.js    # IUAM bypass logic
│   └── turnstile.js     # Turnstile solver
├── cache/
│   └── cache.json       # Response cache
├── index.js             # Main server
├── api_test.py          # Test script
└── package.json
```

[credit](https://github.com/ZFC-Digital/cf-clearance-scraper)
educational / research — use responsibly and lawfully.

my telegram: https://t.me/rex_update
---
Made with ❤️ for bypass community
