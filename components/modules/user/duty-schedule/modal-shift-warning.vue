<template>
    <div>
        <Modal size="sm" :title="$t('dutySchedules.shiftWarning.warning')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div>
                    <Alert type="warning" :text="$t('dutySchedules.shiftWarning.warningsFound')" />
                    <div>
                        <ul class="space-y-3">
                            <li v-for="item in props.warnings">
                                <p class="text-sm">{{ locale === 'en' ? item?.message_en : item?.message_dk }}</p>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="mt-5 flex justify-end">
                    <FormButton buttonStyle="cancel" @click="closeModal">
                        {{ $t('close') }}
                    </FormButton>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    warnings: {
        type: Object,
        required: false,
        default: () => [],
    },
})

const emit = defineEmits(['close'])
const { t, locale } = useI18n()

function closeModal() {
    emit('close')
}
</script>