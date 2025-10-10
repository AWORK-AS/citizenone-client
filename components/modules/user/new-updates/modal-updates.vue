<template>
    <div>
        <Modal size="lg" :title="`${$t('updates.newUpdatesFrom')} ${formatDateToReadable(state.currentVersion)}`"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="space-y-5 text-sm text-gray-700">
                    <div class="flex items-center">
                        <label class="text-sm text-gray-500">
                            {{ $t('updates.showUpdate') }}:
                        </label>
                        <select v-model="state.currentVersion" @change="loadUpdates(state.currentVersion)"
                            class="text-sm text-primary underline bg-transparent focus:outline-none">
                            <option v-for="(version, i) in state.availableVersions" :key="i" :value="version">
                                {{ formatDateToReadable(version) }}
                            </option>
                        </select>
                    </div>

                    <div v-for="(update, index) in state.updates" :key="index">
                        <h4 class="font-semibold text-gray-800">{{ update.title }}</h4>
                        <div class="mt-1 space-y-1">
                            <p v-for="(desc, i) in update.description" :key="i">
                                {{ desc }}
                            </p>
                        </div>
                    </div>

                    <div class="pt-4 flex justify-end">
                        <FormButton buttonStyle="cancel" @click="closeModal" class="rounded-md">
                            {{ $t('close') }}
                        </FormButton>
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close'])
const language = useI18n()
const { formatDateToReadable } = useDatetimeFormatter()

function closeModal() {
    emit('close')
}

const state = reactive({
    currentVersion: '2025-10-10',
    availableVersions: [
        '2025-10-10',
        '2025-10-03',
        '2025-09-26',
        '2025-09-19',
        '2025-09-12',
        '2025-08-29',
        '2025-08-15',
        '2025-08-01',
        '2025-07-25',
    ],
    updates: [] as Array<{ title: string, description: string[] }>
})

