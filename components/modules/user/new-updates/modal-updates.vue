<template>
    <div>
        <Modal size="lg" :title="`${$t('updates.newUpdatesFrom')} ${formatDateToReadable(state.currentVersion)}`"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="space-y-5 text-sm text-gray-700">
                    <div class="flex items-center gap-2">
                        <Icon name="ph:calendar-blank" size="15" class="text-tertiary shrink-0" />
                        <div class="relative">
                            <select v-model="state.currentVersion" @change="loadUpdates(state.currentVersion)"
                                class="appearance-none bg-transparent text-sm text-tertiary pr-5 focus:outline-none cursor-pointer">
                                <option v-for="(version, i) in state.availableVersions" :key="i" :value="version">
                                    {{ formatDateToReadable(version) }}
                                </option>
                            </select>
                            <Icon name="ph:caret-down" size="12"
                                class="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-tertiary" />
                        </div>
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
                        <FormButton buttonStyle="cancel" @click="closeModal">
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
    currentVersion: '2026-05-15',
    availableVersions: [
        '2026-05-15',
        '2026-05-08',
        '2026-05-01',
        '2026-04-24',
        '2026-04-10',
        '2026-02-20',
        '2026-01-30',
        '2026-01-23',
        '2026-01-16',
        '2026-01-09',
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
        '2026-05-15': [
            {
                title: '🔁 Template & Copying Improvements',
                description: [
                    'It is now possible to copy shorter source weeks into multiple consecutive future weeks when creating a duty schedule template.',
                    'Example: Copy 1 week into 2, 3, 4 (or more) consecutive weeks.',
                ],
            },
            {
                title: '📝 Dynamic Journal Note Fields Based on Title',
                description: [
                    'Journal notes now support dynamic, predefined fields based on the selected journal note title.',
                    'When a user selects a journal note title, the system automatically displays relevant fields/questions associated with that title.',
                    'Each field allows input (e.g., notes, answers, observations).',
                    'These fields are configurable in advance via a catalog or settings.',
                ],
            },
            {
                title: '📅 Calendar Event – Journal Note & Completion Status',
                description: [
                    'It is now possible to create a journal note directly from a calendar event by clicking on the event and selecting "Create journal note".',
                    'The event title is automatically copied into the journal note.',
                    'After writing the note, the calendar event links to the journal note, and the journal note links back to the calendar event.',
                    'It is now possible to mark an event as "Completed" or "Not completed".',
                    'When selecting either option, a popup asks: "Do you want to write a journal note about this?" with "Yes" and "No" options.',
                    'If proceeding with a journal note, there is an option to copy the note to a related plan, goal, or sub-goal.',
                    'Statistics showing the number of times items are marked as "Completed" versus "Not completed" are now available for any given period.',
                ],
            },
            {
                title: '🧩 Roles & Permissions',
                description: [
                    'The Coordinator role and roles in general have been reviewed and improved so administrators no longer need to assign full Administrator rights unnecessarily.',
                    'A clear overview and explanation of how specific permissions work is now available.',
                    'It is now possible to define a role hierarchy (e.g., Administrator has higher privileges than Manager).',
                    'Specialized domain-specific roles can now be created (e.g., "Medication Responsible") to control access to specific modules or functionalities.',
                    'Multiple roles can now be assigned to a single employee (multi-select), and the system combines permissions from all assigned roles.',
                ],
            },
            {
                title: '📋 Journal Notes Overview Page',
                description: [
                    'The "See latest / all journal notes" function now opens a dedicated page where all journal notes can be viewed in one place.',
                    'Access to journal notes respects the existing permission structure: users only see notes from citizens within their departments.',
                    'Administrator roles can see all journal notes across the entire organisation.',
                    'It is now possible to filter journal notes globally by citizen, department, tags, and other relevant filters.',
                ],
            },
            {
                title: '📆 iCal / CalDav – Subscribe to Calendar',
                description: [
                    'It is now possible to subscribe to the CitizenOne calendar via iCal / CalDav.',
                    'This allows users to view their CitizenOne calendar events in external calendar applications.',
                ],
            },
            {
                title: '📋 Residence Data – Consent Declarations',
                description: [
                    'In the Residence Data form, it is now possible to select consent declarations with Yes / No options for: Photo, Parent collaboration, Student collaboration, and General consent.',
                    'Custom consent declaration types can be created in the catalog.',
                    'It is now possible to indicate Personal guardianship (Yes / No) and Financial guardianship (Yes / No).',
                ],
            },
            {
                title: '🏥 The 12 Nursing Care Areas – Status & Templates',
                description: [
                    'When updating the status of a nursing care area, it is now possible to select: Not an active problem, Potential problem, or Active problem.',
                    'Templates can now be used for nursing care areas, defining which fields users must fill out (required or optional).',
                    'When creating or updating a nursing care area, related areas can be viewed in a side panel – similar to how plans and goals are shown when creating a journal note.',
                ],
            },
            {
                title: '💊 Treatments – Improvements & UX Enhancements',
                description: [
                    'Templates can now be used for treatments, defining which fields users must complete (required or optional).',
                    'The field "Completed" ("Afsluttet") has been renamed to "Mark as completed" ("Markér som afsluttet").',
                    'It is now more visually clear which treatments are active (ongoing) versus completed, through clear UI indicators (e.g., labels, colors, or status badges).',
                    'The main overview/dashboard now includes summary widgets such as "10 active treatments", which users can click to view the list.',
                    'If treatments are created within a specific nursing care area, there is now a direct link from the nursing care area to those treatments.',
                ],
            },
            {
                title: '🌍 Norwegian & Swedish Language Support',
                description: [
                    'Norwegian and Swedish language options are now available in CitizenOne.',
                    'Users can switch to Norwegian (Norsk) or Swedish (Svenska) from their language settings.',
                ],
            },
        ],
        '2026-05-08': [
            {
                title: '📇 Company Contacts & Address Book',
                description: [
                    'Company contacts can now be created in the same way as citizen contacts.',
                    'All contacts (e.g., doctors, case workers, etc. – not relatives) are now stored centrally in the system so they can be reused and assigned to multiple citizens.',
                    'A company-wide address book has been introduced where contacts are centrally stored and can be selected when needed.',
                ],
            },
            {
                title: '⚙️ Shift Type Configuration',
                description: [
                    'Under Shift Types, it is now possible to define that 1 working hour equals 0.75 hours (optionally), and this rule can also be applied within a specific time interval.',
                    'For "Sleeping Night Shift", it is now possible to define a default end time that is 1, 2, or more days later.',
                ],
            },
            {
                title: '📅 Duty Schedule – Yearly & Half-Year Calendar View',
                description: [
                    'A yearly and half-year calendar view has been added to the duty schedule.',
                    'The view can be shown per individual employee, displaying their assigned shifts and an overview across time.',
                ],
            },
            {
                title: '💊 Medication Notes – Information Icon',
                description: [
                    'An information icon ("i") has been added for medication notes.',
                    'Hovering over the icon shows the associated remark for that medication.',
                    'Example: "Do not administer if the patient is under the influence of cocaine."',
                ],
            },
            {
                title: '🤖 AI Usage Badge on Journal Notes',
                description: [
                    'The system now registers when the AI assistant has been used to create or assist with a journal note.',
                    'A badge is displayed on the journal note indicating that the AI assistant was used.',
                    'The badge reads: "CitizenOne AI was used".',
                ],
            },
            {
                title: '🔐 Login Restriction by IP / Device',
                description: [
                    'Administrators can now restrict login access based on IP address and/or device.',
                    'Specific IP addresses (e.g., the office network) can be whitelisted.',
                    'Optionally, access can be restricted to approved devices.',
                    'Users outside allowed IPs/devices will be blocked or required to complete additional verification.',
                    'This feature increases security and ensures access only from trusted environments.',
                ],
            },
            {
                title: '🎄 Holiday & Sunday Pay Rules',
                description: [
                    'On holidays, a standard example applies: 08:00 – 15:24 = 7.4 hours.',
                    'On Sundays, employees must receive 1.5× their hours.',
                    'If an employee works on a Sunday or holiday, they receive shift hours × 1.5.',
                ],
            },
        ],
        '2026-05-01': [
            {
                title: 'Additions to Extra Hours (X-timer)',
                description: [
                    'A new column has been added showing the name of the person who created the extra hours entry.',
                    'A new column and corresponding field for departments has been added to extra hours.',
                    'Extra hours are now also visible within duty schedule drafts.',
                ],
            },
            {
                title: '⏱ Time Registration Improvements',
                description: [
                    'Employees can now request registration of a missed check-in.',
                    'These requests must be approved by an administrator before they are registered.',
                    'Administrators can now edit existing time log entries.',
                ],
            },
            {
                title: '💊 Medication Overview Improvements',
                description: [
                    'The number of pills / dosage is now displayed clearly and prominently for each medication.',
                    'The medication overview now clearly distinguishes between PN (as-needed) medication and regular (scheduled) medication.',
                    'Filtering options have been added: view all medications, only PN medication, or only regular medication.',
                    'It is now possible to sort columns in the medication overview alphabetically (e.g., by medication name) and numerically (e.g., by dosage).',
                    'It is now possible to view all medications at once, instead of being limited to 10 entries per page.',
                ],
            },
            {
                title: '👥 Employee Groups Assignment to Citizens',
                description: [
                    'It is now possible to assign an employee group to a citizen, and vice versa – from the employee group, assign one or more citizens; from the citizen profile, assign one or more employee groups.',
                    'When an employee group is assigned to a citizen, all employees within that group are automatically assigned to the citizen.',
                    'This assignment behaves the same way as assigning an employee directly via "Assigned Citizens" or assigning a contact via "Contacts" on the citizen.',
                    'The relationship stays synchronized: if an employee is added to or removed from the group, the citizen assignment updates automatically.',
                    'If an employee group is removed from a citizen, all associated employees are also unassigned (unless assigned manually elsewhere).',
                ],
            },
            {
                title: '📥 Treatment Export Functionality',
                description: [
                    'It is now possible to download/export treatments along with their statuses, similar to the existing medication history export.',
                    'The export includes treatment details and current status (e.g., active, completed, etc.).',
                ],
            },
            {
                title: '📩 Inquiry (Henvendelser) Improvements',
                description: [
                    'Inquiries can now be assigned to a department, similar to how it works for citizens.',
                    'A new "Department" field has been added to the inquiry form.',
                    'On the Inquiries page, it is now possible to filter inquiries by department and export inquiries per department.',
                    'The inquiry categories "Herberger og forsorgshjem" and "Krisecenter" can now be renamed in Settings → Other → Glossary (e.g., to §110 and §109).',
                    'The fields "Navn på spørger" and "Dato for henvendelser" can now be renamed in Settings → Other → Glossary.',
                    'The fields "Own notes" and "Purpose" can now be removed via Settings → Other → Glossary.',
                ],
            },
            {
                title: '💊 Medication – Trade Name Display',
                description: [
                    'The trade name of a medication (e.g., Panodil) is now clearly displayed alongside or as part of the medication information.',
                ],
            },
            {
                title: '🔔 Reminders & Task List',
                description: [
                    'It is now more clearly visible whether a reminder is marked as "Completed".',
                    'A log has been added showing which user completed a reminder.',
                    'The reminder feature now functions as a full task list, inspired by Apple\'s Reminders app.',
                    'A reminders overview has been added to the dashboard/home page.',
                ],
            },
            {
                title: '🔁 Duty Schedule Template – Copy Across Multiple Weeks',
                description: [
                    'It is now possible to copy shorter source weeks into multiple consecutive future weeks when creating a duty schedule template.',
                    'Example: copy 1 week into 2, 3, 4, or more consecutive weeks.',
                ],
            },
            {
                title: '📇 Company Contacts & Address Book',
                description: [
                    'Company contacts can now be created in the same way as citizen contacts.',
                    'All contacts (e.g., doctors, case workers, etc. – not relatives) are now stored centrally in the system so they can be reused and assigned to multiple citizens.',
                    'A company-wide address book has been introduced where contacts are centrally stored and can be selected when needed.',
                ],
            },
            {
                title: '🔐 Login Restriction by IP / Device',
                description: [
                    'Administrators can now restrict login access based on IP address and/or device.',
                    'Specific IP addresses (e.g., the office network) can be whitelisted.',
                    'Optionally, access can be restricted to approved devices.',
                    'Users outside allowed IPs/devices will be blocked or required to complete additional verification.',
                ],
            },
            {
                title: '⚙️ Shift Type Configuration',
                description: [
                    'Under Shift Types, it is now possible to define that 1 working hour equals 0.75 hours (optionally), and this rule can also be applied within a specific time interval.',
                    'For "Sleeping Night Shift", it is now possible to define a default end time that is 1, 2, or more days later.',
                ],
            },
            {
                title: '🧩 Roles & Permissions',
                description: [
                    'The Coordinator role and roles in general have been reviewed and improved so administrators no longer need to assign full "Administrator" rights unnecessarily.',
                    'A clear overview and explanation of how specific permissions work has been provided.',
                    'It is now possible to define a role hierarchy (e.g., Administrator has higher privileges than Manager).',
                    'Specialized domain-specific roles can now be created (e.g., "Medication Responsible") to control access to specific modules.',
                    'Multiple roles can now be assigned to a single employee (multi-select), and the system combines permissions from all assigned roles.',
                ],
            },
            {
                title: '📅 Duty Schedule – Yearly & Half-Year View per Employee',
                description: [
                    'A yearly and half-year calendar view has been added to the duty schedule.',
                    'The view can be shown per individual employee, displaying their assigned shifts and an overview across time.',
                ],
            },
        ],
        '2026-04-24': [
            {
                title: '🏷 Tags & Filtering – Duty Schedule Draft',
                description: [
                    'Tags are now visible when copying shifts in the duty schedule draft.',
                    'The draft now behaves identically to the published schedule, including tags and filtering functionality.',
                ],
            },
            {
                title: '📢 Open Shifts in Draft',
                description: [
                    'It is now possible to create an open shift directly in the duty schedule draft, matching the behavior of the extended draft view.',
                    'The shift is only published and triggers notifications once the draft is officially released.',
                ],
            },
            {
                title: '🔔 News & Updates – Notification Counter',
                description: [
                    'The notification counter for "News" and "Updates" is now cleared immediately after the user views it.',
                    'This reset occurs every time the user opens "News" or "Updates".',
                ],
            },
            {
                title: 'Department column in duty schedule exports',
                description: [
                    'When exporting a duty schedule, a "Department" column is included and positioned before the "Employee Name" column.',
                ],
            },
            {
                title: 'Duty schedule sorting – employees on duty today',
                description: [
                    'When the "on duty today" toggle is enabled, employees are now sorted starting with those whose shift begins earliest.',
                ],
            },
            {
                title: '📍 Employee Check-in – Geo-location',
                description: [
                    'Geo-location is now captured when employees check in.',
                    'The system records the location (latitude/longitude) at the time of check-in.',
                    'The location can optionally be displayed on a map view.',
                ],
            },
            {
                title: '📧 Apps – Mail Activation',
                description: [
                    'When activating the "Mail" app, the page now automatically reloads so the Mail module becomes immediately visible in the left sidebar.',
                ],
            },
            {
                title: 'Distribution of shift types',
                description: [
                    'Shift type distribution can now be filtered by start and end date/time and by employee.',
                ],
            },
            {
                title: '🏠 Room Management Improvements',
                description: [
                    'It is now possible to rename the label "Room" in the glossary/dictionary.',
                    'A proper overview of rooms and their availability is now available.',
                    'Occupied rooms can no longer be selected – only available rooms are selectable.',
                ],
            },
            {
                title: '⏱ Multi-day Shifts',
                description: [
                    'Shifts spanning multiple days (2–3 days or more) are now treated as one continuous shift.',
                    'No warnings are triggered for the maximum 13-hour shift rule or the 11-hour rest period rule for such shifts.',
                ],
            },
            {
                title: '🩺 Sick Leave & Vacation Approval',
                description: [
                    'Administrators must now approve sick leave and vacation requests submitted by employees through the duty schedule before they are registered.',
                ],
            },
            {
                title: '💊 Medication – Scheduled Period & Extra Days',
                description: [
                    'It is now possible to schedule medication administration over a specified period, rather than requiring daily administration.',
                    'It is also possible to add individual extra medication days on specific dates.',
                    'Example: a child who usually attends on weekends can have medication added for a specific extra weekday without changing the regular schedule.',
                ],
            },
            {
                title: '💊 Medication Administration – Flexible Recording',
                description: [
                    'It is now possible to administer, record, and mark deviations for medication much more flexibly.',
                ],
            },
            {
                title: '💊 Medication UI – Multiple Administration Times',
                description: [
                    'The medication UI now supports viewing multiple administration times for a single medication.',
                    'Each medication entry clearly displays all scheduled times (e.g., morning, noon, evening, night or specific timestamps).',
                    'Times are visually grouped under the same medication so it is clear they belong to the same prescription.',
                ],
            },
            {
                title: '💊 PN Medication – No Fixed Administration Time',
                description: [
                    'PN (as-needed) medication no longer has a fixed administration time, as it is given based on need.',
                ],
            },
            {
                title: '💊 Medication Inventory – Stock Calculation Fix',
                description: [
                    'Issues with incorrect medication stock calculations have been investigated and resolved.',
                    'Stock levels now always reflect accurate quantities based on registrations.',
                    'Inventory values can no longer drop below zero.',
                ],
            },
            {
                title: '💊 Medication – Date & Time Display',
                description: [
                    'The administration date column for both regular and PN medication now also includes the exact time of administration.',
                ],
            },
            {
                title: '💊 Medication Overview – Additional Fields',
                description: [
                    'The medication overview now also displays "Maximum dose per administration" and "Description".',
                    'For PN medication, the "Maximum dose per administration" field is now shown, consistent with regular medication.',
                ],
            },
            {
                title: '⚠️ Warning Configuration – Duty Schedule',
                description: [
                    'It is now possible to disable the "13-hour shift", "11-hour rest rule", and "48-hour rule" warnings in the duty schedule.',
                ],
            },
            {
                title: '📌 Bulletin Board Improvements',
                description: [
                    'Each post now displays the author and timestamp (date and time of creation).',
                    'Only the original author of a post or an admin can edit it.',
                    'Multiple posts can now be highlighted/pinned simultaneously.',
                    'Posts on the dashboard are now displayed in a list format showing the title and a short preview. Users can click a post to view its full content.',
                ],
            },
            {
                title: '💊 PN Medication – Effect Evaluation',
                description: [
                    'After administering PN (as-needed) medication, users can now perform an effect evaluation.',
                    'Click "Perform effect evaluation" to enter and save notes, outcome, or effect observations.',
                    'Multiple effect evaluations can be performed for the same medication entry.',
                ],
            },
        ],
        '2026-04-10': [
            {
                title: 'Messaging UI improvements & chat history deletion',
                description: [
                    'The messaging interface has been updated with an improved UI for a better user experience.',
                    'It is now possible to delete an entire message chat history directly from the conversation list.',
                ],
            },
            {
                title: 'Department column in duty schedule exports',
                description: [
                    'When exporting a duty schedule, a "Department" column is now included in the export.',
                    'The Department column is positioned before the "Employee Name" column.',
                ],
            },
            {
                title: '💸 Expenses',
                description: [
                    'A citizen field has been added to expenses, allowing expenses to be linked to a specific citizen.',
                    'Expenses are now displayed under the "Economy" section on the citizen profile, in a dedicated "Expenses" tab alongside the existing "Wallets" tab.',
                    'Expenses can now be edited after rejection.',
                    'Expenses can also be edited after reimbursement (expense paid out).',
                ],
            },
            {
                title: '🕒 Work Time Adjustments – Geo-location tracking',
                description: [
                    'Geo-location is now captured when starting and ending work time.',
                    'No kilometer tracking is required – only the location at start and end.',
                    'A green marker is shown for the start location and a red marker for the end location.',
                ],
            },
            {
                title: '📌 Pinning Journal Notes',
                description: [
                    'It is now possible to pin journal notes on a citizen.',
                    'Pinned notes are displayed at the top of the journal note list and remain visible regardless of sorting or filtering.',
                    'Notes can be pinned and unpinned easily, and multiple notes can be pinned at the same time.',
                    'This helps staff highlight important or critical information and improves overview and accessibility.',
                ],
            },
            {
                title: '🔐 Page Access – Duty Schedule visibility',
                description: [
                    'An option has been added to hide or remove access to the "Duty Schedule" page, consistent with how other pages are managed.',
                    'When hidden, the Duty Schedule page will not appear in the left sidebar.',
                ],
            },
            {
                title: '👤 Citizen & Contact Creation – Postal code auto-fill',
                description: [
                    'When creating a citizen, relative, or other contact, entering a postal code (ZIP code) will now automatically populate the City, Region, and Municipality fields.',
                ],
            },
            {
                title: 'Filter by archived/non-archived employees in duty schedule exports',
                description: [
                    'It is now possible to filter by archived and/or non-archived employees when exporting duty schedules.',
                ],
            },
            {
                title: '👤 Citizen Creation Permissions',
                description: [
                    'Creating citizens is no longer restricted to Admin profiles.',
                    'A new "Create Citizen" permission has been introduced, which can be assigned to any role – including the standard user role – under "Roles" in the catalog.',
                    'This allows administrators to control which users are permitted to create citizens.',
                ],
            },
            {
                title: 'Stop copying from current position',
                description: [
                    'It is now possible to stop a copying process from the current position in the schedule.',
                    'Previously, stopping the copy required navigating back to the original start date. This is no longer necessary.',
                ],
            },
            {
                title: '"Compensatory hours" renamed to "Compensatory hours this year"',
                description: [
                    'The label "Compensatory hours" has been renamed to "Compensatory hours this year" for clarity.',
                ],
            },
            {
                title: '📊 Time Logs improvements',
                description: [
                    'A citizen field has been added to time logs, allowing time logs to be linked to a specific citizen.',
                    'Time logs are now displayed on the citizen profile.',
                    'Statistics, filtering, and export of time log data are now available, matching the functionality of intervention hours.',
                ],
            },
            {
                title: '11-hour & 48-hour rule – Leave type exclusion',
                description: [
                    'The 11-hour rule and 48-hour rule no longer count vacation hours, sick hours, or other shifts marked as "leave types" when calculating rule violations.',
                    'These leave-type shifts can still be counted and calculated towards norm hours.',
                    'The warning indicator has been changed to a warning triangle icon to reduce visual noise, as it was appearing too frequently.',
                ],
            },
            {
                title: '📤 Citizen Export by Department (Shelter & Crisis Center)',
                description: [
                    'For "Shelter" and "Crisis center" categories, the citizen export now supports filtering and exporting citizens by department.',
                    'Each department\'s data can be exported separately, similar to how "Export inquiries" works.',
                ],
            },
            {
                title: 'Employee delete permissions – Calendar events',
                description: [
                    'Employees no longer have permission to delete items by default, except for calendar events.',
                    'A dedicated delete permission for calendar events has been added under roles, and can be assigned to the "Regular user" role and other roles.',
                ],
            },
            {
                title: '🎯 UI Improvements – Duty schedule indicators & shift notes',
                description: [
                    'Green and red indicators in the duty schedule now include a hover tooltip explaining their meaning.',
                    'Shift remarks/notes are now accessible via a hover tooltip on an icon displayed directly on the shift in the duty schedule.',
                ],
            },
            {
                title: 'X-timer (extra hours) additions',
                description: [
                    'A column showing the name of the person who created the extra hours entry has been added.',
                    'A department column and corresponding field have been added to extra hours.',
                    'Extra hours are now also included within duty schedule drafts.',
                ],
            },
            {
                title: '⏱ Time Registration Improvements',
                description: [
                    'Employees can now request registration of a missed check-in directly in the system.',
                    'These requests must be reviewed and approved by an administrator before they are registered.',
                    'Administrators can now edit existing time log entries.',
                ],
            },
        ],
        '2026-02-20': [
            {
                title: 'Online document creation and editing',
                description: [
                    'Users can now create and edit documents directly online within the system.',
                    'System-generated documents can be downloaded as PDF files.',
                    'Uploaded documents (Word and Pages formats) can also be edited online.',
                    'It is possible to view documents in read-only mode without enabling editing.'
                ],
            },
            {
                title: 'Comp time and vacation hours overview',
                description: [
                    'Employees can now view an overview of compensatory time and vacation hours for a selected period.',
                    'This provides better transparency and planning of available time off.'
                ],
            },
            {
                title: 'Automatic follow-up highlighting on citizen reports',
                description: [
                    'Forms can now be configured to automatically highlight submitted citizen reports after a specified time period set by the staff member.',
                    'Highlighted reports will appear in the general citizen overview, in the Daily Overview (in a dedicated box), and on the citizen’s profile page.',
                    'This functionality must be enabled by an admin on the specific form before it can be used.'
                ],
            },
            {
                title: 'Configurable intervention tracking hours',
                description: [
                    'Admins can now configure the number of hours for intervention tracking in the system settings.',
                    'The default value of 24 hours can be adjusted to any desired number of hours.'
                ],
            },
            {
                title: 'Time Registration tab for employees',
                description: [
                    'A dedicated Time Registration tab has been added for employees.',
                    'This centralizes and simplifies time tracking and registrations.'
                ],
            },
            {
                title: 'AI prompting with file attachment and internal data access',
                description: [
                    'AI prompting now supports file attachments as part of the request.',
                    'The AI can access relevant internal system data (based on permissions) to provide more accurate and contextual responses.'
                ],
            },
            {
                title: 'Tags on extra hours',
                description: [
                    'It is now possible to add tags to extra hours entries.',
                    'This improves categorization, filtering, and reporting of additional worked hours.'
                ],
            },
            {
                title: 'User-specific email signatures',
                description: [
                    'Users can now create and manage their own email signatures.',
                    'Email signatures can be configured individually per user.'
                ],
            },
            {
                title: 'Graph visualization of compensatory time',
                description: [
                    'Compensatory time is now visualized in a graph based on norm hours.',
                    'The graph is displayed when clicking on compensatory hours, below the hourly view in the existing pop-up modal.'
                ],
            },
            {
                title: 'Linked yearly and weekly norm hours',
                description: [
                    'A new Weekly Norm Hours field has been added and linked to the Yearly Norm Hours field on the employee create/edit form.',
                    'Both fields automatically calculate and update each other based on a 52-week year.',
                    'The weekly norm hours value is also displayed beneath the yearly norm hours in the duty schedule view.'
                ],
            },
            {
                title: 'Export based on filtered duty schedule view',
                description: [
                    'It is now possible to export data based on the currently applied filters in the duty schedule view.',
                    'Users can download the filtered view as shown on screen.',
                    'The duty schedule can be exported in CSV format with either semicolon-separated or comma-separated values.'
                ],
            },
            {
                title: 'Leave shift type classification and export options',
                description: [
                    'Shift types can now be marked as “leave shift types.”',
                    'Exports can be configured to include only leave shift types, only regular duty shifts, or both combined in a single export file.'
                ],
            },
            {
                title: 'Password-protected read-only sharing',
                description: [
                    'Duty schedules and journals can now be shared via password-protected links.',
                    'Recipients can access the shared content in read-only mode without logging into the system.'
                ],
            },
            {
                title: 'Restrict visibility of historical shifts',
                description: [
                    'Admins can configure in the settings whether employees are allowed to view other employees’ historical duty shifts.',
                    'Regardless of this setting, employees can never view other employees’ hourly data.'
                ],
            },
            {
                title: 'Enhanced date selector options',
                description: [
                    'The overview date selector now allows users to quickly choose between today’s date, the next 7 days, or a custom date range.',
                    'This provides more flexibility when navigating and reviewing data.'
                ],
            },
            {
                title: 'Vacation registration with compensatory time option',
                description: [
                    'When registering vacation, users can mark it as compensatory time off (afspadsering), both during creation and editing.',
                    'If marked, the checkbox remains selected.',
                    'If compensatory time is marked during editing after creation, the system adjusts the compensatory balance based on the vacation shift hours.'
                ],
            },
            {
                title: 'Transportation usage indication for reimbursement',
                description: [
                    'Employees can indicate when transportation has been used and should be reimbursed.',
                    'This ensures accurate tracking and reimbursement of transportation expenses.'
                ],
            },
            {
                title: 'Pay code / payroll item per shift type',
                description: [
                    'Each shift type can now include a pay code or payroll item field.',
                    'This field is included in shift exports and payroll reports to ensure accurate pay processing.'
                ],
            },
            {
                title: 'Shift rotation notifications',
                description: [
                    'Employees receive a notification when a new shift rotation is rolled out.',
                    'Notifications are also sent when changes are made to an existing shift rotation.'
                ],
            },
            {
                title: 'Termination date with automatic access disable',
                description: [
                    'A termination date field is available on the employee create, edit, and view forms.',
                    'When the termination date is reached, the employee’s access is automatically disabled.'
                ],
            },
            {
                title: 'Treatments unaffected by overview date selector',
                description: [
                    'The Treatments section is no longer affected by the overview date selector.',
                    'All ongoing (active) treatments are displayed regardless of the selected date range.'
                ],
            },
        ],
        '2026-01-30': [
            {
                title: 'Change label option in glossary list',
                description: [
                    'Users can now change the label “Department” in the glossary list.',
                    'This customization option enhances the flexibility of terminology across the system.'
                ],
            },
            {
                title: 'Save reports as draft',
                description: [
                    'Users now have the ability to save reports as drafts within the plans, goals, and documents sections.',
                    'This allows users to come back, edit their drafts, and publish them at a later time.'
                ],
            },
            {
                title: 'Department-specific tags',
                description: [
                    'Tags can now be made department-specific, improving categorization and filtering based on departmental context.',
                    'This ensures better organization and relevance of tags for each department.'
                ],
            },
            {
                title: 'Display plans, goals, and subgoals in Daily Overview',
                description: [
                    'Plans, goals, and subgoals will now be displayed in the Daily Overview, grouped by citizen.',
                    'This enhances the daily review process, making it easier to track progress on specific individuals.'
                ],
            },
            {
                title: 'Display schedule slots in Daily Overview',
                description: [
                    'Schedule slots are now visible in the Daily Overview.',
                    'This feature provides a clearer, more organized view of scheduled activities for the day.'
                ],
            },
            {
                title: 'Indicate transportation usage for reimbursement',
                description: [
                    'Employees can now indicate that they have used transportation, and therefore have an expense to be reimbursed.',
                    'This feature ensures employees can easily report transportation expenses for reimbursement processing.'
                ],
            },
            {
                title: 'Pay code / payroll item field per shift type',
                description: [
                    'A pay code or payroll item field has been added per shift type, and this will be included in shift exports and reports.',
                    'This allows for better payroll tracking and reporting, ensuring accurate pay processing.'
                ],
            },
            {
                title: 'Termination date field for employee records',
                description: [
                    'A termination date field has been added to the employee create, edit, and view forms.',
                    'When the termination date is reached, the employee’s access will be automatically disabled, ensuring secure and timely access control.'
                ],
            },
        ],
        '2026-01-23': [
            {
                title: 'Journal note editing restrictions',
                description: [
                    'Regular employees can now only edit their own journal notes, and only within 24 hours of creation.',
                    'After the 24-hour window, only administrators can edit journal notes to ensure auditability and stronger content governance.'
                ],
            },
            {
                title: 'Optimized medicine overview performance',
                description: [
                    'The medicine overview has been optimized for improved load times and responsiveness, especially for larger datasets.',
                    'The overview now reliably fetches and displays the full list of medicines to support complete planning and review.'
                ],
            },
            {
                title: 'Department data access isolation',
                description: [
                    'Users are now restricted to viewing data only for their assigned department(s).',
                    'Cross-department visibility (e.g., users from Department A viewing Departments B, C, D) is no longer permitted, strengthening privacy and access control.'
                ],
            },
            {
                title: 'Updated UI for Forgot Password, Reset Password, and Setup Password',
                description: [
                    'The forgot password, reset password, and setup password pages have been updated to match the refreshed login UI.',
                    'Improvements include consistent layout, spacing, and component styling for a cleaner, more cohesive authentication experience across devices.'
                ],
            },
            {
                title: 'Date filtering options added to overview',
                description: [
                    'A new date filter has been added to the overview to simplify planning and review by timeframe.',
                    'Users can now filter by Today, Next 7 days, or a Custom date range.'
                ],
            },
        ],
        '2026-01-16': [
            {
                title: 'UI updates for Login, Sign Up, and Forgot Password',
                description: [
                    'The login, sign up, and forgot password pages have been refreshed with an updated UI for a cleaner and more consistent experience.',
                    'Improved layout, spacing, and component styling make authentication flows easier to navigate across devices.'
                ],
            },
            {
                title: 'Granular permissions for Catalog roles',
                description: [
                    'It is now possible to assign specific permissions within the roles area in the Catalog, enabling more fine-grained access control.',
                    'For example, you can create a "Duty Shift Coordinator" role that only has access to the duty schedule (and not other areas).',
                    'This approach supports additional role types and permission combinations as needed by the organization.'
                ],
            },
            {
                title: 'Added "Sugetabletter" to Dosage form list',
                description: [
                    'The "Sugetabletter" option has been added to the "Dosage form" list in the medicine create/edit forms.',
                    'This improves support for managing different medication dosage forms consistently across the system.'
                ],
            },
            {
                title: 'Download medication overview from medicine card',
                description: [
                    'A new option on the medicine card allows users to download a medication overview.',
                    'The overview includes all medications and their scheduled administration times, providing an easy-to-share reference for planning and documentation.'
                ],
            },
            {
                title: 'Medication administration on fixed weekdays',
                description: [
                    'Medication schedules can now be configured to administer on fixed weekdays (e.g., Mondays, Wednesdays, and Fridays).',
                    'This adds flexibility for recurring administration patterns that do not follow daily intervals.'
                ],
            },
            {
                title: 'Draft schedule published versions',
                description: [
                    'Schedules now support draft and published versions, allowing changes to be prepared before going live.',
                    'Admins can review and adjust drafts before publishing, ensuring updates are released in a controlled way.'
                ],
            },
            {
                title: 'Child profile access',
                description: [
                    'Support for child profile access has been added, enabling appropriate users to access and manage child profiles as permitted.',
                    'This improves usability for organizations managing care and scheduling for children while maintaining access controls.'
                ],
            },
            {
                title: 'Messaging read tracking',
                description: [
                    'Messaging now includes read tracking so senders can see when messages have been read.',
                    'This improves communication clarity and reduces the need for manual follow-ups.'
                ],
            },
        ],
        '2026-01-09': [
            {
                title: 'Recurring events in the calendar',
                description: [
                    'When editing a single event, the system now prompts users to choose whether to apply changes to just this event or all future events.',
                    'This functionality ensures more flexibility and control over recurring events.'
                ],
            },
            {
                title: 'Automatic recurring week rotation in duty schedule',
                description: [
                    'Admins can now create automatic recurring week rotations in the duty schedule, such as an 8-week rotation, that repeats until manually stopped.',
                    'The system will prompt admins when editing a duty shift within a recurring rotation, asking whether the edit should apply only to this shift or the entire recurring pattern.'
                ],
            },
            {
                title: 'Ability to search for a specific day in the shift schedule and calendar',
                description: [
                    'Users can now search for a specific day in the shift schedule and calendar, enabling more precise navigation without needing to scroll week by week.',
                    'This improvement includes the ability to navigate by month as well.'
                ],
            },
            {
                title: 'Filter options in shift plans',
                description: [
                    'The shift plan overview now includes filter options to select one or more employees.',
                    'Additionally, filters for employment status have been added, allowing for more tailored planning and clarity.'
                ],
            },
            {
                title: 'Viewing employee shifts across departments',
                description: [
                    'Users can now toggle visibility of shifts across departments for all employees.',
                    'This feature is available only if multiple departments have been set up in the organization.'
                ],
            },
            {
                title: 'Multi-day shift handling improvements',
                description: [
                    'When creating shifts spanning multiple days, the system will now automatically split them into separate shifts for each day.',
                    'A visual connection, such as a line or start/end text, will be added to indicate the continuity of the shift across days.'
                ],
            },
            {
                title: 'Shift Creation Flow Enhancements',
                description: [
                    'The shift creation flow has been optimized: users must first select the shift type before other display options appear.',
                    'The department field is now automatically filled with the selected department by default, but it can be changed during the creation process.'
                ],
            },
            {
                title: 'Remember selected department in top bar',
                description: [
                    'Once a department is selected in the top bar, it will remain selected for future actions until changed.',
                    'This streamlines the process for admins and schedulers working within a specific department.'
                ],
            },
            {
                title: 'Create custom job titles under "Contacts" on citizens',
                description: [
                    'Admins can now create custom job titles under the "Contacts" section for citizens.',
                    'This helps track specific roles or titles within the organization.'
                ],
            },
            {
                title: 'Pin yourself in the shift schedule',
                description: [
                    'Users can now pin themselves in the shift schedule to ensure they always appear at the top of the list.',
                    'This feature helps users easily identify their shifts, especially in large teams.'
                ],
            },
            {
                title: 'Vacation scheduling and shift replacement',
                description: [
                    'When an employee creates a vacation request, any existing shifts will be automatically removed and offered to others for replacement, similar to sick leave handling.'
                ],
            },
            {
                title: 'Optimizing Duty Shift Offering',
                description: [
                    'Duty shift offerings have been optimized to show only shifts relevant to the assigned department.',
                    'A job title field now allows multiple titles to be added, and night shifts spanning multiple days can be offered as a single shift.'
                ],
            },
            {
                title: 'Calendar department filter',
                description: [
                    'Events in the calendar will now be filtered by the selected department, ensuring users only see events relevant to their department.',
                    'The start time for events will be automatically set to 1 hour later than the start time until manually adjusted.',
                    'The employee field on an event will now display only employees from the selected department.'
                ],
            },
            {
                title: 'Role inclusion in export files',
                description: [
                    'When exporting employees, the role field will now be included in the export file.',
                    'This ensures the exported data includes the roles associated with each employee.'
                ],
            },
            {
                title: 'Adding "Sugetabletter" to the "Dosage form" list',
                description: [
                    'The "Sugetabletter" option has been added to the "Dosage form" list in the medicine creation and edit forms.',
                    'This allows for better management of dosage forms within the system.',
                    'Management of dosage form is also available in the catalog settings.'
                ],
            },
            {
                title: 'Permissions in Catalog roles',
                description: [
                    'It is now possible to assign specific permissions in the roles area for tasks like managing the duty schedule, allowing for more granular control over user access.',
                    'For example, a "Duty Shift Coordinator" role can be created with limited access to only the duty schedule.'
                ],
            }
        ],
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
        '2026-05-15': [
            {
                title: '🔁 Forbedringer af skabeloner og kopiering',
                description: [
                    'Det er nu muligt at kopiere kortere kildeuge ind i flere på hinanden følgende fremtidige uger, når der oprettes en vagtplanskabelon.',
                    'Eksempel: Kopiér 1 uge ind i 2, 3, 4 (eller flere) på hinanden følgende uger.',
                ],
            },
            {
                title: '📝 Dynamiske journalnotefelter baseret på titel',
                description: [
                    'Journalnoter understøtter nu dynamiske, foruddefinerede felter baseret på den valgte journalnotetitel.',
                    'Når en bruger vælger en journalnotetitel, viser systemet automatisk relevante felter/spørgsmål tilknyttet den pågældende titel.',
                    'Hvert felt tillader input (f.eks. noter, svar, observationer).',
                    'Disse felter kan konfigureres på forhånd via et katalog eller indstillinger.',
                ],
            },
            {
                title: '📅 Kalenderbegivenhed – journalnote og afslutningsstatus',
                description: [
                    'Det er nu muligt at oprette en journalnote direkte fra en kalenderbegivenhed ved at klikke på begivenheden og vælge "Opret journalnote".',
                    'Begivenhedstitlen kopieres automatisk ind i journalnoten.',
                    'Kalenderbegivenheden linker til journalnoten, og journalnoten linker tilbage til kalenderbegivenheden.',
                    'Det er nu muligt at markere en begivenhed som "Gennemført" eller "Ikke gennemført".',
                    'Når en af mulighederne vælges, vises en popup med spørgsmålet: "Ønsker du at skrive en journalnote om dette?" med valgmulighederne "Ja" og "Nej".',
                    'Hvis der fortsættes med en journalnote, er der en mulighed for at kopiere noten til en relateret plan, mål eller delmål.',
                    'Statistik over antallet af gange emner markeres som "Gennemført" versus "Ikke gennemført" er nu tilgængelig for enhver given periode.',
                ],
            },
            {
                title: '🧩 Roller og tilladelser',
                description: [
                    'Koordinatorrollen og roller generelt er gennemgået og forbedret, så administratorer ikke længere behøver at tildele fulde administratorrettigheder unødvendigt.',
                    'En klar oversigt og forklaring af, hvordan specifikke tilladelser fungerer, er nu tilgængelig.',
                    'Det er nu muligt at definere et rollehierarki (f.eks. Administrator har højere privilegier end Leder).',
                    'Specialiserede domænespecifikke roller kan nu oprettes (f.eks. "Medicinsansvarlig") for at styre adgang til specifikke moduler eller funktioner.',
                    'Flere roller kan nu tildeles en enkelt medarbejder (flervalg), og systemet kombinerer tilladelser fra alle tildelte roller.',
                ],
            },
            {
                title: '📋 Oversigtsside for journalnoter',
                description: [
                    'Funktionen "Se seneste / alle journalnoter" åbner nu en dedikeret side, hvor alle journalnoter kan ses på ét sted.',
                    'Adgang til journalnoter respekterer den eksisterende tilladelsesstruktur: brugere ser kun noter fra borgere inden for deres afdelinger.',
                    'Administratorroller kan se alle journalnoter på tværs af hele organisationen.',
                    'Det er nu muligt at filtrere journalnoter globalt efter borger, afdeling, tags og andre relevante filtre.',
                ],
            },
            {
                title: '📆 iCal / CalDav – Abonner på kalender',
                description: [
                    'Det er nu muligt at abonnere på CitizenOne-kalenderen via iCal / CalDav.',
                    'Dette giver brugerne mulighed for at se deres CitizenOne-kalenderbegivenheder i eksterne kalenderapplikationer.',
                ],
            },
            {
                title: '📋 Opholdssagsdata – samtykkeerklæringer',
                description: [
                    'I opholdssagsdata-formularen er det nu muligt at vælge samtykkeerklæringer med Ja/Nej-muligheder for: Foto, Forældreinddragelse, Elevsamarbejde og Generelt samtykke.',
                    'Brugerdefinerede samtykkeerklæringstyper kan oprettes i kataloget.',
                    'Det er nu muligt at angive Personligt værgemål (Ja/Nej) og Økonomisk værgemål (Ja/Nej).',
                ],
            },
            {
                title: '🏥 De 12 omsorgsområder – status og skabeloner',
                description: [
                    'Når status for et omsorgsområde opdateres, er det nu muligt at vælge: Ikke et aktivt problem, Potentielt problem eller Aktivt problem.',
                    'Skabeloner kan nu bruges til omsorgsområder, hvor man definerer, hvilke felter brugere skal udfylde (påkrævede eller valgfrie).',
                    'Når et omsorgsområde oprettes eller opdateres, kan relaterede områder ses i et sidepanel – tilsvarende hvordan planer og mål vises ved oprettelse af en journalnote.',
                ],
            },
            {
                title: '💊 Behandlinger – forbedringer og UX-forbedringer',
                description: [
                    'Skabeloner kan nu bruges til behandlinger, hvor man definerer, hvilke felter brugere skal udfylde (påkrævede eller valgfrie).',
                    'Feltet "Afsluttet" er omdøbt til "Markér som afsluttet".',
                    'Det er nu tydeligere visuelt, hvilke behandlinger der er aktive (igangværende) i forhold til afsluttede, via klare UI-indikatorer (f.eks. etiketter, farver eller statusbadges).',
                    'Hovedoversigten/dashboardet inkluderer nu oversigtswidgets som f.eks. "10 aktive behandlinger", som brugere kan klikke på for at se listen.',
                    'Hvis behandlinger er oprettet inden for et specifikt omsorgsområde, er der nu et direkte link fra omsorgsområdet til disse behandlinger.',
                ],
            },
            {
                title: '🌍 Norsk og svensk sprogunderstøttelse',
                description: [
                    'Norsk og svensk er nu tilgængeligt som sprogmuligheder i CitizenOne.',
                    'Brugere kan skifte til norsk (Norsk) eller svensk (Svenska) fra deres sprogindstillinger.',
                ],
            },
        ],
        '2026-05-08': [
            {
                title: '📇 Virksomhedskontakter og adressebog',
                description: [
                    'Virksomhedskontakter kan nu oprettes på samme måde som borgerkontakter.',
                    'Alle kontakter (f.eks. læger, sagsbehandlere osv. – ikke pårørende) gemmes nu centralt i systemet, så de kan genbruges og tildeles flere borgere.',
                    'En virksomhedsdækkende adressebog er introduceret, hvor kontakter gemmes centralt og kan vælges efter behov.',
                ],
            },
            {
                title: '⚙️ Konfiguration af vagttyper',
                description: [
                    'Under vagttyper er det nu muligt at definere, at 1 arbejdstime svarer til 0,75 time (valgfrit), og denne regel kan også gælde inden for et bestemt tidsinterval.',
                    'For "Sovende nattevagt" er det nu muligt at definere et standardsluttidspunkt, der er 1, 2 eller flere dage senere.',
                ],
            },
            {
                title: '📅 Vagtplan – års- og halvårsvisning pr. medarbejder',
                description: [
                    'En års- og halvårskalendervisning er tilføjet til vagtplanen.',
                    'Visningen kan vises pr. enkelt medarbejder med deres tildelte vagter og en oversigt over tid.',
                ],
            },
            {
                title: '💊 Medicinnoter – informationsikon',
                description: [
                    'Et informationsikon ("i") er tilføjet til medicinnoter.',
                    'Når man holder musen over ikonet, vises den tilknyttede bemærkning til det pågældende lægemiddel.',
                    'Eksempel: "Må ikke administreres, hvis patienten er under indflydelse af kokain."',
                ],
            },
            {
                title: '🤖 AI-badge på journalnoter',
                description: [
                    'Systemet registrerer nu, når AI-assistenten er blevet brugt til at oprette eller assistere med en journalnote.',
                    'Et badge vises på journalnoten for at angive, at AI-assistenten blev anvendt.',
                    'Badget viser: "CitizenOne AI was used".',
                ],
            },
            {
                title: '🔐 Loginbegrænsning via IP / enhed',
                description: [
                    'Administratorer kan nu begrænse loginadgang baseret på IP-adresse og/eller enhed.',
                    'Specifikke IP-adresser (f.eks. kontorets netværk) kan hvidlistes.',
                    'Adgangen kan eventuelt begrænses til godkendte enheder.',
                    'Brugere uden for tilladte IP-adresser/enheder blokeres eller skal gennemføre yderligere bekræftelse.',
                    'Denne funktion øger sikkerheden og sikrer adgang kun fra betroede miljøer.',
                ],
            },
            {
                title: '🎄 Helligdags- og søndagslønregler',
                description: [
                    'På helligdage gælder et standardeksempel: 08:00 – 15:24 = 7,4 timer.',
                    'På søndage skal medarbejdere modtage 1,5× deres timer.',
                    'Hvis en medarbejder arbejder på en søndag eller helligdag, modtager de vagttimer × 1,5.',
                ],
            },
        ],
        '2026-05-01': [
            {
                title: 'Tilføjelser til Ekstra Timer (X-timer)',
                description: [
                    'En ny kolonne er tilføjet, der viser navnet på den person, der har oprettet ekstra-timer-posten.',
                    'En ny kolonne og et tilsvarende felt for afdelinger er tilføjet til ekstra timer.',
                    'Ekstra timer er nu også synlige i vagtplanudkast.',
                ],
            },
            {
                title: '⏱ Forbedringer af tidsregistrering',
                description: [
                    'Medarbejdere kan nu anmode om registrering af et glemt check-ind.',
                    'Disse anmodninger skal godkendes af en administrator, før de registreres.',
                    'Administratorer kan nu redigere eksisterende tidslog-poster.',
                ],
            },
            {
                title: '💊 Forbedringer af medicinoversigtens',
                description: [
                    'Antal piller / dosis vises nu tydeligt og fremtrædende for hvert lægemiddel.',
                    'Medicinoversigtens skelner nu klart mellem PN-medicin (efter behov) og fast (planlagt) medicin.',
                    'Filtreringsmuligheder er tilføjet: vis al medicin, kun PN-medicin eller kun fast medicin.',
                    'Det er nu muligt at sortere kolonner i medicinoversigtens alfabetisk (f.eks. efter medicinnavn) og numerisk (f.eks. efter dosis).',
                    'Det er nu muligt at se al medicin på én gang i stedet for at være begrænset til 10 poster pr. side.',
                ],
            },
            {
                title: '👥 Tildeling af medarbejdergrupper til borgere',
                description: [
                    'Det er nu muligt at tildele en medarbejdergruppe til en borger og omvendt – fra medarbejdergruppen tildeles en eller flere borgere, og fra borgerprofilen tildeles en eller flere medarbejdergrupper.',
                    'Når en medarbejdergruppe tildeles en borger, tildeles alle medarbejdere i gruppen automatisk til borgeren.',
                    'Tildelingen fungerer på samme måde som direkte tildeling af en medarbejder via "Tildelte borgere" eller tildeling af en kontakt via "Kontakter" på borgeren.',
                    'Forholdet holdes synkroniseret: hvis en medarbejder tilføjes eller fjernes fra gruppen, opdateres borgerens tildeling automatisk.',
                    'Hvis en medarbejdergruppe fjernes fra en borger, fratages alle tilknyttede medarbejdere også (medmindre de er tildelt manuelt andetsteds).',
                ],
            },
            {
                title: '📥 Eksport af behandlinger',
                description: [
                    'Det er nu muligt at downloade/eksportere behandlinger sammen med deres statusser, svarende til den eksisterende eksport af medicinhistorik.',
                    'Eksporten indeholder behandlingsdetaljer og nuværende status (f.eks. aktiv, afsluttet osv.).',
                ],
            },
            {
                title: '📩 Forbedringer af henvendelser',
                description: [
                    'Henvendelser kan nu tildeles en afdeling, på samme måde som det fungerer for borgere.',
                    'Et nyt "Afdeling"-felt er tilføjet i henvendelsesskemaet.',
                    'På henvendelsessiden er det nu muligt at filtrere henvendelser efter afdeling og eksportere henvendelser pr. afdeling.',
                    'Kategorierne "Herberger og forsorgshjem" og "Krisecenter" kan nu omdøbes i Indstillinger → Andet → Ordliste (f.eks. til §110 og §109).',
                    'Felterne "Navn på spørger" og "Dato for henvendelser" kan nu omdøbes i Indstillinger → Andet → Ordliste.',
                    'Felterne "Egne noter" og "Formål" kan nu fjernes via Indstillinger → Andet → Ordliste.',
                ],
            },
            {
                title: '💊 Medicin – visning af handelsnavn',
                description: [
                    'Handelsnavnet på et lægemiddel (f.eks. Panodil) vises nu tydeligt som en del af medicininformationen.',
                ],
            },
            {
                title: '🔔 Påmindelser og opgaveliste',
                description: [
                    'Det er nu tydeligere synligt, om en påmindelse er markeret som "Fuldført".',
                    'En log er tilføjet, der viser hvilken bruger der fuldførte en påmindelse.',
                    'Påmindelsesfunktionen fungerer nu som en fuld opgaveliste, inspireret af Apples Påmindelser-app.',
                    'En påmindelsesoversigt er tilføjet på dashboardet/startsiden.',
                ],
            },
            {
                title: '🔁 Vagtplanskabelon – kopiering over flere uger',
                description: [
                    'Det er nu muligt at kopiere kortere kildesuger ind i flere på hinanden følgende fremtidige uger ved oprettelse af en vagtplanskabelon.',
                    'Eksempel: kopiér 1 uge til 2, 3, 4 eller flere på hinanden følgende uger.',
                ],
            },
            {
                title: '📇 Virksomhedskontakter og adressebog',
                description: [
                    'Virksomhedskontakter kan nu oprettes på samme måde som borgerkontakter.',
                    'Alle kontakter (f.eks. læger, sagsbehandlere osv. – ikke pårørende) gemmes nu centralt i systemet, så de kan genbruges og tildeles flere borgere.',
                    'En virksomhedsdækkende adressebog er introduceret, hvor kontakter gemmes centralt og kan vælges efter behov.',
                ],
            },
            {
                title: '🔐 Loginbegrænsning via IP / enhed',
                description: [
                    'Administratorer kan nu begrænse loginadgang baseret på IP-adresse og/eller enhed.',
                    'Specifikke IP-adresser (f.eks. kontorets netværk) kan hvidlistes.',
                    'Adgangen kan eventuelt begrænses til godkendte enheder.',
                    'Brugere uden for tilladte IP-adresser/enheder blokeres eller skal gennemføre yderligere bekræftelse.',
                ],
            },
            {
                title: '⚙️ Konfiguration af vagttyper',
                description: [
                    'Under vagttyper er det nu muligt at definere, at 1 arbejdstime svarer til 0,75 time (valgfrit), og denne regel kan også gælde inden for et bestemt tidsinterval.',
                    'For "Sovende nattevagt" er det nu muligt at definere et standardsluttidspunkt, der er 1, 2 eller flere dage senere.',
                ],
            },
            {
                title: '🧩 Roller og rettigheder',
                description: [
                    'Koordinatorrollen og roller generelt er gennemgået og forbedret, så administratorer ikke længere behøver at tildele fulde "Administrator"-rettigheder unødvendigt.',
                    'En klar oversigt og forklaring af, hvordan specifikke rettigheder fungerer, er nu tilgængelig.',
                    'Det er nu muligt at definere et rollehierarki (f.eks. Administrator har højere rettigheder end Leder).',
                    'Domænespecifikke roller kan nu oprettes (f.eks. "Medicinansvarlig") til at styre adgang til specifikke moduler.',
                    'Flere roller kan nu tildeles en enkelt medarbejder (flervalg), og systemet kombinerer rettigheder fra alle tildelte roller.',
                ],
            },
            {
                title: '📅 Vagtplan – års- og halvårsvisning pr. medarbejder',
                description: [
                    'En års- og halvårskalendervisning er tilføjet til vagtplanen.',
                    'Visningen kan vises pr. enkelt medarbejder med deres tildelte vagter og en oversigt over tid.',
                ],
            },
        ],
        '2026-04-24': [
            {
                title: '🏷 Tags & filtrering – Vagtplanudkast',
                description: [
                    'Tags er nu synlige, når man kopierer vagter i vagtplanudkastet.',
                    'Udkastet opfører sig nu identisk med den offentliggjorte vagtplan, herunder tags og filtreringsfunktionalitet.',
                ],
            },
            {
                title: '📢 Åbne vagter i udkast',
                description: [
                    'Det er nu muligt at oprette en åben vagt direkte i vagtplanudkastet, på samme måde som i den udvidede udkastvisning.',
                    'Vagten publiceres og sender notifikationer først, når udkastet officielt frigives.',
                ],
            },
            {
                title: '🔔 Nyheder & Opdateringer – Notifikationstæller',
                description: [
                    'Notifikationstælleren for "Nyheder" og "Opdateringer" nulstilles nu øjeblikkeligt, når brugeren åbner dem.',
                    'Dette sker hver gang brugeren åbner "Nyheder" eller "Opdateringer".',
                ],
            },
            {
                title: 'Afdelingskolonne i vagtplaneksporter',
                description: [
                    'Når man eksporterer en vagtplan, er der nu inkluderet en "Afdeling"-kolonne, der er placeret før "Medarbejdernavn"-kolonnen.',
                ],
            },
            {
                title: 'Sortering af vagtplan – medarbejdere på vagt i dag',
                description: [
                    'Når funktionen "på vagt i dag" er aktiveret, sorteres medarbejdere nu startende med dem, hvis vagt begynder tidligst.',
                ],
            },
            {
                title: '📍 Medarbejder check-in – Geo-lokation',
                description: [
                    'Geo-lokation registreres nu, når medarbejdere checker ind.',
                    'Systemet gemmer lokationen (bredde- og længdegrad) på tidspunktet for check-in.',
                    'Lokationen kan valgfrit vises på en kortvisning.',
                ],
            },
            {
                title: '📧 Apps – Aktivering af Mail',
                description: [
                    'Når "Mail"-appen aktiveres, genindlæser siden nu automatisk, så Mail-modulet straks bliver synligt i venstre navigationsmenu.',
                ],
            },
            {
                title: 'Fordeling af vagttyper',
                description: [
                    'Fordelingen af vagttyper kan nu filtreres efter start- og sluttidspunkt samt medarbejder.',
                ],
            },
            {
                title: '🏠 Forbedringer af rumhåndtering',
                description: [
                    'Det er nu muligt at omdøbe etiketten "Rum" i ordbogen/glossaret.',
                    'Der er nu et korrekt overblik over rum og deres tilgængelighed.',
                    'Optagne rum kan ikke længere vælges – kun ledige rum er valgbare.',
                ],
            },
            {
                title: '⏱ Flerdag-vagter',
                description: [
                    'Vagter, der strækker sig over flere dage (2–3 dage eller mere), behandles nu som én sammenhængende vagt.',
                    'Der udløses ingen advarsler om maksimal 13-timers vagt eller 11-timers hviletid for sådanne vagter.',
                ],
            },
            {
                title: '🩺 Godkendelse af sygefravær & ferie',
                description: [
                    'Administratorer skal nu godkende anmodninger om sygefravær og ferie indsendt af medarbejdere via vagtplanen, før de registreres.',
                ],
            },
            {
                title: '💊 Medicin – Planlagt periode & ekstra dage',
                description: [
                    'Det er nu muligt at planlægge medicinering over en bestemt periode i stedet for daglig administration.',
                    'Det er også muligt at tilføje individuelle ekstra medicindage på specifikke datoer.',
                    'Eksempel: et barn, der normalt kommer i weekender, kan få tilføjet medicin for en specifik ekstra hverdag uden at ændre den normale plan.',
                ],
            },
            {
                title: '💊 Medicinering – Fleksibel registrering',
                description: [
                    'Det er nu muligt at administrere, registrere og markere afvigelser for medicin langt mere fleksibelt.',
                ],
            },
            {
                title: '💊 Medicin UI – Flere administrationstidspunkter',
                description: [
                    'Medicin-UI understøtter nu visning af flere administrationstidspunkter for ét enkelt lægemiddel.',
                    'Hver medicinpost viser tydeligt alle planlagte tidspunkter (f.eks. morgen, middag, aften, nat eller specifikke tidsstempler).',
                    'Tidspunkterne er visuelt grupperet under det samme lægemiddel, så det er klart, at de hører til den samme recept.',
                ],
            },
            {
                title: '💊 PN-medicin – Intet fast administrationstidspunkt',
                description: [
                    'PN-medicin (behovsbestemt medicin) har ikke længere et fast administrationstidspunkt, da det gives efter behov.',
                ],
            },
            {
                title: '💊 Medicinkassebeholdning – Rettelse af beregningsfejl',
                description: [
                    'Fejl i beregningen af medicinkassebeholdningen er undersøgt og udbedret.',
                    'Lagerbeholdningen afspejler nu altid korrekte mængder baseret på registreringer.',
                    'Lagerværdier kan ikke længere falde under nul.',
                ],
            },
            {
                title: '💊 Medicin – Dato- og tidsvisning',
                description: [
                    'Dato-kolonnen for administreret medicin (herunder PN-medicin) viser nu også det præcise tidspunkt for administrationen.',
                ],
            },
            {
                title: '💊 Medicinsoversigt – Ekstra felter',
                description: [
                    'Medicinsoversigten viser nu også "Maksimal dosis pr. administration" og "Beskrivelse".',
                    'For PN-medicin vises feltet "Maksimal dosis pr. administration" nu, som det gøres for almindelig medicin.',
                ],
            },
            {
                title: '⚠️ Konfiguration af advarsler – Vagtplan',
                description: [
                    'Det er nu muligt at deaktivere advarslerne for "13-timers vagt", "11-timers hviletidsregel" og "48-timers reglen" i vagtplanen.',
                ],
            },
            {
                title: '📌 Forbedringer af opslagstavlen',
                description: [
                    'Hvert opslag viser nu forfatter og tidsstempel (dato og klokkeslæt for oprettelsen).',
                    'Kun den oprindelige forfatter af et opslag eller en administrator kan redigere det.',
                    'Flere opslag kan nu fremhæves/fastgøres samtidigt.',
                    'Opslag på dashboardet vises nu i et listeformat med titel og et kort uddrag. Brugere kan klikke på et opslag for at se det fulde indhold.',
                ],
            },
            {
                title: '💊 PN-medicin – Effektvurdering',
                description: [
                    'Efter administration af PN-medicin kan brugere nu udføre en effektvurdering.',
                    'Klik på "Udfør effektvurdering" for at indtaste og gemme noter, resultat eller observationer.',
                    'Der kan udføres flere effektvurderinger for den samme medicinregistrering.',
                ],
            },
        ],
        '2026-04-10': [
            {
                title: 'Forbedringer af beskedsystem & sletning af chathistorik',
                description: [
                    'Beskedgrænsefladen er blevet opdateret med en forbedret brugergrænseflade.',
                    'Det er nu muligt at slette en hel chatsamtales historik direkte fra samtalelisten.',
                ],
            },
            {
                title: 'Afdelingskolonne i eksport af vagtplan',
                description: [
                    'Når en vagtplan eksporteres, er der nu inkluderet en "Afdeling"-kolonne i eksporten.',
                    '"Afdeling"-kolonnen er placeret før "Medarbejdernavn"-kolonnen.',
                ],
            },
            {
                title: '💸 Udgifter',
                description: [
                    'Der er tilføjet et borgerfelt til udgifter, så udgifter kan knyttes til en specifik borger.',
                    'Udgifter vises nu under afsnittet "Økonomi" på borgerprofilen i en dedikeret "Udgifter"-fane ved siden af den eksisterende "Lommepenge"-fane.',
                    'Udgifter kan nu redigeres efter afvisning.',
                    'Udgifter kan også redigeres efter udbetaling (udgift refunderet).',
                ],
            },
            {
                title: '🕒 Arbejdstidsjusteringer – Geo-lokationssporing',
                description: [
                    'Geo-lokation registreres nu ved start og afslutning af arbejdstid.',
                    'Der er ikke behov for kilometerregistrering – kun lokationen ved start og slut.',
                    'En grøn markør vises for startlokationen og en rød markør for slutlokationen.',
                ],
            },
            {
                title: '📌 Fastgørelse af journalnotater',
                description: [
                    'Det er nu muligt at fastgøre journalnotater på en borger.',
                    'Fastgjorte notater vises øverst på journalnotelisten og forbliver synlige uanset sortering eller filtrering.',
                    'Notater kan nemt fastgøres og frigøres, og der kan fastgøres flere notater på samme tid.',
                    'Dette hjælper personalet med at fremhæve vigtig eller kritisk information og forbedrer overblik og tilgængelighed.',
                ],
            },
            {
                title: '🔐 Sideadgang – Synlighed af vagtplan',
                description: [
                    'Der er tilføjet en mulighed for at skjule eller fjerne adgangen til "Vagtplan"-siden, svarende til håndteringen af andre sider.',
                    'Når siden er skjult, vises Vagtplan ikke i den venstre sidebjælke.',
                ],
            },
            {
                title: '👤 Oprettelse af borger og kontakter – Automatisk udfyldning ved postnummer',
                description: [
                    'Når der oprettes en borger, pårørende eller anden kontakt, vil indtastning af et postnummer nu automatisk udfylde felterne By, Region og Kommune.',
                ],
            },
            {
                title: 'Filtrer efter arkiverede/ikke-arkiverede medarbejdere ved eksport af vagtplan',
                description: [
                    'Det er nu muligt at filtrere efter arkiverede og/eller ikke-arkiverede medarbejdere ved eksport af vagtplaner.',
                ],
            },
            {
                title: '👤 Rettigheder til oprettelse af borgere',
                description: [
                    'Oprettelse af borgere er ikke længere forbeholdt administratorer.',
                    'En ny "Opret borger"-rettighed er blevet introduceret og kan tildeles alle roller – inkl. standardbrugerrollen – under "Roller" i kataloget.',
                    'Dette giver administratorer mulighed for at styre, hvilke brugere der må oprette borgere.',
                ],
            },
            {
                title: 'Stop kopiering fra aktuel position',
                description: [
                    'Det er nu muligt at stoppe en kopieringsproces fra den aktuelle position i vagtplanen.',
                    'Tidligere krævede stop af kopiering, at man navigerede tilbage til den oprindelige startdato. Dette er ikke længere nødvendigt.',
                ],
            },
            {
                title: '"Afspadsering" omdøbt til "Afspadsering i år"',
                description: [
                    'Etiketten "Afspadsering" er omdøbt til "Afspadsering i år" for større klarhed.',
                ],
            },
            {
                title: '📊 Forbedringer af tidsregistreringer',
                description: [
                    'Der er tilføjet et borgerfelt til tidsregistreringer, så registreringer kan knyttes til en specifik borger.',
                    'Tidsregistreringer vises nu på borgerprofilen.',
                    'Statistik, filtrering og eksport af tidsregistreringsdata er nu tilgængeligt svarende til funktionaliteten for interventionstimer.',
                ],
            },
            {
                title: '11-timers- og 48-timers-regel – Undtagelse for orlovstyper',
                description: [
                    'Ferie-, syge- og andre vagter markeret som "orlovstyper" tæller ikke længere med i 11-timers- og 48-timers-regelberegningerne.',
                    'Disse orlovsvagter kan stadig medregnes og beregnes i normtimerne.',
                    'Advarselsindikatoren er ændret til et advarselstrekant-ikon for at reducere visuel støj, da det tidligere optrådte for hyppigt.',
                ],
            },
            {
                title: '📤 Borgereksport pr. afdeling (Bosted & Krisecenter)',
                description: [
                    'For kategorierne "Bosted" og "Krisecenter" understøtter borgereksport nu filtrering og eksport af borgere pr. afdeling.',
                    'Hver afdelings data kan eksporteres separat, svarende til funktionen "Eksportér henvendelser".',
                ],
            },
            {
                title: 'Sletterettigheder for medarbejdere – Kalenderbegivenheder',
                description: [
                    'Medarbejdere har som udgangspunkt ikke længere tilladelse til at slette elementer, undtagen kalenderbegivenheder.',
                    'En dedikeret slette-rettighed for kalenderbegivenheder er tilføjet under roller og kan tildeles "Almindelig bruger"-rollen og andre roller.',
                ],
            },
            {
                title: '🎯 UI-forbedringer – Indikatorer og vagnotater i vagtplanen',
                description: [
                    'Grønne og røde indikatorer i vagtplanen har nu et hover-tooltip, der forklarer deres betydning.',
                    'Vagters bemærkninger/noter er nu tilgængelige via et hover-tooltip på et ikon, der vises direkte på vagten i vagtplanen.',
                ],
            },
            {
                title: 'Udvidelser af x-timer (merarbejde)',
                description: [
                    'Der er tilføjet en kolonne med navnet på den person, der har oprettet merarbejdstimer.',
                    'En afdelingskolonne og et tilsvarende felt er tilføjet til merarbejdstimer.',
                    'Merarbejdstimer er nu også inkluderet i vagtplankladder.',
                ],
            },
            {
                title: '⏱ Forbedringer af tidsregistrering',
                description: [
                    'Medarbejdere kan nu anmode om registrering af et glemt tjek-ind direkte i systemet.',
                    'Disse anmodninger skal gennemgås og godkendes af en administrator, før de registreres.',
                    'Administratorer kan nu redigere eksisterende tidsregistreringer.',
                ],
            },
        ],
        '2026-02-20': [
            {
                title: 'Oprettelse og redigering af dokumenter online',
                description: [
                    'Brugere kan nu oprette og redigere dokumenter direkte online i systemet.',
                    'Systemgenererede dokumenter kan downloades som PDF-filer.',
                    'Uploadede dokumenter (Word- og Pages-formater) kan også redigeres online.',
                    'Det er muligt at se dokumenter i skrivebeskyttet tilstand uden at aktivere redigering.'
                ],
            },
            {
                title: 'Overblik over afspadsering og ferietimer',
                description: [
                    'Medarbejdere kan nu se et overblik over afspadsering og ferietimer for en valgt periode.',
                    'Dette giver bedre gennemsigtighed og planlægning af tilgængelig frihed.'
                ],
            },
            {
                title: 'Automatisk fremhævning af opfølgning på borgerindberetninger',
                description: [
                    'Blanketter kan nu konfigureres til automatisk at fremhæve indsendte borgerindberetninger efter et angivet tidsrum, som medarbejderen selv angiver.',
                    'Fremhævede indberetninger vises i det generelle borgeroverblik, i Dagsoverblikket (i en dedikeret boks) samt på borgerens egen profilside.',
                    'Funktionen skal aktiveres af en administrator på den specifikke blanket, før den kan anvendes.'
                ],
            },
            {
                title: 'Konfigurerbart timetal for indsatsopfølgning',
                description: [
                    'Administratorer kan nu konfigurere antallet af timer for indsatsopfølgning i systemindstillingerne.',
                    'Standardværdien på 24 timer kan ændres til et valgfrit antal timer.'
                ],
            },
            {
                title: 'Tidsregistreringsfane for medarbejdere',
                description: [
                    'Der er tilføjet en dedikeret fane til tidsregistrering for medarbejdere.',
                    'Dette samler og forenkler registrering af arbejdstid.'
                ],
            },
            {
                title: 'AI-prompting med filvedhæftning og adgang til interne data',
                description: [
                    'AI-prompting understøtter nu vedhæftning af filer som en del af forespørgslen.',
                    'AI’en kan tilgå relevante interne systemdata (baseret på rettigheder) for at give mere præcise og kontekstuelle svar.'
                ],
            },
            {
                title: 'Tags på ekstra timer',
                description: [
                    'Det er nu muligt at tilføje tags til registreringer af ekstra timer.',
                    'Dette forbedrer kategorisering, filtrering og rapportering af merarbejde.'
                ],
            },
            {
                title: 'Brugerspecifikke e-mailsignaturer',
                description: [
                    'Brugere kan nu oprette og administrere deres egne e-mailsignaturer.',
                    'E-mailsignaturer kan konfigureres individuelt pr. bruger.'
                ],
            },
            {
                title: 'Grafisk visualisering af afspadsering',
                description: [
                    'Afspadsering visualiseres nu i en graf baseret på normtimer.',
                    'Grafen vises ved klik på afspadseringstimer under timeoversigten i den eksisterende pop-up.'
                ],
            },
            {
                title: 'Sammenkoblede årlige og ugentlige normtimer',
                description: [
                    'Der er tilføjet et nyt felt for ugentlige normtimer, som er koblet til feltet for årlige normtimer på medarbejderens opret/rediger-side.',
                    'Begge felter beregner og opdaterer automatisk hinanden baseret på et 52-ugers år.',
                    'Værdien for ugentlige normtimer vises også under de årlige normtimer i vagtplansvisningen.'
                ],
            },
            {
                title: 'Eksport baseret på filtreret vagtplansvisning',
                description: [
                    'Det er nu muligt at eksportere data baseret på de aktuelle filtre i vagtplansvisningen.',
                    'Brugere kan downloade den filtrerede visning, som den fremstår på skærmen.',
                    'Vagtplanen kan eksporteres i CSV-format med enten semikolon- eller komma-separerede værdier.'
                ],
            },
            {
                title: 'Markering af fraværsvagttyper og eksportmuligheder',
                description: [
                    'Vagttyper kan nu markeres som “fraværsvagttyper”.',
                    'Eksport kan konfigureres til kun at indeholde fraværsvagter, kun almindelige vagter eller begge typer samlet i én fil.'
                ],
            },
            {
                title: 'Adgang via adgangskodebeskyttet læselink',
                description: [
                    'Vagtplan og journal kan nu deles via et adgangskodebeskyttet link.',
                    'Modtageren kan se indholdet i skrivebeskyttet tilstand uden at logge ind i systemet.'
                ],
            },
            {
                title: 'Begrænsning af visning af historiske vagter',
                description: [
                    'Administratorer kan i indstillingerne konfigurere, om medarbejdere må se andre medarbejderes historiske vagter.',
                    'Uanset denne indstilling kan medarbejdere aldrig se andre medarbejderes timeregistreringer.'
                ],
            },
            {
                title: 'Forbedret datovælger i overblik',
                description: [
                    'Datovælgeren i overblikket giver nu mulighed for hurtigt at vælge mellem dags dato, de næste 7 dage eller et brugerdefineret datointerval.',
                    'Dette giver større fleksibilitet ved gennemgang af data.'
                ],
            },
            {
                title: 'Ferietilmelding med mulighed for afspadsering',
                description: [
                    'Ved registrering af ferie kan det markeres som afspadsering, både ved oprettelse og redigering.',
                    'Hvis feltet markeres, forbliver det markeret.',
                    'Hvis afspadsering markeres ved redigering efter oprettelse, justeres afspadseringssaldoen automatisk baseret på antallet af timer i ferievagten.'
                ],
            },
            {
                title: 'Angivelse af transport med henblik på refusion',
                description: [
                    'Medarbejdere kan angive, at de har benyttet transport og dermed har en udgift, der skal refunderes.',
                    'Dette sikrer korrekt registrering og håndtering af transportudgifter.'
                ],
            },
            {
                title: 'Lønkode / lønart pr. vagttype',
                description: [
                    'Hver vagttype kan nu indeholde en lønkode eller lønart.',
                    'Dette felt inkluderes i vagteksporter og lønrapporter for at sikre korrekt lønbehandling.'
                ],
            },
            {
                title: 'Notifikationer ved vagtrotation',
                description: [
                    'Medarbejdere modtager en notifikation, når en ny vagtrotation offentliggøres.',
                    'Der sendes også notifikationer, når der foretages ændringer i en eksisterende vagtrotation.'
                ],
            },
            {
                title: 'Fratrædelsesdato med automatisk deaktivering af adgang',
                description: [
                    'Et felt til fratrædelsesdato er tilgængeligt på medarbejderens opret-, rediger- og visningsside.',
                    'Når fratrædelsesdatoen nås, deaktiveres medarbejderens adgang automatisk.'
                ],
            },
            {
                title: 'Behandlinger påvirkes ikke af datovælger i overblik',
                description: [
                    'Sektionen “Behandlinger” påvirkes ikke længere af datovælgeren i overblikket.',
                    'Alle igangværende (aktive) behandlinger vises uanset valgt datointerval.'
                ],
            },
        ],
        '2026-01-30': [
            {
                title: 'Mulighed for at ændre label “Afdeling” i ordliste',
                description: [
                    'Brugere kan nu ændre label “Afdeling” i ordlisten.',
                    'Denne tilpasningsmulighed øger fleksibiliteten i terminologien på tværs af systemet.'
                ],
            },
            {
                title: 'Gem rapporter som udkast',
                description: [
                    'Brugere har nu mulighed for at gemme rapporter som udkast indenfor planer, mål og dokumenter.',
                    'Dette giver brugere mulighed for at komme tilbage, redigere deres udkast og derefter offentliggøre dem.'
                ],
            },
            {
                title: 'Afdelingsspecifikke tags',
                description: [
                    'Tags kan nu gøres afdelingsspecifikke, hvilket forbedrer kategorisering og filtrering baseret på afdelingens kontekst.',
                    'Dette sikrer bedre organisation og relevans af tags for hver afdeling.'
                ],
            },
            {
                title: 'Vis planer, mål og delmål i Dagoversigten',
                description: [
                    'Planer, mål og delmål vil nu blive vist i Dagoversigten, grupperet per borger.',
                    'Dette forbedrer den daglige gennemgangsproces, hvilket gør det nemmere at følge op på fremskridt for specifikke personer.'
                ],
            },
            {
                title: 'Vis tidsplan i Dagoversigten',
                description: [
                    'Tidsplaner vises nu i Dagoversigten.',
                    'Denne funktion giver et klarere og mere organiseret billede af dagens planlagte aktiviteter.'
                ],
            },
            {
                title: 'Angiv transportbrug til refusion',
                description: [
                    'Medarbejdere kan nu angive, at de har brugt transport og derfor har en udgift, der skal refunderes.',
                    'Denne funktion sikrer, at medarbejdere nemt kan rapportere transportudgifter til refusionsbehandling.'
                ],
            },
            {
                title: 'Lønskode / lønpostfelt pr. arbejdstype',
                description: [
                    'Et lønskode- eller lønpostfelt er blevet tilføjet pr. arbejdstype, og dette vil blive inkluderet i eksport og rapporter for arbejdstider.',
                    'Dette muliggør bedre lønbehandling og rapportering, hvilket sikrer korrekt lønudbetaling.'
                ],
            },
            {
                title: 'Afslutningsdato-felt for medarbejderregistre',
                description: [
                    'Et afslutningsdato-felt er blevet tilføjet til oprettelse, redigering og visning af medarbejderformularer.',
                    'Når afslutningsdatoen nås, vil medarbejderens adgang automatisk blive deaktiveret, hvilket sikrer rettidig og sikker adgangskontrol.'
                ],
            },
        ],
        '2026-01-23': [
            {
                title: 'Begrænsninger for redigering af journalnoter',
                description: [
                    'Almindelige medarbejdere kan nu kun redigere deres egne journalnoter, og kun inden for 24 timer efter oprettelse.',
                    'Efter 24-timers perioden kan kun administratorer redigere journalnoter for at sikre sporbarhed og stærkere styring af indhold.'
                ],
            },
            {
                title: 'Optimeret ydelse for medicinoverblik',
                description: [
                    'Medicinoverblikket er blevet optimeret for hurtigere indlæsning og bedre respons, især ved større datamængder.',
                    'Overblikket henter og viser nu pålideligt hele listen af lægemidler for at understøtte komplet planlægning og gennemgang.'
                ],
            },
            {
                title: 'Adgangsbegrænsning mellem afdelinger',
                description: [
                    'Brugere er nu begrænset til kun at kunne se data for deres tildelte afdeling(er).',
                    'Adgang på tværs af afdelinger (fx at en bruger fra Afdeling A kan se Afdeling B, C, D) er ikke længere tilladt, hvilket styrker privatliv og adgangskontrol.'
                ],
            },
            {
                title: 'Opdateret UI for Glemt adgangskode, Nulstil adgangskode og Opsæt adgangskode',
                description: [
                    'Siderne til glemt adgangskode, nulstil adgangskode og opsæt adgangskode er blevet opdateret, så de matcher det opfriskede login-UI.',
                    'Forbedringerne omfatter ensartet layout, afstande og komponent-styling for en renere og mere sammenhængende oplevelse på tværs af enheder.'
                ],
            },
            {
                title: 'Datofilter tilføjet til overblikket',
                description: [
                    'Et nyt datofilter er blevet tilføjet til overblikket for at gøre planlægning og gennemgang efter tidsperiode enklere.',
                    'Brugere kan nu filtrere efter I dag, Næste 7 dage eller et Brugerdefineret datointerval.'
                ],
            },
        ],
        '2026-01-16': [
            {
                title: 'UI-opdateringer til Login, Opret bruger og Glemt adgangskode',
                description: [
                    'Login-, opret bruger- og glemt adgangskode-siderne er blevet opdateret med et nyt og mere ensartet design.',
                    'Forbedret layout, afstande og komponent-styling gør det nemmere at gennemføre login-flowet på tværs af enheder.'
                ],
            },
            {
                title: 'Detaljerede rettigheder for roller i Katalog',
                description: [
                    'Det er nu muligt at tildele specifikke rettigheder i rolleområdet under Katalog, så adgang kan styres mere præcist.',
                    'For eksempel kan du oprette en rolle som “Vagtplanskoordinator”, der kun har adgang til vagtplanen (og ikke andre områder).',
                    'Løsningen understøtter flere rolletyper og kombinationer af rettigheder efter behov.'
                ],
            },
            {
                title: '“Sugetabletter” tilføjet til listen over “Doseringsform”',
                description: [
                    'Muligheden “Sugetabletter” er tilføjet til listen “Doseringsform” i medicinens opret-/redigeringsformular.',
                    'Dette giver bedre understøttelse af administration af doseringsformer i systemet.'
                ],
            },
            {
                title: 'Download medicinoverblik fra medicinkort',
                description: [
                    'Der er tilføjet en ny mulighed på medicinkortet til at downloade et medicinoverblik.',
                    'Overblikket indeholder al medicin samt planlagte administrationstidspunkter, så det er nemt at dele og dokumentere.'
                ],
            },
            {
                title: 'Medicinadministration på faste ugedage',
                description: [
                    'Medicinplaner kan nu opsættes til administration på faste ugedage (fx mandag, onsdag og fredag).',
                    'Det giver større fleksibilitet til gentagelser, der ikke følger et dagligt mønster.'
                ],
            },
            {
                title: 'Kladde- og publicerede versioner af vagtplaner',
                description: [
                    'Vagtplaner understøtter nu kladde- og publicerede versioner, så ændringer kan forberedes før de går live.',
                    'Administratorer kan gennemgå og justere kladder, og først derefter publicere for en mere kontrolleret udrulning.'
                ],
            },
            {
                title: 'Adgang til børneprofiler',
                description: [
                    'Der er tilføjet understøttelse af adgang til børneprofiler, så relevante brugere kan tilgå og administrere børneprofiler efter tilladelser.',
                    'Det forbedrer arbejdsgangen for organisationer, der håndterer planlægning og omsorg for børn, samtidig med at adgangskontrol bevares.'
                ],
            },
            {
                title: 'Beskeder – læsekvittering',
                description: [
                    'Beskeder understøtter nu læsekvittering, så afsender kan se, hvornår en besked er blevet læst.',
                    'Det giver bedre overblik i kommunikationen og reducerer behovet for manuelle opfølgninger.'
                ],
            },
        ],
        '2026-01-09': [
            {
                title: 'Gentagende begivenheder i kalenderen',
                description: [
                    'Når en enkelt begivenhed redigeres, vil systemet nu bede brugeren vælge, om ændringerne skal anvendes kun til denne begivenhed eller alle fremtidige begivenheder.',
                    'Denne funktionalitet giver mere fleksibilitet og kontrol over gentagende begivenheder.'
                ],
            },
            {
                title: 'Automatisk gentagende uge rotation i vagtplanen',
                description: [
                    'Administratorer kan nu oprette automatisk gentagende uge rotationer i vagtplanen, såsom en 8-ugers rotation, der gentages, indtil den stoppes manuelt.',
                    'Systemet vil bede administratorer om at vælge, om redigeringen kun skal gælde denne vagt eller hele den gentagende mønster, når en vagt redigeres i en gentagende rotation.'
                ],
            },
            {
                title: 'Mulighed for at søge efter en specifik dag i vagtplanen og kalenderen',
                description: [
                    'Brugere kan nu søge efter en specifik dag i vagtplanen og kalenderen, hvilket muliggør mere præcis navigation uden at skulle rulle uge for uge.',
                    'Denne forbedring inkluderer også muligheden for at navigere efter måned.'
                ],
            },
            {
                title: 'Filtermuligheder i vagtplaner',
                description: [
                    'Vagtplanoversigten inkluderer nu filtermuligheder for at vælge én eller flere medarbejdere.',
                    'Der er også tilføjet filtre for ansættelsesstatus, hvilket giver mere skræddersyet planlægning og klarhed.'
                ],
            },
            {
                title: 'Visning af medarbejderes vagter på tværs af afdelinger',
                description: [
                    'Brugere kan nu slå synligheden af vagter på tværs af afdelinger til for alle medarbejdere.',
                    'Denne funktion er kun tilgængelig, hvis flere afdelinger er oprettet i organisationen.'
                ],
            },
            {
                title: 'Forbedringer i håndtering af flerdagsvagter',
                description: [
                    'Når der oprettes vagter, der strækker sig over flere dage, vil systemet nu automatisk opdele dem i separate vagter for hver dag.',
                    'En visuel forbindelse, såsom en linje eller start/slut tekst, vil blive tilføjet for at angive kontinuiteten af vagten på tværs af dage.'
                ],
            },
            {
                title: 'Forbedringer i vagtoprettelsesflow',
                description: [
                    'Vagtoprettelsesflowet er blevet optimeret: Brugeren skal først vælge vagtens type, før de øvrige displaymuligheder vises.',
                    'Afdelingsfeltet er nu automatisk udfyldt med den valgte afdeling som standard, men kan ændres under oprettelsesprocessen.'
                ],
            },
            {
                title: 'Husk valgt afdeling i topbaren',
                description: [
                    'Når en afdeling er valgt i topbaren, vil den forblive valgt til fremtidige handlinger, indtil den ændres.',
                    'Dette strømliner processen for administratorer og planlæggere, der arbejder inden for en specifik afdeling.'
                ],
            },
            {
                title: 'Oprette brugerdefinerede jobtitler under "Kontakter" på borgere',
                description: [
                    'Administratorer kan nu oprette brugerdefinerede jobtitler under "Kontakter" sektionen for borgere.',
                    'Dette hjælper med at spore specifikke roller eller titler inden for organisationen.'
                ],
            },
            {
                title: 'Fastgør dig selv i vagtplanen',
                description: [
                    'Brugere kan nu fastgøre sig selv i vagtplanen for at sikre, at de altid vises øverst på listen.',
                    'Denne funktion hjælper brugerne med nemt at identificere deres vagter, især i store teams.'
                ],
            },
            {
                title: 'Ferieplanlægning og vagtudskiftning',
                description: [
                    'Når en medarbejder opretter en ferieanmodning, vil eventuelle eksisterende vagter automatisk blive fjernet og tilbudt andre til at erstatte, på samme måde som ved sygefravær.'
                ],
            },
            {
                title: 'Optimering af vagtshift-tilbud',
                description: [
                    'Vagtshift-tilbud er blevet optimeret til kun at vise vagter, der er relevante for den tildelte afdeling.',
                    'Et jobtitel-felt gør det nu muligt at tilføje flere titler, og nattevagter, der strækker sig over flere dage, kan nu tilbydes som én vagt.'
                ],
            },
            {
                title: 'Kalenderafdelingsfilter',
                description: [
                    'Begivenheder i kalenderen vil nu blive filtreret efter den valgte afdeling, så brugerne kun ser begivenheder, der er relevante for deres afdeling.',
                    'Starttiden for begivenheder vil automatisk blive sat til 1 time senere end starttiden, indtil den justeres manuelt.',
                    'Medarbejderfeltet på en begivenhed vil nu kun vise medarbejdere fra den valgte afdeling.'
                ],
            },
            {
                title: 'Inklusion af rolle i eksportfiler',
                description: [
                    'Når medarbejdere eksporteres, vil rolle-feltet nu blive inkluderet i eksportfilen.',
                    'Dette sikrer, at de eksporterede data inkluderer de roller, der er tilknyttet hver medarbejder.'
                ],
            },
            {
                title: 'Tilføjelse af "Sugetabletter" til "Dosage form" listen',
                description: [
                    'Muligheden for "Sugetabletter" er blevet tilføjet til "Dosage form" listen i oprettelse og redigering af medicinformularer.',
                    'Dette muliggør bedre håndtering af doseringsformer i systemet.',
                    'Håndtering af doseringsform er også tilgængelig i katalogindstillingerne.'
                ],
            },
            {
                title: 'Rettigheder i katalogroller',
                description: [
                    'Det er nu muligt at tildele specifikke rettigheder i rollerområdet for opgaver som at administrere vagtplanen, hvilket giver mere detaljeret kontrol over brugeradgang.',
                    'For eksempel kan en "Duty Shift Coordinator"-rolle oprettes med begrænset adgang kun til vagtplanen.'
                ],
            }
        ],
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
    },
    no: {
        '2026-05-15': [
            {
                title: '🔁 Forbedringer av maler og kopiering',
                description: [
                    'Det er nå mulig å kopiere kortere kildeuker inn i flere påfølgende fremtidige uker når du oppretter en vaktplanmal.',
                    'Eksempel: Kopier 1 uke inn i 2, 3, 4 (eller flere) påfølgende uker.',
                ],
            },
            {
                title: '📝 Dynamiske journalnotatfelter basert på tittel',
                description: [
                    'Journalnotater støtter nå dynamiske, forhåndsdefinerte felter basert på den valgte journalnotattittelen.',
                    'Når en bruker velger en journalnotattittel, viser systemet automatisk relevante felter/spørsmål knyttet til den tittelen.',
                    'Hvert felt tillater inndata (f.eks. notater, svar, observasjoner).',
                    'Disse feltene kan konfigureres på forhånd via en katalog eller innstillinger.',
                ],
            },
            {
                title: '📅 Kalenderhendelse – journalnotat og fullføringsstatus',
                description: [
                    'Det er nå mulig å opprette et journalnotat direkte fra en kalenderhendelse ved å klikke på hendelsen og velge "Opprett journalnotat".',
                    'Hendelsestittelen kopieres automatisk inn i journalnotatet.',
                    'Etter at notatet er skrevet, lenker kalenderhendelsen til journalnotatet, og journalnotatet lenker tilbake til kalenderhendelsen.',
                    'Det er nå mulig å markere en hendelse som "Fullført" eller "Ikke fullført".',
                    'Når et av alternativene velges, vises en popup som spør: "Vil du skrive et journalnotat om dette?" med alternativene "Ja" og "Nei".',
                    'Hvis man fortsetter med et journalnotat, er det et alternativ for å kopiere notatet til en relatert plan, mål eller delmål.',
                    'Statistikk som viser antall ganger elementer er markert som "Fullført" versus "Ikke fullført" er nå tilgjengelig for en gitt periode.',
                ],
            },
            {
                title: '🧩 Roller og tillatelser',
                description: [
                    'Koordinatorrollen og roller generelt er gjennomgått og forbedret slik at administratorer ikke lenger trenger å tildele fulle administratorrettigheter unødvendig.',
                    'En tydelig oversikt og forklaring av hvordan spesifikke tillatelser fungerer er nå tilgjengelig.',
                    'Det er nå mulig å definere et rollehierarki (f.eks. Administrator har høyere rettigheter enn Leder).',
                    'Spesialiserte domenespesifikke roller kan nå opprettes (f.eks. "Medisinansvarlig") for å kontrollere tilgang til spesifikke moduler eller funksjoner.',
                    'Flere roller kan nå tildeles en enkelt ansatt (flervalg), og systemet kombinerer tillatelser fra alle tildelte roller.',
                ],
            },
            {
                title: '📋 Oversiktsside for journalnotater',
                description: [
                    'Funksjonen "Se siste / alle journalnotater" åpner nå en dedikert side der alle journalnotater kan vises på ett sted.',
                    'Tilgang til journalnotater respekterer den eksisterende tillatelsesstrukturen: brukere ser kun notater fra borgere i sine avdelinger.',
                    'Administratorroller kan se alle journalnotater på tvers av hele organisasjonen.',
                    'Det er nå mulig å filtrere journalnotater globalt etter borger, avdeling, tagger og andre relevante filtre.',
                ],
            },
            {
                title: '📆 iCal / CalDav – Abonner på kalender',
                description: [
                    'Det er nå mulig å abonnere på CitizenOne-kalenderen via iCal / CalDav.',
                    'Dette lar brukere se sine CitizenOne-kalenderhendelser i eksterne kalenderapplikasjoner.',
                ],
            },
            {
                title: '📋 Oppholdsdata – Samtykkeerklæringer',
                description: [
                    'I oppholdsdataskjemaet er det nå mulig å velge samtykkeerklæringer med Ja / Nei-alternativer for: Foto, Foreldresamarbeid, Studentsamarbeid og Generelt samtykke.',
                    'Egendefinerte samtykkeerklæringstyper kan opprettes i katalogen.',
                    'Det er nå mulig å angi Personlig vergemål (Ja / Nei) og Økonomisk vergemål (Ja / Nei).',
                ],
            },
            {
                title: '🏥 De 12 sykepleieområdene – Status og maler',
                description: [
                    'Ved oppdatering av statusen for et sykepleieområde er det nå mulig å velge: Ikke et aktivt problem, Potensielt problem eller Aktivt problem.',
                    'Maler kan nå brukes for sykepleieområder og definere hvilke felter brukere må fylle ut (obligatorisk eller valgfritt).',
                    'Ved opprettelse eller oppdatering av et sykepleieområde kan relaterte områder vises i et sidepanel – på samme måte som planer og mål vises ved oppretting av et journalnotat.',
                ],
            },
            {
                title: '💊 Behandlinger – Forbedringer og UX-forbedringer',
                description: [
                    'Maler kan nå brukes for behandlinger og definere hvilke felter brukere må fylle ut (obligatorisk eller valgfritt).',
                    'Feltet "Fullført" ("Afsluttet") er omdøpt til "Marker som fullført" ("Markér som afsluttet").',
                    'Det er nå tydeligere visuelt hvilke behandlinger som er aktive (pågående) versus fullførte, gjennom tydelige UI-indikatorer (f.eks. etiketter, farger eller statusmerker).',
                    'Hovedoversikten/dashbordet inkluderer nå sammendragswidgeter som "10 aktive behandlinger", som brukere kan klikke på for å se listen.',
                    'Hvis behandlinger opprettes innenfor et bestemt sykepleieområde, er det nå en direkte lenke fra sykepleieområdet til disse behandlingene.',
                ],
            },
            {
                title: '🌍 Norsk og svensk språkstøtte',
                description: [
                    'Norske og svenske språkalternativer er nå tilgjengelige i CitizenOne.',
                    'Brukere kan bytte til norsk (Norsk) eller svensk (Svenska) i språkinnstillingene.',
                ],
            },
        ],
        '2026-05-08': [
            {
                title: '📇 Firmakontakter og adressebok',
                description: [
                    'Firmakontakter kan nå opprettes på samme måte som borgerkontakter.',
                    'Alle kontakter (f.eks. leger, saksbehandlere osv. – ikke pårørende) lagres nå sentralt i systemet slik at de kan gjenbrukes og tildeles flere borgere.',
                    'En firmaomfattende adressebok er introdusert der kontakter lagres sentralt og kan velges ved behov.',
                ],
            },
            {
                title: '⚙️ Konfigurasjon av vakttyper',
                description: [
                    'Under Vakttyper er det nå mulig å definere at 1 arbeidstime tilsvarer 0,75 timer (valgfritt), og denne regelen kan også brukes innenfor et bestemt tidsintervall.',
                    'For "Sovende nattevakt" er det nå mulig å definere en standard sluttid som er 1, 2 eller flere dager senere.',
                ],
            },
            {
                title: '📅 Vaktplan – Års- og halvårskalendervisning',
                description: [
                    'En års- og halvårskalendervisning er lagt til vaktplanen.',
                    'Visningen kan vises per enkeltansatt og viser deres tildelte vakter og en oversikt over tid.',
                ],
            },
            {
                title: '💊 Medisinnotater – Informasjonsikon',
                description: [
                    'Et informasjonsikon ("i") er lagt til for medisinnotater.',
                    'Når man holder musen over ikonet, vises den tilhørende merknaden for medisinen.',
                    'Eksempel: "Skal ikke administreres hvis pasienten er påvirket av kokain."',
                ],
            },
            {
                title: '🤖 AI-bruksmerke på journalnotater',
                description: [
                    'Systemet registrerer nå når AI-assistenten har blitt brukt til å opprette eller bistå med et journalnotat.',
                    'Et merke vises på journalnotatet som indikerer at AI-assistenten ble brukt.',
                    'Merket viser: "CitizenOne AI ble brukt".',
                ],
            },
            {
                title: '🔐 Innloggingsbegrensning etter IP / enhet',
                description: [
                    'Administratorer kan nå begrense innloggingstilgang basert på IP-adresse og/eller enhet.',
                    'Spesifikke IP-adresser (f.eks. kontornettverket) kan hvitelistes.',
                    'Eventuelt kan tilgangen begrenses til godkjente enheter.',
                    'Brukere utenfor tillatte IP-adresser/enheter vil bli blokkert eller måtte fullføre ekstra verifisering.',
                    'Denne funksjonen øker sikkerheten og sikrer tilgang kun fra pålitelige miljøer.',
                ],
            },
            {
                title: '🎄 Helligdag- og søndagsbetalingsregler',
                description: [
                    'På helligdager gjelder et standardeksempel: 08:00 – 15:24 = 7,4 timer.',
                    'På søndager må ansatte motta 1,5× timene sine.',
                    'Hvis en ansatt arbeider på søndag eller helligdag, mottar de vakttimer × 1,5.',
                ],
            },
        ],
        '2026-05-01': [
            {
                title: 'Tillegg til ekstratimer (X-timer)',
                description: [
                    'En ny kolonne er lagt til som viser navnet på personen som opprettet ekstratime-oppføringen.',
                    'En ny kolonne og tilhørende felt for avdelinger er lagt til ekstratimer.',
                    'Ekstratimer er nå også synlige i utkast til vaktplaner.',
                ],
            },
            {
                title: '⏱ Forbedringer av tidsregistrering',
                description: [
                    'Ansatte kan nå be om registrering av en glemt innsjekking.',
                    'Disse forespørslene må godkjennes av en administrator før de registreres.',
                    'Administratorer kan nå redigere eksisterende tidsloggoppføringer.',
                ],
            },
            {
                title: '💊 Forbedringer av medisinoversikt',
                description: [
                    'Antall tabletter / dosering vises nå tydelig og fremtredende for hver medisin.',
                    'Medisinoversikten skiller nå tydelig mellom PN- (ved behov) medisin og vanlig (planlagt) medisin.',
                    'Filtreringsalternativer er lagt til: vis alle medisiner, kun PN-medisin eller kun vanlig medisin.',
                    'Det er nå mulig å sortere kolonner i medisinoversikten alfabetisk (f.eks. etter medisinnavn) og numerisk (f.eks. etter dosering).',
                    'Det er nå mulig å se alle medisiner samtidig, i stedet for å være begrenset til 10 oppføringer per side.',
                ],
            },
            {
                title: '👥 Tildeling av ansattgrupper til borgere',
                description: [
                    'Det er nå mulig å tildele en ansattgruppe til en borger, og omvendt – fra ansattgruppen tildele én eller flere borgere; fra borgerprofilen tildele én eller flere ansattgrupper.',
                    'Når en ansattgruppe tildeles en borger, blir alle ansatte i den gruppen automatisk tildelt borgeren.',
                    'Denne tildelingen oppfører seg på samme måte som å tildele en ansatt direkte via "Tildelte borgere" eller tildele en kontakt via "Kontakter" på borgeren.',
                    'Forholdet holdes synkronisert: hvis en ansatt legges til eller fjernes fra gruppen, oppdateres borgertildelingen automatisk.',
                    'Hvis en ansattgruppe fjernes fra en borger, fjernes alle tilknyttede ansatte også (med mindre de er tildelt manuelt andre steder).',
                ],
            },
            {
                title: '📥 Eksportfunksjonalitet for behandlinger',
                description: [
                    'Det er nå mulig å laste ned/eksportere behandlinger sammen med statusen deres, tilsvarende eksisterende eksport av medisinhistorikk.',
                    'Eksporten inkluderer behandlingsdetaljer og gjeldende status (f.eks. aktiv, fullført osv.).',
                ],
            },
            {
                title: '📩 Forbedringer av henvendelser (Henvendelser)',
                description: [
                    'Henvendelser kan nå tildeles en avdeling, på samme måte som det fungerer for borgere.',
                    'Et nytt "Avdeling"-felt er lagt til i henvendelsesskjemaet.',
                    'På Henvendelser-siden er det nå mulig å filtrere henvendelser etter avdeling og eksportere henvendelser per avdeling.',
                    'Henvendelseskategoriene "Herberger og forsorgshjem" og "Krisecenter" kan nå gis nytt navn i Innstillinger → Annet → Ordliste (f.eks. til §110 og §109).',
                    'Feltene "Navn på spørger" og "Dato for henvendelser" kan nå gis nytt navn i Innstillinger → Annet → Ordliste.',
                    'Feltene "Egne notater" og "Formål" kan nå fjernes via Innstillinger → Annet → Ordliste.',
                ],
            },
            {
                title: '💊 Medisin – Visning av handelsnavn',
                description: [
                    'Handelsnavnet på en medisin (f.eks. Panodil) vises nå tydelig sammen med eller som en del av medisininformasjonen.',
                ],
            },
            {
                title: '🔔 Påminnelser og oppgaveliste',
                description: [
                    'Det er nå tydeligere synlig om en påminnelse er markert som "Fullført".',
                    'En logg er lagt til som viser hvilken bruker som fullførte en påminnelse.',
                    'Påminnelsesfunksjonen fungerer nå som en fullstendig oppgaveliste, inspirert av Apples Påminnelser-app.',
                    'En påminnelsesoversikt er lagt til på dashbordet/hjemmesiden.',
                ],
            },
            {
                title: '🔁 Vaktplanmal – Kopier på tvers av flere uker',
                description: [
                    'Det er nå mulig å kopiere kortere kildeuker inn i flere påfølgende fremtidige uker når du oppretter en vaktplanmal.',
                    'Eksempel: kopier 1 uke inn i 2, 3, 4 eller flere påfølgende uker.',
                ],
            },
            {
                title: '📇 Firmakontakter og adressebok',
                description: [
                    'Firmakontakter kan nå opprettes på samme måte som borgerkontakter.',
                    'Alle kontakter (f.eks. leger, saksbehandlere osv. – ikke pårørende) lagres nå sentralt i systemet slik at de kan gjenbrukes og tildeles flere borgere.',
                    'En firmaomfattende adressebok er introdusert der kontakter lagres sentralt og kan velges ved behov.',
                ],
            },
            {
                title: '🔐 Innloggingsbegrensning etter IP / enhet',
                description: [
                    'Administratorer kan nå begrense innloggingstilgang basert på IP-adresse og/eller enhet.',
                    'Spesifikke IP-adresser (f.eks. kontornettverket) kan hvitelistes.',
                    'Eventuelt kan tilgangen begrenses til godkjente enheter.',
                    'Brukere utenfor tillatte IP-adresser/enheter vil bli blokkert eller måtte fullføre ekstra verifisering.',
                ],
            },
            {
                title: '⚙️ Konfigurasjon av vakttyper',
                description: [
                    'Under Vakttyper er det nå mulig å definere at 1 arbeidstime tilsvarer 0,75 timer (valgfritt), og denne regelen kan også brukes innenfor et bestemt tidsintervall.',
                    'For "Sovende nattevakt" er det nå mulig å definere en standard sluttid som er 1, 2 eller flere dager senere.',
                ],
            },
            {
                title: '🧩 Roller og tillatelser',
                description: [
                    'Koordinatorrollen og roller generelt er gjennomgått og forbedret slik at administratorer ikke lenger trenger å tildele fulle "Administrator"-rettigheter unødvendig.',
                    'En tydelig oversikt og forklaring av hvordan spesifikke tillatelser fungerer er gitt.',
                    'Det er nå mulig å definere et rollehierarki (f.eks. Administrator har høyere rettigheter enn Leder).',
                    'Spesialiserte domenespesifikke roller kan nå opprettes (f.eks. "Medisinansvarlig") for å kontrollere tilgang til spesifikke moduler.',
                    'Flere roller kan nå tildeles en enkelt ansatt (flervalg), og systemet kombinerer tillatelser fra alle tildelte roller.',
                ],
            },
            {
                title: '📅 Vaktplan – Års- og halvårsvisning per ansatt',
                description: [
                    'En års- og halvårskalendervisning er lagt til vaktplanen.',
                    'Visningen kan vises per enkeltansatt og viser deres tildelte vakter og en oversikt over tid.',
                ],
            },
        ],
        '2026-04-24': [
            {
                title: '🏷 Tagger og filtrering – Utkast til vaktplan',
                description: [
                    'Tagger er nå synlige ved kopiering av vakter i utkastet til vaktplanen.',
                    'Utkastet oppfører seg nå identisk med den publiserte planen, inkludert tagger og filtreringsfunksjonalitet.',
                ],
            },
            {
                title: '📢 Åpne vakter i utkast',
                description: [
                    'Det er nå mulig å opprette en åpen vakt direkte i utkastet til vaktplanen, tilsvarende oppførselen i den utvidede utkastvisningen.',
                    'Vakten publiseres og utløser varsler først når utkastet offisielt frigis.',
                ],
            },
            {
                title: '🔔 Nyheter og oppdateringer – Varslingsteller',
                description: [
                    'Varslingstelleren for "Nyheter" og "Oppdateringer" tilbakestilles nå umiddelbart etter at brukeren har vist den.',
                    'Denne tilbakestillingen skjer hver gang brukeren åpner "Nyheter" eller "Oppdateringer".',
                ],
            },
            {
                title: 'Avdelingskolonne i vaktplaneksporter',
                description: [
                    'Ved eksport av en vaktplan inkluderes en "Avdeling"-kolonne og plasseres før "Ansattnavn"-kolonnen.',
                ],
            },
            {
                title: 'Vaktplansortering – ansatte på vakt i dag',
                description: [
                    'Når veksleren "på vakt i dag" er aktivert, sorteres ansatte nå med dem hvis vakt starter tidligst først.',
                ],
            },
            {
                title: '📍 Innsjekking av ansatte – Geolokasjon',
                description: [
                    'Geolokasjon fanges nå opp når ansatte sjekker inn.',
                    'Systemet registrerer plasseringen (breddegrad/lengdegrad) ved innsjekking.',
                    'Plasseringen kan eventuelt vises på en kartvisning.',
                ],
            },
            {
                title: '📧 Apper – Aktivering av Mail',
                description: [
                    'Når "Mail"-appen aktiveres, lastes siden nå automatisk på nytt slik at Mail-modulen umiddelbart blir synlig i venstre sidemeny.',
                ],
            },
            {
                title: 'Fordeling av vakttyper',
                description: [
                    'Fordelingen av vakttyper kan nå filtreres etter start- og sluttdato/-tid og etter ansatt.',
                ],
            },
            {
                title: '🏠 Forbedringer av romadministrasjon',
                description: [
                    'Det er nå mulig å gi nytt navn til etiketten "Rom" i ordlisten.',
                    'En ordentlig oversikt over rom og deres tilgjengelighet er nå tilgjengelig.',
                    'Opptatte rom kan ikke lenger velges – kun tilgjengelige rom kan velges.',
                ],
            },
            {
                title: '⏱ Flerdagsvakter',
                description: [
                    'Vakter som strekker seg over flere dager (2–3 dager eller mer) behandles nå som én sammenhengende vakt.',
                    'Ingen advarsler utløses for regelen om maksimalt 13-timers vakt eller 11-timers hvileperiode for slike vakter.',
                ],
            },
            {
                title: '🩺 Godkjenning av sykefravær og ferie',
                description: [
                    'Administratorer må nå godkjenne sykefravær- og ferieforespørsler sendt inn av ansatte via vaktplanen før de registreres.',
                ],
            },
            {
                title: '💊 Medisin – Planlagt periode og ekstradager',
                description: [
                    'Det er nå mulig å planlegge medisinadministrasjon over en spesifisert periode, i stedet for å kreve daglig administrasjon.',
                    'Det er også mulig å legge til individuelle ekstra medisindager på bestemte datoer.',
                    'Eksempel: et barn som vanligvis deltar i helgene, kan få medisin lagt til for en bestemt ekstra ukedag uten å endre den vanlige planen.',
                ],
            },
            {
                title: '💊 Medisinadministrasjon – Fleksibel registrering',
                description: [
                    'Det er nå mulig å administrere, registrere og markere avvik for medisin mye mer fleksibelt.',
                ],
            },
            {
                title: '💊 Medisin-UI – Flere administrasjonstider',
                description: [
                    'Medisin-UI støtter nå visning av flere administrasjonstider for en enkelt medisin.',
                    'Hver medisinoppføring viser tydelig alle planlagte tider (f.eks. morgen, middag, kveld, natt eller spesifikke tidsstempler).',
                    'Tider er visuelt gruppert under samme medisin slik at det er tydelig at de tilhører samme resept.',
                ],
            },
            {
                title: '💊 PN-medisin – Ingen fast administrasjonstid',
                description: [
                    'PN-medisin (ved behov) har ikke lenger en fast administrasjonstid, da den gis basert på behov.',
                ],
            },
            {
                title: '💊 Medisinbeholdning – Fiks for lagerberegning',
                description: [
                    'Problemer med feil beregning av medisinlager er undersøkt og løst.',
                    'Lagernivåer gjenspeiler nå alltid nøyaktige mengder basert på registreringer.',
                    'Lagerverdier kan ikke lenger falle under null.',
                ],
            },
            {
                title: '💊 Medisin – Visning av dato og tid',
                description: [
                    'Administrasjonsdatokolonnen for både vanlig og PN-medisin inkluderer nå også det eksakte administrasjonstidspunktet.',
                ],
            },
            {
                title: '💊 Medisinoversikt – Tilleggsfelter',
                description: [
                    'Medisinoversikten viser nå også "Maksimal dose per administrasjon" og "Beskrivelse".',
                    'For PN-medisin vises nå feltet "Maksimal dose per administrasjon", i samsvar med vanlig medisin.',
                ],
            },
            {
                title: '⚠️ Konfigurasjon av advarsler – Vaktplan',
                description: [
                    'Det er nå mulig å deaktivere advarslene "13-timers vakt", "11-timers hvileregel" og "48-timers regel" i vaktplanen.',
                ],
            },
            {
                title: '📌 Forbedringer av oppslagstavle',
                description: [
                    'Hvert innlegg viser nå forfatter og tidsstempel (dato og tidspunkt for opprettelse).',
                    'Kun den opprinnelige forfatteren av et innlegg eller en administrator kan redigere det.',
                    'Flere innlegg kan nå fremheves/festes samtidig.',
                    'Innlegg på dashbordet vises nå i listeformat med tittel og kort forhåndsvisning. Brukere kan klikke på et innlegg for å se hele innholdet.',
                ],
            },
            {
                title: '💊 PN-medisin – Effektevaluering',
                description: [
                    'Etter administrering av PN-medisin (ved behov) kan brukere nå utføre en effektevaluering.',
                    'Klikk "Utfør effektevaluering" for å skrive inn og lagre notater, resultat eller effektobservasjoner.',
                    'Flere effektevalueringer kan utføres for samme medisinoppføring.',
                ],
            },
        ],
        '2026-04-10': [
            {
                title: 'Forbedringer av meldings-UI og sletting av chathistorikk',
                description: [
                    'Meldingsgrensesnittet er oppdatert med et forbedret UI for bedre brukeropplevelse.',
                    'Det er nå mulig å slette en hel meldings-chathistorikk direkte fra samtalelisten.',
                ],
            },
            {
                title: 'Avdelingskolonne i vaktplaneksporter',
                description: [
                    'Ved eksport av en vaktplan inkluderes nå en "Avdeling"-kolonne i eksporten.',
                    'Avdelingskolonnen er plassert før "Ansattnavn"-kolonnen.',
                ],
            },
            {
                title: '💸 Utgifter',
                description: [
                    'Et borgerfelt er lagt til utgifter, som lar utgifter knyttes til en bestemt borger.',
                    'Utgifter vises nå under "Økonomi"-seksjonen på borgerprofilen, i en egen "Utgifter"-fane sammen med den eksisterende "Lommebøker"-fanen.',
                    'Utgifter kan nå redigeres etter avvisning.',
                    'Utgifter kan også redigeres etter refusjon (utgift utbetalt).',
                ],
            },
            {
                title: '🕒 Justeringer av arbeidstid – Geolokasjonssporing',
                description: [
                    'Geolokasjon fanges nå opp når man starter og avslutter arbeidstid.',
                    'Ingen kilometersporing er nødvendig – kun plasseringen ved start og slutt.',
                    'En grønn markør vises for startplasseringen og en rød markør for sluttplasseringen.',
                ],
            },
            {
                title: '📌 Feste journalnotater',
                description: [
                    'Det er nå mulig å feste journalnotater på en borger.',
                    'Festede notater vises øverst i journalnotatlisten og forblir synlige uavhengig av sortering eller filtrering.',
                    'Notater kan enkelt festes og løsnes, og flere notater kan festes samtidig.',
                    'Dette hjelper personalet med å fremheve viktig eller kritisk informasjon og forbedrer oversikt og tilgjengelighet.',
                ],
            },
            {
                title: '🔐 Sidetilgang – Synlighet for vaktplan',
                description: [
                    'Et alternativ er lagt til for å skjule eller fjerne tilgangen til "Vaktplan"-siden, i samsvar med hvordan andre sider administreres.',
                    'Når den er skjult, vises ikke vaktplansiden i venstre sidemeny.',
                ],
            },
            {
                title: '👤 Opprettelse av borger og kontakt – Automatisk utfylling av postnummer',
                description: [
                    'Når du oppretter en borger, pårørende eller annen kontakt, vil oppgivelse av postnummer nå automatisk fylle ut feltene By, Region og Kommune.',
                ],
            },
            {
                title: 'Filtrer etter arkiverte/ikke-arkiverte ansatte i vaktplaneksporter',
                description: [
                    'Det er nå mulig å filtrere etter arkiverte og/eller ikke-arkiverte ansatte når man eksporterer vaktplaner.',
                ],
            },
            {
                title: '👤 Tillatelser for opprettelse av borger',
                description: [
                    'Opprettelse av borgere er ikke lenger begrenset til administratorprofiler.',
                    'En ny "Opprett borger"-tillatelse er introdusert, som kan tildeles enhver rolle – inkludert standardbrukerrollen – under "Roller" i katalogen.',
                    'Dette lar administratorer kontrollere hvilke brukere som har tillatelse til å opprette borgere.',
                ],
            },
            {
                title: 'Stopp kopiering fra gjeldende posisjon',
                description: [
                    'Det er nå mulig å stoppe en kopieringsprosess fra gjeldende posisjon i planen.',
                    'Tidligere krevde stopping av kopieringen at man navigerte tilbake til opprinnelig startdato. Dette er ikke lenger nødvendig.',
                ],
            },
            {
                title: '"Avspaseringstimer" omdøpt til "Avspaseringstimer i år"',
                description: [
                    'Etiketten "Avspaseringstimer" er omdøpt til "Avspaseringstimer i år" for tydelighet.',
                ],
            },
            {
                title: '📊 Forbedringer av tidslogger',
                description: [
                    'Et borgerfelt er lagt til tidslogger, som lar tidslogger knyttes til en bestemt borger.',
                    'Tidslogger vises nå på borgerprofilen.',
                    'Statistikk, filtrering og eksport av tidsloggdata er nå tilgjengelig, tilsvarende funksjonaliteten for intervensjonstimer.',
                ],
            },
            {
                title: '11-timers og 48-timers regel – Ekskludering av fraværstyper',
                description: [
                    '11-timersregelen og 48-timersregelen teller ikke lenger ferietimer, sykdomstimer eller andre vakter merket som "fraværstyper" ved beregning av regelbrudd.',
                    'Disse fraværsvakttypene kan fortsatt telles og beregnes mot normtimer.',
                    'Advarselsindikatoren er endret til en advarseltrekantsikon for å redusere visuell støy, da den ble vist for ofte.',
                ],
            },
            {
                title: '📤 Borger-eksport per avdeling (Herberge og krisesenter)',
                description: [
                    'For kategoriene "Herberge" og "Krisesenter" støtter borger-eksporten nå filtrering og eksport av borgere per avdeling.',
                    'Hver avdelings data kan eksporteres separat, tilsvarende hvordan "Eksporter henvendelser" fungerer.',
                ],
            },
            {
                title: 'Slettetillatelser for ansatte – Kalenderhendelser',
                description: [
                    'Ansatte har ikke lenger tillatelse til å slette elementer som standard, bortsett fra kalenderhendelser.',
                    'En dedikert slettetillatelse for kalenderhendelser er lagt til under roller, og kan tildeles "Vanlig bruker"-rollen og andre roller.',
                ],
            },
            {
                title: '🎯 UI-forbedringer – Vaktplanindikatorer og vaktnotater',
                description: [
                    'Grønne og røde indikatorer i vaktplanen inkluderer nå et verktøytips ved hover som forklarer betydningen.',
                    'Vaktmerknader/notater er nå tilgjengelige via et verktøytips ved hover på et ikon vist direkte på vakten i vaktplanen.',
                ],
            },
            {
                title: 'Tillegg til X-timer (ekstratimer)',
                description: [
                    'En kolonne som viser navnet på personen som opprettet ekstratime-oppføringen, er lagt til.',
                    'En avdelingskolonne og tilhørende felt er lagt til ekstratimer.',
                    'Ekstratimer er nå også inkludert i utkast til vaktplaner.',
                ],
            },
            {
                title: '⏱ Forbedringer av tidsregistrering',
                description: [
                    'Ansatte kan nå be om registrering av en glemt innsjekking direkte i systemet.',
                    'Disse forespørslene må gjennomgås og godkjennes av en administrator før de registreres.',
                    'Administratorer kan nå redigere eksisterende tidsloggoppføringer.',
                ],
            },
        ],
        '2026-02-20': [
            {
                title: 'Opprettelse og redigering av dokumenter online',
                description: [
                    'Brukere kan nå opprette og redigere dokumenter direkte online i systemet.',
                    'Systemgenererte dokumenter kan lastes ned som PDF-filer.',
                    'Opplastede dokumenter (Word- og Pages-formater) kan også redigeres online.',
                    'Det er mulig å vise dokumenter i skrivebeskyttet modus uten å aktivere redigering.'
                ],
            },
            {
                title: 'Oversikt over avspasering og ferietimer',
                description: [
                    'Ansatte kan nå se en oversikt over avspaseringstimer og ferietimer for en valgt periode.',
                    'Dette gir bedre gjennomsiktighet og planlegging av tilgjengelig fri.'
                ],
            },
            {
                title: 'Automatisk oppfølgingsfremheving på borgerrapporter',
                description: [
                    'Skjemaer kan nå konfigureres til automatisk å fremheve innsendte borgerrapporter etter en bestemt tidsperiode satt av den ansatte.',
                    'Fremhevede rapporter vises i den generelle borger-oversikten, i Daglig oversikt (i en dedikert boks) og på borgerens profilside.',
                    'Denne funksjonaliteten må aktiveres av en administrator på det spesifikke skjemaet før den kan brukes.'
                ],
            },
            {
                title: 'Konfigurerbare timer for intervensjonssporing',
                description: [
                    'Administratorer kan nå konfigurere antall timer for intervensjonssporing i systeminnstillingene.',
                    'Standardverdien på 24 timer kan justeres til et hvilket som helst ønsket antall timer.'
                ],
            },
            {
                title: 'Tidsregistreringsfane for ansatte',
                description: [
                    'En dedikert tidsregistreringsfane er lagt til for ansatte.',
                    'Dette sentraliserer og forenkler tidssporing og registreringer.'
                ],
            },
            {
                title: 'AI-prompting med filvedlegg og intern datatilgang',
                description: [
                    'AI-prompting støtter nå filvedlegg som en del av forespørselen.',
                    'AI-en kan få tilgang til relevante interne systemdata (basert på tillatelser) for å gi mer nøyaktige og kontekstuelle svar.'
                ],
            },
            {
                title: 'Tagger på ekstratimer',
                description: [
                    'Det er nå mulig å legge til tagger på ekstratime-oppføringer.',
                    'Dette forbedrer kategorisering, filtrering og rapportering av ekstra arbeidstimer.'
                ],
            },
            {
                title: 'Brukerspesifikke e-postsignaturer',
                description: [
                    'Brukere kan nå opprette og administrere sine egne e-postsignaturer.',
                    'E-postsignaturer kan konfigureres individuelt per bruker.'
                ],
            },
            {
                title: 'Grafvisualisering av avspasering',
                description: [
                    'Avspasering visualiseres nå i en graf basert på normtimer.',
                    'Grafen vises ved klikk på avspaseringstimer, under timevisningen i den eksisterende popup-modalen.'
                ],
            },
            {
                title: 'Koblede års- og ukenormtimer',
                description: [
                    'Et nytt felt for ukenormtimer er lagt til og koblet til feltet for årsnormtimer på skjemaet for opprettelse/redigering av ansatt.',
                    'Begge feltene beregner og oppdaterer hverandre automatisk basert på et 52-ukers år.',
                    'Verdien for ukenormtimer vises også under årsnormtimer i vaktplanvisningen.'
                ],
            },
            {
                title: 'Eksport basert på filtrert vaktplanvisning',
                description: [
                    'Det er nå mulig å eksportere data basert på de aktuelt anvendte filtrene i vaktplanvisningen.',
                    'Brukere kan laste ned den filtrerte visningen som vist på skjermen.',
                    'Vaktplanen kan eksporteres i CSV-format med enten semikolon- eller kommaseparerte verdier.'
                ],
            },
            {
                title: 'Klassifisering av fraværsvakttyper og eksportalternativer',
                description: [
                    'Vakttyper kan nå merkes som "fraværsvakttyper".',
                    'Eksporter kan konfigureres til å inkludere kun fraværsvakttyper, kun vanlige vakter, eller begge kombinert i én eksportfil.'
                ],
            },
            {
                title: 'Passordbeskyttet skrivebeskyttet deling',
                description: [
                    'Vaktplaner og journaler kan nå deles via passordbeskyttede lenker.',
                    'Mottakere kan få tilgang til det delte innholdet i skrivebeskyttet modus uten å logge inn i systemet.'
                ],
            },
            {
                title: 'Begrens synlighet av historiske vakter',
                description: [
                    'Administratorer kan konfigurere i innstillingene om ansatte har lov til å se andre ansattes historiske vakter.',
                    'Uavhengig av denne innstillingen kan ansatte aldri se andre ansattes timedata.'
                ],
            },
            {
                title: 'Forbedrede alternativer for datovelger',
                description: [
                    'Oversiktsdatovelgeren lar nå brukere raskt velge mellom dagens dato, de neste 7 dagene eller et tilpasset datointervall.',
                    'Dette gir mer fleksibilitet ved navigering og gjennomgang av data.'
                ],
            },
            {
                title: 'Ferieregistrering med avspaseringsalternativ',
                description: [
                    'Ved registrering av ferie kan brukere markere den som avspasering (afspadsering), både under opprettelse og redigering.',
                    'Hvis markert, forblir avkrysningsboksen valgt.',
                    'Hvis avspasering markeres under redigering etter opprettelse, justerer systemet avspaseringssaldoen basert på ferievakttimene.'
                ],
            },
            {
                title: 'Markering av transportbruk for refusjon',
                description: [
                    'Ansatte kan angi når transport er brukt og skal refunderes.',
                    'Dette sikrer nøyaktig sporing og refusjon av transportutgifter.'
                ],
            },
            {
                title: 'Lønnskode / lønnselement per vakttype',
                description: [
                    'Hver vakttype kan nå inkludere et felt for lønnskode eller lønnselement.',
                    'Dette feltet inkluderes i vakteksporter og lønnsrapporter for å sikre nøyaktig lønnsbehandling.'
                ],
            },
            {
                title: 'Varsler om vaktrotasjon',
                description: [
                    'Ansatte mottar et varsel når en ny vaktrotasjon rulles ut.',
                    'Varsler sendes også når det gjøres endringer i en eksisterende vaktrotasjon.'
                ],
            },
            {
                title: 'Sluttdato med automatisk deaktivering av tilgang',
                description: [
                    'Et felt for sluttdato er tilgjengelig på skjemaer for opprettelse, redigering og visning av ansatt.',
                    'Når sluttdatoen nås, deaktiveres den ansattes tilgang automatisk.'
                ],
            },
            {
                title: 'Behandlinger upåvirket av oversiktsdatovelger',
                description: [
                    'Behandlinger-seksjonen påvirkes ikke lenger av oversiktsdatovelgeren.',
                    'Alle pågående (aktive) behandlinger vises uavhengig av valgt datointervall.'
                ],
            },
        ],
        '2026-01-30': [
            {
                title: 'Mulighet for å endre etikett i ordlistelisten',
                description: [
                    'Brukere kan nå endre etiketten "Avdeling" i ordlistelisten.',
                    'Dette tilpasningsalternativet øker fleksibiliteten i terminologien på tvers av systemet.'
                ],
            },
            {
                title: 'Lagre rapporter som utkast',
                description: [
                    'Brukere har nå muligheten til å lagre rapporter som utkast i seksjonene for planer, mål og dokumenter.',
                    'Dette lar brukere komme tilbake, redigere utkastene sine og publisere dem på et senere tidspunkt.'
                ],
            },
            {
                title: 'Avdelingsspesifikke tagger',
                description: [
                    'Tagger kan nå gjøres avdelingsspesifikke, noe som forbedrer kategorisering og filtrering basert på avdelingskontekst.',
                    'Dette sikrer bedre organisering og relevans av tagger for hver avdeling.'
                ],
            },
            {
                title: 'Vis planer, mål og delmål i Daglig oversikt',
                description: [
                    'Planer, mål og delmål vises nå i Daglig oversikt, gruppert etter borger.',
                    'Dette forbedrer den daglige gjennomgangsprosessen og gjør det enklere å spore fremdrift på enkeltindivider.'
                ],
            },
            {
                title: 'Vis planlagte tidsluker i Daglig oversikt',
                description: [
                    'Planlagte tidsluker er nå synlige i Daglig oversikt.',
                    'Denne funksjonen gir en tydeligere og mer organisert visning av planlagte aktiviteter for dagen.'
                ],
            },
            {
                title: 'Angi transportbruk for refusjon',
                description: [
                    'Ansatte kan nå angi at de har brukt transport, og dermed har en utgift som skal refunderes.',
                    'Denne funksjonen sikrer at ansatte enkelt kan rapportere transportutgifter for refusjonsbehandling.'
                ],
            },
            {
                title: 'Felt for lønnskode / lønnselement per vakttype',
                description: [
                    'Et felt for lønnskode eller lønnselement er lagt til per vakttype, og dette inkluderes i vakteksporter og rapporter.',
                    'Dette gir bedre lønnssporing og rapportering, og sikrer nøyaktig lønnsbehandling.'
                ],
            },
            {
                title: 'Felt for sluttdato i ansattregistre',
                description: [
                    'Et felt for sluttdato er lagt til skjemaer for opprettelse, redigering og visning av ansatt.',
                    'Når sluttdatoen nås, deaktiveres den ansattes tilgang automatisk, noe som sikrer trygg og rettidig tilgangskontroll.'
                ],
            },
        ],
        '2026-01-23': [
            {
                title: 'Redigeringsbegrensninger for journalnotater',
                description: [
                    'Vanlige ansatte kan nå kun redigere sine egne journalnotater, og kun innen 24 timer etter opprettelse.',
                    'Etter 24-timersvinduet kan kun administratorer redigere journalnotater for å sikre reviderbarhet og sterkere innholdsstyring.'
                ],
            },
            {
                title: 'Optimalisert ytelse i medisinoversikt',
                description: [
                    'Medisinoversikten er optimalisert for forbedrede lastetider og responsivitet, særlig for større datasett.',
                    'Oversikten henter og viser nå pålitelig hele listen over medisiner for å støtte fullstendig planlegging og gjennomgang.'
                ],
            },
            {
                title: 'Isolering av avdelingstilgang til data',
                description: [
                    'Brukere er nå begrenset til kun å se data for sin(e) tildelte avdeling(er).',
                    'Synlighet på tvers av avdelinger (f.eks. at brukere fra Avdeling A ser Avdeling B, C, D) er ikke lenger tillatt, noe som styrker personvern og tilgangskontroll.'
                ],
            },
            {
                title: 'Oppdatert UI for Glemt passord, Tilbakestill passord og Opprett passord',
                description: [
                    'Sidene for glemt passord, tilbakestill passord og opprett passord er oppdatert for å samsvare med det fornyede innlogging-UI-et.',
                    'Forbedringer inkluderer konsekvent layout, mellomrom og komponentstyling for en renere, mer sammenhengende autentiseringsopplevelse på tvers av enheter.'
                ],
            },
            {
                title: 'Datofiltreringsalternativer lagt til i oversikten',
                description: [
                    'Et nytt datofilter er lagt til oversikten for å forenkle planlegging og gjennomgang etter tidsrom.',
                    'Brukere kan nå filtrere etter I dag, Neste 7 dager eller et tilpasset datointervall.'
                ],
            },
        ],
        '2026-01-16': [
            {
                title: 'UI-oppdateringer for innlogging, registrering og glemt passord',
                description: [
                    'Sidene for innlogging, registrering og glemt passord er oppdatert med et fornyet UI for en renere og mer konsekvent opplevelse.',
                    'Forbedret layout, mellomrom og komponentstyling gjør autentiseringsflyter enklere å navigere på tvers av enheter.'
                ],
            },
            {
                title: 'Granulære tillatelser for katalogroller',
                description: [
                    'Det er nå mulig å tildele spesifikke tillatelser i rolleområdet i katalogen, noe som muliggjør mer finkornet tilgangskontroll.',
                    'For eksempel kan du opprette en "Vaktkoordinator"-rolle som kun har tilgang til vaktplanen (og ikke andre områder).',
                    'Denne tilnærmingen støtter flere rolletyper og tillatelseskombinasjoner etter organisasjonens behov.'
                ],
            },
            {
                title: '"Sugetabletter" lagt til i listen over doseringsformer',
                description: [
                    'Alternativet "Sugetabletter" er lagt til i listen "Doseringsform" i skjemaene for opprettelse/redigering av medisin.',
                    'Dette forbedrer støtten for håndtering av ulike medisindoseringsformer konsekvent på tvers av systemet.'
                ],
            },
            {
                title: 'Last ned medisinoversikt fra medisinkort',
                description: [
                    'Et nytt alternativ på medisinkortet lar brukere laste ned en medisinoversikt.',
                    'Oversikten inkluderer alle medisiner og deres planlagte administrasjonstider, og gir en lett delbar referanse for planlegging og dokumentasjon.'
                ],
            },
            {
                title: 'Medisinadministrasjon på faste ukedager',
                description: [
                    'Medisinplaner kan nå konfigureres til å administreres på faste ukedager (f.eks. mandager, onsdager og fredager).',
                    'Dette gir fleksibilitet for tilbakevendende administrasjonsmønstre som ikke følger daglige intervaller.'
                ],
            },
            {
                title: 'Publiserte versjoner av utkastplaner',
                description: [
                    'Planer støtter nå utkast- og publiserte versjoner, slik at endringer kan forberedes før de går live.',
                    'Administratorer kan gjennomgå og justere utkast før publisering, noe som sikrer at oppdateringer slippes ut på en kontrollert måte.'
                ],
            },
            {
                title: 'Tilgang til barneprofiler',
                description: [
                    'Støtte for tilgang til barneprofiler er lagt til, slik at relevante brukere kan få tilgang til og administrere barneprofiler etter tillatelse.',
                    'Dette forbedrer brukervennligheten for organisasjoner som administrerer omsorg og planlegging for barn, samtidig som tilgangskontroller opprettholdes.'
                ],
            },
            {
                title: 'Lesesporing i meldinger',
                description: [
                    'Meldinger inkluderer nå lesesporing slik at avsendere kan se når meldinger er lest.',
                    'Dette forbedrer kommunikasjonens tydelighet og reduserer behovet for manuell oppfølging.'
                ],
            },
        ],
        '2026-01-09': [
            {
                title: 'Gjentakende hendelser i kalenderen',
                description: [
                    'Ved redigering av en enkelt hendelse spør systemet nå brukere om de skal anvende endringer på kun denne hendelsen eller alle fremtidige hendelser.',
                    'Denne funksjonaliteten sikrer mer fleksibilitet og kontroll over gjentakende hendelser.'
                ],
            },
            {
                title: 'Automatisk gjentakende ukerotasjon i vaktplanen',
                description: [
                    'Administratorer kan nå opprette automatiske gjentakende ukerotasjoner i vaktplanen, slik som en 8-ukers rotasjon, som gjentas til den stoppes manuelt.',
                    'Systemet spør administratorer ved redigering av en vakt innenfor en gjentakende rotasjon, om endringen skal gjelde kun denne vakten eller hele det gjentakende mønsteret.'
                ],
            },
            {
                title: 'Mulighet til å søke etter en bestemt dag i vaktplanen og kalenderen',
                description: [
                    'Brukere kan nå søke etter en bestemt dag i vaktplanen og kalenderen, noe som muliggjør mer presis navigering uten å måtte bla uke for uke.',
                    'Denne forbedringen inkluderer også muligheten til å navigere etter måned.'
                ],
            },
            {
                title: 'Filteralternativer i vaktplaner',
                description: [
                    'Oversikten over vaktplaner inkluderer nå filteralternativer for å velge én eller flere ansatte.',
                    'I tillegg er filtre for ansettelsesstatus lagt til, som gir mer skreddersydd planlegging og oversikt.'
                ],
            },
            {
                title: 'Visning av ansattes vakter på tvers av avdelinger',
                description: [
                    'Brukere kan nå veksle synligheten av vakter på tvers av avdelinger for alle ansatte.',
                    'Denne funksjonen er kun tilgjengelig hvis flere avdelinger er satt opp i organisasjonen.'
                ],
            },
            {
                title: 'Forbedringer av håndtering av flerdagsvakter',
                description: [
                    'Når man oppretter vakter som strekker seg over flere dager, vil systemet nå automatisk dele dem opp i separate vakter for hver dag.',
                    'En visuell forbindelse, slik som en linje eller start-/sluttekst, vil legges til for å indikere kontinuiteten av vakten på tvers av dagene.'
                ],
            },
            {
                title: 'Forbedringer i flyten for vaktoppretting',
                description: [
                    'Flyten for vaktoppretting er optimalisert: brukere må først velge vakttypen før andre visningsalternativer vises.',
                    'Avdelingsfeltet fylles nå automatisk med den valgte avdelingen som standard, men det kan endres under opprettelsesprosessen.'
                ],
            },
            {
                title: 'Husk valgt avdeling i toppmenyen',
                description: [
                    'Når en avdeling er valgt i toppmenyen, vil den forbli valgt for fremtidige handlinger til den endres.',
                    'Dette effektiviserer prosessen for administratorer og planleggere som arbeider innenfor en bestemt avdeling.'
                ],
            },
            {
                title: 'Opprett egendefinerte stillingstitler under "Kontakter" på borgere',
                description: [
                    'Administratorer kan nå opprette egendefinerte stillingstitler under "Kontakter"-seksjonen for borgere.',
                    'Dette hjelper med å spore spesifikke roller eller titler innenfor organisasjonen.'
                ],
            },
            {
                title: 'Fest deg selv i vaktplanen',
                description: [
                    'Brukere kan nå feste seg selv i vaktplanen for å sikre at de alltid vises øverst på listen.',
                    'Denne funksjonen hjelper brukere med å enkelt identifisere sine vakter, spesielt i store team.'
                ],
            },
            {
                title: 'Ferieplanlegging og vakterstatning',
                description: [
                    'Når en ansatt oppretter en ferieforespørsel, vil eventuelle eksisterende vakter automatisk bli fjernet og tilbudt andre for erstatning, tilsvarende håndtering av sykefravær.'
                ],
            },
            {
                title: 'Optimalisering av vakttilbud',
                description: [
                    'Vakttilbud er optimalisert for å vise kun vakter som er relevante for den tildelte avdelingen.',
                    'Et stillingstittelfelt lar nå flere titler legges til, og nattvakter som strekker seg over flere dager kan tilbys som en enkelt vakt.'
                ],
            },
            {
                title: 'Avdelingsfilter for kalender',
                description: [
                    'Hendelser i kalenderen filtreres nå etter valgt avdeling, slik at brukere kun ser hendelser som er relevante for sin avdeling.',
                    'Starttidspunktet for hendelser settes automatisk til 1 time senere enn starttidspunktet til det justeres manuelt.',
                    'Ansattfeltet på en hendelse viser nå kun ansatte fra den valgte avdelingen.'
                ],
            },
            {
                title: 'Rolleinkludering i eksportfiler',
                description: [
                    'Ved eksport av ansatte inkluderes nå rollefeltet i eksportfilen.',
                    'Dette sikrer at eksporterte data inkluderer rollene som er knyttet til hver ansatt.'
                ],
            },
            {
                title: 'Legger til "Sugetabletter" i "Doseringsform"-listen',
                description: [
                    'Alternativet "Sugetabletter" er lagt til i listen "Doseringsform" i skjemaene for opprettelse og redigering av medisin.',
                    'Dette muliggjør bedre håndtering av doseringsformer i systemet.',
                    'Håndtering av doseringsform er også tilgjengelig i kataloginnstillingene.'
                ],
            },
            {
                title: 'Tillatelser i katalogroller',
                description: [
                    'Det er nå mulig å tildele spesifikke tillatelser i rolleområdet for oppgaver som å administrere vaktplanen, noe som gir mer granulær kontroll over brukertilgang.',
                    'For eksempel kan en "Vaktkoordinator"-rolle opprettes med begrenset tilgang til kun vaktplanen.'
                ],
            }
        ],
        '2025-12-12': [
            {
                title: 'Avansert søk og filtrering i vaktplanen og kalenderen',
                description: [
                    'Brukere kan nå søke direkte etter en bestemt dag i vaktplanen og kalenderen i stedet for å navigere uke for uke.',
                    'Navigasjon er utvidet for å tillate flytting etter måned i tillegg til etter uke.',
                    'Oversikten kan filtreres for å vise én eller flere valgte ansatte.',
                    'Flere filtre er lagt til for ansettelsesstatus og avdeling for å forbedre tydelighet og planlegging.'
                ],
            },
            {
                title: 'Optimaliseringer av vaktplanen',
                description: [
                    'Flere ytelses- og brukervennlighetsoptimaliseringer er gjort i vaktplanen.',
                    'Disse forbedringene gir raskere interaksjoner og en jevnere planleggingsopplevelse for både administratorer og ansatte.'
                ],
            },
            {
                title: 'Håndtering av flerdagsvakter',
                description: [
                    'Når man oppretter en vakt som strekker seg over flere dager, deler systemet den nå automatisk opp i separate daglige vakter.',
                    'Dette sikrer mer nøyaktig planlegging, rapportering og enklere justeringer per dag.'
                ],
            },
            {
                title: 'Egendefinerte gjentakelsesalternativer på tvers av planlegging og varsler',
                description: [
                    'Egendefinerte gjentakelsesmønstre kan nå konfigureres for vaktplanen, kalenderhendelser samt varsler for planer og mål.',
                    'Dette gir større fleksibilitet for å definere komplekse eller ikke-standardiserte gjentakelsesregler på tvers av plattformen.'
                ],
            }
        ],
        '2025-11-28': [
            {
                title: 'Overfør Zoho-chat til support-slide-over',
                description: [
                    'Zoho-chat-funksjonen er nå integrert i et slide-over-panel.',
                    'Dette forbedrer tilgjengeligheten og opprettholder fokus på hovedinnholdet samtidig som det tillater raske interaksjoner.'
                ],
            },
            {
                title: 'Legg til sidetilgang i det nye ansattskjemaet',
                description: [
                    'Det nye ansattskjemaet er oppdatert for å inkludere alternativer for sidetilgang.',
                    'Dette effektiviserer oppsettsprosessen for nyansatte og forbedrer onboardingopplevelsen deres.'
                ],
            },
            {
                title: 'Gjentakende hendelser i kalenderen',
                description: [
                    'Ved redigering av en enkelt hendelse spør systemet nå om endringene skal gjelde for kun denne hendelsen eller alle fremtidige gjentakende hendelser.',
                    'Denne funksjonen øker fleksibilitet og presisjon ved håndtering av gjentakende hendelser.'
                ],
            },
            {
                title: 'Gjentakende automatisk ukerotasjon i vaktplanen',
                description: [
                    'Administratorer kan nå opprette en gjentakende automatisk ukerotasjon i vaktplanen.',
                    'Administratorer kan sette en sluttdato for det gjentakende mønsteret.'
                ],
            },
            {
                title: 'Tilpasning av varslingsinnstillinger',
                description: [
                    'En ny innstilling lar brukere aktivere/deaktivere varsler basert på om den ansatte er på vakt.',
                    'I tillegg er det lagt til et generelt alternativ for å deaktivere alle e-postvarsler, noe som gir brukere mer kontroll over varslingspreferansene sine.'
                ],
            },
            {
                title: 'Legge til/trekke fra ekstratimer i vaktplanen',
                description: [
                    'Administratorer og ansatte kan nå legge til eller trekke fra ekstratimer fra ukeplanen uten å opprette en spesifikk vakt.',
                    'Et obligatorisk notatfelt kreves for hver justering, og det er to arbeidsflyter tilgjengelig for å håndtere disse endringene.'
                ],
            },
            {
                title: 'Sentralisert passordhåndtering for administratorer',
                description: [
                    'Administratorer kan nå administrere passordkontroll sentralt fra firmainnstillingene.',
                    'Dette fjerner "Endre passord"-alternativet for brukere og lar administratorer generere nye passord for dem.'
                ],
            },
            {
                title: 'Visuelle forbedringer i borgeroversikten',
                description: [
                    'To visuelle ikoner er lagt til borgerens handlingsikoner for bedre statussporing.',
                    'Plussikonet reflekterer statusen til borgerens planer/mål, mens pilleikonet gir direkte tilgang til medisinoversikten.'
                ],
            },
            {
                title: 'Gjentakende varsler i planer og mål',
                description: [
                    'I planer- og målseksjonen kan nå gjentakende varsler opprettes.',
                    'Disse varslene kan kun tildeles borgerens tildelte kontaktpersoner, noe som sikrer målrettede og relevante varsler.'
                ],
            }
        ],
        '2025-11-14': [
            {
                title: 'Fargetilpasning av avdelings-nedtrekksmeny',
                description: [
                    'Det er nå mulig å endre fargen på avdelings-nedtrekksmenyen basert på avdelingen som vises.',
                    'Dette gir en visuell fargeindikator i tillegg til avdelingsnavnet, noe som forbedrer tydelighet og rask gjenkjenning.'
                ],
            },
            {
                title: 'Oppdateringer av registreringsskjemaet',
                description: [
                    'Det er gjort flere forbedringer i registreringsskjemaet.',
                    'Disse endringene forbedrer brukervennligheten, effektiviserer registreringsprosessen og forbedrer datanøyaktigheten.'
                ],
            },
            {
                title: 'Borgernes henvendelser og konverteringsprosess',
                description: [
                    'Det er gjort forbedringer i håndteringen av borgernes henvendelser.',
                    'Det er nå enklere å administrere henvendelser og konvertere en henvendelse til en registrert borger.'
                ],
            },
            {
                title: 'UI-oppdatering for sikker e-post',
                description: [
                    'Brukergrensesnittet for sikker e-post er oppdatert.',
                    'Disse forbedringene gir en tydeligere layout og forbedrer den generelle meldingsopplevelsen.'
                ],
            },
            {
                title: 'Klientinnlogging via dashbordet for hendelser',
                description: [
                    'En ny funksjon er lagt til som lar klienter logge inn for å se hendelser via dashbordet.',
                    'Dette forbedrer tilgjengeligheten og gir en mer strømlinjeformet opplevelse for hendelsesrelatert informasjon.'
                ],
            }
        ],
        '2025-11-07': [
            {
                title: 'Ekstra felt (styrke) i medisinjournal',
                description: [
                    'Ved opprettelse eller redigering av en medisinjournal er det lagt til et nytt felt kalt "styrke".',
                    'Dette muliggjør mer presis registrering av medisindetaljer og forbedrer tydeligheten i doseringsdokumentasjonen.'
                ],
            },
            {
                title: 'Daglig oversikt omdøpt til Oversikt',
                description: [
                    'Seksjonen som tidligere het "Daglig oversikt" er omdøpt til "Oversikt".',
                    'Denne endringen gir en tydeligere og mer generell oversiktsseksjon for brukere.'
                ],
            },
            {
                title: '"Borgernes daglige hendelser" omdøpt til "Borgernes hendelser" i oversikten',
                description: [
                    'I oversikten er tittelen "Borgernes daglige hendelser" oppdatert til "Borgernes hendelser".',
                    'Dette reflekterer at hendelser ikke er begrenset til daglige forekomster og forbedrer konsistens i navngivningen.'
                ],
            },
            {
                title: '"Daglig medisinoversikt" omdøpt til "Medisinoversikt" i oversikten',
                description: [
                    'Seksjonsnavnet "Daglig medisinoversikt" er endret til "Medisinoversikt".',
                    'Dette representerer bedre den bredere funksjonaliteten og dekningen av oversikten.'
                ],
            },
            {
                title: 'Flere alternativer i "Kopier flere ukers planer"',
                description: [
                    'Flere alternativer er lagt til for å velge kildens og destinasjonens uker ved kopiering av flere ukers planer.',
                    'Dette gir større fleksibilitet og kontroll ved håndtering av planer.'
                ],
            }
        ],
        '2025-10-31': [
            {
                title: 'Innsjekking og utsjekking på borgeren (med automatisk varsel etter 24 timer)',
                description: [
                    'Systemet støtter nå innsjekking og utsjekking på borgeren med forbedret funksjonalitet som sender et automatisk varsel 24 timer etter utsjekking.',
                    'Varselet informerer om at utsjekkingen er logget og kan finnes i loggen, noe som sikrer bedre sporbarhet og oppfølging.'
                ],
            },
            {
                title: 'Henvendelsesdata og oppholdsdata for organisasjoner innen sosial velferd',
                description: [
                    'Organisasjoner og selskaper innen sosial velferd-bransjen med fasilitetstype krisesenter eller herberge kan nå få tilgang til henvendelses- og oppholdsdata.',
                    'Dette muliggjør mer presis rapportering og analyse av borgersaker og opphold i sosiale institusjoner.'
                ],
            },
            {
                title: 'Romadministrasjon for borgere',
                description: [
                    'Det er lagt til ny funksjonalitet for romadministrasjon, som lar administratorer administrere romfordeling og status for borgere.',
                    'Dette gir bedre synlighet av tilgjengelige rom, belegg og ressursutnyttelse ved fasiliteter som krisesentre og herberger.'
                ],
            },
            {
                title: 'Samtaleoppsummering for borgere knyttet til henvendelsesdata',
                description: [
                    'Det er nå mulig å legge til samtaleoppsummeringer for borgere som en del av deres henvendelsesdata.',
                    'Dette muliggjør mer fullstendig dokumentasjon av borgersaker og sikrer at relevante notater og samtaler registreres sammen med andre data.'
                ],
            },
            {
                title: 'Forenklet registreringsskjema',
                description: [
                    'Andre felter i registreringsskjemaet er fjernet for å forbedre og effektivisere registreringsprosessen.',
                    'Denne endringen reduserer kompleksitet og gjør det raskere og mer intuitivt for brukere å opprette en konto.'
                ],
            }
        ],
        '2025-10-24': [
            {
                title: 'Mulighet til å opprette flere utkast til vaktplaner for en enkelt avdeling eller for hele organisasjonen',
                description: [
                    'Klienter kan nå opprette flere utkast til vaktplaner for enten en enkelt avdeling eller hele organisasjonen i planleggingsfasen av vaktplanleggingen.',
                    'Denne funksjonen gir større fleksibilitet i planlegging, med en tydelig indikasjon av hvilken avdeling utkastet publiseres for når det ferdigstilles.'
                ],
            },
            {
                title: 'Mulighet til å bytte mellom organisasjoner med én enkelt brukerkonto',
                description: [
                    'Brukere kan nå sømløst bytte mellom organisasjoner med én enkelt brukerkonto, noe som gjør det enklere for personer som arbeider på tvers av flere organisasjoner å håndtere sine ansvarsoppgaver.',
                    'Dette forbedrer brukeropplevelsen og reduserer behovet for flere innlogginger eller kontohåndtering.'
                ],
            },
            {
                title: 'Beregning av dekningsbidrag på borgeren (synlig for administratorer eller autoriserte brukere)',
                description: [
                    'En funksjon er introdusert for å beregne dekningsbidrag per borger, som kun er synlig for administratorer eller brukere med nødvendige tillatelser.',
                    'Dette muliggjør bedre finansiell sporing og analyse, og gir viktig innsikt i dekningsbidraget for enkeltborgere.'
                ],
            },
            {
                title: 'Innsjekking og utsjekking på borgeren',
                description: [
                    'En ny funksjonalitet for innsjekking og utsjekking er lagt til for borgere, som lar brukere registrere fremmøte- eller aktivitetstider.',
                    'Denne funksjonen er nyttig for å spore borgerengasjement og sikre nøyaktige registreringer av deres deltakelse.'
                ],
            },
            {
                title: 'Tidsplan: tildeling og oppsummering av tidsbruk',
                description: [
                    'Brukere kan nå legge inn de tildelte timene/minuttene per dag, uke eller måned for en borger, og se en oppsummering (tidskonto) som viser hvor mye tid som er brukt i den valgte perioden.',
                    'Dette sikrer at det er tydelig om den tildelte tiden brukes effektivt og om man er over eller under den tildelte tiden.'
                ],
            }
        ],
        '2025-10-17': [
            {
                title: 'Filvedlegg i SMTP- og Entra-e-poster (både innboks og sendte e-poster)',
                description: [
                    'En funksjon er introdusert for å tillate filvedlegg i både SMTP- og Entra-e-poster, som dekker både innboks og sendte e-poster.',
                    'Denne forbedringen lar brukere legge ved og få tilgang til filer mer effektivt i både innkommende og utgående e-postkommunikasjon.'
                ],
            },
            {
                title: 'App- og web-varsel til ansatte ved publisering av en vaktplan fra utkast',
                description: [
                    'Ansatte mottar nå app- og web-varsler når en vaktplan som inkluderer dem publiseres fra utkast.',
                    'Dette forbedrer kommunikasjonen og sikrer at ansatte raskt blir informert om endringer i sine vaktplaner.'
                ],
            },
            {
                title: 'Se en logg over slettede notater i journalnotater-området',
                description: [
                    'En loggfunksjon er lagt til for å la brukere se slettede notater i journalnotater-området.',
                    'Dette gir et revisjonsspor for notatesletninger og forbedrer gjennomsiktighet og sporing i systemet.'
                ],
            },
            {
                title: 'Flytt et notat fra én borger til en annen (administratorfunksjonalitet)',
                description: [
                    'Administratorer kan nå flytte notater fra én borgers journal til en annen.',
                    'Dette sikrer at notater er nøyaktig knyttet til riktig borger, og forbedrer datahåndtering og organisering.'
                ],
            },
            {
                title: 'Kopier et notat til en annen borger (administratorfunksjonalitet)',
                description: [
                    'Administratorer kan nå kopiere notater fra én borgers journal til en annen.',
                    'Dette muliggjør enkel deling av relevant informasjon mellom borgere og sikrer effektiv notathåndtering.'
                ],
            }
        ],
        '2025-10-10': [
            {
                title: 'Filvedlegg ved sending av e-post',
                description: [
                    'En funksjon er introdusert for å tillate at vedlegg legges til ved sending av e-post.',
                    'Dette forbedrer muligheten til å sende dokumenter og filer sammen med e-post, og forbedrer kommunikasjonseffektiviteten.'
                ],
            },
            {
                title: 'Nedlasting av vedlegg for sikker e-post',
                description: [
                    'En funksjonalitet er lagt til for å tillate nedlasting av vedlegg fra sikre e-poster.',
                    'Dette forbedrer sikker tilgang til viktige filer og dokumenter sendt gjennom krypterte e-postkanaler.'
                ],
            },
            {
                title: 'Eksport av vaktplan per avdeling',
                description: [
                    'En ny funksjon er lagt til for å eksportere vaktplaner spesifikke for hver avdeling.',
                    'Dette muliggjør enklere distribusjon og håndtering av avdelingsvise vaktlister, noe som forbedrer organisatorisk effektivitet.'
                ],
            },
            {
                title: 'Administratordefinert visning av borgerinformasjon',
                description: [
                    'Administratorer kan nå bestemme og definere hvilken informasjon som skal vises i den spesifikke borgerboksen når man ser på en enkelt borger.',
                    'Dette gir mer tilpasset tilgang til borgerdetaljer og sikrer at kun relevant informasjon vises til vanlige brukere.'
                ],
            }
        ],
        '2025-10-03': [
            {
                title: 'Web-leads',
                description: [
                    'Leads-appen kan nå aktiveres og brukes til å se leads.',
                    'Dette gir forbedret håndtering og sporing av potensielle leads i systemet.',
                ],
            },
            {
                title: 'Last ned og skriv ut spesifikke medisiner for borgeren',
                description: [
                    'En funksjon er lagt til for å tillate nedlasting og utskrift av spesifikke medisindetaljer for borgere.',
                    'Dette forbedrer effektiviteten i håndtering og deling av medisininformasjon.',
                ],
            },
            {
                title: 'Flere faste tidsintervaller',
                description: [
                    'Flere faste tidsintervaller for maksimal dosering per tid er lagt til.',
                    'Dette sikrer mer fleksibilitet og nøyaktighet i planleggingen av medisindosering.',
                ],
            },
            {
                title: 'Hjelpelenke for medisin',
                description: [
                    'En ny hjelpelenke for medisin er lagt til.',
                    'Denne lenken gir relevante ressurser for å bistå personalet i arbeidet med medisinering.',
                ],
            },
            {
                title: 'Hjelpelenke for bruk av makt og avviksrapporter',
                description: [
                    'En hjelpelenke er introdusert for bruk av makt og avviksrapporter.',
                    'Denne lenken gir nyttig informasjon og retningslinjer for håndtering av disse sensitive situasjonene.',
                ],
            },
        ],
        '2025-09-26': [
            {
                title: 'Visning av helligdager i kalenderen',
                description: [
                    'Helligdager vises nå direkte i kalenderen.',
                    'Dette gir bedre synlighet for planlegging og koordinering.',
                ],
            },
            {
                title: '"Rask risikovurdering" i daglig oversikt',
                description: [
                    'Hvis aktivert i administratorinnstillingene, vises nå en rask risikovurdering i daglig oversikt.',
                    'Dette muliggjør raskere identifikasjon av potensielle risikoer i daglig drift.',
                ],
            },
            {
                title: 'Aktuelle borgerbehandlinger i daglig oversikt',
                description: [
                    'Pågående borgerbehandlinger er nå synlige i daglig oversikt.',
                    'Dette gir personalet en tydelig og umiddelbar oversikt over aktuelle omsorgsaktiviteter.',
                ],
            },
        ],
        '2025-09-19': [
            {
                title: 'Importer og eksporter ansatte via CSV-malfil',
                description: [
                    'Ansatte kan nå importeres og eksporteres ved hjelp av en CSV-malfil.',
                    'Dette forenkler håndteringen av ansattdata og sikrer konsistens på tvers av registre.',
                ],
            },
            {
                title: 'Eksporter borgere',
                description: [
                    'Borgerregistre kan nå eksporteres.',
                    'Dette muliggjør enklere rapportering, deling og sikkerhetskopiering av data.',
                ],
            },
            {
                title: 'Visning av helligdager i vaktplanen',
                description: [
                    'Helligdager vises nå i vaktplanen.',
                    'Dette bidrar til å forbedre planleggingen og sikre nøyaktig planlegging rundt helligdager.',
                ],
            },
        ],
        '2025-09-12': [
            {
                title: 'Importer borgere via CSV-malfil',
                description: [
                    'Borgere kan nå importeres ved hjelp av en CSV-malfil.',
                    'Dette effektiviserer datainnleggingsprosessen og sikrer konsistens i borgerregistre.',
                ],
            },
            {
                title: 'Brukernes 2FA',
                description: [
                    'Tofaktorautentisering (2FA) er nå tilgjengelig for brukere.',
                    'Dette gir et ekstra lag med sikkerhet for brukerkontoer og beskytter sensitiv informasjon.',
                ],
            },
            {
                title: 'Nye felt i borgerens skjema: Trafikklys (Grønn, Gul og Rød)',
                description: [
                    'Nye felt for trafikklysstatus (Grønn, Gul og Rød) er lagt til i borgerens skjema.',
                    'Gi en beskrivelse av borgerens tilstand når de er i Grønn, Gul eller Rød status ved opprettelse av et journalnotat.',
                ],
            },
        ],
        '2025-08-29': [
            {
                title: 'Standard vakttider i vaktplanen',
                description: [
                    'Du kan nå sette standard inn- og ut-tid for hver vakt i vaktplanen.',
                    'Dette bidrar til å standardisere arbeidstider og reduserer manuelle innleggingsfeil.',
                ],
            },
            {
                title: 'Sporing av medisinallergier',
                description: [
                    'Borgeres medisinallergier kan nå registreres og spores.',
                    'Dette sikrer bedre sikkerhet og informert beslutningstaking for helsepersonell.',
                ],
            },
            {
                title: 'Sykefravær telles som arbeidstimer',
                description: [
                    'Sykefravær kan nå telles som arbeidstimer i vaktplanen.',
                    'Dette gir mer nøyaktig rapportering og mer rettferdig planlegging.',
                ],
            },
        ],
        '2025-08-15': [
            {
                title: 'Microsoft e-posthåndtering i Mail-appen',
                description: [
                    'Du kan nå koble til og administrere Microsoft-e-postkontoene dine direkte i Mail-appen.',
                    'Dette gjør det enklere å sende, motta og organisere e-poster uten å bytte mellom plattformer.',
                ],
            },
        ],
        '2025-08-01': [
            {
                title: 'Intervensjonstimer i borgerområdet',
                description: [
                    'Borgere kan nå se tilgjengelige intervensjonstimer direkte i borgerseksjonen.',
                    'Dette forbedrer gjennomsiktighet og tilgang til støttetjenester.',
                ],
            },
            {
                title: 'Ny app: CitizenOne AI',
                description: [
                    'Vi har nå lansert CitizenOne AI - din intelligente assistent som for eksempel kan gi deg en rask oversikt over hvordan en borger har hatt det den siste måneden, dele nyttig informasjon om organisasjonen din eller kollegene dine, og mye mer. Alt direkte i CitizenOne, slik at du kan jobbe smartere og raskere.'
                ],
            },
            {
                title: 'Endringslogger i vaktplanen',
                description: [
                    'Vaktplanen inkluderer nå en detaljert endringslogg.',
                    'Spor alle oppdateringer og endringer i vaktoppdrag enkelt.',
                ],
            },
        ],
        '2025-07-25': [
            {
                title: 'Online kalenderbooking',
                description: [
                    'Nå tilgjengelig for kjøp i Apper-seksjonen.',
                    'Etter kjøp, gå til Kalendere for å sette opp og administrere online bookinger.',
                ],
            },
            {
                title: 'Avdelinger i vaktplanen',
                description: ['Du kan nå tildele vakter til spesifikke avdelinger.'],
            },
            {
                title: 'Vaktnotater for administratorer',
                description: ['Administratorer kan nå legge ved notater til enkeltvakter.'],
            },
            {
                title: 'Veksle behandlingsvarsler',
                description: ['Mulighet til å aktivere eller deaktivere varsler for behandlinger.'],
            },
            {
                title: 'Rediger og slett meldinger i chatter',
                description: ['Du kan nå redigere eller slette meldinger direkte i chatter for bedre kontroll og kommunikasjon.'],
            },
            {
                title: 'Renere navigasjonsfelt',
                description: [
                    'Varslings- og meldingsmerker skjules når antallet er null.',
                    'Nye funksjonsannonser vil også vises her fremover.',
                ],
            },
        ],
    },
    sv: {
        '2026-05-15': [
            {
                title: '🔁 Mall- och kopieringsförbättringar',
                description: [
                    'Det är nu möjligt att kopiera kortare källveckor till flera på varandra följande framtida veckor när du skapar en mall för tjänstgöringsschema.',
                    'Exempel: Kopiera 1 vecka till 2, 3, 4 (eller fler) på varandra följande veckor.',
                ],
            },
            {
                title: '📝 Dynamiska journalanteckningsfält baserat på titel',
                description: [
                    'Journalanteckningar stöder nu dynamiska, fördefinierade fält baserat på den valda journalanteckningens titel.',
                    'När en användare väljer en titel för journalanteckning visar systemet automatiskt relevanta fält/frågor som är kopplade till den titeln.',
                    'Varje fält tillåter inmatning (t.ex. anteckningar, svar, observationer).',
                    'Dessa fält kan konfigureras i förväg via en katalog eller inställningar.',
                ],
            },
            {
                title: '📅 Kalenderhändelse – Journalanteckning och slutförandestatus',
                description: [
                    'Det är nu möjligt att skapa en journalanteckning direkt från en kalenderhändelse genom att klicka på händelsen och välja "Skapa journalanteckning".',
                    'Händelsens titel kopieras automatiskt till journalanteckningen.',
                    'Efter att anteckningen skrivits länkar kalenderhändelsen till journalanteckningen, och journalanteckningen länkar tillbaka till kalenderhändelsen.',
                    'Det är nu möjligt att markera en händelse som "Slutförd" eller "Ej slutförd".',
                    'När något av alternativen väljs visas en popup med frågan: "Vill du skriva en journalanteckning om detta?" med alternativen "Ja" och "Nej".',
                    'Om man fortsätter med en journalanteckning finns det ett alternativ att kopiera anteckningen till en relaterad plan, mål eller delmål.',
                    'Statistik som visar antalet gånger objekt markeras som "Slutförd" jämfört med "Ej slutförd" är nu tillgänglig för valfri period.',
                ],
            },
            {
                title: '🧩 Roller och behörigheter',
                description: [
                    'Koordinatorrollen och roller generellt har granskats och förbättrats så att administratörer inte längre behöver tilldela fullständiga administratörsrättigheter i onödan.',
                    'En tydlig översikt och förklaring av hur specifika behörigheter fungerar är nu tillgänglig.',
                    'Det är nu möjligt att definiera en rollhierarki (t.ex. Administratör har högre privilegier än Chef).',
                    'Specialiserade domänspecifika roller kan nu skapas (t.ex. "Medicineringsansvarig") för att kontrollera åtkomst till specifika moduler eller funktioner.',
                    'Flera roller kan nu tilldelas en enskild anställd (flerval), och systemet kombinerar behörigheter från alla tilldelade roller.',
                ],
            },
            {
                title: '📋 Översiktssida för journalanteckningar',
                description: [
                    'Funktionen "Se senaste / alla journalanteckningar" öppnar nu en dedikerad sida där alla journalanteckningar kan visas på ett ställe.',
                    'Åtkomst till journalanteckningar respekterar den befintliga behörighetsstrukturen: användare ser endast anteckningar från medborgare inom sina avdelningar.',
                    'Administratörsroller kan se alla journalanteckningar i hela organisationen.',
                    'Det är nu möjligt att filtrera journalanteckningar globalt efter medborgare, avdelning, taggar och andra relevanta filter.',
                ],
            },
            {
                title: '📆 iCal / CalDav – Prenumerera på kalender',
                description: [
                    'Det är nu möjligt att prenumerera på CitizenOne-kalendern via iCal / CalDav.',
                    'Detta gör att användare kan se sina CitizenOne-kalenderhändelser i externa kalenderapplikationer.',
                ],
            },
            {
                title: '📋 Boendedata – Samtyckesförklaringar',
                description: [
                    'I formuläret för boendedata är det nu möjligt att välja samtyckesförklaringar med Ja/Nej-alternativ för: Foto, Föräldrasamarbete, Studentsamarbete och Allmänt samtycke.',
                    'Anpassade typer av samtyckesförklaringar kan skapas i katalogen.',
                    'Det är nu möjligt att ange Personlig förmyndarskap (Ja/Nej) och Ekonomisk förvaltarskap (Ja/Nej).',
                ],
            },
            {
                title: '🏥 De 12 omvårdnadsområdena – Status och mallar',
                description: [
                    'När statusen för ett omvårdnadsområde uppdateras är det nu möjligt att välja: Inte ett aktivt problem, Potentiellt problem eller Aktivt problem.',
                    'Mallar kan nu användas för omvårdnadsområden, som definierar vilka fält användarna måste fylla i (obligatoriskt eller valfritt).',
                    'När ett omvårdnadsområde skapas eller uppdateras kan relaterade områden visas i en sidopanel – liknande hur planer och mål visas när en journalanteckning skapas.',
                ],
            },
            {
                title: '💊 Behandlingar – Förbättringar och UX-förbättringar',
                description: [
                    'Mallar kan nu användas för behandlingar, som definierar vilka fält användarna måste fylla i (obligatoriskt eller valfritt).',
                    'Fältet "Avslutad" ("Afsluttet") har bytt namn till "Markera som avslutad" ("Markér som afsluttet").',
                    'Det är nu visuellt tydligare vilka behandlingar som är aktiva (pågående) jämfört med avslutade, genom tydliga UI-indikatorer (t.ex. etiketter, färger eller statusbadges).',
                    'Huvudöversikten/dashboarden innehåller nu sammanfattningswidgetar som "10 aktiva behandlingar", som användare kan klicka på för att se listan.',
                    'Om behandlingar skapas inom ett specifikt omvårdnadsområde finns det nu en direktlänk från omvårdnadsområdet till dessa behandlingar.',
                ],
            },
            {
                title: '🌍 Norskt och svenskt språkstöd',
                description: [
                    'Norska och svenska språkalternativ är nu tillgängliga i CitizenOne.',
                    'Användare kan växla till norska (Norsk) eller svenska (Svenska) från sina språkinställningar.',
                ],
            },
        ],
        '2026-05-08': [
            {
                title: '📇 Företagskontakter och adressbok',
                description: [
                    'Företagskontakter kan nu skapas på samma sätt som medborgarkontakter.',
                    'Alla kontakter (t.ex. läkare, handläggare etc. – inte anhöriga) lagras nu centralt i systemet så att de kan återanvändas och tilldelas flera medborgare.',
                    'En företagsövergripande adressbok har införts där kontakter lagras centralt och kan väljas vid behov.',
                ],
            },
            {
                title: '⚙️ Konfiguration av skifttyp',
                description: [
                    'Under Skifttyper är det nu möjligt att definiera att 1 arbetstimme motsvarar 0,75 timmar (valfritt), och denna regel kan också tillämpas inom ett specifikt tidsintervall.',
                    'För "Sovande nattskift" är det nu möjligt att definiera en standardsluttid som är 1, 2 eller fler dagar senare.',
                ],
            },
            {
                title: '📅 Tjänstgöringsschema – Års- och halvårsvy i kalender',
                description: [
                    'En års- och halvårsvy har lagts till i tjänstgöringsschemat.',
                    'Vyn kan visas per enskild anställd, och visar deras tilldelade skift och en översikt över tid.',
                ],
            },
            {
                title: '💊 Medicineringsanteckningar – Informationsikon',
                description: [
                    'En informationsikon ("i") har lagts till för medicineringsanteckningar.',
                    'När du för muspekaren över ikonen visas den tillhörande anmärkningen för den medicineringen.',
                    'Exempel: "Administrera inte om patienten är påverkad av kokain."',
                ],
            },
            {
                title: '🤖 AI-användningsbadge på journalanteckningar',
                description: [
                    'Systemet registrerar nu när AI-assistenten har använts för att skapa eller bistå med en journalanteckning.',
                    'En badge visas på journalanteckningen som indikerar att AI-assistenten användes.',
                    'Badgen lyder: "CitizenOne AI användes".',
                ],
            },
            {
                title: '🔐 Inloggningsbegränsning efter IP/enhet',
                description: [
                    'Administratörer kan nu begränsa inloggningsåtkomst baserat på IP-adress och/eller enhet.',
                    'Specifika IP-adresser (t.ex. kontorets nätverk) kan vitlistas.',
                    'Eventuellt kan åtkomst begränsas till godkända enheter.',
                    'Användare utanför tillåtna IP-adresser/enheter blockeras eller måste genomföra ytterligare verifiering.',
                    'Denna funktion ökar säkerheten och säkerställer åtkomst endast från betrodda miljöer.',
                ],
            },
            {
                title: '🎄 Helgdags- och söndagsersättningsregler',
                description: [
                    'På helgdagar gäller ett standardexempel: 08:00 – 15:24 = 7,4 timmar.',
                    'På söndagar måste anställda få 1,5× sina timmar.',
                    'Om en anställd arbetar på en söndag eller helgdag får de skifttimmar × 1,5.',
                ],
            },
        ],
        '2026-05-01': [
            {
                title: 'Tillägg till extra timmar (X-timer)',
                description: [
                    'En ny kolumn har lagts till som visar namnet på personen som skapade posten för extra timmar.',
                    'En ny kolumn och motsvarande fält för avdelningar har lagts till för extra timmar.',
                    'Extra timmar är nu också synliga inom utkast till tjänstgöringsscheman.',
                ],
            },
            {
                title: '⏱ Förbättringar av tidsregistrering',
                description: [
                    'Anställda kan nu begära registrering av en missad incheckning.',
                    'Dessa förfrågningar måste godkännas av en administratör innan de registreras.',
                    'Administratörer kan nu redigera befintliga tidsloggposter.',
                ],
            },
            {
                title: '💊 Förbättringar av medicineringsöversikt',
                description: [
                    'Antalet tabletter/dosering visas nu tydligt och framträdande för varje medicinering.',
                    'Medicineringsöversikten skiljer nu tydligt mellan PN-medicinering (vid behov) och regelbunden (schemalagd) medicinering.',
                    'Filtreringsalternativ har lagts till: visa alla mediciner, endast PN-medicinering eller endast regelbunden medicinering.',
                    'Det är nu möjligt att sortera kolumner i medicineringsöversikten alfabetiskt (t.ex. efter medicineringsnamn) och numeriskt (t.ex. efter dosering).',
                    'Det är nu möjligt att se alla mediciner samtidigt, istället för att vara begränsad till 10 poster per sida.',
                ],
            },
            {
                title: '👥 Tilldelning av anställdgrupper till medborgare',
                description: [
                    'Det är nu möjligt att tilldela en anställdgrupp till en medborgare, och vice versa – från anställdgruppen, tilldela en eller flera medborgare; från medborgarprofilen, tilldela en eller flera anställdgrupper.',
                    'När en anställdgrupp tilldelas en medborgare tilldelas automatiskt alla anställda inom den gruppen till medborgaren.',
                    'Denna tilldelning fungerar på samma sätt som att tilldela en anställd direkt via "Tilldelade medborgare" eller tilldela en kontakt via "Kontakter" på medborgaren.',
                    'Relationen förblir synkroniserad: om en anställd läggs till eller tas bort från gruppen uppdateras medborgartilldelningen automatiskt.',
                    'Om en anställdgrupp tas bort från en medborgare avtilldelas också alla associerade anställda (såvida de inte tilldelats manuellt någon annanstans).',
                ],
            },
            {
                title: '📥 Exportfunktion för behandling',
                description: [
                    'Det är nu möjligt att ladda ner/exportera behandlingar tillsammans med deras status, liknande den befintliga exporten av medicineringshistorik.',
                    'Exporten innehåller behandlingsdetaljer och aktuell status (t.ex. aktiv, avslutad osv.).',
                ],
            },
            {
                title: '📩 Förbättringar för förfrågningar (Henvendelser)',
                description: [
                    'Förfrågningar kan nu tilldelas en avdelning, liknande hur det fungerar för medborgare.',
                    'Ett nytt "Avdelning"-fält har lagts till i förfrågningsformuläret.',
                    'På förfrågningssidan är det nu möjligt att filtrera förfrågningar efter avdelning och exportera förfrågningar per avdelning.',
                    'Förfrågningskategorierna "Härbärgen och vårdhem" och "Kriscenter" kan nu döpas om i Inställningar → Övrigt → Ordlista (t.ex. till §110 och §109).',
                    'Fälten "Namn på frågeställare" och "Datum för förfrågningar" kan nu döpas om i Inställningar → Övrigt → Ordlista.',
                    'Fälten "Egna anteckningar" och "Syfte" kan nu tas bort via Inställningar → Övrigt → Ordlista.',
                ],
            },
            {
                title: '💊 Medicinering – Visning av handelsnamn',
                description: [
                    'Handelsnamnet på en medicinering (t.ex. Panodil) visas nu tydligt tillsammans med eller som en del av medicineringsinformationen.',
                ],
            },
            {
                title: '🔔 Påminnelser och uppgiftslista',
                description: [
                    'Det är nu tydligare synligt om en påminnelse är markerad som "Slutförd".',
                    'En logg har lagts till som visar vilken användare som slutförde en påminnelse.',
                    'Påminnelsefunktionen fungerar nu som en fullständig uppgiftslista, inspirerad av Apples Påminnelser-app.',
                    'En översikt över påminnelser har lagts till på dashboarden/startsidan.',
                ],
            },
            {
                title: '🔁 Mall för tjänstgöringsschema – Kopiera över flera veckor',
                description: [
                    'Det är nu möjligt att kopiera kortare källveckor till flera på varandra följande framtida veckor när du skapar en mall för tjänstgöringsschema.',
                    'Exempel: kopiera 1 vecka till 2, 3, 4 eller fler på varandra följande veckor.',
                ],
            },
            {
                title: '📇 Företagskontakter och adressbok',
                description: [
                    'Företagskontakter kan nu skapas på samma sätt som medborgarkontakter.',
                    'Alla kontakter (t.ex. läkare, handläggare etc. – inte anhöriga) lagras nu centralt i systemet så att de kan återanvändas och tilldelas flera medborgare.',
                    'En företagsövergripande adressbok har införts där kontakter lagras centralt och kan väljas vid behov.',
                ],
            },
            {
                title: '🔐 Inloggningsbegränsning efter IP/enhet',
                description: [
                    'Administratörer kan nu begränsa inloggningsåtkomst baserat på IP-adress och/eller enhet.',
                    'Specifika IP-adresser (t.ex. kontorets nätverk) kan vitlistas.',
                    'Eventuellt kan åtkomst begränsas till godkända enheter.',
                    'Användare utanför tillåtna IP-adresser/enheter blockeras eller måste genomföra ytterligare verifiering.',
                ],
            },
            {
                title: '⚙️ Konfiguration av skifttyp',
                description: [
                    'Under Skifttyper är det nu möjligt att definiera att 1 arbetstimme motsvarar 0,75 timmar (valfritt), och denna regel kan också tillämpas inom ett specifikt tidsintervall.',
                    'För "Sovande nattskift" är det nu möjligt att definiera en standardsluttid som är 1, 2 eller fler dagar senare.',
                ],
            },
            {
                title: '🧩 Roller och behörigheter',
                description: [
                    'Koordinatorrollen och roller generellt har granskats och förbättrats så att administratörer inte längre behöver tilldela fullständiga "Administratör"-rättigheter i onödan.',
                    'En tydlig översikt och förklaring av hur specifika behörigheter fungerar har tillhandahållits.',
                    'Det är nu möjligt att definiera en rollhierarki (t.ex. Administratör har högre privilegier än Chef).',
                    'Specialiserade domänspecifika roller kan nu skapas (t.ex. "Medicineringsansvarig") för att kontrollera åtkomst till specifika moduler.',
                    'Flera roller kan nu tilldelas en enskild anställd (flerval), och systemet kombinerar behörigheter från alla tilldelade roller.',
                ],
            },
            {
                title: '📅 Tjänstgöringsschema – Års- och halvårsvy per anställd',
                description: [
                    'En års- och halvårsvy har lagts till i tjänstgöringsschemat.',
                    'Vyn kan visas per enskild anställd, och visar deras tilldelade skift och en översikt över tid.',
                ],
            },
        ],
        '2026-04-24': [
            {
                title: '🏷 Taggar och filtrering – Utkast till tjänstgöringsschema',
                description: [
                    'Taggar är nu synliga när skift kopieras i utkastet till tjänstgöringsschema.',
                    'Utkastet beter sig nu identiskt med det publicerade schemat, inklusive taggar och filtreringsfunktionalitet.',
                ],
            },
            {
                title: '📢 Öppna skift i utkast',
                description: [
                    'Det är nu möjligt att skapa ett öppet skift direkt i utkastet till tjänstgöringsschema, vilket matchar beteendet i den utökade utkastsvyn.',
                    'Skiftet publiceras och utlöser aviseringar först när utkastet officiellt släpps.',
                ],
            },
            {
                title: '🔔 Nyheter och uppdateringar – Aviseringsräknare',
                description: [
                    'Aviseringsräknaren för "Nyheter" och "Uppdateringar" nollställs nu omedelbart efter att användaren har sett den.',
                    'Denna återställning sker varje gång användaren öppnar "Nyheter" eller "Uppdateringar".',
                ],
            },
            {
                title: 'Avdelningskolumn i exporter av tjänstgöringsscheman',
                description: [
                    'Vid export av ett tjänstgöringsschema inkluderas en "Avdelning"-kolumn och placeras före kolumnen "Anställdsnamn".',
                ],
            },
            {
                title: 'Sortering av tjänstgöringsschema – anställda i tjänst idag',
                description: [
                    'När växeln "i tjänst idag" är aktiverad sorteras anställda nu med början från de vars skift börjar tidigast.',
                ],
            },
            {
                title: '📍 Anställdas incheckning – Geolokalisering',
                description: [
                    'Geolokalisering registreras nu när anställda checkar in.',
                    'Systemet registrerar platsen (latitud/longitud) vid tidpunkten för incheckning.',
                    'Platsen kan eventuellt visas på en kartvy.',
                ],
            },
            {
                title: '📧 Appar – E-postaktivering',
                description: [
                    'När "Mail"-appen aktiveras laddas sidan nu automatiskt om så att Mail-modulen omedelbart blir synlig i vänster sidofält.',
                ],
            },
            {
                title: 'Fördelning av skifttyper',
                description: [
                    'Skifttypsfördelning kan nu filtreras efter start- och slutdatum/-tid och efter anställd.',
                ],
            },
            {
                title: '🏠 Förbättringar av rumshantering',
                description: [
                    'Det är nu möjligt att byta namn på etiketten "Rum" i ordlistan/uppslagsverket.',
                    'En ordentlig översikt över rum och deras tillgänglighet är nu tillgänglig.',
                    'Upptagna rum kan inte längre väljas – endast lediga rum är valbara.',
                ],
            },
            {
                title: '⏱ Flerdagsskift',
                description: [
                    'Skift som sträcker sig över flera dagar (2–3 dagar eller mer) behandlas nu som ett kontinuerligt skift.',
                    'Inga varningar utlöses för regeln om maximalt 13-timmars skift eller 11-timmars vilotidsregeln för sådana skift.',
                ],
            },
            {
                title: '🩺 Godkännande av sjukfrånvaro och semester',
                description: [
                    'Administratörer måste nu godkänna sjukfrånvaro och semesterförfrågningar som lämnats in av anställda via tjänstgöringsschemat innan de registreras.',
                ],
            },
            {
                title: '💊 Medicinering – Schemalagd period och extra dagar',
                description: [
                    'Det är nu möjligt att schemalägga medicinadministrering under en angiven period, istället för att kräva daglig administrering.',
                    'Det är också möjligt att lägga till enskilda extra medicineringsdagar på specifika datum.',
                    'Exempel: ett barn som vanligtvis vistas på helger kan få medicinering tillagd för en specifik extra veckodag utan att ändra det ordinarie schemat.',
                ],
            },
            {
                title: '💊 Medicinadministrering – Flexibel registrering',
                description: [
                    'Det är nu möjligt att administrera, registrera och markera avvikelser för medicinering mycket mer flexibelt.',
                ],
            },
            {
                title: '💊 Medicinerings-UI – Flera administreringstider',
                description: [
                    'Medicinerings-UI:t stöder nu visning av flera administreringstider för en enskild medicinering.',
                    'Varje medicineringspost visar tydligt alla schemalagda tider (t.ex. morgon, middag, kväll, natt eller specifika tidsstämplar).',
                    'Tider grupperas visuellt under samma medicinering så att det är tydligt att de hör till samma recept.',
                ],
            },
            {
                title: '💊 PN-medicinering – Ingen fast administreringstid',
                description: [
                    'PN-medicinering (vid behov) har inte längre någon fast administreringstid, eftersom den ges efter behov.',
                ],
            },
            {
                title: '💊 Medicineringslager – Korrigering av lagerberäkning',
                description: [
                    'Problem med felaktiga beräkningar av medicineringslager har utretts och åtgärdats.',
                    'Lagernivåer återspeglar nu alltid korrekta kvantiteter baserat på registreringar.',
                    'Lagervärden kan inte längre sjunka under noll.',
                ],
            },
            {
                title: '💊 Medicinering – Datum- och tidsvisning',
                description: [
                    'Kolumnen för administreringsdatum för både regelbunden och PN-medicinering inkluderar nu också den exakta administreringstiden.',
                ],
            },
            {
                title: '💊 Medicineringsöversikt – Ytterligare fält',
                description: [
                    'Medicineringsöversikten visar nu också "Maxdos per administrering" och "Beskrivning".',
                    'För PN-medicinering visas nu fältet "Maxdos per administrering", i linje med regelbunden medicinering.',
                ],
            },
            {
                title: '⚠️ Varningskonfiguration – Tjänstgöringsschema',
                description: [
                    'Det är nu möjligt att inaktivera varningarna "13-timmars skift", "11-timmars vilotidsregel" och "48-timmarsregel" i tjänstgöringsschemat.',
                ],
            },
            {
                title: '📌 Förbättringar av anslagstavlan',
                description: [
                    'Varje inlägg visar nu författare och tidsstämpel (datum och tid för skapande).',
                    'Endast den ursprungliga författaren till ett inlägg eller en administratör kan redigera det.',
                    'Flera inlägg kan nu markeras/fästas samtidigt.',
                    'Inlägg på dashboarden visas nu i listformat med titel och en kort förhandsvisning. Användare kan klicka på ett inlägg för att se hela innehållet.',
                ],
            },
            {
                title: '💊 PN-medicinering – Effektutvärdering',
                description: [
                    'Efter administrering av PN-medicinering (vid behov) kan användare nu utföra en effektutvärdering.',
                    'Klicka på "Utför effektutvärdering" för att ange och spara anteckningar, resultat eller observationer av effekt.',
                    'Flera effektutvärderingar kan utföras för samma medicineringspost.',
                ],
            },
        ],
        '2026-04-10': [
            {
                title: 'Förbättringar av meddelande-UI och radering av chatthistorik',
                description: [
                    'Meddelandegränssnittet har uppdaterats med ett förbättrat UI för en bättre användarupplevelse.',
                    'Det är nu möjligt att radera en hel chatthistorik direkt från konversationslistan.',
                ],
            },
            {
                title: 'Avdelningskolumn i exporter av tjänstgöringsscheman',
                description: [
                    'Vid export av ett tjänstgöringsschema inkluderas nu en "Avdelning"-kolumn i exporten.',
                    'Avdelningskolumnen placeras före kolumnen "Anställdsnamn".',
                ],
            },
            {
                title: '💸 Utgifter',
                description: [
                    'Ett medborgarfält har lagts till för utgifter, vilket gör det möjligt att koppla utgifter till en specifik medborgare.',
                    'Utgifter visas nu under avsnittet "Ekonomi" på medborgarprofilen, i en dedikerad "Utgifter"-flik vid sidan av den befintliga "Plånböcker"-fliken.',
                    'Utgifter kan nu redigeras efter avslag.',
                    'Utgifter kan också redigeras efter ersättning (utgift utbetald).',
                ],
            },
            {
                title: '🕒 Justeringar av arbetstid – Geolokaliseringsspårning',
                description: [
                    'Geolokalisering registreras nu vid start och slut av arbetstid.',
                    'Ingen kilometerspårning krävs – endast platsen vid start och slut.',
                    'En grön markör visas för startplatsen och en röd markör för slutplatsen.',
                ],
            },
            {
                title: '📌 Fästa journalanteckningar',
                description: [
                    'Det är nu möjligt att fästa journalanteckningar på en medborgare.',
                    'Fästa anteckningar visas högst upp i listan över journalanteckningar och förblir synliga oavsett sortering eller filtrering.',
                    'Anteckningar kan enkelt fästas och lossas, och flera anteckningar kan fästas samtidigt.',
                    'Detta hjälper personalen att lyfta fram viktig eller kritisk information och förbättrar översikt och tillgänglighet.',
                ],
            },
            {
                title: '🔐 Sidåtkomst – Synlighet för tjänstgöringsschema',
                description: [
                    'Ett alternativ har lagts till för att dölja eller ta bort åtkomst till sidan "Tjänstgöringsschema", i linje med hur andra sidor hanteras.',
                    'När den är dold visas inte sidan Tjänstgöringsschema i vänster sidofält.',
                ],
            },
            {
                title: '👤 Skapande av medborgare och kontakt – Automatisk ifyllning av postnummer',
                description: [
                    'Vid skapande av en medborgare, anhörig eller annan kontakt fyller systemet nu automatiskt i fälten Ort, Region och Kommun när ett postnummer anges.',
                ],
            },
            {
                title: 'Filtrera efter arkiverade/icke-arkiverade anställda i exporter av tjänstgöringsscheman',
                description: [
                    'Det är nu möjligt att filtrera efter arkiverade och/eller icke-arkiverade anställda vid export av tjänstgöringsscheman.',
                ],
            },
            {
                title: '👤 Behörigheter för att skapa medborgare',
                description: [
                    'Skapande av medborgare är inte längre begränsat till administratörsprofiler.',
                    'En ny behörighet "Skapa medborgare" har införts, som kan tilldelas vilken roll som helst – inklusive standardanvändarrollen – under "Roller" i katalogen.',
                    'Detta gör det möjligt för administratörer att kontrollera vilka användare som har behörighet att skapa medborgare.',
                ],
            },
            {
                title: 'Sluta kopiera från nuvarande position',
                description: [
                    'Det är nu möjligt att stoppa en kopieringsprocess från den nuvarande positionen i schemat.',
                    'Tidigare krävdes att man navigerade tillbaka till det ursprungliga startdatumet för att stoppa kopieringen. Detta är inte längre nödvändigt.',
                ],
            },
            {
                title: '"Komptid" omdöpt till "Komptid i år"',
                description: [
                    'Etiketten "Komptid" har bytt namn till "Komptid i år" för tydlighetens skull.',
                ],
            },
            {
                title: '📊 Förbättringar av tidsloggar',
                description: [
                    'Ett medborgarfält har lagts till för tidsloggar, vilket gör det möjligt att koppla tidsloggar till en specifik medborgare.',
                    'Tidsloggar visas nu på medborgarprofilen.',
                    'Statistik, filtrering och export av tidsloggdata är nu tillgängligt, vilket matchar funktionaliteten för insatstimmar.',
                ],
            },
            {
                title: '11-timmars- och 48-timmarsregel – Uteslutning av frånvarotyp',
                description: [
                    '11-timmarsregeln och 48-timmarsregeln räknar inte längre semestertimmar, sjuktimmar eller andra skift markerade som "frånvarotyper" vid beräkning av regelöverträdelser.',
                    'Dessa frånvarotypsskift kan fortfarande räknas och beräknas mot normtimmar.',
                    'Varningsindikatorn har ändrats till en varningstriangelikon för att minska visuellt brus, eftersom den visades för ofta.',
                ],
            },
            {
                title: '📤 Medborgarexport per avdelning (härbärge och kriscenter)',
                description: [
                    'För kategorierna "Härbärge" och "Kriscenter" stöder medborgarexporten nu filtrering och export av medborgare per avdelning.',
                    'Varje avdelnings data kan exporteras separat, liknande hur "Exportera förfrågningar" fungerar.',
                ],
            },
            {
                title: 'Behörigheter för anställda att radera – Kalenderhändelser',
                description: [
                    'Anställda har inte längre behörighet att radera objekt som standard, förutom kalenderhändelser.',
                    'En dedikerad raderingsbehörighet för kalenderhändelser har lagts till under roller och kan tilldelas rollen "Vanlig användare" och andra roller.',
                ],
            },
            {
                title: '🎯 UI-förbättringar – Indikatorer i tjänstgöringsschema och skiftanteckningar',
                description: [
                    'Gröna och röda indikatorer i tjänstgöringsschemat har nu ett verktygstips vid muspekare som förklarar deras betydelse.',
                    'Skiftanmärkningar/-anteckningar är nu tillgängliga via ett verktygstips vid muspekare på en ikon som visas direkt på skiftet i tjänstgöringsschemat.',
                ],
            },
            {
                title: 'X-timer (extra timmar) tillägg',
                description: [
                    'En kolumn som visar namnet på personen som skapade posten för extra timmar har lagts till.',
                    'En avdelningskolumn och motsvarande fält har lagts till för extra timmar.',
                    'Extra timmar inkluderas nu också inom utkast till tjänstgöringsscheman.',
                ],
            },
            {
                title: '⏱ Förbättringar av tidsregistrering',
                description: [
                    'Anställda kan nu begära registrering av en missad incheckning direkt i systemet.',
                    'Dessa förfrågningar måste granskas och godkännas av en administratör innan de registreras.',
                    'Administratörer kan nu redigera befintliga tidsloggposter.',
                ],
            },
        ],
        '2026-02-20': [
            {
                title: 'Skapande och redigering av dokument online',
                description: [
                    'Användare kan nu skapa och redigera dokument direkt online i systemet.',
                    'Systemgenererade dokument kan laddas ner som PDF-filer.',
                    'Uppladdade dokument (Word- och Pages-format) kan också redigeras online.',
                    'Det är möjligt att se dokument i skrivskyddat läge utan att aktivera redigering.'
                ],
            },
            {
                title: 'Översikt över komptid och semestertimmar',
                description: [
                    'Anställda kan nu se en översikt över komptid och semestertimmar för en vald period.',
                    'Detta ger bättre transparens och planering av tillgänglig ledighet.'
                ],
            },
            {
                title: 'Automatisk uppföljningsmarkering på medborgarrapporter',
                description: [
                    'Formulär kan nu konfigureras för att automatiskt markera inlämnade medborgarrapporter efter en angiven tidsperiod som personalen ställer in.',
                    'Markerade rapporter visas i den allmänna medborgaröversikten, i Översikten (i en dedikerad ruta) och på medborgarens profilsida.',
                    'Denna funktionalitet måste aktiveras av en administratör på det specifika formuläret innan den kan användas.'
                ],
            },
            {
                title: 'Konfigurerbara timmar för insatsspårning',
                description: [
                    'Administratörer kan nu konfigurera antalet timmar för insatsspårning i systeminställningarna.',
                    'Standardvärdet på 24 timmar kan justeras till valfritt antal timmar.'
                ],
            },
            {
                title: 'Tidsregistreringsflik för anställda',
                description: [
                    'En dedikerad flik för tidsregistrering har lagts till för anställda.',
                    'Detta centraliserar och förenklar tidsspårning och registreringar.'
                ],
            },
            {
                title: 'AI-prompting med filbilaga och åtkomst till intern data',
                description: [
                    'AI-prompting stöder nu filbilagor som en del av förfrågan.',
                    'AI:n kan komma åt relevant intern systemdata (baserat på behörigheter) för att ge mer korrekta och kontextuella svar.'
                ],
            },
            {
                title: 'Taggar på extra timmar',
                description: [
                    'Det är nu möjligt att lägga till taggar på poster med extra timmar.',
                    'Detta förbättrar kategorisering, filtrering och rapportering av ytterligare arbetade timmar.'
                ],
            },
            {
                title: 'Användarspecifika e-postsignaturer',
                description: [
                    'Användare kan nu skapa och hantera sina egna e-postsignaturer.',
                    'E-postsignaturer kan konfigureras individuellt per användare.'
                ],
            },
            {
                title: 'Grafvisualisering av komptid',
                description: [
                    'Komptid visualiseras nu i en graf baserad på normtimmar.',
                    'Grafen visas när man klickar på komptidstimmar, under timvyn i den befintliga popup-modalen.'
                ],
            },
            {
                title: 'Länkade års- och veckonormtimmar',
                description: [
                    'Ett nytt fält för veckonormtimmar har lagts till och länkats till fältet för årsnormtimmar i formuläret för att skapa/redigera anställd.',
                    'Båda fälten beräknar och uppdaterar automatiskt varandra baserat på ett 52-veckors år.',
                    'Värdet för veckonormtimmar visas också under årsnormtimmarna i vyn för tjänstgöringsschema.'
                ],
            },
            {
                title: 'Export baserat på filtrerad vy av tjänstgöringsschema',
                description: [
                    'Det är nu möjligt att exportera data baserat på de filter som för närvarande är tillämpade i vyn för tjänstgöringsschema.',
                    'Användare kan ladda ner den filtrerade vyn som den visas på skärmen.',
                    'Tjänstgöringsschemat kan exporteras i CSV-format med antingen semikolonseparerade eller kommaseparerade värden.'
                ],
            },
            {
                title: 'Klassificering av frånvaroskifttyp och exportalternativ',
                description: [
                    'Skifttyper kan nu markeras som "frånvaroskifttyper".',
                    'Exporter kan konfigureras för att inkludera endast frånvaroskifttyper, endast vanliga tjänstgöringsskift eller båda kombinerade i en enda exportfil.'
                ],
            },
            {
                title: 'Lösenordsskyddad skrivskyddad delning',
                description: [
                    'Tjänstgöringsscheman och journaler kan nu delas via lösenordsskyddade länkar.',
                    'Mottagare kan komma åt det delade innehållet i skrivskyddat läge utan att logga in i systemet.'
                ],
            },
            {
                title: 'Begränsa synligheten av historiska skift',
                description: [
                    'Administratörer kan konfigurera i inställningarna om anställda ska få se andra anställdas historiska tjänstgöringsskift.',
                    'Oavsett denna inställning kan anställda aldrig se andra anställdas timdata.'
                ],
            },
            {
                title: 'Förbättrade alternativ för datumväljare',
                description: [
                    'Datumväljaren i översikten gör det nu möjligt för användare att snabbt välja mellan dagens datum, de kommande 7 dagarna eller ett anpassat datumintervall.',
                    'Detta ger mer flexibilitet vid navigering och granskning av data.'
                ],
            },
            {
                title: 'Semesterregistrering med alternativ för komptid',
                description: [
                    'Vid registrering av semester kan användare markera den som komptid (afspadsering), både vid skapande och redigering.',
                    'Om den är markerad förblir kryssrutan vald.',
                    'Om komptid markeras vid redigering efter skapande justerar systemet komptidssaldot baserat på semesterskifttimmarna.'
                ],
            },
            {
                title: 'Indikation av transportanvändning för ersättning',
                description: [
                    'Anställda kan ange när transport har använts och ska ersättas.',
                    'Detta säkerställer korrekt spårning och ersättning av transportutgifter.'
                ],
            },
            {
                title: 'Lönekod / lönepost per skifttyp',
                description: [
                    'Varje skifttyp kan nu innehålla ett fält för lönekod eller lönepost.',
                    'Detta fält inkluderas i skiftexporter och lönerapporter för att säkerställa korrekt lönehantering.'
                ],
            },
            {
                title: 'Aviseringar för skiftrotation',
                description: [
                    'Anställda får en avisering när en ny skiftrotation rullas ut.',
                    'Aviseringar skickas också när ändringar görs i en befintlig skiftrotation.'
                ],
            },
            {
                title: 'Anställningens slutdatum med automatisk avstängning av åtkomst',
                description: [
                    'Ett fält för anställningens slutdatum är tillgängligt i formulären för att skapa, redigera och visa anställd.',
                    'När slutdatumet har nåtts inaktiveras den anställdes åtkomst automatiskt.'
                ],
            },
            {
                title: 'Behandlingar opåverkade av datumväljare i översikten',
                description: [
                    'Avsnittet Behandlingar påverkas inte längre av datumväljaren i översikten.',
                    'Alla pågående (aktiva) behandlingar visas oavsett valt datumintervall.'
                ],
            },
        ],
        '2026-01-30': [
            {
                title: 'Alternativ för att ändra etikett i ordlistelistan',
                description: [
                    'Användare kan nu ändra etiketten "Avdelning" i ordlistelistan.',
                    'Detta anpassningsalternativ förbättrar flexibiliteten i terminologi över hela systemet.'
                ],
            },
            {
                title: 'Spara rapporter som utkast',
                description: [
                    'Användare har nu möjlighet att spara rapporter som utkast inom planer-, mål- och dokumentavsnitten.',
                    'Detta gör det möjligt för användare att komma tillbaka, redigera sina utkast och publicera dem vid ett senare tillfälle.'
                ],
            },
            {
                title: 'Avdelningsspecifika taggar',
                description: [
                    'Taggar kan nu göras avdelningsspecifika, vilket förbättrar kategorisering och filtrering baserat på avdelningskontext.',
                    'Detta säkerställer bättre organisation och relevans av taggar för varje avdelning.'
                ],
            },
            {
                title: 'Visa planer, mål och delmål i Översikten',
                description: [
                    'Planer, mål och delmål visas nu i Översikten, grupperade efter medborgare.',
                    'Detta förbättrar den dagliga granskningsprocessen och gör det lättare att spåra framsteg för specifika individer.'
                ],
            },
            {
                title: 'Visa schemafack i Översikten',
                description: [
                    'Schemafack är nu synliga i Översikten.',
                    'Denna funktion ger en tydligare och mer organiserad vy av schemalagda aktiviteter för dagen.'
                ],
            },
            {
                title: 'Indikera transportanvändning för ersättning',
                description: [
                    'Anställda kan nu ange att de har använt transport och därför har en utgift som ska ersättas.',
                    'Denna funktion säkerställer att anställda enkelt kan rapportera transportutgifter för ersättningshantering.'
                ],
            },
            {
                title: 'Fält för lönekod / lönepost per skifttyp',
                description: [
                    'Ett fält för lönekod eller lönepost har lagts till per skifttyp, och detta inkluderas i skiftexporter och rapporter.',
                    'Detta möjliggör bättre lönespårning och rapportering, och säkerställer korrekt lönehantering.'
                ],
            },
            {
                title: 'Fält för anställningens slutdatum för anställdregister',
                description: [
                    'Ett fält för anställningens slutdatum har lagts till i formulären för att skapa, redigera och visa anställd.',
                    'När slutdatumet har nåtts inaktiveras den anställdes åtkomst automatiskt, vilket säkerställer säker och tidsenlig åtkomstkontroll.'
                ],
            },
        ],
        '2026-01-23': [
            {
                title: 'Begränsningar för redigering av journalanteckningar',
                description: [
                    'Vanliga anställda kan nu endast redigera sina egna journalanteckningar, och endast inom 24 timmar efter skapandet.',
                    'Efter 24-timmarsfönstret kan endast administratörer redigera journalanteckningar för att säkerställa spårbarhet och starkare innehållsstyrning.'
                ],
            },
            {
                title: 'Optimerad prestanda för medicinöversikt',
                description: [
                    'Medicinöversikten har optimerats för förbättrade laddningstider och responsivitet, särskilt för större datamängder.',
                    'Översikten hämtar och visar nu tillförlitligt hela listan över mediciner för att stödja fullständig planering och granskning.'
                ],
            },
            {
                title: 'Isolering av åtkomst till avdelningsdata',
                description: [
                    'Användare är nu begränsade till att endast se data för sina tilldelade avdelningar.',
                    'Synlighet mellan avdelningar (t.ex. användare från avdelning A som ser avdelningarna B, C, D) är inte längre tillåten, vilket stärker integritet och åtkomstkontroll.'
                ],
            },
            {
                title: 'Uppdaterat UI för Glömt lösenord, Återställ lösenord och Konfigurera lösenord',
                description: [
                    'Sidorna för glömt lösenord, återställ lösenord och konfigurera lösenord har uppdaterats för att matcha det uppdaterade inloggnings-UI:t.',
                    'Förbättringar inkluderar konsekvent layout, mellanrum och komponentstil för en renare, mer sammanhängande autentiseringsupplevelse på alla enheter.'
                ],
            },
            {
                title: 'Alternativ för datumfiltrering tillagda i översikten',
                description: [
                    'Ett nytt datumfilter har lagts till i översikten för att förenkla planering och granskning per tidsram.',
                    'Användare kan nu filtrera efter Idag, Nästa 7 dagar eller ett anpassat datumintervall.'
                ],
            },
        ],
        '2026-01-16': [
            {
                title: 'UI-uppdateringar för Inloggning, Registrering och Glömt lösenord',
                description: [
                    'Sidorna för inloggning, registrering och glömt lösenord har uppdaterats med ett nytt UI för en renare och mer konsekvent upplevelse.',
                    'Förbättrad layout, mellanrum och komponentstil gör autentiseringsflöden lättare att navigera på alla enheter.'
                ],
            },
            {
                title: 'Granulära behörigheter för katalogroller',
                description: [
                    'Det är nu möjligt att tilldela specifika behörigheter inom rollområdet i katalogen, vilket möjliggör mer finjusterad åtkomstkontroll.',
                    'Du kan till exempel skapa en "Tjänstgöringskoordinator"-roll som endast har åtkomst till tjänstgöringsschemat (och inte andra områden).',
                    'Denna metod stöder ytterligare rolltyper och behörighetskombinationer efter behov för organisationen.'
                ],
            },
            {
                title: 'Lagt till "Sugtabletter" i listan över doseringsformer',
                description: [
                    'Alternativet "Sugtabletter" har lagts till i listan "Doseringsform" i formulären för att skapa/redigera medicin.',
                    'Detta förbättrar stödet för att hantera olika doseringsformer för medicinering konsekvent över hela systemet.'
                ],
            },
            {
                title: 'Ladda ner medicineringsöversikt från medicinkort',
                description: [
                    'Ett nytt alternativ på medicinkortet gör det möjligt för användare att ladda ner en medicineringsöversikt.',
                    'Översikten innehåller alla mediciner och deras schemalagda administreringstider, och ger en lättdelad referens för planering och dokumentation.'
                ],
            },
            {
                title: 'Medicinadministrering på fasta veckodagar',
                description: [
                    'Medicineringsscheman kan nu konfigureras för att administreras på fasta veckodagar (t.ex. måndagar, onsdagar och fredagar).',
                    'Detta ger flexibilitet för återkommande administreringsmönster som inte följer dagliga intervall.'
                ],
            },
            {
                title: 'Publicerade versioner av schemautkast',
                description: [
                    'Scheman stöder nu utkast- och publicerade versioner, vilket gör det möjligt att förbereda ändringar innan de blir aktiva.',
                    'Administratörer kan granska och justera utkast innan publicering, vilket säkerställer att uppdateringar släpps på ett kontrollerat sätt.'
                ],
            },
            {
                title: 'Åtkomst till barnprofil',
                description: [
                    'Stöd för åtkomst till barnprofil har lagts till, vilket gör det möjligt för lämpliga användare att komma åt och hantera barnprofiler enligt behörighet.',
                    'Detta förbättrar användbarheten för organisationer som hanterar vård och schemaläggning för barn samtidigt som åtkomstkontroller upprätthålls.'
                ],
            },
            {
                title: 'Läsbekräftelser för meddelanden',
                description: [
                    'Meddelanden inkluderar nu läsbekräftelser så att avsändare kan se när meddelanden har lästs.',
                    'Detta förbättrar kommunikationstydligheten och minskar behovet av manuella uppföljningar.'
                ],
            },
        ],
        '2026-01-09': [
            {
                title: 'Återkommande händelser i kalendern',
                description: [
                    'Vid redigering av en enskild händelse uppmanar systemet nu användare att välja om ändringarna ska tillämpas på endast denna händelse eller alla framtida händelser.',
                    'Denna funktionalitet säkerställer mer flexibilitet och kontroll över återkommande händelser.'
                ],
            },
            {
                title: 'Automatisk återkommande veckorotation i tjänstgöringsschema',
                description: [
                    'Administratörer kan nu skapa automatiska återkommande veckorotationer i tjänstgöringsschemat, såsom en 8-veckors rotation, som upprepas tills den stoppas manuellt.',
                    'Systemet uppmanar administratörer vid redigering av ett tjänstgöringsskift inom en återkommande rotation och frågar om redigeringen ska tillämpas endast på detta skift eller hela det återkommande mönstret.'
                ],
            },
            {
                title: 'Möjlighet att söka efter en specifik dag i skiftschemat och kalendern',
                description: [
                    'Användare kan nu söka efter en specifik dag i skiftschemat och kalendern, vilket möjliggör mer exakt navigering utan att behöva bläddra vecka för vecka.',
                    'Denna förbättring inkluderar också möjligheten att navigera per månad.'
                ],
            },
            {
                title: 'Filteralternativ i skiftplaner',
                description: [
                    'Översikten över skiftplaner inkluderar nu filteralternativ för att välja en eller flera anställda.',
                    'Dessutom har filter för anställningsstatus lagts till, vilket möjliggör mer skräddarsydd planering och tydlighet.'
                ],
            },
            {
                title: 'Visa anställdas skift över avdelningar',
                description: [
                    'Användare kan nu växla synligheten av skift över avdelningar för alla anställda.',
                    'Denna funktion är endast tillgänglig om flera avdelningar har konfigurerats i organisationen.'
                ],
            },
            {
                title: 'Förbättringar av hantering av flerdagsskift',
                description: [
                    'Vid skapande av skift som sträcker sig över flera dagar delar systemet nu automatiskt upp dem i separata skift för varje dag.',
                    'En visuell koppling, såsom en linje eller start/slut-text, läggs till för att indikera skiftets kontinuitet över dagar.'
                ],
            },
            {
                title: 'Förbättringar av skiftskapandeflödet',
                description: [
                    'Skiftskapandeflödet har optimerats: användare måste först välja skifttyp innan andra visningsalternativ visas.',
                    'Avdelningsfältet fylls nu automatiskt i med den valda avdelningen som standard, men det kan ändras under skapandeprocessen.'
                ],
            },
            {
                title: 'Kom ihåg vald avdelning i toppfältet',
                description: [
                    'När en avdelning har valts i toppfältet förblir den vald för framtida åtgärder tills den ändras.',
                    'Detta effektiviserar processen för administratörer och schemaläggare som arbetar inom en specifik avdelning.'
                ],
            },
            {
                title: 'Skapa anpassade jobbtitlar under "Kontakter" på medborgare',
                description: [
                    'Administratörer kan nu skapa anpassade jobbtitlar under avsnittet "Kontakter" för medborgare.',
                    'Detta hjälper till att spåra specifika roller eller titlar inom organisationen.'
                ],
            },
            {
                title: 'Fäst dig själv i skiftschemat',
                description: [
                    'Användare kan nu fästa sig själva i skiftschemat för att säkerställa att de alltid visas högst upp i listan.',
                    'Denna funktion hjälper användare att enkelt identifiera sina skift, särskilt i stora team.'
                ],
            },
            {
                title: 'Semesterschemaläggning och skiftersättning',
                description: [
                    'När en anställd skapar en semesterförfrågan tas befintliga skift automatiskt bort och erbjuds andra för ersättning, liknande hantering av sjukfrånvaro.'
                ],
            },
            {
                title: 'Optimering av tjänstgöringsskifterbjudande',
                description: [
                    'Tjänstgöringsskifterbjudanden har optimerats för att endast visa skift som är relevanta för den tilldelade avdelningen.',
                    'Ett jobbtitelfält gör det nu möjligt att lägga till flera titlar, och nattskift som sträcker sig över flera dagar kan erbjudas som ett enda skift.'
                ],
            },
            {
                title: 'Kalenderavdelningsfilter',
                description: [
                    'Händelser i kalendern filtreras nu efter den valda avdelningen, vilket säkerställer att användare endast ser händelser som är relevanta för deras avdelning.',
                    'Starttiden för händelser ställs automatiskt in till 1 timme senare än starttiden tills den justeras manuellt.',
                    'Anställdsfältet på en händelse visar nu endast anställda från den valda avdelningen.'
                ],
            },
            {
                title: 'Inkludering av roll i exportfiler',
                description: [
                    'Vid export av anställda inkluderas rollfältet nu i exportfilen.',
                    'Detta säkerställer att den exporterade datan innehåller de roller som är associerade med varje anställd.'
                ],
            },
            {
                title: 'Lägga till "Sugtabletter" i listan över "Doseringsform"',
                description: [
                    'Alternativet "Sugtabletter" har lagts till i listan "Doseringsform" i formulären för att skapa och redigera medicin.',
                    'Detta möjliggör bättre hantering av doseringsformer inom systemet.',
                    'Hantering av doseringsform är också tillgänglig i kataloginställningarna.'
                ],
            },
            {
                title: 'Behörigheter i katalogroller',
                description: [
                    'Det är nu möjligt att tilldela specifika behörigheter i rollområdet för uppgifter som att hantera tjänstgöringsschemat, vilket möjliggör mer granulär kontroll över användaråtkomst.',
                    'En "Tjänstgöringskoordinator"-roll kan till exempel skapas med begränsad åtkomst till endast tjänstgöringsschemat.'
                ],
            }
        ],
        '2025-12-12': [
            {
                title: 'Avancerad sökning och filtrering i skiftschema och kalender',
                description: [
                    'Användare kan nu söka direkt efter en specifik dag i skiftschemat och kalendern istället för att navigera vecka för vecka.',
                    'Navigeringen har utökats till att tillåta förflyttning per månad samt per vecka.',
                    'Översikten kan filtreras för att visa en eller flera valda anställda.',
                    'Ytterligare filter har lagts till för anställningsstatus och avdelning för att förbättra tydlighet och planering.'
                ],
            },
            {
                title: 'Optimeringar av tjänstgöringsskiftsschema',
                description: [
                    'Flera prestanda- och användbarhetsoptimeringar har tillämpats på tjänstgöringsskiftsschemat.',
                    'Dessa förbättringar resulterar i snabbare interaktioner och en smidigare schemaläggningsupplevelse för både administratörer och anställda.'
                ],
            },
            {
                title: 'Hantering av flerdagsskift',
                description: [
                    'När ett skift skapas som sträcker sig över flera dagar delar systemet nu automatiskt upp det i separata dagliga skift.',
                    'Detta säkerställer mer exakt schemaläggning, rapportering och enklare justeringar per dag.'
                ],
            },
            {
                title: 'Anpassade återkommande alternativ över schemaläggning och aviseringar',
                description: [
                    'Anpassade återkommande mönster kan nu konfigureras för tjänstgöringsschemat, kalenderhändelser samt planer- och målaviseringar.',
                    'Detta ger större flexibilitet för att definiera komplexa eller icke-standardiserade återkommande regler över hela plattformen.'
                ],
            }
        ],
        '2025-11-28': [
            {
                title: 'Överför Zoho-chatt till supportslide-over',
                description: [
                    'Zoho-chattfunktionen är nu integrerad i en slide-over-panel.',
                    'Detta förbättrar tillgängligheten och bibehåller fokus på huvudinnehållet samtidigt som det möjliggör snabba interaktioner.'
                ],
            },
            {
                title: 'Lägg till sidåtkomst i formuläret för nya anställda',
                description: [
                    'Formuläret för nya anställda har uppdaterats för att inkludera alternativ för sidåtkomst.',
                    'Detta effektiviserar konfigurationsprocessen för nyanställda och förbättrar deras onboardingupplevelse.'
                ],
            },
            {
                title: 'Återkommande händelser i kalendern',
                description: [
                    'Vid redigering av en enskild händelse uppmanar systemet nu om ändringarna ska tillämpas på endast denna händelse eller alla framtida återkommande händelser.',
                    'Denna funktion förbättrar flexibilitet och precision vid hantering av återkommande händelser.'
                ],
            },
            {
                title: 'Återkommande automatisk veckorotation i tjänstgöringsschemat',
                description: [
                    'Administratörer kan nu skapa en återkommande automatisk veckorotation i tjänstgöringsschemat.',
                    'Administratörer kan ställa in ett slutdatum för det återkommande mönstret.'
                ],
            },
            {
                title: 'Anpassning av aviseringsinställningar',
                description: [
                    'En ny inställning gör det möjligt för användare att aktivera/inaktivera aviseringar baserat på om den anställde är i skift.',
                    'Dessutom har ett allmänt alternativ lagts till för att inaktivera alla e-postaviseringar, vilket ger användare mer kontroll över sina aviseringsinställningar.'
                ],
            },
            {
                title: 'Lägga till/dra av extra timmar i tjänstgöringsschemat',
                description: [
                    'Administratörer och anställda kan nu lägga till eller dra av extra timmar från veckoschemat utan att skapa ett specifikt skift.',
                    'Ett obligatoriskt anteckningsfält krävs för varje justering, och det finns två arbetsflöden tillgängliga för att hantera dessa ändringar.'
                ],
            },
            {
                title: 'Centraliserad lösenordshantering för administratörer',
                description: [
                    'Administratörer kan nu hantera lösenordskontroll centralt från företagets inställningar.',
                    'Detta eliminerar alternativet "Ändra lösenord" för användare och gör det möjligt för administratörer att generera nya lösenord åt dem.'
                ],
            },
            {
                title: 'Visuella förbättringar av medborgaröversikt',
                description: [
                    'Två visuella ikoner har lagts till bland medborgarens åtgärdsikoner för bättre statusspårning.',
                    'Plusikonen återspeglar statusen för medborgarens planer/mål, medan pillerikonen ger direktåtkomst till medicineringsöversikten.'
                ],
            },
            {
                title: 'Återkommande aviseringar i planer och mål',
                description: [
                    'I avsnittet planer och mål kan återkommande aviseringar nu skapas.',
                    'Dessa aviseringar kan endast tilldelas medborgarens tilldelade kontaktpersoner, vilket säkerställer riktade och relevanta varningar.'
                ],
            }
        ],
        '2025-11-14': [
            {
                title: 'Färganpassning av avdelningsmeny',
                description: [
                    'Det är nu möjligt att ändra färgen på avdelningsmenyn baserat på vilken avdelning som visas.',
                    'Detta ger en visuell färgindikator utöver avdelningens namn, vilket förbättrar tydlighet och snabb igenkänning.'
                ],
            },
            {
                title: 'Uppdateringar av registreringsformuläret',
                description: [
                    'Flera förbättringar har gjorts av registreringsformuläret.',
                    'Dessa ändringar förbättrar användbarheten, effektiviserar registreringsprocessen och förbättrar datakvaliteten.'
                ],
            },
            {
                title: 'Medborgares förfrågningar och konverteringsprocess',
                description: [
                    'Förbättringar har gjorts av hanteringen av medborgares förfrågningar.',
                    'Det är nu lättare att hantera förfrågningar och konvertera en förfrågan till en registrerad medborgare.'
                ],
            },
            {
                title: 'UI-uppdatering för säker e-post',
                description: [
                    'Användargränssnittet för säker e-post har uppdaterats.',
                    'Dessa förbättringar ger en tydligare layout och förbättrar den övergripande meddelandeupplevelsen.'
                ],
            },
            {
                title: 'Dashboard klientinloggning för händelser',
                description: [
                    'En ny funktion har lagts till som gör det möjligt för klienter att logga in för att se händelser via dashboarden.',
                    'Detta förbättrar tillgängligheten och ger en mer strömlinjeformad upplevelse för händelserelaterad information.'
                ],
            }
        ],
        '2025-11-07': [
            {
                title: 'Ytterligare fält (styrka) i medicinjournal',
                description: [
                    'Vid skapande eller redigering av en medicinjournal har ett nytt fält som heter "styrka" lagts till.',
                    'Detta möjliggör mer exakt registrering av medicineringsdetaljer och förbättrar tydligheten i doseringsdokumentation.'
                ],
            },
            {
                title: 'Daglig översikt omdöpt till Översikt',
                description: [
                    'Avsnittet som tidigare hette "Daglig översikt" har bytt namn till "Översikt".',
                    'Denna ändring ger ett tydligare och mer allmänt översiktsavsnitt för användare.'
                ],
            },
            {
                title: '"Medborgares dagliga händelser" omdöpt till "Medborgares händelser" i översikten',
                description: [
                    'I översikten har titeln "Medborgares dagliga händelser" uppdaterats till "Medborgares händelser".',
                    'Detta återspeglar att händelser inte är begränsade till dagliga förekomster och förbättrar konsekvens i namngivning.'
                ],
            },
            {
                title: '"Daglig medicineringsöversikt" omdöpt till "Medicineringsöversikt" i översikten',
                description: [
                    'Avsnittsnamnet "Daglig medicineringsöversikt" har ändrats till "Medicineringsöversikt".',
                    'Detta representerar bättre den bredare funktionaliteten och täckningen av översikten.'
                ],
            },
            {
                title: 'Ytterligare alternativ i "Kopiera flera veckors scheman"',
                description: [
                    'Fler alternativ har lagts till för att välja veckornas källa och destination vid kopiering av flera veckors scheman.',
                    'Detta ger större flexibilitet och kontroll vid hantering av scheman.'
                ],
            }
        ],
        '2025-10-31': [
            {
                title: 'Incheckning och utcheckning på medborgaren (med automatisk avisering efter 24 timmar)',
                description: [
                    'Systemet stöder nu incheckning och utcheckning på medborgaren med förbättrad funktionalitet som skickar en automatisk avisering 24 timmar efter utcheckning.',
                    'Aviseringen informerar om att utcheckningen har loggats och kan hittas i loggen, vilket säkerställer bättre spårbarhet och uppföljning.'
                ],
            },
            {
                title: 'Förfrågningsdata och vistelsedata för organisationer inom socialt välmående',
                description: [
                    'Organisationer och företag inom socialvårdsbranschen med anläggningstyp kriscenter eller härbärge för hemlösa kan nu komma åt förfrågnings- och vistelsedata.',
                    'Detta möjliggör mer exakt rapportering och analys av medborgarärenden och vistelser i sociala institutioner.'
                ],
            },
            {
                title: 'Rumshantering för medborgare',
                description: [
                    'Ny funktionalitet har lagts till för rumshantering, vilket gör det möjligt för administratörer att hantera rumstilldelning och status för medborgare.',
                    'Detta ger bättre överblick över tillgängliga rum, beläggning och resursutnyttjande vid anläggningar som kriscenter och härbärgen för hemlösa.'
                ],
            },
            {
                title: 'Konversationssammanfattning för medborgare kopplad till förfrågningsdata',
                description: [
                    'Det är nu möjligt att lägga till konversationssammanfattningar för medborgare som en del av deras förfrågningsdata.',
                    'Detta möjliggör mer komplett dokumentation av medborgarärenden och säkerställer att relevanta anteckningar och konversationer registreras tillsammans med annan data.'
                ],
            },
            {
                title: 'Förenklat registreringsformulär',
                description: [
                    'Andra fält i registreringsformuläret har tagits bort för att förbättra och effektivisera registreringsprocessen.',
                    'Denna ändring minskar komplexiteten och gör det snabbare och mer intuitivt för användare att skapa ett konto.'
                ],
            }
        ],
        '2025-10-24': [
            {
                title: 'Möjlighet att skapa flera utkast till tjänstgöringsscheman för en enskild avdelning eller för hela organisationen',
                description: [
                    'Kunder kan nu skapa flera utkast till tjänstgöringsscheman för antingen en enskild avdelning eller hela organisationen under planeringsfasen av skiftschemaläggning.',
                    'Denna funktion möjliggör större flexibilitet i planering och schemaläggning, med en tydlig indikation av vilken avdelning utkastet publiceras för när det slutförs.'
                ],
            },
            {
                title: 'Möjlighet att växla mellan organisationer med ett enda användarkonto',
                description: [
                    'Användare kan nu sömlöst växla mellan organisationer med ett enda användarkonto, vilket gör det lättare för individer som arbetar över flera organisationer att hantera sina ansvarsområden.',
                    'Detta förbättrar användarupplevelsen och minskar behovet av flera inloggningar eller kontohantering.'
                ],
            },
            {
                title: 'Beräkning av bidragsmarginal på medborgaren (synlig för administratörer eller behöriga användare)',
                description: [
                    'En funktion har införts för att beräkna bidragsmarginalen per medborgare, vilken endast är synlig för administratörer eller användare med nödvändiga behörigheter.',
                    'Detta möjliggör bättre ekonomisk spårning och analys, och ger viktiga insikter i bidragsmarginalen för enskilda medborgare.'
                ],
            },
            {
                title: 'Incheckning och utcheckning på medborgaren',
                description: [
                    'En ny funktion för incheckning och utcheckning har lagts till för medborgare, vilket gör det möjligt för användare att registrera närvaro- eller aktivitetstider.',
                    'Denna funktion är användbar för att spåra medborgares engagemang och säkerställa korrekta register över deras deltagande.'
                ],
            },
            {
                title: 'Tidsschema: tilldelning och sammanfattning av tidsanvändning',
                description: [
                    'Användare kan nu ange tilldelade timmar/minuter per dag, vecka eller månad för en medborgare och se en sammanfattning (tidskonto) som visar hur mycket tid som har använts under den valda perioden.',
                    'Detta säkerställer att det är tydligt om den tilldelade tiden används effektivt och om man är över eller under den tilldelade tiden.'
                ],
            }
        ],
        '2025-10-17': [
            {
                title: 'Bifoga fil i SMTP- och Entra-e-post (både inkorg och skickade meddelanden)',
                description: [
                    'En funktion har införts för att tillåta filbilagor i både SMTP- och Entra-e-post, vilket täcker inkorg och skickade meddelanden.',
                    'Denna förbättring gör det möjligt för användare att bifoga och komma åt filer mer effektivt i både inkommande och utgående e-postkommunikation.'
                ],
            },
            {
                title: 'App- och webbavisering till anställda vid publicering av tjänstgöringsschema från utkast',
                description: [
                    'Anställda får nu app- och webbaviseringar när ett tjänstgöringsschema som inkluderar dem publiceras från utkast.',
                    'Detta förbättrar kommunikationen och säkerställer att anställda omedelbart meddelas om ändringar i sina tjänstgöringsscheman.'
                ],
            },
            {
                title: 'Visa en logg över raderade anteckningar i journalanteckningsområdet',
                description: [
                    'En loggfunktion har lagts till för att göra det möjligt för användare att se raderade anteckningar i journalanteckningsområdet.',
                    'Detta ger ett granskningsspår för raderingar av anteckningar, vilket förbättrar transparens och spårning inom systemet.'
                ],
            },
            {
                title: 'Flytta en anteckning från en medborgare till en annan (administratörsfunktion)',
                description: [
                    'Administratörer kan nu flytta anteckningar från en medborgares register till en annan.',
                    'Detta säkerställer att anteckningar är korrekt associerade med rätt medborgare, vilket förbättrar datahantering och organisation.'
                ],
            },
            {
                title: 'Kopiera en anteckning till en annan medborgare (administratörsfunktion)',
                description: [
                    'Administratörer kan nu kopiera anteckningar från en medborgares register till en annan.',
                    'Detta möjliggör enkel delning av relevant information mellan medborgare, vilket säkerställer effektiv anteckningshantering.'
                ],
            }
        ],
        '2025-10-10': [
            {
                title: 'Filbilagor vid sändning av e-post',
                description: [
                    'En funktion har införts för att tillåta att bilagor läggs till vid sändning av e-post.',
                    'Detta förbättrar förmågan att skicka dokument och filer tillsammans med e-post, vilket förbättrar kommunikationseffektiviteten.'
                ],
            },
            {
                title: 'Nedladdning av bilaga för säker e-post',
                description: [
                    'En funktionalitet har lagts till för att tillåta nedladdning av bilagor från säker e-post.',
                    'Detta förbättrar säker åtkomst till viktiga filer och dokument som skickas via krypterade e-postkanaler.'
                ],
            },
            {
                title: 'Export av tjänstgöringsschema per avdelning',
                description: [
                    'En ny funktion har lagts till för att exportera tjänstgöringsscheman specifika för varje avdelning.',
                    'Detta möjliggör enklare distribution och hantering av avdelningsspecifika tjänstgöringslistor, vilket förbättrar organisatorisk effektivitet.'
                ],
            },
            {
                title: 'Administratörsdefinierad visning av medborgarinformation',
                description: [
                    'Administratörer kan nu bestämma och definiera vilken information som ska visas i den specifika medborgarrutan vid visning av en enskild medborgare.',
                    'Detta möjliggör mer anpassad åtkomst till medborgardetaljer, vilket säkerställer att endast relevant information visas för vanliga användare.'
                ],
            }
        ],
        '2025-10-03': [
            {
                title: 'Webbleads',
                description: [
                    'Leads-appen kan nu aktiveras och användas för att se leads.',
                    'Detta ger förbättrad hantering och spårning av potentiella leads i systemet.',
                ],
            },
            {
                title: 'Ladda ner och skriv ut specifik medicinering för medborgaren',
                description: [
                    'En funktion har lagts till för att tillåta nedladdning och utskrift av specifika medicineringsdetaljer för medborgare.',
                    'Detta förbättrar effektiviteten i hantering och delning av medicineringsinformation.',
                ],
            },
            {
                title: 'Ytterligare fasta tidsintervall',
                description: [
                    'Ytterligare fasta tidsintervall för maximal dosering per tid har lagts till.',
                    'Detta säkerställer mer flexibilitet och noggrannhet i schemaläggning av medicineringsdoseringar.',
                ],
            },
            {
                title: 'Hjälplänk för medicinering',
                description: [
                    'En ny hjälplänk för medicinering har lagts till.',
                    'Denna länk tillhandahåller relevanta resurser för att hjälpa personalen i sitt arbete med medicinering.',
                ],
            },
            {
                title: 'Hjälplänk för användning av tvång och incidentrapporter',
                description: [
                    'En hjälplänk har införts för användning av tvång och incidentrapporter.',
                    'Denna länk erbjuder användbar information och riktlinjer för att hantera dessa känsliga situationer.',
                ],
            },
        ],
        '2025-09-26': [
            {
                title: 'Lista över helgdagar i kalendern',
                description: [
                    'Helgdagar visas nu direkt i kalendern.',
                    'Detta ger bättre synlighet för planering och samordning.',
                ],
            },
            {
                title: '"Snabb riskbedömning" i den dagliga översikten',
                description: [
                    'Om aktiverat i administratörsinställningarna visas nu en snabb riskbedömning i den dagliga översikten.',
                    'Detta möjliggör snabbare identifiering av potentiella risker under dagliga operationer.',
                ],
            },
            {
                title: 'Aktuella medborgarbehandlingar i den dagliga översikten',
                description: [
                    'Pågående medborgarbehandlingar är nu synliga i den dagliga översikten.',
                    'Detta ger personalen en tydlig och omedelbar översikt över aktuella vårdaktiviteter.',
                ],
            },
        ],
        '2025-09-19': [
            {
                title: 'Importera och exportera anställda via CSV-mallfil',
                description: [
                    'Anställda kan nu importeras och exporteras med en CSV-mallfil.',
                    'Detta förenklar hanteringen av anställdas data och säkerställer konsekvens över register.',
                ],
            },
            {
                title: 'Exportera medborgare',
                description: [
                    'Medborgarregister kan nu exporteras.',
                    'Detta möjliggör enklare rapportering, delning och databackup.',
                ],
            },
            {
                title: 'Lista över helgdagar i tjänstgöringsschemat',
                description: [
                    'Helgdagar visas nu inom tjänstgöringsschemat.',
                    'Detta hjälper till att förbättra planeringen och säkerställa korrekt schemaläggning kring helgdagar.',
                ],
            },
        ],
        '2025-09-12': [
            {
                title: 'Importera medborgare via CSV-mallfil',
                description: [
                    'Medborgare kan nu importeras med en CSV-mallfil.',
                    'Detta effektiviserar dataregistreringsprocessen och säkerställer konsekvens i medborgarregister.',
                ],
            },
            {
                title: 'Användares 2FA',
                description: [
                    'Tvåfaktorsautentisering (2FA) är nu tillgängligt för användare.',
                    'Detta lägger till ett extra säkerhetslager för användarkonton och skyddar känslig information.',
                ],
            },
            {
                title: 'Nya fält i medborgarens formulär: Trafikljus (Grönt, Gult och Rött)',
                description: [
                    'Nya fält för trafikljusstatus (Grönt, Gult och Rött) har lagts till i medborgarens formulär.',
                    'Ge en beskrivning av medborgarens tillstånd när de är i grön, gul eller röd status vid skapande av en journalanteckning.',
                ],
            },
        ],
        '2025-08-29': [
            {
                title: 'Standardskifttider i tjänstgöringsschema',
                description: [
                    'Du kan nu ställa in standardtid in och tid ut för varje skift i tjänstgöringsschemat.',
                    'Detta hjälper till att standardisera arbetstider och minskar manuella inmatningsfel.',
                ],
            },
            {
                title: 'Spårning av medicineringsallergi',
                description: [
                    'Medborgares medicineringsallergier kan nu registreras och spåras.',
                    'Detta säkerställer bättre säkerhet och informerat beslutsfattande för vårdpersonal.',
                ],
            },
            {
                title: 'Sjukfrånvaro räknad som arbetade timmar',
                description: [
                    'Sjukfrånvaro kan nu räknas som arbetade timmar i tjänstgöringsschemat.',
                    'Detta ger mer korrekt rapportering och rättvisare schemaläggning.',
                ],
            },
        ],
        '2025-08-15': [
            {
                title: 'Microsoft e-posthantering i Mail-appen',
                description: [
                    'Du kan nu ansluta och hantera dina Microsoft e-postkonton direkt i Mail-appen.',
                    'Detta gör det enklare att skicka, ta emot och organisera e-post utan att växla mellan plattformar.',
                ],
            },
        ],
        '2025-08-01': [
            {
                title: 'Insatstimmar i medborgarområdet',
                description: [
                    'Medborgare kan nu se tillgängliga insatstimmar direkt i Medborgare-avsnittet.',
                    'Detta förbättrar transparens och åtkomst till stödtjänster.',
                ],
            },
            {
                title: 'Ny app: CitizenOne AI',
                description: [
                    'Vi har nu lanserat CitizenOne AI - din intelligenta assistent som till exempel kan ge dig en snabb översikt över hur en medborgare har mått den senaste månaden, dela användbar information om din organisation eller kollegor, och mycket mer. Allt direkt i CitizenOne, så att du kan arbeta smartare och snabbare.'
                ],
            },
            {
                title: 'Ändringsloggar i tjänstgöringsschema',
                description: [
                    'Tjänstgöringsschemat innehåller nu en detaljerad ändringslogg.',
                    'Spåra alla uppdateringar och ändringar av tjänstgöringstilldelningar enkelt.',
                ],
            },
        ],
        '2025-07-25': [
            {
                title: 'Online kalenderbokning',
                description: [
                    'Nu tillgängligt för köp i Appar-sektionen.',
                    'Efter köp, gå till Kalendrar för att konfigurera och hantera online-bokningar.',
                ],
            },
            {
                title: 'Avdelningar i tjänstgöringsschema',
                description: ['Du kan nu tilldela skift till specifika avdelningar.'],
            },
            {
                title: 'Skiftanteckningar för administratörer',
                description: ['Administratörer kan nu bifoga anteckningar till enskilda skift.'],
            },
            {
                title: 'Växel för behandlingsaviseringar',
                description: ['Alternativ för att aktivera eller inaktivera aviseringar för behandlingar.'],
            },
            {
                title: 'Redigera och radera meddelanden i chattar',
                description: ['Du kan nu redigera eller radera meddelanden direkt i chattar för bättre kontroll och kommunikation.'],
            },
            {
                title: 'Renare navigeringsfält',
                description: [
                    'Aviserings- och meddelandebadges döljs när antalet är noll.',
                    'Nya funktionsmeddelanden visas också här framöver.',
                ],
            },
        ],
    }
}

function loadUpdates(version: string) {
    const locale = language.locale.value
    const lang = (locale === 'dk' ? 'dk' : locale === 'no' ? 'no' : locale === 'sv' ? 'sv' : 'en') as 'en' | 'dk' | 'no' | 'sv'
    state.updates = allUpdates[lang][version] || []
}

watch(() => props.isModalOpen, (isOpen) => {
    if (isOpen) {
        loadUpdates(state.currentVersion)
    }
})
</script>
