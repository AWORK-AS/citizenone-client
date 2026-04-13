<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <form @submit.prevent="submitForm()" class="mt-6" id="formExtraHours">
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
                    <FormSelectMultiple id="tags" name="tags" :options="state.options.extraHoursTags"
                        v-model="state.formExtraHours.extra_hours_tags" />
                    <FormError :error="v$?.formExtraHours?.extra_hours_tags?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.extra_hours_tags_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <div class="flex justify-between items-center py-0.5">
                        <p class="text-sm text-gray-600">
                            {{
                                customPagesStore.getCustomPagesName?.department ??
                                $t('dutySchedules.extraHours.form.department')
                            }}
                        </p>
                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                            @click="state.modal.isAddDepartmentOpen = true">
                            {{ $t('departments.addNewDepartment') }}
                        </span>
                    </div>
                    <FormSelectMultiple id="department" name="department" :options="state.options.departments"
                        v-model="state.formExtraHours.department_uuids" />
                    <FormError :error="props?.error?.errors?.department_uuids?.[0]" />
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
                    <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary">
                        {{ props.formType === 'create' ? $t('save') :
                            $t('update') }}
                    </FormButton>
                </div>
            </div>
        </form>
        <ModulesUserDepartmentModalNew :isModalOpen="state.modal.isAddDepartmentOpen"
            @close="state.modal.isAddDepartmentOpen = false" @refreshDepartments="fetchDepartments" />
        <ModulesUserExtraHoursTagModalNew :isModalOpen="state.modal.isAddExtraHoursTagsOpen"
            @close="state.modal.isAddExtraHoursTagsOpen = false" @refreshExtraHoursTags="fetchExtraHoursTags" />
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { extraHoursTagService } from '@/components/api/user/ExtraHoursTagService'
import { departmentService } from '@/components/api/user/DepartmentService'
import { useCustomPagesStore } from '@/store/custom-pages'
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
const customPagesStore = useCustomPagesStore() as any
const departmentStore = useDepartmentStore() as any

const state = reactive({
    error: {} as Error,
    formExtraHours: {
        date: props.selectedExtraHoursRequest?.date || '',
        type: props.selectedExtraHoursRequest?.extra_hours_type || '',
        extra_hours_tags: [],
        hours: props.selectedExtraHoursRequest?.extra_hours || '',
        note: props.selectedExtraHoursRequest?.note || '',
        department_uuids: [],
    } as any,
    isPageLoading: false,
    modal: {
        isAddDepartmentOpen: false,
        isAddExtraHoursTagsOpen: false,
    },
    options: {
        departments: [] as any,
        extraHoursTags: [] as any,
        extraHoursTypes: [
            { value: 'add', label: `${t('dutySchedules.extraHours.form.type.add')}`, },
            { value: 'deduct', label: `${t('dutySchedules.extraHours.form.type.deduct')}`, },
        ],
    }
})

onMounted(() => {
    fetchExtraHoursTags()
    fetchDepartments()
    props.selectedExtraHoursRequest?.tags?.forEach((tag: any) => {
        state.formExtraHours.extra_hours_tags.push(tag?.uuid)
    })
    props.selectedExtraHoursRequest?.departments?.forEach((dept: any) => {
        state.formExtraHours.department_uuids.push(dept?.uuid)
    })
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

async function fetchDepartments() {
    try {
        const response = await departmentService.getAllDepartments({})
        if (response) {
            state.options.departments = response.data.map((item: any) => ({
                value: item.uuid,
                label: item.name,
            }))
        }
    } catch (error: any) {
        state.error = error
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
                    label: item.tag,
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

<style>
#formExtraHours .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>