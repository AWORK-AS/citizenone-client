<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'

/**
 * Back from linking MitID, the portal page has ?mitid=linked or
 * ?mitid_error=...: told once, then taken off the address. Lives in the
 * portal layouts, outside the user menu, which only renders while open.
 *
 * The layout reads the signed-in user and sets their language after this
 * mounts, so the message waits for that; otherwise it came out in English.
 */
const { t } = useI18n()
const { successAlert, errorAlert } = useAlert()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore() as any

onMounted(() => {
    const { mitid, mitid_error: failed, ...rest } = route.query
    if (!mitid && !failed) return
    router.replace({ query: rest })

    let shown = false
    const show = () => {
        if (shown) return
        shown = true
        if (mitid === 'linked') successAlert(`${t('alert.success')}!`, t('portalMitId.linked'))
        if (typeof failed === 'string' && failed) errorAlert(`${t('alert.somethingWentWrong')}!`, failed)
    }
    // Shown once the layout has read the user again (and set their language in
    // the same tick, hence the setTimeout), or after a few seconds if it cannot,
    // so the result is never lost. Not immediate: a user kept from before the
    // redirect is there already, while the language is not set yet.
    const stop = watch(() => userStore.getUser, (user) => { if (user) setTimeout(show) })
    setTimeout(() => { stop(); show() }, 4000)
})
</script>

<template>
    <span hidden />
</template>
