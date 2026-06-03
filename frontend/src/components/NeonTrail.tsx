"use client";

import React, { useEffect, useRef } from "react";

export default function NeonTrail() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let width = (canvas.width = window.innerWidth);
		let height = (canvas.height = window.innerHeight);

		const handleResize = () => {
			if (!canvas) return;
			width = canvas.width = window.innerWidth;
			height = canvas.height = window.innerHeight;
		};

		window.addEventListener("resize", handleResize);

		interface Point {
			x: number;
			y: number;
			age: number;
		}

		const points: Point[] = [];
		const maxPoints = 15;
		let mouseX = -200;
		let mouseY = -200;

		const handleMouseMove = (e: MouseEvent) => {
			mouseX = e.clientX;
			mouseY = e.clientY;
		};

		window.addEventListener("mousemove", handleMouseMove);

		let animationId: number;

		const animate = () => {
			ctx.clearRect(0, 0, width, height);

			points.push({ x: mouseX, y: mouseY, age: 0 });

			if (points.length > maxPoints) {
				points.shift();
			}

			if (points.length > 1) {
				ctx.beginPath();
				ctx.moveTo(points[0].x, points[0].y);
				for (let i = 1; i < points.length; i++) {
					points[i].age++;
					ctx.lineTo(points[i].x, points[i].y);
				}

				ctx.strokeStyle = "rgba(0, 255, 204, 0.75)";
				ctx.lineWidth = 2.5;
				ctx.lineCap = "round";
				ctx.lineJoin = "round";
				ctx.shadowBlur = 12;
				ctx.shadowColor = "rgba(0, 255, 204, 1)";
				ctx.stroke();
				ctx.shadowBlur = 0;
			}

			animationId = requestAnimationFrame(animate);
		};

		animate();

		return () => {
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("mousemove", handleMouseMove);
			cancelAnimationFrame(animationId);
		};
	}, []);

	return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999] block" />;
}
