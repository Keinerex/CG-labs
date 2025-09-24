<script setup lang="ts">
import type { LabContent } from '~/types/api';

const { labId } = defineProps<{ labId: number }>();

const { data: { value } } = await useFetch<LabContent>(`/api/lab/${labId}`);

const content = value?.content ?? 'Код не найден';
</script>

<template>
	<div
		class="mockup-code w-full bg-base-200"
		v-html="content"
	/>
</template>
