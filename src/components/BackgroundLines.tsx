"use client";

import { useEffect, useRef } from "react";

const COLORS = [
  "#38bdf8", // sky-400
  "#9333ea", // violet-600
  "#ec4899", // pink-500
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e42", // orange-400
];

const LINES = 18;
const RADIUS = 180;
const LINE_LENGTH = 60;
const LINE_WIDTH = 3;

export default function BackgroundLines() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let frame: number;
    let angle = 0;
    function animate() {
      angle += 0.008;
      if (ref.current) {
        for (let i = 0; i < LINES; i++) {
          const line = ref.current.getElementById(`line-${i}`);
          if (line) {
            const theta = (i / LINES) * Math.PI * 2 + angle + Math.sin(angle + i) * 0.2;
            const x1 = Math.cos(theta) * RADIUS + RADIUS + LINE_WIDTH;
            const y1 = Math.sin(theta) * RADIUS + RADIUS + LINE_WIDTH;
            const x2 = Math.cos(theta) * (RADIUS + LINE_LENGTH) + RADIUS + LINE_WIDTH;
            const y2 = Math.sin(theta) * (RADIUS + LINE_LENGTH) + RADIUS + LINE_WIDTH;
            line.setAttribute("x1", x1.toString());
            line.setAttribute("y1", y1.toString());
            line.setAttribute("x2", x2.toString());
            line.setAttribute("y2", y2.toString());
          }
        }
      }
      frame = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <svg
      ref={ref}
      width={RADIUS * 2 + LINE_LENGTH + LINE_WIDTH * 2}
      height={RADIUS * 2 + LINE_LENGTH + LINE_WIDTH * 2}
      className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 z-0 pointer-events-none select-none"
      style={{ filter: "blur(0.5px)", opacity: 0.7 }}
    >
      {Array.from({ length: LINES }).map((_, i) => (
        <line
          key={i}
          id={`line-${i}`}
          x1={0}
          y1={0}
          x2={0}
          y2={0}
          stroke={COLORS[i % COLORS.length]}
          strokeWidth={LINE_WIDTH}
          strokeLinecap="round"
          opacity={0.7}
        />
      ))}
    </svg>
  );
} 