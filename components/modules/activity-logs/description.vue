<template>
    <div>
        <p v-if="props.description === 'An add on deal has been created'">
            {{ $t('activityLogs.logs.anAddOnDealHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'An add on deal has been updated'">
            {{ $t('activityLogs.logs.anAddOnDealHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'An add on deal has been deleted'">
            {{ $t('activityLogs.logs.anAddOnDealHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'An application has been created'">
            {{ $t('activityLogs.logs.anApplicationHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'An application has been updated'">
            {{ $t('activityLogs.logs.anApplicationHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'An application has been deleted'">
            {{ $t('activityLogs.logs.anApplicationHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'An assessment attachment has been created'">
            {{ $t('activityLogs.logs.anAssessmentAttachmentHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'An assessment attachment has been updated'">
            {{ $t('activityLogs.logs.anAssessmentAttachmentHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'An assessment attachment has been deleted'">
            {{ $t('activityLogs.logs.anAssessmentAttachmentHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A citizen has been created'">
            {{ $t('activityLogs.logs.aCitizenHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A citizen has been updated'">
            {{ $t('activityLogs.logs.aCitizenHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A citizen has been deleted'">
            {{ $t('activityLogs.logs.aCitizenHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A citizen address has been created'">
            {{ $t('activityLogs.logs.aCitizenAddressHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A citizen address has been updated'">
            {{ $t('activityLogs.logs.aCitizenAddressHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A citizen address has been deleted'">
            {{ $t('activityLogs.logs.aCitizenAddressHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A citizen contact has been created'">
            {{ $t('activityLogs.logs.aCitizenContactHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A citizen contact has been updated'">
            {{ $t('activityLogs.logs.aCitizenContactHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A citizen contact has been deleted'">
            {{ $t('activityLogs.logs.aCitizenContactHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A citizen documents & folder has been created'">
            {{ $t('activityLogs.logs.aCitizenDocumentsFolderHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A citizen documents & folder has been updated'">
            {{ $t('activityLogs.logs.aCitizenDocumentsFolderHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A citizen documents & folder has been deleted'">
            {{ $t('activityLogs.logs.aCitizenDocumentsFolderHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A citizen goal has been created'">
            {{ $t('activityLogs.logs.aCitizenGoalHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A citizen goal has been updated'">
            {{ $t('activityLogs.logs.aCitizenGoalHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A citizen goal has been deleted'">
            {{ $t('activityLogs.logs.aCitizenGoalHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A citizen incident has been created'">
            {{ $t('activityLogs.logs.aCitizenIncidentHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A citizen incident has been updated'">
            {{ $t('activityLogs.logs.aCitizenIncidentHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A citizen incident has been deleted'">
            {{ $t('activityLogs.logs.aCitizenIncidentHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A citizen incident attachment has been created'">
            {{ $t('activityLogs.logs.aCitizenIncidentAttachmentHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A citizen incident attachment has been updated'">
            {{ $t('activityLogs.logs.aCitizenIncidentAttachmentHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A citizen incident attachment has been deleted'">
            {{ $t('activityLogs.logs.aCitizenIncidentAttachmentHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A citizen journal has been created'">
            {{ $t('activityLogs.logs.aCitizenJournalHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A citizen journal has been updated'">
            {{ $t('activityLogs.logs.aCitizenJournalHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A citizen journal has been deleted'">
            {{ $t('activityLogs.logs.aCitizenJournalHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A citizen medicine has been created'">
            {{ $t('activityLogs.logs.aCitizenMedicineHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A citizen medicine has been updated'">
            {{ $t('activityLogs.logs.aCitizenMedicineHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A citizen medicine has been deleted'">
            {{ $t('activityLogs.logs.aCitizenMedicineHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A citizen medicine history has been created'">
            {{ $t('activityLogs.logs.aCitizenMedicineHistoryHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A citizen medicine history has been updated'">
            {{ $t('activityLogs.logs.aCitizenMedicineHistoryHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A citizen medicine history has been deleted'">
            {{ $t('activityLogs.logs.aCitizenMedicineHistoryHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A citizen plan has been created'">
            {{ $t('activityLogs.logs.aCitizenPlanHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A citizen plan has been updated'">
            {{ $t('activityLogs.logs.aCitizenPlanHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A citizen plan has been deleted'">
            {{ $t('activityLogs.logs.aCitizenPlanHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A citizen protocol has been created'">
            {{ $t('activityLogs.logs.aCitizenProtocolHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A citizen protocol has been updated'">
            {{ $t('activityLogs.logs.aCitizenProtocolHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A citizen protocol has been deleted'">
            {{ $t('activityLogs.logs.aCitizenProtocolHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A citizen risk assessment has been created'">
            {{ $t('activityLogs.logs.aCitizenRiskAssessmentHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A citizen risk assessment has been updated'">
            {{ $t('activityLogs.logs.aCitizenRiskAssessmentHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A citizen risk assessment has been deleted'">
            {{ $t('activityLogs.logs.aCitizenRiskAssessmentHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A citizen subgoal has been created'">
            {{ $t('activityLogs.logs.aCitizenSubgoalHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A citizen subgoal has been updated'">
            {{ $t('activityLogs.logs.aCitizenSubgoalHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A citizen subgoal has been deleted'">
            {{ $t('activityLogs.logs.aCitizenSubgoalHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A company has been created'">
            {{ $t('activityLogs.logs.aCompanyHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A company has been updated'">
            {{ $t('activityLogs.logs.aCompanyHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A company has been deleted'">
            {{ $t('activityLogs.logs.aCompanyHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A company address has been created'">
            {{ $t('activityLogs.logs.aCompanyAddressHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A company address has been updated'">
            {{ $t('activityLogs.logs.aCompanyAddressHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A company address has been deleted'">
            {{ $t('activityLogs.logs.aCompanyAddressHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A department has been created'">
            {{ $t('activityLogs.logs.aDepartmentHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A department has been updated'">
            {{ $t('activityLogs.logs.aDepartmentHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A department has been deleted'">
            {{ $t('activityLogs.logs.aDepartmentHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'An employee emergency contact has been created'">
            {{ $t('activityLogs.logs.anEmployeeEmergencyContactHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'An employee emergency contact has been updated'">
            {{ $t('activityLogs.logs.anEmployeeEmergencyContactHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'An employee emergency contact has been deleted'">
            {{ $t('activityLogs.logs.anEmployeeEmergencyContactHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'An employee address has been created'">
            {{ $t('activityLogs.logs.anEmployeeAddressHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'An employee address has been updated'">
            {{ $t('activityLogs.logs.anEmployeeAddressHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'An employee address has been deleted'">
            {{ $t('activityLogs.logs.anEmployeeAddressHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'An employee detail has been created'">
            {{ $t('activityLogs.logs.anEmployeeDetailHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'An employee detail has been updated'">
            {{ $t('activityLogs.logs.anEmployeeDetailHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'An employee detail has been deleted'">
            {{ $t('activityLogs.logs.anEmployeeDetailHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'An employee document has been created'">
            {{ $t('activityLogs.logs.anEmployeeDocumentHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'An employee document has been updated'">
            {{ $t('activityLogs.logs.anEmployeeDocumentHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'An employee document has been deleted'">
            {{ $t('activityLogs.logs.anEmployeeDocumentHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'An employee trustee has been created'">
            {{ $t('activityLogs.logs.anEmployeeTrusteeHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'An employee trustee has been updated'">
            {{ $t('activityLogs.logs.anEmployeeTrusteeHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'An employee trustee has been deleted'">
            {{ $t('activityLogs.logs.anEmployeeTrusteeHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A use of force attachment has been created'">
            {{ $t('activityLogs.logs.aUseOfForceAttachmentHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A use of force attachment has been updated'">
            {{ $t('activityLogs.logs.aUseOfForceAttachmentHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A use of force attachment has been deleted'">
            {{ $t('activityLogs.logs.aUseOfForceAttachmentHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'An invoice has been created'">
            {{ $t('activityLogs.logs.anInvoiceHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'An invoice has been updated'">
            {{ $t('activityLogs.logs.anInvoiceHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'An invoice has been deleted'">
            {{ $t('activityLogs.logs.anInvoiceHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'An invoice detail has been created'">
            {{ $t('activityLogs.logs.anInvoiceDetailHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'An invoice detail has been updated'">
            {{ $t('activityLogs.logs.anInvoiceDetailHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'An invoice detail has been deleted'">
            {{ $t('activityLogs.logs.anInvoiceDetailHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A job specialty has been created'">
            {{ $t('activityLogs.logs.aJobSpecialtyHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A job specialty has been updated'">
            {{ $t('activityLogs.logs.aJobSpecialtyHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A job specialty has been deleted'">
            {{ $t('activityLogs.logs.aJobSpecialtyHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A job title has been created'">
            {{ $t('activityLogs.logs.aJobTitleHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A job title has been updated'">
            {{ $t('activityLogs.logs.aJobTitleHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A job title has been deleted'">
            {{ $t('activityLogs.logs.aJobTitleHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A journal attachment has been created'">
            {{ $t('activityLogs.logs.aJournalAttachmentHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A journal attachment has been updated'">
            {{ $t('activityLogs.logs.aJournalAttachmentHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A journal attachment has been deleted'">
            {{ $t('activityLogs.logs.aJournalAttachmentHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A calendar has been created'">
            {{ $t('activityLogs.logs.aCalendarHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A calendar has been updated'">
            {{ $t('activityLogs.logs.aCalendarHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A calendar has been deleted'">
            {{ $t('activityLogs.logs.aCalendarHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A news has been created'">
            {{ $t('activityLogs.logs.aNewsHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A news has been updated'">
            {{ $t('activityLogs.logs.aNewsHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A news has been deleted'">
            {{ $t('activityLogs.logs.aNewsHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A nursing area has been created'">
            {{ $t('activityLogs.logs.aNursingAreaHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A nursing area has been updated'">
            {{ $t('activityLogs.logs.aNursingAreaHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A nursing area has been deleted'">
            {{ $t('activityLogs.logs.aNursingAreaHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A vote has been created'">
            {{ $t('activityLogs.logs.aVoteHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A vote has been updated'">
            {{ $t('activityLogs.logs.aVoteHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A vote has been deleted'">
            {{ $t('activityLogs.logs.aVoteHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A procedure has been created'">
            {{ $t('activityLogs.logs.aProcedureHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A procedure has been updated'">
            {{ $t('activityLogs.logs.aProcedureHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A procedure has been deleted'">
            {{ $t('activityLogs.logs.aProcedureHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A protocol has been created'">
            {{ $t('activityLogs.logs.aProtocolHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A protocol has been updated'">
            {{ $t('activityLogs.logs.aProtocolHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A protocol has been deleted'">
            {{ $t('activityLogs.logs.aProtocolHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A sales campaign has been created'">
            {{ $t('activityLogs.logs.aSalesCampaignHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A sales campaign has been updated'">
            {{ $t('activityLogs.logs.aSalesCampaignHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A sales campaign has been deleted'">
            {{ $t('activityLogs.logs.aSalesCampaignHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A duty schedule has been created'">
            {{ $t('activityLogs.logs.aDutyScheduleHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A duty schedule has been updated'">
            {{ $t('activityLogs.logs.aDutyScheduleHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A duty schedule has been deleted'">
            {{ $t('activityLogs.logs.aDutyScheduleHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A schedule grab has been created'">
            {{ $t('activityLogs.logs.aScheduleGrabHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A schedule grab has been updated'">
            {{ $t('activityLogs.logs.aScheduleGrabHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A schedule grab has been deleted'">
            {{ $t('activityLogs.logs.aScheduleGrabHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A schedule slot has been created'">
            {{ $t('activityLogs.logs.aScheduleSlotHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A schedule slot has been updated'">
            {{ $t('activityLogs.logs.aScheduleSlotHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A schedule slot has been deleted'">
            {{ $t('activityLogs.logs.aScheduleSlotHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A schedule specialty has been created'">
            {{ $t('activityLogs.logs.aScheduleSpecialtyHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A schedule specialty has been updated'">
            {{ $t('activityLogs.logs.aScheduleSpecialtyHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A schedule specialty has been deleted'">
            {{ $t('activityLogs.logs.aScheduleSpecialtyHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A status has been created'">
            {{ $t('activityLogs.logs.aStatusHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A status has been updated'">
            {{ $t('activityLogs.logs.aStatusHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A status has been deleted'">
            {{ $t('activityLogs.logs.aStatusHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A time log has been created'">
            {{ $t('activityLogs.logs.aTimeLogHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A time log has been updated'">
            {{ $t('activityLogs.logs.aTimeLogHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A time log has been deleted'">
            {{ $t('activityLogs.logs.aTimeLogHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A use of force has been created'">
            {{ $t('activityLogs.logs.aUseOfForceHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A use of force has been updated'">
            {{ $t('activityLogs.logs.aUseOfForceHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A use of force has been deleted'">
            {{ $t('activityLogs.logs.aUseOfForceHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A user has been created'">
            {{ $t('activityLogs.logs.aUserHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A user has been updated'">
            {{ $t('activityLogs.logs.aUserHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A user has been deleted'">
            {{ $t('activityLogs.logs.aUserHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A user subscription has been created'">
            {{ $t('activityLogs.logs.aUserSubscriptionHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A user subscription has been updated'">
            {{ $t('activityLogs.logs.aUserSubscriptionHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A user subscription has been deleted'">
            {{ $t('activityLogs.logs.aUserSubscriptionHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A procedure attachment has been created'">
            {{ $t('activityLogs.logs.aProcedureAttachmentHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A procedure attachment has been updated'">
            {{ $t('activityLogs.logs.aProcedureAttachmentHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A procedure attachment has been delete'">
            {{ $t('activityLogs.logs.aProcedureAttachmentHasBeenDeleted') }}
        </p>
        <p v-if="props.description === 'A citizen wallet has been created'">
            {{ $t('activityLogs.logs.aCitizenWalletHasBeenCreated') }}
        </p>
        <p v-if="props.description === 'A citizen wallet has been updated'">
            {{ $t('activityLogs.logs.aCitizenWalletHasBeenUpdated') }}
        </p>
        <p v-if="props.description === 'A citizen wallet has been deleted'">
            {{ $t('activityLogs.logs.aCitizenWalletHasBeenDeleted') }}
        </p>
        <p v-if="props.description.includes('logged in')">
            {{ props.description.replace("logged in", $t('activityLogs.logs.loggedIn')) }}
        </p>
        <p v-if="props.description.includes('logged out')">
            {{ props.description.replace("logged in", $t('activityLogs.logs.loggedOut')) }}
        </p>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    description: {
        type: String,
        required: true,
    },
})
</script>