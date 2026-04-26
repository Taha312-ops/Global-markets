# 🌐 Global Markets Terminal

A real-time financial intelligence web app with an interactive rotating world map. Explore stock markets and financial news from 20 major countries around the world.

---

## ✨ Features

- **Rotatable World Map** — Drag to spin the map, click glowing country dots to select
- **📰 Financial News** — Live AI-powered news for any selected country with sentiment indicators
- **📈 Market Data** — Real-time stock exchange data for each country's market
- **🌍 Global News Sidebar** — Worldwide financial headlines loaded automatically on startup
- **Dark Theme** — Sleek terminal-style UI with cyan accents

## 🗺 Supported Countries

USA, UK, Germany, France, Japan, China, India, Brazil, Canada, Australia, Russia, South Korea, Mexico, South Africa, Saudi Arabia, Singapore, Switzerland, Nigeria, Argentina, Thailand

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 |
| Build Tool | Vite 5 |
| Styling | Inline CSS + SVG Animations |
| AI & Data | Anthropic Claude API + Web Search |
| Deployment | Vercel |

---

## 📁 Project Structure

```
global-markets/
├── index.html          ← App entry point
├── package.json        ← Dependencies
├── vite.config.js      ← Build configuration
├── vercel.json         ← Vercel deployment config
├── README.md           ← You are here
└── src/
    ├── main.jsx        ← React root
    └── App.jsx         ← Main app (~500 lines)
```

---

## 🚀 Deployment

This project is deployed on **Vercel**. Any push to the `main` branch triggers an automatic redeployment.

### Local Development

```bash
npm install
npm run dev
```

### Build for Production

```bash
npm run build
```

---

## 📊 How It Works

1. Open the app — the world map auto-rotates
2. Drag the map left/right to explore
3. Click any glowing dot to select a country
4. Choose **News** or **Market**
5. Claude AI searches the web in real-time and displays results

---

## 📄 License

MIT — free to use and modify.
