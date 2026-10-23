<template>
    <div>
        <Modal size="sm" :title="hasHourTypes ? $t('citizens.timeRegistration.selectHourType') : $t('citizens.timeRegistration.selectType')"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div>
                    <div>
                        <p>{{ hasHourTypes ? $t('citizens.timeRegistration.selectHourTypeMessage') : $t('citizens.timeRegistration.selectTypeMessage') }}</p>
                    </div>
                    <div class="mt-6">
                        <!-- One button per hour type the company uses (Kontakttimer (ATA),
                             other time, supervision...); else the plain work button. -->
                        <div v-if="hasHourTypes" class="grid grid-cols-1 gap-2">
                            <FormButton v-for="type in props.hourTypes" :key="type.uuid" type="button" buttonStyle="action"
                                class="w-full justify-center" @click="emit('openWork', type.uuid); closeModal()">
                                {{ type.name }}
                            </FormButton>
                            <FormButton v-if="props.showTransport" type="button" buttonStyle="primary" class="w-full"
                                @click="emit('openTransport'); closeModal()">
                                {{ $t('citizens.timeRegistration.transport') }}
                            </FormButton>
                        </div>
                        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="primary" @click="emit('openWork'); closeModal()">
                                {{ $t('citizens.timeRegistration.work') }}
                            </FormButton>
                            <FormButton v-if="props.showTransport" type="button" buttonStyle="primary" class="w-full"
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
import type { CareHourType } from '@/composables/careHourTypes'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    // The hour types to choose from at check-in; empty for the plain choice.
    hourTypes: {
        type: Array as () => CareHourType[],
        default: () => [],
    },
    showTransport: {
        type: Boolean,
        default: true,
    },
})
const emit = defineEmits(['close', 'openTransport', 'openWork'])

const hasHourTypes = computed(() => props.hourTypes.length > 0)

function closeModal() {
    emit('close')
}
</script>
