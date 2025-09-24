import ts from '@shikijs/langs/typescript';
import { createCssVariablesTheme, createHighlighterCoreSync } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

// Create a custom CSS variables theme, the following are the default values
const myTheme = createCssVariablesTheme({
	name: 'css-variables',
	variablePrefix: '--shiki-',
	variableDefaults: {},
	fontStyle: true,
});

export const highlighter = createHighlighterCoreSync({
	langs: [ts],
	themes: [myTheme],
	engine: createJavaScriptRegexEngine(),
});
