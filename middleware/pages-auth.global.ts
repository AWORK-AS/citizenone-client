import { useUserStore } from '@/store/user'

export default defineNuxtRouteMiddleware((to) => {
    const userStore = useUserStore()
    
    if (to.path.startsWith('/schedules')) {
        if (!hasPageAccess("Duty Schedule", userStore.getUser)) {
            return navigateTo('/overview')
        }
    }
})

function hasPageAccess(pageName: string, user: any) {
    return user.pages?.some((page: any) => page.name === pageName)
}