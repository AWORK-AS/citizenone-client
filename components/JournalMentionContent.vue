<template>
    <div ref="root" class="content" v-html="props.html" @click="onClick" />
</template>

<script setup lang="ts">
import { useJournalMentions } from '@/composables/journalMentions'
import { useI18n } from 'vue-i18n'

/**
 * Renders journal HTML and brings its @-mentions to life.
 *
 * A citizen mention is stored as initials plus a uuid, so the name is looked
 * up here for the hover tooltip. Clicking one opens that citizen, but only
 * for a user who is a contact person on them.
 */
const props = defineProps({
    html: {
        type: String,
        default: '',
    },
})

const { t } = useI18n()
const { warningAlert } = useAlert()
const { resolveCitizens, citizenUuidsIn } = useJournalMentions()

const root = ref<HTMLElement | null>(null)

async function decorateMentions() {
    await nextTick()

    const uuids = citizenUuidsIn(root.value)

    if (!uuids.length) {
        return
    }

    const resolved = await resolveCitizens(uuids)

    if (!root.value) {
        return
    }

    for (const node of Array.from(root.value.querySelectorAll<HTMLElement>('[data-mention-type="citizen"]'))) {
        const citizen = resolved.get(node.dataset.mentionUuid ?? '')

        if (!citizen) {
            continue
        }

        node.setAttribute('title', citizen.can_access
            ? citizen.name
            : `${citizen.name} (${t('citizens.citizenJournals.mentions.noAccess')})`)
        node.dataset.mentionAccess = citizen.can_access ? 'granted' : 'denied'
    }
}

function onClick(event: MouseEvent) {
    const target = (event.target as HTMLElement)?.closest<HTMLElement>('[data-mention-type="citizen"]')

    if (!target) {
        return
    }

    event.preventDefault()

    const uuid = target.dataset.mentionUuid

    if (!uuid) {
        return
    }

    if (target.dataset.mentionAccess === 'granted') {
        navigateTo(`/citizens/${uuid}/journals`)

        return
    }

    warningAlert(
        t('citizens.citizenJournals.mentions.noAccessTitle'),
        t('citizens.citizenJournals.mentions.noAccessMessage'),
    )
}

onMounted(decorateMentions)
watch(() => props.html, decorateMentions)
</script>
