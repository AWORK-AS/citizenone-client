<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('visitTypes.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('visitTypes.title') }}</template>

            <div class="mt-8 space-y-5">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <p class="max-w-2xl text-sm text-gray-500">{{ $t('visitTypes.description') }}</p>

                <div class="rounded-lg border border-gray-200 bg-white">
                    <div v-if="canManage" class="flex flex-wrap items-end gap-3 border-b border-gray-100 px-4 py-3">
                        <div class="w-64">
                            <FormLabel for="new-visit-type" :label="$t('visitTypes.form.name')" />
                            <FormTextField id="new-visit-type" name="new-visit-type" v-model="state.draft"
                                :placeholder="$t('visitTypes.form.namePlaceholder')" :maxLength="120" />
                        </div>
                        <Tooltip :text="$t('visitTypes.addHint')">
                            <FormButton type="button" buttonStyle="action" :disabled="!state.draft.trim()" @click="add">
                                <Icon name="ph:plus" class="size-4" />
                                {{ $t('visitTypes.add') }}
                            </FormButton>
                        </Tooltip>
                    </div>

                    <p v-if="!state.types.length" class="px-4 py-5 text-sm text-gray-400">{{ $t('visitTypes.empty') }}</p>

                    <div v-for="(type, index) in state.types" :key="type.uuid"
                        class="flex flex-wrap items-center gap-3 border-b border-gray-50 px-4 py-2.5 last:border-b-0">
                        <div class="min-w-0 flex-1">
                            <div v-if="state.editing === type.uuid" class="w-64">
                                <FormTextField :id="`visit-type-${type.uuid}`" :name="`visit-type-${type.uuid}`"
                                    v-model="state.editName" :placeholder="type.name" :maxLength="120" />
                            </div>
                            <p v-else class="text-sm font-medium text-gray-900"
                                :class="!type.is_active && 'text-gray-400 line-through'">{{ type.name }}</p>
                        </div>
                        <div v-if="canManage" class="flex items-center gap-2">
                            <template v-if="state.editing === type.uuid">
                                <FormButton type="button" buttonStyle="cancel" @click="state.editing = ''">{{ $t('cancel') }}</FormButton>
                                <FormButton type="button" buttonStyle="primary" :disabled="!state.editName.trim()"
                                    @click="update(type, { name: state.editName.trim() })">{{ $t('save') }}</FormButton>
                            </template>
                            <template v-else>
                                <Tooltip :text="$t('inquiryPipelineStages.actions.moveUp')">
                                    <FormButton type="button" buttonStyle="action" :disabled="index === 0"
                                        :aria-label="$t('inquiryPipelineStages.actions.moveUp')" @click="move(index, -1)">
                                        <Icon name="ph:arrow-up" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                                <Tooltip :text="$t('inquiryPipelineStages.actions.moveDown')">
                                    <FormButton type="button" buttonStyle="action" :disabled="index === state.types.length - 1"
                                        :aria-label="$t('inquiryPipelineStages.actions.moveDown')" @click="move(index, 1)">
                                        <Icon name="ph:arrow-down" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                                <Tooltip :text="type.is_active ? $t('visitTypes.actions.switchOff') : $t('visitTypes.actions.switchOn')">
                                    <FormButton type="button" buttonStyle="action"
                                        :aria-label="type.is_active ? $t('visitTypes.actions.switchOff') : $t('visitTypes.actions.switchOn')"
                                        @click="update(type, { is_active: !type.is_active })">
                                        <Icon :name="type.is_active ? 'ph:eye' : 'ph:eye-slash'" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                                <Tooltip :text="$t('visitTypes.actions.rename')">
                                    <FormButton type="button" buttonStyle="action" :aria-label="$t('visitTypes.actions.rename')"
                                        @click="state.editing = type.uuid; state.editName = type.name">
                                        <Icon name="ph:pencil-simple" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                                <Tooltip :text="$t('visitTypes.actions.delete')">
                                    <FormButton type="button" buttonStyle="danger" :aria-label="$t('visitTypes.actions.delete')"
                                        @click="remove(type)">
                                        <Icon name="ph:trash" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'require-page', requiredPage: 'Citizens' })

import { registrationRuleService } from '@/components/api/user/RegistrationRuleService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()
const { isAtLeast, can } = usePermissions()

const breadcrumbLinks = [{ name: 'visitTypes.title', translate: true, href: '/settings/visit-types' }]

const canManage = computed(() => isAtLeast('Admin') || can('update'))

const state = reactive({
    error: {} as Error,
    types: [] as any[],
    draft: '',
    editing: '',
    editName: '',
})

onMounted(fetchTypes)

async function fetchTypes() {
    state.error = {}
    try {
        const response = await registrationRuleService.getVisitTypes()
        state.types = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
}

async function add() {
    try {
        await registrationRuleService.saveVisitType({ name: state.draft.trim() })
        state.draft = ''
        await fetchTypes()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.errors?.name?.[0] ?? error?.message ?? t('visitTypes.alert.saveFailed'))
    }
}

async function update(type: any, params: object) {
    try {
        await registrationRuleService.updateVisitType(type.uuid, params)
        state.editing = ''
        await fetchTypes()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('visitTypes.alert.saveFailed'))
    }
}

async function remove(type: any) {
    try {
        await registrationRuleService.deleteVisitType(type.uuid)
        await fetchTypes()
        successAlert(`${t('alert.success')}!`, `${t('visitTypes.alert.deleted')}.`)
    } catch (error: any) {
        // In use: the refusal says to switch it off instead.
        errorAlert(t('alert.warning'), error?.message ?? t('visitTypes.alert.deleteFailed'))
    }
}

async function move(index: number, direction: number) {
    const target = index + direction
    if (target < 0 || target >= state.types.length) return

    const reordered = [...state.types]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(target, 0, moved)
    state.types = reordered

    try {
        const response = await registrationRuleService.reorderVisitTypes(reordered.map((type: any) => type.uuid))
        state.types = response?.data ?? reordered
    } catch (error: any) {
        state.error = error
        fetchTypes()
    }
}
</script>
