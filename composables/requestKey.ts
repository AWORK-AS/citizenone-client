// The key BaseAPIService uses to merge identical requests that are in flight at the same time.
// Pure, for node --test.
//
// JSON.stringify turns a FormData (or a Blob) into "{}", so before 2026-10-19 two different
// uploads to the same endpoint shared one key: the second paste of an image into a journal note,
// or a second file dropped into chat, got the first upload's response and was never sent.
// A body that cannot be compared is never merged.

export function requestKey(method: string, url: string, params: unknown): string | null {
    if (typeof FormData !== 'undefined' && params instanceof FormData) return null
    if (typeof Blob !== 'undefined' && params instanceof Blob) return null

    return `${method}:${url}:${JSON.stringify(params)}`
}
