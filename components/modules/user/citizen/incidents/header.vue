<template>
    <div class="flex flex-col gap-y-2">
        <button type="button"
            class="inline-flex w-full items-center justify-center gap-x-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:border-red-300 hover:bg-red-100 whitespace-nowrap"
            @click="state.modal.isReportIncidentOpen = true">
            <Icon name="ph:warning-circle" class="h-4 w-4" aria-hidden="true" />
            {{ $t('citizens.incidents.reportIncident') }}
        </button>
        <button type="button"
            class="text-center text-xs font-medium text-slate-500 hover:text-red-600 transition-colors whitespace-nowrap"
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