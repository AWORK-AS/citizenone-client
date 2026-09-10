import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Builds the standalone embeddable widget (widget/main.ts) separately from
 * the main Nuxt app. Deliberately its own Vite config, not part of `nuxt
 * build`: the widget has to ship as one small, dependency-light script a
 * customer pastes into an arbitrary site, not as a chunk of the full Nuxt
 * client bundle. Output goes to public/widget.js so Nuxt serves it as a
 * static file at /widget.js, matching the embed snippet generated in
 * pages/calendar/bookings/settings.vue.
 */
export default defineConfig({
    plugins: [vue()],
    // A plain <script> in a customer's browser has no `process` global - Vue's
    // runtime checks process.env.NODE_ENV internally, and a normal Nuxt/Vite
    // app build gets this replaced for free. A standalone lib build does not,
    // so without this the widget throws "process is not defined" the instant
    // it loads, before anything else runs.
    define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
    },
    // outDir below IS the Nuxt public/ dir on purpose (that's how widget.js
    // ends up served at /widget.js) - turn off Vite's own publicDir copying
    // so it doesn't try to treat that same folder as a source to copy from.
    publicDir: false,
    resolve: {
        alias: {
            '@': resolve(__dirname, '.'),
        },
    },
    build: {
        outDir: resolve(__dirname, 'public'),
        emptyOutDir: false,
        cssCodeSplit: false,
        lib: {
            entry: resolve(__dirname, 'widget/main.ts'),
            name: 'CitizenOneBookingWidget',
            formats: ['iife'],
            fileName: () => 'widget.js',
        },
        rollupOptions: {
            output: {
                // A customer's page loads this as a plain <script>, not a
                // module - no externals, everything (including Vue) bundles
                // in so the widget has zero dependency on the host site.
                inlineDynamicImports: true,
            },
        },
    },
})
