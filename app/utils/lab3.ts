const polygon: [number, number][] = [
	[100, 80],
	[250, 50],
	[400, 100],
	[450, 250],
	[350, 350],
	[150, 300],
	[50, 150],
];

const COLORS = {
	WHITE: '#FFFFFF',
	GREEN: '#00FF00',
	BLUE: '#0000FF',
} as const;

function sleep(ms: number = 5) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export enum FillAlgorithm {
	SCANLINE = 'scanline',
	EDGE = 'edge',
}

function drawPolygonOutline(ctx: CanvasRenderingContext2D): void {
	if (polygon.length === 0) return;

	ctx.strokeStyle = COLORS.WHITE;
	ctx.lineWidth = 2;
	ctx.beginPath();

	const first = polygon[0];
	if (!first) return;
	ctx.moveTo(first[0], first[1]);

	for (let i = 1; i < polygon.length; i++) {
		const p = polygon[i] as [number, number];
		ctx.lineTo(p[0], p[1]);
	}
	ctx.closePath();
	ctx.stroke();
}

async function fillPolygonScanline(ctx: CanvasRenderingContext2D): Promise<void> {
	if (polygon.length === 0) return;

	const minY = Math.min(...polygon.map(p => p[1]));
	const maxY = Math.max(...polygon.map(p => p[1]));

	for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
		const intersections: number[] = [];

		for (let i = 0; i < polygon.length; i++) {
			const [x1, y1] = polygon[i] as [number, number];
			const [x2, y2] = polygon[(i + 1) % polygon.length] as [number, number];

			if ((y1 <= y && y < y2) || (y2 <= y && y < y1)) {
				if (y1 !== y2) {
					const x = x1 + (x2 - x1) * (y - y1) / (y2 - y1);
					intersections.push(x);
				}
			}
		}

		intersections.sort((a, b) => a - b);

		ctx.strokeStyle = COLORS.GREEN;
		ctx.lineWidth = 1;
		for (let i = 0; i + 1 < intersections.length; i += 2) {
			const left = intersections[i];
			const right = intersections[i + 1];
			if (left === undefined || right === undefined) continue;

			const startX = Math.floor(left);
			const endX = Math.floor(right);

			ctx.beginPath();
			ctx.moveTo(startX, y);
			ctx.lineTo(endX, y);
			ctx.stroke();
		}

		await sleep();
	}
}

async function fillPolygonByEdges(ctx: CanvasRenderingContext2D): Promise<void> {
	if (polygon.length === 0) return;

	const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
	const data: number[] = Array.from(imageData.data);

	const getAlpha = (x: number, y: number): number => {
		if (x < 0 || x >= ctx.canvas.width || y < 0 || y >= ctx.canvas.height) {
			return -1;
		}
		const index = (Math.floor(y) * ctx.canvas.width + Math.floor(x)) * 4;
		const alpha = data[index + 3];
		return alpha ?? 0;
	};

	const setRGBA = (x: number, y: number, r: number, g: number, b: number, a: number = 255): void => {
		if (x < 0 || x >= ctx.canvas.width || y < 0 || y >= ctx.canvas.height) return;
		const index = (Math.floor(y) * ctx.canvas.width + Math.floor(x)) * 4;
		data[index] = r;
		data[index + 1] = g;
		data[index + 2] = b;
		data[index + 3] = a;
	};

	const invertPixelsRight = (x: number, y: number): void => {
		const startX = Math.floor(x);
		const row = Math.floor(y);
		for (let invertX = startX; invertX < ctx.canvas.width; invertX++) {
			const alpha = getAlpha(invertX, row);
			if (alpha === -1) {
				continue;
			}
			if (alpha === 0) {
				setRGBA(invertX, row, 0, 0, 255, 255);
			}
			else {
				setRGBA(invertX, row, 0, 0, 0, 0);
			}
		}
	};

	for (let i = 0; i < polygon.length; i++) {
		const [vx, vy] = polygon[i] as [number, number];
		const [, py] = polygon[(i - 1 + polygon.length) % polygon.length] as [number, number];
		const [, ny] = polygon[(i + 1) % polygon.length] as [number, number];

		const prevHor = py === vy;
		const nextHor = vy === ny;
		if (prevHor || nextHor) continue;

		const isMax = py < vy && ny < vy;
		const isMin = py > vy && ny > vy;
		if (!isMax && !isMin) {
			invertPixelsRight(vx, vy);
		}
	}

	const updated = new Uint8ClampedArray(data);
	ctx.putImageData(new ImageData(updated, imageData.width, imageData.height), 0, 0);

	for (let i = 0; i < polygon.length; i++) {
		let [x1, y1] = polygon[i] as [number, number];
		let [x2, y2] = polygon[(i + 1) % polygon.length] as [number, number];

		if (y1 === y2) continue;

		if (y1 > y2) {
			[x1, y1, x2, y2] = [x2, y2, x1, y1];
		}

		const startY = Math.floor(y1);
		const endY = Math.floor(y2);
		if (startY > endY) continue;
		const slope = (x2 - x1) / (y2 - y1);

		for (let y = startY; y <= endY; y++) {
			const x = x1 + (y - y1) * slope;
			invertPixelsRight(x, y);

			await sleep();
			const frameData = new Uint8ClampedArray(data);
			ctx.putImageData(new ImageData(frameData, imageData.width, imageData.height), 0, 0);
		}
	}
}

export default async function render(
	ctx: CanvasRenderingContext2D,
	algo: FillAlgorithm = FillAlgorithm.SCANLINE,
): Promise<void> {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	drawPolygonOutline(ctx);

	switch (algo) {
		case FillAlgorithm.SCANLINE:
			await fillPolygonScanline(ctx);
			break;
		case FillAlgorithm.EDGE:
			await fillPolygonByEdges(ctx);
			break;
	}

	drawPolygonOutline(ctx);
}
