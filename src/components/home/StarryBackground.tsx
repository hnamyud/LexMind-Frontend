"use client";

import { useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  twinkleDir: number;
  twinkleSpeed: number;
  color: string;
}

type ShootingStarPhase = "idle" | "spawning" | "traveling" | "fading";

interface ShootingStar {
  // Điểm đầu (head) – nơi sao băng đang ở
  x: number;
  y: number;
  // Tốc độ tức thời (px/frame)
  vx: number;
  vy: number;
  // Độ dài đuôi tối đa
  tailLength: number;
  // Độ sáng [0..1]
  opacity: number;
  // Phase hiện tại của sao băng
  phase: ShootingStarPhase;
  // Trễ trước khi spawn (frame count)
  spawnDelay: number;
  // Đuôi – mảng các điểm lịch sử
  trail: { x: number; y: number }[];
  // Gia tốc nhỏ để tạo cảm giác trọng lực/kéo nhẹ
  ax: number;
  ay: number;
  // Chiều rộng vệt tại đầu
  thickness: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createShootingStar(
  canvasW: number,
  canvasH: number,
  delayFrames = 0
): ShootingStar {
  // Góc đâm chéo từ trên-trái → dưới-phải: 25° → 50° so với ngang
  const angleDeg = randomBetween(25, 50);
  const angleRad = (angleDeg * Math.PI) / 180;
  // Tốc độ ban đầu
  const initSpeed = randomBetween(12, 22);

  // Xuất phát ở vùng trên-trái (x âm hoặc nhỏ, y âm hoặc nhỏ)
  const startX = randomBetween(-canvasW * 0.1, canvasW * 0.5);
  const startY = randomBetween(-canvasH * 0.2, canvasH * 0.1);

  return {
    x: startX,
    y: startY,
    // Vx dương = đi sang phải; vy dương = đi xuống
    vx: initSpeed * Math.cos(angleRad),
    vy: initSpeed * Math.sin(angleRad),
    // Gia tốc nhỏ → tăng tốc nhẹ theo hướng di chuyển
    ax: randomBetween(0.05, 0.18) * Math.cos(angleRad),
    ay: randomBetween(0.05, 0.18) * Math.sin(angleRad),
    tailLength: randomBetween(130, 320),
    opacity: 0,
    phase: delayFrames > 0 ? "idle" : "spawning",
    spawnDelay: delayFrames,
    trail: [],
    thickness: randomBetween(1.2, 2.2),
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;
    let stars: Star[] = [];
    let shooters: ShootingStar[] = [];
    // Đếm frame để spawn sao băng không bị đồng đều
    let frameCount = 0;

    // ── Resize ──────────────────────────────────────────────────────────────
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    // ── Init static stars ───────────────────────────────────────────────────
    const initStars = () => {
      stars = [];
      const count = Math.floor((canvas.width * canvas.height) / 1200);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: randomBetween(0.3, 1.6),
          opacity: randomBetween(0.2, 1),
          twinkleDir: Math.random() > 0.5 ? 1 : -1,
          twinkleSpeed: randomBetween(0.003, 0.018),
          color: Math.random() > 0.88 ? "#aaf0ff" : "#ffffff",
        });
      }

