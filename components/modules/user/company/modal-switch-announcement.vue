<template>
    <div>
        <Modal size="sm" :title="$t('company.switchCompany.switchCompany')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div class="space-y-3">
                    <h3 class="text-lg text-center font-semibold">
                        {{ $t('company.switchCompany.companySwitchTitle') }}
                    </h3>
                    <p class="text-sm">
                        {{ $t('company.switchCompany.companySwitchDescription') }}
                    </p>
                    <div class="text-center">
                        <span class="dot1 text-3xl">.</span>
                        <span class="dot2 text-3xl">.</span>
                        <span class="dot3 text-3xl">.</span>
                        <span class="dot4 text-3xl">.</span>
                        <span class="dot5 text-3xl">.</span>
                    </div>
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

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        setTimeout(() => {
            window.location.reload()
        }, 3000)
    }
})
</script>