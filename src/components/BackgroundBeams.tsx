"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Beam {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
  velocity: { x: number; y: number };
}

export default function BackgroundBeams() {
  const [beams, setBeams] = useState<Beam[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  const colors = [
    "rgba(56, 189, 248, 0.3)", // sky-400
    "rgba(147, 51, 234, 0.3)", // violet-600
    "rgba(236, 72, 153, 0.3)", // pink-500
    "rgba(59, 130, 246, 0.3)", // blue-500
    "rgba(16, 185, 129, 0.3)", // emerald-500
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    // Criar feixes iniciais
    const initialBeams: Beam[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * containerRect.width,
      y: Math.random() * containerRect.height,
      width: Math.random() * 100 + 50,
      height: Math.random() * 200 + 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.5 + 0.1,
      velocity: {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
      },
    }));

    setBeams(initialBeams);

    const animate = () => {
      setBeams((prevBeams) =>
        prevBeams.map((beam) => {
          let newX = beam.x + beam.velocity.x;
          let newY = beam.y + beam.velocity.y;

          // Bounce off walls
          if (newX <= 0 || newX >= containerRect.width - beam.width) {
            beam.velocity.x *= -1;
            newX = Math.max(0, Math.min(containerRect.width - beam.width, newX));
          }

          if (newY <= 0 || newY >= containerRect.height - beam.height) {
            beam.velocity.y *= -1;
            newY = Math.max(0, Math.min(containerRect.height - beam.height, newY));
          }

          // Check collision with other beams
          prevBeams.forEach((otherBeam) => {
            if (beam.id !== otherBeam.id) {
              const distance = Math.sqrt(
                Math.pow(newX - otherBeam.x, 2) + Math.pow(newY - otherBeam.y, 2)
              );
              
              if (distance < (beam.width + otherBeam.width) / 2) {
                // Collision detected - reverse velocities
                beam.velocity.x *= -1;
                beam.velocity.y *= -1;
                otherBeam.velocity.x *= -1;
                otherBeam.velocity.y *= -1;
              }
            }
          });

          return {
            ...beam,
            x: newX,
            y: newY,
          };
        })
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none"
    >
      {beams.map((beam) => (
        <motion.div
          key={beam.id}
          className="absolute rounded-full blur-sm"
          style={{
            left: beam.x,
            top: beam.y,
            width: beam.width,
            height: beam.height,
            background: beam.color,
            opacity: beam.opacity,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [beam.opacity, beam.opacity * 1.5, beam.opacity],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
} 