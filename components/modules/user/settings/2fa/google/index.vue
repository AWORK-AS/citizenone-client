<template>
    <div>
        <div class="space-y-1 flex items-center gap-x-2">
            <FormSwitch :value="state.form2fa.is_google_2fa_enabled"
                @toggleSwitch="state.modal.isVerify2faOpen = true" />
            <p>
                {{ $t('2fa.google2FactorAuthentication') }}
            </p>
        </div>
        <ModulesUserSettings2faGoogleModalVerify :isModalOpen="state.modal.isVerify2faOpen" :google2fa="state.form2fa"
            @close="state.modal.isVerify2faOpen = false" @setGoogle2faStatus="setGoogle2faStatus" />
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const userStore = useUserStore() as any

const state = reactive({
    error: {} as Error,
    form2fa: {
        is_google_2fa_enabled: userStore.getUser?.is_google_2fa_enabled,
    },
    modal: {
        isVerify2faOpen: false,
    },
})

function setGoogle2faStatus(status: boolean) {
    state.form2fa.is_google_2fa_enabled = status
}
</script>