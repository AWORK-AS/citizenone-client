import { defineStore } from 'pinia'
import { customSidebarLinkService } from '@/components/api/user/CustomSidebarLinkService'

export const useCustomSidebarLinksStore = defineStore('customSidebarLinksStore', {
    state: () => ({
        links: [],
    }),
    actions: {
        async fetchLinks() {
            try {
                const response = await customSidebarLinkService.getSidebarList()
                this.links = response?.data ?? []
            } catch (error) {
                // Non-fatal: the sidebar still renders the standard links.
            }
        },
    },
})
