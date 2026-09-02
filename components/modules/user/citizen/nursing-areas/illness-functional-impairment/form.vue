<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <form @submit.prevent="submitForm()">
            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <div class="space-y-3">
                <div class="space-y-1">
                    <FormLabel for="date"
                        :label="$t('citizens.nursingAreas.illnessAndFunctionalImpairment.form.date')" />
                    <FormDateField id="date" name="birthday"
                        :placeholder="$t('citizens.nursingAreas.illnessAndFunctionalImpairment.form.date')"
                        v-model="state.formIllnessFunctionalImpairment.date" />
                    <FormError :error="v$?.formIllnessFunctionalImpairment?.date?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.date?.[0]" />
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-gray-600">
                        {{
                            $t('citizens.nursingAreas.illnessAndFunctionalImpairment.form.illnessAndFunctionalImpairment1')
                        }}
                    </p>
                    <ckeditor :editor="editor"
                        v-model="state.formIllnessFunctionalImpairment.illness_functional_impairment"
                        :config="editorDescriptionConfig">
                    </ckeditor>
                    <FormError
                        :error="v$?.formIllnessFunctionalImpairment?.illness_functional_impairment?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.illness_functional_impairment?.[0]" />
                </div>
                <div class="space-y-1">
                    <div class="w-fit flex items-center"
                        :class="contactPersonModeUnavailable ? 'opacity-50 pointer-events-none' : 'cursor-pointer'"
                        :aria-disabled="contactPersonModeUnavailable"
                        @click="toggleContactPersonMode()">
                        <FormCheckbox id="choose_from_our_contact_person"
                            :value="state.formIllnessFunctionalImpairment.choose_from_our_contact_person" />
                        {{
                            $t('citizens.nursingAreas.illnessAndFunctionalImpairment.form.chooseFromOurContactPerson')
                        }}
                    </div>
                    <p class="text-sm text-gray-600" v-if="contactPersonModeUnavailable">
                        {{ $t('citizens.nursingAreas.illnessAndFunctionalImpairment.form.noContactPersonsRegistered') }}
                    </p>
                </div>
                <div class="space-y-1" v-if="state.formIllnessFunctionalImpairment.choose_from_our_contact_person">
                    <FormLabel for="our_contact_person_uuid"
                        :label="$t('citizens.nursingAreas.illnessAndFunctionalImpairment.form.whoIsTheResponsibleHealthcareProvider')" />
                    <FormSelect id="our_contact_person_uuid" :options="state.options.ourContactPersons"
                        :placeholder="$t('citizens.nursingAreas.illnessAndFunctionalImpairment.form.selectContactPerson')"
                        v-model="state.formIllnessFunctionalImpairment.our_contact_person_uuid" />
                    <FormError
                        :error="v$?.formIllnessFunctionalImpairment?.our_contact_person_uuid?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.our_contact_person_uuid?.[0]" />
                </div>
                <div class="space-y-1" v-else>
                    <FormLabel for="healthcare_provider"
                        :label="$t('citizens.nursingAreas.illnessAndFunctionalImpairment.form.whoIsTheResponsibleHealthcareProvider')" />
                    <FormTextField id="healthcare_provider" name="responsible_heathcare_provider"
                        :placeholder="$t('citizens.nursingAreas.illnessAndFunctionalImpairment.form.whoIsTheResponsibleHealthcareProvider')"
                        v-model="state.formIllnessFunctionalImpairment.healthcare_provider" />
                    <FormError
                        :error="v$?.formIllnessFunctionalImpairment?.healthcare_provider?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.healthcare_provider?.[0]" />
                </div>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" @click="emit('closeModal')">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary" class="w-full">
                        {{ props.formType === 'create' ? $t('save') :
                            $t('update') }}
                    </FormButton>
                </div>
            </div>
        </form>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { citizenContactService } from '@/components/api/user/CitizenContactService'
import { illnessHealthcareProvider } from '@/composables/illnessHealthcareProvider'
import ClassicEditor from '@/utils/editor'
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
    selectedIllnessFunctionalImpairment: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])