      // Khởi tạo pool sao băng với delay ngẫu nhiên
      shooters = [];
      const poolSize = 5;
      for (let i = 0; i < poolSize; i++) {
        shooters.push(
          createShootingStar(
            canvas.width,
            canvas.height,
            Math.floor(randomBetween(0, 300)) // delay tối đa ~5s
          )
        );
      }
    };

    // ── Spawn lại một sao băng đã chết ──────────────────────────────────────
    const respawnShooter = (s: ShootingStar) => {
      const fresh = createShootingStar(
        canvas.width,
        canvas.height,
        Math.floor(randomBetween(60, 400)) // chờ 1–7s trước khi xuất hiện lại
      );
      Object.assign(s, fresh);
    };

    // ── Draw shooting star ───────────────────────────────────────────────────
    const drawShooter = (s: ShootingStar) => {
      if (s.phase === "idle" || s.trail.length < 2) return;

      const trailLen = s.trail.length;

      // --- Glow bloom tại đầu ---
      const headGlow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 12);
      headGlow.addColorStop(0, `rgba(255,255,255,${s.opacity * 0.9})`);
      headGlow.addColorStop(0.3, `rgba(0,242,255,${s.opacity * 0.5})`);
      headGlow.addColorStop(1, "rgba(0,242,255,0)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = headGlow;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 12, 0, Math.PI * 2);
      ctx.fill();

      // --- Đuôi được vẽ theo từng đoạn nhỏ để taper (thu dần đến trong suốt) ---
      for (let i = 1; i < trailLen; i++) {
        const p0 = s.trail[i - 1];
        const p1 = s.trail[i];

        // t = 0 ở cuối đuôi (cũ nhất) → 1 ở đầu (mới nhất)
        const t = i / (trailLen - 1);

        // Opacity từ 0 → s.opacity theo t^1.5 để tail fade mượt
        const segAlpha = s.opacity * Math.pow(t, 1.5);
        // Độ dày từ 0.3 → s.thickness
        const segWidth = s.thickness * t;

        const grad = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
        grad.addColorStop(0, `rgba(0,230,255,${segAlpha * 0.6})`);
        grad.addColorStop(1, `rgba(255,255,255,${segAlpha})`);

        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = segWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    };

    // ── Update shooting star ─────────────────────────────────────────────────
    const updateShooter = (s: ShootingStar) => {
      // — IDLE: đang chờ —
      if (s.phase === "idle") {
        s.spawnDelay--;
        if (s.spawnDelay <= 0) s.phase = "spawning";
        return;
      }

      // — SPAWNING: xuất hiện, tăng opacity —
      if (s.phase === "spawning") {
        s.opacity = Math.min(s.opacity + 0.06, 1);
        if (s.opacity >= 0.95) s.phase = "traveling";
      }

      // — TRAVELING: di chuyển với gia tốc —
      if (s.phase === "traveling") {
        s.vx += s.ax;
        s.vy += s.ay;

        // Thêm điểm vào đuôi
        s.trail.push({ x: s.x, y: s.y });

        // Tính chiều dài đuôi theo tổng khoảng cách
        let totalLen = 0;
        for (let i = s.trail.length - 1; i > 0; i--) {
          const dx = s.trail[i].x - s.trail[i - 1].x;
          const dy = s.trail[i].y - s.trail[i - 1].y;
          totalLen += Math.sqrt(dx * dx + dy * dy);
          if (totalLen > s.tailLength) {
            s.trail = s.trail.slice(i);
            break;
          }
        }

        s.x += s.vx;
        s.y += s.vy;

        // Kiểm tra ra khỏi màn hình → chuyển sang fading
        const offscreen =
          s.x > canvas.width + s.tailLength ||
          s.y > canvas.height + s.tailLength ||
          s.x < -s.tailLength;
        if (offscreen) s.phase = "fading";
      }

      // — FADING: phai dần —
      if (s.phase === "fading") {
        s.opacity -= 0.04;
        s.trail.push({ x: s.x, y: s.y });
        // Tiếp tục di chuyển khi fading để đuôi không bị cứng
        s.x += s.vx;
        s.y += s.vy;
        s.trail = s.trail.slice(1); // Xoá điểm đầu để đuôi ngắn dần

        if (s.opacity <= 0) {
          respawnShooter(s);
        }
      }
    };

    // ── Main loop ────────────────────────────────────────────────────────────
    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- Static stars ---
      stars.forEach((star) => {
        star.opacity += star.twinkleSpeed * star.twinkleDir;
        if (star.opacity >= 1) { star.opacity = 1; star.twinkleDir = -1; }
        if (star.opacity <= 0.1) { star.opacity = 0.1; star.twinkleDir = 1; }

        ctx.globalAlpha = star.opacity;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // --- Shooting stars ---
      shooters.forEach((s) => {
        updateShooter(s);
        drawShooter(s);
      });

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(render);
    };

    window.addEventListener("resize", resize);
    resize();
    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
