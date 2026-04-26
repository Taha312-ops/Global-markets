import { useState, useEffect, useRef } from "react";

const COUNTRIES = {
  US: { name: "United States", capital: "Washington D.C.", tz: "America/New_York", lat: 38, lon: -97, market: "NYSE/NASDAQ", newsQuery: "United States financial economy news today", marketQuery: "US stock market NYSE NASDAQ S&P500 today live" },
  GB: { name: "United Kingdom", capital: "London", tz: "Europe/London", lat: 55, lon: -3, market: "LSE", newsQuery: "United Kingdom financial economy news today", marketQuery: "UK FTSE 100 London Stock Exchange live today" },
  DE: { name: "Germany", capital: "Berlin", tz: "Europe/Berlin", lat: 51, lon: 10, market: "XETRA/DAX", newsQuery: "Germany financial economy news today", marketQuery: "Germany DAX XETRA stock market live today" },
  FR: { name: "France", capital: "Paris", tz: "Europe/Paris", lat: 46, lon: 2, market: "Euronext/CAC40", newsQuery: "France financial economy news today", marketQuery: "France CAC 40 Euronext stock market live today" },
  JP: { name: "Japan", capital: "Tokyo", tz: "Asia/Tokyo", lat: 36, lon: 138, market: "TSE/Nikkei", newsQuery: "Japan financial economy news today", marketQuery: "Japan Nikkei 225 Tokyo Stock Exchange live today" },
  CN: { name: "China", capital: "Beijing", tz: "Asia/Shanghai", lat: 35, lon: 105, market: "SSE/SZSE", newsQuery: "China financial economy news today", marketQuery: "China Shanghai Composite CSI 300 stock market live today" },
  IN: { name: "India", capital: "New Delhi", tz: "Asia/Kolkata", lat: 20, lon: 77, market: "BSE/NSE", newsQuery: "India financial economy news today", marketQuery: "India Sensex Nifty 50 BSE NSE live today" },
  BR: { name: "Brazil", capital: "Brasília", tz: "America/Sao_Paulo", lat: -10, lon: -55, market: "B3/Bovespa", newsQuery: "Brazil financial economy news today", marketQuery: "Brazil B3 Bovespa Ibovespa stock market live today" },
  CA: { name: "Canada", capital: "Ottawa", tz: "America/Toronto", lat: 56, lon: -96, market: "TSX", newsQuery: "Canada financial economy news today", marketQuery: "Canada TSX S&P TSX Composite live today" },
  AU: { name: "Australia", capital: "Canberra", tz: "Australia/Sydney", lat: -25, lon: 133, market: "ASX", newsQuery: "Australia financial economy news today", marketQuery: "Australia ASX 200 stock market live today" },
  RU: { name: "Russia", capital: "Moscow", tz: "Europe/Moscow", lat: 60, lon: 90, market: "MOEX", newsQuery: "Russia financial economy news today", marketQuery: "Russia MOEX Moscow Exchange stock market live today" },
  KR: { name: "South Korea", capital: "Seoul", tz: "Asia/Seoul", lat: 36, lon: 128, market: "KRX/KOSPI", newsQuery: "South Korea financial economy news today", marketQuery: "South Korea KOSPI KRX stock market live today" },
  MX: { name: "Mexico", capital: "Mexico City", tz: "America/Mexico_City", lat: 23, lon: -102, market: "BMV/IPC", newsQuery: "Mexico financial economy news today", marketQuery: "Mexico BMV IPC stock market live today" },
  ZA: { name: "South Africa", capital: "Pretoria", tz: "Africa/Johannesburg", lat: -29, lon: 25, market: "JSE", newsQuery: "South Africa financial economy news today", marketQuery: "South Africa JSE All Share Index live today" },
  SA: { name: "Saudi Arabia", capital: "Riyadh", tz: "Asia/Riyadh", lat: 24, lon: 45, market: "Tadawul", newsQuery: "Saudi Arabia financial economy news today", marketQuery: "Saudi Arabia Tadawul TASI stock market live today" },
  SG: { name: "Singapore", capital: "Singapore", tz: "Asia/Singapore", lat: 1, lon: 104, market: "SGX/STI", newsQuery: "Singapore financial economy news today", marketQuery: "Singapore SGX Straits Times Index live today" },
  CH: { name: "Switzerland", capital: "Bern", tz: "Europe/Zurich", lat: 47, lon: 8, market: "SIX/SMI", newsQuery: "Switzerland financial economy news today", marketQuery: "Switzerland SIX SMI Swiss Market Index live today" },
  NG: { name: "Nigeria", capital: "Abuja", tz: "Africa/Lagos", lat: 9, lon: 8, market: "NGX", newsQuery: "Nigeria financial economy news today", marketQuery: "Nigeria NGX stock exchange live today" },
  AR: { name: "Argentina", capital: "Buenos Aires", tz: "America/Argentina/Buenos_Aires", lat: -34, lon: -64, market: "BCBA/Merval", newsQuery: "Argentina financial economy news today", marketQuery: "Argentina Merval BCBA stock market live today" },
  AE: { name: "UAE", capital: "Abu Dhabi", tz: "Asia/Dubai", lat: 24, lon: 54, market: "DFM/ADX", newsQuery: "UAE financial economy news today", marketQuery: "UAE Dubai Financial Market DFM ADX live today" },
};

