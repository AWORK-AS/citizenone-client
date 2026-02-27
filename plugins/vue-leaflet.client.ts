import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import type { Plugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  // run only on client
  if (process.client) {
    // expose L globally for libraries that expect window.L
    ;(window as any).L = L

    // Fix default icon URLs for many bundlers
    try {
      delete (L.Icon.Default as any).prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl,
        iconUrl,
        shadowUrl,
      })
    } catch (err) {
      // no-op
    }

    // Register @vue-leaflet components globally so templates can use <LMap>, <LTileLayer>, <LMarker>, <LPopup>
    nuxtApp.vueApp.component('LMap', LMap)
    nuxtApp.vueApp.component('LTileLayer', LTileLayer)
    nuxtApp.vueApp.component('LMarker', LMarker)
    nuxtApp.vueApp.component('LPopup', LPopup) // <-- ADD THIS LINE
  }
}) as Plugin