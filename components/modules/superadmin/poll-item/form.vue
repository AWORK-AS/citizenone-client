<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-2xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="space-y-1">
                <FormLabel for="title" :label="$t('superadmin.polls.form.title')" />
                <FormTextField id="title" name="title" :placeholder="$t('superadmin.polls.form.title')"
                    v-model="state.formPoll.title" />
                <FormError :error="v$?.formPoll?.title?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.title?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="description" :label="$t('superadmin.polls.form.description')" />
                <FormTextArea id="description" name="description" :placeholder="$t('superadmin.polls.form.description')"
                    v-model="state.formPoll.description" />
                <FormError :error="v$?.formPoll?.description?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.description?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="sender" :label="$t('superadmin.polls.form.sender')" />
                <FormTextField id="sender" name="sender" :placeholder="$t('superadmin.polls.form.sender')"
                    v-model="state.formPoll.sender" />
                <FormError :error="v$?.formCitizen?.sender?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.sender?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="region" :label="$t('superadmin.polls.form.region')" />
                <FormSelect id="region" :options="state.options.regions" v-model="state.formPoll.region" />
                <FormError :error="v$?.formCitizen?.region?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.region_id?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="w-fit flex items-center cursor-pointer" @click="changeIsActive">
                    <FormCheckbox :value="state.formPoll.is_active" />
                    {{ $t('superadmin.polls.form.active') }}
                </div>
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                    @click="navigateTo(`/superadmin/polls/${pollUuid}`)">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import { regionService } from '@/components/api/superadmin/RegionService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { PollItemForm, Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedPollItem: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const router = useRouter()
const pollUuid = router?.currentRoute?.value?.params?.pollUuid
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formPoll: {
        title: '',
        description: '',
        sender: '',
        region: '',
        is_active: true,
    } as PollItemForm,
    options: {
        regions: []
    }
})

watch(() => props.selectedPollItem, (newValue: any) => {
    if (newValue != null) {
        state.formPoll = {
            title: newValue.title,
            description: newValue.description,
            sender: newValue.sender,
            region: newValue.region,
            is_active: newValue.is_active,
        }
    }
})

onMounted(() => {
    fetchRegions()
})

const rules = computed(() => {
    return {
        formPoll: {
            title: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            sender: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            region: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            description: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

async function fetchRegions() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const response = await regionService.getAllRegions()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.id,
                    label: item.name,
                })
            )
            state.options.regions = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formPoll)
    }
}

function changeIsActive() {
    state.formPoll.is_active = !state.formPoll.is_active
}
</script>