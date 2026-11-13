/**
 * For the few server routes that answer with a small HTML page (OAuth
 * callbacks). Anything taken from the query string or from an upstream error
 * is attacker-controlled, and these pages are served on the app's own origin,
 * where the session token sits in localStorage.
 */

/** Text placed between tags. */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * A complete JavaScript string literal, quotes included, safe inside an
 * inline <script>. JSON.stringify alone leaves "</script>" intact, which ends
 * the script block whatever the quoting, so "<", ">" and "&" are escaped too,
 * along with the two line separators that are legal in JSON but not in older JS.
 */
export function jsStringLiteral(value: unknown): string {
  return JSON.stringify(String(value ?? ''))
    .replace(/</g, '\\u003C')
    .replace(/>/g, '\\u003E')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}
