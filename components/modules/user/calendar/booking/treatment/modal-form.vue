<template>
    <Modal size="lg" :title="props.treatment ? $t('bookableTreatments.edit') : $t('bookableTreatments.new')"
        :show="props.isModalOpen" @close="emit('close')">
        <template #modal-body>
            <LoadingSpinner :isActive="state.isSaving">
                <form @submit.prevent="save" class="space-y-4" id="formBookableTreatment">
                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && !state.error?.errors" />

                    <div class="space-y-1">
                        <FormLabel for="treatment_name" :label="$t('bookableTreatments.form.name')" />
                        <FormTextField id="treatment_name" name="treatment_name"
                            :placeholder="$t('bookableTreatments.form.namePlaceholder')" v-model="state.form.name" />
                        <FormError :error="state.error?.errors?.name?.[0]" />
                    </div>

                    <div class="space-y-1">
                        <FormLabel for="treatment_description" :label="$t('bookableTreatments.form.description')" />
                        <FormTextArea id="treatment_description" name="treatment_description" :rows="3"
                            :placeholder="$t('bookableTreatments.form.descriptionPlaceholder')"
                            v-model="state.form.description" />
                        <FormError :error="state.error?.errors?.description?.[0]" />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <FormLabel for="treatment_clinician" :label="$t('bookableTreatments.form.clinician')" />
                            <FormSelect id="treatment_clinician" :options="state.options.clinicians"
                                :searchable="true" :canClear="false" :canDeselect="false"
                                v-model="state.form.user_uuid" />
                            <p class="text-xs text-gray-500">{{ $t('bookableTreatments.form.clinicianHint') }}</p>
                            <FormError :error="state.error?.errors?.user_uuid?.[0]" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="treatment_department" :label="$t('bookableTreatments.form.department')" />
                            <FormSelect id="treatment_department" :options="state.options.departments"
                                :placeholder="$t('bookableTreatments.form.departmentAll')"
                                v-model="state.form.department_uuid" />
                            <p class="text-xs text-gray-500">{{ $t('bookableTreatments.form.departmentHint') }}</p>
                            <FormError :error="state.error?.errors?.department_uuid?.[0]" />
                        </div>
                    </div>

                    <div class="space-y-1 md:w-1/2">
                        <FormLabel for="treatment_price" :label="$t('bookableTreatments.form.price')" />
                        <FormNumberField id="treatment_price" name="treatment_price" :min="0" placeholder="0"
                            v-model="state.form.price" />
                        <FormError :error="state.error?.errors?.price?.[0]" />
                    </div>

                    <div class="space-y-3 rounded-lg border border-gray-100 p-4">
                        <div class="flex items-start justify-between gap-3">
                            <div>
                                <p class="text-sm font-medium text-gray-900">{{ $t('bookableTreatments.form.onlineBooking') }}</p>
                                <p class="text-xs text-gray-500">{{ $t('bookableTreatments.form.onlineBookingHint') }}</p>
                            </div>
                            <FormSwitch :value="state.form.is_online_booking"
                                :label="$t('bookableTreatments.form.onlineBooking')"
                                @toggleSwitch="state.form.is_online_booking = !state.form.is_online_booking" />
                        </div>
                        <div class="flex items-start justify-between gap-3">
                            <div>
                                <p class="text-sm font-medium text-gray-900">{{ $t('bookableTreatments.form.video') }}</p>
                                <p class="text-xs text-gray-500">{{ $t('bookableTreatments.form.videoHint') }}</p>
                            </div>
                            <FormSwitch :value="state.form.is_video_consultation"
                                :label="$t('bookableTreatments.form.video')"
                                @toggleSwitch="state.form.is_video_consultation = !state.form.is_video_consultation" />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        <FormButton type="button" buttonStyle="cancel" @click="emit('close')">
                            {{ $t('cancel') }}
                        </FormButton>
                        <FormButton type="submit" buttonStyle="primary">
                            {{ props.treatment ? $t('update') : $t('save') }}
                        </FormButton>
                    </div>
                </form>
            </LoadingSpinner>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { bookingServiceService } from '@/components/api/user/BookingServiceService'
import { departmentService } from '@/components/api/user/DepartmentService'
import { userService } from '@/components/api/user/UserService'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
    /** The treatment to edit, or null for a new one. */
    treatment: { type: Object, default: null },
})
const emit = defineEmits(['close', 'saved'])

const { t } = useI18n()
const { successAlert } = useAlert()
const userStore = useUserStore() as any

const emptyForm = () => ({
    name: '',
    description: '',
    user_uuid: userStore.getUser?.uuid ?? null,
    department_uuid: null as string | null,
    price: '' as string | number,
    is_online_booking: true,
    is_video_consultation: false,
})

const state = reactive({
    form: emptyForm(),
    options: {
        clinicians: [] as { value: string; label: string }[],
        departments: [] as { value: string; label: string }[],
    },
    error: {} as any,
    isSaving: false,
})

watch(() => props.isModalOpen, (open) => {
    if (!open) return
    state.error = {}
    const treatment: any = props.treatment
    state.form = treatment ? {
        name: treatment.name ?? '',
        description: treatment.description ?? '',
        user_uuid: treatment.user?.uuid ?? null,
        department_uuid: treatment.department?.uuid ?? null,
        price: treatment.booking_setting?.price ?? '',
        is_online_booking: !!treatment.booking_setting?.is_online_booking,
        is_video_consultation: !!treatment.is_video_consultation,
    } : emptyForm()
    loadOptions()
})

async function loadOptions() {
    if (state.options.clinicians.length && state.options.departments.length) return
    try {
        const [users, departments] = await Promise.all([
            userService.getAllUsersWithoutAllUsersOption(),
            departmentService.getAllDepartments({}),
        ])
        state.options.clinicians = (users?.data ?? []).map((user: any) => ({
            value: user.uuid,
            label: `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim(),
        }))
        state.options.departments = (departments?.data ?? [])
            .filter((department: any) => department?.uuid && department.uuid !== 'all-departments')
            .map((department: any) => ({ value: department.uuid, label: department.name }))
    } catch (error: any) {
        state.error = error
    }
}

async function save() {
    state.error = {}
    state.isSaving = true
    const params = {
        name: state.form.name,
        description: state.form.description || null,
        user_uuid: state.form.user_uuid,
        // Sent even when empty: that is how a department is taken off again.
        department_uuid: state.form.department_uuid || null,
        price: state.form.price === '' ? 0 : state.form.price,
        is_online_booking: state.form.is_online_booking ? 'true' : 'false',
        is_video_consultation: state.form.is_video_consultation ? 'true' : 'false',
    }
    try {
        const treatment: any = props.treatment
        const response = treatment
            ? await bookingServiceService.updateBookingService(treatment.uuid, params)
            : await bookingServiceService.createBookingService(params)
        successAlert(`${t('alert.success')}!`, treatment ? t('bookableTreatments.updated') : t('bookableTreatments.created'))
        emit('saved', response?.data ?? response, !treatment)
        emit('close')
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}
</script>
