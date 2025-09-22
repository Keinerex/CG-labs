<script setup lang="ts">
const { labId } = defineProps<{ labId: number }>();

const canvasRef = ref<HTMLCanvasElement | null>(null);

const render = ({
	1: lab1,
	2: lab2,
	3: lab3,
	4: lab4,
	5: lab5,
	6: lab6,
})[labId];

function initializeWebGL() {
	const canvas = canvasRef.value;
	if (!canvas) return;

	const gl = canvas.getContext('webgl');
	if (!gl) {
		console.error('WebGL не поддерживается в этом браузере.');
		return;
	}

	render?.(gl);
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
			<button
				class="btn btn-lg btn-soft btn-accent"
				@click="initializeWebGL"
			>
				Нарисовать
			</button>
		</div>
	</div>
</template>
