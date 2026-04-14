<template>
    <div>
        <Modal size="xs" :title="$t('dutySchedules.shareDutySchedule.sharedDutySchedule')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div v-if="['Success.', 'Succes.'].includes(state.selectedDutySchedule?.message)">
                        <div class="bg-green-700 text-white flex items-center px-4 py-3 mb-4 rounded-lg" role="alert">
                            <svg class="flex-shrink-0 w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clip-rule="evenodd"></path>
                            </svg>
                            <div class="ml-3 text-sm font-medium">
                                <p class="hover:text-gray-200 cursor-pointer"
                                    @click="navigateToExternalLink(state.selectedDutySchedule.data?.link)">
                                    {{ state.selectedDutySchedule.data?.link }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <form @submit.prevent="submitForm()" id="formShareDutySchedule">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <p class="text-sm text-gray-600">
                                    {{ $t('dutySchedules.shareDutySchedule.form.employee') }}
                                </p>
                                <FormSelectMultiple id="employee_uuids" :options="state.options.employees"
                                    v-model="state.formShare.employee_uuids" />
                                <FormError :error="v$?.formShare?.employee_uuids?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.employee_uuid?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="password"
                                    :label="$t('dutySchedules.shareDutySchedule.form.password')" />
                                <FormPasswordField id="password" name="password"
                                    :placeholder="$t('dutySchedules.shareDutySchedule.form.password')"
                                    v-model="state.formShare.password" />
                                <FormError :error="v$?.formShare?.password?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.name?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="confirm_password"
                                    :label="$t('dutySchedules.shareDutySchedule.form.confirmPassword')" />
                                <FormPasswordField id="confirm_password" name="confirm_password"
                                    :placeholder="$t('dutySchedules.shareDutySchedule.form.confirmPassword')"
                                    v-model="state.formShare.confirm_password" />
                                <FormError :error="v$?.formShare?.confirm_password?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.confirm_password?.[0]" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" @click="emit('close')">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary">
                                    {{ $t('citizens.citizenJournals.actions.share') }}
                                </FormButton>
                            </div>
                        </div>
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { dutyScheduleService } from '@/components/api/user/DutyScheduleService'
import { userService } from '@/components/api/user/UserService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers, minLength, sameAs } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useDepartmentStore } from '@/store/department'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshSharedDutySchedules'])
const { t } = useI18n()
const { successAlert } = useAlert()
const departmentStore = useDepartmentStore()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formShare: {
        employee_uuids: [],
        password: '',
        confirm_password: '',
    },
    selectedDutySchedule: {} as any,
    options: {
        employees: [],
    },
})

const rules = computed(() => {
    return {
        formShare: {
            password: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                minLength: helpers.withMessage(`${t('dutySchedules.shareDutySchedule.form.alert.required8Characters')}.`, minLength(8))
            },
            confirm_password: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                sameAsPassword: helpers.withMessage(`${t('dutySchedules.shareDutySchedule.form.alert.enteredPasswordMismatched')}.`, sameAs(state.formShare.password)),
            },
            employee_uuids: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        state.error = {}
        state.selectedDutySchedule = {}
        fetchAllEmployees()
    }
})

function closeModal() {
    emit('close')
}

function refreshSharedDutySchedules() {
    emit('refreshSharedDutySchedules')
}

async function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        state.isPageLoading = true
        try {
            const params = {
                employee_uuids: state.formShare.employee_uuids,
                password: state.formShare.password,
            }
            const response = await dutyScheduleService.shareDutySchedules(params)
            if (response) {
                state.selectedDutySchedule = response
                if (state.selectedDutySchedule?.message === 'Success.' || state.selectedDutySchedule?.message === 'Succes.') {
                    refreshSharedDutySchedules()
                    successAlert(`${t('alert.success')}!`, `${t('dutySchedules.shareDutySchedule.form.alert.dutyScheduleSuccessfullyShared')}.`)
                }
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}

async function fetchAllEmployees() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName
        }
        const response = await userService.getAllUsers(params)
        if (response.data) {
            let options: any = []
            response.data?.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.firstname + " " + (item.lastname ? item.lastname : ''),
                })
            )
            state.options.employees = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function navigateToExternalLink(link: any) {
    await navigateTo(link, {
        external: true,
        open: {
            target: '_blank',
        }
    })
}
</script>

<style>
#formShareDutySchedule .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>