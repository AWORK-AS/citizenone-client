<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('consultantSkills.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('consultantSkills.title') }}</template>

            <div class="mt-8 space-y-5">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <p class="max-w-2xl text-sm text-gray-500">
                    {{ $t('consultantSkills.description') }}
                </p>

                <!-- One card per catalogue: a formal competence, a course taken,
                     and a subject the consultant has experience with. -->
                <div v-for="type in TYPES" :key="type" class="rounded-lg border border-gray-200 bg-white">
                    <div class="flex flex-wrap items-center gap-3 border-b border-gray-100 px-4 py-3">
                        <div>
                            <p class="text-sm font-semibold text-gray-900">
                                {{ $t('consultantSkills.types.' + type + '.title') }}
                            </p>
                            <p class="text-xs text-gray-400">
                                {{ $t('consultantSkills.types.' + type + '.hint') }}
                            </p>
                        </div>
                        <div class="ml-auto flex items-end gap-2">
                            <div class="w-56">
                                <FormTextField :id="`new-${type}`" :name="`new-${type}`" v-model="state.drafts[type]"
                                    :placeholder="$t('consultantSkills.addPlaceholder')" :maxLength="120" />
                            </div>
                            <FormButton type="button" buttonStyle="action" :disabled="!state.drafts[type].trim()"
                                @click="add(type)">
                                <Icon name="ph:plus" class="size-4" />
                                {{ $t('consultantSkills.add') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="cancel" @click="togglePaste(type)">
                                <Icon name="ph:list-plus" class="size-4" />
                                {{ $t('consultantSkills.paste.open') }}
                            </FormButton>
                        </div>
                    </div>

                    <!-- A company usually arrives with the list it already keeps;
                         pasting it beats two hundred rounds of Tilføj. -->
                    <div v-if="state.pasting === type" class="space-y-3 border-b border-gray-100 bg-gray-50 px-4 py-4">
                        <p class="text-xs text-gray-500">{{ $t('consultantSkills.paste.hint') }}</p>
                        <FormTextArea :key="`paste-${type}-${state.pasteKey}`" :id="`paste-${type}`"
                            :name="`paste-${type}`" :rows="6" v-model="state.pasteText"
                            :placeholder="$t('consultantSkills.paste.placeholder')" />
                        <div class="flex items-center justify-end gap-2">
                            <span class="mr-auto text-xs text-gray-400">
                                {{ $t('consultantSkills.paste.count', { count: pastedNames.length }) }}
                            </span>
                            <FormButton type="button" buttonStyle="cancel" @click="state.pasting = ''">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" :disabled="!pastedNames.length"
                                @click="addMany(type)">
                                {{ $t('consultantSkills.paste.submit') }}
                            </FormButton>
                        </div>
                    </div>

                    <p v-if="!byType(type).length" class="px-4 py-5 text-sm text-gray-400">
                        {{ $t('consultantSkills.empty') }}
                    </p>

                    <div v-for="skill in byType(type)" :key="skill.uuid"
                        class="flex flex-wrap items-center gap-3 border-b border-gray-50 px-4 py-2.5 last:border-b-0">
                        <div class="min-w-0 flex-1">
                            <template v-if="state.editing === skill.uuid">
                                <div class="w-64">
                                    <FormTextField :id="`edit-${skill.uuid}`" :name="`edit-${skill.uuid}`"
                                        v-model="state.editName" :placeholder="skill.name" :maxLength="120" />
                                </div>
                            </template>
                            <p v-else class="text-sm font-medium text-gray-900"
                                :class="!skill.is_active && 'text-gray-400 line-through'">
                                {{ skill.name }}
                            </p>
                        </div>

                        <div class="flex items-center gap-2">
                            <template v-if="state.editing === skill.uuid">
                                <FormButton type="button" buttonStyle="cancel" @click="state.editing = ''">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="button" buttonStyle="primary" :disabled="!state.editName.trim()"
                                    @click="rename(skill)">
                                    {{ $t('save') }}
                                </FormButton>
                            </template>
                            <template v-else>
                                <Tooltip :text="skill.is_active
                                    ? $t('consultantSkills.deactivate')
                                    : $t('consultantSkills.activate')">
                                    <FormButton type="button" buttonStyle="action"
                                        :aria-label="skill.is_active
                                            ? $t('consultantSkills.deactivate')
                                            : $t('consultantSkills.activate')"
                                        @click="toggleActive(skill)">
                                        <Icon :name="skill.is_active ? 'ph:eye' : 'ph:eye-slash'" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                                <FormButton type="button" buttonStyle="action" @click="startRename(skill)">
                                    <Icon name="ph:pencil-simple" class="size-4" />
                                </FormButton>
                                <FormButton type="button" buttonStyle="danger" @click="confirmDelete(skill)">
                                    <Icon name="ph:trash" class="size-4" />
                                </FormButton>
                            </template>
                        </div>
                    </div>
                </div>
            </div>

            <DialogConfirmation :isModalOpen="state.isDeleteOpen"
                :message="$t('consultantSkills.confirmation.delete') + '?'" @close="state.isDeleteOpen = false"
                @confirm="remove" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { consultantSkillService } from '@/components/api/user/ConsultantSkillService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()

const TYPES = ['competence', 'course', 'topic']

const breadcrumbLinks = [
    {
        name: 'consultantSkills.title',
        translate: true,
        href: '/settings/consultant-skills',
    },
]

const state = reactive({
    error: {} as Error,
    skills: [] as any[],
    drafts: { competence: '', course: '', topic: '' } as Record<string, string>,
    editing: '',
    editName: '',
    isDeleteOpen: false,
    selected: null as any,
    pasting: '',
    pasteText: '',
    pasteKey: 0,
})

// One name per line; the server trims and skips repeats, this only counts.
const pastedNames = computed(() => state.pasteText.split(/\r?\n/).map(line => line.trim()).filter(Boolean))

onMounted(() => {
    fetchSkills()
})

function byType(type: string) {
    return state.skills.filter((skill: any) => skill.type === type)
}

async function fetchSkills() {
    state.error = {}
    try {
        const response = await consultantSkillService.getSkills()
        state.skills = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
}

async function add(type: string) {
    state.error = {}
    try {
        await consultantSkillService.saveSkill({ name: state.drafts[type].trim(), type })
        state.drafts[type] = ''
        await fetchSkills()
    } catch (error: any) {
        // A duplicate name comes back as a validation message, which is worth
        // reading rather than a banner at the top of a long page.
        errorAlert(t('alert.warning'), error?.errors?.name?.[0] ?? error?.message ?? t('consultantSkills.alert.saveFailed'))
    }
}

function togglePaste(type: string) {
    state.pasting = state.pasting === type ? '' : type
    state.pasteText = ''
    state.pasteKey++
}

async function addMany(type: string) {
    state.error = {}
    try {
        const response = await consultantSkillService.saveSkills(type, pastedNames.value)
        const added = response?.data?.length ?? 0
        const skipped = response?.meta?.skipped?.length ?? 0
        state.pasting = ''
        state.pasteText = ''
        state.pasteKey++
        await fetchSkills()
        // Saying what was left out is the point: a long list that silently
        // shrinks reads as lost entries.
        successAlert(`${t('alert.success')}!`, t('consultantSkills.paste.result', { added, skipped }))
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('consultantSkills.alert.saveFailed'))
    }
}

function startRename(skill: any) {
    state.editing = skill.uuid
    state.editName = skill.name
}

async function rename(skill: any) {
    state.error = {}
    try {
        await consultantSkillService.updateSkill(skill.uuid, { name: state.editName.trim() })
        state.editing = ''
        await fetchSkills()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('consultantSkills.alert.saveFailed'))
    }
}

async function toggleActive(skill: any) {
    state.error = {}
    try {
        await consultantSkillService.updateSkill(skill.uuid, { is_active: !skill.is_active })
        await fetchSkills()
    } catch (error: any) {
        state.error = error
    }
}

function confirmDelete(skill: any) {
    state.selected = skill
    state.isDeleteOpen = true
}

async function remove() {
    state.isDeleteOpen = false
    try {
        await consultantSkillService.deleteSkill(state.selected.uuid)
        await fetchSkills()
        successAlert(`${t('alert.success')}!`, `${t('consultantSkills.alert.deleted')}.`)
    } catch (error: any) {
        // The usual refusal is "this is set on N consultants" - the message says
        // to deactivate instead, so it needs to be read.
        errorAlert(t('alert.warning'), error?.message ?? t('consultantSkills.alert.deleteFailed'))
    }
}
</script>
