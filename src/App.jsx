import { useState, useEffect, useRef, useCallback } from "react";

const COUNTRIES = {
  US: { name: "United States", cx: 200, cy: 160, market: "NYSE/NASDAQ", newsQuery: "United States financial economy news", marketQuery: "US stock market NYSE NASDAQ today" },
  GB: { name: "United Kingdom", cx: 430, cy: 120, market: "LSE", newsQuery: "United Kingdom financial economy news", marketQuery: "UK London Stock Exchange market today" },
  DE: { name: "Germany", cx: 465, cy: 125, market: "XETRA", newsQuery: "Germany financial economy news", marketQuery: "Germany DAX stock market today" },
  FR: { name: "France", cx: 450, cy: 135, market: "Euronext", newsQuery: "France financial economy news", marketQuery: "France CAC 40 stock market today" },
  JP: { name: "Japan", cx: 760, cy: 148, market: "TSE", newsQuery: "Japan financial economy news", marketQuery: "Japan Nikkei Tokyo Stock Exchange today" },
  CN: { name: "China", cx: 710, cy: 155, market: "SSE/SZSE", newsQuery: "China financial economy news", marketQuery: "China Shanghai Shenzhen stock market today" },
  IN: { name: "India", cx: 640, cy: 190, market: "BSE/NSE", newsQuery: "India financial economy news", marketQuery: "India BSE NSE Sensex Nifty stock market today" },
  BR: { name: "Brazil", cx: 270, cy: 265, market: "B3", newsQuery: "Brazil financial economy news", marketQuery: "Brazil B3 Bovespa stock market today" },
  CA: { name: "Canada", cx: 190, cy: 120, market: "TSX", newsQuery: "Canada financial economy news", marketQuery: "Canada TSX stock market today" },
  AU: { name: "Australia", cx: 730, cy: 295, market: "ASX", newsQuery: "Australia financial economy news", marketQuery: "Australia ASX stock market today" },
  RU: { name: "Russia", cx: 580, cy: 110, market: "MOEX", newsQuery: "Russia financial economy news", marketQuery: "Russia MOEX stock market today" },
  KR: { name: "South Korea", cx: 745, cy: 155, market: "KRX", newsQuery: "South Korea financial economy news", marketQuery: "South Korea KOSPI KRX stock market today" },
  MX: { name: "Mexico", cx: 185, cy: 185, market: "BMV", newsQuery: "Mexico financial economy news", marketQuery: "Mexico BMV stock market today" },
  ZA: { name: "South Africa", cx: 500, cy: 285, market: "JSE", newsQuery: "South Africa financial economy news", marketQuery: "South Africa JSE stock market today" },
  SA: { name: "Saudi Arabia", cx: 565, cy: 190, market: "Tadawul", newsQuery: "Saudi Arabia financial economy news", marketQuery: "Saudi Arabia Tadawul stock market today" },
  SG: { name: "Singapore", cx: 700, cy: 225, market: "SGX", newsQuery: "Singapore financial economy news", marketQuery: "Singapore SGX stock market today" },
  CH: { name: "Switzerland", cx: 462, cy: 130, market: "SIX", newsQuery: "Switzerland financial economy news", marketQuery: "Switzerland SIX stock exchange today" },
  NG: { name: "Nigeria", cx: 465, cy: 225, market: "NGX", newsQuery: "Nigeria financial economy news", marketQuery: "Nigeria NGX stock market today" },
  AR: { name: "Argentina", cx: 255, cy: 300, market: "BCBA", newsQuery: "Argentina financial economy news", marketQuery: "Argentina BCBA stock market today" },
  TH: { name: "Thailand", cx: 695, cy: 200, market: "SET", newsQuery: "Thailand financial economy news", marketQuery: "Thailand SET stock market today" },
};

const GLOBE_W = 820;
const GLOBE_H = 420;

// SVG world map paths (simplified continents)
const MAP_PATHS = {
  northAmerica: "M 100,80 L 130,70 L 170,65 L 220,70 L 260,75 L 280,90 L 290,110 L 270,130 L 250,150 L 230,175 L 210,195 L 195,210 L 180,220 L 165,215 L 150,200 L 140,180 L 130,160 L 110,140 L 95,120 Z",
  southAmerica: "M 210,215 L 240,210 L 270,215 L 295,230 L 305,255 L 300,280 L 285,305 L 265,320 L 245,315 L 230,300 L 220,275 L 215,250 Z",
  europe: "M 415,95 L 445,88 L 480,90 L 500,100 L 505,115 L 495,130 L 475,140 L 455,145 L 430,140 L 415,128 L 410,112 Z",
  africa: "M 440,155 L 470,148 L 505,152 L 525,168 L 530,195 L 525,225 L 510,255 L 490,275 L 468,280 L 448,270 L 433,245 L 428,215 L 430,185 L 438,168 Z",
  asia: "M 510,85 L 580,75 L 650,78 L 720,85 L 775,100 L 790,125 L 775,150 L 740,165 L 700,170 L 660,165 L 620,170 L 590,185 L 565,195 L 545,185 L 525,170 L 512,155 L 505,130 L 508,108 Z",
  oceania: "M 700,265 L 740,258 L 775,265 L 790,285 L 785,305 L 765,315 L 735,312 L 710,300 L 700,282 Z",
  greenland: "M 270,55 L 295,50 L 310,60 L 305,78 L 285,82 L 268,72 Z",
};

