<template>
    <div>
        <Modal size="sm" :title="$t('settings.wallets.citizenWalletTransactions')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="sendWalletTransaction()" class="mt-6 max-w-3xl">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <FormLabel for="email" :label="$t('settings.wallets.form.email')" />
                                <FormTextField id="email" name="email" :placeholder="$t('settings.wallets.form.email')"
                                    v-model="state.formWalletTransactions.email" />
                                <FormError
                                    :error="v$?.formWalletTransactions?.email?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.email?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="citizen_uuid" :label="$t('settings.wallets.form.citizens')" />
                                <FormSelectMultiple id="citizen_uuid" name="citizen_uuid"
                                    :options="state.options.citizens"
                                    v-model="state.formWalletTransactions.citizen_uuid" />
                                <FormError
                                    :error="v$?.formWalletTransactions?.citizen_uuid?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.citizen_uuid?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="wallet_uuid" :label="$t('settings.wallets.form.wallets')" />
                                <FormSelectMultiple id="wallet_uuid" name="wallet_uuid" :options="state.options.wallets"
                                    v-model="state.formWalletTransactions.wallet_uuid" />
                                <FormError
                                    :error="v$?.formWalletTransactions?.wallet_uuid?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.wallet_uuid?.[0]" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                                    {{ $t('settings.wallets.form.send') }}
                                </FormButton>
                            </div>
                        </div>
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { citizenService } from '@/components/api/CitizenService'
import { citizenWalletService } from '@/components/api/CitizenWalletService'
import { citizenWalletTransactionService } from '@/components/api/CitizenWalletTransactionService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshAddictions'])

const state = reactive({
    error: {} as Error,
    formWalletTransactions: {
        email: '',
        citizen_uuid: [],
        wallet_uuid: [],
    },
    isPageLoading: false,
    options: {
        citizens: [] as any,
        wallets: [] as any,
    }
})

const rules = computed(() => {
    return {
        formWalletTransactions: {
            email: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            citizen_uuid: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

watch(() => props.isModalOpen, () => {
    fetchAllCitizens()
})

watch(() => state.formWalletTransactions.citizen_uuid, () => {
    fetchWalletsPerCitizen()
})

function closeModal() {
    emit('close')
}

async function fetchAllCitizens() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await citizenService.getAllCitizens()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (citizen: any) => options.push({
                    value: citizen?.uuid,
                    label: citizen?.firstname + " " + citizen?.lastname,
                })
            )
            state.options.citizens = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchWalletsPerCitizen() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: Array(state.formWalletTransactions.citizen_uuid)
        }
        const response = await citizenWalletService.getWalletsPerCitizen(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (wallet: any) => options.push({
                    value: wallet?.uuid,
                    label: wallet?.name,
                })
            )
            state.options.wallets = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function sendWalletTransaction() {
    state.error = {}
    state.isPageLoading = true
    v$.value.$validate()
    if (!v$.value.$error) {
        try {
            const params = {
                email: state.formWalletTransactions.email,
                citizen_uuid: state.formWalletTransactions.citizen_uuid,
                wallet_uuid: state.formWalletTransactions.wallet_uuid,
            }
            const response = await citizenWalletTransactionService.sendWalletTransaction(params)
            if (response.data) {
                successAlert(`${t('alert.success')}!`, `${t('settings.wallets.form.alert.successfullySent')}.`)
                closeModal()
            }
        } catch (error: any) {
            state.error = error
        }
    }
    state.isPageLoading = false
}
</script>