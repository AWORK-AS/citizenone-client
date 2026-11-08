<template>
    <TransitionRoot as="template" :show="props.isOpen">
        <Dialog class="relative z-50" @close="emit('close')">
            <div class="fixed inset-0 bg-black/30" />

            <div class="fixed inset-0 overflow-hidden">
                <div class="absolute inset-0 overflow-hidden">
                    <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
                        <TransitionChild as="template" enter="transform transition ease-in-out duration-300"
                            enter-from="translate-x-full" enter-to="translate-x-0"
                            leave="transform transition ease-in-out duration-200" leave-from="translate-x-0"
                            leave-to="translate-x-full">
                            <DialogPanel class="pointer-events-auto w-screen max-w-[540px]">
                                <div class="flex h-full flex-col bg-white shadow-2xl">

                                    <!-- Header -->
                                    <div class="flex items-start justify-between px-6 py-5 border-b border-line">
                                        <div>
                                            <DialogTitle class="text-[16px] font-semibold text-ink">
                                                {{ $t('superadmin.users.newUser') }}
                                            </DialogTitle>
                                            <p class="text-[12px] text-ink-muted mt-0.5">
                                                {{ $t('superadmin.users.slider.createAndAttach') }}
                                            </p>
                                        </div>
                                        <button @click="emit('close')"
                                            class="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:bg-surface-canvas hover:text-ink transition-colors">
                                            <Icon name="ph:x" class="w-4 h-4" />
                                        </button>
                                    </div>

                                    <!-- Scrollable content -->
                                    <div class="flex-1 overflow-y-auto px-6 py-5">
                                        <LoadingSpinner :isActive="state.isPageLoading">
                                            <ModulesSuperadminUserForm ref="formRef" formType="create"
                                                :error="state.error" :showActions="false" :showExtendedFields="true"
                                                @isPageLoading="(value: boolean) => state.isPageLoading = value"
                                                @submitForm="saveUser" />
                                        </LoadingSpinner>
                                    </div>

                                    <!-- Footer buttons -->
                                    <div class="flex items-center gap-3 px-6 py-4 border-t border-line bg-white">
                                        <button @click="emit('close')"
                                            class="flex-1 py-2.5 rounded-lg text-sm font-medium text-ink-body bg-white border border-line hover:bg-surface-canvas transition-colors">
                                            {{ $t('cancel') }}
                                        </button>
                                        <button @click="formRef?.submit()"
                                            class="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors shadow-sm"
                                            style="background:#205E77" :disabled="state.isPageLoading">
                                            {{ $t('superadmin.users.createUser') }}
                                        </button>
                                    </div>

                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { userService } from '@/components/api/superadmin/UserService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close', 'saved'])

const { successAlert } = useAlert()
const { t } = useI18n()

const formRef = ref<any>(null)

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

watch(() => props.isOpen, (opened) => {
    if (opened) {
        state.error = {}
    }
})

async function saveUser(formData: any) {
    state.error = {} as Error
    state.isPageLoading = true
    try {
        const params: any = {
            birthday: formData.birthday || null,
            can_view_financials: formData.can_view_financials,
            email: formData.email,
            firstname: formData.firstname,
            is_active: formData.is_active,
            lastname: formData.lastname,
            phone: formData.phone || null,
            team_role: formData.team_role,
        }
        if (formData.password) params.password = formData.password
        if (formData.company_uuid) params.company_uuid = formData.company_uuid

        const response = await userService.saveUser(params)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('superadmin.users.form.alert.newUserSuccessfullySaved')}.`)
            emit('close')
            emit('saved')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
