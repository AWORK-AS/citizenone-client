import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import moment from 'moment'
import { reactive, watch, nextTick } from 'vue'

// Exercise the actual dialog-open watcher with Vue's scheduling and a controlled
// clock: loading a citizen yesterday must not backdate a fresh note today.
const source = fs.readFileSync(new URL('../../components/modules/user/citizen/journal/modal-new.vue', import.meta.url), 'utf8')
const openWatcher = source.match(/watch\(\(\) => props\.isModalOpen, \(newValue: any\) => \{[\s\S]*?\n\}\)/)?.[0]
assert.ok(openWatcher, 'new-note dialog has an open watcher')

test('new notes get the opening date without changing a date selected while writing', async () => {
    const originalNow = moment.now
    let stop
    try {
        moment.now = () => new Date(2026, 9, 11, 14).valueOf()
        const props = reactive({ isModalOpen: false })
        const state = reactive({
            formJournal: { date: moment().format('YYYY-MM-DD'), content: '' },
            selectedContext: {},
        })
        let fetched = 0
        new Function('watch', 'props', 'state', 'moment', 'fetchPlans', openWatcher.replace('newValue: any', 'newValue'))(
            (...args) => { stop = watch(...args) }, props, state, moment, () => { fetched++ },
        )

        moment.now = () => new Date(2026, 9, 12, 8, 40).valueOf()
        props.isModalOpen = true
        await nextTick()
        assert.equal(state.formJournal.date, '2026-10-12')
        assert.equal(fetched, 1)

        // Deliberate backdating must survive midnight while the form is open.
        state.formJournal.date = '2026-10-05'
        moment.now = () => new Date(2026, 9, 13, 8).valueOf()
        await nextTick()
        assert.equal(state.formJournal.date, '2026-10-05')

        props.isModalOpen = false
        await nextTick()
        assert.equal(state.formJournal.date, '2026-10-05')
        props.isModalOpen = true
        await nextTick()
        assert.equal(state.formJournal.date, '2026-10-13')
    } finally {
        stop?.()
        moment.now = originalNow
    }
})
