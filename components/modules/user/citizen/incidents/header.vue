<template>
    <div class="flex flex-col items-center">
        <FormButton buttonStyle="incident" @click="state.modal.isReportIncidentOpen = true">
            ! {{ $t('citizens.incidents.reportIncident') }}
        </FormButton>
        <FormButton buttonStyle="incident-link" @click="state.slideOver.isReportIncidentOpen = true">
            {{ $t('citizens.incidents.seePreviousIncident') }}
        </FormButton>
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