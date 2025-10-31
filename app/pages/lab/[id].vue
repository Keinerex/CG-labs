<script setup lang="ts">
import * as z from 'zod';

const paramsSchema = z.object({
	id: z.coerce.number().int().gte(1).lte(6),
});

definePageMeta({
	validate: async (route) => {
		try {
			paramsSchema.parse(route.params);
			return true;
		}
		catch (error) {
			if (error instanceof z.ZodError) {
				throw createError({
					statusCode: 400,
					statusMessage: `Неверный номер лабораторной работы: ${route.params.id}`,
					data: error.issues,
				});
			}
			throw createError({
				statusCode: 500,
				statusMessage: 'Неизвестная ошибка',
			});
		}
	},
});

const route = useRoute();

const labId = paramsSchema.parse(route.params).id as number;

const reportLink = `/Report-${labId}.pdf`;
</script>

<template>
	<div class="flex justify-center">
		<div class="flex flex-col items-center gap-8">
			<div class="prose">
				<h1 v-if="labId !== 6">
					Лабораторная работа номер {{ labId }}
				</h1>
				<h1 v-if="labId === 6">
					Расчетно-графическая работа
				</h1>
			</div>
			<RenderCanvas :lab-id="labId" />
			<div class="divider text-2xl">
				<a
					class="link"
					target="_blank"
					referrerpolicy="no-referrer"
					:href="reportLink"
				>Report</a>
			</div>
			<SourceCode :lab-id="labId" />
		</div>
	</div>
</template>
