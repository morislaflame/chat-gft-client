import React, { useEffect, useRef } from 'react';

type Point = { x: number; y: number };

type MissionPathCanvasProps = {
    points: Point[];
    width: number;
    height: number;
    className?: string;
};

/**
 * Рисует извилистую «тропинку» между точками (центры карточек миссий).
 */
const MissionPathCanvas: React.FC<MissionPathCanvasProps> = ({ points, width, height, className = '' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || width <= 0 || height <= 0) return;
        const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);

        if (points.length < 2) return;

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(180, 160, 120, 0.55)';
        ctx.shadowColor = 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            const p0 = points[i - 1];
            const p1 = points[i];
            const dx = p1.x - p0.x;
            const dy = p1.y - p0.y;
            const zig = (i % 2 === 0 ? 1 : -1) * Math.min(48, Math.abs(dy) * 0.15 + 24);
            const cx1 = p0.x + dx * 0.28 + zig;
            const cy1 = p0.y + dy * 0.22;
            const cx2 = p0.x + dx * 0.72 - zig * 0.6;
            const cy2 = p0.y + dy * 0.78;
            ctx.bezierCurveTo(cx1, cy1, cx2, cy2, p1.x, p1.y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // лёгкая «обсыпка» тропинки
        ctx.fillStyle = 'rgba(120, 100, 70, 0.25)';
        for (let i = 1; i < points.length; i++) {
            const p0 = points[i - 1];
            const p1 = points[i];
            const steps = 5;
            for (let s = 0; s <= steps; s++) {
                const t = s / steps;
                const x = p0.x + (p1.x - p0.x) * t + (Math.sin(t * Math.PI + i) * 6);
                const y = p0.y + (p1.y - p0.y) * t;
                ctx.beginPath();
                ctx.arc(x, y, 1.2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }, [points, width, height]);

    if (width <= 0 || height <= 0) return null;

    return <canvas ref={canvasRef} className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden />;
};

export default MissionPathCanvas;
