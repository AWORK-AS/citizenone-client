<template>
    <div>
        <Modal size="md"
            :title="$t('citizens.medicineJournals.relevantHelpLinksForWorkingWithMedicine.relevantHelpLinksForWorkingWithMedicine')"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="space-y-3">
                    <p class="text-sm">
                        {{
                            $t('citizens.medicineJournals.relevantHelpLinksForWorkingWithMedicine.hereYouWillFindRelevantLinks')
                        }}.
                    </p>
                    <div class="text-sm">
                        {{ $t('citizens.medicineJournals.relevantHelpLinksForWorkingWithMedicine.uthLabel') }}
                        <p class="text-primary hover:text-primary-700 cursor-pointer"
                            @click="navigateToExternalLink('https://stps.dk/da/rapporter-en-utilsigtet-haendelse')">
                            https://stps.dk/da/rapporter-en-utilsigtet-haendelse
                        </p>
                    </div>
                    <div class="text-sm">
                        {{ $t('citizens.medicineJournals.relevantHelpLinksForWorkingWithMedicine.dpsdLabel') }}
                        <p class="text-primary hover:text-primary-700 cursor-pointer"
                            @click="navigateToExternalLink('https://uth.dpsd.dk')">
                            https://uth.dpsd.dk
                        </p>
                    </div>
                </div>
                <div class="mt-5 flex gap-x-3 justify-end">
                    <FormButton buttonStyle="cancel" @click="closeModal">
                        {{ $t('close') }}
                    </FormButton>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])

function closeModal() {
    emit('close')
}

async function navigateToExternalLink(link: any) {
    await navigateTo(link, {
        external: true,
        open: {
            target: '_blank',
        }
    })
}
</script>