<template>
    <div class="flex flex-col items-center gap-y-1.5">
        <button type="button"
            class="inline-flex items-center gap-x-1.5 rounded-lg bg-red-400 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 transition-colors whitespace-nowrap"
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