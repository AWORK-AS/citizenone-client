<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-3xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error && props.error.length > 0 || props.error?.message" />
        <div class="grid grid-cols-1 gap-y-3">
            <div>
                <div class="space-y-1">
                    <FormLabel for="name" :label="$t('protocols.form.protocolName')" />
                    <FormTextField id="name" name="name" :placeholder="$t('protocols.form.protocolName')"
                        v-model="state.formProtocol.name" />
                    <FormError :error="v$?.formProtocol?.name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.name?.[0]" />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <FormLabel for="start_date" :label="$t('protocols.form.startDate')" />
                    <FormDateField id="start_date" name="start_date" :placeholder="$t('protocols.form.startDate')"
                        v-model="state.formProtocol.start_date" @change="changeStartDate" />
                    <FormError :error="v$?.formProtocol?.start_date?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.start_date?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="end_date" :label="$t('protocols.form.endDate')" />
                    <FormDateField id="end_date" name="end_date" :placeholder="$t('protocols.form.endDate')"
                        v-model="state.formProtocol.end_date" @change="changeEndDate" />
                    <FormError :error="v$?.formProtocol?.end_date?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.end_date?.[0]" />
                </div>
            </div>
            <div v-if="props.formType === 'create'">
                <div class="space-y-1">
                    <FormLabel for="citizens" :label="$t('protocols.form.citizens')" />
                    <FormSelectMultiple id="citizens" name="citizens" :options="state.citizenOptions"
                        v-model="state.formProtocol.citizens" />
                    <FormError :error="v$?.formProtocol?.citizens?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.citizens?.[0]" />
                </div>
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="navigateTo('/protocols')">
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
import { citizenService } from '@/components/api/CitizenService'
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
    selectedProtocol: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    citizenOptions: [],
    error: {} as Error,
    formProtocol: {
        name: '',
        start_date: '',
        end_date: '',
        citizens: [],
    },
})

watch(() => props.selectedProtocol, (newValue: any) => {
    if (newValue != null) {
        state.formProtocol = {
            name: newValue.name,
            start_date: newValue.start_date,
            end_date: newValue.end_date,
            citizens: newValue.citizens,
        }
    }
})

const rules = computed(() => {
    if (props.formType === 'create') {
        return {
            formProtocol: {
                name: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                start_date: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                end_date: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                citizens: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    } else {
        return {
            formProtocol: {
                name: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                start_date: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                end_date: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formProtocol)
    }
}

function changeStartDate() {
    fetchAvaiableCitizens()
}

function changeEndDate() {
    fetchAvaiableCitizens()
}

async function fetchAvaiableCitizens() {
    if (state.formProtocol.start_date && state.formProtocol.end_date) {
        state.error = {}
        emit('isPageLoading', true)
        try {
            const params = {
                start_date: state.formProtocol.start_date,
                end_date: state.formProtocol.end_date,
            }
            const response = await citizenService.getAllAvailableCitizens(params)
            if (response.data) {
                let options: any = []
                response.data.forEach(
                    (citizen: any) => options.push({
                        value: citizen?.id,
                        label: citizen?.firstname + " " + citizen?.lastname,
                    })
                )
                state.citizenOptions = options
            }
        } catch (error: any) {
            state.error = error
        }
        emit('isPageLoading', false)
    }
}
</script>