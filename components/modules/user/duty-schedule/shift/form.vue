<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="en_name" :label="$t('shifts.form.nameEnglish')" />
                <FormTextField id="en_name" name="en_name" :placeholder="$t('shifts.form.nameEnglish')"
                    v-model="state.formShift.en_name" />
                <FormError :error="v$?.formShift?.en_name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.en_name?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="dk_name" :label="$t('shifts.form.nameDanish')" />
                <FormTextField id="dk_name" name="dk_name" :placeholder="$t('shifts.form.nameDanish')"
                    v-model="state.formShift.dk_name" />
                <FormError :error="v$?.formShift?.dk_name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.dk_name?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="pay_code" :label="$t('shifts.form.paycode')" />
                <FormTextField id="pay_code" name="pay_code" :placeholder="$t('shifts.form.paycode')"
                    v-model="state.formShift.pay_code" />
                <FormError :error="v$?.formShift?.pay_code?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.pay_code?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="time_in" :label="$t('shifts.form.timeIn')" />
                <FormTimeField id="time_in" name="time_in" :placeholder="$t('shifts.form.timeIn')"
                    v-model="state.formShift.time_in" />
                <FormError :error="v$?.formShift?.time_in?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.time_in?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="time_out" :label="$t('shifts.form.timeOut')" />
                <FormTimeField id="time_out" name="time_out" :placeholder="$t('shifts.form.timeOut')"
                    v-model="state.formShift.time_out" />
                <FormError :error="v$?.formShift?.time_out?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.time_out?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="color" :label="$t('shifts.form.color')" />
                <FormColorPicker id="color" v-model="state.formShift.color" />
                <FormError :error="v$?.formShift?.color?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.color?.[0]" />
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                    @click="navigateTo('/settings/shifts')">
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
    selectedShift: {
        type: Object,
        required: false,
    },
})

const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formShift: {
        en_name: '',
        dk_name: '',
        pay_code: '',
        time_in: '',
        time_out: '',
        color: '#000000',
    },
})

watch(() => props.selectedShift, (newValue: any) => {
    if (newValue != null) {
        state.formShift = {
            en_name: newValue.en_name,
            dk_name: newValue.dk_name,
            pay_code: newValue.pay_code,
            time_in: newValue.time_in,
            time_out: newValue.time_out,
            color: newValue.color,
        }
    }
})

const rules = computed(() => {
    return {
        formShift: {
            en_name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            dk_name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            time_in: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            time_out: {
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
        emit('submitForm', state.formShift)
    }
}
</script>