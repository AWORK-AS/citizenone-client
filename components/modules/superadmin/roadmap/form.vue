<template>
    <form @submit.prevent="submitForm()" class="space-y-4 text-left">
        <Alert type="danger" :text="props.error?.message" v-if="props.error?.message" />

        <div class="space-y-1">
            <SuperadminFormLabel for="title" :label="$t('superadmin.roadmap.form.title')" />
            <input id="title" v-model="state.form.title" type="text" maxlength="255"
                class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            <SuperadminFormError :error="v$.form.title.$errors[0]?.$message?.toString()" />
            <SuperadminFormError :error="props.error?.errors?.title?.[0]" />
        </div>

        <div class="space-y-1">
            <SuperadminFormLabel for="description" :label="$t('superadmin.roadmap.form.description')" />
            <p class="text-xs text-gray-500">{{ $t('superadmin.roadmap.form.descriptionHint') }}</p>
            <ckeditor :editor="editor" v-model="state.form.description" :config="editorConfig"></ckeditor>
            <SuperadminFormError :error="props.error?.errors?.description?.[0]" />
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="space-y-1">
                <SuperadminFormLabel for="status" :label="$t('superadmin.roadmap.form.status')" />
                <select id="status" v-model="state.form.status"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none">
                    <option v-for="status in statuses" :key="status" :value="status">
                        {{ $t(`comingFunctions.status.${status}`) }}
                    </option>
                </select>
                <SuperadminFormError :error="props.error?.errors?.status?.[0]" />
            </div>
            <div class="space-y-1">
                <SuperadminFormLabel for="expected_period" :label="$t('superadmin.roadmap.form.expectedPeriod')" />
                <input id="expected_period" v-model="state.form.expected_period" type="text" maxlength="50"
                    :placeholder="$t('superadmin.roadmap.form.expectedPeriodPlaceholder')"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                <SuperadminFormError :error="props.error?.errors?.expected_period?.[0]" />
            </div>
        </div>

        <div class="space-y-1">
            <SuperadminFormLabel :label="$t('superadmin.roadmap.form.industries')" />
            <p class="text-xs text-gray-500">{{ $t('superadmin.roadmap.form.industriesHint') }}</p>
            <div class="flex flex-wrap gap-2 pt-1">
                <label v-for="industry in props.industries" :key="industry.uuid"
                    class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
                    :class="state.form.industry_uuids.includes(industry.uuid) ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-600'">
                    <input type="checkbox" class="sr-only" :value="industry.uuid" v-model="state.form.industry_uuids" />
                    {{ industryName(industry) }}
                </label>
            </div>
            <SuperadminFormError :error="props.error?.errors?.industry_uuids?.[0]" />
        </div>

        <!-- Internal: never shown to users. -->
        <fieldset class="space-y-4 rounded-md border border-dashed border-amber-300 bg-amber-50/40 p-4">
            <legend class="flex items-center gap-1.5 px-1 text-sm font-semibold text-amber-800">
                <Icon name="ph:lock-simple" class="h-4 w-4" /> {{ $t('superadmin.roadmap.internal.title') }}
            </legend>
            <p class="-mt-2 text-xs text-gray-500">{{ $t('superadmin.roadmap.internal.hint') }}</p>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div class="space-y-1">
                    <SuperadminFormLabel for="category" :label="$t('superadmin.roadmap.internal.category')" />
                    <select id="category" v-model="state.form.internal.category" :class="inputClass">
                        <option :value="null">-</option>
                        <option v-for="category in categories" :key="category" :value="category">
                            {{ $t(`superadmin.roadmap.categories.${category}`) }}
                        </option>
                    </select>
                </div>
                <div class="space-y-1">
                    <SuperadminFormLabel for="priority" :label="$t('superadmin.roadmap.internal.priority')" />
                    <select id="priority" v-model="state.form.internal.priority" :class="inputClass">
                        <option :value="null">-</option>
                        <option v-for="priority in priorities" :key="priority" :value="priority">
                            {{ $t(`superadmin.roadmap.priorities.${priority}`) }}
                        </option>
                    </select>
                </div>
                <div class="space-y-1">
                    <SuperadminFormLabel for="stage" :label="$t('superadmin.roadmap.internal.stage')" />
                    <select id="stage" v-model="state.form.internal.stage" :class="inputClass">
                        <option v-for="stage in stages" :key="stage" :value="stage">
                            {{ $t(`superadmin.roadmap.stages.${stage}`) }}
                        </option>
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div class="space-y-1">
                    <SuperadminFormLabel for="owner" :label="$t('superadmin.roadmap.internal.owner')" />
                    <input id="owner" v-model="state.form.internal.owner" type="text" maxlength="100" :class="inputClass" />
                </div>
                <div class="space-y-1">
                    <SuperadminFormLabel for="ticket" :label="$t('superadmin.roadmap.internal.ticket')" />
                    <input id="ticket" v-model="state.form.internal.ticket" type="text" maxlength="100" :class="inputClass" />
                </div>
                <div class="space-y-1">
                    <SuperadminFormLabel for="internal_eta" :label="$t('superadmin.roadmap.internal.eta')" />
                    <input id="internal_eta" v-model="state.form.internal.internal_eta" type="text" maxlength="50" :class="inputClass" />
                </div>
            </div>

            <label class="flex cursor-pointer items-center gap-2 text-sm text-gray-800">
                <input v-model="state.form.internal.is_important" type="checkbox" />
                <Icon name="ph:star-fill" class="h-4 w-4 text-amber-500" /> {{ $t('superadmin.roadmap.internal.important') }}
            </label>

            <div class="space-y-1">
                <SuperadminFormLabel for="original_text" :label="$t('superadmin.roadmap.internal.originalText')" />
                <textarea id="original_text" v-model="state.form.internal.original_text" rows="4" :class="inputClass"></textarea>
            </div>
            <div class="space-y-1">
                <SuperadminFormLabel for="notes" :label="$t('superadmin.roadmap.internal.notes')" />
                <textarea id="notes" v-model="state.form.internal.notes" rows="3" :class="inputClass"></textarea>
            </div>

            <p v-if="props.selectedItem?.internal?.source" class="text-xs text-gray-400">
                {{ $t('superadmin.roadmap.internal.source', { source: props.selectedItem.internal.source, ref: props.selectedItem.internal.source_ref }) }}
            </p>

            <!-- Customer wishes: saved straight away, not with the form. -->
            <div v-if="props.selectedItem" class="space-y-2">
                <SuperadminFormLabel :label="$t('superadmin.roadmap.internal.requests', { count: state.requests.length })" />
                <ul v-if="state.requests.length" class="flex flex-wrap gap-2">
                    <li v-for="wish in state.requests" :key="wish.uuid"
                        class="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700"
                        :title="wish.note || ''">
                        <Icon v-if="wish.channel === 'in_app'" name="ph:hand-pointing" class="h-3.5 w-3.5 text-tertiary" />
                        <Icon v-else-if="wish.company" name="ph:buildings" class="h-3.5 w-3.5 text-gray-400" />
                        {{ wish.company?.name || wish.customer_name }}
                        <button type="button" class="text-gray-400 hover:text-red-600" @click="removeRequest(wish)"
                            :aria-label="$t('superadmin.roadmap.internal.removeRequest')">
                            <Icon name="ph:x" class="h-3 w-3" />
                        </button>
                    </li>
                </ul>
                <div class="flex gap-2">
                    <input v-model="state.newCustomer" type="text" maxlength="255" :class="inputClass"
                        :placeholder="$t('superadmin.roadmap.internal.addRequestPlaceholder')" @keydown.enter.prevent="addRequest" />
                    <FormButton type="button" buttonStyle="secondary" buttonSize="sm" class="flex-none" @click="addRequest"
                        :disabled="!state.newCustomer.trim()">
                        <Icon name="ph:plus" class="h-4 w-4" />
                    </FormButton>
                </div>
                <SuperadminFormError :error="state.requestError" />
            </div>
        </fieldset>

        <label class="flex cursor-pointer items-start gap-2 rounded-md border border-gray-200 bg-gray-50 p-3">
            <input v-model="state.form.is_published" type="checkbox" class="mt-0.5" />
            <span>
                <span class="block text-sm font-medium text-gray-800">{{ $t('superadmin.roadmap.form.published') }}</span>
                <span class="block text-xs text-gray-500">{{ $t('superadmin.roadmap.form.publishedHint') }}</span>
            </span>
        </label>

        <div class="flex justify-end gap-x-2 pb-6">
            <FormButton type="button" buttonStyle="cancel" @click="emit('close')">{{ $t('cancel') }}</FormButton>
            <FormButton type="submit" buttonStyle="primary">{{ $t('save') }}</FormButton>
        </div>
    </form>
