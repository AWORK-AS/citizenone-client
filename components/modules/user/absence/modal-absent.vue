<template>
    <div>
        <Modal size="sm" :title="$t('absences.markAsAbsent')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm()" id="formAbsence">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-1">
                            <div class="flex justify-between items-center py-0.5">
                                <FormLabel for="absence" :label="$t('absences.form.absence')" />
                                <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                                    @click="state.modal.isAddAbsenceOpen = true">
                                    {{ $t('absences.addNewAbsence') }}
                                </span>
                            </div>
                            <FormSelect id="absence" :options="state.options.absences"
                                v-model="state.formAbsence.absence" />
                            <FormError :error="v$?.formAbsence?.absence?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.absence?.[0]" />
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                                    {{ $t('save') }}
                                </FormButton>
                            </div>
                        </div>
                    </form>
                </LoadingSpinner>
                <ModulesUserAbsenceModalNew :isModalOpen="state.modal.isAddAbsenceOpen"
                    @close="state.modal.isAddAbsenceOpen = false" @refreshAbsences="fetchAbsences" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { absenceService } from '@/components/api/AbsenceService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshAbsences', 'markAsAbsent'])

const state = reactive({
    error: {} as Error,
    formAbsence: {
        absence: '',
    },
    isPageLoading: false,
    modal: {
        isAddAbsenceOpen: false,
    },
    options: {
        absences: [],
    }
})

function closeModal() {
    emit('close')
}

watch(() => props.isModalOpen, (newValue: any) => {
    if (newValue) {
        fetchAbsences()
    }
})

const rules = computed(() => {
    return {
        formAbsence: {
            absence: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

async function fetchAbsences() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await absenceService.getAllAbsences()
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.absences = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('markAsAbsent', state.formAbsence)
        state.formAbsence.absence = ''
        v$.value.$reset()
    }
}
</script>

<style>
#formAbsence .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>