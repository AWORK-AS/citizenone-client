<template>
    <div>
        <Modal size="md" :title="$t('citizens.documents.access.newAccess')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm()" id="formAccess">
                        <div class="space-y-1">
                            <p class="text-sm text-gray-600">
                                {{ $t('citizens.documents.access.form.user') }}
                            </p>
                            <FormSelect id="users" :options="state.options.employees_without_all_users_option"
                                v-model="state.formAccess.user_uuid" class="w-full" />
                            <FormError :error="v$?.formAccess?.user_uuid?.$errors[0]?.$message.toString()" />
                            <FormError :error="props?.error?.errors?.user_uuid?.[0]" />
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                    @click="emit('closeModal')">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                                    {{ $t('citizens.documents.access.form.giveAccess') }}
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
import { documentAccessService } from '@/components/api/user/DocumentAccessService'
import { userService } from '@/components/api/user/UserService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedDocument: {
        type: Object,
        required: true,
    },
})

const state = reactive({
    error: {} as Error,
    formAccess: {
        user_uuid: '',
    },
    isTableLoading: false,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
    isPageLoading: false,
    options: {
        employees_without_all_users_option: []
    },
})

const emit = defineEmits(['close', 'refreshAccesses'])

function closeModal() {
    emit('close')
}

watch(() => props.isModalOpen, (isOpen: any) => {
    if (isOpen) {
        state.formAccess.user_uuid = ''
        fetchAllUsersWithoutAllUsersOption()
    }
})

const rules = computed(() => {
    return {
        formAccess: {
            user_uuid: {
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
        giveAccess()
    }
}

async function giveAccess() {
    state.error = {}
    state.isPageLoading = true
    const params = {
        citizen_uuid: state.citizen_uuid
    }
    try {
        const params = {
            company_file_folder_uuid: props.selectedDocument?.uuid,
            user_uuid: state.formAccess.user_uuid,
        }
        const response = await documentAccessService.saveFileFoldersAccess(params)
        if (response?.data) {
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.documents.access.alert.accessSuccessfullyAdded')}.`)
            emit('refreshAccesses')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchAllUsersWithoutAllUsersOption() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await userService.getAllUsersWithoutAllUsersOption()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (user: any) => options.push({
                    value: user?.uuid,
                    label: user?.firstname + " " + user?.lastname,
                })
            )
            state.options.employees_without_all_users_option = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>

<style>
#formAccess .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>