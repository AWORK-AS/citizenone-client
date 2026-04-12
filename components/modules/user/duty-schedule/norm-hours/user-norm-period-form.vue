<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />

        <p class="text-sm text-gray-500 mb-4">
            {{ $t('normPeriod.modalDescription') }}
        </p>
        <div id="norm_period_uuid" class="space-y-1">
            <div class="flex justify-between items-center py-0.5">
                <FormLabel for="norm_period_uuid" :label="$t('normPeriod.form.normPeriod')" />
                <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                    @click="state.modal.isAddNewNormPeriod = true">
                    {{ $t('normPeriod.addCustomNormPeriod') }}
                </span>
            </div>
            <FormSelect id="norm_period_uuid" name="norm_period_uuid" :placeholder="$t('normPeriod.form.normPeriod')"
                :options="state.options.normPeriods" v-model="state.formNormPeriod.norm_period_uuid" />
            <FormError :error="v$?.formNormPeriod?.norm_period_uuid?.$errors[0]?.$message.toString()" />
            <FormError :error="props?.error?.errors?.norm_period_uuid?.[0]" />
        </div>
        <div class="mt-10">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="navigateTo('/settings/absences')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>

        <ModulesUserDutyScheduleNormHoursModalNormPeriodNew :isModalOpen="state.modal.isAddNewNormPeriod"
            @close="state.modal.isAddNewNormPeriod = false" @refreshNormPeriods="refreshNormPeriods" />
    </form>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import { normPeriodService } from '@/components/api/user/NormPeriodService'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedEmployee: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formNormPeriod: {
        norm_period_uuid: '',
    },
    modal: {
        isAddNewNormPeriod: false,
    },
    options: {
        normPeriods: [] as any[],
    }
})

watch(() => props.selectedEmployee, (newValue: any) => {
    if (newValue != null) {
        state.formNormPeriod.norm_period_uuid = newValue?.norm_period?.uuid ?? ''
    }
})

onMounted(() => {
    if (props.selectedEmployee?.norm_period) {
        state.formNormPeriod.norm_period_uuid = props.selectedEmployee.norm_period.uuid
    }
})

const rules = computed(() => {
    return {
        formNormPeriod: {
            norm_period_uuid: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

onMounted(() => {
    fetchNormPeriods()
})

async function fetchNormPeriods() {
    try {
        const response = await normPeriodService.getAllNormPeriods()
        if (response?.data) {
            state.options.normPeriods = response.data.map((normPeriod: any) => ({
                value: normPeriod.uuid,
                label: normPeriod.display_label,
            }))
        }
    } catch (error: any) {
        state.error = error
    }
}

async function refreshNormPeriods() {
    await fetchNormPeriods()
}

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formNormPeriod)
    }
}
</script>

<style>
#norm_period_uuid .multiselect-dropdown {
    max-height: 4.8rem !important;
}
</style>