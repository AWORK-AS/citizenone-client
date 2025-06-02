<template>
    <div>
        <Modal size="xs" :title="$t('citizens.purchaseEmail.purchaseEmail')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div>
                    <p>
                        {{ $t('citizens.purchaseEmail.youAreNowBeingRedirected') }}
                    </p>
                </div>
                <div class="mt-6">
                    <FormButton buttonStyle="primary" class="rounded-md w-full" @click="closeModal">
                        {{ $t('close') }}
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
})
const emit = defineEmits(['close'])

function closeModal() {
    emit('close')
}

watch(() => props.isModalOpen, (isModalOpen: any) => {
    if (isModalOpen) {
        navigateToExternalLink('https://mit.awork.dk/service/microsoft-office-365')
    }
})

async function navigateToExternalLink(link: string) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    await navigateTo(link, {
        external: true,
        open: {
            target: '_blank',
        }
    })
}
</script>