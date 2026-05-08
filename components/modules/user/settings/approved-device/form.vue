<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <template v-if="props.formType === 'create'">
                <div class="space-y-1">
                    <FormLabel for="user_uuid" :label="$t('approvedDevices.user')" />
                    <FormSelect id="user_uuid" :options="state.options.users"
                        v-model="state.form.user_uuid" />
                    <FormError :error="v$?.form?.user_uuid?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.user_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="device_uuid" :label="$t('approvedDevices.deviceUuid')" />
                    <FormTextField id="device_uuid" name="device_uuid"
                        :placeholder="$t('approvedDevices.deviceUuid')"
                        v-model="state.form.device_uuid" />
                    <FormError :error="v$?.form?.device_uuid?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.device_uuid?.[0]" />
                </div>
            </template>
            <div class="space-y-1">
                <FormLabel for="label" :label="$t('approvedDevices.label')" />
                <FormTextField id="label" name="label"
                    :placeholder="$t('approvedDevices.label')"
                    v-model="state.form.label" />
            </div>
            <div v-if="props.formType === 'update'" class="space-y-1">
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.form.is_active = !state.form.is_active">
                    <FormCheckbox :value="state.form.is_active" />
                    {{ $t('approvedDevices.isActive') }}
                </div>
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="emit('closeModal')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary">
                    {{ $t('save') }}
                </FormButton>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import { userService } from '@/components/api/user/UserService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { t } = useI18n()

const props = defineProps({
    formType: {
        type: String,
        required: true,
    },
    selectedApprovedDevice: {
        type: Object,
        default: () => ({}),
    },
    error: {
        type: Object as () => Error,
        default: () => ({} as Error),
    },
})

const emit = defineEmits(['submitForm', 'closeModal'])

const state = reactive({
    form: {
        user_uuid: '',
        device_uuid: '',
        label: '',
        is_active: true,
    },
    options: {
        users: [] as any[],
    },
})

onMounted(() => {
    if (props.formType === 'create') {
        fetchUsers()
    }
})

watch(() => props.selectedApprovedDevice, (val) => {
    if (val && props.formType === 'update') {
        state.form.label = val.label ?? ''
        state.form.is_active = val.is_active ?? true
    }
}, { immediate: true })

async function fetchUsers() {
    try {
        const response = await userService.getAllUsers({})
        if (response.data) {
            state.options.users = response.data.map((user: any) => ({
                value: user.uuid,
                label: user.firstname + ' ' + (user.lastname ?? ''),
            }))
        }
    } catch {
        // non-critical
    }
}

const rules = computed(() => ({
    form: {
        ...(props.formType === 'create' && {
            user_uuid: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            device_uuid: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        }),
    },
}))

const v$ = useVuelidate(rules, state)

async function submitForm() {
    v$.value.$reset()
    await v$.value.$validate()
    if (!v$.value.$error) {
        if (props.formType === 'update') {
            emit('submitForm', { label: state.form.label, is_active: state.form.is_active })
        } else {
            emit('submitForm', { user_uuid: state.form.user_uuid, device_uuid: state.form.device_uuid, label: state.form.label })
        }
    }
}
</script>
