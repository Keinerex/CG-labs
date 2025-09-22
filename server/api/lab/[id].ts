import type { PromiseLabContent } from '~/types/api';

export default defineEventHandler<PromiseLabContent>(async (event) => {
	const labId = getRouterParam(event, 'id');
	const stored = await useStorage('assets:labs').getItem<Uint8Array>(`lab${labId}.ts`);
	const data = stored instanceof Uint8Array ? new TextDecoder().decode(stored) : stored;

	if (!data) {
		return {
			content: [],
		};
	}

	return {
		content: data.split('\n').filter(Boolean).slice(1, -1).map((item: string) => item.slice(1)) ?? [],
	};
});
