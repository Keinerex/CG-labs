type LineSegment = {
	ax: number;
	ay: number;
	bx: number;
	by: number;
};

type ClipWindow = {
	xmin: number;
	ymin: number;
	xmax: number;
	ymax: number;
};

type ClippedLineResult = {
	visibleParts: LineSegment[];
	invisibleParts: LineSegment[];
	original: LineSegment;
};

type ClippingStats = {
	totalSegments: number;
	fullyVisible: number;
	fullyInvisible: number;
	partial: number;
};

export enum ClippingAlgorithm {
	COHEN_SUTHERLAND = 'cohen_sutherland',
	LIANG_BARSKY = 'liang_barsky',
}

function drawLine(ctx: CanvasRenderingContext2D, line: LineSegment): void {
	ctx.beginPath();
	ctx.moveTo(line.ax, line.ay);
	ctx.lineTo(line.bx, line.by);
	ctx.stroke();
}

function drawRect(ctx: CanvasRenderingContext2D, rect: ClipWindow): void {
	const { xmin, ymin, xmax, ymax } = rect;
	ctx.beginPath();
	ctx.moveTo(xmin, ymin);
	ctx.lineTo(xmax, ymin);
	ctx.lineTo(xmax, ymax);
	ctx.lineTo(xmin, ymax);
	ctx.closePath();
	ctx.stroke();
}

function cohenSutherlandClip(line: LineSegment, window: ClipWindow): ClippedLineResult {
	const INSIDE = 0;
	const LEFT = 1;
	const RIGHT = 2;
	const BOTTOM = 4;
	const TOP = 8;

	function computeOutCode(x: number, y: number): number {
		let code = INSIDE;
		if (x < window.xmin) code |= LEFT;
		else if (x > window.xmax) code |= RIGHT;
		if (y < window.ymin) code |= BOTTOM;
		else if (y > window.ymax) code |= TOP;
		return code;
	}

	let x0 = line.ax;
	let y0 = line.ay;
	let x1 = line.bx;
	let y1 = line.by;

	let outCode0 = computeOutCode(x0, y0);
	let outCode1 = computeOutCode(x1, y1);
	let accept = false;

	while (true) {
		if (!(outCode0 | outCode1)) {
			accept = true;
			break;
		}
		if (outCode0 & outCode1) {
			break;
		}

		const outCodeOut = outCode0 ? outCode0 : outCode1;
		let x = 0;
		let y = 0;

		if (outCodeOut & TOP) {
			x = x0 + (x1 - x0) * (window.ymax - y0) / (y1 - y0);
			y = window.ymax;
		}
		else if (outCodeOut & BOTTOM) {
			x = x0 + (x1 - x0) * (window.ymin - y0) / (y1 - y0);
			y = window.ymin;
		}
		else if (outCodeOut & RIGHT) {
			y = y0 + (y1 - y0) * (window.xmax - x0) / (x1 - x0);
			x = window.xmax;
		}
		else if (outCodeOut & LEFT) {
			y = y0 + (y1 - y0) * (window.xmin - x0) / (x1 - x0);
			x = window.xmin;
		}

		if (outCodeOut === outCode0) {
			x0 = x;
			y0 = y;
			outCode0 = computeOutCode(x0, y0);
		}
		else {
			x1 = x;
			y1 = y;
			outCode1 = computeOutCode(x1, y1);
		}
	}

	const original: LineSegment = { ax: line.ax, ay: line.ay, bx: line.bx, by: line.by };

	if (!accept) {
		return {
			original,
			visibleParts: [],
			invisibleParts: [original],
		};
	}

	const clipped: LineSegment = { ax: x0, ay: y0, bx: x1, by: y1 };

	const invisibleParts: LineSegment[] = [];
	if (x0 !== line.ax || y0 !== line.ay) {
		invisibleParts.push({ ax: line.ax, ay: line.ay, bx: x0, by: y0 });
	}
	if (x1 !== line.bx || y1 !== line.by) {
		invisibleParts.push({ ax: x1, ay: y1, bx: line.bx, by: line.by });
	}

	return {
		original,
		visibleParts: [clipped],
		invisibleParts,
	};
}

