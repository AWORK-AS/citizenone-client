<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { MenuItem } from '@headlessui/vue'
import { authService } from '@/components/api/user/AuthService'
import { useAlert } from '@/composables/alert'

/**
 * "Tilknyt MitID" / "Fjern MitID" in the citizen, patient and relative user
 * menus. Shown only when the company has the MitID app and a broker is set
 * up. Linking leaves for MitID; MitIdNotice tells the result on return.
 */
const { t } = useI18n()
const { successAlert, errorAlert } = useAlert()
const route = useRoute()

const available = shallowRef(false)
const linked = shallowRef(false)
const busy = shallowRef(false)

onMounted(async () => {
    try {
        const response = await authService.portalMitId()
        available.value = response?.data?.available === true
        linked.value = response?.data?.linked === true
    } catch {
        available.value = false
    }
})

async function toggle() {
    if (busy.value) return
    busy.value = true
    try {
        if (linked.value) {
            if (!window.confirm(t('portalMitId.unlinkConfirm'))) return
            await authService.portalMitIdUnlink()
            linked.value = false
            successAlert(`${t('alert.success')}!`, t('portalMitId.unlinked'))
            return
        }
        const response = await authService.portalMitIdLink(route.path, useIsDesktopApp() ? 'desktop' : undefined)
        if (response?.data?.url) window.location.href = response.data.url
    } catch (cause: any) {
        errorAlert(`${t('alert.somethingWentWrong')}!`, cause?.message ?? '')
    } finally {
        busy.value = false
    }
}
</script>

<template>
    <MenuItem v-if="available">
        <div role="button" tabindex="0" @click="toggle" @keydown.enter="toggle"
            class="cursor-pointer bg-gray-50 block px-3 py-3 text-sm leading-6 text-gray-900 hover:bg-gray-100">
            <div class="flex items-center gap-x-3">
                <Icon :name="linked ? 'ph:link-break' : 'ph:identification-card'" class="h-5 w-5" aria-hidden="true" />
                {{ linked ? $t('portalMitId.unlink') : $t('portalMitId.link') }}
            </div>
        </div>
    </MenuItem>
</template>
