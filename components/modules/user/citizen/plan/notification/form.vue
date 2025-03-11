<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <form @submit.prevent="submitForm()">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />
            <div class="space-y-3">
                <div class="space-y-1">
                    <FormLabel for="date_time" :label="$t('plansandgoals.notifications.form.dateTime')" />
                    <FormDateTimeField id="date_time" name="date_time"
                        :placeholder="$t('plansandgoals.notifications.form.dateTime')"
                        v-model="state.formNotification.date_time" />
                    <FormError :error="v$?.formSchedule?.date_time?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.date_time?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="user" :label="$t('plansandgoals.notifications.form.users')" />
                    <FormSelectMultiple id="user" :options="state.options.users"
                        v-model="state.formNotification.user" />
                    <FormError :error="v$?.formNotification?.user_uuid?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.user?.[0]" />
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-gray-600">
                        {{ $t('plansandgoals.notifications.form.note') }}
                    </p>
                    <ckeditor :editor="editor" v-model="state.formNotification.note" :config="editorStatusConfig">
                    </ckeditor>
                    <FormError :error="v$?.formNotification?.note?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.note?.[0]" />
                </div>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="emit('closeModal')">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                        {{ props.formType === 'create' ? $t('save') :
                            $t('update') }}
                    </FormButton>
                </div>
            </div>
        </form>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { userService } from '@/components/api/user/UserService'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedNotification: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])
const { t } = useI18n()
const editor = ref(ClassicEditor)
const editorStatusConfig = ref({
    // Add your custom configuration here
    toolbar: ['undo', 'redo', 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote'],
    heading: {
        options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
        ]
    },
    height: 500  // Set the editor height here
}) as any

const state = reactive({
    error: {} as Error,
    formNotification: {
        date_time: '',
        user: [],
        note: '',
    } as any,
    isPageLoading: false,
    options: {
        users: []
    },
})

onMounted(() => {
    state.formNotification = {
        date_time: props.selectedNotification?.date_time,
        user: [],
        note: props.selectedNotification?.note,
    }
    fetchAllUsers()
    props?.selectedNotification?.notification_users?.forEach((notificationUser: any) => {
        state.formNotification.user.push(notificationUser?.user?.uuid)
    })
})

async function fetchAllUsers() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await userService.getAllUsers()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (user: any) => options.push({
                    value: user?.uuid,
                    label: user?.firstname + " " + user?.lastname,
                })
            )
            state.options.users = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

const rules = computed(() => {
    return {
        formNotification: {
            date_time: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            user: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            note: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formNotification)
    }
}
</script>