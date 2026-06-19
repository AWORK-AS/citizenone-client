<template>
    <div>
        <Modal size="md" :title="$t('referrals.newReferral')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm()">
                        <Alert type="danger" :text="state.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <FormLabel for="citizen_uuid" :label="$t('referrals.citizen')" />
                                <FormSelect id="citizen_uuid" :options="state.options.citizens"
                                    v-model="state.formReferral.citizen_uuid" />
                                <FormError :error="v$?.formReferral?.citizen_uuid?.$errors[0]?.$message.toString()" />
                                <FormError :error="state.error?.errors?.citizen_uuid?.[0]" />
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="department_uuid" :label="$t('referrals.department')" />
                                <FormSelect id="department_uuid" :options="state.options.departments"
                                    :placeholder="$t('referrals.department')"
                                    v-model="state.formReferral.department_uuid" />
                                <FormError :error="state.error?.errors?.department_uuid?.[0]" />
                            </div>

                            <div class="grid grid-cols-2 gap-3">
                                <div class="space-y-1">
                                    <FormLabel for="start_date" :label="$t('referrals.startDate')" />
                                    <FormDateField id="start_date" name="start_date"
                                        :placeholder="$t('referrals.startDate')"
                                        v-model="state.formReferral.start_date" />
                                    <FormError :error="v$?.formReferral?.start_date?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state.error?.errors?.start_date?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="weeks" :label="$t('referrals.weeks')" />
                                    <FormTextField id="weeks" name="weeks" type="number" min="1" max="520"
                                        :placeholder="$t('referrals.weeks')"
                                        v-model="state.formReferral.weeks"
                                        @input="onWeeksInput" />
                                    <FormError :error="state.error?.errors?.weeks?.[0]" />
                                </div>
                            </div>

                            <div class="space-y-1" v-if="calculatedEndDate && !state.formReferral.end_date">
                                <p class="text-xs text-gray-500">
                                    {{ $t('referrals.weeksCalculated') }}: <span class="font-medium">{{ calculatedEndDate }}</span>
                                </p>
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="end_date" :label="$t('referrals.endDate')" />
                                <FormDateField id="end_date" name="end_date"
                                    :placeholder="$t('referrals.endDate')"
                                    v-model="state.formReferral.end_date" />
                                <FormError :error="v$?.formReferral?.end_date?.$errors[0]?.$message.toString()" />
                                <FormError :error="state.error?.errors?.end_date?.[0]" />
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="status" :label="$t('referrals.status')" />
                                <FormSelect id="status" :options="state.options.statuses"
                                    v-model="state.formReferral.status" />
                                <FormError :error="state.error?.errors?.status?.[0]" />
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="municipality" :label="$t('referrals.municipality')" />
                                <FormTextField id="municipality" name="municipality"
                                    :placeholder="$t('referrals.municipality')"
                                    v-model="state.formReferral.municipality" />
                                <FormError :error="state.error?.errors?.municipality?.[0]" />
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="caseworker_name" :label="$t('referrals.caseworkerName')" />
                                <FormTextField id="caseworker_name" name="caseworker_name"
                                    :placeholder="$t('referrals.caseworkerName')"
                                    v-model="state.formReferral.caseworker_name" />
                                <FormError :error="state.error?.errors?.caseworker_name?.[0]" />
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="caseworker_email" :label="$t('referrals.caseworkerEmail')" />
                                <FormTextField id="caseworker_email" name="caseworker_email" type="email"
                                    :placeholder="$t('referrals.caseworkerEmail')"
                                    v-model="state.formReferral.caseworker_email" />
                                <FormError :error="state.error?.errors?.caseworker_email?.[0]" />
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="caseworker_phone" :label="$t('referrals.caseworkerPhone')" />
                                <FormTextField id="caseworker_phone" name="caseworker_phone"
                                    :placeholder="$t('referrals.caseworkerPhone')"
                                    v-model="state.formReferral.caseworker_phone" />
                                <FormError :error="state.error?.errors?.caseworker_phone?.[0]" />
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="notes" :label="$t('referrals.notes')" />
                                <FormTextArea id="notes" name="notes" :placeholder="$t('referrals.notes')"
                                    v-model="state.formReferral.notes" />
                                <FormError :error="state.error?.errors?.notes?.[0]" />
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
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { referralService } from '@/components/api/user/ReferralService'
import { citizenService } from '@/components/api/user/CitizenService'
import { departmentService } from '@/components/api/user/DepartmentService'
import { useVuelidate } from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import moment from 'moment'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close', 'refreshReferrals'])
const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formReferral: {
        citizen_uuid: '',
        department_uuid: '',
        start_date: '',
        end_date: '',
        weeks: null as number | null,
        status: 'active',
        municipality: '',
        caseworker_name: '',
        caseworker_email: '',
        caseworker_phone: '',
        notes: '',
    },
    options: {
        citizens: [] as any[],
        departments: [] as any[],
        statuses: [
            { value: 'active', label: '' },
            { value: 'pending', label: '' },
            { value: 'closed', label: '' },
        ],
    },
})

