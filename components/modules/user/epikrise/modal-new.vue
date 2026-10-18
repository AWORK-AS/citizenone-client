<template>
    <div>
        <Modal size="md" :title="$t('epikrise.new.title')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm()">
                        <Alert type="danger" :text="state.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-3">
                            <p class="text-sm text-gray-600">{{ $t('epikrise.new.intro') }}</p>
                            <div class="space-y-1">
                                <FormLabel for="epikrise_title" :label="$t('epikrise.form.title')" />
                                <FormTextField id="epikrise_title" name="epikrise_title"
                                    :placeholder="$t('epikrise.form.titlePlaceholder')"
                                    v-model="state.form.title" />
                                <FormError :error="state.error?.errors?.title?.[0]" />
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div class="space-y-1">
                                    <FormLabel for="epikrise_admission_date" :label="$t('epikrise.form.admissionDate')" />
                                    <FormDateField id="epikrise_admission_date" name="epikrise_admission_date"
                                        :placeholder="$t('epikrise.form.admissionDate')"
                                        v-model="state.form.admission_date" />
                                    <FormError :error="state.error?.errors?.admission_date?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="epikrise_discharge_date" :label="$t('epikrise.form.dischargeDate')" />
                                    <FormDateField id="epikrise_discharge_date" name="epikrise_discharge_date"
                                        :placeholder="$t('epikrise.form.dischargeDate')"
                                        v-model="state.form.discharge_date" />
                                    <FormError :error="state.error?.errors?.discharge_date?.[0]" />
                                </div>
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="epikrise_recipient" :label="$t('epikrise.form.recipient')" />
                                <FormSelect id="epikrise_recipient" :options="state.options.doctors"
                                    :placeholder="$t('epikrise.form.recipientPlaceholder')"
                                    v-model="state.form.recipient_contact_uuid" />
                                <p class="text-xs text-gray-500" v-if="state.options.doctors.length === 0 && !state.isPageLoading">
                                    {{ $t('epikrise.form.noDoctors') }}
                                </p>
                                <FormError :error="state.error?.errors?.recipient_contact_uuid?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="epikrise_template" :label="$t('epikrise.form.template')" />
                                <FormSelect id="epikrise_template" :options="state.options.templates"
                                    :placeholder="$t('epikrise.form.templatePlaceholder')"
                                    v-model="state.form.report_template_uuid" />
                                <p class="text-xs text-gray-500">{{ $t('epikrise.form.templateHint') }}</p>
                                <FormError :error="state.error?.errors?.report_template_uuid?.[0]" />
                            </div>
                        </div>
                        <div class="mt-6 pb-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="w-full">
                                    {{ $t('epikrise.new.create') }}
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
import { epikriseService } from '@/components/api/user/EpikriseService'
import { citizenDoctorService } from '@/components/api/user/CitizenDoctorService'
import { reportTemplateService } from '@/components/api/user/ReportTemplateService'
import { gpOptions } from '@/composables/useEpikrise'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    citizenUuid: {
        type: String,
        required: true,
    },
    // Suggested stay dates. Left empty, the backend uses the citizen's own dates.
    admissionDate: {
        type: String,
        required: false,
        default: '',
    },
    dischargeDate: {
        type: String,
        required: false,
        default: '',
    },
})

const emit = defineEmits(['close', 'created'])
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    form: {
        title: '',
        admission_date: '',
        discharge_date: '',
        recipient_contact_uuid: null as string | null,
        report_template_uuid: null as string | null,
    },
    options: {
        doctors: [] as any[],
        templates: [] as any[],
    },
})

watch(() => props.isModalOpen, (isOpen: boolean) => {
    if (!isOpen) return
    state.error = {}
    state.form = {
        title: '',
        admission_date: props.admissionDate ?? '',
        discharge_date: props.dischargeDate ?? '',
        recipient_contact_uuid: null,
        report_template_uuid: null,
    }
    fetchOptions()
}, { immediate: true })

async function fetchOptions() {
    state.isPageLoading = true
    try {
        const [doctors, templates] = await Promise.all([
            citizenDoctorService.getAllCitizenDoctors(props.citizenUuid),
            reportTemplateService.getAllReportTemplates({ type: 'epikrise' }),
        ])
        state.options.doctors = gpOptions(doctors?.data ?? [], t('epikrise.form.primaryGp'))
        // The backend already pre-selects the primary GP when none is chosen; showing it here is only clarity.
        state.form.recipient_contact_uuid = state.options.doctors.find((doctor: any) => doctor.is_primary_gp)?.value ?? null
        state.options.templates = (templates?.data ?? []).map((template: any) => ({ value: template.uuid, label: template.name }))
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function closeModal() {
    emit('close')
}

async function submitForm() {
    state.error = {}
    state.isPageLoading = true
    try {
        const payload: any = {}
        if (state.form.title.trim()) payload.title = state.form.title.trim()
        if (state.form.admission_date) payload.admission_date = state.form.admission_date
        if (state.form.discharge_date) payload.discharge_date = state.form.discharge_date
        if (state.form.recipient_contact_uuid) payload.recipient_contact_uuid = state.form.recipient_contact_uuid
        if (state.form.report_template_uuid) payload.report_template_uuid = state.form.report_template_uuid

        const response = await epikriseService.saveEpikrise(props.citizenUuid, payload)
        if (response?.data) {
            emit('created', response.data)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
