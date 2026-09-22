import { defineStore } from 'pinia'

// Populated by layouts/user.vue's generateSidebarLinks() every time it runs, with
// the nav items this user is currently eligible to see (before their own
// show/hide preferences are applied) - so the sidebar-customization settings page
// can list exactly what's available to THIS user without duplicating the ~250
// lines of company-module/role/permission/industry eligibility checks.
export const useSidebarNavStore = defineStore('sidebarNavStore', {
    state: () => ({
        eligibleItems: [],
    }),
    actions: {
        setEligibleItems(items) {
            this.eligibleItems = items
        },
    },
})
