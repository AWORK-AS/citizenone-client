<template>
    <div>
        <LoadingSpinner :isActive="state.isPageLoading">
            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />
            <div class="grid grid-cols-12 gap-6 relative">
                <div :class="[
                    ['citizens-uuid-medicine-journals', 'citizens-uuid-journals'].includes($route.name as any) ? 'col-span-12 lg:col-span-9' : 'col-span-12',
                    'w-full bg-white ring-1 ring-gray-200 rounded-md p-5 border-l-4 border-secondary'
                ]">
                    <div class="md:flex md:items-start md:gap-x-8">
                        <div class="flex justify-center flex-shrink-0">
                            <div class="relative">
                                <img :src="state.selectedCitizen?.data?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${state.selectedCitizen?.data?.firstname + ' ' + state.selectedCitizen?.data?.lastname}`"
                                    class="rounded-full w-28 h-28 object-cover" />
                                <span class="absolute inset-0 rounded-full shadow-inner" aria-hidden="true" />
                            </div>
                        </div>
                        <div class="pt-1.5 space-y-4">
                            <div class="text-center md:text-left">
                                <h1 class="text-2xl font-bold text-gray-900 gr">
                                    {{ state.selectedCitizen?.data?.firstname }}
                                    {{ state.selectedCitizen?.data?.lastname }}
                                </h1>
                                <p class="text-sm font-medium text-gray-700">
                                    {{ state.selectedCitizen?.data?.social_security_number }}
                                </p>
                            </div>
                            <div>
                                <div class="flex items-center gap-x-1">
                                    <Icon name="ph:cake" class="h-4 w-4" aria-hidden="true" />
                                    <p class="text-sm font-medium text-gray-700">
                                        {{ formatDateToReadable(state.selectedCitizen?.data?.birthday) }}
                                    </p>
                                </div>
                                <div class="flex items-center gap-x-1">
                                    <Icon name="ph:envelope-open" class="h-4 w-4" aria-hidden="true" />
                                    <p class="text-sm font-medium text-gray-700">
                                        {{ state.selectedCitizen?.data?.email }}
                                    </p>
                                </div>
                                <div class="flex items-center gap-x-1">
                                    <Icon name="ph:phone" class="h-4 w-4" aria-hidden="true" />
                                    <p class="text-sm font-medium text-gray-700">
                                        {{ state.selectedCitizen?.data?.phone }}
                                    </p>
                                </div>
                            </div>
                            <div class="space-y-1.5">
                                <div class="text-xs flex items-center flex-wrap gap-1"
                                    v-if="state.selectedCitizen?.data?.addictions?.length > 0">
                                    <p>
                                        {{ customPagesStore.getCustomPagesName?.addictions }}:
                                    </p>
                                    <span v-for="(addiction, index) in state.selectedCitizen?.data?.addictions"
                                        :key=index class="bg-primary p-1 text-white rounded-md text-xxs">
                                        {{ addiction?.name }}
                                    </span>
                                </div>
                                <div class="text-xs flex items-center flex-wrap gap-1"
                                    v-if="state.selectedCitizen?.data?.diagnoses?.length > 0">
                                    <p>{{ $t('citizens.diagnoses') }}:</p>
                                    <span v-for="(diagnosis, index) in state.selectedCitizen?.data?.diagnoses"
                                        :key=index class="bg-primary p-1 text-white rounded-md text-xxs">
                                        {{ diagnosis?.name }}
                                    </span>
                                </div>
                            </div>
                            <div class="text-xs font-medium text-gray-700"
                                :class="state.showExpandedNote ? '' : 'line-clamp-2'">
                                {{ state.selectedCitizen?.data?.note }}
                            </div>
                            <button @click="state.showExpandedNote = !state.showExpandedNote"
                                class="text-primary text-xs hover:text-primary-700">
                                {{ state.showExpandedNote ? $t('showLess') : $t('showMore') }}
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-span-12 lg:col-span-3 flex flex-col justify-center lg:gap-8">
                    <ModulesUserCitizenMedicineQrHeader :selectedCitizen="state.selectedCitizen"
                        v-if="$route.name === 'citizens-uuid-medicine-journals'" />
                    <ModulesUserCitizenUseOfForceHeader :selectedCitizen="state.selectedCitizen"
                        v-if="$route.name === 'citizens-uuid-journals'" />
                    <ModulesUserCitizenIncidentsHeader v-if="$route.name === 'citizens-uuid-journals'" />
                </div>
            </div>
        </LoadingSpinner>
    </div>
</template>

<script setup lang="ts">
import { citizenService } from '@/components/api/user/CitizenService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useCustomPagesStore } from '@/store/custom-pages'
import type { Error } from '@/types'

const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const customPagesStore = useCustomPagesStore() as any
const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    selectedCitizen: {} as any,
    showExpandedNote: false,
})

onMounted(() => {
    fetchCitizen()
})

async function fetchCitizen() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await citizenService.getCitizen(citizenUuid)
        if (response) {
            state.selectedCitizen = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>