<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.patientForms') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400" />
                            <button @click="navigateTo('/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.citizens }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>{{ $t('citizens.tabs.patientForms') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <div class="flex justify-end">
                    <FormButton buttonStyle="action" @click="openSendModal">
                        <Icon name="ph:paper-plane-tilt" class="h-4 w-4" />
                        {{ $t('patientForms.sendToPatient') }}
                    </FormButton>
                </div>

                <LoadingSpinner :isActive="state.isPageLoading">
                    <div v-if="!state.isPageLoading && state.assignments.length === 0"
                        class="px-6 py-14 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg text-center">
                        <div class="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon name="ph:note-pencil" class="h-7 w-7 text-primary" />
                        </div>
                        <h3 class="mt-4 text-lg font-semibold text-gray-900">{{ $t('patientForms.empty.title') }}</h3>
                        <p class="mt-1 text-sm text-gray-500 max-w-md mx-auto">{{ $t('patientForms.empty.text') }}</p>
                    </div>

                    <div v-else class="space-y-3">
                        <div v-for="assignment in state.assignments" :key="assignment.uuid"
                            class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p class="font-semibold text-gray-900">{{ assignment.form?.title }}</p>
                                <p class="text-sm text-gray-500">
                                    {{ $t('patientForms.sent') }}: {{ formatDate(assignment.created_at) }}
                                    <template v-if="assignment.status === 'completed'">
                                        · {{ $t('patientForms.answered') }}: {{ formatDate(assignment.completed_at) }}
                                    </template>
                                </p>
                            </div>
                            <div class="flex items-center gap-3">
                                <span v-if="assignment.status === 'completed'"
                                    class="text-xs font-medium rounded-full bg-green-100 text-green-800 px-3 py-1">
                                    {{ $t('patientForms.status.answered') }}
                                </span>
                                <span v-else class="text-xs font-medium rounded-full bg-amber-100 text-amber-900 px-3 py-1">
                                    {{ $t('patientForms.status.waiting') }}
                                </span>
                                <FormButton v-if="assignment.status !== 'completed'" type="button" buttonStyle="danger"
                                    buttonSize="xs" @click="confirmWithdraw(assignment)">
                                    {{ $t('patientForms.withdraw') }}
                                </FormButton>
                            </div>
                        </div>
                        <p class="text-sm text-gray-500">{{ $t('patientForms.journalNotice') }}</p>
                    </div>
                </LoadingSpinner>
            </div>

            <Modal size="md" :title="$t('patientForms.sendToPatient')" :isModalOpen="state.modal.isSendOpen"
                @close="state.modal.isSendOpen = false">
                <template #modal-body>
                    <div class="space-y-3">
                        <p class="text-sm text-gray-500">{{ $t('patientForms.sendHelp') }}</p>
                        <FormLabel for="form_uuid" :label="$t('patientForms.chooseForm')" />
                        <FormSelect id="form_uuid" :options="state.options.forms" v-model="state.selectedFormUuid" />
                        <FormError :error="state?.error?.errors?.citizen_uuid?.[0]" />
                    </div>
                    <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormButton type="button" buttonStyle="cancel" @click="state.modal.isSendOpen = false">
                            {{ $t('cancel') }}
                        </FormButton>
                        <FormButton type="button" buttonStyle="primary" :disabled="!state.selectedFormUuid || state.isSending"
                            @click="sendForm">
                            {{ $t('patientForms.send') }}
                        </FormButton>
                    </div>
                </template>
            </Modal>

            <DialogConfirmation :isModalOpen="state.modal.isWithdrawOpen"
                :title="$t('patientForms.withdraw')" :message="$t('patientForms.withdrawConfirm')"
                @close="state.modal.isWithdrawOpen = false" @confirm="withdraw" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { formService } from '@/components/api/user/FormService'
import { useAlert } from '@/composables/alert'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const customPagesStore = useCustomPagesStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as string

const breadcrumbLinks = [
    { name: 'citizens.tabs.patientForms', translate: true, href: `/citizens/${citizenUuid}/patient-forms` },
]

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    isSending: false,
    assignments: [] as any[],
    selectedFormUuid: '',
    selectedAssignment: null as any,
    options: { forms: [] as any[] },
    modal: { isSendOpen: false, isWithdrawOpen: false },
})

function formatDate(date: any) {
    return date ? moment(date).format('DD-MM-YYYY') : '-'
}

onMounted(() => {
    fetchAssignments()
    fetchForms()
})

async function fetchAssignments() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await formService.getFormAssignments({ citizen_uuid: citizenUuid })
        state.assignments = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchForms() {
    try {
        const response = await formService.getAllForms()
        state.options.forms = (response?.data ?? []).map((form: any) => ({
            value: form.uuid,
            label: form.title,
        }))
    } catch (error: any) {
        state.error = error
    }
}

function openSendModal() {
    state.selectedFormUuid = ''
    state.modal.isSendOpen = true
}

async function sendForm() {
    state.error = {}
    state.isSending = true
    try {
        const response = await formService.sendFormToPatient(state.selectedFormUuid, { citizen_uuid: citizenUuid })
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, t('patientForms.sentAlert'))
            state.modal.isSendOpen = false
            await fetchAssignments()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isSending = false
}

function confirmWithdraw(assignment: any) {
    state.selectedAssignment = assignment
    state.modal.isWithdrawOpen = true
}

async function withdraw() {
    state.error = {}
    try {
        const response = await formService.withdrawFormAssignment(state.selectedAssignment?.uuid)
        if (response) {
            successAlert(`${t('alert.success')}!`, t('patientForms.withdrawnAlert'))
            await fetchAssignments()
        }
    } catch (error: any) {
        state.error = error
    }
    state.modal.isWithdrawOpen = false
}
</script>
