<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-xl">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="name" :label="$t('roles.form.name')" />
                <FormTextField id="name" name="name" :placeholder="$t('roles.form.name')"
                    v-model="state.formRole.name" />
                <FormError :error="v$?.formRole?.name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.name?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="permissions" :label="$t('roles.form.permissions')" />
                <FormSelectMultiple id="permissions" :options="state.options.permissions"
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

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formRole: {
        name: '',
        permissions: [],
    },
    options: {
        permissions: [] as any,
    }
})

onMounted(() => {
    fetchAllPermissions()
})

watch(() => props.selectedRole, (newValue: any) => {
    if (newValue != null) {
        state.formRole = {
            name: newValue.name,
            permissions: newValue.permissions || [],
        }
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
        const response = await permissionService.getAllPermissions()
        if (response?.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item?.uuid,
                    label: item?.name?.charAt(0)?.toUpperCase() + item?.name?.slice(1),
                })
            )
            state.options.permissions = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formRole)
    }
}
</script>