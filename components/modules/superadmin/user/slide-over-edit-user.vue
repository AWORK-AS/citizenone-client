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
                                                {{ $t('superadmin.users.editUser') }}
                                            </DialogTitle>
                                            <p class="text-[12px] text-ink-muted mt-0.5">
                                                {{ state.user?.firstname }} {{ state.user?.lastname }}
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
                                            <ModulesSuperadminUserForm ref="formRef" formType="update"
                                                :selectedUser="state.user" :error="state.error" :showActions="false"
                                                :showExtendedFields="true"
                                                @isPageLoading="(value: boolean) => state.isPageLoading = value"
                                                @submitForm="updateUser" />

                                            <!-- 2FA: status for everyone who can open this, reset for team managers. -->
                                            <section v-if="state.user"
                                                class="mt-6 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4 space-y-3">
                                                <div class="flex items-center justify-between gap-3">
                                                    <h3 class="text-[13px] font-semibold text-[#1a2332]">
                                                        {{ $t('superadmin.twoFactor.sectionTitle') }}
                                                    </h3>
                                                    <ModulesSuperadminTwoFactorStatusBadge :user="state.user" />
                                                </div>
                                                <template v-if="canManageTeam && state.user?.is_google_2fa_enabled">
                                                    <p v-if="isSelf" class="text-xs text-[#64748b]">
                                                        {{ $t('superadmin.twoFactor.resetOwn') }}
                                                    </p>
                                                    <template v-else>
                                                        <p class="text-xs text-[#64748b]">
                                                            {{ $t('superadmin.twoFactor.resetHelp') }}
                                                        </p>
                                                        <button type="button" @click="state.isResetOpen = true"
                                                            class="inline-flex items-center gap-1.5 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs font-semibold text-[#dc2626] hover:bg-[#fee2e2] transition-colors">
                                                            <Icon name="ph:arrow-counter-clockwise" class="w-3.5 h-3.5" />
                                                            {{ $t('superadmin.twoFactor.resetButton') }}
                                                        </button>
                                                    </template>
                                                </template>
                                            </section>
                                        </LoadingSpinner>
                                            <!-- Inside the panel: a dialog outside it would be made inert by this one. -->
                                            <DialogConfirmation :isModalOpen="state.isResetOpen"
                                                :message="$t('superadmin.twoFactor.resetConfirm', { name: `${state.user?.firstname ?? ''} ${state.user?.lastname ?? ''}`.trim() })"
                                                :confirmLabel="$t('superadmin.twoFactor.resetButton')"
                                                @close="state.isResetOpen = false" @confirm="resetTwoFactor" />
                                    </div>

                                    <!-- Footer buttons -->
                                    <div class="flex items-center gap-3 px-6 py-4 border-t border-line bg-white">
                                        <button @click="emit('close')"
                                            class="flex-1 py-2.5 rounded-lg text-sm font-medium text-ink-body bg-white border border-line hover:bg-surface-canvas transition-colors">
                                            {{ $t('cancel') }}
                                        </button>
                                        <button @click="formRef?.submit()"
                                            class="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors shadow-sm bg-tertiary"
                                            :disabled="state.isPageLoading">
                                            {{ $t('update') }}
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
import { canResetTwoFactor } from '@/composables/staffTwoFactor'
import { useUserStore } from '@/store/user'

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
    },
    userUuid: {
        type: String,
        default: null,
    },
})

const emit = defineEmits(['close', 'saved'])

const { successAlert } = useAlert()
const { t } = useI18n()

const formRef = ref<any>(null)

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    isResetOpen: false,
    user: null as any,
})

const { can } = usePermissions()
const userStore = useUserStore() as any
const canManageTeam = computed(() => can('manage_team'))
const isSelf = computed(() => !!state.user && state.user.uuid === userStore.getUser?.uuid)

async function resetTwoFactor() {
    state.isResetOpen = false
    if (!canResetTwoFactor(userStore.getUser, state.user, canManageTeam.value)) return
    state.error = {} as Error
    state.isPageLoading = true
    try {
        const response = await userService.resetTwoFactor(props.userUuid)
        if (response?.data) {
            state.user = { ...state.user, is_google_2fa_enabled: false }
            successAlert(`${t('alert.success')}!`, t('superadmin.twoFactor.resetDone'))
            emit('saved')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

watch(() => props.isOpen, (opened) => {
    if (opened && props.userUuid) {
        state.error = {}
        state.user = null
        fetchUser()
    }
})

async function fetchUser() {
    state.isPageLoading = true
    try {
        const response = await userService.getUser(props.userUuid)
        if (response) {
            state.user = response?.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateUser(formData: any) {
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
            extra_permissions: formData.extra_permissions,
            revoked_permissions: formData.revoked_permissions,
        }
        if (formData.team_role) params.team_role = formData.team_role
        if (formData.password) params.password = formData.password

        const response = await userService.updateUser(props.userUuid, params)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('superadmin.users.form.alert.userSuccessfullyUpdated')}.`)
            emit('close')
            emit('saved')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
