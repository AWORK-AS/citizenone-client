<template>
    <div>
        <Modal size="sm" :title="$t('company.switchCompany.switchCompany')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div class="space-y-3">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <h3 class="text-lg text-center font-semibold">
                        {{ $t('company.switchCompany.companySwitchTitle') }}
                    </h3>
                    <p class="text-sm">
                        {{ $t('company.switchCompany.companySwitchDescription') }}
                    </p>
                    <div class="text-center">
                        <span class="dot1 text-3xl">.</span>
                        <span class="dot2 text-3xl">.</span>
                        <span class="dot3 text-3xl">.</span>
                        <span class="dot4 text-3xl">.</span>
                        <span class="dot5 text-3xl">.</span>
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { userService } from '@/components/api/user/UserService'
import { useCompanyStore } from '@/store/company'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const companyStore = useCompanyStore() as any
const emit = defineEmits(['close'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        switchCompany()
    }
})

async function switchCompany() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            company_uuid: companyStore.getSelectedCompany?.uuid
        }
        const response = await userService.switchCompany(params)
        if (response) {
            setTimeout(() => {
                window.location.reload()
            }, 3000)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>