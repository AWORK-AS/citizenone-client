<template>
    <div>
        <Modal size="sm" :title="$t('citizens.timeRegistration.selectType')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div>
                    <div>
                        <p>{{ $t('citizens.timeRegistration.selectTypeMessage') }}</p>
                    </div>
                    <div class="mt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="primary" @click="emit('openWork'); closeModal()">
                                {{ $t('citizens.timeRegistration.work') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" class="w-full"
                                @click="emit('openTransport'); closeModal()">
                                {{ $t('citizens.timeRegistration.transport') }}
                            </FormButton>
                        </div>
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
const emit = defineEmits(['close', 'openTransport', 'openWork'])

function closeModal() {
    emit('close')
}
</script>