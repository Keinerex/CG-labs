<script setup lang="ts">
import lab2, { MaskType } from '~/utils/lab2';
import lab1 from '~/utils/lab1';
import lab3, { FillAlgorithm } from '~/utils/lab3';
import { floodFill, drawPlayground, FloodFillAlgorithm } from '~/utils/lab4';
import { renderClipping, ClippingAlgorithm } from '~/utils/lab5';

const { labId } = defineProps<{ labId: number }>();
const maskMode = ref<MaskType>(MaskType.ORIGINAL);
const floodFillMode = ref<FloodFillAlgorithm>(FloodFillAlgorithm.SIMPLE_4);
const clippingAlgorithm = ref<ClippingAlgorithm>(ClippingAlgorithm.COHEN_SUTHERLAND);
const clippingStats = ref<{ totalSegments: number; fullyVisible: number; fullyInvisible: number; partial: number } | null>(null);
const x0 = ref(0);
const y0 = ref(0);
const x1 = ref(0);
const y1 = ref(0);

const fillAlgorithm = ref<FillAlgorithm>(FillAlgorithm.SCANLINE);

const canvasRef = ref<HTMLCanvasElement | null>(null);

function renderCanvas() {
	const canvas = canvasRef.value;
	if (!canvas) return;

	const ctx = canvas.getContext('2d');

	if (!ctx || !canvas) return;

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (labId !== 5) {
		clippingStats.value = null;
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
			const stats = renderClipping(ctx, clippingAlgorithm.value);
			clippingStats.value = stats;
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

	if (labId !== 4) return;

	const rect = canvas.getBoundingClientRect();
	const x = e.clientX - rect.left;
	const y = e.clientY - rect.top;

	floodFill(
		ctx,
		x,
		y,
		floodFillMode.value,
	);
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
				<div class="tabs tabs-border">
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
						<div class="stat-title">Всего отрезков</div>
						<div class="stat-value text-lg">{{ clippingStats?.totalSegments ?? "N" }}</div>
					</div>
					<div class="stat">
						<div class="stat-title">Полностью видимые</div>
						<div class="stat-value text-lg text-green-600">{{ clippingStats?.fullyVisible ?? "N" }}</div>
					</div>
					<div class="stat">
						<div class="stat-title">Полностью невидимые</div>
						<div class="stat-value text-lg text-red-600">{{ clippingStats?.fullyInvisible ?? "N" }}</div>
					</div>
					<div class="stat">
						<div class="stat-title">Частично видимые</div>
						<div class="stat-value text-lg">{{ clippingStats?.partial ?? "N" }}</div>
					</div>
				</div>
			</div>
			<button
				class="btn btn-lg btn-soft btn-accent"
				@click="renderCanvas"
			>
				Нарисовать
			</button>
		</div>
	</div>
</template>
