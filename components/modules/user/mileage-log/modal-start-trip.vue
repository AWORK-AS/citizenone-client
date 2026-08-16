<template>
    <Modal size="sm" :title="$t('mileageLog.tracking.startTrip')" :show="props.show" @close="onClose">
        <template #modal-body>
            <div class="space-y-4">
                <Alert type="danger" :text="tracking.trackingError.value" v-if="tracking.trackingError.value" />

                <div class="p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-x-2">
                    <Icon name="ph:info" class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <p class="text-sm font-semibold text-amber-800">{{ $t('mileageLog.tracking.mobileNotice.title') }}</p>
                        <p class="text-xs text-amber-700">{{ $t('mileageLog.tracking.mobileNotice.body') }}</p>
                    </div>
                </div>

                <div v-if="isAcquiring" class="flex items-center gap-x-2 text-sm text-tertiary">
                    <Icon name="ph:spinner-gap" class="w-4 h-4 animate-spin" />
                    {{ $t('mileageLog.tracking.acquiringPosition') }}
                </div>

                <template v-else>
                    <div class="flex items-center gap-x-3">
                        <FormSwitch :value="state.linkToCitizen" @toggleSwitch="state.linkToCitizen = !state.linkToCitizen" />
                        <p class="text-sm">{{ $t('mileageLog.form.linkToCitizen') }}</p>
                    </div>
                    <div class="space-y-1" v-if="state.linkToCitizen">
                        <FormLabel for="start-trip-citizen" :label="$t('mileageLog.form.selectCitizen')" />
                        <FormSelect id="start-trip-citizen" :options="state.citizenOptions" v-model="state.citizenUuid" />
                    </div>

                    <div class="flex justify-end gap-3">
                        <FormButton buttonStyle="cancel" @click="onClose">
                            {{ $t('cancel') }}
                        </FormButton>
                        <FormButton buttonStyle="primary" @click="onStart">
                            {{ $t('mileageLog.tracking.startTrip') }}
                        </FormButton>
                    </div>
                </template>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useMileageTracking } from '@/composables/mileageTracking'
import { useAlert } from '@/composables/alert'
import { citizenService } from '@/components/api/user/CitizenService'

const props = defineProps({
    show: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits<{
    (e: 'close'): void
    (e: 'started'): void
}>()

const { t } = useI18n()
const tracking = useMileageTracking(t)
const { successAlert, errorAlert } = useAlert()

const state = reactive({
    linkToCitizen: false,
    citizenUuid: null as string | null,
    citizenOptions: [] as any,
})

const isAcquiring = computed(() =>
    ['requesting-permission', 'acquiring-start-fix', 'starting'].includes(tracking.status.value)
)

watch(() => props.show, (open) => {
    if (!open) return
    state.linkToCitizen = false
    state.citizenUuid = null
    fetchCitizenOptions()
})

async function fetchCitizenOptions() {
    try {
        const response = await citizenService.getAllCitizens({})
        if (response?.data) {
            state.citizenOptions = response.data.map((citizen: any) => ({
                value: citizen.uuid,
                label: `${citizen.firstname} ${citizen.lastname ?? ''}`,
            }))
        }
    } catch {
        // Non-fatal — starting a trip doesn't require citizen linking
    }
}

async function onStart() {
    try {
        await tracking.start({ citizenUuid: state.linkToCitizen ? state.citizenUuid : null })
        successAlert(`${t('alert.success')}!`, t('mileageLog.tracking.alert.tripStarted'))
        emit('started')
    } catch {
        // tracking.trackingError already holds a localized message and is
        // rendered above; nothing further to do here.
    }
}

function onClose() {
    if (isAcquiring.value) return // don't let the modal be dismissed mid-request
    emit('close')
}
</script>
