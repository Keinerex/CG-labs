const renderCDA = (
	x0: number,
	y0: number,
	x1: number,
	y1: number,
	ctx: CanvasRenderingContext2D,
) => {
	const dx = x1 - x0;
	const dy = y1 - y0;

	const steps = Math.abs(dx) > Math.abs(dy) ? Math.abs(dx) : Math.abs(dy);

	const xInc = dx / steps;
	const yInc = dy / steps;

	let x = x0;
	let y = y0;

	ctx.fillStyle = 'rgba(255,0,0,0.5)';

	for (let i = 0; i <= steps; i++) {
		ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
		x += xInc;
		y += yInc;
	}

	ctx.save();
};

const renderBresenham = (
	x0: number,
	y0: number,
	x1: number,
	y1: number,
	ctx: CanvasRenderingContext2D,
) => {
	const dx = Math.abs(x1 - x0);
	const dy = Math.abs(y1 - y0);
	const sx = x0 < x1 ? 1 : -1;
	const sy = y0 < y1 ? 1 : -1;
	let err = dx - dy;

	ctx.fillStyle = 'rgba(0,0,255,0.5)';

	while (true) {
		ctx.fillRect(x0, y0, 1, 1);

		if (x0 === x1 && y0 === y1) break;

		const e2 = 2 * err;

		if (e2 > -dy) {
			err -= dy;
			x0 += sx;
		}

		if (e2 < dx) {
			err += dx;
			y0 += sy;
		}
	}

	ctx.save();
};

export default function render(
	x0: number,
	y0: number,
	x1: number,
	y1: number,
	ctx: CanvasRenderingContext2D,
) {
	renderCDA(x0, y0, x1, y1, ctx);
	renderBresenham(x0, y0, x1, y1, ctx);
}
