<template>
    <div>
        <Modal size="xs" :title="props.title ? props.title : $t('confirmation')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div class="space-y-1">
                    <div class="w-fit flex items-center cursor-pointer"
                        @click="state.formTAC.agreeToTerms = !state.formTAC.agreeToTerms">
                        <FormCheckbox :value="state.formTAC.agreeToTerms" />
                        <span class="text-sm">
                            {{ $t('register.form.iHaveReadAndAcceptThe') }}
                            <span class="cursor-pointer text-tertiary hover:text-tertiary/90" @click="navigateToTAC">
                                {{ $t('register.form.termsAndConditions') }}
                            </span>
                        </span>
                    </div>
                    <span v-if="state.agreeToTermsValidation" class="text-sm text-red-500">
                        <span>{{ $t('register.form.agreetoTAC') }}</span>
                    </span>
                </div>
                <div class="mt-5 flex gap-x-3">
                    <FormButton @click="closeModal" class="w-full rounded-md">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton buttonStyle="primary" @click="handleConfirmation" class="w-full rounded-md">
                        {{ $t('confirm') }}
                    </FormButton>
                </div>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    message: {
        type: String,
        required: false,
    },
    title: {
        type: String,
        required: false,
    },
})

const emit = defineEmits(['close', 'confirm'])

const state = reactive({
    agreeToTermsValidation: false,
    formTAC: {
        agreeToTerms: false
    }
})

watch(() => props.isModalOpen, (isModalOpen: any) => {
    if (isModalOpen) {
        state.agreeToTermsValidation = false
        state.formTAC.agreeToTerms = false
    }
})

function closeModal() {
    emit('close')
}

function handleConfirmation() {
    if (!state.formTAC.agreeToTerms) {
        state.agreeToTermsValidation = true
    } else {
        state.agreeToTermsValidation = false
        emit('confirm')
        emit('close')
    }
}

async function navigateToTAC() {
    await navigateTo('https://citizenone.dk/vilkaarogbetingelser/', {
        external: true,
        open: {
            target: '_blank',
        }
    })
}
</script>