<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="name" :label="$t('departments.form.name')" />
                <FormTextField id="name" name="name" :placeholder="$t('departments.form.name')"
                    v-model="state.formDepartment.name" />
                <FormError :error="v$?.formDepartment?.name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.name?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="shift_type_uuid" :label="$t('departments.form.shiftTypes')" />
                <FormSelectMultiple id="shift_type_uuid" :options="state.options.shifts"
                    v-model="state.formDepartment.shift_type_uuid" />
                <FormError :error="v$?.formDepartment?.shift_type_uuid?.$errors[0]?.$message.toString()" />
                <FormError :error="state?.error?.errors?.shift_type_uuid?.[0]" />
            </div>
            <div class="space-y-1 flex items-center gap-x-1">
                <FormLabel for="color" :label="$t('departments.form.color')" />
                <FormColorPicker id="color" v-model="state.formDepartment.color" />
                <FormError :error="v$?.formTag?.color?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.color?.[0]" />
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                    @click="navigateTo('/settings/departments')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import { shiftService } from '@/components/api/user/ShiftService'
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
    selectedDepartment: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])
const { t } = useI18n()
const language = useI18n()

const state = reactive({
    error: {} as Error,
    formDepartment: {
        name: '',
        shift_type_uuid: [],
        color: '#000000',
    },
    options: {
        shifts: [] as any,
    },
})

watch(() => props.selectedDepartment, (newValue: any) => {
    if (newValue != null) {
        state.formDepartment = {
            name: newValue.name,
            shift_type_uuid: newValue.shift_type_uuid,
            color: newValue.color,
        }
    }
})

onMounted(() => {
    fetchAllShifts()
})

const rules = computed(() => {
    return {
        formDepartment: {
            name: {
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
        emit('submitForm', state.formDepartment)
    }
}

async function fetchAllShifts() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const response = await shiftService.getAllShifts()
        if (response?.data) {
            let options: any = []
            response.data.forEach(
                (shift: any) => options.push({
                    value: shift?.uuid,
                    label: language.locale.value === 'en' ? shift?.en_name : shift?.dk_name,
                })
            )
            state.options.shifts = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}
</script>