<script setup lang="ts">
import lab2, { MaskType } from '~/utils/lab2';
import lab1 from '~/utils/lab1';
import lab3, { FillAlgorithm } from '~/utils/lab3';
import { floodFill, drawPlayground, FloodFillAlgorithm } from '~/utils/lab4';
import {
	ClippingAlgorithm,
	ClipWindow,
	LineSegment,
	clipSegments,
	drawClippingWindow,
} from '~/utils/lab5';

const { labId } = defineProps<{ labId: number }>();

const maskMode = ref<MaskType>(MaskType.ORIGINAL);
const floodFillMode = ref<FloodFillAlgorithm>(FloodFillAlgorithm.SIMPLE_4);
const clippingAlgorithm = ref<ClippingAlgorithm>(ClippingAlgorithm.COHEN_SUTHERLAND);
const clippingStats = ref<{ totalSegments: number; fullyVisible: number; fullyInvisible: number; partial: number } | null>(null);
const clippingWindow = ref<ClipWindow | null>(null);
const clippingSegments = ref<LineSegment[]>([]);
const isWaitingSecondPoint = ref(false);
const tempFirstPoint = ref<{ x: number; y: number } | null>(null);

const x0 = ref(0);
const y0 = ref(0);
const x1 = ref(0);
const y1 = ref(0);

const fillAlgorithm = ref<FillAlgorithm>(FillAlgorithm.SCANLINE);

const canvasRef = ref<HTMLCanvasElement | null>(null);

function applyClipping() {
	const canvas = canvasRef.value;
	if (!canvas || !clippingWindow.value) return;

	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	clippingStats.value = clipSegments(
		ctx,
		clippingWindow.value,
		clippingSegments.value,
		clippingAlgorithm.value,
	);
}

function renderCanvas() {
	const canvas = canvasRef.value;
	if (!canvas) return;

	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (labId !== 5) {
		clippingStats.value = null;
		clippingWindow.value = null;
		clippingSegments.value = [];
		isWaitingSecondPoint.value = false;
		tempFirstPoint.value = null;
	}

	switch (labId) {
		case 1:
			lab1(x0.value, y0.value, x1.value, y1.value, ctx);
			break;
		case 2:
			lab2(ctx, maskMode.value);
			break;
		case 3:
			lab3(ctx, fillAlgorithm.value);
			break;
		case 4:
			drawPlayground(ctx);
			break;
		case 5: {
			// для lab5 по кнопке «Нарисовать» рисуем рамку и подготавливаем состояние
			const win = drawClippingWindow(ctx);
			clippingWindow.value = win;
			clippingSegments.value = [];
			clippingStats.value = null;
			isWaitingSecondPoint.value = false;
			tempFirstPoint.value = null;
			break;
		}
	}
}

function handleCanvasClick(e: MouseEvent) {
	const canvas = canvasRef.value;
	if (!canvas) return;

	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	ctx.imageSmoothingEnabled = false;

	if (labId === 4) {
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		floodFill(
			ctx,
			x,
			y,
			floodFillMode.value,
		);
		return;
	}

	if (labId === 5 && clippingWindow.value) {
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		if (!isWaitingSecondPoint.value) {
			// первая точка отрезка
			tempFirstPoint.value = { x, y };
			isWaitingSecondPoint.value = true;
		}
		else if (tempFirstPoint.value) {
			// вторая точка — добавляем отрезок
			const seg: LineSegment = {
				ax: tempFirstPoint.value.x,
				ay: tempFirstPoint.value.y,
				bx: x,
				by: y,
			};
			clippingSegments.value.push(seg);

			// перерисовываем: рамка + все введённые отрезки (серым)
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = 'white';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.lineWidth = 2;
			ctx.strokeStyle = 'black';
			if (clippingWindow.value) {
				drawRect(ctx, clippingWindow.value);
			}
			ctx.lineWidth = 2;
			ctx.strokeStyle = '#666666';
			for (const l of clippingSegments.value) {
				drawLine(ctx, l);
			}

			isWaitingSecondPoint.value = false;
			tempFirstPoint.value = null;
		}
	}
}
</script>

