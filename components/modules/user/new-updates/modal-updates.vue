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
    currentVersion: '2025-12-12',
    availableVersions: [
        '2025-12-12',
        '2025-11-28',
        '2025-11-14',
        '2025-11-07',
        '2025-10-31',
        '2025-10-24',
        '2025-10-17',
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
        '2025-12-12': [
            {
                title: 'Advanced search and filtering in shift schedule and calendar',
                description: [
                    'Users can now search directly for a specific day in the shift schedule and calendar instead of navigating week by week.',
                    'Navigation has been expanded to allow moving by month as well as by week.',
                    'The overview can be filtered to display one or more selected employees.',
                    'Additional filters have been added for employment status and department to improve clarity and planning.'
                ],
            },
            {
                title: 'Duty shift schedule optimizations',
                description: [
                    'Multiple performance and usability optimizations have been applied to the duty shift schedule.',
                    'These improvements result in faster interactions and a smoother scheduling experience for both admins and employees.'
                ],
            },
            {
                title: 'Multi-day shift handling',
                description: [
                    'When creating a shift that spans multiple days, the system now automatically splits it into separate daily shifts.',
                    'This ensures more accurate scheduling, reporting, and easier adjustments on a per-day basis.'
                ],
            },
            {
                title: 'Custom recurring options across scheduling and notifications',
                description: [
                    'Custom recurring patterns can now be configured for the duty schedule, calendar events, and plans and goals notifications.',
                    'This provides greater flexibility for defining complex or non-standard recurrence rules across the platform.'
                ],
            }
        ],
        '2025-11-28': [
            {
                title: 'Transfer Zoho chat to support slide-over',
                description: [
                    'The Zoho chat feature is now integrated into a slide-over panel.',
                    'This improves accessibility and maintains focus on the main content while allowing quick interactions.'
                ],
            },
            {
                title: 'Add page access in the new employees form',
                description: [
                    'The new employee form has been updated to include page access options.',
                    'This streamlines the setup process for new hires and enhances their onboarding experience.'
                ],
            },
            {
                title: 'Recurring events in the calendar',
                description: [
                    'When editing a single event, the system now prompts whether the changes should apply to only this event or all future recurring events.',
                    'This feature enhances flexibility and precision when managing recurring events.'
                ],
            },
            {
                title: 'Recurring automatic week rotation in the duty schedule',
                description: [
                    'Admins can now create a recurring automatic week rotation in the duty schedule.',
                    'Admins can set an end date for the recurring pattern.'
                ],
            },
            {
                title: 'Notification settings customization',
                description: [
                    'A new setting allows users to enable/disable notifications based on whether the employee is on shift.',
                    'Additionally, a general option has been added to disable all email notifications, giving users more control over their notification preferences.'
                ],
            },
            {
                title: 'Adding/deducting extra hours in the duty schedule',
                description: [
                    'Admins and employees can now add or deduct extra hours from the weekly schedule without creating a specific shift.',
                    'A mandatory note field is required for each adjustment, and there are two workflows available for managing these changes.'
                ],
            },
            {
                title: 'Centralized password management for admins',
                description: [
                    'Admins can now manage password control centrally from the company settings.',
                    'This eliminates the "Change password" option for users and enables admins to generate new passwords for them.'
                ],
            },
            {
                title: 'Citizen overview visual enhancements',
                description: [
                    'Two visual icons have been added to the citizen’s action icons for better status tracking.',
                    'The plus icon reflects the status of the citizen’s plans/goals, while the pill icon provides direct access to the medication overview.'
                ],
            },
            {
                title: 'Recurring notifications in plans and goals',
                description: [
                    'In the plans and goals section, recurring notifications can now be created.',
                    'These notifications can be assigned only to the citizen’s assigned contact persons, ensuring targeted and relevant alerts.'
                ],
            }
        ],
        '2025-11-14': [
            {
                title: 'Department dropdown color customization',
                description: [
                    'It is now possible to change the department dropdown color based on the department being displayed.',
                    'This provides a visual color indicator in addition to the department name, improving clarity and quick recognition.'
                ],
            },
            {
                title: 'Updates to the registration form',
                description: [
                    'Various improvements have been made to the registration form.',
                    'These changes enhance usability, streamline the registration process, and improve data accuracy.'
                ],
            },
            {
                title: 'Citizens’ inquiries and conversion process',
                description: [
                    'Enhancements have been made to the handling of citizens’ inquiries.',
                    'It is now easier to manage inquiries and convert an inquiry into a registered citizen.'
                ],
            },
            {
                title: 'Secured mail UI update',
                description: [
                    'The user interface for secured mail has been updated.',
                    'These improvements provide a clearer layout and improve the overall messaging experience.'
                ],
            },
            {
                title: 'Dashboard client login for events',
                description: [
                    'A new feature has been added allowing clients to log in to view events via the dashboard.',
                    'This improves accessibility and provides a more streamlined experience for event-related information.'
                ],
            }
        ],
        '2025-11-07': [
            {
                title: 'Additional field (strength) in medicine journal',
                description: [
                    'When creating or editing a medicine journal, a new field called "strength" has been added.',
                    'This allows for more precise recording of medication details and improves clarity in dosage documentation.'
                ],
            },
            {
                title: 'Daily overview renamed to Overview',
                description: [
                    'The section previously titled "Daily overview" has been renamed to "Overview".',
                    'This change provides a clearer and more general overview section for users.'
                ],
            },
            {
                title: '“Citizens’ daily events” renamed to “Citizens’ events” in the overview',
                description: [
                    'In the overview, the title "Citizens’ daily events" has been updated to "Citizens’ events".',
                    'This reflects that events are not limited to daily occurrences and enhances consistency in naming.'
                ],
            },
            {
                title: '“Daily medication overview” renamed to “Medication overview” in the overview',
                description: [
                    'The section name "Daily medication overview" has been changed to "Medication overview".',
                    'This better represents the broader functionality and coverage of the overview.'
                ],
            },
            {
                title: 'Additional options in “Copy multiple weeks’ schedules”',
                description: [
                    'More options have been added for selecting the weeks’ source and destination when copying multiple weeks’ schedules.',
                    'This provides greater flexibility and control when managing schedules.'
                ],
            }
        ],
        '2025-10-31': [
            {
                title: 'Check-in and check-out on the citizen (with automatic notification after 24 hours)',
                description: [
                    'The system now supports check-in and check-out on the citizen with enhanced functionality that sends an automatic notification 24 hours after check-out.',
                    'The notification informs that the check-out has been logged and can be found in the log, ensuring better traceability and follow-up.'
                ],
            },
            {
                title: 'Inquiry data and stay data for organizations within social welfare',
                description: [
                    'Organizations and companies within the social welfare industry with a facility type of crisis center or homeless shelter can now access inquiry and stay data.',
                    'This enables more precise reporting and analysis of citizen cases and stays in social institutions.'
                ],
            },
            {
                title: 'Room management for citizens',
                description: [
                    'New functionality has been added for room management, allowing administrators to manage room allocation and status for citizens.',
                    'This provides better visibility into available rooms, occupancy, and resource utilization at facilities such as crisis centers and homeless shelters.'
                ],
            },
            {
                title: 'Conversation summary for citizens linked to inquiry data',
                description: [
                    'It is now possible to add conversation summaries for citizens as part of their inquiry data.',
                    'This allows for more complete documentation of citizen cases and ensures that relevant notes and conversations are recorded alongside other data.'
                ],
            },
            {
                title: 'Simplified signup form',
                description: [
                    'Other fields in the signup form have been removed to improve and streamline the signup process.',
                    'This change reduces complexity and makes it faster and more intuitive for users to create an account.'
                ],
            }
        ],
        '2025-10-24': [
            {
                title: 'Ability to create multiple duty schedule drafts for a single department or for the entire organization',
                description: [
                    'Clients can now create multiple duty schedule drafts for either a single department or the entire organization during the planning phase of shift scheduling.',
                    'This feature allows for greater flexibility in planning and scheduling, with a clear indication of which department the draft is being published for when it is finalized.'
                ],
            },
            {
                title: 'Ability to switch between organizations using a single user account',
                description: [
                    'Users can now seamlessly switch between organizations using a single user account, making it easier for individuals who work across multiple organizations to manage their responsibilities.',
                    'This improves user experience and reduces the need for multiple logins or account management.'
                ],
            },
            {
                title: 'Calculation of contribution margin on the citizen (viewable for admins or authorized users)',
                description: [
                    'A feature has been introduced to calculate the contribution margin per citizen, which is only viewable by admins or users with the necessary permissions.',
                    'This allows for better financial tracking and analysis, providing key insights into the contribution margin of individual citizens.'
                ],
            },
            {
                title: 'Check-in and check-out on the citizen',
                description: [
                    'A new check-in and check-out functionality has been added for citizens, allowing users to record attendance or activity times.',
                    'This feature is useful for tracking citizen engagement and ensuring accurate records of their involvement.'
                ],
            },
            {
                title: 'Time schedule: allocation and summary of time usage',
                description: [
                    'Users can now enter the allocated hours/minutes per day, week, or month for a citizen, and view a summary (time account) showing how much time has been used during the selected period.',
                    'This ensures that it is clear whether the allocated time is being used efficiently and whether one is over or under the allocated time.'
                ],
            }
        ],
        '2025-10-17': [
            {
                title: 'Attachment of file in SMTP and Entra emails (both inbox and sent mails)',
                description: [
                    'A feature has been introduced to allow file attachments in both SMTP and Entra emails, covering inbox and sent mails.',
                    'This enhancement enables users to attach and access files more efficiently in both incoming and outgoing email communications.'
                ],
            },
            {
                title: 'App and web notification to employees upon publishing a duty schedule from draft',
                description: [
                    'Employees will now receive app and web notifications when a duty schedule, which includes them, is published from draft.',
                    'This improves communication and ensures employees are promptly notified about changes to their duty schedules.'
                ],
            },
            {
                title: 'View a log of deleted notes in Journal notes area',
                description: [
                    'A log feature has been added to allow users to view deleted notes in the journal notes area.',
                    'This provides an audit trail for note deletions, improving transparency and tracking within the system.'
                ],
            },
            {
                title: 'Move a note from one citizen to another (Admin functionality)',
                description: [
                    'Admins can now move notes from one citizen’s record to another.',
                    'This ensures that notes are accurately associated with the correct citizen, improving data management and organization.'
                ],
            },
            {
                title: 'Copy a note to another citizen (Admin functionality)',
                description: [
                    'Admins can now copy notes from one citizen’s record to another.',
                    'This enables easy sharing of relevant information between citizens, ensuring efficient note management.'
                ],
            }
        ],
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
        '2025-12-12': [
            {
                title: 'Avanceret søgning og filtrering i vagtplan og kalender',
                description: [
                    'Brugere kan nu søge direkte efter en bestemt dag i vagtplanen og kalenderen i stedet for at navigere uge for uge.',
                    'Navigationen er blevet udvidet, så det nu er muligt at bevæge sig både måned for måned og uge for uge.',
                    'Oversigten kan filtreres til at vise én eller flere valgte medarbejdere.',
                    'Der er tilføjet yderligere filtre for ansættelsesstatus og afdeling for at forbedre overblik og planlægning.'
                ],
            },
            {
                title: 'Optimeringer af vagtplan for rådighedsvagter',
                description: [
                    'Der er gennemført flere optimeringer af ydeevne og brugervenlighed i vagtplanen for rådighedsvagter.',
                    'Disse forbedringer giver hurtigere interaktioner og en mere smidig planlægningsoplevelse for både administratorer og medarbejdere.'
                ],
            },
            {
                title: 'Håndtering af vagter over flere dage',
                description: [
                    'Når der oprettes en vagt, der strækker sig over flere dage, opdeler systemet den nu automatisk i separate daglige vagter.',
                    'Dette sikrer mere præcis planlægning, rapportering og lettere justeringer på dagsniveau.'
                ],
            },
            {
                title: 'Brugerdefinerede gentagelser på tværs af planlægning og notifikationer',
                description: [
                    'Brugerdefinerede gentagelsesmønstre kan nu konfigureres for vagtplanen, kalenderbegivenheder samt notifikationer for planer og mål.',
                    'Dette giver større fleksibilitet til at definere komplekse eller ikke-standard gentagelsesregler på tværs af platformen.'
                ],
            }
        ],
        '2025-11-28': [
            {
                title: 'Overfør Zoho chat til understøttelse af slide-over',
                description: [
                    'Zoho chatfunktionen er nu integreret i et slide-over panel.',
                    'Dette forbedrer tilgængeligheden og bevarer fokus på hovedindholdet, samtidig med at det giver hurtig interaktion.'
                ],
            },
            {
                title: 'Tilføj sideadgang i formularen for nye medarbejdere',
                description: [
                    'Formularen for nye medarbejdere er blevet opdateret med sideadgangsmuligheder.',
                    'Dette strømline opsætningsprocessen for nye medarbejdere og forbedrer deres onboarding-oplevelse.'
                ],
            },
            {
                title: 'Tilbagevendende begivenheder i kalenderen',
                description: [
                    'Når du redigerer en enkelt begivenhed, spørger systemet, om ændringerne kun skal gælde denne begivenhed eller alle fremtidige tilbagevendende begivenheder.',
                    'Denne funktion forbedrer fleksibilitet og præcision, når du administrerer tilbagevendende begivenheder.'
                ],
            },
            {
                title: 'Tilbagevendende automatisk uge rotation i vagtplanen',
                description: [
                    'Administratorer kan nu oprette en tilbagevendende automatisk uge rotation i vagtplanen.',
                    'Administratorer kan sætte en slutdato for den tilbagevendende rotation.'
                ],
            },
            {
                title: 'Tilpasning af notifikationsindstillinger',
                description: [
                    'En ny indstilling giver brugerne mulighed for at aktivere/deaktivere notifikationer baseret på, om medarbejderen er på vagt.',
                    'Derudover er der tilføjet en generel mulighed for at deaktivere alle e-mailnotifikationer, hvilket giver brugerne mere kontrol over deres notifikationspræferencer.'
                ],
            },
            {
                title: 'Tilføjelse/fradrag af ekstra timer i vagtplanen',
                description: [
                    'Administratorer og medarbejdere kan nu tilføje eller trække ekstra timer fra den ugentlige vagtplan uden at oprette en specifik vagt.',
                    'Der kræves et obligatorisk notefelt for hver justering, og der er to workflows tilgængelige til at administrere disse ændringer.'
                ],
            },
            {
                title: 'Centraliseret password management for administratorer',
                description: [
                    'Administratorer kan nu administrere passwordkontrol centralt fra virksomhedens indstillinger.',
                    'Dette fjerner muligheden "Skift password" for brugerne og giver administratorer mulighed for at generere nye passwords til dem.'
                ],
            },
            {
                title: 'Visuelle forbedringer i borgeroversigten',
                description: [
                    'To visuelle ikoner er blevet tilføjet til borgerens handlingsikoner for bedre statussporing.',
                    'Plus-ikonet afspejler status for borgerens planer/mål, mens pille-ikonet giver direkte adgang til medicinoversigten.'
                ],
            },
            {
                title: 'Tilbagevendende notifikationer i planer og mål',
                description: [
                    'I sektionen for planer og mål kan der nu oprettes tilbagevendende notifikationer.',
                    'Disse notifikationer kan kun tildeles de borgerens tildelte kontaktpersoner, hvilket sikrer målrettede og relevante advarsler.'
                ],
            }
        ],
        '2025-11-14': [
            {
                title: 'Farvetilpasning af afdelings-dropdown',
                description: [
                    'Det er nu muligt at ændre farven på afdelings-dropdownen baseret på den afdeling, der vises.',
                    'Dette giver en visuel farveindikator ud over afdelingens navn og gør det lettere hurtigt at genkende afdelingen.'
                ],
            },
            {
                title: 'Ændringer i registreringsformularen',
                description: [
                    'Der er foretaget forskellige forbedringer af registreringsformularen.',
                    'Disse ændringer forbedrer brugervenligheden, effektiviserer registreringsprocessen og øger datakvaliteten.'
                ],
            },
            {
                title: 'Borgerhenvendelser og konvertering til borger',
                description: [
                    'Håndteringen af borgerhenvendelser er blevet forbedret.',
                    'Det er nu lettere at administrere henvendelser og konvertere en henvendelse til en registreret borger.'
                ],
            },
            {
                title: 'Opdatering af UI for sikker mail',
                description: [
                    'Brugergrænsefladen for sikker mail er blevet opdateret.',
                    'Opdateringen giver et tydeligere layout og forbedrer den samlede beskedoplevelse.'
                ],
            },
            {
                title: 'Dashboard-klientlogin til begivenheder',
                description: [
                    'Der er tilføjet en ny funktion, der gør det muligt for klienter at logge ind på dashboardet for at se begivenheder.',
                    'Dette forbedrer tilgængeligheden og giver en mere strømlinet oplevelse i forbindelse med begivenhedsoplysninger.'
                ],
            }
        ],
        '2025-11-07': [
            {
                title: 'Ekstra felt (styrke) i medicinjournalen',
                description: [
                    'Ved oprettelse eller redigering af en medicinjournal er der tilføjet et nyt felt kaldet "styrke".',
                    'Dette gør det muligt at registrere medicinoplysninger mere præcist og giver bedre klarhed i doseringsdokumentationen.'
                ],
            },
            {
                title: 'Dagligt oversigt omdøbt til Oversigt',
                description: [
                    'Sektionen, der tidligere hed "Dagligt oversigt", er blevet omdøbt til "Oversigt".',
                    'Ændringen giver en tydeligere og mere generel oversigtssektion for brugerne.'
                ],
            },
            {
                title: '“Borgernes daglige begivenheder” omdøbt til “Borgernes begivenheder” i oversigten',
                description: [
                    'I oversigten er titlen "Borgernes daglige begivenheder" ændret til "Borgernes begivenheder".',
                    'Dette afspejler, at begivenheder ikke kun er begrænset til daglige begivenheder, og sikrer større ensartethed i navngivningen.'
                ],
            },
            {
                title: '“Dagligt medicinoversigt” omdøbt til “Medicinoversigt” i oversigten',
                description: [
                    'Sektionen "Dagligt medicinoversigt”" er blevet ændret til "Medicinoversigt".',
                    'Dette repræsenterer bedre den bredere funktionalitet og dækning af oversigten.'
                ],
            },
            {
                title: 'Flere valgmuligheder i “Kopiér flere ugers skemaer”',
                description: [
                    'Der er tilføjet flere valgmuligheder for valg af kilde- og destinationsuger, når der kopieres flere ugers skemaer.',
                    'Dette giver større fleksibilitet og kontrol ved håndtering af skemaer.'
                ],
            }
        ],
        '2025-10-31': [
            {
                title: 'Tjek-ind og tjek-ud på borgeren (med automatisk notifikation efter 24 timer)',
                description: [
                    'Systemet understøtter nu tjek-ind og tjek-ud på borgeren med en forbedret funktion, der automatisk sender en notifikation 24 timer efter tjek-ud.',
                    'Notifikationen informerer om, at tjek-ud er registreret og kan findes i loggen, hvilket sikrer bedre sporbarhed og opfølgning.'
                ],
            },
            {
                title: 'Forespørgselsdata og opholdsdata for organisationer inden for social velfærd',
                description: [
                    'Organisationer og virksomheder inden for social velfærd med facilitetstype krisecenter eller herberg kan nu få adgang til forespørgselsdata og opholdsdata.',
                    'Dette giver mulighed for mere præcis rapportering og analyse af borgerforløb i sociale institutioner.'
                ],
            },
            {
                title: 'Værelsesstyring for borgere',
                description: [
                    'Der er nu tilføjet funktionalitet til værelsesstyring, som gør det muligt at administrere tildeling og status for værelser til borgere.',
                    'Dette giver et bedre overblik over ledige værelser, beboelsesstatus og ressourceudnyttelse på faciliteter som krisecentre og herberger.'
                ],
            },
            {
                title: 'Samtalereferat for borgere i forbindelse med forespørgselsdata',
                description: [
                    'Det er nu muligt at tilføje samtalereferater for borgere som en del af deres forespørgselsdata.',
                    'Dette giver en mere komplet registrering af borgerforløb og sikrer, at relevante noter og samtaler dokumenteres sammen med øvrige data.'
                ],
            },
            {
                title: 'Forenklet tilmeldingsformular',
                description: [
                    'Andre felter i tilmeldingsformularen er blevet fjernet for at forbedre og forenkle tilmeldingsprocessen.',
                    'Denne ændring reducerer kompleksiteten og gør det hurtigere og mere intuitivt for brugere at oprette en konto.'
                ],
            }
        ],
        '2025-10-24': [
            {
                title: 'Mulighed for at oprette flere udkast af vagtplaner for en enkelt afdeling eller for hele organisationen',
                description: [
                    'Kunder kan nu oprette flere udkast af vagtplaner for enten en enkelt afdeling eller hele organisationen under planlægningsfasen af skiftplanlægning.',
                    'Denne funktion giver større fleksibilitet i planlægning og tidsplanlægning, med en tydelig angivelse af, hvilken afdeling udkastet publiceres for, når det bliver afsluttet.'
                ],
            },
            {
                title: 'Mulighed for at skifte mellem organisationer med én brugerprofil',
                description: [
                    'Brugere kan nu nemt skifte mellem organisationer med én brugerprofil, hvilket gør det lettere for personer, der arbejder på tværs af flere organisationer, at håndtere deres ansvar.',
                    'Denne funktion forbedrer brugeroplevelsen og reducerer behovet for flere login eller konto-håndtering.'
                ],
            },
            {
                title: 'Beregnings af bidragsmargen på borgeren (kun synlig for administratorer eller autoriserede brugere)',
                description: [
                    'En funktion er blevet introduceret til at beregne bidragsmargen per borger, som kun er synlig for administratorer eller brugere med de nødvendige rettigheder.',
                    'Denne funktion giver bedre økonomisk sporing og analyse, og giver vigtig indsigt i bidragsmargenen for den enkelte borger.'
                ],
            },
            {
                title: 'Tjek-ind og tjek-ud på borgeren',
                description: [
                    'En ny funktion til tjek-ind og tjek-ud er blevet tilføjet for borgere, som giver brugerne mulighed for at registrere tidspunkter for deltagelse eller aktivitet.',
                    'Denne funktion er nyttig til at spore borgernes engagement og sikre præcise optegnelser af deres deltagelse.'
                ],
            },
            {
                title: 'Tidsplan: allokering og opsummering af tidsforbrug',
                description: [
                    'Brugere kan nu indtaste de tildelte timer/minutter pr. dag, uge eller måned for en borger, og se en opsummering (tidskonto), der viser, hvor meget tid der er brugt i den valgte periode.',
                    'Dette sikrer, at det er klart, om den tildelte tid bruges effektivt, og om man er over eller under den tildelte tid.'
                ],
            }
        ],
        '2025-10-17': [
            {
                title: 'Vedhæftning af fil i SMTP og Entra e-mails (både indbakke og sendt mails)',
                description: [
                    'En funktion er blevet introduceret for at tillade vedhæftning af filer i både SMTP- og Entra-e-mails, der dækker både indbakke og sendte mails.',
                    'Denne forbedring gør det muligt for brugere at vedhæfte og få adgang til filer mere effektivt i både indgående og udgående e-mailkommunikation.'
                ],
            },
            {
                title: 'App- og webnotifikation til medarbejdere ved offentliggørelse af arbejdsplan fra udkast',
                description: [
                    'Medarbejdere vil nu modtage app- og webnotifikationer, når en arbejdsplan, som de er inkluderet i, bliver offentliggjort fra udkast.',
                    'Dette forbedrer kommunikationen og sikrer, at medarbejdere hurtigt bliver underrettet om ændringer i deres arbejdsplan.'
                ],
            },
            {
                title: 'Vis en log over slettede noter i journalnotearia',
                description: [
                    'En logfunktion er blevet tilføjet, så brugere kan se slettede noter i journalnotearia.',
                    'Dette giver en revisionsspor for sletning af noter, hvilket forbedrer gennemsigtighed og sporbarhed i systemet.'
                ],
            },
            {
                title: 'Flyt en note fra én borger til en anden (Admin-funktionalitet)',
                description: [
                    'Administratorer kan nu flytte noter fra én borgers optegnelse til en anden.',
                    'Dette sikrer, at noter er korrekt tilknyttet den rette borger, hvilket forbedrer datastyring og organisation.'
                ],
            },
            {
                title: 'Kopier en note til en anden borger (Admin-funktionalitet)',
                description: [
                    'Administratorer kan nu kopiere noter fra én borgers optegnelse til en anden.',
                    'Dette gør det muligt nemt at dele relevant information mellem borgere, hvilket sikrer effektiv håndtering af noter.'
                ],
            }
        ],
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
