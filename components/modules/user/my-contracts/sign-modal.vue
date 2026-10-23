<template>
    <!--
        Task #33: the employee signs a contract sent to them. They read it, confirm they accept
        it and type their full name; the server keeps the time, IP, device and a fingerprint of
        the exact file as evidence.
    -->
    <Modal size="md" :title="$t('myContracts.signTitle')" titleIcon="ph:signature" titleIconColor="174560"
        :show="props.isModalOpen" @close="emit('close')">
        <template #modal-body>
            <form class="space-y-5" data-testid="contract-sign-form" @submit.prevent="sign">
                <div class="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
                    <span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#174560]/10 text-[#174560]">
                        <Icon name="ph:file-text" class="size-5" />
                    </span>
                    <div class="min-w-0 flex-1">
                        <p class="truncate font-semibold text-gray-900">{{ props.contract?.name }}</p>
                        <p class="text-xs text-gray-500">
                            {{ $t('myContracts.sentBy', { name: props.contract?.signature?.requested_by_name || '—', date: formatDate(props.contract?.signature?.requested_at) }) }}
                        </p>
                    </div>
                    <FormButton type="button" buttonStyle="action" class="shrink-0 !w-auto"
                        data-testid="contract-read" @click="openContract">
                        <Icon name="ph:book-open-text" class="size-4" />
                        {{ $t('myContracts.view') }}
                    </FormButton>
                </div>

                <p class="flex items-center gap-2 text-sm" :class="state.hasRead ? 'text-[#2E9E33]' : 'text-gray-600'">
                    <Icon :name="state.hasRead ? 'ph:check-circle-fill' : 'ph:info'" class="size-4 shrink-0" />
                    {{ $t('myContracts.readFirst') }}
                </p>

                <Alert type="danger" :text="state.error" v-if="state.error" />

                <label class="flex items-start gap-3" :class="state.hasRead ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'">
                    <input v-model="state.accepted" type="checkbox" :disabled="!state.hasRead"
                        data-testid="contract-accept"
                        class="mt-0.5 h-5 w-5 rounded border-gray-300 text-[#174560] focus:ring-[#174560]" />
                    <span class="text-sm font-medium text-gray-800">{{ $t('myContracts.accept') }}</span>
                </label>

                <div class="space-y-1">
                    <FormLabel for="signed_name" :label="$t('myContracts.nameLabel')" />
                    <input id="signed_name" v-model="state.signedName" type="text" autocomplete="name"
                        :disabled="!state.hasRead" data-testid="contract-signed-name" @input="state.fieldError = ''"
                        class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-lg italic outline-none focus:border-[#174560] disabled:bg-gray-50"
                        :placeholder="fullName" />
                    <p class="text-xs text-gray-500">{{ $t('myContracts.nameHint', { name: fullName }) }}</p>
                    <FormError :error="state.fieldError" />
                </div>

                <p class="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">{{ $t('myContracts.evidence') }}</p>

                <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <FormButton type="button" buttonStyle="cancel" @click="emit('close')">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary" class="w-full" :disabled="!canSign || state.isSigning"
                        data-testid="contract-sign">
                        <Icon :name="state.isSigning ? 'ph:spinner-gap' : 'ph:signature'" class="size-4"
                            :class="{ 'animate-spin': state.isSigning }" />
                        {{ $t('myContracts.sign') }}
                    </FormButton>
                </div>
            </form>

            <ModulesUserDocumentDocsFileModalPreview :isModalOpen="state.isPreviewOpen" :selectedDocument="props.contract || {}"
                :loadFile="loadContract" :downloadFile="loadContract" :canDownload="true"
                @close="state.isPreviewOpen = false" />
        </template>
    </Modal>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { employeeDocumentService } from '@/components/api/user/EmployeeDocumentService'
import { useUserStore } from '@/store/user'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    contract: {
        type: Object,
        default: null,
    },
})

const emit = defineEmits(['close', 'signed'])
const { t } = useI18n()
const userStore = useUserStore()

const fullName = computed(() => `${userStore.getUser?.firstname ?? ''} ${userStore.getUser?.lastname ?? ''}`.trim())

const state = reactive({
    hasRead: false,
    isPreviewOpen: false,
    accepted: false,
    signedName: '',
    isSigning: false,
    error: '',
    fieldError: '',
})

const canSign = computed(() => state.hasRead && state.accepted && state.signedName.trim().length > 0)

watch(() => props.isModalOpen, (isOpen) => {
    if (isOpen) {
        state.hasRead = false
        state.accepted = false
        state.signedName = ''
        state.error = ''
        state.fieldError = ''
    }
})

function formatDate(value: string | null | undefined): string {
    return value ? moment(value).format('DD-MM-YYYY') : ''
}

function loadContract(contract: any): Promise<Blob | null> {
    return employeeDocumentService.viewMyContract(contract?.uuid)
}

// Signing opens up once the contract has been opened.
function openContract() {
    state.isPreviewOpen = true
    state.hasRead = true
}

async function sign() {
    if (!canSign.value || !props.contract?.uuid) return
    state.isSigning = true
    state.error = ''
    state.fieldError = ''
    try {
        const response = await employeeDocumentService.signMyContract(props.contract.uuid, {
            accepted: state.accepted,
            signed_name: state.signedName,
        })
        if (response?.data) {
            emit('signed', response.data)
        }
    } catch (error: any) {
        state.fieldError = error?.errors?.signed_name?.[0] ?? ''
        state.error = state.fieldError ? '' : (error?.message || t('myContracts.loadFailed'))
    }
    state.isSigning = false
}
</script>