<template>
	<div class="flex-1">
		<div class="card bg-base-200 p-16 flex flex-col items-center gap-8">
			<canvas
				ref="canvasRef"
				style="image-rendering: pixelated;"
				width="600"
				height="600"
				class="border rounded-lg"
				@click="handleCanvasClick"
			/>
			<div
				v-if="labId === 1"
				class="w-full flex flex-row gap-4"
			>
				<div class="flex-1 flex flex-col gap-4">
					<label class="input validator">
						<span class="label">X начала</span>
						<input
							v-model.number="x0"
							type="number"
							class=""
							required
							min="0"
							:max="canvasRef?.width"
						>
					</label>
					<label class="input validator">
						<span class="label">Y начала</span>
						<input
							v-model.number="y0"
							type="number"
							class=""
							required
							min="0"
							:max="canvasRef?.height"
						>
					</label>
				</div>
				<div class="flex-1 flex flex-col gap-4">
					<label class="input validator">
						<span class="label">X конца</span>
						<input
							v-model.number="x1"
							type="number"
							class=""
							required
							min="0"
							:max="canvasRef?.width"
						>
					</label>
					<label class="input validator">
						<span class="label">Y конца</span>
						<input
							v-model.number="y1"
							type="number"
							class=""
							required
							min="0"
							:max="canvasRef?.height"
						>
					</label>
				</div>
			</div>
			<div
				v-if="labId === 2"
				class="tabs tabs-border"
			>
				<input
					:id="MaskType.ORIGINAL"
					v-model="maskMode"
					:value="MaskType.ORIGINAL"
					type="radio"
					class="tab"
					aria-label="Оригинал"
				>
				<input
					:id="MaskType.UNIFORM_2X2"
					v-model="maskMode"
					:value="MaskType.UNIFORM_2X2"
					type="radio"
					class="tab"
					aria-label="Усреднение 2x2"
				>
				<input
					:id="MaskType.UNIFORM_4X4"
					v-model="maskMode"
					:value="MaskType.UNIFORM_4X4"
					type="radio"
					class="tab"
					aria-label="Усреднение 4x4"
				>
				<input
					:id="MaskType.WEIGHTED_3X3"
					v-model="maskMode"
					:value="MaskType.WEIGHTED_3X3"
					type="radio"
					class="tab"
					aria-label="Взвешенная 3x3"
				>
				<input
					:id="MaskType.WEIGHTED_5X5"
					v-model="maskMode"
					:value="MaskType.WEIGHTED_5X5"
					type="radio"
					class="tab"
					aria-label="Взвешенная 5x5"
				>
			</div>
			<div
				v-if="labId === 3"
				class="tabs tabs-border"
			>
				<input
					id="scanline"
					v-model="fillAlgorithm"
					:value="FillAlgorithm.SCANLINE"
					type="radio"
					class="tab"
					aria-label="Scanline"
				>
				<input
					id="edge"
					v-model="fillAlgorithm"
					:value="FillAlgorithm.EDGE"
					type="radio"
					class="tab"
					aria-label="Edge table"
				>
			</div>
			<div
				v-if="labId === 4"
				class="tabs tabs-border"
			>
				<input
					:id="FloodFillAlgorithm.SIMPLE_4"
					v-model="floodFillMode"
					:value="FloodFillAlgorithm.SIMPLE_4"
					type="radio"
					class="tab"
					aria-label="Простой 4x"
				>
				<input
					:id="FloodFillAlgorithm.SIMPLE_8"
					v-model="floodFillMode"
					:value="FloodFillAlgorithm.SIMPLE_8"
					type="radio"
					class="tab"
					aria-label="Простой 8x"
				>
				<input
					:id="FloodFillAlgorithm.SCANLINE_4"
					v-model="floodFillMode"
					:value="FloodFillAlgorithm.SCANLINE_4"
					type="radio"
					class="tab"
					aria-label="Построчный 4x"
				>
				<input
					:id="FloodFillAlgorithm.SCANLINE_8"
					v-model="floodFillMode"
					:value="FloodFillAlgorithm.SCANLINE_8"
					type="radio"
					class="tab"
					aria-label="Построчный 8x"
				>
			</div>
			<div
				v-if="labId === 5"
				class="w-full flex flex-col gap-4"
			>
				<div class="tabs tabs-border m-auto">
					<input
						:id="ClippingAlgorithm.COHEN_SUTHERLAND"
						v-model="clippingAlgorithm"
						:value="ClippingAlgorithm.COHEN_SUTHERLAND"
						type="radio"
						class="tab"
						aria-label="Коэн–Сазерленд"
					>
					<input
						:id="ClippingAlgorithm.LIANG_BARSKY"
						v-model="clippingAlgorithm"
						:value="ClippingAlgorithm.LIANG_BARSKY"
						type="radio"
						class="tab"
						aria-label="Лян–Барски (Кирус–Бек)"
					>
				</div>
				<div
					v-if="labId === 5"
					class="stats bg-base-100 shadow w-full"
				>
					<div class="stat">
						<div class="stat-title">
							Всего отрезков
						</div>
						<div class="stat-value text-lg">
							{{ clippingStats?.totalSegments }}
						</div>
					</div>
					<div class="stat">
						<div class="stat-title">
							Полностью видимые
						</div>
						<div class="stat-value text-lg text-green-600">
							{{ clippingStats?.fullyVisible }}
						</div>
					</div>
					<div class="stat">
						<div class="stat-title">
							Полностью невидимые
						</div>
						<div class="stat-value text-lg text-red-600">
							{{ clippingStats?.fullyInvisible }}
						</div>
					</div>
					<div class="stat">
						<div class="stat-title">
							Частично видимые
						</div>
						<div class="stat-value text-lg">
							{{ clippingStats?.partial }}
						</div>
					</div>
				</div>
			</div>
			<div class="flex flex-row gap-2 ">
        <button
            class="btn btn-lg btn-soft btn-accent"
            @click="renderCanvas"
        >
          Нарисовать
        </button>
        <button
            v-if="labId === 5"
            class="btn btn-lg btn-soft btn-accent"
            @click="applyClipping"
        >
          Обрезать
        </button>
      </div>
		</div>
	</div>
</template>
