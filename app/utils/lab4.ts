type ConnectivityType = 4 | 8;

interface FloodFillStats {
	pixelsFilled: number;
	maxStackSize: number;
	time: number;
}

const COLORS = {
	WHITE: '#FFFFFF',
	BLACK: '#000000',
	RED: '#FF0000',
	GREEN: '#00FF00',
	BLUE: '#0000FF',
	YELLOW: '#FFFF00',
} as const;

export enum FloodFillAlgorithm {
	SIMPLE_4 = 'simple_4',
	SIMPLE_8 = 'simple_8',
	SCANLINE_4 = 'scanline_4',
	SCANLINE_8 = 'scanline_8',
}

function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function getPixelColor(
	data: Uint8ClampedArray,
	width: number,
	height: number,
	x: number,
	y: number,
): [number, number, number, number] | null {
	if (x < 0 || x >= width || y < 0 || y >= height) {
		return null;
	}
	const index = (Math.floor(y) * width + Math.floor(x)) * 4;
	if (index + 3 >= data.length) {
		return null;
	}
	const r = data[index] ?? 0;
	const g = data[index + 1] ?? 0;
	const b = data[index + 2] ?? 0;
	const a = data[index + 3] ?? 0;
	return [r, g, b, a];
}

function setPixelColor(
	data: Uint8ClampedArray,
	width: number,
	height: number,
	x: number,
	y: number,
	r: number,
	g: number,
	b: number,
	a: number = 255,
): void {
	if (x < 0 || x >= width || y < 0 || y >= height) {
		return;
	}
	const index = (Math.floor(y) * width + Math.floor(x)) * 4;
	if (index + 3 >= data.length) {
		return;
	}
	data[index] = r;
	data[index + 1] = g;
	data[index + 2] = b;
	data[index + 3] = a;
}

function colorsEqual(
	c1: [number, number, number, number] | null,
	c2: [number, number, number, number],
): boolean {
	if (!c1) return false;
	return c1[0] === c2[0] && c1[1] === c2[1] && c1[2] === c2[2] && c1[3] === c2[3];
}