</template>

<script setup lang="ts">
import ClassicEditor from '@/utils/editor'
import { useVuelidate } from '@vuelidate/core'
import { required, maxLength, helpers } from '@vuelidate/validators'
import { useI18n } from 'vue-i18n'
import type { PropType } from 'vue'
import { roadmapItemService } from '@/components/api/superadmin/RoadmapItemService'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    selectedItem: {
        type: Object,
        required: false,
        default: null,
    },
    industries: {
        type: Array as PropType<any[]>,
        required: false,
        default: () => [],
    },
})
const emit = defineEmits(['submitForm', 'close', 'requestsChanged'])
const { t, locale } = useI18n()

const statuses = ['planned', 'in_progress', 'released']
const categories = ['feature', 'improvement', 'integration', 'bug']
const priorities = ['top', 'high', 'medium', 'low']
const stages = ['idea', 'ready', 'in_development', 'qa', 'staging', 'live']
const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none'

const editor = ref(ClassicEditor)
const editorConfig = ref({
    toolbar: ['undo', 'redo', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList'],
}) as any

const state = reactive({
    form: emptyForm(),
    requests: [] as any[],
    newCustomer: '',
    requestError: '',
})

function internalFrom(internal: any = null) {
    return {
        category: internal?.category ?? null,
        priority: internal?.priority ?? null,
        is_important: !!internal?.is_important,
        stage: internal?.stage ?? 'idea',
        owner: internal?.owner ?? '',
        ticket: internal?.ticket ?? '',
        internal_eta: internal?.internal_eta ?? '',
        original_text: internal?.original_text ?? '',
        notes: internal?.notes ?? '',
    }
}

function emptyForm() {
    return {
        title: '',
        description: '',
        status: 'planned',
        expected_period: '',
        is_published: false,
        industry_uuids: [] as string[],
        internal: internalFrom(),
    }
}

function syncFromProps(item: any) {
    state.form = item
        ? {
            title: item.title ?? '',
            description: item.description ?? '',
            status: item.status ?? 'planned',
            expected_period: item.expected_period ?? '',
            is_published: !!item.is_published,
            industry_uuids: (item.industries ?? []).map((industry: any) => industry.uuid),
            internal: internalFrom(item.internal),
        }
        : emptyForm()
    state.requests = [...(item?.requests ?? [])]
}

async function addRequest() {
    const name = state.newCustomer.trim()
    if (!name || !props.selectedItem) return
    state.requestError = ''
    try {
        const response = await roadmapItemService.addRoadmapRequest(props.selectedItem.uuid, { customer_name: name })
        state.requests = response?.data?.requests ?? state.requests
        state.newCustomer = ''
        emit('requestsChanged')
    } catch (error: any) {
        state.requestError = error?.message ?? 'Error'
    }
}

async function removeRequest(wish: any) {
    if (!props.selectedItem) return
    state.requestError = ''
    try {
        const response = await roadmapItemService.removeRoadmapRequest(props.selectedItem.uuid, wish.uuid)
        state.requests = response?.data?.requests ?? state.requests.filter((other: any) => other.uuid !== wish.uuid)
        emit('requestsChanged')
    } catch (error: any) {
        state.requestError = error?.message ?? 'Error'
    }
}

onMounted(() => syncFromProps(props.selectedItem))
watch(() => props.selectedItem, (item) => syncFromProps(item))

function industryName(industry: any): string {
    return (locale.value === 'dk' ? industry.dk_name : industry.en_name) || industry.en_name || industry.dk_name
}

const rules = computed(() => ({
    form: {
        title: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            maxLength: maxLength(255),
        },
    },
}))

const v$ = useVuelidate(rules, state)

async function submitForm() {
    if (!(await v$.value.$validate())) return
    emit('submitForm', { ...state.form, internal: { ...state.form.internal } })
}
</script>
