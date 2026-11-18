<template>
    <!-- Who hears about a case that needs a consultant recruited: employee
         groups, individual employees, or both. -->
    <div class="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
        <div>
            <p class="text-sm font-semibold text-gray-900">{{ $t('inquiryRecruitment.settings.title') }}</p>
            <p class="mt-1 max-w-2xl text-xs text-gray-500">{{ $t('inquiryRecruitment.settings.description') }}</p>
        </div>

        <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />

        <div class="flex items-start gap-3">
            <FormSwitch :value="state.form.enabled" :label="$t('inquiryRecruitment.settings.enabled')"
                @toggleSwitch="state.form.enabled = !state.form.enabled" />
            <div>
                <p class="text-sm text-gray-900">{{ $t('inquiryRecruitment.settings.enabled') }}</p>
                <p class="text-xs text-gray-500">{{ $t('inquiryRecruitment.settings.enabledHint') }}</p>
            </div>
        </div>

        <div class="flex items-start gap-3">
            <FormSwitch :value="state.form.email_enabled" :label="$t('inquiryRecruitment.settings.emailEnabled')"
                @toggleSwitch="state.form.email_enabled = !state.form.email_enabled" />
            <div>
                <p class="text-sm text-gray-900">{{ $t('inquiryRecruitment.settings.emailEnabled') }}</p>
                <p class="text-xs text-gray-500">{{ $t('inquiryRecruitment.settings.emailEnabledHint') }}</p>
            </div>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="space-y-1">
                <FormLabel for="recruitment-groups" :label="$t('inquiryRecruitment.settings.groups')" />
                <FormSelectMultiple id="recruitment-groups" v-model="state.form.employee_group_uuids"
                    :options="state.options.groups" :loading="state.isLoading" />
            </div>
            <div class="space-y-1">
                <FormLabel for="recruitment-users" :label="$t('inquiryRecruitment.settings.users')" />
                <FormSelectMultiple id="recruitment-users" v-model="state.form.user_uuids"
                    :options="state.options.users" :loading="state.isLoading" />
            </div>
            <div v-if="tasksEnabled" class="space-y-1">
                <FormLabel for="recruitment-board" :label="$t('inquiryRecruitment.settings.taskBoard')" />
                <FormSelect id="recruitment-board" v-model="state.form.task_board_uuid" :options="state.options.boards" />
                <p class="text-xs text-gray-400">{{ $t('inquiryRecruitment.settings.taskBoardHint') }}</p>
            </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-xs" :class="status === 'count' ? 'text-gray-500' : 'text-[#c0442c]'">
                {{ status === 'off'
                    ? $t('inquiryRecruitment.settings.off')
                    : status === 'count'
                        ? $t('inquiryRecruitment.settings.recipientCount', { count: state.recipientCount })
                        : $t('inquiryRecruitment.settings.nobody') }}
            </p>
            <!-- Not while loading: the form still holds empty defaults then, and
                 saving it would wipe the team. -->
            <FormButton type="button" buttonStyle="primary" :disabled="state.isSaving || state.isLoading" @click="save">
                {{ $t('save') }}
            </FormButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inquirySettingService } from '@/components/api/user/InquirySettingService'
import { employeeGroupService } from '@/components/api/user/EmployeeGroupService'
import { userService } from '@/components/api/user/UserService'
import { taskService } from '@/components/api/user/TaskService'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { recruitmentFormFrom, recruitmentPayload, recruitmentStatus } from '@/composables/inquiryRecruitmentSettings'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()

const tasksEnabled = computed(() => !!userStore.getUser?.company?.tasks_workflow_enabled)

const state = reactive({
    error: {} as Error,
    isLoading: true,
    isSaving: false,
    recipientCount: 0,
    form: recruitmentFormFrom(undefined),
    options: {
        groups: [] as any[],
        users: [] as any[],
        boards: [] as any[],
    },
})

const status = computed(() => recruitmentStatus(state.form.enabled, state.recipientCount))

onMounted(() => {
    load()
})

function apply(data: any) {
    state.form = recruitmentFormFrom(data)
    state.recipientCount = data?.recipient_count ?? 0
}

async function load() {
    state.error = {}
    state.isLoading = true
    try {
        const [settings, groups, users, boards] = await Promise.all([
            inquirySettingService.getRecruitment(),
            employeeGroupService.getEmployeeGroups({ per_page: 200 }),
            userService.getAllUsersWithoutAllUsersOption(),
            tasksEnabled.value ? taskService.getBoards() : Promise.resolve({ data: [] }),
        ])
        state.options.groups = (groups?.data ?? [])
            .map((group: any) => ({ value: group.uuid, label: group.name }))
            .sort((a: any, b: any) => a.label.localeCompare(b.label))
        state.options.users = (users?.data ?? []).map((user: any) => ({
            value: user.uuid,
            label: `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim(),
        }))
        state.options.boards = (boards?.data ?? []).map((board: any) => ({ value: board.uuid, label: board.name }))
        apply(settings?.data)
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function save() {
    state.error = {}
    state.isSaving = true
    try {
        const response = await inquirySettingService.saveRecruitment(recruitmentPayload(state.form))
        apply(response?.data)
        successAlert(`${t('alert.success')}!`, `${t('inquiryRecruitment.settings.saved')}.`)
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}
</script>
