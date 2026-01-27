<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-xl" id="formCalendarTag">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="name" :label="$t('calendarTags.form.name')" />
                <FormTextField id="name" name="name" :placeholder="$t('calendarTags.form.name')"
                    v-model="state.formTag.name" />
                <FormError :error="v$?.formTag?.name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.name?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="flex justify-between items-center py-0.5">
                    <FormLabel for="departments"
                        :label="customPagesStore.getCustomPagesName?.department ?? $t('citizens.form.department')" />
                    <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                        @click="state.modal.isAddDepartmentOpen = true">
                        {{ $t('departments.addNewDepartment') }}
                    </span>
                </div>
                <FormSelectMultiple id="departments" :options="state.options.departments"
                    v-model="state.formTag.departments" />
                <FormError :error="v$?.formTag?.departments?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.departments_uuid?.[0]" />
            </div>
            <div class="space-y-1 flex items-center gap-x-1">
                <FormLabel for="color" :label="$t('calendarTags.form.color')" />
                <FormColorPicker id="color" v-model="state.formTag.color" />
                <FormError :error="v$?.formTag?.color?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.color?.[0]" />
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                    @click="navigateTo('/settings/calendar-tags')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
        <ModulesUserDepartmentModalNew :isModalOpen="state.modal.isAddDepartmentOpen"
            @close="state.modal.isAddDepartmentOpen = false" @refreshDepartments="fetchDepartments" />
    </form>
</template>

<script setup lang="ts">
import { departmentService } from '@/components/api/user/DepartmentService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
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
    selectedTag: {
        type: Object,
        required: false,
    },
})

const emit = defineEmits(['isPageLoading', 'submitForm'])
const customPagesStore = useCustomPagesStore() as any
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formTag: {
        name: '',
        departments: [],
        color: '#000000',
    },
    modal: {
        isAddDepartmentOpen: false,
    },
    options: {
        departments: [] as any,
    },
})

onMounted(() => {
    fetchDepartments()
})

watch(() => props.selectedTag, (newValue: any) => {
    if (newValue != null) {
        state.formTag = {
            name: newValue.name,
            departments: newValue.departments,
            color: newValue.color,
        }
    }
})

const rules = computed(() => {
    return {
        formTag: {
            name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            color: {
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
        emit('submitForm', state.formTag)
    }
}

async function fetchDepartments() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {}
        const response = await departmentService.getAllDepartments(params)
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.departments = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}
</script>

<style>
#formCalendarTag .multiselect-dropdown {
    max-height: 6rem ! important;
}
</style>