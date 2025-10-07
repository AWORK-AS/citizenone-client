<template>
    <div>
        <Modal size="md" :title="$t('mail.compose')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm()" id="formEmail">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <FormLabel for="recipient" :label="$t('mail.form.to')" />
                                <FormMultipleEmailAddresses id="recipient" name="recipient"
                                    :placeholder="$t('mail.form.to')" v-model="state.formEmail.recipient" />
                                <FormError :error="v$?.formEmail?.recipient?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.recipient?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="subject" :label="$t('mail.form.subject')" />
                                <FormTextField id="subject" name="subject" :placeholder="$t('mail.form.subject')"
                                    v-model="state.formEmail.subject" />
                                <FormError :error="v$?.formEmail?.subject?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.subject?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="content" :label="$t('mail.form.message')" />
                                <FormTextArea id="content" name="content" :placeholder="$t('mail.form.message')"
                                    v-model="state.formEmail.content" />
                                <FormError :error="v$?.formEmail?.content?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.content?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <div class="w-fit flex items-center cursor-pointer"
                                    @click="state.formEmail.encrypt_message = !state.formEmail.encrypt_message">
                                    <FormCheckbox :value="state.formEmail.encrypt_message" />
                                    {{ $t('mail.form.encryptMessage') }}
                                </div>
                            </div>
                            <div class="space-y-1" v-if="state.formEmail.encrypt_message">
                                <FormLabel for="password" :label="$t('mail.form.password')" />
                                <FormTextField id="password" name="password" :placeholder="$t('mail.form.password')"
                                    v-model="state.formEmail.password" />
                                <FormError :error="v$?.formEmail?.password?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.password?.[0]" />
                            </div>
                            <div class="space-y-1" v-if="state.formEmail.encrypt_message">
                                <FormLabel for="password_hint" :label="$t('mail.form.passwordHint')" />
                                <FormTextField id="password_hint" name="password"
                                    :placeholder="$t('mail.form.passwordHint')"
                                    v-model="state.formEmail.password_hint" />
                                <FormError :error="v$?.formEmail?.password_hint?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.password_hint?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <fieldset class="space-y-1">
                                    <legend class="text-sm text-gray-600">
                                        {{ $t('mail.form.attachFiles.attachFiles') }}
                                    </legend>
                                    <div class="grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
                                        <label v-for="(attachFile, attachFileIndex) in state.options.attachFilesOptions"
                                            :key="attachFileIndex" :aria-label="attachFile.title"
                                            class="group relative flex rounded-lg border border-gray-300 bg-white p-4 has-[:disabled]:border-gray-400 has-[:disabled]:bg-gray-200 has-[:disabled]:opacity-25 has-[:checked]:outline has-[:focus-visible]:outline has-[:checked]:outline-2 has-[:focus-visible]:outline-[3px] has-[:checked]:-outline-offset-2 has-[:focus-visible]:-outline-offset-1 has-[:checked]:outline-secondary">
                                            <input type="radio" name="mailing-list" :value="attachFile.id"
                                                :checked="attachFile === state.options.attachFilesOptions[0]"
                                                class="absolute inset-0 appearance-none focus:outline focus:outline-0"
                                                v-model="state.formEmail.fileOption" />
                                            <div class="flex-1">
                                                <p class="block text-sm font-medium text-gray-900">
                                                    <span v-if="attachFile.title === 'Attach file from computer'">
                                                        {{ $t('mail.form.attachFiles.attachFileFromComputer') }}
                                                    </span>
                                                    <span
                                                        v-if="attachFile.title === 'Attach file from citizen\'s folder'">
                                                        {{ $t('mail.form.attachFiles.attachFileFromCitizensFolder') }}
                                                    </span>
                                                    <span
                                                        v-if="attachFile.title === 'Attach file from organization\'s folder'">
                                                        {{
                                                            $t('mail.form.attachFiles.attachFileFromOrganizationsFolder')
                                                        }}
                                                    </span>
                                                </p>
                                            </div>
                                            <Icon name="heroicons:check-circle-20-solid"
                                                class="invisible size-5 text-secondary group-has-[:checked]:visible"
                                                aria-hidden="true" />
                                        </label>
                                    </div>
                                </fieldset>
                            </div>
                            <div class="space-y-1" v-if="state.formEmail.fileOption === 'Attach file from computer'">
                                <div class="flex flex-col items-center">
                                    <input type="file" ref="file" @change="onFileChange" class="hidden" multiple />
                                    <div class="relative cursor-pointer" @click="triggerFileInput">
                                        <Icon name="ic:outline-drive-folder-upload" class="h-36 w-36"
                                            aria-hidden="true" />
                                        <div
                                            class="rounded-full absolute inset-0 bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity">
                                            <div class="flex items-center w-full h-full justify-center text-xs">
                                                {{ $t('selectFiles') }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="state.formEmail.files && state.formEmail.files.length"
                                    class="mt-2 text-sm text-gray-700">
                                    <ul class="list-disc pl-5">
                                        <li v-for="(file, fileIndex) in state.formEmail.files" :key="fileIndex">
                                            {{ file.name }} ({{ (file.size / 1024).toFixed(1) }} KB)
                                        </li>
                                    </ul>
                                </div>
                                <FormError :error="state?.error?.errors?.files?.[0]" class="text-center" />
                            </div>
                            <div class="space-y-3"
                                v-if="state.formEmail.fileOption === 'Attach file from citizen\'s folder'">
                                <div class="space-y-1">
                                    <FormLabel for="citizen_uuid" :label="$t('mail.form.attachFiles.citizen')" />
                                    <FormSelectMultiple id="citizen_uuid" v-model="state.formEmail.citizens_uuid"
                                        :options="state.options.citizens" />
                                    <FormError :error="v$?.formEmail?.citizens_uuid?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.citizens_uuid?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="citizen_files" :label="$t('mail.form.attachFiles.citizenFiles')" />
                                    <FormSelectMultiple id="citizen_files" v-model="state.formEmail.citizen_files"
                                        :options="state.options.citizen_files" />
                                    <FormError :error="v$?.formEmail?.citizen_files?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.citizen_files?.[0]" />
                                </div>
                            </div>
                            <div class="space-y-1"
                                v-if="state.formEmail.fileOption === 'Attach file from organization\'s folder'">
                                <div class="space-y-1">
                                </div>
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                    @click="emit('close')">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                                    {{ $t('mail.form.send') }}
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
import { citizenService } from '@/components/api/user/CitizenService'
import { citizenDocumentService } from '@/components/api/user/CitizenDocumentService'
import { mailSMTPService } from '@/components/api/user/MailSMTPService'
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
    selectedContact: {
        type: Object,
        required: false,
    },
})

