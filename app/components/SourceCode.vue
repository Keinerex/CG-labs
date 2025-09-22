<script setup lang="ts">
import type { LabContent } from '~/types/api';

const { labId } = defineProps<{ labId: number }>();

const { data: { value } } = await useFetch<LabContent>(`/api/lab/${labId}`);

const content = value?.content ?? ['Код не найден'];
</script>

<template>
	<div
		class="mockup-code w-full"
	>
		<pre
			v-for="(row, index) in content"
			:key="row"
			:data-prefix="index"
		><code>{{ row }}</code></pre>
	</div>
</template>
