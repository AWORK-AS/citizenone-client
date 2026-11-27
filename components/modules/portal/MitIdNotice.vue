<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAlert } from '@/composables/alert'

/**
 * Back from linking MitID, the portal page has ?mitid=linked or
 * ?mitid_error=...: told once, then taken off the address. Lives in the
 * portal layouts, outside the user menu, which only renders while open.
 */
const { t } = useI18n()
const { successAlert, errorAlert } = useAlert()
const route = useRoute()
const router = useRouter()

onMounted(() => {
    const { mitid, mitid_error: failed, ...rest } = route.query
    if (mitid === 'linked') successAlert(`${t('alert.success')}!`, t('portalMitId.linked'))
    if (typeof failed === 'string' && failed) errorAlert(`${t('alert.somethingWentWrong')}!`, failed)
    if (mitid || failed) router.replace({ query: rest })
})
</script>

<template>
    <span hidden />
</template>