// Persian orange palette
const ORANGE = "#D2691E";
const ORANGE_LIGHT = "#E8874A";
const ORANGE_DARK = "#8B4513";
const ORANGE_GLOW = "rgba(210,105,30,0.4)";

function useCapitalTime(tz) {
  const [time, setTime] = useState("");
  useEffect(() => {
    if (!tz) return;
    const update = () => {
      setTime(new Date().toLocaleTimeString("en-US", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [tz]);
  return time;
}

function Globe({ onCountrySelect, selectedCountry }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ rotY: 0, isDragging: false, lastX: 0, velX: 0, autoRotate: true, idleTimer: null });
  const [hovered, setHovered] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, name: "" });
  const hoveredRef = useRef(null);
  const selectedRef = useRef(selectedCountry);
  const animRef = useRef(null);
  const burstRef = useRef([]); // particle bursts

  useEffect(() => { selectedRef.current = selectedCountry; }, [selectedCountry]);
  useEffect(() => { hoveredRef.current = hovered; }, [hovered]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const s = stateRef.current;
    let t = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      const W = parent.clientWidth || window.innerWidth * 0.75;
      const H = parent.clientHeight || window.innerHeight * 0.6;
      canvas.width = W * window.devicePixelRatio;
      canvas.height = H * window.devicePixelRatio;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      t += 0.016;
      const W = canvas.offsetWidth, H = canvas.offsetHeight;
      const cx = W / 2, cy = H / 2;
      const R = Math.min(W, H) * 0.47;
      ctx.clearRect(0, 0, W, H);

      // Outer glow
      const outerGlow = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.3);
      outerGlow.addColorStop(0, "rgba(210,105,30,0.18)");
      outerGlow.addColorStop(0.5, "rgba(210,105,30,0.06)");
      outerGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.3, 0, Math.PI * 2);
      ctx.fillStyle = outerGlow; ctx.fill();

      // Pulsing ring
      const pulse = 0.5 + 0.5 * Math.sin(t * 2);
      ctx.beginPath(); ctx.arc(cx, cy, R * (1.06 + pulse * 0.03), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(210,105,30,${0.15 + pulse * 0.1})`; ctx.lineWidth = 1.5; ctx.stroke();

      // Globe base - Persian orange
      const globeGrad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.05, cx + R * 0.1, cy + R * 0.1, R);
      globeGrad.addColorStop(0, "#E8874A");
      globeGrad.addColorStop(0.35, "#D2691E");
      globeGrad.addColorStop(0.75, "#A0522D");
      globeGrad.addColorStop(1, "#5C2A0E");
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = globeGrad; ctx.fill();

      // Grid lines (lat/lon)
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
      ctx.strokeStyle = "rgba(0,0,0,0.18)"; ctx.lineWidth = 0.6;
      for (let lat = -80; lat <= 80; lat += 20) {
        const y0 = cy - R * Math.sin((lat * Math.PI) / 180);
        const rLat = R * Math.cos((lat * Math.PI) / 180);
        ctx.beginPath(); ctx.ellipse(cx, y0, rLat, rLat * 0.18, 0, 0, Math.PI * 2); ctx.stroke();
      }
      for (let lon = 0; lon < 360; lon += 20) {
        const adj = ((lon - (s.rotY * 180) / Math.PI) % 360 + 360) % 360 - 180;
        if (Math.abs(adj) < 90) {
          const scl = Math.cos((adj * Math.PI) / 180);
          const x0 = cx + R * Math.sin((adj * Math.PI) / 180);
          ctx.beginPath(); ctx.ellipse(x0, cy, R * 0.06 * scl, R, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0,0,0,${0.15 * scl})`; ctx.stroke();
        }
      }

      // Continents (black blobs)
      const continents = [
        // North America
        [[38,-100],[60,-95],[70,-90],[75,-80],[65,-70],[55,-60],[45,-65],[30,-80],[25,-105],[30,-115],[40,-120],[50,-125],[55,-130]],
        // South America
        [[-5,-75],[-5,-35],[-20,-40],[-35,-55],[-55,-65],[-55,-70],[-40,-70],[-20,-70],[-10,-78]],
        // Europe
        [[35,10],[40,-5],[50,-5],[58,5],[65,25],[60,30],[50,30],[45,15],[40,20],[35,25]],
        // Africa
        [[35,10],[38,25],[30,32],[10,42],[0,42],[-10,38],[-30,30],[-35,20],[-30,15],[-10,15],[5,0],[15,-15],[25,-15],[35,0]],
        // Asia
        [[35,25],[40,45],[25,55],[10,45],[0,100],[10,105],[20,120],[35,135],[50,140],[60,130],[65,90],[60,60],[55,40],[45,35]],
        // Australia
        [[-15,130],[-15,140],[-25,155],[-40,145],[-38,140],[-35,120],[-25,115],[-20,120]],
        // Greenland
        [[60,-45],[70,-20],[80,-20],[80,-60],[70,-55]],
      ];

      continents.forEach(pts => {
        if (pts.length < 3) return;
        const projected = pts.map(([lat, lon]) => {
          const phi = (90 - lat) * (Math.PI / 180);
          const theta = (lon * Math.PI) / 180 + s.rotY;
          const x3 = Math.sin(phi) * Math.cos(theta);
          const z3 = Math.cos(phi);
          const y3 = Math.sin(phi) * Math.sin(theta);
          return { px: cx + R * x3, py: cy - R * z3, vis: y3 >= -0.1 };
        });
        const visCount = projected.filter(p => p.vis).length;
        if (visCount < pts.length * 0.4) return;
        ctx.beginPath();
        projected.forEach((p, i) => { i === 0 ? ctx.moveTo(p.px, p.py) : ctx.lineTo(p.px, p.py); });
        ctx.closePath();
        ctx.fillStyle = "rgba(0,0,0,0.72)";
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.9)"; ctx.lineWidth = 0.8; ctx.stroke();
      });

      // Country markers
      Object.entries(COUNTRIES).forEach(([code, c]) => {
        const phi = (90 - c.lat) * (Math.PI / 180);
        const theta = (c.lon * Math.PI) / 180 + s.rotY;
        const x3 = Math.sin(phi) * Math.cos(theta);
        const z3 = Math.cos(phi);
        const y3 = Math.sin(phi) * Math.sin(theta);
        if (y3 < 0) return;

        const px = cx + R * x3, py = cy - R * z3;
        const isSel = selectedRef.current === code;
        const isHov = hoveredRef.current === code;
        const sz = isSel ? 12 : isHov ? 10 : 7;

        if (isSel || isHov) {
          ctx.beginPath(); ctx.arc(px, py, sz * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${isSel ? 0.12 : 0.07})`; ctx.fill();
        }
        if (isSel) {
          ctx.beginPath(); ctx.arc(px, py, sz + 5 + Math.sin(t * 3) * 2, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 1.5; ctx.stroke();
        }

        const dg = ctx.createRadialGradient(px - sz * 0.3, py - sz * 0.3, 0, px, py, sz);
        dg.addColorStop(0, "#ffffff");
        dg.addColorStop(0.5, isSel ? "#ffe0c0" : "#ffcc99");
        dg.addColorStop(1, isSel ? "#ff8c00" : "#cc6600");
        ctx.beginPath(); ctx.arc(px, py, sz, 0, Math.PI * 2);
        ctx.fillStyle = dg; ctx.fill();
        ctx.strokeStyle = isSel ? "#fff" : "rgba(255,200,100,0.6)"; ctx.lineWidth = isSel ? 1.5 : 0.8; ctx.stroke();
      });

      ctx.restore();

      // Specular highlight
      const spec = ctx.createRadialGradient(cx - R * 0.38, cy - R * 0.38, 0, cx - R * 0.2, cy - R * 0.2, R * 0.55);
      spec.addColorStop(0, "rgba(255,220,180,0.22)");
      spec.addColorStop(0.5, "rgba(255,200,150,0.07)");
      spec.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = spec; ctx.fill();

      // Globe border
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(210,105,30,0.5)`; ctx.lineWidth = 2; ctx.stroke();

      // Burst particles
      burstRef.current = burstRef.current.filter(b => b.life > 0);
      burstRef.current.forEach(b => {
        b.particles.forEach(p => {
          p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= 0.03;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color},${p.life})`; ctx.fill();
        });
        b.life -= 0.03;
      });
    };

    const animate = () => {
      if (s.autoRotate && !s.isDragging) {
        s.velX *= 0.97;
        s.rotY += (Math.abs(s.velX) > 0.001 ? s.velX : 0.004);
      }
      draw();
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    const resetIdleTimer = () => {
      clearTimeout(s.idleTimer);
      s.autoRotate = false;
      s.idleTimer = setTimeout(() => { s.autoRotate = true; }, 10000);
    };

    const getHit = (mx, my) => {
      const W = canvas.offsetWidth, H = canvas.offsetHeight;
      const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.47;
      for (const [code, c] of Object.entries(COUNTRIES)) {
        const phi = (90 - c.lat) * (Math.PI / 180);
        const theta = (c.lon * Math.PI) / 180 + s.rotY;
        const x3 = Math.sin(phi) * Math.cos(theta);
        const z3 = Math.cos(phi);
        const y3 = Math.sin(phi) * Math.sin(theta);
        if (y3 < 0) continue;
        const px = cx + R * x3, py = cy - R * z3;
        if (Math.hypot(mx - px, my - py) < 22) return { code, px, py };
      }
      return null;
    };

    const onDown = (e) => {
      s.isDragging = true; resetIdleTimer();
      const rect = canvas.getBoundingClientRect();
      s.lastX = e.clientX - rect.left;
    };
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      if (s.isDragging) {
        const dx = mx - s.lastX;
        s.velX = dx * 0.01; s.rotY += dx * 0.007; s.lastX = mx;
        resetIdleTimer();
      }
      const hit = getHit(mx, my);
      const code = hit ? hit.code : null;
      setHovered(code);
      if (code) {
        setTooltip({ visible: true, x: mx, y: my - 22, name: COUNTRIES[code].name });
        canvas.style.cursor = "pointer";
      } else {
        setTooltip({ visible: false, x: 0, y: 0, name: "" });
        canvas.style.cursor = "grab";
      }
    };
    const onUp = () => { s.isDragging = false; };
    const onClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const hit = getHit(e.clientX - rect.left, e.clientY - rect.top);
      if (hit) { onCountrySelect(hit.code); resetIdleTimer(); }
    };

    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    canvas.addEventListener("click", onClick);

    // Touch
    canvas.addEventListener("touchstart", e => {
      s.isDragging = true; resetIdleTimer();
      const rect = canvas.getBoundingClientRect();
      s.lastX = e.touches[0].clientX - rect.left;
    }, { passive: true });
    canvas.addEventListener("touchmove", e => {
      const rect = canvas.getBoundingClientRect();
      const dx = e.touches[0].clientX - rect.left - s.lastX;
      s.rotY += dx * 0.007; s.lastX = e.touches[0].clientX - rect.left;
      resetIdleTimer();
    }, { passive: true });
    canvas.addEventListener("touchend", () => { s.isDragging = false; });

    return () => {
      cancelAnimationFrame(animRef.current);
      clearTimeout(s.idleTimer);
      canvas.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("click", onClick);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 0 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block", minHeight: 0 }} />
      {tooltip.visible && (
        <div style={{
          position: "absolute", left: tooltip.x, top: tooltip.y,
          background: "rgba(20,10,0,0.92)", border: `1px solid ${ORANGE}`,
          color: ORANGE_LIGHT, padding: "4px 12px", borderRadius: 6,
          fontSize: 11, fontFamily: "monospace", pointerEvents: "none",
          transform: "translateX(-50%)", whiteSpace: "nowrap",
          boxShadow: `0 0 12px ${ORANGE_GLOW}`
        }}>{tooltip.name}</div>
      )}
    </div>
  );
}

function BubbleButton({ label, icon, onClick, color = ORANGE }) {
  const [bursting, setBursting] = useState(false);
  const [visible, setVisible] = useState(true);

  const handleClick = () => {
    setBursting(true);
    setTimeout(() => { setVisible(false); onClick(); }, 500);
  };

  if (!visible) return null;

  return (
    <button onClick={handleClick} style={{
      position: "relative", overflow: "visible",
      width: 90, height: 90, borderRadius: "50%",
      background: bursting
        ? "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(210,105,30,0.1) 70%, transparent 100%)"
        : `radial-gradient(circle at 35% 35%, ${ORANGE_LIGHT}, ${ORANGE}, ${ORANGE_DARK})`,
      border: `2px solid ${bursting ? "transparent" : "rgba(255,200,100,0.6)"}`,
      color: bursting ? "transparent" : "#fff",
      fontFamily: "monospace", fontSize: 10, fontWeight: "bold",
      letterSpacing: 1, cursor: "pointer",
      boxShadow: bursting
        ? `0 0 60px 20px rgba(255,180,50,0.5)`
        : `0 0 20px ${ORANGE_GLOW}, inset 0 2px 4px rgba(255,255,255,0.25)`,
      transform: bursting ? "scale(1.4)" : "scale(1)",
      transition: "all 0.35s cubic-bezier(0.36, 0.07, 0.19, 0.97)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
    }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span>{label}</span>
      {bursting && (
        <>
          {[...Array(10)].map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              width: 8, height: 8, borderRadius: "50%",
              background: i % 2 === 0 ? ORANGE_LIGHT : "#fff",
              top: "50%", left: "50%",
              animation: `burst-${i} 0.5s ease-out forwards`,
              transform: `rotate(${i * 36}deg) translateY(-${30 + Math.random() * 30}px)`,
              opacity: 0,
              pointerEvents: "none",
            }} />
          ))}
        </>
      )}
    </button>
  );
}

function CountryOverlay({ country, code, onSelect, onClose }) {
  const time = useCapitalTime(country.tz);
  const [show, setShow] = useState(false);
  const [burstDone, setBurstDone] = useState({ news: false, market: false });

  useEffect(() => { setTimeout(() => setShow(true), 50); }, []);

  if (burstDone.news || burstDone.market) return null;

  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: "rgba(5,2,0,0.6)", backdropFilter: "blur(2px)",
      opacity: show ? 1 : 0, transition: "opacity 0.3s", zIndex: 10,
    }}>
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <div style={{ fontSize: 22, fontWeight: "bold", color: ORANGE_LIGHT, letterSpacing: 4, fontFamily: "monospace" }}>
          {country.name.toUpperCase()}
        </div>
        <div style={{ fontSize: 12, color: "rgba(210,105,30,0.7)", marginTop: 4, fontFamily: "monospace" }}>
          🏛 {country.capital}
        </div>
        <div style={{ fontSize: 28, color: "#fff", marginTop: 10, fontFamily: "monospace", fontWeight: "bold", letterSpacing: 3 }}>
          {time}
        </div>
        <div style={{ fontSize: 10, color: "rgba(210,105,30,0.5)", fontFamily: "monospace", marginTop: 2 }}>
          LOCAL TIME · {country.market}
        </div>
      </div>

      <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <BubbleButton label="NEWS" icon="📰" onClick={() => { setBurstDone(b => ({ ...b, news: true })); setTimeout(() => onSelect("news"), 300); }} />
          <div style={{ color: "rgba(210,105,30,0.6)", fontSize: 9, fontFamily: "monospace", marginTop: 6 }}>FINANCIAL NEWS</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <BubbleButton label="MARKET" icon="📈" onClick={() => { setBurstDone(b => ({ ...b, market: true })); setTimeout(() => onSelect("market"), 300); }} />
          <div style={{ color: "rgba(210,105,30,0.6)", fontSize: 9, fontFamily: "monospace", marginTop: 6 }}>STOCK MARKET</div>
        </div>
      </div>

      <button onClick={onClose} style={{ marginTop: 30, background: "transparent", border: `1px solid rgba(210,105,30,0.3)`, color: "rgba(210,105,30,0.5)", padding: "6px 18px", borderRadius: 20, fontFamily: "monospace", fontSize: 10, cursor: "pointer", letterSpacing: 2 }}>
        ✕ CLOSE
      </button>
    </div>
  );
}

function NewsPanel({ title, query, icon, onBack, country }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const time = useCapitalTime(country?.tz);

  useEffect(() => {
    if (!query) return;
    setLoading(true); setError(null); setArticles([]);
    fetch("/api/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: `Search the web RIGHT NOW for the very latest ${query}. Find real current articles from today or this week. Return ONLY a raw JSON array (absolutely no markdown, no backticks, no preamble) of exactly 6 articles each with: title (string), summary (2 sentences with real facts/numbers), source (publication name), url (string), sentiment (positive/negative/neutral), time (how long ago like "2 hours ago").` }]
      })
    })
      .then(r => r.json())
      .then(data => {
        const text = data.content.filter(b => b.type === "text").map(b => b.text).join("");
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean.slice(clean.indexOf("["), clean.lastIndexOf("]") + 1));
        setArticles(parsed); setLoading(false);
      })
      .catch(() => { setError("Could not load live data. Check API key."); setLoading(false); });
  }, [query]);

  const sColor = s => s === "positive" ? "#4ade80" : s === "negative" ? "#f87171" : "#94a3b8";
  const sIcon = s => s === "positive" ? "▲" : s === "negative" ? "▼" : "●";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #1a2535 0%, #151e2d 100%)" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(100,140,200,0.2)", display: "flex", alignItems: "center", gap: 10, background: "rgba(26,45,75,0.5)" }}>
        {onBack && (
          <button onClick={onBack} style={{ background: "transparent", border: "none", color: ORANGE_LIGHT, cursor: "pointer", fontFamily: "monospace", fontSize: 16, padding: "0 6px" }}>←</button>
        )}
        <span style={{ fontSize: 14 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontFamily: "monospace", color: "#7eb8f7", fontWeight: "bold", letterSpacing: 1 }}>{title}</div>
          {country && time && (
            <div style={{ fontSize: 9, color: "rgba(126,184,247,0.5)", fontFamily: "monospace", marginTop: 1 }}>
              🕐 {country.capital}: {time}
            </div>
          )}
        </div>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: loading ? "#f59e0b" : "#4ade80", boxShadow: `0 0 6px ${loading ? "#f59e0b" : "#4ade80"}` }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
        {loading && [...Array(5)].map((_, i) => (
          <div key={i} style={{ background: "rgba(30,50,80,0.5)", borderRadius: 8, padding: 12, marginBottom: 10, animation: "pulse 1.5s infinite" }}>
            <div style={{ height: 10, background: "rgba(100,140,200,0.2)", borderRadius: 4, marginBottom: 8, width: `${60 + i * 8}%` }} />
            <div style={{ height: 8, background: "rgba(100,140,200,0.15)", borderRadius: 4, width: "55%" }} />
          </div>
        ))}
        {error && <div style={{ color: "#f87171", fontSize: 11, fontFamily: "monospace", padding: 10 }}>{error}</div>}
        {articles.map((a, i) => (
          <div key={i} style={{
            background: "linear-gradient(135deg, rgba(30,50,80,0.7), rgba(20,35,60,0.8))",
            border: "1px solid rgba(80,120,180,0.2)",
            borderLeft: `3px solid ${sColor(a.sentiment)}`,
            borderRadius: 8, padding: "11px 13px", marginBottom: 9,
            transition: "all 0.2s", cursor: a.url ? "pointer" : "default"
          }}
            onClick={() => a.url && window.open(a.url, "_blank")}
            onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(40,65,100,0.8), rgba(30,50,80,0.9))"; e.currentTarget.style.transform = "translateX(3px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(30,50,80,0.7), rgba(20,35,60,0.8))"; e.currentTarget.style.transform = ""; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "#93c5fd", fontWeight: "bold", lineHeight: 1.4, flex: 1 }}>{a.title}</div>
              <span style={{ color: sColor(a.sentiment), fontSize: 12, marginLeft: 8, flexShrink: 0 }}>{sIcon(a.sentiment)}</span>
            </div>
            <div style={{ fontSize: 10, color: "#8ba8cc", lineHeight: 1.55, fontFamily: "Georgia, serif" }}>{a.summary}</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7 }}>
              <span style={{ fontSize: 9, color: "rgba(100,140,200,0.5)", fontFamily: "monospace" }}>— {a.source}</span>
              <span style={{ fontSize: 9, color: "rgba(100,140,200,0.4)", fontFamily: "monospace" }}>{a.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [mode, setMode] = useState(null);
  const [panelKey, setPanelKey] = useState(0);

  const country = selectedCountry ? COUNTRIES[selectedCountry] : null;

  const handleMode = (m) => { setMode(m); setPanelKey(k => k + 1); };
  const handleBack = () => { setMode(null); };
  const handleClose = () => { setSelectedCountry(null); setMode(null); };

  const query = mode === "news" ? country?.newsQuery : mode === "market" ? country?.marketQuery : null;
  const panelTitle = mode === "news"
    ? `${country?.name?.toUpperCase()} · NEWS`
    : mode === "market" ? `${country?.name?.toUpperCase()} · ${country?.market}` : null;

  return (
    <div style={{ height: "100vh", background: "#060b14", fontFamily: "monospace", color: "#c8d8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes popIn{from{opacity:0;transform:scale(0.6)}to{opacity:1;transform:scale(1)}}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(210,105,30,0.3);border-radius:2px}
        *{box-sizing:border-box}
      `}</style>

      {/* Header */}
      <div style={{ padding: "11px 24px", borderBottom: `1px solid rgba(210,105,30,0.2)`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(90deg,#060b14,#0d1520)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,${ORANGE_LIGHT},${ORANGE_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: `0 0 12px ${ORANGE_GLOW}` }}>🌐</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: "bold", letterSpacing: 4, color: ORANGE_LIGHT }}>GLOBAL MARKETS</div>
            <div style={{ fontSize: 8, color: "rgba(210,105,30,0.45)", letterSpacing: 3 }}>FINANCIAL INTELLIGENCE TERMINAL</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <div style={{ fontSize: 10, color: "rgba(210,105,30,0.4)" }}><span style={{ color: "#4ade80" }}>■</span> LIVE</div>
          <div style={{ fontSize: 10, color: "rgba(210,105,30,0.35)" }}>{new Date().toUTCString().slice(0, 25)} UTC</div>
        </div>
      </div>

      {/* Main - 2 cols: (globe+detail) | news sidebar */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 320px", gridTemplateRows: "65vh 1fr", minHeight: 0 }}>

        {/* Globe - top left, half screen height */}
        <div style={{ position: "relative", gridColumn: "1/2", gridRow: "1/2", borderRight: "1px solid rgba(80,120,180,0.15)", borderBottom: "1px solid rgba(80,120,180,0.15)", overflow: "hidden" }}>
          <Globe
            onCountrySelect={(code) => { setSelectedCountry(code); setMode(null); }}
            selectedCountry={selectedCountry}
          />
          {selectedCountry && !mode && (
            <CountryOverlay
              key={selectedCountry}
              country={country}
              code={selectedCountry}
              onSelect={handleMode}
              onClose={handleClose}
            />
          )}
          {!selectedCountry && (
            <div style={{ position: "absolute", bottom: 16, left: 0, right: 0, textAlign: "center", color: `rgba(210,105,30,0.4)`, fontSize: 10, letterSpacing: 2, pointerEvents: "none" }}>
              DRAG TO ROTATE · CLICK A COUNTRY DOT · AUTO-ROTATES AFTER 10s
            </div>
          )}
        </div>

        {/* Worldwide news sidebar - full height right column */}
        <div style={{ gridColumn: "2/3", gridRow: "1/3", overflow: "hidden", display: "flex", flexDirection: "column", borderLeft: "none" }}>
          <NewsPanel
            title="WORLDWIDE FINANCIAL NEWS"
            query="worldwide global financial markets economy breaking news today"
            icon="🌍"
          />
        </div>

        {/* Country detail - bottom left */}
        <div style={{ gridColumn: "1/2", gridRow: "2/3", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {!mode ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "rgba(210,105,30,0.25)", fontSize: 11, letterSpacing: 2 }}>
              {selectedCountry ? "SELECT NEWS OR MARKET ON THE GLOBE" : "CLICK A COUNTRY DOT ON THE GLOBE TO EXPLORE"}
            </div>
          ) : (
            <div key={panelKey} style={{ height: "100%", animation: "fadeIn 0.4s ease" }}>
              <NewsPanel
                title={panelTitle}
                query={query}
                icon={mode === "news" ? "📰" : "📈"}
                onBack={handleBack}
                country={country}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
