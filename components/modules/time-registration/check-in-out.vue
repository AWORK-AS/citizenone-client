<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <div
            class="mb-2 flex items-center justify-between gap-x-2 border-b border-t py-4 px-2 border-tertiary-25 border-dashed">
            <p class="text-sm text-white">
                {{ userStore.getIsLoggedIn ? 'Checked in' : 'Check out' }}
            </p>
            <div>
                <FormSwitch :value="userStore.getIsLoggedIn" @toggleSwitch="toggleLogin" />
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { userService } from '@/components/api/UserService'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const state = reactive({
    error: [],
    isPageLoading: false,
})

async function toggleLogin() {
    state.isPageLoading = true
    try {
        let response = null
        if (!userStore.getIsLoggedIn) {
            response = await userService.checkin()
        } else {
            response = await userService.checkout()
        }
        if (response?.data) {
            userStore.setIsLoggedIn(!userStore.getIsLoggedIn)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>