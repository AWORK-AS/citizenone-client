<template>
    <div>
        <LoadingSpinner :isActive="state.isPageLoading">
            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />
            <div class="md:flex md:justify-between md:space-x-5 relative">
                <div class="flex items-start space-x-5">
                    <div class="flex-shrink-0">
                        <div class="relative">
                            <img :src="state.selectedCitizen?.data?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${state.selectedCitizen?.data?.firstname + ' ' + state.selectedCitizen?.data?.lastname}`"
                                class="rounded-full w-16 h-16 object-cover" />
                            <span class="absolute inset-0 rounded-full shadow-inner" aria-hidden="true" />
                        </div>
                    </div>
                    <div class="pt-1.5 space-y-1">
                        <h1 class="text-2xl font-bold text-gray-900">
                            {{ state.selectedCitizen?.data?.firstname }}
                            {{ state.selectedCitizen?.data?.lastname }}
                        </h1>
                        <p class="text-sm font-medium text-gray-700">
                            {{ state.selectedCitizen?.data?.email }}
                        </p>
                        <p class="text-sm font-medium text-gray-700">
                            {{ state.selectedCitizen?.data?.phone }}
                        </p>
                        <p class="text-xs font-medium text-gray-700">
                            {{ state.selectedCitizen?.data?.diagnosis }}
                        </p>
                    </div>
                </div>
                <!-- <ModulesCitizenMedicineQrHeader :selectedCitizen="state.selectedCitizen"
                    v-if="$route.name === 'citizens-uuid-medicine-journals'"
                    class="lg:absolute lg:right-0 lg:-top-20" /> -->
                <ModulesCitizenIncidentsHeader v-if="$route.name === 'citizens-uuid-journals'" />
            </div>
        </LoadingSpinner>
    </div>
</template>

<script setup lang="ts">
import { citizenService } from '@/components/api/CitizenService'
import type { Error } from '@/types'

const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    selectedCitizen: [] as any,
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