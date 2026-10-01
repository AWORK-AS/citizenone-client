<template>
    <Modal size="sm" :title="props.box ? $t('dailyOverviewLayouts.editBox') : $t('dailyOverviewLayouts.newBox')"
        :show="props.isModalOpen" @close="emit('close')">
        <template #modal-body>
            <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />
            <form class="space-y-4" @submit.prevent="save">
                <div>
                    <FormLabel for="custom-box-title" :label="$t('dailyOverviewLayouts.form.title')" />
                    <FormTextField id="custom-box-title" name="title" v-model="state.form.title" :maxLength="255" />
                    <FormError :error="state.error?.errors?.title?.[0]" />
                </div>
                <div>
                    <FormLabel :label="$t('dailyOverviewLayouts.form.source')" />
                    <FormSelect v-model="state.form.source" :options="sourceOptions" :canClear="false"
                        :canDeselect="false" />
                    <FormError :error="state.error?.errors?.source?.[0]" />
                </div>
                <div>
                    <FormLabel for="custom-box-limit" :label="$t('dailyOverviewLayouts.form.limit')" />
                    <FormNumberField name="custom-box-limit" :min="1" v-model="state.form.limit" />
                    <FormError :error="state.error?.errors?.['settings.limit']?.[0]" />
                </div>
                <template v-if="state.form.source === 'plans_and_goals'">
                    <p class="flex items-start gap-x-1.5 text-xs text-slate-500">
                        <Icon name="ph:info" class="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {{ $t('dailyOverviewLayouts.form.pageNote') }}
                    </p>
                    <div>
                        <FormLabel for="custom-box-due" :label="$t('dailyOverviewLayouts.form.dueWithinDays')" />
                        <FormNumberField name="custom-box-due" :min="1" v-model="state.form.due_within_days" />
                        <p class="mt-1 text-xs text-slate-500">{{ $t('dailyOverviewLayouts.form.dueWithinDaysHelp') }}</p>
                        <FormError :error="state.error?.errors?.['settings.due_within_days']?.[0]" />
                    </div>
                    <div class="flex w-fit cursor-pointer items-center text-sm"
                        @click="state.form.include_completed = !state.form.include_completed">
                        <FormCheckbox :value="state.form.include_completed" />
                        {{ $t('dailyOverviewLayouts.form.includeCompleted') }}
                    </div>
                </template>
                <div class="flex justify-end gap-x-3 pt-2">
                    <FormButton type="button" buttonStyle="cancel" @click="emit('close')">{{ $t('cancel') }}</FormButton>
                    <FormButton type="submit" buttonStyle="primary" :disabled="state.isSaving">{{ $t('save') }}</FormButton>
                </div>
            </form>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import { useI18n } from 'vue-i18n'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    // The box being edited; null for a new one.
    box: {
        type: Object,
        default: null,
    },
})
const emit = defineEmits(['close', 'saved'])
const { t } = useI18n()

const state = reactive({
    error: {} as any,
    isSaving: false,
    form: blankForm(),
})

const sourceOptions = computed(() => [
    { value: 'assigned_citizens', label: t('dailyOverviewLayouts.sources.assigned_citizens') },
    { value: 'plans_and_goals', label: t('dailyOverviewLayouts.sources.plans_and_goals') },
])

watch(() => props.isModalOpen, (isOpen) => {
    if (!isOpen) return
    state.error = {}
    state.form = props.box
        ? {
            title: props.box.title,
            source: props.box.source,
            limit: String(props.box.settings?.limit ?? 20),
            due_within_days: props.box.settings?.due_within_days ? String(props.box.settings.due_within_days) : '',
            include_completed: !!props.box.settings?.include_completed,
        }
        : blankForm()
})

function blankForm() {
    return { title: '', source: 'plans_and_goals', limit: '20', due_within_days: '', include_completed: false }
}

async function save() {
    state.error = {}
    state.isSaving = true
    try {
        const settings: Record<string, any> = { limit: state.form.limit ? Number(state.form.limit) : null }
        if (state.form.source === 'plans_and_goals') {
            settings.due_within_days = state.form.due_within_days ? Number(state.form.due_within_days) : null
            settings.include_completed = state.form.include_completed
        }
        const params = { title: state.form.title, source: state.form.source, settings }
        const response = props.box
            ? await dailyOverviewService.updateCustomBox(props.box.uuid, params)
            : await dailyOverviewService.saveCustomBox(params)
        if (response?.data) emit('saved', response.data)
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}
</script>