function WorldMap({ onCountrySelect, selectedCountry }) {
  const svgRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [hovered, setHovered] = useState(null);
  const animRef = useRef(null);
  const lastX = useRef(null);
  const velocity = useRef(0);

  useEffect(() => {
    let running = true;
    const animate = () => {
      if (!isDragging) {
        velocity.current *= 0.97;
        if (Math.abs(velocity.current) < 0.01) velocity.current = 0.05;
        setRotation(r => (r + velocity.current) % 360);
      }
      if (running) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, [isDragging]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart(e.clientX);
    lastX.current = e.clientX;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastX.current;
    velocity.current = dx * 0.4;
    setRotation(r => (r + dx * 0.3) % 360);
    lastX.current = e.clientX;
  };

  const handleMouseUp = () => { setIsDragging(false); };

  const getTranslatedX = (cx) => {
    const offset = (rotation % 360) * (GLOBE_W / 360);
    return ((cx - offset + GLOBE_W * 2) % GLOBE_W);
  };

  const visibleCountries = Object.entries(COUNTRIES).map(([code, c]) => ({
    code, ...c, tx: getTranslatedX(c.cx)
  })).filter(c => c.tx > 30 && c.tx < GLOBE_W - 30);

  return (
    <div
      style={{ position: "relative", width: "100%", height: GLOBE_H, cursor: isDragging ? "grabbing" : "grab", userSelect: "none" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg
        ref={svgRef}
        width="100%" height={GLOBE_H}
        viewBox={`0 0 ${GLOBE_W} ${GLOBE_H}`}
        style={{ display: "block" }}
      >
        <defs>
          <radialGradient id="globeGrad" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#1a3a5c" />
            <stop offset="60%" stopColor="#0d1f35" />
            <stop offset="100%" stopColor="#060e1a" />
          </radialGradient>
          <radialGradient id="glowGrad" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
          </radialGradient>
          <clipPath id="mapClip">
            <rect x="0" y="0" width={GLOBE_W} height={GLOBE_H} rx="12" />
          </clipPath>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse" patternTransform={`translate(${-(rotation % 40 * GLOBE_W/360) % 40},0)`}>
            <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#1a3a5c" strokeWidth="0.4" opacity="0.5" />
          </pattern>
        </defs>

        {/* Background */}
        <rect x="0" y="0" width={GLOBE_W} height={GLOBE_H} fill="url(#globeGrad)" rx="12" />
        <rect x="0" y="0" width={GLOBE_W} height={GLOBE_H} fill="url(#grid)" rx="12" />

        {/* Latitude lines */}
        {[80, 140, 200, 260, 320, 380].map(y => (
          <line key={y} x1="0" y1={y} x2={GLOBE_W} y2={y} stroke="#1e4a6e" strokeWidth="0.5" opacity="0.4" />
        ))}

        <g clipPath="url(#mapClip)">
          {/* Continents - scrolling with rotation */}
          {Object.entries(MAP_PATHS).map(([name, path]) => {
            const offset = (rotation % 360) * (GLOBE_W / 360);
            return (
              <g key={name} transform={`translate(${-offset}, 0)`}>
                <path d={path} fill="#0f3460" stroke="#1a5a8a" strokeWidth="0.8" opacity="0.9" />
                <path d={path} fill="none" stroke="#00d4ff" strokeWidth="0.3" opacity="0.4" />
                {/* duplicate for wrap */}
                <path d={path} transform={`translate(${GLOBE_W}, 0)`} fill="#0f3460" stroke="#1a5a8a" strokeWidth="0.8" opacity="0.9" />
                <path d={path} transform={`translate(${GLOBE_W}, 0)`} fill="none" stroke="#00d4ff" strokeWidth="0.3" opacity="0.4" />
                <path d={path} transform={`translate(${-GLOBE_W}, 0)`} fill="#0f3460" stroke="#1a5a8a" strokeWidth="0.8" opacity="0.9" />
                <path d={path} transform={`translate(${-GLOBE_W}, 0)`} fill="none" stroke="#00d4ff" strokeWidth="0.3" opacity="0.4" />
              </g>
            );
          })}

          {/* Country dots */}
          {visibleCountries.map(c => {
< truncated lines 153-287 >
            <div style={{ fontSize: 9, color: "#2a5a7a", marginTop: 6, fontFamily: "monospace" }}>— {a.source}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [mode, setMode] = useState(null); // 'news' | 'market'
  const [panelKey, setPanelKey] = useState(0);

  const handleCountrySelect = (code) => {
    setSelectedCountry(code);
    setMode(null);
  };

  const handleMode = (m) => {
    setMode(m);
    setPanelKey(k => k + 1);
  };

  const country = selectedCountry ? COUNTRIES[selectedCountry] : null;

  const query = mode === "news"
    ? country?.newsQuery
    : mode === "market"
      ? country?.marketQuery
      : null;

  const panelTitle = mode === "news"
    ? `${country?.name?.toUpperCase()} · FINANCIAL NEWS`
    : mode === "market"
      ? `${country?.name?.toUpperCase()} · ${country?.market} MARKET`
      : null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060e1a",
      fontFamily: "'Courier New', monospace",
      color: "#c8e4f8",
      display: "flex",
      flexDirection: "column"
    }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#060e1a} ::-webkit-scrollbar-thumb{background:#1a3a5c;border-radius:2px}
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "16px 28px",
        borderBottom: "1px solid #1a3a5c",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(90deg, #060e1a, #0a1828)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #00d4ff, #0066cc)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🌐</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: "bold", letterSpacing: 4, color: "#00d4ff" }}>GLOBAL MARKETS</div>
            <div style={{ fontSize: 9, color: "#2a6a9a", letterSpacing: 2 }}>FINANCIAL INTELLIGENCE TERMINAL</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <div style={{ fontSize: 10, color: "#2a6a9a" }}>
            <span style={{ color: "#00e676" }}>■</span> LIVE DATA
          </div>
          <div style={{ fontSize: 10, color: "#4a8aaa", letterSpacing: 1 }}>
            {new Date().toLocaleString("en-US", { timeZone: "UTC", hour12: false }).replace(",", " ·")} UTC
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 340px", gridTemplateRows: "auto 1fr", gap: 0, minHeight: 0 }}>

        {/* Map section */}
        <div style={{ padding: "20px 20px 0 20px", borderBottom: "1px solid #1a3a5c" }}>
          <div style={{ border: "1px solid #1a3a5c", borderRadius: 14, overflow: "hidden", background: "#060e1a", boxShadow: "0 0 40px rgba(0,212,255,0.05)" }}>
            <WorldMap onCountrySelect={handleCountrySelect} selectedCountry={selectedCountry} />
          </div>

          {/* Country selector panel */}
          <div style={{ padding: "16px 0 20px", minHeight: 90 }}>
            {!selectedCountry && (
              <div style={{ color: "#1e5a7a", fontSize: 11, letterSpacing: 2, textAlign: "center", paddingTop: 18 }}>
                SELECT A COUNTRY ON THE MAP TO BEGIN
              </div>
            )}
            {selectedCountry && (
              <div style={{ display: "flex", alignItems: "center", gap: 16, animation: "fadeIn 0.3s ease" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: "bold", color: "#00d4ff", letterSpacing: 3 }}>{country.name.toUpperCase()}</div>
                  <div style={{ fontSize: 10, color: "#4a8aaa", marginTop: 3 }}>Exchange: {country.market}</div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  {["news", "market"].map(m => (
                    <button key={m} onClick={() => handleMode(m)} style={{
                      padding: "10px 24px",
                      background: mode === m ? "linear-gradient(135deg, #00d4ff, #0066cc)" : "transparent",
                      border: mode === m ? "1px solid #00d4ff" : "1px solid #1a3a5c",
                      borderRadius: 8,
                      color: mode === m ? "#060e1a" : "#4a8aaa",
                      fontFamily: "'Courier New', monospace",
                      fontSize: 11,
                      fontWeight: "bold",
                      letterSpacing: 2,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      textTransform: "uppercase"
                    }}
                      onMouseEnter={e => { if (mode !== m) { e.target.style.borderColor = "#00d4ff"; e.target.style.color = "#00d4ff"; } }}
                      onMouseLeave={e => { if (mode !== m) { e.target.style.borderColor = "#1a3a5c"; e.target.style.color = "#4a8aaa"; } }}
                    >
                      {m === "news" ? "📰 NEWS" : "📈 MARKET"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global news sidebar */}
        <div style={{ borderLeft: "1px solid #1a3a5c", borderBottom: "1px solid #1a3a5c", gridRow: "1 / 3", overflowY: "hidden", display: "flex", flexDirection: "column" }}>
          <NewsPanel title="WORLDWIDE FINANCE" query="worldwide global financial markets economy news today" icon="🌍" />
        </div>

        {/* Country detail panel */}
        <div style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {!mode && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#1a3a5c", fontSize: 11, letterSpacing: 2 }}>
              {selectedCountry ? "CHOOSE NEWS OR MARKET ABOVE" : "SELECT A COUNTRY TO EXPLORE"}
            </div>
          )}
          {mode && query && (
            <div key={panelKey} style={{ height: "100%", animation: "fadeIn 0.4s ease" }}>
              <NewsPanel title={panelTitle} query={query} icon={mode === "news" ? "📰" : "📈"} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
       }
