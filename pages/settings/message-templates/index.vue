<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('messageTemplates.messageTemplates') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('messageTemplates.messageTemplates') }}</template>

            <div class="mt-8">
                <p class="text-sm text-gray-500 mb-5">{{ $t('messageTemplates.description') }}</p>

                <div v-if="canManage" class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" @click="openCreate">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('messageTemplates.addNew') }}
                    </FormButton>
                </div>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <div class="bg-white ring-1 ring-gray-200 rounded-xl">
                    <div v-if="!state.isLoading && state.templates.length === 0"
                        class="py-16 text-center text-gray-400">
                        {{ $t('messageTemplates.noTemplates') }}
                    </div>
                    <div v-for="(tpl, index) in state.templates" :key="tpl.uuid"
                        :class="index > 0 ? 'border-t border-gray-100' : ''">
                        <div class="flex items-start gap-4 px-5 py-4">
                            <div class="grow min-w-0">
                                <h3 class="text-base font-semibold text-gray-900">{{ tpl.title }}</h3>
                                <p class="text-sm text-gray-500 mt-0.5 whitespace-pre-line">{{ tpl.body }}</p>
                            </div>
                            <div v-if="canManage" class="flex items-center gap-1.5 flex-shrink-0">
                                <FormButton buttonStyle="action" buttonSize="sm" @click="openEdit(tpl)">
                                    <Icon name="ph:pencil-simple" class="h-4 w-4" aria-hidden="true" />
                                </FormButton>
                                <FormButton buttonStyle="action" buttonSize="sm" @click="confirmDelete(tpl)">
                                    <Icon name="ph:trash" class="h-4 w-4" aria-hidden="true" />
                                </FormButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal size="md" :title="state.editing ? $t('messageTemplates.edit') : $t('messageTemplates.addNew')"
                :show="state.modal.isFormOpen" @close="closeForm">
                <template #modal-body>
                    <div class="space-y-4">
                        <div class="space-y-1">
                            <FormLabel for="title" :label="$t('messageTemplates.form.title')" />
                            <FormTextField id="title" name="title" :placeholder="$t('messageTemplates.form.title')"
                                v-model="state.form.title" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="body" :label="$t('messageTemplates.form.body')" />
                            <FormTextArea id="body" name="body" :rows="5"
                                :placeholder="$t('messageTemplates.form.bodyPlaceholder')" v-model="state.form.body" />
                        </div>
                        <div class="flex justify-end gap-3 pt-2">
                            <FormButton buttonStyle="secondary" @click="closeForm">{{ $t('cancel') }}</FormButton>
                            <FormButton buttonStyle="primary" :disabled="state.isSaving || !isValid" @click="save">
                                {{ $t('save') }}
                            </FormButton>
                        </div>
                    </div>
                </template>
            </Modal>

            <Modal size="sm" :title="$t('messageTemplates.deleteTitle')" :show="state.modal.isDeleteOpen"
                @close="state.modal.isDeleteOpen = false">
                <template #modal-body>
                    <p class="text-sm text-gray-600">{{ $t('messageTemplates.deleteConfirm') }}</p>
                    <div class="flex justify-end gap-3 pt-5">
                        <FormButton buttonStyle="secondary" @click="state.modal.isDeleteOpen = false">
                            {{ $t('cancel') }}
                        </FormButton>
                        <FormButton buttonStyle="danger" :disabled="state.isSaving" @click="doDelete">
                            {{ $t('messageTemplates.deleteAction') }}
                        </FormButton>
                    </div>
                </template>
            </Modal>

        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { messageTemplatesService } from '@/components/api/user/MessageTemplatesService'
import { usePermissions } from '@/composables/usePermissions'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const { successAlert, errorAlert } = useAlert()
const { isAtLeast } = usePermissions()

const canManage = computed(() => isAtLeast('Manager'))

const breadcrumbLinks = [
    { name: 'settings.tabs.profile', translate: true, href: '/settings/profile' },
    { name: 'messageTemplates.messageTemplates', translate: true, href: '/settings/message-templates' },
]

const state = reactive({
    error: {} as Error,
    isLoading: false,
    isSaving: false,
    templates: [] as any[],
    editing: null as any,
    form: { title: '', body: '' },
    modal: { isFormOpen: false, isDeleteOpen: false },
    deleteTarget: null as any,
})

const isValid = computed(() => state.form.title.trim().length > 0 && state.form.body.trim().length > 0)

async function fetchTemplates() {
    state.isLoading = true
    try {
        const response = await messageTemplatesService.listMessageTemplates()
        state.templates = Array.isArray(response) ? response : (response?.data ?? [])
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function openCreate() {
    state.editing = null
    state.form = { title: '', body: '' }
    state.modal.isFormOpen = true
}

function openEdit(tpl: any) {
    state.editing = tpl
    state.form = { title: tpl.title, body: tpl.body }
    state.modal.isFormOpen = true
}

function closeForm() {
    state.modal.isFormOpen = false
}

async function save() {
    if (!isValid.value) return
    state.isSaving = true
    try {
        if (state.editing) {
            await messageTemplatesService.updateMessageTemplate(state.editing.uuid, state.form)
        } else {
            await messageTemplatesService.saveMessageTemplate(state.form)
        }
        state.modal.isFormOpen = false
        await fetchTemplates()
        successAlert(`${t('alert.success')}!`, `${t('messageTemplates.saved')}.`)
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('messageTemplates.saveFailed'))
    }
    state.isSaving = false
}

function confirmDelete(tpl: any) {
    state.deleteTarget = tpl
    state.modal.isDeleteOpen = true
}

async function doDelete() {
    if (!state.deleteTarget) return
    state.isSaving = true
    try {
        await messageTemplatesService.deleteMessageTemplate(state.deleteTarget.uuid)
        state.modal.isDeleteOpen = false
        await fetchTemplates()
        successAlert(`${t('alert.success')}!`, `${t('messageTemplates.deleted')}.`)
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('messageTemplates.saveFailed'))
    }
    state.isSaving = false
}

onMounted(fetchTemplates)
</script>
