<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ state.item?.title ?? $t('epikrise.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ $t('citizens.citizens') }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>{{ $t('epikrise.editor.title') }}</template>

            <div class="space-y-6 max-w-4xl">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    :to="`/citizens/${citizenUuid}/epikriser`">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <LoadingSpinner :isActive="state.isPageLoading">
                    <div v-if="state.item" class="space-y-6">
                        <div class="flex flex-wrap items-center gap-3">
                            <h2 class="text-lg font-semibold text-gray-900">{{ state.item.title }}</h2>
                            <Badge :type="isFinalized ? 'active' : 'pending'" class="w-fit">
                                {{ isFinalized ? $t('epikrise.status.finalized') : $t('epikrise.status.draft') }}
                            </Badge>
                            <span class="text-sm text-gray-500" v-if="state.item.citizen">
                                {{ personName(state.item.citizen) }}
                            </span>
                        </div>

                        <Alert type="default" :text="$t('epikrise.editor.lockedNotice')" v-if="isFinalized" />
                        <Alert type="warning" :text="$t('epikrise.editor.noEditRights')"
                            v-else-if="!state.item.can_edit" />

                        <!-- Editable draft -->
                        <form v-if="isEditable" @submit.prevent="save()" class="space-y-4">
                            <div class="space-y-1">
                                <FormLabel for="title" :label="$t('epikrise.form.title')" />
                                <FormTextField id="title" name="title" :placeholder="$t('epikrise.form.titlePlaceholder')"
                                    v-model="state.form.title" />
                                <FormError :error="state.fieldErrors?.title?.[0]" />
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div class="space-y-1">
                                    <FormLabel for="admission_date" :label="$t('epikrise.form.admissionDate')" />
                                    <FormDateField id="admission_date" name="admission_date"
                                        :placeholder="$t('epikrise.form.admissionDate')"
                                        v-model="state.form.admission_date" />
                                    <FormError :error="state.fieldErrors?.admission_date?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="discharge_date" :label="$t('epikrise.form.dischargeDate')" />
                                    <FormDateField id="discharge_date" name="discharge_date"
                                        :placeholder="$t('epikrise.form.dischargeDate')"
                                        v-model="state.form.discharge_date" />
                                    <FormError :error="state.fieldErrors?.discharge_date?.[0]" />
                                </div>
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="recipient" :label="$t('epikrise.form.recipient')" />
                                <FormSelect id="recipient" :options="state.options.doctors"
                                    :placeholder="$t('epikrise.form.recipientPlaceholder')"
                                    v-model="state.form.recipient_contact_uuid" />
                                <p class="text-xs text-gray-500" v-if="state.options.doctors.length === 0">
                                    {{ $t('epikrise.form.noDoctors') }}
                                </p>
                                <FormError :error="state.fieldErrors?.recipient_contact_uuid?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="body" :label="$t('epikrise.form.body')" />
                                <ckeditor :editor="editor" v-model="state.form.body" :config="editorConfig" />
                                <FormError :error="state.fieldErrors?.body?.[0]" />
                            </div>
                        </form>

                        <!-- Locked: read only -->
                        <div v-else class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                <p>
                                    <span class="font-semibold">{{ $t('epikrise.form.admissionDate') }}:</span>
                                    {{ state.item.admission_date ? formatDateToReadable(state.item.admission_date) : '-' }}
                                </p>
                                <p>
                                    <span class="font-semibold">{{ $t('epikrise.form.dischargeDate') }}:</span>
                                    {{ state.item.discharge_date ? formatDateToReadable(state.item.discharge_date) : '-' }}
                                </p>
                                <p>
                                    <span class="font-semibold">{{ $t('epikrise.form.recipient') }}:</span>
                                    {{ recipientSummary }}
                                </p>
                                <p>
                                    <span class="font-semibold">{{ $t('epikrise.table.author') }}:</span>
                                    {{ personName(state.item.author) }}
                                </p>
                                <p v-if="state.item.finalized_at">
                                    <span class="font-semibold">{{ $t('epikrise.editor.finalizedAt') }}:</span>
                                    {{ formatDateTimeToReadable(state.item.finalized_at) }}
                                </p>
                            </div>
                            <div class="prose prose-sm max-w-none rounded-lg border border-gray-200 bg-gray-50 p-4"
                                v-safe-html="state.item.body" />
                        </div>

                        <!-- Actions -->
                        <div class="sticky bottom-0 z-20 -mx-4 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:px-6">
                            <div class="flex flex-wrap items-center justify-end gap-2">
                                <FormButton type="button" buttonStyle="action" @click="previewPdf"
                                    :disabled="state.isBusy">
                                    <Icon name="ph:file-pdf" class="size-4" />
                                    {{ $t('epikrise.actions.previewPdf') }}
                                </FormButton>
                                <FormButton v-if="isEditable" type="button" buttonStyle="action"
                                    @click="state.modal.isPrefillOpen = true" :disabled="state.isBusy">
                                    <Icon name="ph:magic-wand" class="size-4" />
                                    {{ $t('epikrise.actions.prefill') }}
                                </FormButton>
                                <FormButton v-if="isEditable" type="button" buttonStyle="cancel" @click="save"
                                    :disabled="state.isBusy">
                                    <Icon name="ph:floppy-disk" class="size-4" />
                                    {{ $t('epikrise.actions.save') }}
                                </FormButton>
                                <FormButton v-if="isEditable" type="button" buttonStyle="primary"
                                    @click="state.modal.isFinalizeOpen = true" :disabled="state.isBusy">
                                    <Icon name="ph:lock-key" class="size-4" />
                                    {{ $t('epikrise.actions.finalize') }}
                                </FormButton>
                                <FormButton v-if="canSendNow" type="button" buttonStyle="primary"
                                    @click="openSendModal" :disabled="state.isBusy">
                                    <Icon name="ph:paper-plane-tilt" class="size-4" />
                                    {{ $t('epikrise.actions.send') }}
                                </FormButton>
                            </div>
                        </div>

                        <!-- Dispatch log -->
                        <div v-if="isFinalized" class="space-y-2">
                            <h3 class="text-sm font-semibold text-gray-800">{{ $t('epikrise.dispatches.title') }}</h3>
                            <p class="text-sm text-gray-500" v-if="!(state.item.dispatches ?? []).length">
                                {{ $t('epikrise.dispatches.empty') }}
                            </p>
                            <div class="table-responsive" v-else>
                                <table class="co-table">
                                    <thead>
                                        <tr>
                                            <th>{{ $t('epikrise.dispatches.sentAt') }}</th>
                                            <th>{{ $t('epikrise.dispatches.recipient') }}</th>
                                            <th>{{ $t('epikrise.dispatches.sentBy') }}</th>
                                            <th>{{ $t('epikrise.dispatches.status') }}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(dispatch, index) in state.item.dispatches" :key="index">
                                            <td>{{ dispatch?.sent_at ? formatDateTimeToReadable(dispatch.sent_at) : '-' }}</td>
                                            <td>
                                                <div>{{ dispatch?.recipient_name || '-' }}</div>
                                                <div class="text-xs text-gray-500">{{ dispatch?.recipient_address }}</div>
                                                <div class="text-xs text-gray-500">{{ $t('epikrise.dispatches.encrypted') }}</div>
                                            </td>
                                            <td>{{ senderName(dispatch?.sent_by) }}</td>
                                            <td>
                                                <Badge :type="dispatch?.status === 'sent' ? 'active' : 'inactive'"
                                                    class="w-fit">
                                                    {{ dispatch?.status === 'sent'
                                                        ? $t('epikrise.dispatches.sent')
                                                        : $t('epikrise.dispatches.failed') }}
                                                </Badge>
                                                <div class="text-xs text-red-700 mt-1" v-if="dispatch?.error">
                                                    {{ dispatch.error }}
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>

            <!-- Prefill: replaces the text, so it asks first -->
            <DialogConfirmation :isModalOpen="state.modal.isPrefillOpen"
                :title="$t('epikrise.prefill.title')"
                :message="$t('epikrise.prefill.message')"
                :confirmLabel="$t('epikrise.prefill.confirm')"
                @close="state.modal.isPrefillOpen = false"
                @confirm="prefill">
                <template #extra>
                    <div class="mt-4 space-y-1">
                        <FormLabel for="prefill_template" :label="$t('epikrise.form.template')" />
                        <FormSelect id="prefill_template" :options="state.options.templates"
                            :placeholder="$t('epikrise.form.templatePlaceholder')"
                            v-model="state.prefillTemplateUuid" openDirection="top" />
                    </div>
                </template>
            </DialogConfirmation>

            <!-- Finalize -->
            <DialogConfirmation :isModalOpen="state.modal.isFinalizeOpen"
                :title="$t('epikrise.finalize.title')"
                :message="$t('epikrise.finalize.message')"
                :confirmLabel="$t('epikrise.finalize.confirm')"
                @close="state.modal.isFinalizeOpen = false"
                @confirm="finalize" />

            <!-- Send by encrypted email -->
            <Modal size="md" :title="$t('epikrise.send.title')" :show="state.modal.isSendOpen"
                @close="state.modal.isSendOpen = false">
                <template #modal-body>
                    <LoadingSpinner :isActive="state.isSending">
                        <form @submit.prevent="send()" class="space-y-4">
                            <Alert type="danger" :text="state.sendError?.message"
                                v-if="state.sendError?.message && state.sendError.message.length > 0" />

                            <div class="flex items-start gap-x-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                                <Icon name="ph:lock-key" class="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                                <p class="text-sm text-gray-700">{{ $t('epikrise.send.encryptedNotice') }}</p>
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="send_recipient" :label="$t('epikrise.send.recipient')" />
                                <FormSelect id="send_recipient" :options="state.options.doctors"
                                    :placeholder="$t('epikrise.form.recipientPlaceholder')"
                                    v-model="state.send.recipient_contact_uuid" />
                                <FormError :error="state.sendError?.errors?.recipient_contact_uuid?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="send_email" :label="$t('epikrise.send.otherEmail')" />
                                <FormTextField id="send_email" name="send_email"
                                    :placeholder="$t('epikrise.send.otherEmailPlaceholder')"
                                    v-model="state.send.email" />
                                <p class="text-xs text-gray-500">{{ $t('epikrise.send.otherEmailHint') }}</p>
                                <FormError :error="state.sendError?.errors?.email?.[0]" />
                            </div>
                            <p class="text-sm text-gray-700" v-if="sendTargetEmail">
                                <span class="font-semibold">{{ $t('epikrise.send.willBeSentTo') }}:</span>
                                {{ sendTargetEmail }}
                            </p>

                            <div class="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-gray-800">
                                {{ $t('epikrise.send.passwordNotice') }}
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div class="space-y-1">
                                    <FormLabel for="send_password" :label="$t('epikrise.send.password')" />
                                    <FormPasswordField id="send_password" name="send_password"
                                        :placeholder="$t('epikrise.send.password')"
                                        v-model="state.send.password" />
                                    <FormError :error="state.sendError?.errors?.password?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="send_hint" :label="$t('epikrise.send.passwordHint')" />
                                    <FormTextField id="send_hint" name="send_hint"
                                        :placeholder="$t('epikrise.send.passwordHintPlaceholder')"
                                        v-model="state.send.password_hint" />
                                    <FormError :error="state.sendError?.errors?.password_hint?.[0]" />
                                </div>
                            </div>
                            <p class="text-xs text-gray-500">{{ $t('epikrise.send.hintWarning') }}</p>

                            <div class="flex items-center gap-2 cursor-pointer"
                                @click="state.send.confirmed = !state.send.confirmed">
                                <FormCheckbox :value="state.send.confirmed" />
                                <span class="text-sm text-gray-700">{{ $t('epikrise.send.confirmCheckbox') }}</span>
                            </div>

                            <div class="mt-6 pb-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormButton type="button" buttonStyle="cancel"
                                        @click="state.modal.isSendOpen = false">
                                        {{ $t('cancel') }}
                                    </FormButton>
                                    <FormButton type="submit" buttonStyle="primary" class="w-full"
                                        :disabled="!canSubmitSend">
                                        <Icon name="ph:paper-plane-tilt" class="size-4" />
                                        {{ $t('epikrise.send.submit') }}
                                    </FormButton>
                                </div>
                            </div>
                        </form>
                    </LoadingSpinner>
                </template>
            </Modal>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import ClassicEditor from '@/utils/editor'
import { epikriseService } from '@/components/api/user/EpikriseService'
import { citizenDoctorService } from '@/components/api/user/CitizenDoctorService'
import { reportTemplateService } from '@/components/api/user/ReportTemplateService'
import { gpOptions } from '@/composables/useEpikrise'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { formatDateToReadable, formatDateTimeToReadable } = useDatetimeFormatter()
const { t } = useI18n()
const route = useRoute()
const epikrise = useEpikrise()
const userStore = useUserStore() as any
const citizenUuid = route?.params?.uuid as string
const epikriseUuid = route?.params?.epikrise_uuid as string

const editor = ref(ClassicEditor)
const editorConfig = ref({ height: 500 })

const breadcrumbLinks = [
    { name: 'epikrise.title', translate: true, href: `/citizens/${citizenUuid}/epikriser` },
]

const state = reactive({
    error: {} as Error,
    sendError: {} as Error,
    fieldErrors: {} as any,
    isPageLoading: false,
    isBusy: false,
    isSending: false,
    item: null as any,
    form: {
        title: '',
        body: '',
        admission_date: '',
        discharge_date: '',
        recipient_contact_uuid: null as string | null,
    },
    prefillTemplateUuid: null as string | null,
    send: {
        recipient_contact_uuid: null as string | null,
        email: '',
        password: '',
        password_hint: '',
        confirmed: false,
    },
    modal: {
        isPrefillOpen: false,
        isFinalizeOpen: false,
        isSendOpen: false,
    },
    options: {
        doctors: [] as any[],
        templates: [] as any[],
    },
})

const isFinalized = computed(() => state.item?.status === 'finalized')
const isEditable = computed(() => state.item?.status === 'draft' && state.item?.can_edit === true)
const canSendNow = computed(() => isFinalized.value && epikrise.canSend.value && state.item?.can_send === true)

const recipientSummary = computed(() => {
    const recipient = state.item?.recipient
    if (!recipient) return '-'

    return [recipient.name, recipient.clinic_name].filter(Boolean).join(', ') || '-'
})

// The address the email will go to: a typed address wins over the chosen doctor.
const sendTargetEmail = computed(() => {
    const typed = state.send.email.trim()
    if (typed) return typed
    const selected = state.options.doctors.find((doctor: any) => doctor.value === state.send.recipient_contact_uuid)

    return selected?.email ?? ''
})

const canSubmitSend = computed(() =>
    !state.isSending
    && state.send.confirmed
    && (!!state.send.email.trim() || !!state.send.recipient_contact_uuid)
    && state.send.password.length > 0
    && state.send.password_hint.trim().length > 0)

onMounted(async () => {
    await fetchEpikrise()
    fetchOptions()
})

// The user may still be loading when the page opens, so only leave once it is known.
watch([() => userStore.getUser, epikrise.canUse], ([user, allowed]: any[]) => {
    // The store starts as an empty object, not null: only leave once the user has actually loaded.
    if (user?.id && !allowed) navigateTo(`/citizens/${citizenUuid}`)
}, { immediate: true })

function personName(person: any): string {
    return [person?.firstname, person?.lastname].filter(Boolean).join(' ') || '-'
}

function senderName(sentBy: any): string {
    if (!sentBy) return '-'

    return typeof sentBy === 'string' ? sentBy : personName(sentBy)
}

function applyItem(item: any) {
    state.item = item
    state.form = {
        title: item?.title ?? '',
        body: item?.body ?? '',
        admission_date: item?.admission_date ? String(item.admission_date).slice(0, 10) : '',
        discharge_date: item?.discharge_date ? String(item.discharge_date).slice(0, 10) : '',
        recipient_contact_uuid: item?.recipient?.uuid ?? null,
    }
}

async function fetchEpikrise() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await epikriseService.getEpikrise(epikriseUuid)
        if (response?.data) {
            applyItem(response.data)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchOptions() {
    try {
        const [doctors, templates] = await Promise.all([
            citizenDoctorService.getAllCitizenDoctors(citizenUuid),
            isEditable.value
                ? reportTemplateService.getAllReportTemplates({ type: 'epikrise' })
                : Promise.resolve({ data: [] }),
        ])
        const options: any[] = gpOptions(doctors?.data ?? [], t('epikrise.form.primaryGp'))
            .map((option: any, index: number) => ({ ...option, email: doctors?.data?.[index]?.email ?? '' }))

        // A recipient that is no longer among the citizen's doctors must still show.
        const recipient = state.item?.recipient
        if (recipient?.uuid && !options.some((option: any) => option.value === recipient.uuid)) {
            options.push({ value: recipient.uuid, label: recipient.name, is_primary_gp: false, email: recipient.email ?? '' })
        }
        state.options.doctors = options
        state.options.templates = (templates?.data ?? []).map((template: any) => ({ value: template.uuid, label: template.name }))
    } catch (error: any) {
        state.error = error
    }
}

function payloadFromForm() {
    return {
        title: state.form.title,
        body: state.form.body,
        admission_date: state.form.admission_date || null,
        discharge_date: state.form.discharge_date || null,
        recipient_contact_uuid: state.form.recipient_contact_uuid || null,
    }
}

// Returns true when saved (or when there is nothing to save).
async function persist(): Promise<boolean> {
    if (!isEditable.value) return true
    state.error = {}
    state.fieldErrors = {}
    try {
        const response = await epikriseService.updateEpikrise(epikriseUuid, payloadFromForm())
        if (response?.data) {
            state.item = response.data
        }
        return true
    } catch (error: any) {
        state.error = error
        state.fieldErrors = error?.errors ?? {}
        return false
    }
}

async function save() {
    state.isBusy = true
    const saved = await persist()
    if (saved) {
        successAlert(`${t('alert.success')}!`, `${t('epikrise.alert.saved')}.`)
    }
    state.isBusy = false
}

async function prefill() {
    state.error = {}
    state.isBusy = true
    try {
        const payload: any = {}
        if (state.prefillTemplateUuid) payload.report_template_uuid = state.prefillTemplateUuid
        const response = await epikriseService.prefillEpikrise(epikriseUuid, payload)
        if (response?.data) {
            applyItem(response.data)
            successAlert(`${t('alert.success')}!`, `${t('epikrise.alert.prefilled')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isBusy = false
}

async function finalize() {
    state.isBusy = true
    // The locked text is what was on screen, so save it first.
    if (await persist()) {
        try {
            const response = await epikriseService.finalizeEpikrise(epikriseUuid)
            if (response?.data) {
                applyItem(response.data)
                successAlert(`${t('alert.success')}!`, `${t('epikrise.alert.finalized')}.`)
            }
        } catch (error: any) {
            state.error = error
        }
    }
    state.isBusy = false
}

async function previewPdf() {
    // Opened right away, in the click, so the browser does not take it for a pop-up.
    const tab = window.open('', '_blank')
    state.isBusy = true
    try {
        if (!(await persist())) {
            tab?.close()
            state.isBusy = false
            return
        }
        const blob = await epikriseService.getEpikrisePdf(epikriseUuid)
        if (blob) {
            const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
            if (tab) {
                tab.location.href = url
            } else {
                window.open(url, '_blank')
            }
            setTimeout(() => URL.revokeObjectURL(url), 60000)
        } else {
            tab?.close()
        }
    } catch (error: any) {
        tab?.close()
        state.error = error
    }
    state.isBusy = false
}

function openSendModal() {
    state.sendError = {}
    state.send = {
        recipient_contact_uuid: state.item?.recipient?.uuid ?? state.options.doctors.find((doctor: any) => doctor.is_primary_gp)?.value ?? null,
        email: '',
        password: '',
        password_hint: '',
        confirmed: false,
    }
    state.modal.isSendOpen = true
}

async function send() {
    if (!canSubmitSend.value) return
    state.sendError = {}
    state.isSending = true
    try {
        const typedEmail = state.send.email.trim()
        const payload: any = {
            channel: 'email_encrypted',
            password: state.send.password,
            password_hint: state.send.password_hint.trim(),
        }
        if (typedEmail) {
            payload.email = typedEmail
        } else if (state.send.recipient_contact_uuid) {
            payload.recipient_contact_uuid = state.send.recipient_contact_uuid
        }
        const response = await epikriseService.sendEpikrise(epikriseUuid, payload)
        if (response?.data) {
            applyItem(response.data)
            // The password is not kept around once it has been used.
            state.send.password = ''
            state.modal.isSendOpen = false
            successAlert(`${t('alert.success')}!`, `${t('epikrise.alert.sent')}.`)
        }
    } catch (error: any) {
        state.sendError = error
        // The server logs a failed attempt too: reload quietly so the sending log shows it. Only finalized
        // documents can be sent, so there are no unsaved edits to lose.
        try {
            const response = await epikriseService.getEpikrise(epikriseUuid)
            if (response?.data) applyItem(response.data)
        } catch (_) {
            // The send error is what matters here; the log refreshes on the next load.
        }
    }
    state.isSending = false
}
</script>
