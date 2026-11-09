import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (p) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8')
const langs = ['dk', 'en', 'no', 'sv'].map((code) => [code, JSON.parse(read(`lang/${code}.json`))])

describe('users can find the polls', () => {
    const comingFunctions = read('pages/coming-functions/index.vue')
    const helpMenu = read('components/modules/user/navbar/help-menu.vue')
    const poll = read('components/modules/user/daily-overview/poll.vue')

    test('Coming functions has a polls section the help menu links to', () => {
        assert.match(comingFunctions, /<section id="polls"/)
        assert.match(comingFunctions, /<ModulesUserDailyOverviewPoll :showTitle="false" \/>/)
        assert.match(helpMenu, /navigateTo\('\/coming-functions#polls'\)/)
    })

    test('the help menu dot counts polls the user has not voted on', () => {
        assert.match(helpMenu, /state\.unseenCount \+ pollBadge\.count\.value/)
        assert.match(helpMenu, /pollBadge\.refresh\(\)/)
    })

    test('voting and taking a vote back both refresh the badge', () => {
        assert.equal(poll.match(/pollBadge\.refresh\(\)/g)?.length, 2)
    })
})

describe('superadmin sets the popup page on a release note', () => {
    const page = read('pages/superadmin/release-notes/index.vue')

    test('the field is loaded, edited and sent', () => {
        assert.match(page, /v-model="state\.form\.popup_route"/)
        assert.match(page, /popup_route: note\.popup_route \?\? ''/)
        assert.match(page, /form\.append\('popup_route', \(state\.form\.popup_route \?\? ''\)\.trim\(\)\)/)
    })

    test('the list shows which notes pop up', () => {
        assert.match(page, /v-if="note\.popup_route"/)
    })
})

describe('every language has the new texts', () => {
    for (const [code, lang] of langs) {
        test(code, () => {
            for (const value of [
                lang.comingFunctions?.polls?.title,
                lang.comingFunctions?.polls?.intro,
                lang.navbar?.comingFunctionsAndPolls,
                lang.releaseNotes?.popupRoute,
                lang.releaseNotes?.popupRouteHint,
                lang.releaseNotes?.popupOn,
                lang.releaseNotePopup?.dismiss,
                lang.releaseNotePopup?.dismissTooltip,
            ]) {
                assert.equal(typeof value, 'string')
                assert.ok(value.length > 0)
            }
            assert.match(lang.releaseNotes.popupOn, /\{route\}/)
        })
    }
})
