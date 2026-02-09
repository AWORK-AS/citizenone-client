<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <form @submit.prevent="submitForm()" class="mt-6">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />
            <div class="space-y-3">
                <div class="space-y-1">
                    <FormLabel for="date" :label="$t('dutySchedules.extraHours.form.date')" />
                    <FormDateField id="date" name="date" :placeholder="$t('dutySchedules.extraHours.form.date')"
                        v-model="state.formExtraHours.date" />
                    <FormError :error="v$?.formExtraHours?.date?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.date?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="type" :label="$t('dutySchedules.extraHours.form.type.type')" />
                    <FormSelect id="type" name="type" :options="state.options.extraHoursTypes"
                        v-model="state.formExtraHours.type" />
                    <FormError :error="v$?.formExtraHours?.type?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.extra_hours_type?.[0]" />
                </div>
                <div class="space-y-1">
                    <div class="flex justify-between items-center py-0.5">
                        <FormLabel for="tags" :label="$t('dutySchedules.extraHours.form.tags')" />
                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                            @click="state.modal.isAddExtraHoursTagsOpen = true">
                            {{ $t('extraHoursTags.addNewExtraHoursTag') }}
                        </span>
                    </div>
                    <FormSelectMultiple id="type" name="type" :options="state.options.extraHoursTags"
                        v-model="state.formExtraHours.extra_hours_tags" />
                    <FormError :error="v$?.formExtraHours?.extra_hours_tags?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.extra_hours_tags_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="hours" :label="$t('dutySchedules.extraHours.form.hours')" />
                    <FormTextField id="hours" name="hours" :placeholder="$t('dutySchedules.extraHours.form.hours')"
                        v-model="state.formExtraHours.hours" />
                    <FormError :error="v$?.formExtraHours?.hours?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.extra_hours?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="note" :label="$t('dutySchedules.extraHours.form.note')" />
                    <FormTextArea id="note" name="note" :placeholder="$t('dutySchedules.extraHours.form.note')"
                        v-model="state.formExtraHours.note" />
                    <FormError :error="v$?.formExtraHours?.note?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.note?.[0]" />
                </div>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                        {{ props.formType === 'create' ? $t('save') :
                            $t('update') }}
                    </FormButton>
                </div>
            </div>
        </form>
        <ModulesUserExtraHoursTagModalNew :isModalOpen="state.modal.isAddExtraHoursTagsOpen"
            @close="state.modal.isAddExtraHoursTagsOpen = false" @refreshAbsences="fetchExtraHoursTags" />
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { extraHoursTagService } from '@/components/api/user/ExtraHoursTagService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useDepartmentStore } from '@/store/department'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedExtraHoursRequest: {
        type: Object,
        required: true,
    }
})
const emit = defineEmits(['isPageLoading', 'submitForm', 'closeModal'])
const { t } = useI18n()
const language = useI18n()
const departmentStore = useDepartmentStore() as any

const state = reactive({
    error: {} as Error,
    formExtraHours: {
        date: props.selectedExtraHoursRequest?.date || '',
        type: props.selectedExtraHoursRequest?.extra_hours_type || '',
        extra_hours_tags: props.selectedExtraHoursRequest?.extra_hours_tags || [],
        hours: props.selectedExtraHoursRequest?.extra_hours || '',
        note: props.selectedExtraHoursRequest?.note || '',
    },
    isPageLoading: false,
    modal: {
        isAddExtraHoursTagsOpen: false,
    },
    options: {
        extraHoursTags: [] as any,
        extraHoursTypes: [
            { value: 'add', label: `${t('dutySchedules.extraHours.form.type.add')}`, },
            { value: 'deduct', label: `${t('dutySchedules.extraHours.form.type.deduct')}`, },
        ],
    }
})

onMounted(() => {
    fetchExtraHoursTags()
})

watch(() => language.locale.value, () => {
    state.options.extraHoursTypes = [
        { value: 'add', label: `${t('dutySchedules.extraHours.form.type.add')}`, },
        { value: 'deduct', label: `${t('dutySchedules.extraHours.form.type.deduct')}`, },
    ]
})

function closeModal() {
    emit('closeModal')
}

const rules = computed(() => {
    return {
        formExtraHours: {
            date: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            type: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            hours: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            note: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formExtraHours)
    }
}

async function fetchExtraHoursTags() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName,
        }
        const response = await extraHoursTagService.getAllExtraHoursTags(params)
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.extraHoursTags = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>