const allUpdates: Record<string, Record<string, { title: string, description: string[] }[]>> = {
    en: {
        '2025-10-10': [
            {
                title: 'Files attachment on sending of email',
                description: [
                    'A feature has been introduced to allow attachments to be added when sending emails.',
                    'This enhances the capability to send documents and files along with emails, improving communication efficiency.'
                ],
            },
            {
                title: 'Downloading of attachment for the secured mail',
                description: [
                    'A functionality has been added to allow downloading of attachments from secured emails.',
                    'This improves secure access to important files and documents sent through encrypted email channels.'
                ],
            },
            {
                title: 'Exporting of duty schedule per department',
                description: [
                    'A new feature has been added to export duty schedules specific to each department.',
                    'This allows for easier distribution and management of departmental duty rosters, enhancing organizational efficiency.'
                ],
            },
            {
                title: 'Admin-defined citizen information display',
                description: [
                    'Admins can now determine and define what information should be displayed in the specific citizen box when viewing a single citizen.',
                    'This allows for more customized access to citizen details, ensuring that only relevant information is shown to regular users.'
                ],
            }
        ],
        '2025-10-03': [
            {
                title: 'Web leads',
                description: [
                    'The leads app can now be activated and used to view leads.',
                    'This provides enhanced management and tracking of potential leads in the system.',
                ],
            },
            {
                title: 'Download and print specific medicine of the citizen',
                description: [
                    'A feature has been added to allow downloading and printing specific medicine details for citizens.',
                    'This improves the efficiency of handling and sharing medication information.',
                ],
            },
            {
                title: 'Additional fixed time intervals',
                description: [
                    'Additional fixed time intervals for maximum dosage per time have been added.',
                    'This ensures more flexibility and accuracy in scheduling medication dosages.',
                ],
            },
            {
                title: 'Helping link for medicine',
                description: [
                    'A new helping link for medicine has been added.',
                    'This link provides relevant resources to assist staff in their work with medication.',
                ],
            },
            {
                title: 'Helping link for use of force and incident reports',
                description: [
                    'A helping link has been introduced for the use of force and incident reports.',
                    'This link offers useful information and guidelines for handling these sensitive situations.',
                ],
            },
        ],
        '2025-09-26': [
            {
                title: 'Listing of holidays in the calendar',
                description: [
                    'Holidays are now displayed directly in the calendar.',
                    'This provides better visibility for planning and coordination.',
                ],
            },
            {
                title: '"Quick risk assessment" in the daily overview',
                description: [
                    'If enabled in the admin settings, a quick risk assessment is now shown in the daily overview.',
                    'This allows for faster identification of potential risks during daily operations.',
                ],
            },
            {
                title: 'Current citizen treatments in the daily overview',
                description: [
                    'Ongoing citizen treatments are now visible in the daily overview.',
                    'This gives staff a clear and immediate overview of current care activities.',
                ],
            },
        ],
        '2025-09-19': [
            {
                title: 'Import and export employees via CSV template file',
                description: [
                    'Employees can now be imported and exported using a CSV template file.',
                    'This simplifies employee data management and ensures consistency across records.',
                ],
            },
            {
                title: 'Export citizens',
                description: [
                    'Citizen records can now be exported.',
                    'This allows for easier reporting, sharing, and data backup.',
                ],
            },
            {
                title: 'Listing of holidays in the duty schedule',
                description: [
                    'Holidays are now displayed within the duty schedule.',
                    'This helps improve planning and ensures accurate scheduling around holidays.',
                ],
            },
        ],
        '2025-09-12': [
            {
                title: 'Import citizens via CSV template file',
                description: [
                    'Citizens can now be imported using a CSV template file.',
                    'This streamlines the data entry process and ensures consistency in citizen records.',
                ],
            },
            {
                title: 'Users\' 2FA',
                description: [
                    'Two-factor authentication (2FA) is now available for users.',
                    'This adds an extra layer of security to user accounts and protects sensitive information.',
                ],
            },
            {
                title: 'New fields in the citizen\'s form: Traffic lights (Green, Yellow, and Red)',
                description: [
                    'New fields for traffic light status (Green, Yellow, and Red) have been added to the citizen\'s form.',
                    'Provide a description of the citizen\'s condition when they are in Green, Yellow, or Red status in creating a journal note.',
                ],
            },
        ],
        '2025-08-29': [
            {
                title: 'Default shift times in duty schedule',
                description: [
                    'You can now set default time in and time out for each shift in the duty schedule.',
                    'This helps standardize work hours and reduces manual entry errors.',
                ],
            },
            {
                title: 'Medication allergy tracking',
                description: [
                    'Citizens’ medication allergies can now be recorded and tracked.',
                    'This ensures better safety and informed decision-making for healthcare providers.',
                ],
            },
            {
                title: 'Sick leave counted as worked hours',
                description: [
                    'Sick leaves can now be counted as worked hours in the duty schedule.',
                    'This provides more accurate reporting and fairer scheduling.',
                ],
            },
        ],
        '2025-08-15': [
            {
                title: 'Microsoft email management in the Mail App',
                description: [
                    'You can now connect and manage your Microsoft email accounts directly in the Mail App.',
                    'This makes it easier to send, receive, and organize emails without switching between platforms.',
                ],
            },
        ],
        '2025-08-01': [
            {
                title: 'Intervention hours in citizens area',
                description: [
                    'Citizens can now view available intervention hours directly in the Citizens section.',
                    'This improves transparency and access to support services.',
                ],
            },
            {
                title: 'New app: CitizenOne AI',
                description: [
                    'We have now launched CitizenOne AI - your intelligent assistant that for example can give you a quick overview of how a citizen has been doing over the past month, share useful information about your organization or colleagues, and much more. All directly in CitizenOne, so you can work smarter and faster.'
                ],
            },
            {
                title: 'Change logs in duty schedule',
                description: [
                    'The duty schedule now includes a detailed change log.',
                    'Track all updates and modifications to duty assignments easily.',
                ],
            },
        ],
        '2025-07-25': [
            {
                title: 'Online Calendar Booking',
                description: [
                    'Now available for purchase in the Apps section.',
                    'After buying, go to Calendars to set it up and manage online bookings.',
                ],
            },
            {
                title: 'Departments in Duty Schedule',
                description: ['You can now assign shifts to specific departments.'],
            },
            {
                title: 'Shift Notes for Admins',
                description: ['Admins can now attach notes to individual shifts.'],
            },
            {
                title: 'Treatment Notifications Toggle',
                description: ['Option to enable or disable notifications for treatments.'],
            },
            {
                title: 'Edit & Delete Messages in Chats',
                description: ['You can now edit or delete messages directly in chats for better control and communication.'],
            },
            {
                title: 'Cleaner Navbar',
                description: [
                    'Notification and message badges are hidden when counts are zero.',
                    'New feature announcements will also appear here going forward.',
                ],
            },
        ],
    },
    dk: {
        '2025-10-10': [
            {
                title: 'Filvedhæftning ved afsendelse af e-mail',
                description: [
                    'En funktion er blevet introduceret, der gør det muligt at vedhæfte filer ved afsendelse af e-mails.',
                    'Dette forbedrer muligheden for at sende dokumenter og filer sammen med e-mails og øger kommunikationseffektiviteten.'
                ],
            },
            {
                title: 'Download af vedhæftning fra sikret e-mail',
                description: [
                    'En funktionalitet er blevet tilføjet, som gør det muligt at downloade vedhæftede filer fra sikre e-mails.',
                    'Dette forbedrer sikker adgang til vigtige filer og dokumenter sendt via krypterede e-mailkanaler.'
                ],
            },
            {
                title: 'Eksport af vagtplan pr. afdeling',
                description: [
                    'En ny funktion er blevet tilføjet, der gør det muligt at eksportere vagtplaner for hver afdeling.',
                    'Dette gør det lettere at distribuere og administrere afdelingsspecifikke vagtplaner og forbedrer den organisatoriske effektivitet.'
                ],
            },
            {
                title: 'Admin-defineret visning af borgerinformation',
                description: [
                    'Administratorer kan nu bestemme og definere, hvilken information der skal vises i den specifikke borgerboks, når der ses på en enkelt borger.',
                    'Dette muliggør en mere tilpasset adgang til borgeroplysninger og sikrer, at kun relevant information vises for almindelige brugere.'
                ],
            }
        ],
        '2025-10-03': [
            {
                title: 'Web leads',
                description: [
                    'Leads-appen kan nu aktiveres og bruges til at se leads.',
                    'Dette giver bedre styring og opfølgning på potentielle leads i systemet.',
                ],
            },
            {
                title: 'Download og print specifik medicin for borgeren',
                description: [
                    'En funktion er blevet tilføjet, som giver mulighed for at downloade og printe specifikke medicindetaljer for borgeren.',
                    'Dette forbedrer effektiviteten i håndtering og deling af medicinformation.',
                ],
            },
            {
                title: 'Yderligere faste tidsintervaller',
                description: [
                    'Yderligere faste tidsintervaller for maksimal dosis pr. tid er blevet tilføjet.',
                    'Dette sikrer mere fleksibilitet og nøjagtighed i planlægning af medicindoseringer.',
                ],
            },
            {
                title: 'Hjælpelink til medicin',
                description: [
                    'En ny hjælpelink til medicin er blevet tilføjet.',
                    'Denne link giver relevante ressourcer til at hjælpe personalet i arbejdet med medicin.',
                ],
            },
            {
                title: 'Hjælpelink til brug af magt og hændelsesrapporter',
                description: [
                    'En hjælpelink er blevet introduceret for brug af magt og hændelsesrapporter.',
                    'Denne link giver nyttige oplysninger og retningslinjer til håndtering af disse følsomme situationer.',
                ],
            },
        ],
        '2025-09-26': [
            {
                title: 'Visning af helligdage i kalenderen',
                description: [
                    'Helligdage vises nu direkte i kalenderen.',
                    'Dette giver bedre overblik til planlægning og koordinering.',
                ],
            },
            {
                title: '"Hurtig risikovurdering" i dagsoversigten',
                description: [
                    'Hvis aktiveret i admin-indstillingerne, vises en hurtig risikovurdering nu i dagsoversigten.',
                    'Dette gør det muligt hurtigt at identificere potentielle risici i den daglige drift.',
                ],
            },
            {
                title: 'Aktuelle borgerbehandlinger i dagsoversigten',
                description: [
                    'Igangværende borgerbehandlinger vises nu i dagsoversigten.',
                    'Dette giver medarbejderne et klart og øjeblikkeligt overblik over aktuelle plejeaktiviteter.',
                ],
            },
        ],
        '2025-09-19': [
            {
                title: 'Importer og eksporter medarbejdere via CSV-skabelonfil',
                description: [
                    'Medarbejdere kan nu importeres og eksporteres ved hjælp af en CSV-skabelonfil.',
                    'Dette forenkler håndteringen af medarbejderdata og sikrer ensartethed på tværs af registrene.',
                ],
            },
            {
                title: 'Eksporter borgere',
                description: [
                    'Borgerregistre kan nu eksporteres.',
                    'Dette muliggør nemmere rapportering, deling og sikkerhedskopiering af data.',
                ],
            },
            {
                title: 'Visning af helligdage i vagtplanen',
                description: [
                    'Helligdage vises nu i vagtplanen.',
                    'Dette hjælper med bedre planlægning og sikrer korrekt skemalægning omkring helligdage.',
                ],
            },
        ],
        '2025-09-12': [
            {
                title: 'Importer borgere via CSV-skabelonfil',
                description: [
                    'Borgere kan nu importeres ved hjælp af en CSV-skabelonfil.',
                    'Dette strømline dataindtastningsprocessen og sikrer konsistens i borgeroptegnelser.',
                ],
            },
            {
                title: 'Brugerens 2FA',
                description: [
                    'To-faktor-godkendelse (2FA) er nu tilgængelig for brugere.',
                    'Dette tilføjer et ekstra lag af sikkerhed til brugerens konti og beskytter følsomme oplysninger.',
                ],
            },
            {
                title: 'Nye felter i borgerens formular: Trafiklys (Grøn, Gul og Rød)',
                description: [
                    'Der er tilføjet nye felter for trafiklysstatus (Grøn, Gul og Rød) i borgerens formular.',
                    'Angiv en beskrivelse af borgerens tilstand, når de er i Grøn, Gul eller Rød status, når der oprettes en journalnotat.',
                ],
            },
        ],
        '2025-08-29': [
            {
                title: 'Standard arbejdstider i vagtplan',
                description: [
                    'Du kan nu sætte standard ind- og udtjekningstider for hver vagt i vagtplanen.',
                    'Dette hjælper med at standardisere arbejdstimer og reducerer manuelle fejlindtastninger.',
                ],
            },
            {
                title: 'Registrering af medicinallergi',
                description: [
                    'Borgernes medicinallergier kan nu registreres og spores.',
                    'Dette sikrer bedre sikkerhed og mere informerede beslutninger for sundhedspersonale.',
                ],
            },
            {
                title: 'Sygefravær tæller som arbejdstimer',
                description: [
                    'Sygefravær kan nu tælles som arbejdstimer i vagtplanen.',
                    'Dette giver mere præcis rapportering og en mere retfærdig planlægning.',
                ],
            },
        ],
        '2025-08-15': [
            {
                title: 'Microsoft e-mailhåndtering i Mail Appen',
                description: [
                    'Du kan nu tilknytte og administrere dine Microsoft e-mailkonti direkte i Mail Appen.',
                    'Det gør det nemmere at sende, modtage og organisere e-mails uden at skifte mellem platforme.',
                ],
            },
        ],
        '2025-08-01': [
            {
                title: 'Indsatstider på borger-siden',
                description: [
                    'Borgere kan nu se tilgængelige indsatstider direkte i borgersiden.',
                    'Dette forbedrer gennemsigtighed og adgang til støttetjenester.',
                ],
            },
            {
                title: 'Ny app: CitizenOne AI',
                description: [
                    'Vi har nu lanceret CitizenOne AI - din intelligente assistent, som for eksempel kan give dig et hurtigt overblik over, hvordan en borger har haft det den seneste måned, dele nyttig information om din organisation eller dine kollegaer, og meget mere. Alt sammen direkte i CitizenOne, så du kan arbejde smartere og hurtigere.'
                ],
            },
            {
                title: 'Ændringslog i vagtplan',
                description: [
                    'Vagtplanen inkluderer nu en detaljeret ændringslog.',
                    'Spor alle opdateringer og ændringer i vagtplaner nemt.',
                ],
            },
        ],
        '2025-07-25': [
            {
                title: 'Online kalenderbooking',
                description: [
                    'Nu tilgængelig for køb i Apps-sektionen.',
                    'Efter køb, gå til Kalendere for at opsætte og administrere online bookinger.',
                ],
            },
            {
                title: 'Afdelinger i vagtplanen',
                description: ['Du kan nu tildele vagter til specifikke afdelinger.'],
            },
            {
                title: 'Vagtnoter for administratorer',
                description: ['Administratorer kan nu tilføje noter til enkelte vagter.'],
            },
            {
                title: 'Behandlingsnotifikationer - til/fra',
                description: ['Mulighed for at aktivere eller deaktivere notifikationer for behandlinger.'],
            },
            {
                title: 'Rediger og slet beskeder i chats',
                description: ['Du kan nu redigere eller slette beskeder direkte i chats for bedre kontrol og kommunikation.'],
            },
            {
                title: 'Mere enkel navigationsbjælke',
                description: [
                    'Notifikations- og beskedikoner vises ikke, når antallet er nul.',
                    'Nye funktionsopdateringer vil også blive vist her fremover.',
                ],
            },
        ],
    }
}

function loadUpdates(version: string) {
    const lang = language.locale.value as 'en' | 'dk'
    state.updates = allUpdates[lang][version] || []
}

watch(() => props.isModalOpen, (isOpen) => {
    if (isOpen) {
        loadUpdates(state.currentVersion)
    }
})
</script>
