<template>
    <Modal size="lg" :show="show" :title="$t('caseworkerSharing.configureSharing')" titleIcon="ph:gear-six" @close="emit('close')">
        <template #modal-body>
            <div class="space-y-5">
                <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p class="text-sm font-semibold text-gray-900">
                        {{ displayCaseworkerName(selectedLicense) }}
                    </p>
                    <p class="mt-1 text-xs text-gray-500">
                        {{ $t('caseworkerSharing.instruction') }}
                    </p>
                </div>

                <div class="grid gap-4 sm:grid-cols-2">
                    <div class="space-y-1">
                        <FormLabel for="caseworker-firstname" :label="$t('caseworkerSharing.firstName')" />
                        <FormTextField id="caseworker-firstname" name="caseworker-firstname" :placeholder="$t('caseworkerSharing.firstName')" v-model="state.firstname" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="caseworker-lastname" :label="$t('caseworkerSharing.lastName')" />
                        <FormTextField id="caseworker-lastname" name="caseworker-lastname" :placeholder="$t('caseworkerSharing.lastName')" v-model="state.lastname" />
                    </div>
                </div>

                <div class="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
                    <label class="flex cursor-pointer items-center gap-3">
                        <input
                            type="checkbox"
                            class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            v-model="state.showPasswordFields"
                            @change="!state.showPasswordFields && clearPasswordFields()"
                        />
                        <span class="text-sm font-medium text-gray-700">{{ $t('caseworkerSharing.changePassword') }}</span>
                    </label>

                    <div v-if="state.showPasswordFields" class="grid gap-4 sm:grid-cols-2">
                        <div class="space-y-1">
                            <FormLabel for="caseworker-password" :label="$t('caseworkerSharing.newPassword')" />
                            <FormTextField id="caseworker-password" name="caseworker-password" type="password" :placeholder="$t('caseworkerSharing.newPassword')" v-model="state.password" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="caseworker-password-confirm" :label="$t('caseworkerSharing.confirmPassword')" />
                            <FormTextField id="caseworker-password-confirm" name="caseworker-password-confirm" type="password" :placeholder="$t('caseworkerSharing.confirmNewPassword')" v-model="state.passwordConfirm" />
                            <p v-if="state.password && state.passwordConfirm && state.password !== state.passwordConfirm" class="mt-1 text-xs text-red-500">
                                {{ $t('caseworkerSharing.passwordsDoNotMatch') }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="grid gap-4 sm:grid-cols-2">
                    <div>
                        <FormLabel for="caseworker-permission" :label="$t('caseworkerSharing.portalAccess')" />
                        <FormSelect id="caseworker-permission" :options="permissionOptions" v-model="(state.permission as any)" :canClear="false" :searchable="false" />
                    </div>

                    <div>
                        <FormLabel for="caseworker-citizen" :label="$t('caseworkerSharing.citizen')" />
                        <FormSelect id="caseworker-citizen" :options="state.citizens" v-model="(state.selectedCitizenUuid as any)" :canClear="false" />
                    </div>
                </div>

                <div v-if="state.selectedCitizenUuid" class="space-y-3">
                    <div class="flex items-center justify-between gap-3">
                        <div>
                            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                {{ $t('caseworkerSharing.sharedFoldersTitle') }}
                            </p>
                            <p class="text-sm text-gray-600">
                                {{ $t('caseworkerSharing.selectFoldersInstruction') }}
                            </p>
                        </div>
                        <FormButton type="button" buttonStyle="outline" size="sm" :disabled="state.isTreeLoading"
                            @click="loadCitizenTree()">
                            {{ $t('caseworkerSharing.refreshTree') }}
                        </FormButton>
                    </div>

                    <Alert type="danger" :text="state.errorMessage"
                        v-if="state.errorMessage && state.errorMessage.length > 0" />

                    <div class="rounded-xl border border-gray-200 bg-white p-4 max-h-[420px] overflow-y-auto">
                        <LoadingSpinner :isActive="state.isTreeLoading">
                            <ModulesUserSettingsLicenseOverviewCitizenTree :nodes="state.citizenTree"
                                :selectedIds="[...state.folderIds, ...state.fileIds]"
                                :indeterminateIds="indeterminateFolderIds"
                                :onToggleFolder="handleToggleFolder" />
                            <p v-if="!state.citizenTree?.length" class="text-sm text-gray-500">
                                {{ $t('caseworkerSharing.noFilesFoldersFound') }}
                            </p>
                        </LoadingSpinner>
                    </div>

                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ $t('caseworkerSharing.selectedFoldersTitle') }}</p>
                        <div class="mt-2 flex flex-wrap gap-2">
                            <span v-for="folder in state.selectedFolders" :key="folder.id"
                                class="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                {{ folder.label }}
                            </span>
                            <span v-if="!state.selectedFolders.length" class="text-sm text-gray-500">
                                {{ $t('caseworkerSharing.noFoldersSelected') }}
                            </span>
                        </div>
                    </div>
                </div>

                <div v-else class="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
                    {{ $t('caseworkerSharing.chooseCitizenToLoad') }}
                </div>

                <div class="flex items-center justify-end gap-2 pt-2">
                    <FormButton type="button" buttonStyle="cancel" @click="emit('close')">
                        {{ $t('caseworkerSharing.cancel') }}
                    </FormButton>
                    <FormButton type="button" buttonStyle="primary" :disabled="state.isSavingConfig"
                        @click="saveConfiguration">
                        {{ state.isSavingConfig ? $t('caseworkerSharing.saving') : $t('caseworkerSharing.saveChanges') }}
                    </FormButton>
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { citizenDocumentService } from '@/components/api/user/CitizenDocumentService'
import { citizenService } from '@/components/api/user/CitizenService'
import { licenseService } from '@/components/api/user/LicenseService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

