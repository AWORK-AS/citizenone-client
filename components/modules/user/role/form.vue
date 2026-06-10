<template>
    <form @submit.prevent="submitForm()" class="mt-6 pb-16 max-w-xl">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="name" :label="$t('roles.form.name')" />
                <FormTextField id="name" name="name" :placeholder="$t('roles.form.name')"
                    :disabled="state.formRole?.is_name_editable === false" v-model="state.formRole.name"
                    :style="state.formRole?.predefined ? 'pointer-events: none; opacity: 0.6; cursor: not-allowed;' : ''" />
                <FormError :error="v$?.formRole?.name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.name?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="level" :label="$t('roles.form.level')" />
                <FormSelect id="level" name="level" :options="levelOptions" v-model="state.formRole.level"
                    :disabled="state.formRole?.predefined" />
                <FormError :error="props?.error?.errors?.level?.[0]" />
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
                <FormButton type="button" buttonStyle="cancel" @click="navigateTo('/settings/roles')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import { permissionService } from '@/components/api/user/PermissionService'
import { getPermissionLabel } from '@/composables/usePermissions'
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

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formRole: {
        name: '',
        predefined: false,
        permissions: [],
        is_name_editable: true,
        level: '20',
    },
    permissions: [] as any[],
})

const levelOptions = computed(() => [
    { value: '20', label: t('roles.table.regular') },
    { value: '50', label: t('roles.table.manager') },
])

const isInitializing = ref(true)

onMounted(() => {
    if (props.formType === 'create') {
        fetchAllPermissions()
    }
    nextTick(() => { isInitializing.value = false })
})

watch(() => props.selectedRole, (newValue: any) => {
    if (newValue != null) {
        isInitializing.value = true
        state.formRole = {
            name: newValue.name,
            predefined: newValue.predefined || false,
            permissions: newValue.permissions || [],
            is_name_editable: newValue.is_name_editable || false,
            level: String(newValue.level ?? 20),
        }
        fetchAllPermissions()
        nextTick(() => { isInitializing.value = false })
    }
})

watch(() => state.formRole.level, () => {
    if (isInitializing.value) return
    fetchAllPermissions()
})

const rules = computed(() => {
    return {
        formRole: {
            name: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

async function fetchAllPermissions() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {
            level: state.formRole.level,
        }
        const response = await permissionService.getAllPermissions(params)
        if (response?.data) {
            state.permissions = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

const translatedPermissions = computed(() => {
    return state.permissions.map((permission: any) => ({
        value: permission.uuid,
        label: getPermissionLabel(permission, locale.value),
    }))
})

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', { ...state.formRole })
    }
}
</script>