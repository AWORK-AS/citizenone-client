<template>
    <div>
        <Modal size="sm" :title="props.title ? props.title : $t('confirmation')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div class="space-y-3">
                    <p>
                        {{ $t('citizens.useOfForce.confirmation.reportConfirmation') }}?
                    </p>
                    <div class="px-3 text-justify space-y-2">
                        <div class="text-sm">
                            <span>
                                - {{ $t('citizens.useOfForce.confirmation.byClickingYesText') + ' ' }}
                            </span>
                            <span class="text-primary cursor-pointer hover:text-primary-700"
                                @click="navigateToSocialForm()">
                                {{ $t('citizens.useOfForce.confirmation.socialOfBoligstyrelsensWebsite') }},
                            </span>
                            <span class="lowercase">
                                {{ $t('citizens.useOfForce.confirmation.whereYouCanDownloadText') }}.
                            </span>
                        </div>
                        <p class="text-sm">
                            - {{ $t('citizens.useOfForce.confirmation.inAdditionText') }}.
                        </p>
                    </div>
                </div>
                <div class="mt-5 flex gap-x-3">
                    <FormButton @click="closeModal" class="w-full rounded-md">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton buttonStyle="primary" @click="handleConfirmation" class="w-full rounded-md">
                        {{ $t('yes') }}
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

function closeModal() {
    emit('close')
}

function handleConfirmation() {
    emit('confirm')
    emit('close')
}

async function navigateToSocialForm() {
    await navigateTo('https://www.sbst.dk/tvaergaende-omrader/magtanvendelse/skemaer-til-indberetning', {
        external: true,
        open: {
            target: '_blank',
        }
    })
}
</script>