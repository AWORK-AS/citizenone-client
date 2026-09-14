<template>
    <div>
        <Modal size="sm" :title="$t('mileageLog.correction.correctDistance')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isSaving">
                    <div>
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />

                        <!-- Context the corrector needs before typing a number: what the
                             server computed, how it got there, and - if the row was
                             flagged - why it could not be trusted. -->
                        <div class="space-y-1 my-1">
                            <FormLabel :label="$t('mileageLog.correction.calculatedDistance')" />
                            <p class="text-sm font-semibold text-gray-700">
                                {{ formatNumber(locale, calculatedKilometers) }} km
                            </p>
                            <p class="text-xs text-gray-400">{{ distanceSourceLabel }}</p>
                        </div>

                        <div class="space-y-1 my-2" v-if="props.selectedMileageLog?.needs_review">
                            <div class="flex items-start gap-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                                <Icon name="ph:warning-circle" class="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                <div>
                                    <p class="text-sm font-semibold text-red-700">
                                        {{ $t('mileageLog.table.needsReview') }}
                                    </p>
                                    <p class="text-xs text-red-700 mt-0.5"
                                        v-if="props.selectedMileageLog?.review_reason_label">
                                        {{ props.selectedMileageLog.review_reason_label }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form @submit.prevent="submitCorrection()">
                            <div class="space-y-3 mt-3">
                                <div class="space-y-1">
                                    <FormLabel for="kilometers" :label="$t('mileageLog.correction.correctedDistance')" />
                                    <FormNumberField id="kilometers" name="kilometers" :min="0"
                                        :placeholder="$t('mileageLog.correction.correctedDistance')"
                                        v-model="state.form.kilometers" />
                                    <FormError
                                        :error="v$?.form?.kilometers?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.kilometers?.[0]" />
                                </div>

                                <div class="space-y-1">
                                    <FormLabel for="reason" :label="$t('mileageLog.correction.reason')" />
                                    <FormTextArea id="reason" name="reason" :rows="3"
                                        :placeholder="$t('mileageLog.correction.reason')"
                                        v-model="state.form.reason" />
                                    <FormError :error="v$?.form?.reason?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.reason?.[0]" />
                                </div>
                            </div>

                            <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary">
                                    {{ $t('save') }}
                                </FormButton>
                            </div>
                        </form>

                        <!-- Reverting is only ever offered on a row that actually carries an
                             override; on a never-corrected row there is nothing to revert to. -->
                        <div class="mt-4 pt-4 border-t border-gray-200" v-if="props.selectedMileageLog?.is_distance_overridden">
                            <FormButton type="button" buttonStyle="danger" @click="state.isRevertConfirmOpen = true">
                                <Icon name="ph:arrow-counter-clockwise" class="size-4" />
                                {{ $t('mileageLog.correction.revertToCalculated') }}
                            </FormButton>
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>

        <DialogConfirmation :isModalOpen="state.isRevertConfirmOpen"
            :message="`${$t('mileageLog.correction.confirmRevert')}?`"
            @close="state.isRevertConfirmOpen = false" @confirm="revertCorrection" />
    </div>
</template>

<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { required, minValue, helpers } from '@vuelidate/validators'
import { useI18n } from 'vue-i18n'
import { mileageLogService } from '@/components/api/user/MileageLogService'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedMileageLog: {
        type: Object as PropType<Record<string, any> | null>,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshMileageLog'])

const { t, locale } = useI18n()
const { formatNumber } = useNumberFormatter()
const { successAlert } = useAlert()

const state = reactive({
    error: {} as Error,
    isSaving: false,
    isRevertConfirmOpen: false,
    // FormNumberField models a string (it is a raw <input type="number">), so
    // keep it one here and cast on submit rather than fighting the component.
    form: {
        kilometers: '' as string,
        reason: '' as string,
    },
})

// On an already-corrected row, `kilometers` is the human figure and
// kilometers_calculated is what the machine last produced -- so this is what to
// show as "calculated", never the corrected number relabelled as one. On a
// never-corrected row the two are the same thing.
const calculatedKilometers = computed(() => {
    const log = props.selectedMileageLog
    if (!log) return 0
    return log.kilometers_calculated ?? log.kilometers ?? 0
})

// distance_source_label is null on every row created before the provenance
// deploy -- render that as unknown provenance, never blank and never as "GPS".
const distanceSourceLabel = computed(() => {
    return props.selectedMileageLog?.distance_source_label || t('mileageLog.table.distanceSourceUnknown')
})

const rules = computed(() => {
    return {
        form: {
            kilometers: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                // FormNumberField's own `min` already clamps the widget; this
                // catches a value typed past it (paste, autofill) before the
                // backend's own min:0 has to.
                minValue: helpers.withMessage(() => `${t('validation.invalidNumber')}.`, minValue(0)),
            },
            reason: {
                // Required, matching the backend. An unexplained change to a
                // reimbursement figure is exactly what must not be possible.
                required: helpers.withMessage(() => `${t('mileageLog.correction.reasonRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

// Prefill with the figure currently in effect (the corrected one on an
// already-corrected row), so re-opening the modal shows what is actually stored
// rather than resetting the manager back to the machine's guess.
watch(() => props.isModalOpen, (isOpen: boolean) => {
    if (!isOpen) return
    state.error = {}
    state.form.kilometers = props.selectedMileageLog?.kilometers != null
        ? String(props.selectedMileageLog.kilometers)
        : ''
    state.form.reason = props.selectedMileageLog?.kilometers_override_reason ?? ''
    v$.value.$reset()
}, { immediate: true })

function closeModal() {
    emit('close')
}

async function submitCorrection() {
    state.error = {}
    const isValid = await v$.value.$validate()
    if (!isValid) return

    state.isSaving = true
    try {
        const response = await mileageLogService.setMileageLogDistance(props.selectedMileageLog?.uuid, {
            kilometers: Number(state.form.kilometers),
            reason: state.form.reason,
        })
        if (response?.data) {
            emit('refreshMileageLog')
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('mileageLog.alert.distanceCorrected')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

async function revertCorrection() {
    state.error = {}
    state.isSaving = true
    try {
        const response = await mileageLogService.clearMileageLogDistance(props.selectedMileageLog?.uuid)
        if (response?.data) {
            emit('refreshMileageLog')
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('mileageLog.alert.distanceReverted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}
</script>
