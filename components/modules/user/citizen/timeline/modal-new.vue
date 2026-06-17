<template>
    <div>
        <Modal size="md" :title="$t('citizens.timeline.addTimelineEvent')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm()">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />

                        <div class="space-y-3">
                            <div class="space-y-1">
                                <FormLabel for="title" :label="$t('citizens.timeline.event')" />
                                <FormTextField id="title" name="title"
                                    :placeholder="$t('citizens.timeline.eventPlaceholder')"
                                    v-model="state.form.title" />
                                <FormError :error="state?.error?.errors?.title?.[0]" />
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="event_date" :label="$t('citizens.timeline.date')" />
                                <FormDateField id="event_date" name="event_date" v-model="state.form.event_date" />
                                <FormError :error="state?.error?.errors?.event_date?.[0]" />
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="event_type" :label="$t('citizens.timeline.eventType')" />
                                <FormSelect id="event_type" :options="eventTypeOptions"
                                    v-model="state.form.event_type_uuid" />
                                <div class="flex items-center gap-2 pt-1">
                                    <FormTextField id="new_type" name="new_type"
                                        :placeholder="$t('citizens.timeline.newEventTypePlaceholder')"
                                        v-model="state.newTypeName" />
                                    <FormButton type="button" buttonStyle="action" @click="createType"
                                        :disabled="!state.newTypeName">
                                        <Icon name="ph:plus" class="size-4" />
                                        {{ $t('citizens.timeline.addType') }}
                                    </FormButton>
                                </div>
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="description" :label="$t('citizens.timeline.description')" />
                                <FormTextArea id="description" name="description"
                                    :placeholder="$t('citizens.timeline.descriptionPlaceholder')"
                                    v-model="state.form.description" />
                            </div>
                        </div>

                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary">
                                    {{ $t('save') }}
                                </FormButton>
                            </div>
                        </div>
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { timelineService } from '@/components/api/user/TimelineService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()

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

const emit = defineEmits(['close', 'refresh'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    eventTypes: [] as any[],
    newTypeName: '',
    form: {
        title: '',
        event_date: '',
        description: '',
        event_type_uuid: '',
    },
})

const eventTypeOptions = computed(() =>
    state.eventTypes.map((type: any) => ({ value: type.uuid, label: type.name }))
)

watch(() => props.isModalOpen, (isOpen) => {
    if (isOpen) {
        state.error = {}
        state.newTypeName = ''
        state.form = { title: '', event_date: '', description: '', event_type_uuid: '' }
        fetchEventTypes()
    }
})

async function fetchEventTypes() {
    try {
        const response = await timelineService.getEventTypes()
        state.eventTypes = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
}

async function createType() {
    if (!state.newTypeName) return
    try {
        const response = await timelineService.createEventType({ name: state.newTypeName })
        state.newTypeName = ''
        await fetchEventTypes()
        if (response?.data?.uuid) {
            state.form.event_type_uuid = response.data.uuid
        }
    } catch (error: any) {
        state.error = error
    }
}

function closeModal() {
    emit('close')
}

async function submitForm() {
    state.error = {}
    state.isPageLoading = true
    try {
        await timelineService.addEvent(props.citizenUuid, state.form)
        successAlert(`${t('alert.success')}!`, `${t('citizens.timeline.alert.successfullyAdded')}.`)
        emit('refresh')
        emit('close')
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