const calculatedEndDate = computed(() => {
    if (state.formReferral.start_date && state.formReferral.weeks) {
        return moment(state.formReferral.start_date).add(state.formReferral.weeks, 'weeks').format('DD. MMMM YYYY')
    }
    return null
})

const rules = computed(() => ({
    formReferral: {
        citizen_uuid: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
        start_date: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
        end_date: {
            requiredIfNoWeeks: helpers.withMessage(
                () => `${t('validation.thisFieldIsRequired')}.`,
                (value: string) => !!value || !!state.formReferral.weeks
            ),
        },
    },
}))

const v$ = useVuelidate(rules, state)

onMounted(() => {
    loadOptions()
})

watch(() => props.isModalOpen, (newVal) => {
    if (newVal) {
        resetForm()
        loadOptions()
    }
})

function onWeeksInput() {
    if (state.formReferral.weeks) {
        state.formReferral.end_date = ''
    }
}

function resetForm() {
    state.error = {}
    v$.value.$reset()
    state.formReferral = {
        citizen_uuid: '',
        department_uuid: '',
        start_date: '',
        end_date: '',
        weeks: null,
        status: 'active',
        municipality: '',
        caseworker_name: '',
        caseworker_email: '',
        caseworker_phone: '',
        notes: '',
    }
}

function closeModal() {
    state.error = {}
    emit('close')
}

async function loadOptions() {
    state.options.statuses = [
        { value: 'active', label: t('referrals.statusActive') },
        { value: 'pending', label: t('referrals.statusPending') },
        { value: 'closed', label: t('referrals.statusClosed') },
    ]
    await Promise.all([fetchCitizens(), fetchDepartments()])
}

async function fetchCitizens() {
    try {
        const response = await citizenService.getCitizens({ per_page: 500 })
        if (response?.data) {
            state.options.citizens = response.data.map((c: any) => ({
                value: c.uuid,
                label: `${c.firstname} ${c.lastname}`,
            }))
        }
    } catch (error: any) {
        state.error = error
    }
}

async function fetchDepartments() {
    try {
        const response = await departmentService.getAllDepartments({})
        if (response?.data) {
            state.options.departments = response.data.map((d: any) => ({
                value: d.uuid,
                label: d.name,
            }))
        }
    } catch (error: any) {
        state.error = error
    }
}

async function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (v$.value.$error) return

    state.isPageLoading = true
    try {
        const params: any = {
            citizen_uuid: state.formReferral.citizen_uuid,
            start_date: state.formReferral.start_date,
            status: state.formReferral.status,
        }
        if (state.formReferral.department_uuid && state.formReferral.department_uuid !== 'all-departments') params.department_uuid = state.formReferral.department_uuid
        if (state.formReferral.end_date) params.end_date = state.formReferral.end_date
        if (state.formReferral.weeks) params.weeks = parseInt(state.formReferral.weeks as any)
        if (state.formReferral.municipality) params.municipality = state.formReferral.municipality
        if (state.formReferral.caseworker_name) params.caseworker_name = state.formReferral.caseworker_name
        if (state.formReferral.caseworker_email) params.caseworker_email = state.formReferral.caseworker_email
        if (state.formReferral.caseworker_phone) params.caseworker_phone = state.formReferral.caseworker_phone
        if (state.formReferral.notes) params.notes = state.formReferral.notes

        const response = await referralService.saveReferral(params)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('referrals.alert.referralSuccessfullySaved')}.`)
            emit('refreshReferrals')
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
