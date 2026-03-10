import { useState, useEffect, useRef } from "react";

const COLORS = ["#FF6B9D", "#FFD166", "#06D6A0", "#118AB2", "#EF476F", "#FFB347", "#A8EDEA", "#FED9B7"];

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

function Confetti() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const pieces = Array.from({ length: 120 }, () => ({
      x: randomBetween(0, canvas.width),
      y: randomBetween(-200, 0),
      r: randomBetween(6, 14),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speed: randomBetween(2, 5),
      swing: randomBetween(-1.5, 1.5),
      angle: randomBetween(0, Math.PI * 2),
      angSpeed: randomBetween(-0.05, 0.05),
      shape: Math.random() > 0.5 ? "rect" : "circle",
    }));
    let animId;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.88;
        if (p.shape === "rect") {
          ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.8);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        p.y += p.speed;
        p.x += Math.sin(p.y / 30) * p.swing;
        p.angle += p.angSpeed;
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = randomBetween(0, canvas.width);
        }
      });
      animId = requestAnimationFrame(draw);
    }
    draw();
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 0 }} />;
}

function Balloon({ color, x, delay, size = 56 }) {
  return (
    <div style={{
      position: "absolute",
      left: `${x}%`,
      bottom: 0,
      animation: `floatUp 7s ${delay}s ease-in infinite`,
      zIndex: 1,
    }}>
      <svg width={size} height={size * 1.4} viewBox="0 0 56 78" fill="none">
        <ellipse cx="28" cy="32" rx="22" ry="28" fill={color} opacity="0.85" />
        <ellipse cx="22" cy="22" rx="6" ry="9" fill="white" opacity="0.22" />
        <path d="M28 60 Q30 67 27 74" stroke={color} strokeWidth="2" fill="none" />
        <circle cx="27" cy="75" r="2" fill={color} opacity="0.7" />
      </svg>
    </div>
  );
}

const balloons = [
  { color: "#FF6B9D", x: 5, delay: 0, size: 60 },
  { color: "#FFD166", x: 15, delay: 1.2, size: 50 },
  { color: "#06D6A0", x: 82, delay: 0.5, size: 65 },
  { color: "#118AB2", x: 92, delay: 2, size: 52 },
  { color: "#EF476F", x: 55, delay: 3.5, size: 48 },
  { color: "#FFB347", x: 70, delay: 1.8, size: 58 },
];

const stars = Array.from({ length: 18 }, (_, i) => ({
  top: `${randomBetween(2, 95)}%`,
  left: `${randomBetween(2, 98)}%`,
  size: randomBetween(10, 22),
  delay: randomBetween(0, 3),
  color: COLORS[i % COLORS.length],
}));

