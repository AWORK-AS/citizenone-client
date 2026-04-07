<template>
    <form @submit.prevent="submitForm()" class="mt-6 pb-16 max-w-xl">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="name" :label="$t('roles.form.name')" />
                <FormTextField  id="name" name="name" :placeholder="$t('roles.form.name')"
                    :disabled="state.formRole?.is_name_editable === false"
                    v-model="state.formRole.name" :style="state.formRole?.predefined ? 'pointer-events: none; opacity: 0.6; cursor: not-allowed;' : ''" />
                <FormError :error="v$?.formRole?.name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.name?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="permissions" :label="$t('roles.form.permissions')" />
                <FormSelectMultiple id="permissions" :options="translatedPermissions"
                    v-model="state.formRole.permissions" />
                <FormError :error="v$?.formRole?.permissions?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.permission_uuid?.[0]" />
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                    @click="navigateTo('/settings/roles')">
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
import { permissionService } from '@/components/api/user/PermissionService'
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
    selectedRole: {
        type: Object,
        required: false,
    },
})

const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t, locale } = useI18n()

const PERMISSION_LABELS:  Record<string, string> = {
    'scheduler': 'roles.permissions.scheduler',
    'create_schedule': 'roles.permissions.createSchedule',
    'read_schedule': 'roles.permissions.readSchedule',
    'view_schedule': 'roles.permissions.viewSchedule',
    'update_schedule': 'roles.permissions.updateSchedule',
    'delete_schedule': 'roles.permissions.deleteSchedule',
    'create_citizen_journal': 'roles.permissions.createCitizenJournal',
    'view_citizen_journal': 'roles.permissions.viewCitizenJournal',
    'update_citizen_journal': 'roles.permissions.updateCitizenJournal',
    'delete_citizen_journal': 'roles.permissions.deleteCitizenJournal',
    'create_citizen_calendar': 'roles.permissions.createCitizenCalendar',
    'view_citizen_calendar': 'roles.permissions.viewCitizenCalendar',
    'update_citizen_calendar': 'roles.permissions.updateCitizenCalendar',
    'delete_citizen_calendar': 'roles.permissions.deleteCitizenCalendar',
    'create_citizen_health': 'roles.permissions.createCitizenHealth',
    'view_citizen_health':  'roles.permissions.viewCitizenHealth',
    'update_citizen_health': 'roles.permissions.updateCitizenHealth',
    'delete_citizen_health': 'roles.permissions.deleteCitizenHealth',
    'create_citizen_medicine': 'roles.permissions.createCitizenMedicine',
    'update_citizen_medicine': 'roles.permissions.updateCitizenMedicine',
    'delete_citizen_medicine': 'roles.permissions.deleteCitizenMedicine',
    'create_citizen_plan': 'roles.permissions.createCitizenPlan',
    'update_citizen_plan': 'roles.permissions.updateCitizenPlan',
    'delete_citizen_plan': 'roles.permissions.deleteCitizenPlan',
    'create_citizen_document': 'roles.permissions.createCitizenDocument',
    'update_citizen_document': 'roles.permissions.updateCitizenDocument',
    'delete_citizen_document': 'roles.permissions.deleteCitizenDocument',
    'create_citizen_economy': 'roles.permissions.createCitizenEconomy',
    'update_citizen_economy': 'roles.permissions.updateCitizenEconomy',
    'delete_citizen_economy': 'roles.permissions.deleteCitizenEconomy',
    'create_citizen_contact': 'roles.permissions.createCitizenContact',
    'update_citizen_contact': 'roles.permissions.updateCitizenContact',
    'delete_citizen_contact': 'roles.permissions.deleteCitizenContact',
    'create_citizen_children': 'roles.permissions.createCitizenChildren',
    'update_citizen_children': 'roles.permissions.updateCitizenChildren',
    'delete_citizen_children': 'roles.permissions.deleteCitizenChildren',
}

const state = reactive({
    error: {} as Error,
    isPageLoading:  false,
    formRole: {
        name: '',
        predefined: false,
        permissions:  [],
        is_name_editable: true,
    },
    permissions: [] as Array<{ uuid: string, name: string }>,
})

onMounted(() => {
    if (props.formType === 'create') {
        fetchAllPermissions()
    }
})

watch(() => props.selectedRole, (newValue: any) => {
    if (newValue != null) {
        state.formRole = {
            name: newValue.name,
            predefined: newValue.predefined || false,
            permissions: newValue.permissions || [],
            is_name_editable: newValue.is_name_editable || false,
        }
        fetchAllPermissions()
    }
})

const rules = computed(() => {
    return {
        formRole: {
            name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

async function fetchAllPermissions() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        console.log('selected role', props.selectedRole)
        const params = {
            role: props.selectedRole ? props.selectedRole.name : '',
        }
        const response = await permissionService.getAllPermissions(params)
        if (response?.data) {
            state.permissions = response.data.map((item: any) => ({
                uuid: item?.uuid,
                name: item?.name,
            }))
        }
    } catch (error:  any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

const translatedPermissions = computed(() => {
    const currentLocale = locale.value
    
    return state.permissions.map((permission) => {
        const translationKey = PERMISSION_LABELS[permission.name]
        return {
            value: permission.uuid,
            label: translationKey ?  t(translationKey) : permission.name,
        }
    })
})

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formRole)
    }
}
</script>