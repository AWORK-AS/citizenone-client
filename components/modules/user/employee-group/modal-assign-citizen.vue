<template>
    <div>
        <Modal size="md" :title="$t('employeeGroups.citizens.assignCitizen')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <LoadingSpinner :isActive="state.isLoading">
                    <form @submit.prevent="assignCitizen()" id="formAssignCitizen">
                        <div class="space-y-1">
                            <p class="text-sm text-gray-600">
                                {{ $t('employeeGroups.citizens.citizens') }}
                            </p>
                            <FormSelectMultiple id="citizen_uuids" :options="state.options.citizens"
                                v-model="state.form.citizen_uuids" class="w-full" />
                            <FormError :error="v$?.form?.citizen_uuids?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.citizen_uuids?.[0]" />
                        </div>
                        <div class="mt-6">
                            <FormButton type="submit" class="w-full" buttonStyle="primary">
                                {{ $t('employeeGroups.citizens.assignCitizen') }}
                            </FormButton>
                        </div>
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { employeeGroupService } from '@/components/api/user/EmployeeGroupService'
import { citizenService } from '@/components/api/user/CitizenService'
import { useVuelidate } from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from 'vue-i18n'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const employeeGroupUuid = router?.currentRoute?.value?.params?.uuid as string

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close', 'assigned'])

const state = reactive({
    error: {} as Error,
    isLoading: false,
    form: {
        citizen_uuids: [] as string[],
    },
    options: {
        citizens: [] as any[],
    },
})

const rules = computed(() => ({
    form: {
        citizen_uuids: {
            required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
        },
    },
}))

const v$ = useVuelidate(rules, state)

watch(() => props.isModalOpen, (isOpen: boolean) => {
    if (isOpen) {
        state.error = {}
        state.form.citizen_uuids = []
        v$.value.$reset()
        fetchAvailableCitizens()
    }
})

async function fetchAvailableCitizens() {
    state.isLoading = true
    try {
        const response = await citizenService.getAllCitizens({})
        if (response?.data) {
            state.options.citizens = response.data
                // para ma filter ang "All Citizens" option sa listahan
                .filter((citizen: any) => citizen.uuid !== 'all-citizens')
                .map((citizen: any) => ({
                    value: citizen.uuid,
                    label: `${citizen.firstname}${citizen.lastname ? ' ' + citizen.lastname : ''}`,
                }))
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function assignCitizen() {
    v$.value.$validate()
    if (!v$.value.$error) {
        state.error = {}
        state.isLoading = true
        try {
            const params = { citizen_uuids: state.form.citizen_uuids }
            await employeeGroupService.assignCitizens(employeeGroupUuid, params)
            successAlert(`${t('alert.success')}!`, `${t('employeeGroups.citizens.alert.citizenSuccessfullyAssigned')}.`)
            emit('assigned')
            closeModal()
        } catch (error: any) {
            state.error = error
        }
        state.isLoading = false
    }
}

function closeModal() {
    emit('close')
}
</script>

<style>
#formAssignCitizen .multiselect-dropdown {
    max-height: 5rem !important;
    overflow-y: auto !important;
}
</style>