defineOptions({
    name: 'ModulesUserSettingsLicenseOverviewModalCaseworkerSharingModal',
})

const { t } = useI18n()

const props = defineProps({
    show: {
        type: Boolean,
        required: true,
    },
    selectedLicense: {
        type: Object as PropType<any>,
        default: null,
    },
    folderIds: {
        type: Array as PropType<Array<number | string>>,
        default: () => [],
    },
    permission: {
        type: String,
        default: 'view',
    },
    isTreeLoading: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits<{
    (event: 'close'): void
    (event: 'save', payload: { permission: string; folderIds: Array<number | string> }): void
}>()

const { successAlert, errorAlert } = useAlert()

const show = computed(() => props.show)
const selectedLicense = computed(() => props.selectedLicense)
const folderIds = computed(() => props.folderIds)
const state = reactive({
    citizens: [] as any[],
    citizenTree: [] as any[],
    selectedCitizenUuid: '',
    firstname: '',
    lastname: '',
    permission: 'view',
    showPasswordFields: false,
    password: '',
    passwordConfirm: '',
    folderIds: [] as Array<number | string>,
    fileIds: [] as Array<number | string>,
    isTreeLoading: false,
    isSavingConfig: false,
    errorMessage: '',
    selectedFolders: [] as Array<{ id: number | string; label: string }>,
})

const permissionOptions = computed(() => [
    { value: 'view', label: t('caseworkerSharing.view') },
    { value: 'download', label: t('caseworkerSharing.download') },
])

watch(() => props.show, async (isOpen) => {
    if (!isOpen) {
        resetState()
        return
    }

    const config = selectedLicense.value?.caseworker_license_config
    state.firstname = config?.firstname ?? ''
    state.lastname = config?.lastname ?? ''
    state.permission = props.permission || 'view'
    state.showPasswordFields = false
    state.password = ''
    state.passwordConfirm = ''
    
    const initialFolderIds = (props.folderIds || []).map((f: any) => typeof f === 'object' && f !== null ? (f.id ?? f.uuid) : f)
    state.folderIds = Array.from(new Set(initialFolderIds))
    
    const shareables = config?.shareables ?? []
    const initialFileIds = shareables.filter((s: any) => String(s.shareable_type ?? s.type).toLowerCase().includes('file')).map((s: any) => s.shareable_id ?? s.id ?? s.uuid)
    state.fileIds = Array.from(new Set(initialFileIds))
    
    state.selectedCitizenUuid = state.selectedCitizenUuid || ''
    state.errorMessage = ''
    await fetchCitizens()
})

watch(() => state.selectedCitizenUuid, async (citizenUuid) => {
    if (!props.show || !citizenUuid) {
        state.citizenTree = []
        state.selectedFolders = []
        return
    }

    await loadCitizenTree()
})

watch(() => props.folderIds, () => {
    const initialFolderIds = (props.folderIds || []).map((f: any) => typeof f === 'object' && f !== null ? (f.id ?? f.uuid) : f)
    state.folderIds = Array.from(new Set(initialFolderIds))
    state.selectedFolders = getSelectedFolderLabels()
}, { deep: true })

watch(() => state.folderIds, () => {
    state.selectedFolders = getSelectedFolderLabels()
}, { deep: true })

const selectedFolders = computed(() => state.selectedFolders)

function displayCaseworkerName(license: any) {
    const user = license?.licensed_user
    if (!user) return license?.license || 'Caseworker'
    const name = `${user?.firstname ?? ''} ${user?.lastname ?? ''}`.trim()
    return name || license?.license || 'Caseworker'
}

function handleToggleFolder(node: any, checked: boolean) {
    const id = node?.id !== undefined ? Number(node.id) : node?.uuid
    if (id === undefined || (Number.isNaN(Number(id)) && !node?.uuid)) return

    if (node?.type === 'file') {
        if (checked) {
            if (!state.fileIds.includes(id)) state.fileIds.push(id)
            tryPromoteToFolder(node)
        } else {
            state.fileIds = state.fileIds.filter((fid) => fid !== id)
            tryDemoteFolder(node)
        }
    } else {
        const directFileChildren = (node.children ?? []).filter((c: any) => c.type === 'file')
        const directFileIds = directFileChildren.map((c: any) => c.id !== undefined ? Number(c.id) : c.uuid)
        const directFileIdSet = new Set(directFileIds.map(String))

        if (checked) {
            if (!state.folderIds.includes(id)) state.folderIds.push(id)
            for (const fileId of directFileIds) {
                if (!state.fileIds.includes(fileId)) state.fileIds.push(fileId)
            }
        } else {
            state.folderIds = state.folderIds.filter((fid) => fid !== id)
            state.fileIds = state.fileIds.filter((fid) => !directFileIdSet.has(String(fid)))
        }
    }

    state.selectedFolders = getSelectedFolderLabels()
}

function findFolderNode(nodes: any[], folderId: any): any | null {
    const fidNum = Number(folderId)
    const fidStr = String(folderId)

    for (const node of nodes || []) {
        if ((node?.id !== undefined && Number(node.id) === fidNum) || (node?.uuid !== undefined && String(node.uuid) === fidStr)) {
            return node
        }

        if (node?.children?.length) {
            const found = findFolderNode(node.children, folderId)
            if (found) {
                return found
            }
        }
    }

    return null
}

function findParentNode(nodes: any[], targetId: any): any | null {
    const tid = Number(targetId)
    const tidStr = String(targetId)
    for (const node of nodes || []) {
        const isDirectChild = (node.children ?? []).some(
            (c: any) => Number(c.id) === tid || String(c.uuid) === tidStr
        )
        if (isDirectChild) return node
        if (node.children?.length) {
            const deeper = findParentNode(node.children, targetId)
            if (deeper !== null) return deeper
        }
    }
    return null
}

function tryPromoteToFolder(fileNode: any) {
    const parent = findParentNode(state.citizenTree, fileNode.id ?? fileNode.uuid)
    if (!parent) return

    const directFileChildren = (parent.children ?? []).filter((c: any) => c.type === 'file')
    if (directFileChildren.length === 0) return

    const allSelected = directFileChildren.every((file: any) =>
        state.fileIds.includes(Number(file.id)) || state.fileIds.includes(file.uuid)
    )
    if (!allSelected) return

    const parentId = parent.id !== undefined ? Number(parent.id) : parent.uuid
    if (!state.folderIds.includes(parentId)) {
        state.folderIds.push(parentId)
    }
}

function tryDemoteFolder(fileNode: any) {
    const parent = findParentNode(state.citizenTree, fileNode.id ?? fileNode.uuid)
    if (!parent) return

    const parentId = parent.id !== undefined ? Number(parent.id) : parent.uuid
    if (!state.folderIds.includes(parentId)) return

    state.folderIds = state.folderIds.filter((fid) => fid !== parentId)
}

const indeterminateFolderIds = computed(() => {
    const result: Array<number | string> = []
    const folderIdSet = new Set(state.folderIds.map(String))
    const fileIdSet = new Set(state.fileIds.map(String))

    function traverse(nodes: any[]) {
        for (const node of nodes || []) {
            if (node.type === 'folder') {
                const nodeIdStr = String(node.id ?? node.uuid)
                if (!folderIdSet.has(nodeIdStr)) {
                    const directFiles = (node.children ?? []).filter((c: any) => c.type === 'file')
                    if (directFiles.length > 0) {
                        const selectedCount = directFiles.filter((f: any) => fileIdSet.has(String(f.id ?? f.uuid))).length
                        if (selectedCount > 0 && selectedCount < directFiles.length) {
                            result.push(node.id !== undefined ? Number(node.id) : node.uuid)
                        }
                    }
                }
                traverse(node.children ?? [])
            }
        }
    }

    traverse(state.citizenTree)
    return result
})

async function fetchCitizens() {
    try {
        const response = await citizenService.getAllCitizens({ page: 1 })
        const citizens = response?.data ?? []
        state.citizens = citizens
            .filter((citizen: any) => citizen.uuid !== 'all-citizens')
            .map((citizen: any) => ({
                value: citizen.uuid,
                label: `${citizen.firstname ?? ''} ${citizen.lastname ?? ''}`.trim() || citizen.email || citizen.uuid,
            }))

        if (!state.selectedCitizenUuid && state.citizens.length > 0) {
            state.selectedCitizenUuid = state.citizens[0]?.value || ''
        }
    } catch (error: any) {
        state.errorMessage = error?.message || t('caseworkerSharing.unableToLoadCitizens')
    }
}

async function fetchCitizenTreeItems(citizenUuid: string, folderUuid?: string): Promise<any[]> {
    const collectedItems: any[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
        const params: any = { citizen_uuid: citizenUuid, page }
        if (folderUuid) {
            params.folder_uuid = folderUuid
        }

        const response = await citizenDocumentService.getCitizenFileFolders(params)
        const pageItems = response?.data ?? []
        collectedItems.push(...pageItems)

        hasMore = !!response?.links?.next
        page += 1
    }

    return collectedItems
}

async function buildCitizenTree(citizenUuid: string, folderUuid?: string): Promise<any[]> {
    const items = await fetchCitizenTreeItems(citizenUuid, folderUuid)

    return Promise.all(items.map(async (item: any) => ({
        ...item,
        children: item?.type === 'folder' ? await buildCitizenTree(citizenUuid, item.uuid) : [],
    })))
}

async function loadCitizenTree() {
    if (!state.selectedCitizenUuid) return

    state.errorMessage = ''
    state.isTreeLoading = true
    try {
        state.citizenTree = await buildCitizenTree(state.selectedCitizenUuid)
        
        const folderIdSet = new Set(state.folderIds.map(String))
        const fileIdsToAdd = new Set<number | string>()

        function traverseAndCollect(nodes: any[]) {
            for (const node of nodes || []) {
                const id = node.id !== undefined ? String(node.id) : String(node.uuid)
                if (node.type === 'folder' && folderIdSet.has(id)) {
                    const directFiles = (node.children ?? []).filter((c: any) => c.type === 'file')
                    for (const f of directFiles) {
                        const fId = f.id !== undefined ? Number(f.id) : f.uuid
                        if (fId !== undefined && (typeof fId === 'string' || !Number.isNaN(fId))) {
                            fileIdsToAdd.add(fId)
                        }
                    }
                }
                traverseAndCollect(node.children ?? [])
            }
        }
        traverseAndCollect(state.citizenTree)

        for (const fid of fileIdsToAdd) {
            if (!state.fileIds.includes(fid as any)) {
                state.fileIds.push(fid as any)
            }
        }
        
        state.selectedFolders = getSelectedFolderLabels()
    } catch (error: any) {
        state.errorMessage = error?.message || t('caseworkerSharing.unableToLoadFolders')
    }
    state.isTreeLoading = false
}

function getSelectedFolderLabels() {
    const selectedCitizen = state.citizens.find((citizen: any) => citizen.value === state.selectedCitizenUuid)
    const citizenLabel = selectedCitizen?.label || 'Selected citizen'
    const shareables = selectedLicense.value?.caseworker_license_config?.shareables ?? []

    const selectedFolderIdSet = new Set(state.folderIds.map((fid) => String(fid)))
    const filteredFileIds = state.fileIds.filter((fileId) => {
        const parent = findParentNode(state.citizenTree, fileId)
        return !parent || !selectedFolderIdSet.has(String(parent.id ?? parent.uuid))
    })

    const combined = Array.from(new Set([...state.folderIds, ...filteredFileIds]))

    return combined
        .map((itemId) => {
            const node = findFolderNode(state.citizenTree, itemId)
            if (node) {
                return {
                    id: itemId,
                    label: `${citizenLabel} / ${node.name || node?.label || 'Item'}`,
                }
            }

            const shared = shareables.find((s: any) =>
                String(s.shareable_id ?? s.id) === String(itemId) ||
                String(s.id) === String(itemId) ||
                String(s.uuid) === String(itemId)
            )
            if (shared) {
                const name = shared.name || shared.label || 'Shared item'
                return {
                    id: itemId,
                    label: `${citizenLabel} / ${name}`,
                }
            }

            return {
                id: itemId,
                label: `${citizenLabel} / Item #${itemId}`,
            }
        })
        .filter((item): item is { id: number | string; label: string } => item !== null)
}

function clearPasswordFields() {
    state.password = ''
    state.passwordConfirm = ''
}

function resetState() {
    state.citizens = []
    state.citizenTree = []
    state.selectedCitizenUuid = ''
    state.firstname = ''
    state.lastname = ''
    state.permission = props.permission || 'view'
    state.showPasswordFields = false
    state.password = ''
    state.passwordConfirm = ''
    const initialFolderIds = (props.folderIds || []).map((f: any) => typeof f === 'object' && f !== null ? (f.id ?? f.uuid) : f)
    state.folderIds = Array.from(new Set(initialFolderIds))
    state.fileIds = []
    state.isTreeLoading = false
    state.isSavingConfig = false
    state.errorMessage = ''
    state.selectedFolders = []
}

async function saveConfiguration() {
    if (!props.selectedLicense?.uuid) {
        errorAlert('Fejl', t('caseworkerSharing.configNotAvailable'))
        return
    }

    if (state.password && state.password !== state.passwordConfirm) {
        errorAlert('Fejl', t('caseworkerSharing.passwordsDoNotMatch'))
        return
    }

    const subscriptionUuid: string = props.selectedLicense.uuid

    state.isSavingConfig = true
    try {
        const currentFolderIds = (props.folderIds || []).map((f: any) => typeof f === 'object' && f !== null ? (f.id ?? f.uuid) : f) as Array<number | string>
        const currentShareables = selectedLicense.value?.caseworker_license_config?.shareables ?? []
        const currentFileIds = currentShareables
            .filter((s: any) => String(s.shareable_type ?? s.type).toLowerCase().includes('file'))
            .map((s: any) => s.shareable_id ?? s.id ?? s.uuid)

        const selectedFolderIdSet = new Set(state.folderIds.map(String))
        const effectiveFileIds = state.fileIds.filter((fileId) => {
            const parent = findParentNode(state.citizenTree, fileId)
            return !parent || !selectedFolderIdSet.has(String(parent.id ?? parent.uuid))
        })

        const foldersToAdd = state.folderIds.filter((folderId) => !currentFolderIds.includes(folderId))
        const foldersToRemove = currentFolderIds.filter((folderId) => !state.folderIds.includes(folderId))

        const filesToAdd = effectiveFileIds.filter((fileId) => !currentFileIds.includes(fileId))
        const filesToRemove = currentFileIds.filter((fileId: number) => !effectiveFileIds.includes(fileId))

        await licenseService.updateCaseworkerLicenseConfig(subscriptionUuid, {
            firstname: state.firstname,
            lastname: state.lastname,
            permission: state.permission,
            ...(state.password ? { password: state.password } : {}),
        })

        if (foldersToAdd.length > 0) {
            await licenseService.addCaseworkerFolders(subscriptionUuid, { folder_ids: foldersToAdd })
        }

        if (foldersToRemove.length > 0) {
            await licenseService.removeCaseworkerFolders(subscriptionUuid, { folder_ids: foldersToRemove })
        }

        if (filesToAdd.length > 0) {
            await licenseService.addCaseworkerFiles(subscriptionUuid, { file_ids: filesToAdd })
        }

        if (filesToRemove.length > 0) {
            await licenseService.removeCaseworkerFiles(subscriptionUuid, { file_ids: filesToRemove })
        }

        successAlert('Gemt', t('caseworkerSharing.sharingUpdated'))
        emit('save', { permission: state.permission, folderIds: state.folderIds })
        emit('close')
    } catch (error: any) {
        errorAlert('Fejl', error?.message || 'Kunne ikke gemme konfigurationen')
    } finally {
        state.isSavingConfig = false
    }
}
</script>
