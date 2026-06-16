<template>
    <div class="flex flex-col items-center gap-y-1.5">
        <button type="button"
            class="flex w-full items-center justify-center gap-x-1.5 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 hover:border-red-300 transition-colors"
            @click="state.modal.isReportIncidentOpen = true">
            ! {{ $t('citizens.incidents.reportIncident') }}
        </button>
        <button type="button"
            class="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors whitespace-nowrap"
            @click="state.slideOver.isReportIncidentOpen = true">
            {{ $t('citizens.incidents.seePreviousIncident') }}
        </button>
        <ModulesUserCitizenIncidentsModalNew :isModalOpen="state.modal.isReportIncidentOpen"
            @close="state.modal.isReportIncidentOpen = false" />
        <ModulesUserCitizenIncidentsSlideOver :isOpen="state.slideOver.isReportIncidentOpen"
            @close="state.slideOver.isReportIncidentOpen = false" />
    </div>
</template>

<script setup lang="ts">
const state = reactive({
    modal: {
        isReportIncidentOpen: false
    },
    slideOver: {
        isReportIncidentOpen: false
    },
})
</script>