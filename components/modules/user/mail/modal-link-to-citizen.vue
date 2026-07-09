<template>
    <div>
        <Modal size="md" :title="$t('citizens.emails.linkToCitizen')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm()">
                        <Alert type="danger" :text="state.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <FormLabel for="citizen_uuid" :label="$t('citizens.emails.selectCitizen')" />
                                <FormSelect id="citizen_uuid" :options="state.options.citizens" :appendToBody="true"
                                    v-model="state.form.citizen_uuid" />
                                <FormError :error="v$?.form?.citizen_uuid?.$errors[0]?.$message.toString()" />
                                <FormError :error="state.error?.errors?.citizen_uuid?.[0]" />
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="visible_to_role" :label="$t('citizens.emails.selectVisibility')" />
                                <FormSelect id="visible_to_role" :options="state.options.roles" :appendToBody="true"
                                    v-model="state.form.visible_to_role" />
                                <FormError :error="state.error?.errors?.visible_to_role?.[0]" />
                            </div>

                            <div class="w-fit flex items-center cursor-pointer"
                                @click="state.form.save_pdf_to_documents = !state.form.save_pdf_to_documents">
                                <FormCheckbox :value="state.form.save_pdf_to_documents" />
                                {{ $t('citizens.emails.savePdfToDocuments') }}
                            </div>
                            <div class="w-fit flex items-center cursor-pointer"
                                v-if="props.selectedEmail?.attachments?.length"
                                @click="state.form.save_attachments_to_documents = !state.form.save_attachments_to_documents">
                                <FormCheckbox :value="state.form.save_attachments_to_documents" />
                                {{ $t('citizens.emails.saveAttachmentsToDocuments') }}
                            </div>
                        </div>

                        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="submit" buttonStyle="primary">
                                {{ $t('save') }}
                            </FormButton>
                        </div>
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { citizenEmailService } from '@/components/api/user/CitizenEmailService'
import { citizenService } from '@/components/api/user/CitizenService'
import { useVuelidate } from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedEmail: {
        type: Object,
        default: null,
    },
    sourceFolder: {
        type: String,
        default: 'INBOX',
    },
})

const emit = defineEmits(['close'])
const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    form: {
        citizen_uuid: '',
        visible_to_role: 'User',
        save_pdf_to_documents: false,
        save_attachments_to_documents: false,
    },
    options: {
        citizens: [] as any[],
        roles: [
            { value: 'Admin', label: '' },
            { value: 'Manager', label: '' },
            { value: 'User', label: '' },
        ],
    },
})

const rules = computed(() => ({
    form: {
        citizen_uuid: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
    },
}))

const v$ = useVuelidate(rules, state)

onMounted(() => {
    loadOptions()
})

watch(() => props.isModalOpen, (newVal) => {
    if (newVal) {
        resetForm()
        loadOptions()
    }
})

function resetForm() {
    state.error = {}
    v$.value.$reset()
    state.form = {
        citizen_uuid: '',
        visible_to_role: 'User',
        save_pdf_to_documents: false,
        save_attachments_to_documents: false,
    }
}

function closeModal() {
    state.error = {}
    emit('close')
}

async function loadOptions() {
    state.options.roles = [
        { value: 'Admin', label: t('citizens.emails.roles.admin') },
        { value: 'Manager', label: t('citizens.emails.roles.manager') },
        { value: 'User', label: t('citizens.emails.roles.user') },
    ]
    await fetchCitizens()
}

async function fetchCitizens() {
    try {
        const response = await citizenService.getCitizens({ per_page: 500 })
        if (response?.data) {
            state.options.citizens = response.data.map((c: any) => ({
                value: c.uuid,
                label: `${c.firstname} ${c.lastname}`,
            }))
        }
    } catch (error: any) {
        state.error = error
    }
}

async function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (v$.value.$error) return

    state.isPageLoading = true
    try {
        const header = props.selectedEmail?.header ?? {}
        const params = {
            citizen_uuid: state.form.citizen_uuid,
            subject: header.subject ?? null,
            from_name: header.from ?? null,
            from_email: header.from_email ?? null,
            to_email: header.to_email ?? null,
            email_date: header.date ?? null,
            body_html: props.selectedEmail?.bodies?.html ?? null,
            source_uid: String(header.uid ?? ''),
            source_folder: props.sourceFolder,
            visible_to_role: state.form.visible_to_role,
            attachments: (props.selectedEmail?.attachments ?? []).map((attachment: any) => ({
                filename: attachment.filename,
            })),
            save_pdf_to_documents: state.form.save_pdf_to_documents,
            save_attachments_to_documents: state.form.save_attachments_to_documents,
        }

        const response = await citizenEmailService.tagEmailToCitizen(params)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('citizens.emails.linkedSuccessfully')}.`)
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
