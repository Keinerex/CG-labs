<script setup lang="ts">
const { labId } = defineProps<{ labId: number }>();
const x0 = ref(0);
const y0 = ref(0);
const x1 = ref(0);
const y1 = ref(0);

const canvasRef = ref<HTMLCanvasElement | null>(null);

function renderCanvas() {
	const canvas = canvasRef.value;
	if (!canvas) return;

	const ctx = canvas.getContext('2d');

	if (!ctx || !canvas) return;

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	switch (labId) {
		case 1:
			lab1(x0.value, y0.value, x1.value, y1.value, ctx);
			break;
	}
}
</script>

<template>
	<div class="flex-1">
		<div class="card bg-base-200 p-16 flex flex-col items-center gap-8">
			<canvas
				ref="canvasRef"
				width="600"
				height="600"
				class="border rounded-lg"
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
			<button
				class="btn btn-lg btn-soft btn-accent"
				@click="renderCanvas"
			>
				Нарисовать
			</button>
		</div>
	</div>
</template>