export default function BirthdayPage() {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("Thành Nhân");

  useEffect(() => {
    setTimeout(() => setShow(true), 200);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a0533 0%, #2d0b5e 40%, #0d2157 100%)",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Pacifico', 'Dancing Script', cursive",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Nunito:wght@400;700;900&family=Dancing+Script:wght@700&display=swap');
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(-4deg); opacity:0; }
          10% { opacity: 1; }
          80% { opacity: 0.85; }
          100% { transform: translateY(-110vh) rotate(8deg); opacity: 0; }
        }
        @keyframes popIn {
          0% { transform: scale(0.4) rotate(-8deg); opacity: 0; }
          70% { transform: scale(1.08) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes glowPulse {
          0%, 100% { text-shadow: 0 0 24px #FFD166, 0 0 60px #FF6B9D, 0 2px 0 #fff; }
          50% { text-shadow: 0 0 48px #FFD166, 0 0 100px #FF6B9D, 0 2px 0 #fff; }
        }
        @keyframes starSpin {
          from { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.3); }
          to { transform: rotate(360deg) scale(1); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .cake-bounce { animation: bounce 1.5s ease-in-out infinite; }
        .title-glow {
          animation: glowPulse 2.2s ease-in-out infinite;
          font-family: 'Pacifico', cursive;
          font-size: clamp(2.2rem, 7vw, 4.2rem);
          color: #FFD166;
          letter-spacing: 2px;
          text-align: center;
        }
        .pop-in { animation: popIn 0.8s cubic-bezier(.22,1.2,.6,1) forwards; }
        .shimmer-text {
          background: linear-gradient(90deg, #FFD166 0%, #fff 40%, #FF6B9D 60%, #FFD166 100%);
          background-size: 400px 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 2.5s linear infinite;
        }
        .card-glow {
          box-shadow: 0 0 60px 10px rgba(255,107,157,0.18), 0 8px 48px rgba(17,138,178,0.15), 0 2px 12px rgba(0,0,0,0.4);
        }
      `}</style>

      <Confetti />

      {/* Stars */}
      {stars.map((s, i) => (
        <div key={i} style={{
          position: "fixed",
          top: s.top,
          left: s.left,
          zIndex: 1,
          animation: `starSpin ${3 + s.delay}s linear infinite`,
          animationDelay: `${s.delay}s`,
          opacity: 0.7,
        }}>
          <svg width={s.size} height={s.size} viewBox="0 0 24 24">
            <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" fill={s.color} />
          </svg>
        </div>
      ))}

      {/* Balloons */}
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }}>
        {balloons.map((b, i) => <Balloon key={i} {...b} />)}
      </div>

      {/* Card */}
      <div className={show ? "pop-in" : ""} style={{
        opacity: show ? 1 : 0,
        zIndex: 10,
        position: "relative",
        background: "rgba(30, 12, 60, 0.82)",
        backdropFilter: "blur(18px)",
        borderRadius: "32px",
        border: "2px solid rgba(255,209,102,0.25)",
        padding: "clamp(28px, 6vw, 60px) clamp(20px, 6vw, 64px)",
        maxWidth: 560,
        width: "90vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
      }} >
        {/* Top label */}
        <div style={{
          background: "linear-gradient(90deg,#FF6B9D,#FFD166,#06D6A0)",
          borderRadius: 30,
          padding: "5px 22px",
          fontSize: "0.82rem",
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 900,
          color: "#1a0533",
          letterSpacing: 2,
          marginBottom: 4,
          textTransform: "uppercase",
        }}>
          CSKH · Thành Nhân TNC
        </div>

        {/* Cake */}
        <div className="cake-bounce" style={{ fontSize: "clamp(3rem, 10vw, 5.5rem)", lineHeight: 1 }}>
          🎂
        </div>

        {/* Title */}
        <h1 className="title-glow">
          Chúc Mừng Sinh Nhật!
        </h1>

        {/* Name */}
        <div style={{
          fontFamily: "'Dancing Script', cursive",
          fontSize: "clamp(1.5rem, 5vw, 2.6rem)",
          fontWeight: 700,
          marginTop: -6,
        }}>
          <span className="shimmer-text">✨ {name} ✨</span>
        </div>

        {/* Message */}
        <div style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: "clamp(0.95rem, 2.5vw, 1.15rem)",
          color: "rgba(255,255,255,0.88)",
          textAlign: "center",
          lineHeight: 1.75,
          maxWidth: 400,
          animation: "fadeSlideUp 1s 0.6s both",
          fontWeight: 400,
        }}>
          Nhân ngày sinh nhật, toàn thể đội ngũ <strong style={{ color: "#FFD166" }}>CSKH Thành Nhân TNC</strong> xin gửi đến bạn những lời chúc tốt đẹp nhất! 🎉<br /><br />
          Chúc bạn luôn tràn đầy sức khỏe, hạnh phúc và thành công trên mọi con đường! 🌟💖
        </div>

        {/* Icons row */}
        <div style={{
          display: "flex",
          gap: 12,
          fontSize: "2rem",
          marginTop: 4,
          animation: "fadeSlideUp 1s 1s both",
        }}>
          {["🎁","🥳","🎊","🌸","💛"].map((e,i)=>(
            <span key={i} style={{ animation: `bounce ${1.2 + i*0.15}s ease-in-out ${i*0.12}s infinite` }}>{e}</span>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 8,
          borderTop: "1px solid rgba(255,209,102,0.18)",
          paddingTop: 14,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          animation: "fadeSlideUp 1s 1.3s both",
        }}>
          <span style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: "0.82rem",
            color: "rgba(255,255,255,0.45)",
            letterSpacing: 1,
          }}>
            💌 Với tất cả tình cảm từ đội ngũ CSKH Thành Nhân TNC
          </span>
        </div>
      </div>
    </div>
  );
}