<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('medicineMissedDoses.pageTitle') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>
                {{ $t('medicineMissedDoses.pageTitle') }}
            </template>

            <div class="min-h-44 space-y-3">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-5" v-if="state.missedDoses?.data?.length > 0">
                        <div class="bg-white ring-1 ring-gray-200 rounded-md p-5 border-l-4 border-red-500"
                            v-for="(missedDose, index) in state.missedDoses?.data" :key="index">
                            <div class="flex flex-col md:flex-row md:items-center gap-3 md:gap-10">
                                <div class="grow space-y-1">
                                    <Badge type="danger" class="w-fit">
                                        <p class="text-xxs truncate">
                                            {{ $t('medicineMissedDoses.missed') }}
                                        </p>
                                    </Badge>
                                    <h3 class="text-lg font-semibold">
                                        {{ medicineName(missedDose) }}
                                    </h3>
                                    <p class="w-fit text-sm">
                                        {{ missedDose?.citizen?.firstname }} {{ missedDose?.citizen?.lastname }}
                                    </p>
                                    <p class="text-sm">
                                        {{ $t('medicineMissedDoses.wasDueOn') }}:
                                        {{ formatDateToReadable(missedDose?.date) }} {{ missedDose?.time }}
                                    </p>
                                </div>
                                <div>
                                    <FormButton buttonSize="sm" @click="giveNow(missedDose)">
                                        <Icon name="ph:pill" class="size-4" />
                                        {{ $t('medicineMissedDoses.giveNow') }}
                                    </FormButton>
                                </div>
                            </div>
                        </div>
                        <Pagination :data="state.missedDoses" @previous="previous" @next="next" />
                    </div>
                    <div v-else class="min-h-44 flex items-center">
                        <p class="text-center grow">
                            {{ $t('medicineMissedDoses.noneFound') }}.
                        </p>
                    </div>
                </LoadingSpinner>
            </div>

            <ModulesUserCitizenMedicineModalGiveMedicine :isModalOpen="state.modal.isGiveMedicineOpen"
                :selectedMedicine="state.selectedMedicine" :citizenUuid="state.selectedCitizenUuid"
                :preselectedDate="state.selectedDate" :preselectedTime="state.selectedTime"
                @close="state.modal.isGiveMedicineOpen = false" @refreshMedicines="fetchMissedDoses" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { medicineMissedDoseService } from '@/components/api/user/MedicineMissedDoseService'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()
const { locale } = useI18n()
const breadcrumbLinks = [
    {
        name: 'medicineMissedDoses.pageTitle',
        translate: true,
        href: '/medicine-missed-doses',
    },
]
let currentTablePage = 1

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    missedDoses: [] as any,
    modal: {
        isGiveMedicineOpen: false,
    },
    selectedMedicine: {} as any,
    selectedCitizenUuid: null as string | null,
    selectedDate: null as string | null,
    selectedTime: null as string | null,
})

onMounted(() => {
    fetchMissedDoses()
})

function medicineName(missedDose: any): string {
    const medicine = missedDose?.citizen_medicine?.medicine
    if (!medicine) return ''
    return locale.value === 'en' ? (medicine.en_name || medicine.dk_name) : (medicine.dk_name || medicine.en_name)
}

async function fetchMissedDoses() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await medicineMissedDoseService.getMissedDoses({ page: currentTablePage })
        if (response) {
            state.missedDoses = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function previous() {
    currentTablePage--
    fetchMissedDoses()
}

function next() {
    currentTablePage++
    fetchMissedDoses()
}

function giveNow(missedDose: any) {
    state.selectedMedicine = missedDose?.citizen_medicine ?? {}
    state.selectedCitizenUuid = missedDose?.citizen?.uuid ?? null
    state.selectedDate = missedDose?.date ?? null
    state.selectedTime = missedDose?.time ?? null
    state.modal.isGiveMedicineOpen = true
}
</script>
