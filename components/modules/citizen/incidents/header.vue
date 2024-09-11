<template>
    <div class="flex flex-col items-center">
        <FormButton buttonStyle="incident" @click="state.modal.isReportIncidentOpen = true">
            ! {{ $t('citizens.incidents.reportIncident') }}
        </FormButton>
        <FormButton buttonStyle="incident-link">
            {{ $t('citizens.incidents.seePreviousIncident') }}
        </FormButton>
        <ModulesCitizenIncidentsModalNew :isModalOpen="state.modal.isReportIncidentOpen"
            @close="state.modal.isReportIncidentOpen = false" />
    </div>
</template>

<script setup lang="ts">
const state = reactive({
    modal: {
        isReportIncidentOpen: false
    },
})
</script>