const emit = defineEmits(['close', 'refreshSentEmails'])
const { successAlert } = useAlert()
const { t } = useI18n()
const file = ref<HTMLInputElement | null>(null)

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formEmail: {
        recipient: [] as any,
        subject: '',
        content: '',
        encrypt_message: false,
        password: '',
        password_hint: '',
        fileOption: 'Attach file from computer',
        files: [] as File[],
        citizens_uuid: [],
        citizen_files: [],
    },
    options: {
        attachFilesOptions: [
            { id: 'Attach file from computer', title: 'Attach file from computer' },
            { id: 'Attach file from citizen\'s folder', title: 'Attach file from citizen\'s folder' },
            { id: 'Attach file from organization\'s folder', title: 'Attach file from organization\'s folder' },
        ],
        citizens: [] as any,
        citizen_files: [] as any,
    }
})

watch(() => props.selectedContact, (selectedContact: any) => {
    if (selectedContact?.email) {
        state.formEmail.recipient = [selectedContact.email]
    }
})

const rules = computed(() => {
    if (state.formEmail.encrypt_message) {
        return {
            formEmail: {
                recipient: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                subject: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                content: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                password: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    } else {
        return {
            formEmail: {
                recipient: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                subject: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                content: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

watch(() => state.formEmail.fileOption, (fileOption: any) => {
    if (fileOption === 'Attach file from citizen\'s folder') {
        fetchAllCitizens()
    }
})

watch(() => state.formEmail.citizens_uuid, (fileOption: any) => {
    fetchAllCitizenFiles()
})

function closeModal() {
    emit('close')
}

function triggerFileInput() {
    if (file.value) {
        file.value.click()
    }
}

function onFileChange(event: Event) {
    const input = event.target as HTMLInputElement
    const files = input.files ? Array.from(input.files) : []
    state.formEmail.files = files
}

async function fetchAllCitizens() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {}
        const response = await citizenService.getAllCitizensPerCurrentUserAssignment(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item?.uuid,
                    label: item.firstname + " " + (item.lastname ? item.lastname : ''),
                })
            )
            state.options.citizens = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchAllCitizenFiles() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizens_uuid: state.formEmail.citizens_uuid,
        }
        const response = await citizenDocumentService.getAllFilesPerCitizen(params)
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.citizen_files = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        sendEmail()
    }
}

async function sendEmail() {
    state.error = {}
    state.isPageLoading = true
    try {
        const formData = new FormData()
        formData.append('recipient', JSON.stringify(state.formEmail.recipient))
        formData.append('subject', state.formEmail.subject)
        formData.append('content', state.formEmail.content)
        if (state.formEmail.encrypt_message) {
            formData.append('is_encrypted', String(state.formEmail.encrypt_message))
            formData.append('password', state.formEmail.password)
            formData.append('password_hint', state.formEmail.password_hint)
        }
        state.formEmail.files.forEach((f) => formData.append('files[]', f))
        const response = await mailSMTPService.sendMail(formData)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('mail.form.alert.emailSuccessfullySent')}.`)
            emit('refreshSentEmails')
            state.formEmail = {
                recipient: [],
                subject: '',
                content: '',
                encrypt_message: false,
                password: '',
                password_hint: '',
                fileOption: 'Attach file from computer',
                files: [],
                citizens_uuid: [],
                citizen_files: [],
            }
            v$.value.$reset()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>

<style>
#formEmail .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>