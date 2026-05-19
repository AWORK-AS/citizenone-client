<template>
    <div>
        <Modal size="md" :title="$t('shifts.table.standardShift')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="space-y-3 text-justify" v-if="language.locale.value === 'en'">
                    <p>
                        This shift type is marked as standard because it is an essential part of the system’s core
                        functions. It is used automatically in connection with sick leave, vacation, night shifts, and
                        other types of absence - and is linked to applicable rules and legislation.
                    </p>
                    <p>
                        Therefore, it cannot be deleted, as that would affect features such as absence tracking, time
                        calculation, and shift scheduling.
                    </p>
                    <p>
                        However, you are free to change the name and color if needed - but the shift type itself must
                        remain in the system to ensure everything continues to work correctly.
                    </p>
                </div>
                <div class="space-y-3 text-justify" v-if="language.locale.value === 'dk'">
                    <p>
                        Denne vagttype er markeret som standard, fordi den er en vigtig del af systemets
                        kernefunktioner. Den bruges automatisk i forbindelse med bl.a. sygetimer, ferie, nattevagter og
                        andre typer fravær - og er forbundet med gældende regler og lovgivning.
                    </p>
                    <p>
                        Derfor kan man ikke slette den, da det vil påvirke funktioner som fraværsregistrering,
                        timeberegning og vagtskemaer.
                    </p>
                    <p>
                        Du kan dog sagtens ændre navnet og farven, hvis du ønsker det, men selve vagttypen skal blive i
                        systemet for at sikre, at alt fungerer korrekt.
                    </p>
                </div>
                <div class="space-y-3 text-justify" v-if="language.locale.value === 'no'">
                    <p>
                        Denne vakttypen er merket som standard fordi den er en viktig del av systemets
                        kjernefunksjoner. Den brukes automatisk i forbindelse med bl.a. syketimer, ferie, nattevakter og
                        andre typer fravær - og er knyttet til gjeldende regler og lovgivning.
                    </p>
                    <p>
                        Derfor kan den ikke slettes, da det vil påvirke funksjoner som fraværsregistrering,
                        timeberegning og vaktplaner.
                    </p>
                    <p>
                        Du kan imidlertid fritt endre navn og farge om ønskelig - men selve vakttypen må forbli i
                        systemet for å sikre at alt fortsetter å fungere korrekt.
                    </p>
                </div>
                <div class="space-y-3 text-justify" v-if="language.locale.value === 'sv'">
                    <p>
                        Den här skifttypen är markerad som standard eftersom den är en viktig del av systemets
                        kärnfunktioner. Den används automatiskt i samband med bl.a. sjuktimmar, semester, nattskift och
                        andra typer av frånvaro - och är kopplad till gällande regler och lagstiftning.
                    </p>
                    <p>
                        Därför kan den inte tas bort, eftersom det skulle påverka funktioner som frånvaroregistrering,
                        tidsberäkning och schemaläggning.
                    </p>
                    <p>
                        Du kan däremot fritt ändra namn och färg om du vill - men skifttypen måste finnas kvar i
                        systemet för att säkerställa att allt fortsätter fungera korrekt.
                    </p>
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