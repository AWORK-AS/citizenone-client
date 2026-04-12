<template>
    <div>
        <Modal size="lg" :title="$t('features.seeNewFeatures')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="space-y-3" v-if="language.locale.value === 'en'">
                    <p>
                        We're excited to introduce a new feature that enhances collaboration and organization within our
                        folder structure system! Here's what you need to know:
                    </p>
                    <div>
                        <p class="font-semibold">
                            🔹 Folder Creation Requests by Regular Users
                        </p>
                        <ul>
                            <li>
                                Regular users can now request to create a new folder within an existing folder
                                structure.
                            </li>
                            <li>
                                This allows users to propose additions that improve clarity, workflow, or file
                                organization.
                            </li>
                        </ul>
                    </div>
                    <div>
                        <p class="font-semibold">
                            🔒 Admin Approval Required
                        </p>
                        <ul>
                            <li>
                                All folder creation requests will be reviewed and approved by an administrator.
                            </li>
                            <li>
                                This ensures consistency, relevance, and proper management of the folder hierarchy.
                            </li>
                        </ul>
                    </div>
                    <div>
                        <p class="font-semibold">
                            🗂️ Updated Folder Structures for All Citizens
                        </p>
                        <ul>
                            <li>
                                Once a folder request is approved, the updated folder structure will be reflected across
                                all citizens who share that structure.
                            </li>
                            <li>
                                This means everyone using that structure will see the new folder.
                            </li>
                        </ul>
                    </div>
                    <div>
                        <p class="font-semibold">
                            ✅ No Impact on Existing Files
                        </p>
                        <ul>
                            <li>
                                Existing files and folders will remain intact—no data will be deleted or moved during
                                the update.
                            </li>
                            <li>
                                The new folder will simply be added to the current layout.
                            </li>
                        </ul>
                    </div>
                </div>
                <div v-if="language.locale.value === 'dk'">
                    <p>
                        Vi er glade for at introducere en ny funktion, der forbedrer samarbejde og organisering i vores
                        mappestruktursystem! Her er, hvad du skal vide:
                    </p>
                    <div>
                        <p class="font-semibold">
                            🔹 Anmodninger om oprettelse af mapper fra almindelige brugere
                        </p>
                        <ul>
                            <li>
                                Almindelige brugere kan nu anmode om at oprette en ny mappe inden for en eksisterende
                                mappestruktur.
                            </li>
                            <li>
                                Dette giver brugerne mulighed for at foreslå tilføjelser, der forbedrer overblik,
                                arbejdsgange eller filorganisering.
                            </li>
                        </ul>
                    </div>
                    <div>
                        <p class="font-semibold">
                            🔒 Godkendelse fra administrator kræves
                        </p>
                        <ul>
                            <li>
                                Alle anmodninger om oprettelse af mapper vil blive gennemgået og godkendt af en
                                administrator.
                            </li>
                            <li>
                                Dette sikrer konsistens, relevans og korrekt håndtering af mappestrukturen.
                            </li>
                        </ul>
                    </div>
                    <div>
                        <p class="font-semibold">
                            🗂️ Opdaterede mappestrukturer for alle borgere
                        </p>
                        <ul>
                            <li>
                                Når en anmodning er godkendt, vil den opdaterede mappestruktur blive vist hos alle
                                borgere, der deler den pågældende struktur.
                            </li>
                            <li>
                                Det betyder, at alle brugere med den struktur vil se den nye mappe.
                            </li>
                        </ul>
                    </div>
                    <div>
                        <p class="font-semibold">
                            ✅ Ingen påvirkning af eksisterende filer
                        </p>
                        <ul>
                            <li>
                                Eksisterende filer og mapper forbliver intakte — ingen data bliver slettet eller flyttet
                                under opdateringen.
                            </li>
                            <li>
                                Den nye mappe bliver blot tilføjet til den nuværende struktur.
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="mt-6">
                    <FormButton type="button" buttonStyle="cancel" class="w-full" @click="closeModal()">
                        {{ $t('close') }}
                    </FormButton>
                </div>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { useI18n } from "vue-i18n"

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const language = useI18n()
const emit = defineEmits(['close'])

function closeModal() {
    emit('close')
}
</script>