function liangBarskyClip(line: LineSegment, window: ClipWindow): ClippedLineResult {
	const x0 = line.ax;
	const y0 = line.ay;
	const x1 = line.bx;
	const y1 = line.by;

	const dx = x1 - x0;
	const dy = y1 - y0;

	let t0 = 0;
	let t1 = 1;

	function clipTest(p: number, q: number): boolean {
		if (p === 0) {
			return q >= 0;
		}
		const r = q / p;
		if (p < 0) {
			if (r > t1) return false;
			if (r > t0) t0 = r;
		}
		else if (p > 0) {
			if (r < t0) return false;
			if (r < t1) t1 = r;
		}
		return true;
	}

	if (
		clipTest(-dx, x0 - window.xmin)
		&& clipTest(dx, window.xmax - x0)
		&& clipTest(-dy, y0 - window.ymin)
		&& clipTest(dy, window.ymax - y0)
	) {
		const nx0 = x0 + t0 * dx;
		const ny0 = y0 + t0 * dy;
		const nx1 = x0 + t1 * dx;
		const ny1 = y0 + t1 * dy;

		const visible: LineSegment = { ax: nx0, ay: ny0, bx: nx1, by: ny1 };
		const original: LineSegment = { ax: line.ax, ay: line.ay, bx: line.bx, by: line.by };
		const invisibleParts: LineSegment[] = [];

		if (t0 > 0) {
			invisibleParts.push({ ax: line.ax, ay: line.ay, bx: nx0, by: ny0 });
		}
		if (t1 < 1) {
			invisibleParts.push({ ax: nx1, ay: ny1, bx: line.bx, by: line.by });
		}

		return {
			original,
			visibleParts: [visible],
			invisibleParts,
		};
	}

	return {
		original: { ax: line.ax, ay: line.ay, bx: line.bx, by: line.by },
		visibleParts: [],
		invisibleParts: [
			{ ax: line.ax, ay: line.ay, bx: line.bx, by: line.by },
		],
	};
}

function exampleLines(window: ClipWindow): LineSegment[] {
	const cy = (window.ymin + window.ymax) / 2;
	const w = window.xmax - window.xmin;
	const h = window.ymax - window.ymin;

	return [
		// Частично видимый (пересекающий окно)
		{ ax: window.xmin - w * 0.5, ay: cy, bx: window.xmax + w * 0.5, by: cy },
		// Полностью видимый
		{ ax: window.xmin + w * 0.1, ay: window.ymin + h * 0.1, bx: window.xmax - w * 0.1, by: window.ymax - h * 0.1 },
		// Полностью невидимый
		{ ax: window.xmin - w * 0.3, ay: window.ymin - h * 0.3, bx: window.xmin - w * 0.1, by: window.ymin - h * 0.1 },
	];
}

export function renderClipping(
	ctx: CanvasRenderingContext2D,
	algorithm: ClippingAlgorithm,
): ClippingStats {
	const canvas = ctx.canvas;
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = 'white';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	const margin = 80;
	const windowRect: ClipWindow = {
		xmin: margin,
		ymin: margin,
		xmax: canvas.width - margin,
		ymax: canvas.height - margin,
	};

	const lines = exampleLines(windowRect);

	let results: ClippedLineResult[];
	if (algorithm === ClippingAlgorithm.LIANG_BARSKY) {
		results = lines.map(line => liangBarskyClip(line, windowRect));
	}
	else {
		results = lines.map(line => cohenSutherlandClip(line, windowRect));
	}

	ctx.lineWidth = 2;
	ctx.strokeStyle = 'black';
	drawRect(ctx, windowRect);

	ctx.lineWidth = 1;
	ctx.strokeStyle = '#999999';
	for (const r of results) {
		drawLine(ctx, r.original);
	}

	ctx.lineWidth = 3;
	ctx.strokeStyle = 'red';
	for (const r of results) {
		for (const seg of r.invisibleParts) {
			drawLine(ctx, seg);
		}
	}

	ctx.lineWidth = 3;
	ctx.strokeStyle = 'green';
	for (const r of results) {
		for (const seg of r.visibleParts) {
			drawLine(ctx, seg);
		}
	}

	let fullyVisible = 0;
	let fullyInvisible = 0;
	let partial = 0;

	for (const r of results) {
		if (r.visibleParts.length === 0) {
			fullyInvisible++;
		}
		else if (r.invisibleParts.length === 0) {
			fullyVisible++;
		}
		else {
			partial++;
		}
	}

	return {
		totalSegments: results.length,
		fullyVisible,
		fullyInvisible,
		partial,
	};
}

// Оставляем дефолтный экспорт для совместимости: по умолчанию используем Коэн–Сазерленда
export default function render(ctx: CanvasRenderingContext2D): void {
	renderClipping(ctx, ClippingAlgorithm.COHEN_SUTHERLAND);
}
