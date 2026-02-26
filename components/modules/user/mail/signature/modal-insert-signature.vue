<template>
    <div>
        <Modal size="md" :title="$t('mail.insertSignature')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div id="formSelectJournalContent" class="space-y-3">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-1">
                            <div class="flex justify-between items-center py-0.5">
                                <FormLabel for="signature" :label="$t('journalContents.form.name')" />
                                <!-- <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                                    @click="state.modal.isAddJournalContentOpen = true">
                                    {{ $t('journalContents.newJournalContent') }}
                                </span> -->
                            </div>
                            <FormSelect id="signature" v-model="state.selectedSignature"
                                :options="state.options.signatures" />
                        </div>
                    </div>
                    <div class="mt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" class="rounded-md" @click="setSignature">
                                {{ $t('select') }}
                            </FormButton>
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { signatureService } from '@/components/api/user/SignatureService'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'setSignature'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    options: {
        signatures: [] as any,
    },
    selectedSignature: {} as any,
})

function closeModal() {
    emit('close')
}

watch(() => props.isModalOpen, (isModalOpen: any) => {
    if (isModalOpen) {
        fetchAllSignatures()
    }
})

async function fetchAllSignatures() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await signatureService.getAllSignatures()
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item?.uuid,
                    label: item?.name,
                    signature: item?.signature,
                })
            )
            state.options.signatures = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function setSignature() {
    const selectedSignature = state.options.signatures.find((signature: any) => signature.value === state.selectedSignature)
    emit('setSignature', selectedSignature ?? null)
    closeModal()
}
</script>