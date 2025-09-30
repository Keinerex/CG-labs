export enum MaskType {
	ORIGINAL = 'o',
	UNIFORM_2X2 = 'u2',
	UNIFORM_4X4 = 'u4',
	WEIGHTED_3X3 = 'w3',
	WEIGHTED_5X5 = 'w5',
}

const masks: Record<Exclude<MaskType, MaskType.ORIGINAL>, number[][]> = {
	[MaskType.UNIFORM_2X2]: [
		[1 / 4, 1 / 4],
		[1 / 4, 1 / 4],
	],
	[MaskType.UNIFORM_4X4]: [
		[1 / 16, 1 / 16, 1 / 16, 1 / 16],
		[1 / 16, 1 / 16, 1 / 16, 1 / 16],
		[1 / 16, 1 / 16, 1 / 16, 1 / 16],
		[1 / 16, 1 / 16, 1 / 16, 1 / 16],
	],
	[MaskType.WEIGHTED_3X3]: [
		[1 / 16, 2 / 16, 1 / 16],
		[2 / 16, 4 / 16, 2 / 16],
		[1 / 16, 2 / 16, 1 / 16],
	],
	[MaskType.WEIGHTED_5X5]: [
		[1 / 25, 2 / 25, 3 / 25, 2 / 25, 1 / 25],
		[2 / 25, 4 / 25, 6 / 25, 4 / 25, 2 / 25],
		[3 / 25, 6 / 25, 9 / 25, 6 / 25, 3 / 25],
		[2 / 25, 4 / 25, 6 / 25, 4 / 25, 2 / 25],
		[1 / 25, 2 / 25, 3 / 25, 2 / 25, 1 / 25],
	],
};

export default function render(
	ctx: CanvasRenderingContext2D,
	maskType: MaskType = MaskType.ORIGINAL,
) {
	const { width, height } = ctx.canvas;

	function generateTestImage(): ImageData {
		const img = ctx.createImageData(width, height);
		const d = img.data;
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const i = (y * width + x) * 4;
				if (x < width / 3) {
					const g = Math.floor((x / (width / 3)) * 255);
					d[i] = d[i + 1] = d[i + 2] = g;
				}
				else if (x < 2 * width / 3) {
					const size = 20;
					const c = ((Math.floor(x / size) + Math.floor(y / size)) % 2) ? 0 : 255;
					d[i] = d[i + 1] = d[i + 2] = c;
				}
				else {
					const stripeWidth = 5;
					const c = (Math.floor(x / stripeWidth) % 2) ? 64 : 192;
					d[i] = d[i + 1] = d[i + 2] = c;
				}
				d[i + 3] = 255;
			}
		}
		return img;
	}

	function applyMask(img: ImageData, mask: number[][]): ImageData {
		const src = img.data;
		const dst = new Uint8ClampedArray(src);

		const mh = mask.length;
		const mw = mask[0]!.length;

		const oy = Math.floor(mh / 2), ox = Math.floor(mw / 2);

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				let r = 0, g = 0, b = 0;
				for (let my = 0; my < mh; my++) {
					for (let mx = 0; mx < mw; mx++) {
						const sy = y + my - oy, sx = x + mx - ox;
						if (sy >= 0 && sy < height && sx >= 0 && sx < width) {
							const si = (sy * width + sx) * 4;
							const w = mask[my]![mx]!;
							r += src[si]! * w;
							g += src[si + 1]! * w;
							b += src[si + 2]! * w;
						}
					}
				}
				const di = (y * width + x) * 4;
				dst[di] = Math.max(0, Math.min(255, Math.round(r)));
				dst[di + 1] = Math.max(0, Math.min(255, Math.round(g)));
				dst[di + 2] = Math.max(0, Math.min(255, Math.round(b)));
			}
		}
		return new ImageData(dst, width, height);
	}

	const origin = generateTestImage();

	if (maskType === MaskType.ORIGINAL) {
		ctx.putImageData(origin, 0, 0);
		return;
	}

	const mask = masks[maskType];
	const filtered = applyMask(origin, mask);
	ctx.putImageData(filtered, 0, 0);
}
