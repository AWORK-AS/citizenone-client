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
    currentVersion: '2026-05-01',
    availableVersions: [
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
