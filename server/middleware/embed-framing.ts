/**
 * Lets another website put the embedded duty schedule in an <iframe>.
 *
 * Every route gets X-Frame-Options: SAMEORIGIN from the route rules in
 * nuxt.config.ts, and a route rule can only add or override headers, never
 * remove one. Nitro applies route rules before server middleware, so the
 * header is already set by the time this runs and can be taken off again here,
 * for the embed route only.
 */
export default defineEventHandler((event) => {
    if (event.path.startsWith('/embed/duty-schedules/')) {
        removeResponseHeader(event, 'X-Frame-Options')
    }
})
