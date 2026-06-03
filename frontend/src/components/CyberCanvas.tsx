"use client";

import React, { useEffect, useRef } from "react";

export default function CyberCanvas() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let width = (canvas.width = window.innerWidth);
		let height = (canvas.height = window.innerHeight);

		let mouseX = width / 2;
		let mouseY = height / 2;
		let targetMouseX = mouseX;
		let targetMouseY = mouseY;

		const colorPrimary = "#ff2d78"; // Pink neon
		const colorSecondary = "#00ffcc"; // Cyan neon
		const gridColor = "rgba(255, 45, 120, 0.12)";

		class Particle {
			x: number;
			y: number;
			z: number;
			size: number;
			baseX: number;
			baseY: number;
			color: string;
			opacity: number;

			constructor() {
				this.x = Math.random() * width;
				this.y = Math.random() * height;
				this.z = Math.random() * 2 + 0.1;
				this.size = Math.random() * 2 + 1;
				this.baseX = this.x;
				this.baseY = this.y;
				this.color = Math.random() > 0.5 ? colorPrimary : colorSecondary;
				this.opacity = Math.random() * 0.5 + 0.1;
			}

			update() {
				const dx = targetMouseX - width / 2;
				const dy = targetMouseY - height / 2;

				this.x = this.baseX - dx * (1 / this.z) * 0.03;
				this.y = this.baseY - dy * (1 / this.z) * 0.03;

				this.baseY -= 0.3 / this.z;
				if (this.baseY < -10) {
					this.baseY = height + 10;
					this.baseX = Math.random() * width;
				}
			}

			draw(context: CanvasRenderingContext2D) {
				context.beginPath();
				context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
				context.fillStyle = this.color;
				context.globalAlpha = this.opacity;
				context.fill();
				context.globalAlpha = 1;
			}
		}

		let particles: Particle[] = [];
		const initParticles = () => {
			particles = [];
			const numParticles = Math.floor((width * height) / 18000);
			for (let i = 0; i < numParticles; i++) {
				particles.push(new Particle());
			}
		};

		initParticles();

		const resize = () => {
			if (!canvas) return;
			width = canvas.width = window.innerWidth;
			height = canvas.height = window.innerHeight;
			initParticles();
		};

		const handleMouseMove = (e: MouseEvent) => {
			mouseX = e.clientX;
			mouseY = e.clientY;
		};

		window.addEventListener("resize", resize);
		window.addEventListener("mousemove", handleMouseMove);

		let time = 0;
		let animationId: number;

		const drawGrid = (context: CanvasRenderingContext2D) => {
			context.strokeStyle = gridColor;
			context.lineWidth = 1;

			const vanishY = height * 0.3; // Horizon level
			const speed = 0.4;
			time = (time + speed) % 20;

			// Horizontal perspective grid lines
			for (let y = vanishY + time; y < height; y += (y - vanishY) * 0.12 + 1) {
				context.beginPath();
				context.moveTo(0, y);
				context.lineTo(width, y);
				context.stroke();
			}

			// Vertical perspective lines converging to horizon center
			const numVertLines = 30;
			for (let i = 0; i <= numVertLines; i++) {
				const xTop = (width / numVertLines) * i;
				const distFromCenter = xTop - width / 2;
				let xBottom = width / 2 + distFromCenter * 3.5;

				const mouseOffset = ((targetMouseX - width / 2) / width) * 250;
				xBottom -= mouseOffset;

				context.beginPath();
				context.moveTo(xTop, vanishY);
				context.lineTo(xBottom, height);
				context.stroke();
			}
		};

		const animate = () => {
			ctx.clearRect(0, 0, width, height);

			const grad = ctx.createLinearGradient(0, 0, 0, height);
			grad.addColorStop(0, "#0a0a12");
			grad.addColorStop(0.3, "#0f0f1a");
			grad.addColorStop(1, "#05050a");
			ctx.fillStyle = grad;
			ctx.fillRect(0, 0, width, height);

			drawGrid(ctx);

			targetMouseX += (mouseX - targetMouseX) * 0.05;
			targetMouseY += (mouseY - targetMouseY) * 0.05;

			for (let i = 0; i < particles.length; i++) {
				particles[i].update();
				particles[i].draw(ctx);
			}

			animationId = requestAnimationFrame(animate);
		};

		animate();

		return () => {
			window.removeEventListener("resize", resize);
			window.removeEventListener("mousemove", handleMouseMove);
			cancelAnimationFrame(animationId);
		};
	}, []);

	return <canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full block pointer-events-none" />;
}
