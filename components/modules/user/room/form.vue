<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-1">
            <FormLabel for="name" :label="$t('rooms.form.name')" />
            <FormTextField id="name" name="name" :placeholder="$t('rooms.form.name')" v-model="state.formRoom.name" />
            <FormError :error="v$?.formRoom?.name?.$errors[0]?.$message.toString()" />
            <FormError :error="props?.error?.errors?.name?.[0]" />
        </div>
        <div class="space-y-1 mt-4">
            <FormLabel for="capacity" :label="$t('rooms.form.capacity')" />
            <FormNumberField id="capacity" name="capacity" placeholder="0" :min="0" v-model="state.formRoom.capacity" />
            <FormError :error="props?.error?.errors?.capacity?.[0]" />
        </div>
        <div class="space-y-1 mt-4" v-if="isPro">
            <FormLabel for="departments" :label="$t('rooms.form.departments')" />
            <FormSelectMultiple id="departments" name="departments" :options="state.departmentOptions"
                v-model="state.formRoom.department_uuids" />
            <FormError :error="props?.error?.errors?.department_uuids?.[0]" />
        </div>
        <div class="space-y-1 mt-4" v-else>
            <FormLabel :label="$t('rooms.form.departments')" />
            <p class="text-xs text-gray-500 flex items-center gap-1.5">
                <Icon name="ph:lock-simple" class="w-3.5 h-3.5" aria-hidden="true" />
                {{ $t('rooms.form.departmentsProOnly') }}
            </p>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="navigateTo('/settings/rooms')">
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
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { departmentService } from '@/components/api/user/DepartmentService'
import { useUserStore } from '@/store/user'
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
    selectedRoom: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()
const userStore = useUserStore() as any
// Assigning departments to rooms is a Pro-plan feature.
const isPro = computed(() => !!userStore.getUser?.is_pro)

const state = reactive({
    error: {} as Error,
    departmentOptions: [] as any[],
    formRoom: {
        name: '',
        capacity: '' as string,
        department_uuids: [] as string[],
    },
})

watch(() => props.selectedRoom, (newValue: any) => {
    if (newValue != null) {
        state.formRoom = {
            name: newValue.name,
            capacity: newValue.capacity ?? '',
            department_uuids: Array.isArray(newValue.departments)
                ? newValue.departments.map((d: any) => d.uuid)
                : [],
        }
    }
})

onMounted(async () => {
    try {
        const response = await departmentService.getAllDepartments({})
        state.departmentOptions = (response?.data ?? [])
            .filter((d: any) => d?.id != null && d?.uuid !== 'all-departments')
            .map((d: any) => ({ value: d.uuid, label: d.name }))
    } catch (e) {
        state.departmentOptions = []
    }
})

const rules = computed(() => {
    return {
        formRoom: {
            name: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formRoom)
    }
}
</script>