const { t } = useI18n()
const editor = ref(ClassicEditor)
const editorDescriptionConfig = ref({
    // Add your custom configuration here
    toolbar: ['undo', 'redo', 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote'],
    heading: {
        options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
            { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
            { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
            { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' },
        ]
    },
    height: 500  // Set the editor height here
}) as any
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any
const { contactPersonModeFor, contactPersonOptions } = illnessHealthcareProvider()

const state = reactive({
    error: {} as Error,
    formIllnessFunctionalImpairment: {
        id: '',
        uuid: '',
        date: '',
        illness_functional_impairment: '',
        choose_from_our_contact_person: false,
        healthcare_provider: '',
        our_contact_person_uuid: '',
    },
    isPageLoading: false,
    options: {
        ourContactPersons: [],
    },
    // false until fetchOurContactPersons() settles, so the empty-state
    // message/disable can't flash on for the split second before the
    // request has even gone out.
    hasFetchedOurContactPersons: false,
})

const contactPersonModeUnavailable = computed(() =>
    state.hasFetchedOurContactPersons && state.options.ourContactPersons.length === 0
)

function toggleContactPersonMode() {
    if (contactPersonModeUnavailable.value) return
    state.formIllnessFunctionalImpairment.choose_from_our_contact_person =
        !state.formIllnessFunctionalImpairment.choose_from_our_contact_person
}

onMounted(() => {
    fetchOurContactPersons()
    state.formIllnessFunctionalImpairment = {
        id: props.selectedIllnessFunctionalImpairment.id,
        uuid: props.selectedIllnessFunctionalImpairment.uuid,
        date: props.selectedIllnessFunctionalImpairment.date,
        illness_functional_impairment: props.selectedIllnessFunctionalImpairment.illness_functional_impairment,
        choose_from_our_contact_person: contactPersonModeFor(
            props.selectedIllnessFunctionalImpairment,
            state.options.ourContactPersons.length > 0
        ),
        healthcare_provider: props.selectedIllnessFunctionalImpairment.healthcare_provider,
        our_contact_person_uuid: props.selectedIllnessFunctionalImpairment?.healthcare?.uuid ?? '',
    }
})

watch(() => props.selectedIllnessFunctionalImpairment, (newValue: any) => {
    if (newValue != null) {
        state.formIllnessFunctionalImpairment = {
            id: newValue.id,
            uuid: newValue.uuid,
            date: newValue.date,
            illness_functional_impairment: newValue.illness_functional_impairment,
            choose_from_our_contact_person: contactPersonModeFor(
                newValue,
                state.options.ourContactPersons.length > 0
            ),
            healthcare_provider: newValue.healthcare_provider,
            our_contact_person_uuid: newValue?.healthcare?.uuid ?? '',
        }
    }
})

const rules = computed(() => {
    if (state.formIllnessFunctionalImpairment.choose_from_our_contact_person) {
        return {
            formIllnessFunctionalImpairment: {
                date: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
                illness_functional_impairment: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
                our_contact_person_uuid: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    } else {
        return {
            formIllnessFunctionalImpairment: {
                date: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
                illness_functional_impairment: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
                healthcare_provider: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    }
})

async function fetchOurContactPersons() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
        }
        const response = await citizenContactService.getAllCitizenContactPersons(params)
        if (response.data) {
            state.options.ourContactPersons = contactPersonOptions(response.data)
        }
    } catch (error: any) {
        state.error = error
    }
    state.hasFetchedOurContactPersons = true
    // Re-derive with the real option count now that it's known -- the form
    // is dimmed and non-interactive (LoadingSpinner's pointer-events-none)
    // for the whole fetch, so there is no user toggle here to clobber. This
    // is what both forces an unsatisfiable contact-person mode off (empty
    // list) and turns it on for a record whose linked contact only became
    // known once the list came back (the synchronous derivation in
    // onMounted/watch always runs before this fetch can have resolved).
    state.formIllnessFunctionalImpairment.choose_from_our_contact_person = contactPersonModeFor(
        props.selectedIllnessFunctionalImpairment,
        state.options.ourContactPersons.length > 0
    )
    state.isPageLoading = false
}

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formIllnessFunctionalImpairment)
    }
}
</script>