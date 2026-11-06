<template>
    <div>
        <Modal size="xs" :title="title" :show="props.isModalOpen" @close="emit('close')">
            <template #modal-body>
                <p>{{ message }}</p>
                <div class="mt-5 flex flex-col gap-3 sm:flex-row">
                    <FormButton buttonStyle="cancel" @click="emit('close')" class="w-full">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton v-if="noFreeSeats" buttonStyle="primary" @click="buy" class="w-full">
                        {{ $t('archived.reopenEmployee.buyLicence') }}
                    </FormButton>
                    <FormButton :buttonStyle="noFreeSeats ? 'secondary' : 'primary'" @click="confirm" class="w-full">
                        {{ noFreeSeats
                            ? $t('archived.reopenEmployee.reopenWithoutLicence')
                            : $t('archived.reopenEmployee.reopen') }}
                    </FormButton>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { useI18n } from 'vue-i18n'

// Asked before an archived employee is reopened, so the admin knows whether
// they will get a user licence. freeSeats null means the count could not be
// fetched: then it is a plain "are you sure", and the warning the reopen
// itself returns is the safety net.
const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    name: {
        type: String,
        default: '',
    },
    freeSeats: {
        type: Number as PropType<number | null>,
        default: null,
    },
})

const emit = defineEmits(['close', 'confirm', 'buy'])
const { t } = useI18n()

const noFreeSeats = computed(() => props.freeSeats === 0)

const title = computed(() => t('archived.reopenEmployee.title'))

const message = computed(() => {
    if (props.freeSeats === null) {
        return `${t('archived.confirmation.unarchiveEmployee')}?`
    }
    if (props.freeSeats === 0) {
        return t('archived.reopenEmployee.noFreeSeats', { name: props.name })
    }
    return t('archived.reopenEmployee.freeSeats', { name: props.name, n: props.freeSeats }, props.freeSeats)
})

function confirm() {
    emit('confirm')
    emit('close')
}

function buy() {
    emit('buy')
    emit('close')
}
</script>
