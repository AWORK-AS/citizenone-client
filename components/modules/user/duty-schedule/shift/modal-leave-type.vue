<template>
    <div>
        <Modal size="md" :title="$t('shifts.form.markAsLeaveType')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="space-y-3 text-justify" v-if="language.locale.value === 'en'">
                    <p>
                        When a shift type is marked as a <strong>Leave Type</strong>, the system treats it differently
                        from regular worked shifts. This setting applies automatically to shift types such as
                        <strong>Vacation</strong> and <strong>Sick leave</strong>.
                    </p>
                    <p>
                        Leave types follow these rules:
                    </p>
                    <ul class="list-disc list-inside space-y-1">
                        <li>They count towards the employee's norm hours</li>
                        <li>They do <strong>not</strong> count as worked hours</li>
                        <li>They must <strong>not</strong> generate compensatory time</li>
                    </ul>
                    <p>
                        This means that registering vacation or sick leave will <strong>never increase</strong> an
                        employee's compensatory hours — it will only fulfill their norm hours for that day.
                    </p>
                </div>
                <div class="space-y-3 text-justify" v-if="language.locale.value === 'dk'">
                    <p>
                        Når en vagttype er markeret som en <strong>Fraværstype</strong>, behandler systemet den
                        anderledes end almindelige arbejdsvagter. Denne indstilling gælder automatisk for vagttyper som
                        <strong>Ferie</strong> og <strong>Sygdom</strong>.
                    </p>
                    <p>
                        Fraværstyper følger disse regler:
                    </p>
                    <ul class="list-disc list-inside space-y-1">
                        <li>De tæller med i medarbejderens normtimer</li>
                        <li>De tæller <strong>ikke</strong> som arbejdede timer</li>
                        <li>De må <strong>ikke</strong> generere afspadseringstid</li>
                    </ul>
                    <p>
                        Det betyder, at registrering af ferie eller sygdom <strong>aldrig</strong> vil øge en
                        medarbejders afspadseringstimer — det vil kun opfylde normtimerne for den pågældende dag.
                    </p>
                </div>
                <div class="mt-5 flex gap-x-3 justify-end">
                    <FormButton buttonStyle="cancel" @click="closeModal" class="rounded-md">
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
