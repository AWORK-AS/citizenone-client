<template>
    <Modal size="md" :title="props.service?.uuid ? $t('bookingServices.form.editTitle') : $t('bookingServices.form.newTitle')"
        :show="props.isModalOpen" @close="close">
        <template #modal-body>
            <form class="space-y-4" @submit.prevent="save">
                <Alert type="danger" :text="state.error.message" v-if="state.error.message" />

                <div class="space-y-1">
                    <FormLabel for="booking_service_name" :label="$t('bookingServices.form.name')" />
                    <FormTextField id="booking_service_name" name="name" :maxLength="255"
                        :placeholder="$t('bookingServices.form.namePlaceholder')" v-model="state.form.name" />
                    <FormError :error="state.error.errors?.name?.[0]" />
                </div>

                <div class="space-y-1">
                    <FormLabel for="booking_service_description" :label="$t('bookingServices.form.description')" />
                    <FormTextArea id="booking_service_description" name="description" :rows="3"
                        :placeholder="$t('bookingServices.form.descriptionPlaceholder')"
                        v-model="state.form.description" />
                    <FormError :error="state.error.errors?.description?.[0]" />
                </div>

                <div class="space-y-1">
                    <FormLabel for="booking_service_clinician" :label="$t('bookingServices.form.clinician')" />
                    <FormSelect id="booking_service_clinician" :options="clinicianOptions" :canClear="false"
                        :canDeselect="false" v-model="state.form.user_uuid" />
                    <p class="text-xs text-gray-500">{{ $t('bookingServices.form.clinicianHelp') }}</p>
                    <FormError :error="state.error.errors?.user_uuid?.[0]" />
                </div>

                <!-- Only where the clinic is split into departments at all. -->
                <div class="space-y-1" v-if="departmentOptions.length">
                    <FormLabel for="booking_service_department" :label="$t('bookingServices.form.department')" />
                    <FormSelect id="booking_service_department" :options="departmentOptions"
                        v-model="state.form.department_uuid" />
                    <p class="text-xs text-gray-500">{{ $t('bookingServices.form.departmentHelp') }}</p>
                    <FormError :error="state.error.errors?.department_uuid?.[0]" />
                </div>

                <div class="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-3">
                    <div>
                        <p class="text-sm font-medium text-gray-900">{{ $t('bookingServices.form.onlineBooking') }}</p>
                        <p class="text-xs text-gray-500">{{ $t('bookingServices.form.onlineBookingHelp') }}</p>
                    </div>
                    <FormSwitch :value="state.form.is_online_booking" :label="$t('bookingServices.form.onlineBooking')"
                        @toggleSwitch="state.form.is_online_booking = !state.form.is_online_booking" />
                </div>

                <div class="flex items-center justify-end gap-2 pt-2">
                    <FormButton type="button" buttonStyle="action" :disabled="state.isSaving" @click="close">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary" :disabled="state.isSaving">
                        {{ $t('save') }}
                    </FormButton>
                </div>
            </form>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { bookingServiceService } from '@/components/api/user/BookingServiceService'
import { departmentService } from '@/components/api/user/DepartmentService'
import { userService } from '@/components/api/user/UserService'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    // The service being edited; empty for a new one.
    service: {
        type: Object,
        required: false,
        default: null,
    },
})
const emit = defineEmits(['close', 'saved'])

const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any

const state = reactive({
    form: emptyForm(),
    colleagues: [] as any[],
    departments: [] as any[],
    error: {} as any,
    isSaving: false,
})

const clinicianOptions = computed(() => state.colleagues
    .filter((colleague: any) => colleague.uuid)
    .map((colleague: any) => ({
        value: colleague.uuid,
        label: `${colleague.firstname ?? ''} ${colleague.lastname ?? ''}`.trim(),
    })))

const departmentOptions = computed(() => state.departments
    .filter((department: any) => department.uuid)
    .map((department: any) => ({ value: department.uuid, label: department.name })))

function emptyForm() {
    return {
        name: '',
        description: '',
        // Whoever sets a service up is the clinician unless they choose
        // somebody else.
        user_uuid: (useUserStore() as any).getUser?.uuid ?? null,
        department_uuid: null as string | null,
        is_online_booking: true,
    }
}

watch(() => props.isModalOpen, (isOpen) => {
    if (!isOpen) return

    state.error = {}
    state.form = props.service?.uuid
        ? {
            name: props.service.name ?? '',
            description: props.service.description ?? '',
            user_uuid: props.service.clinician?.uuid ?? userStore.getUser?.uuid ?? null,
            department_uuid: props.service.department?.uuid ?? null,
            is_online_booking: !!props.service.booking_setting?.is_online_booking,
        }
        : emptyForm()

    loadOptions()
})

async function loadOptions() {
    const [colleagues, departments] = await Promise.all([
        // The plain employee list carries an "all employees" entry, which is
        // not a person anybody can book time with.
        userService.getAllUsersWithoutAllUsersOption().catch(() => null),
        departmentService.getAllDepartments({}).catch(() => null),
    ])

    state.colleagues = colleagues?.data || []
    state.departments = departments?.data || []
}

function close() {
    emit('close')
}

async function save() {
    state.error = {}

    if (!state.form.name.trim()) {
        state.error = { errors: { name: [t('bookingServices.form.nameRequired')] } }
        return
    }

    const payload = {
        name: state.form.name.trim(),
        description: state.form.description || null,
        user_uuid: state.form.user_uuid,
        department_uuid: state.form.department_uuid || null,
        // The API takes the flag as the strings the rest of booking uses.
        is_online_booking: state.form.is_online_booking ? 'true' : 'false',
    }

    state.isSaving = true

    try {
        const response = props.service?.uuid
            ? await bookingServiceService.updateBookingService(props.service.uuid, payload)
            : await bookingServiceService.saveBookingService(payload)

        successAlert(
            `${t('alert.success')}!`,
            `${t(props.service?.uuid ? 'bookingServices.alert.updated' : 'bookingServices.alert.created')}.`,
        )
        emit('saved', response?.data)
        close()
    } catch (error: any) {
        state.error = error
    } finally {
        state.isSaving = false
    }
}
</script>
