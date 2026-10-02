<template>
    <div>
        <Menu as="div" class="relative inline-block text-left">
            <MenuButton as="template">
                <FormButton buttonStyle="white" class="w-fit rounded-md" :disabled="state.isDownloading">
                    <Icon v-if="state.isDownloading" name="ph:spinner-gap" class="h-4 w-4 animate-spin" aria-hidden="true" />
                    <Icon v-else name="ph:file-pdf" class="h-4 w-4" aria-hidden="true" />
                    {{ $t('mail.pdf.saveAsPdf') }}
                </FormButton>
            </MenuButton>

            <transition enter-active-class="transition duration-100 ease-out"
                enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100"
                leave-to-class="transform scale-95 opacity-0">
                <MenuItems
                    class="absolute left-0 w-56 divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-10"
                    :class="props.openDirection === 'down' ? 'top-full mt-2 origin-top-left' : 'bottom-full mb-2 origin-bottom-left'">
                    <div class="px-1 py-1">
                        <MenuItem v-slot="{ active }">
                        <button :class="[active && 'bg-gray-100', 'group flex w-full items-center rounded-md px-2 py-2.5 text-sm']"
                            @click="downloadPdf">
                            <Icon name="ph:download-simple" class="mr-2 h-5 w-5" aria-hidden="true" />
                            {{ $t('mail.pdf.download') }}
                        </button>
                        </MenuItem>
                        <MenuItem v-slot="{ active }" v-if="canSaveToDrive">
                        <button :class="[active && 'bg-gray-100', 'group flex w-full items-center rounded-md px-2 py-2.5 text-sm']"
                            @click="state.isSaveToDriveModalOpen = true">
                            <Icon name="ph:cloud-arrow-up" class="mr-2 h-5 w-5" aria-hidden="true" />
                            {{ $t('mail.pdf.saveToDrive') }}
                        </button>
                        </MenuItem>
                    </div>
                </MenuItems>
            </transition>
        </Menu>

        <ModulesUserMailModalSavePdfToDrive :isModalOpen="state.isSaveToDriveModalOpen" :messageId="props.messageId"
            :folder="props.folder" @close="state.isSaveToDriveModalOpen = false" />
    </div>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { mailPdfService } from '@/components/api/user/MailPdfService'
import { usePermissions } from '@/composables/usePermissions'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import { saveAs } from 'file-saver'

const props = defineProps({
    messageId: {
        type: String,
        required: true,
    },
    folder: {
        type: String as () => 'inbox' | 'sent',
        required: true,
    },
    subject: {
        type: String,
        default: '',
    },
    // The Inbox views place this button at the bottom of the action row,
    // where opening upward (the default) keeps the menu on screen. The Sent
    // views place it at the top, next to the subject heading - opening
    // upward there puts it behind the page's own header row instead, so
    // those pass 'down'.
    openDirection: {
        type: String as () => 'up' | 'down',
        default: 'up',
    },
})

const { t } = useI18n()
const { errorAlert } = useAlert()
const { isAtLeast, can } = usePermissions()

const canSaveToDrive = computed(() => isAtLeast('Admin') || can('create'))

const state = reactive({
    isDownloading: false,
    isSaveToDriveModalOpen: false,
})

async function downloadPdf() {
    state.isDownloading = true
    try {
        const blob = await mailPdfService.downloadPdf({
            // See modal-save-pdf-to-drive.vue: the SMTP inbox/sent views bind
            // a raw numeric uid here, not a string.
            message_id: String(props.messageId),
            folder: props.folder,
        })
        if (blob) {
            saveAs(blob, `${props.subject || t('mail.pdf.noSubject')}.pdf`)
        }
    } catch (error: any) {
        errorAlert(`${t('alert.error')}!`, error?.message)
    }
    state.isDownloading = false
}
</script>