async function simpleFloodFillInternal(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	targetColor: [number, number, number, number],
	replacementColor: [number, number, number, number],
	connectivity: ConnectivityType,
): Promise<FloodFillStats> {
	if (colorsEqual(targetColor, replacementColor)) {
		return { pixelsFilled: 0, maxStackSize: 0, time: 0 };
	}

	const startTime = performance.now();
	const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
	const data = imageData.data;
	const width = ctx.canvas.width;
	const height = ctx.canvas.height;

	const stack: [number, number][] = [[x, y]];
	let filledPixels = 0;
	let maxStackSize = 0;

	const directions: [number, number][]
		= connectivity === 4
			? [[1, 0], [-1, 0], [0, 1], [0, -1]]
			: [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

	while (stack.length > 0) {
		const [currentX, currentY] = stack.pop()!;

		if (currentX < 0 || currentX >= width || currentY < 0 || currentY >= height) {
			continue;
		}

		const currentColor = getPixelColor(data, width, height, currentX, currentY);

		if (!currentColor || !colorsEqual(currentColor, targetColor)) {
			continue;
		}

		setPixelColor(
			data,
			width,
			height,
			currentX,
			currentY,
			replacementColor[0],
			replacementColor[1],
			replacementColor[2],
			replacementColor[3],
		);
		filledPixels++;

		for (const [dx, dy] of directions) {
			stack.push([currentX + dx, currentY + dy]);
		}

		maxStackSize = Math.max(maxStackSize, stack.length);

		if (filledPixels % 50 === 0) {
			ctx.putImageData(imageData, 0, 0);
			await sleep(1);
		}
	}

	return {
		pixelsFilled: filledPixels,
		maxStackSize,
		time: (performance.now() - startTime) / 1000,
	};
}

function checkScanline(
	stack: [number, number][],
	data: Uint8ClampedArray,
	width: number,
	height: number,
	leftX: number,
	rightX: number,
	y: number,
	targetColor: [number, number, number, number],
): void {
	let x = leftX;
	while (x <= rightX) {
		const color = getPixelColor(data, width, height, x, y);
		if (color && colorsEqual(color, targetColor)) {
			const segmentStart = x;

			while (x <= rightX) {
				const c = getPixelColor(data, width, height, x, y);
				if (!c || !colorsEqual(c, targetColor)) {
					break;
				}
				x++;
			}

			stack.push([segmentStart, y]);
		}
		else {
			x++;
		}
	}
}

async function scanlineFloodFillInternal(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	targetColor: [number, number, number, number],
	replacementColor: [number, number, number, number],
	connectivity: ConnectivityType,
): Promise<FloodFillStats> {
	if (colorsEqual(targetColor, replacementColor)) {
		return { pixelsFilled: 0, maxStackSize: 0, time: 0 };
	}

	const startTime = performance.now();
	const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
	const data = imageData.data;
	const width = ctx.canvas.width;
	const height = ctx.canvas.height;

	const stack: [number, number][] = [[x, y]];
	let filledPixels = 0;
	let maxStackSize = 0;

	while (stack.length > 0) {
		const [seedX, seedY] = stack.pop()!;

		if (seedX < 0 || seedX >= width || seedY < 0 || seedY >= height) {
			continue;
		}

		const currentColor = getPixelColor(data, width, height, seedX, seedY);

		if (!currentColor || !colorsEqual(currentColor, targetColor)) {
			continue;
		}

		let leftX = seedX;
		while (leftX > 0) {
			const color = getPixelColor(data, width, height, leftX - 1, seedY);
			if (!color || !colorsEqual(color, targetColor)) {
				break;
			}
			leftX--;
		}

		let rightX = seedX;
		while (rightX < width - 1) {
			const color = getPixelColor(data, width, height, rightX + 1, seedY);
			if (!color || !colorsEqual(color, targetColor)) {
				break;
			}
			rightX++;
		}

		for (let xPos = leftX; xPos <= rightX; xPos++) {
			setPixelColor(
				data,
				width,
				height,
				xPos,
				seedY,
				replacementColor[0],
				replacementColor[1],
				replacementColor[2],
				replacementColor[3],
			);
			filledPixels++;
		}

		if (connectivity === 4) {
			if (seedY > 0) {
				checkScanline(stack, data, width, height, leftX, rightX, seedY - 1, targetColor);
			}
			if (seedY < height - 1) {
				checkScanline(stack, data, width, height, leftX, rightX, seedY + 1, targetColor);
			}
		}
		else {
			for (const dy of [-1, 1]) {
				const newY = seedY + dy;
				if (newY >= 0 && newY < height) {
					const extendedLeft = Math.max(0, leftX - 1);
					const extendedRight = Math.min(width - 1, rightX + 1);
					checkScanline(stack, data, width, height, extendedLeft, extendedRight, newY, targetColor);
				}
			}
		}

		maxStackSize = Math.max(maxStackSize, stack.length);

		ctx.putImageData(imageData, 0, 0);
		await sleep(1);
	}

	ctx.putImageData(imageData, 0, 0);

	return {
		pixelsFilled: filledPixels,
		maxStackSize,
		time: (performance.now() - startTime) / 1000,
	};
}

export function drawPlayground(ctx: CanvasRenderingContext2D): void {
	const canvas = ctx.canvas;
	const width = canvas.width;
	const height = canvas.height;

	ctx.fillStyle = COLORS.WHITE;
	ctx.fillRect(0, 0, width, height);

	ctx.strokeStyle = COLORS.BLACK;
	ctx.lineWidth = 2;
	ctx.strokeRect(100, 100, 400, 300);

	ctx.beginPath();
	ctx.arc(250, 200, 40, 0, Math.PI * 2);
	ctx.stroke();

	ctx.strokeRect(350, 250, 80, 60);

	ctx.beginPath();
	ctx.moveTo(200, 350);
	ctx.lineTo(250, 320);
	ctx.lineTo(300, 350);
	ctx.closePath();
	ctx.stroke();

	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(150, 150);
	ctx.lineTo(150, 350);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(300, 120);
	ctx.lineTo(450, 180);
	ctx.stroke();

	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(180, 180);
	ctx.lineTo(180, 220);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(220, 180);
	ctx.lineTo(220, 220);
	ctx.stroke();
}

export async function floodFill(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	algo: FloodFillAlgorithm,
): Promise<FloodFillStats> {
	const imageData = ctx.getImageData(x, y, 1, 1);
	const data = imageData.data;
	const r = data[0] ?? 0;
	const g = data[1] ?? 0;
	const b = data[2] ?? 0;
	const a = data[3] ?? 0;
	const targetColor: [number, number, number, number] = [r, g, b, a];

	const colorMap: Record<FloodFillAlgorithm, [number, number, number, number]> = {
		[FloodFillAlgorithm.SIMPLE_4]: [0, 0, 255, 255],
		[FloodFillAlgorithm.SIMPLE_8]: [255, 0, 0, 255],
		[FloodFillAlgorithm.SCANLINE_4]: [0, 255, 0, 255],
		[FloodFillAlgorithm.SCANLINE_8]: [255, 255, 0, 255],
	};

	const replacementColor = colorMap[algo];

	switch (algo) {
		case FloodFillAlgorithm.SIMPLE_4:
			return await simpleFloodFillInternal(ctx, x, y, targetColor, replacementColor, 4);
		case FloodFillAlgorithm.SIMPLE_8:
			return await simpleFloodFillInternal(ctx, x, y, targetColor, replacementColor, 8);
		case FloodFillAlgorithm.SCANLINE_4:
			return await scanlineFloodFillInternal(ctx, x, y, targetColor, replacementColor, 4);
		case FloodFillAlgorithm.SCANLINE_8:
			return await scanlineFloodFillInternal(ctx, x, y, targetColor, replacementColor, 8);
	}
}
