"use client";

import { useEffect, useRef } from "react";

export default function NeuralMeshBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const initVanta = () => {
      if (isMounted && !vantaEffect.current && vantaRef.current && (window as any).VANTA) {
        vantaEffect.current = (window as any).VANTA.NET({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0x00f5ff,
          backgroundColor: 0x0a0a0a,
          points: 18.00,
          maxDistance: 20.00,
          spacing: 16.00
        });
      }
    };

    // Kiểm tra xem THREE và VANTA đã load chưa (để hỗ trợ dev hot-reload)
    if ((window as any).THREE && (window as any).VANTA) {
      initVanta();
    } else {
      // Tải ThreeJS
      const scriptThree = document.createElement("script");
      scriptThree.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js";
      scriptThree.async = true;

      scriptThree.onload = () => {
        if (!isMounted) return;
        // Tải Vanta sau khi ThreeJS đã tải xong
        const scriptVanta = document.createElement("script");
        scriptVanta.src = "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js";
        scriptVanta.async = true;
        
        scriptVanta.onload = () => {
          if (!isMounted) return;
          initVanta();
        };
        
        document.head.appendChild(scriptVanta);
      };

      document.head.appendChild(scriptThree);
    }

    return () => {
      isMounted = false;
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={vantaRef} 
      className="absolute inset-0 z-0 w-full h-full pointer-events-none" 
      style={{ opacity: 0.95 }}
    />
  );
}
