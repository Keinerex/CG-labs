import type { PromiseLabContent } from '~/types/api';

export default defineEventHandler<PromiseLabContent>(async (event) => {
	const labId = getRouterParam(event, 'id');
	const data = await useStorage('assets:labs').getItem<string>(`lab${labId}.ts`);

	console.log(data);

	if (!data) {
		return {
			content: [],
		};
	}

	return {
		content: data.split('\n').filter(Boolean).slice(1, -1).map((item: string) => item.slice(1)) ?? [],
	};
});
