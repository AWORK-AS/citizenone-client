import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (p) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8')
const langs = ['dk', 'en', 'no', 'sv'].map((code) => [code, JSON.parse(read(`lang/${code}.json`))])
const get = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj)

describe('roadmap quick wins, November 2026', () => {
    test('#371 the department picker says "All"', () => {
        assert.equal(get(langs[0][1], 'department.allDepartment'), 'Alle')
        assert.equal(get(langs[1][1], 'department.allDepartment'), 'All')
    })

    test('#352 the overview bulletin board links to the board and to a new post', () => {
        const box = read('components/modules/user/daily-overview/bullet-board/index.vue')
        assert.match(box, /<NuxtLink to="\/news"/)
        assert.match(box, /<NuxtLink to="\/news\/new"/)
    })

    test('#510 treatments can be searched, from the first page', () => {
        const list = read('components/modules/user/citizen/treatment/list.vue')
        assert.match(list, /v-model="state\.search"/)
        assert.match(list, /search: JSON\.stringify\(\[state\.search\.trim\(\)\]\)/)
        assert.match(list, /currentTablePage = 1/)
    })

    test('#404 contacts can be filtered by job title', () => {
        const page = read('pages/citizens/[uuid]/contacts.vue')
        assert.match(page, /v-model="state\.titleFilter"/)
        assert.match(page, /contact_job_title_uuid: state\.titleFilter/)
    })

    test('#174 a contact can be the emergency contact and is marked in the list', () => {
        const form = read('components/modules/user/citizen/contact/form.vue')
        const page = read('pages/citizens/[uuid]/contacts.vue')
        assert.match(form, /state\.formContact\.is_emergency_contact = !state\.formContact\.is_emergency_contact/)
        for (const modal of ['modal-new.vue', 'modal-edit.vue']) {
            assert.match(read(`components/modules/user/citizen/contact/${modal}`), /is_emergency_contact: contactDetails\.is_emergency_contact === true/)
        }
        assert.match(page, /v-if="contact\?\.is_emergency_contact"/)
    })

    test('#260 mail setup fills in the server settings for common providers', () => {
        const smtp = read('components/modules/user/mail/modal-configure-smtp.vue')
        for (const host of ['smtp.gmail.com', 'smtp.office365.com', 'send.one.com', 'smtp.simply.com']) {
            assert.ok(smtp.includes(host), host)
        }
        assert.match(smtp, /@click="useProvider\(provider\)"/)
    })

    test('#303 week numbers in the week and month views', () => {
        assert.match(read('components/modules/user/my-calendar/week-view.vue'), /\$t\('calendar\.weekNumber', \{ week: isoWeekNumber \}\)/)
        assert.match(read('components/modules/user/my-calendar/month-view.vue'), /v-if="index % 7 === 0"/)
    })

    test('#484 a click shows the event; edit is a button in the view', () => {
        for (const view of ['default-view.vue', 'week-view.vue', 'month-view.vue']) {
            const src = read(`components/modules/user/my-calendar/${view}`)
            assert.match(src, /function openEvent\(myCalendarEvent: any\) \{\n    if \(myCalendarEvent\?\.is_shift\) return\n    emit\('viewEvent', myCalendarEvent\)/, view)
        }
        const page = read('pages/calendar/index.vue')
        assert.equal(page.match(/@viewEvent="viewMyCalendarEvent"/g)?.length, 3)
        assert.match(page, /statusActions editable/)
        assert.match(read('components/modules/user/citizen/calendar/modal-view.vue'), /v-if="props\.editable && canManage"/)
    })

    test('#410 the discharge reminder delay is a company setting', () => {
        const page = read('pages/settings/company.vue')
        assert.match(page, /v-model="state\.formCompany\.discharge_notification_days"/)
        assert.match(page, /discharge_notification_days: Number\(state\.formCompany\.discharge_notification_days\) \|\| 30/)
    })

    test('#310 an app category has an English name', () => {
        const modal = read('components/modules/superadmin/app-category/modal-category.vue')
        assert.match(modal, /v-model="state\.form\.name_en"/)
        assert.match(modal, /name: category\?\.name_da \?\? category\?\.name/)
    })

    test('#201 a new post can notify, and the bell opens the board', () => {
        assert.match(read('components/modules/user/news/form.vue'), /v-if="props\.formType === 'create'"/)
        assert.match(read('pages/news/new.vue'), /params\.append\('notify'/)
        const bell = read('components/modules/user/navbar/notification-bell.vue')
        assert.match(bell, /includes\('newspublished'\)\) return 'news'/)
        assert.match(bell, /navigateTo\(notif\.data\?\.content\?\.link \?\? '\/news'\)/)
    })

    test('#301 an admin can send a colleague a new password link', () => {
        const page = read('pages/employees/[employee_uuid]/view-details.vue')
        assert.match(page, /employeeService\.sendPasswordReset\(employeeUuid as string\)/)
        assert.match(read('components/api/user/EmployeeService.ts'), /\/send-password-reset/)
    })

    for (const [code, lang] of langs) {
        test(`texts exist in ${code}`, () => {
            for (const path of ['citizens.treatments.searchPlaceholder', 'citizens.contacts.filterByTitle', 'citizens.contacts.allTitles',
                'citizens.contacts.emergencyBadge', 'citizens.contacts.form.emergencyContact', 'mail.settings.providers.title',
                'mail.settings.help.smtpHost', 'calendar.weekNumber', 'calendar.weekShort', 'settings.company.form.dischargeNotificationDays',
                'settings.company.form.dischargeNotificationWeeks', 'superadmin.appCategories.form.nameEn', 'news.form.notify',
                'bellNotification.news.description', 'employees.passwordReset.button', 'employees.passwordReset.confirm']) {
                const value = get(lang, path)
                assert.equal(typeof value, 'string', path)
                assert.ok(value.length > 0, path)
            }
        })
    }
})
