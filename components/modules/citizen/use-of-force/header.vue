<template>
    <div class="flex flex-col items-center">
        <FormButton buttonStyle="incident" @click="state.modal.isReportUseOfForceOpen = true">
            ! {{ $t('citizens.useOfForce.reportUseOfForce') }}
        </FormButton>
        <FormButton buttonStyle="incident-link" @click="state.slideOver.isReportUseOfForceOpen = true">
            {{ $t('citizens.useOfForce.seePreviousUseOfForce') }}
        </FormButton>
        <ModulesCitizenUseOfForceModalNew :isModalOpen="state.modal.isReportUseOfForceOpen"
            @close="state.modal.isReportUseOfForceOpen = false" />
        <ModulesCitizenUseOfForceSlideOver :isOpen="state.slideOver.isReportUseOfForceOpen"
            @close="state.slideOver.isReportUseOfForceOpen = false" />
    </div>
</template>

<script setup lang="ts">
const state = reactive({
    modal: {
        isReportUseOfForceOpen: false
    },
    slideOver: {
        isReportUseOfForceOpen: false
    },
})
</script>