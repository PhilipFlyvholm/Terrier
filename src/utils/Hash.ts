/* 
 * Borrowed from https://github.com/sveltejs/svelte/blob/master/src/compiler/compile/utils/hash.ts
 * (which is borrowed from https://github.com/darkskyapp/string-hash/blob/master/index.js)
*/

const REGEX_RETURN_CHARACTERS = /\r/g;

export default function hash(str: string): string {
	str = str.replace(REGEX_RETURN_CHARACTERS, '');
	let hash = 5381;
    for (let i = str.length; i >= 0 ; i--) {
        hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
    }
	return (hash >>> 0).toString(36);
}