<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('goalTypes.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('goalTypes.title') }}</template>

            <div class="mt-8 space-y-5">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <p class="max-w-2xl text-sm text-gray-500">{{ $t('goalTypes.description') }}</p>

                <div class="rounded-lg border border-gray-200 bg-white">
                    <div v-if="canManage" class="flex flex-wrap items-end gap-3 border-b border-gray-100 px-4 py-3">
                        <div class="w-64">
                            <FormLabel for="new-goalType" :label="$t('goalTypes.form.name')" />
                            <FormTextField id="new-goalType" name="new-goalType" v-model="state.draft"
                                :placeholder="$t('goalTypes.form.namePlaceholder')" :maxLength="120" />
                        </div>
                        <Tooltip :text="$t('goalTypes.addHint')">
                            <FormButton type="button" buttonStyle="action" :disabled="!state.draft.trim()" @click="add">
                                <Icon name="ph:plus" class="size-4" />
                                {{ $t('goalTypes.add') }}
                            </FormButton>
                        </Tooltip>
                    </div>

                    <p v-if="!state.types.length" class="px-4 py-5 text-sm text-gray-400">{{ $t('goalTypes.empty') }}</p>

                    <div v-for="(goalType, index) in state.types" :key="goalType.uuid"
                        class="flex flex-wrap items-center gap-3 border-b border-gray-50 px-4 py-2.5 last:border-b-0">
                        <div class="min-w-0 flex-1">
                            <div v-if="state.editing === goalType.uuid" class="w-64">
                                <FormTextField :id="`goalType-${goalType.uuid}`" :name="`goalType-${goalType.uuid}`"
                                    v-model="state.editName" :placeholder="goalType.name" :maxLength="120" />
                            </div>
                            <p v-else class="text-sm font-medium text-gray-900"
                                :class="!goalType.is_active && 'text-gray-400 line-through'">{{ goalType.name }}</p>
                        </div>
                        <div v-if="canManage" class="flex items-center gap-2">
                            <template v-if="state.editing === goalType.uuid">
                                <FormButton type="button" buttonStyle="cancel" @click="state.editing = ''">{{ $t('cancel') }}</FormButton>
                                <FormButton type="button" buttonStyle="primary" :disabled="!state.editName.trim()"
                                    @click="update(goalType, { name: state.editName.trim() })">{{ $t('save') }}</FormButton>
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
                                <Tooltip :text="goalType.is_active ? $t('goalTypes.actions.switchOff') : $t('goalTypes.actions.switchOn')">
                                    <FormButton type="button" buttonStyle="action"
                                        :aria-label="goalType.is_active ? $t('goalTypes.actions.switchOff') : $t('goalTypes.actions.switchOn')"
                                        @click="update(goalType, { is_active: !goalType.is_active })">
                                        <Icon :name="goalType.is_active ? 'ph:eye' : 'ph:eye-slash'" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                                <Tooltip :text="$t('goalTypes.actions.rename')">
                                    <FormButton type="button" buttonStyle="action" :aria-label="$t('goalTypes.actions.rename')"
                                        @click="state.editing = goalType.uuid; state.editName = goalType.name">
                                        <Icon name="ph:pencil-simple" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                                <Tooltip :text="$t('goalTypes.actions.delete')">
                                    <FormButton type="button" buttonStyle="danger" :aria-label="$t('goalTypes.actions.delete')"
                                        @click="remove(goalType)">
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

import { goalTypeService } from '@/components/api/user/GoalTypeService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()
const { isAtLeast, can } = usePermissions()

const breadcrumbLinks = [{ name: 'goalTypes.title', translate: true, href: '/settings/goal-types' }]

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
        const response = await goalTypeService.getTypes()
        state.types = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
}

async function add() {
    try {
        await goalTypeService.saveType({ name: state.draft.trim() })
        state.draft = ''
        await fetchTypes()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.errors?.name?.[0] ?? error?.message ?? t('goalTypes.alert.saveFailed'))
    }
}

async function update(goalType: any, params: object) {
    try {
        await goalTypeService.updateType(goalType.uuid, params)
        state.editing = ''
        await fetchTypes()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('goalTypes.alert.saveFailed'))
    }
}

async function remove(goalType: any) {
    try {
        await goalTypeService.deleteType(goalType.uuid)
        await fetchTypes()
        successAlert(`${t('alert.success')}!`, `${t('goalTypes.alert.deleted')}.`)
    } catch (error: any) {
        // In use: the refusal says to switch it off instead.
        errorAlert(t('alert.warning'), error?.message ?? t('goalTypes.alert.deleteFailed'))
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
        const response = await goalTypeService.reorderTypes(reordered.map((goalType: any) => goalType.uuid))
        state.types = response?.data ?? reordered
    } catch (error: any) {
        state.error = error
        fetchTypes()
    }
}
</script>
