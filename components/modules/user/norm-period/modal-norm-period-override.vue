<template>
    <div>
        <Modal size="sm" :title="$t('normPeriod.form.overrideNormPeriods')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div>
                    <div>
                        <ul class="space-y-3">
                            <li>
                                <p class="text-sm">{{ $t('normPeriod.form.overrideInfo1') }}</p>
                            </li>
                            <li>
                                <p class="text-sm">{{ $t('normPeriod.form.overrideInfo2') }}</p>
                            </li>
                        </ul>
                    </div>
                    <div class="mt-5 flex justify-end">
                        <FormButton buttonStyle="cancel" @click="closeModal">
                            {{ $t('close') }}
                        </FormButton>
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
</script>