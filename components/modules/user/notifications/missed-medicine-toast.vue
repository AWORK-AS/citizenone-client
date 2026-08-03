<template>
    <div v-if="state.latest && !state.isDismissed" class="fixed bottom-6 right-6 z-50 max-w-sm bg-white border border-red-200 rounded-xl shadow-lg p-4">
        <div class="flex items-start gap-3">
            <div class="shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Icon name="ph:warning-circle" class="size-5 text-red-600" />
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900">
                    {{ $t('medicineMissedDoses.toast.title') }}
                </p>
                <p class="text-xs text-gray-500 mt-0.5">
                    {{ medicineName }}
                    {{ $t('medicineMissedDoses.toast.forCitizenAt', { citizen: citizenName, time: state.latest.time }) }}
                </p>
                <p class="text-xs text-gray-400 mt-0.5" v-if="state.total > 1">
                    {{ $t('medicineMissedDoses.toast.andMore', { count: state.total - 1 }) }}
                </p>
                <div class="flex gap-2 mt-3">
                    <button type="button"
                        class="flex-1 text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-medium hover:bg-primary/90"
                        @click="giveNow">
                        {{ $t('medicineMissedDoses.giveNow') }}
                    </button>
                    <NuxtLink to="/medicine-missed-doses"
                        class="text-xs text-primary px-3 py-1.5 rounded-lg hover:bg-gray-100">
                        {{ $t('medicineMissedDoses.toast.viewAll') }}
                    </NuxtLink>
                    <button type="button" class="text-xs text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100"
                        @click="dismiss">
                        {{ $t('close') }}
                    </button>
                </div>
            </div>
        </div>

        <ModulesUserCitizenMedicineModalGiveMedicine :isModalOpen="state.modal.isGiveMedicineOpen"
            :selectedMedicine="state.latest?.citizen_medicine" :citizenUuid="state.latest?.citizen?.uuid"
            :preselectedDate="state.latest?.date" :preselectedTime="state.latest?.time"
            @close="state.modal.isGiveMedicineOpen = false" @refreshMedicines="fetchLatestMissedDose" />
    </div>
</template>

<script setup lang="ts">
import { medicineMissedDoseService } from '@/components/api/user/MedicineMissedDoseService'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const POLL_INTERVAL_MS = 3 * 60 * 1000

const state = reactive({
    latest: null as any,
    total: 0,
    isDismissed: false,
    modal: {
        isGiveMedicineOpen: false,
    },
})

const medicineName = computed(() => {
    const medicine = state.latest?.citizen_medicine?.medicine
    if (!medicine) return ''
    return locale.value === 'en' ? (medicine.en_name || medicine.dk_name) : (medicine.dk_name || medicine.en_name)
})

const citizenName = computed(() => {
    const citizen = state.latest?.citizen
    if (!citizen) return ''
    return `${citizen.firstname} ${citizen.lastname}`
})

let intervalId: ReturnType<typeof setInterval> | null = null

onMounted(() => {
    fetchLatestMissedDose()
    intervalId = setInterval(fetchLatestMissedDose, POLL_INTERVAL_MS)
})

onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
})

async function fetchLatestMissedDose() {
    try {
        const response = await medicineMissedDoseService.getMissedDoses({ page_length: 1 })
        const data = response?.data ?? []
        const previousUuid = state.latest?.uuid
        state.latest = data[0] ?? null
        state.total = response?.meta?.total ?? data.length
        // A newly-arrived alert (or one resolved elsewhere) should reset dismissal.
        if (state.latest?.uuid !== previousUuid) {
            state.isDismissed = false
        }
    } catch {
        // Silently skip - this is a passive background alert, not a page the user is
        // actively waiting on.
    }
}

function dismiss() {
    state.isDismissed = true
}

function giveNow() {
    state.modal.isGiveMedicineOpen = true
}
</script>
