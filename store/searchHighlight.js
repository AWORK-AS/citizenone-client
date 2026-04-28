import { defineStore } from 'pinia'

export const useSearchHighlightStore = defineStore('searchHighlight', {
    state: () => ({
        uuid: null,
        term: null,
    }),
    actions: {
        set(uuid, term) {
            this.uuid = uuid
            this.term = term
        },
        clear() {
            this.uuid = null
            this.term = null
        },
    },
})
