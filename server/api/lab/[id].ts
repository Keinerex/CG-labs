import type { PromiseLabContent } from '~/types/api';
import { highlighter } from '~~/server/utils/highlighter';

export default defineEventHandler<PromiseLabContent>(async (event) => {
	const labId = getRouterParam(event, 'id');
	const stored = await useStorage('assets:labs').getItem<Uint8Array>(`lab${labId}.ts`);
	const data = stored instanceof Uint8Array ? new TextDecoder().decode(stored) : stored;

	if (!data) {
		return {
			content: null,
		};
	}
	return {
		content: highlighter.codeToHtml(data, {
			lang: 'typescript',
			theme: 'css-variables',
			transformers: [
				{
					pre(hast) {
						this.addClassToHast(hast, 'ml-5');
					},
				},
			],
		}),
	};
});
