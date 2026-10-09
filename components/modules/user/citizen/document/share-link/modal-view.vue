<template>
    <div>
        <Modal size="3xl" :title="$t('citizens.documents.sendLink.sentLinks')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="space-y-5">
                    <p class="text-sm text-gray-600">{{ $t('citizens.documents.sendLink.sentLinksIntro') }}</p>
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.links" :isLoading="state.isTableLoading">
                            <template #body v-if="!(state.isTableLoading || state.links?.data?.length === 0)">
                                <tr v-for="link in state.links?.data" :key="link.uuid">
                                    <td width="28%">
                                        <div class="flex items-center gap-x-2 min-w-0">
                                            <Icon :name="link.item?.type === 'folder' ? 'ph:folder' : 'ph:file'"
                                                class="size-4 shrink-0 text-primary" aria-hidden="true" />
                                            <span class="truncate">{{ link.item?.name ?? '-' }}</span>
                                        </div>
                                    </td>
                                    <td width="26%">
                                        <div class="flex flex-wrap gap-1 text-xs">
                                            <span v-for="recipient in link.recipients" :key="recipient"
                                                class="rounded-md bg-gray-100 px-2 py-1 text-gray-700 break-all">
                                                {{ recipient }}
                                            </span>
                                        </div>
                                    </td>
                                    <td width="16%">
                                        <p class="truncate">{{ link.user ? `${link.user.firstname} ${link.user.lastname ?? ''}` : '-' }}</p>
                                        <p class="text-xs text-gray-500">{{ formatDateTimeToReadable(link.created_at) }}</p>
                                    </td>
                                    <td width="15%">
                                        <p>{{ formatDateTimeToReadable(link.expires_at) }}</p>
                                        <Badge :type="link.is_expired ? 'inactive' : 'active'">
                                            {{ link.is_expired ? $t('citizens.documents.sendLink.expired') : $t('citizens.documents.sendLink.active') }}
                                        </Badge>
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-end justify-end gap-2">
                                            <Tooltip :text="$t('citizens.documents.sendLink.copyLink')" v-if="!link.is_expired">
                                                <FormButton :aria-label="$t('citizens.documents.sendLink.copyLink')"
                                                    type="button" buttonStyle="primary" @click="copyLink(link)">
                                                    <Icon name="ph:link" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.documents.sendLink.revoke')">
                                                <FormButton :aria-label="$t('citizens.documents.sendLink.revoke')"
                                                    type="button" buttonStyle="danger" @click="confirmRevoke(link)">
                                                    <Icon name="ph:link-break" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.links" @previous="previous" @next="next" />
                </div>

                <DialogConfirmation :isModalOpen="state.isRevokeOpen"
                    :message="$t('citizens.documents.sendLink.revokeConfirmation') + '?'"
                    @close="state.isRevokeOpen = false" @confirm="revokeLink" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { citizenDocumentShareService } from '@/components/api/user/CitizenDocumentShareService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    citizenUuid: {
        type: String,
        required: true,
    },
})
const emit = defineEmits(['close'])
const { t } = useI18n()
const { successAlert } = useAlert()
const { formatDateTimeToReadable } = useDatetimeFormatter()
let currentPage = 1

const state = reactive({
    columnHeaders: [
        { name: 'citizens.documents.sendLink.document', isTranslateName: true },
        { name: 'citizens.documents.sendLink.sentTo', isTranslateName: true },
        { name: 'citizens.documents.sendLink.sentBy', isTranslateName: true },
        { name: 'citizens.documents.sendLink.expires', isTranslateName: true },
        { name: '' },
    ],
    error: {} as Error,
    isTableLoading: false,
    isRevokeOpen: false,
    links: [] as any,
    selectedLink: null as any,
})

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        currentPage = 1
        fetchLinks()
    }
})

function closeModal() {
    emit('close')
}

async function fetchLinks() {
    state.error = {}
    state.isTableLoading = true
    try {
        state.links = await citizenDocumentShareService.getShareLinks({
            citizen_uuid: props.citizenUuid,
            page: currentPage,
        })
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentPage--
    fetchLinks()
}

function next() {
    currentPage++
    fetchLinks()
}

async function copyLink(link: any) {
    try {
        await navigator.clipboard.writeText(link.link)
        successAlert(`${t('alert.success')}!`, `${t('citizens.documents.sendLink.linkCopied')}.`)
    } catch {
        // Clipboard can be blocked (http, browser policy); the link is in the mail anyway.
    }
}

function confirmRevoke(link: any) {
    state.selectedLink = link
    state.isRevokeOpen = true
}

async function revokeLink() {
    state.isRevokeOpen = false
    state.error = {}
    try {
        await citizenDocumentShareService.revokeShareLink(state.selectedLink?.uuid)
        successAlert(`${t('alert.success')}!`, `${t('citizens.documents.sendLink.revoked')}.`)
        fetchLinks()
    } catch (error: any) {
        state.error = error
    }
}
</script>
