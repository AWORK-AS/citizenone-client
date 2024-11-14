<template>
    <div>
        <Modal size="lg" :title="$t('findsocialetilbuddk.manageCompany.form.profileOnFindSocialeTilbudDk')"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-3">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <p class="text-gray-700">
                            {{ $t('findsocialetilbuddk.manageCompany.form.pleaseFillOutThisForm') }}
                        </p>
                        <form @submit.prevent="submitForm()">
                            <div class="space-y-3">
                                <div class="space-y-1">
                                    <FormLabel for="company_name"
                                        :label="$t('findsocialetilbuddk.manageCompany.form.companyName')" />
                                    <FormTextField id="company_name" name="company_name"
                                        :placeholder="$t('findsocialetilbuddk.manageCompany.form.companyName')"
                                        v-model="state.formManageCompany.company_name" />
                                    <FormError
                                        :error="v$?.formManageCompany?.company_name?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.company_name?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="address"
                                        :label="$t('findsocialetilbuddk.manageCompany.form.address')" />
                                    <FormTextField id="address" name="address"
                                        :placeholder="$t('findsocialetilbuddk.manageCompany.form.address')"
                                        v-model="state.formManageCompany.address" />
                                    <FormError
                                        :error="v$?.formManageCompany?.address?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.address?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="domain"
                                        :label="$t('findsocialetilbuddk.manageCompany.form.domain')" />
                                    <FormTextField id="domain" name="domain"
                                        :placeholder="$t('findsocialetilbuddk.manageCompany.form.domain')"
                                        v-model="state.formManageCompany.domain" />
                                    <FormError
                                        :error="v$?.formManageCompany?.domain?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.domain?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <p class="text-sm text-gray-600">
                                        {{ $t('findsocialetilbuddk.manageCompany.form.contactPerson') }}
                                    </p>
                                    <p class="text-xxs text-gray-600 italic">
                                        {{
                                            $t('findsocialetilbuddk.manageCompany.form.whomWeContactRegardingQuestionsAboutTheDesignEtc')
                                        }}
                                    </p>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div class="space-y-1">
                                            <FormLabel for="firstname"
                                                :label="$t('findsocialetilbuddk.manageCompany.form.firstname')" />
                                            <FormTextField id="firstname" name="firstname"
                                                :placeholder="$t('findsocialetilbuddk.manageCompany.form.firstname')"
                                                v-model="state.formManageCompany.contact_person.firstname" />
                                            <FormError
                                                :error="v$?.formManageCompany?.contact_person?.firstname?.$errors[0]?.$message.toString()" />
                                            <FormError :error="state?.error?.errors?.contact_person_firstname?.[0]" />
                                        </div>
                                        <div class="space-y-1">
                                            <FormLabel for="lastname"
                                                :label="$t('findsocialetilbuddk.manageCompany.form.lastname')" />
                                            <FormTextField id="lastname" name="lastname"
                                                :placeholder="$t('findsocialetilbuddk.manageCompany.form.lastname')"
                                                v-model="state.formManageCompany.contact_person.lastname" />
                                            <FormError
                                                :error="v$?.formManageCompany?.contact_person?.lastname?.$errors[0]?.$message.toString()" />
                                            <FormError :error="state?.error?.errors?.contact_person_lastname?.[0]" />
                                        </div>
                                    </div>
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="phone_number"
                                        :label="$t('findsocialetilbuddk.manageCompany.form.phoneNumber')" />
                                    <FormTextField id="phone_number" name="phone_number"
                                        :placeholder="$t('findsocialetilbuddk.manageCompany.form.phoneNumber')"
                                        v-model="state.formManageCompany.phone_number" />
                                    <FormError
                                        :error="v$?.formManageCompany?.phone_number?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.phone_number?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="offers"
                                        :label="$t('findsocialetilbuddk.manageCompany.form.offers')" />
                                    <FormSelect id="offers" :options="state.options.offers"
                                        v-model="state.formManageCompany.offers" />
                                    <FormError
                                        :error="v$?.formManageCompany?.offers?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.offers?.[0]" />
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div class="space-y-1">
                                        <FormLabel for="number_of_available_spots"
                                            :label="$t('findsocialetilbuddk.manageCompany.form.numberOfAvailableSpots')" />
                                        <FormTextField id="number_of_available_spots" name="number_of_available_spots"
                                            :placeholder="$t('findsocialetilbuddk.manageCompany.form.numberOfAllocatedSpots')"
                                            v-model="state.formManageCompany.number_of_available_spots" />
                                        <FormError
                                            :error="v$?.formManageCompany?.number_of_available_spots?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.number_of_available_spots?.[0]" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel for="number_of_allocated_spots"
                                            :label="$t('findsocialetilbuddk.manageCompany.form.numberOfAllocatedSpots')" />
                                        <FormTextField id="number_of_allocated_spots" name="number_of_allocated_spots"
                                            :placeholder="$t('findsocialetilbuddk.manageCompany.form.numberOfAvailableSpots')"
                                            v-model="state.formManageCompany.number_of_allocated_spots" />
                                        <FormError
                                            :error="v$?.formManageCompany?.number_of_allocated_spots?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.number_of_allocated_spots?.[0]" />
                                    </div>
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="deputy_manager"
                                        :label="$t('findsocialetilbuddk.manageCompany.form.deputyManager')" />
                                    <FormTextField id="deputy_manager" name="deputy_manager"
                                        :placeholder="$t('findsocialetilbuddk.manageCompany.form.deputyManager')"
                                        v-model="state.formManageCompany.deputy_manager" />
                                    <FormError
                                        :error="v$?.formManageCompany?.deputy_manager?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.deputy_manager?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="chairperson"
                                        :label="$t('findsocialetilbuddk.manageCompany.form.chairpersonOfTheBoard')" />
                                    <FormTextField id="chairperson" name="chairperson"
                                        :placeholder="$t('findsocialetilbuddk.manageCompany.form.chairpersonOfTheBoard')"
                                        v-model="state.formManageCompany.chairperson" />
                                    <FormError
                                        :error="v$?.formManageCompany?.chairperson?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.chairperson?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="leader"
                                        :label="$t('findsocialetilbuddk.manageCompany.form.leader')" />
                                    <FormTextField id="leader" name="leader"
                                        :placeholder="$t('findsocialetilbuddk.manageCompany.form.leader')"
                                        v-model="state.formManageCompany.leader" />
                                    <FormError
                                        :error="v$?.formManageCompany?.leader?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.leader?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="prices"
                                        :label="$t('findsocialetilbuddk.manageCompany.form.prices')" />
                                    <FormTextField id="prices" name="prices"
                                        :placeholder="$t('findsocialetilbuddk.manageCompany.form.prices')"
                                        v-model="state.formManageCompany.prices" />
                                    <FormError
                                        :error="v$?.formManageCompany?.prices?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.prices?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="visitation_manager"
                                        :label="$t('findsocialetilbuddk.manageCompany.form.visitationManager')" />
                                    <FormTextField id="visitation_manager" name="visitation_manager"
                                        :placeholder="$t('findsocialetilbuddk.manageCompany.form.visitationManager')"
                                        v-model="state.formManageCompany.visitation_manager" />
                                    <FormError
                                        :error="v$?.formManageCompany?.visitation_manager?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.visitation_manager?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="notice_period"
                                        :label="$t('findsocialetilbuddk.manageCompany.form.noticePeriod')" />
                                    <FormTextField id="notice_period" name="notice_period"
                                        :placeholder="$t('findsocialetilbuddk.manageCompany.form.noticePeriod')"
                                        v-model="state.formManageCompany.notice_period" />
                                    <FormError
                                        :error="v$?.formManageCompany?.notice_period?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.notice_period?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="diagnosis"
                                        :label="$t('findsocialetilbuddk.manageCompany.form.diagnosis')" />
                                    <FormSelect id="diagnosis" :options="state.options.diagnoses"
                                        v-model="state.formManageCompany.diagnosis" />
                                    <FormError
                                        :error="v$?.formManageCompany?.diagnosis?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.diagnosis?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="age" :label="$t('findsocialetilbuddk.manageCompany.form.age')" />
                                    <FormSelect id="age" :options="state.options.age"
                                        v-model="state.formManageCompany.age" />
                                    <FormError :error="v$?.formManageCompany?.age?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.age?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="additional_services"
                                        :label="$t('findsocialetilbuddk.manageCompany.form.additionalServices')" />
                                    <FormSelect id="additional_services" :options="state.options.additional_services"
                                        v-model="state.formManageCompany.additional_services" />
                                    <FormError
                                        :error="v$?.formManageCompany?.additional_services?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.additional_services?.[0]" />
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div class="space-y-1">
                                        <FormLabel for="region"
                                            :label="$t('findsocialetilbuddk.manageCompany.form.region')" />
                                        <FormSelect id="region" :options="state.options.regions"
                                            v-model="state.formManageCompany.region" @change="changeSelectedRegion" />
                                        <FormError
                                            :error="v$?.formManageCompany?.region?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.region_uuid?.[0]" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel for="municipality"
                                            :label="$t('findsocialetilbuddk.manageCompany.form.municipality')" />
                                        <FormSelect id="municipality" :options="state.options.municipalities"
                                            v-model="state.formManageCompany.municipality" />
                                        <FormError
                                            :error="v$?.formCitizen?.municipality?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.municipality_uuid?.[0]" />
                                    </div>
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="link_to_the_offer_portal"
                                        :label="$t('findsocialetilbuddk.manageCompany.form.linkToTheOfferPortal')" />
                                    <FormTextField id="link_to_the_offer_portal" name="link_to_the_offer_portal"
                                        :placeholder="$t('findsocialetilbuddk.manageCompany.form.linkToTheOfferPortal')"
                                        v-model="state.formManageCompany.link_to_the_offer_portal" />
                                    <FormError
                                        :error="v$?.formManageCompany?.link_to_the_offer_portal?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.link_to_the_offer_portal?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="description_of_your_social_service"
                                        :label="$t('findsocialetilbuddk.manageCompany.form.descriptionOfYourSocialService')" />
                                    <FormTextArea id="description_of_your_social_service"
                                        name="description_of_your_social_service"
                                        :placeholder="$t('findsocialetilbuddk.manageCompany.form.descriptionOfYourSocialService')"
                                        v-model="state.formManageCompany.description_of_your_social_service" />
                                    <FormError
                                        :error="v$?.formManageCompany?.description_of_your_social_service?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.description_of_your_social_service?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <p class="text-sm text-gray-600">
                                        {{ $t('findsocialetilbuddk.manageCompany.form.images') }}
                                    </p>
                                    <div>
                                        <input type="file" ref="imagesUpload" @change="handleFileChange" multiple
                                            class="hidden" />
                                        <div class="p-4 border border-dashed border-gray-400 cursor-pointer hover:border-2"
                                            @click="triggerFileInput">
                                            <div class="flex items-center justify-between text-xs">
                                                <p>
                                                    {{ $t('chooseFiles') }}
                                                </p>
                                                <Icon name="ph:upload-simple" class="h-6 w-6 text-gray-600"
                                                    aria-hidden="true" />
                                            </div>
                                        </div>
                                        <div v-if="state.formManageCompany.selected_files.length > 0"
                                            class="mt-3 space-y-1">
                                            <p class="text-sm text-gray-700">{{ $t('selectedFiles') }}:</p>
                                            <ul class="list-disc list-inside text-sm text-gray-600">
                                                <li v-for="(file, index) in state.formManageCompany.selected_files"
                                                    :key="index">
                                                    {{ file?.name }}
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                        @click="closeModal">
                                        {{ $t('cancel') }}
                                    </FormButton>
                                    <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                                        {{ $t('submit') }}
                                    </FormButton>
                                </div>
                            </div>
                        </form>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { regionService } from '@/components/api/RegionService'
import { municipalityService } from '@/components/api/MunicipalityService'
import { findSocialeTilbudDkService } from '@/components/api/FindSocialeTilbudDkService'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const { t } = useI18n()
const { successAlert } = useAlert()
const imagesUpload = ref<HTMLInputElement | null>(null)
const emit = defineEmits(['close'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formManageCompany: {
        company_name: '',
        address: '',
        domain: '',
        contact_person: {
            firstname: '',
            lastname: '',
        },
        phone_number: '',
        offers: '',
        number_of_available_spots: '',
        number_of_allocated_spots: '',
        deputy_manager: '',
        chairperson: '',
        leader: '',
        prices: '',
        visitation_manager: '',
        notice_period: '',
        diagnosis: '',
        age: '',
        additional_services: '',
        municipality: '',
        region: '',
        link_to_the_offer_portal: '',
        description_of_your_social_service: '',
        selected_files: [] as any,
    },
    options: {
        additional_services: [
            { value: 'Youth Support §76', label: `${t('findsocialetilbuddk.manageCompany.form.options.additionalServices.youthSupport76')}` },
            { value: 'Residential Support §85', label: `${t('findsocialetilbuddk.manageCompany.form.options.additionalServices.residentialSupport85')}` },
            { value: 'Family Treatment', label: `${t('findsocialetilbuddk.manageCompany.form.options.additionalServices.familyTreatment')}` },
            { value: 'Emergency Placements', label: `${t('findsocialetilbuddk.manageCompany.form.options.additionalServices.emergencyPlacements')}` },
            { value: 'Personal Support Schemes', label: `${t('findsocialetilbuddk.manageCompany.form.options.additionalServices.personalSupportSchemes')}` },
        ],
        age: [
            { value: 'Age 0 to 5 years', label: `${t('findsocialetilbuddk.manageCompany.form.options.age.age0To5Years')}` },
            { value: 'Age 6 to 12 years', label: `${t('findsocialetilbuddk.manageCompany.form.options.age.age6To12Years')}` },
            { value: 'Age 13 to 17 years', label: `${t('findsocialetilbuddk.manageCompany.form.options.age.age13To17Years')}` },
            { value: 'Age 16 to 23 years', label: `${t('findsocialetilbuddk.manageCompany.form.options.age.age16To23Years')}` },
            { value: 'Age 18 to 23 years', label: `${t('findsocialetilbuddk.manageCompany.form.options.age.age18To23Years')}` },
            { value: 'Age 24 to 30 years', label: `${t('findsocialetilbuddk.manageCompany.form.options.age.age24To30Years')}` },
            { value: 'Age 30 plus years', label: `${t('findsocialetilbuddk.manageCompany.form.options.age.age30PlusYears')}` },
        ],
        diagnoses: [
            { value: 'Behavioral and emotional disorders', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.behavioralAndEmotionalDisorders')}` },
            { value: 'Behavioral changes due to physical and physiological factors', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.behavioralChangesDueToPhysicalAndPhysiologicalFactors')}` },
            { value: 'ADHD', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.adhd')}` },
            { value: 'ADD', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.add')}` },
            { value: 'Personality deviations', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.personalityDeviations')}` },
            { value: 'Alcohol abuse', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.alcoholAbuse')}` },
            { value: 'Anxiety', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.anxiety')}` },
            { value: 'Anorexia', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.anorexia')}` },
            { value: 'Asperger\'s syndrome', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.aspergersSyndrome')}` },
            { value: 'Autism', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.autism')}` },
            { value: 'Bulimia', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.bulimia')}` },
            { value: 'Dementia', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.dementia')}` },
            { value: 'Depression', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.depression')}` },
            { value: 'Deafblindness', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.deafblindness')}` },
            { value: 'Altered perception of reality', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.alteredPerceptionOfReality')}` },
            { value: 'Refugee', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.refugee')}` },
            { value: 'Homelessness', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.homelessness')}` },
            { value: 'Acquired brain injury', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.acquiredBrainInjury')}` },
            { value: 'Congenital brain injury', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.congenitalBrainInjury')}` },
            { value: 'Hearing impairment', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.hearingImpairment')}` },
            { value: 'Inward-directed behavior', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.inwardDirectedBehavior')}` },
            { value: 'Cognitive disorder', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.cognitiveDisorder')}` },
            { value: 'Mania', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.mania')}` },
            { value: 'Nervous or stress-related conditions', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.nervousOrStressRelatedConditions')}` },
            { value: 'Norm-breaking behavior', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.normBreakingBehavior')}` },
            { value: 'OCD (Obsessive-Compulsive Disorder)', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.ocdObsessiveCompulsiveDisorder')}` },
            { value: 'Neglect', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.neglect')}` },
            { value: 'Attention disorder', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.attentionDisorder')}` },
            { value: 'Personality disorder', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.personalityDisorder')}` },
            { value: 'PTSD (Post-Traumatic Stress Disorder)', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.ptsdPostTraumaticStressDisorder')}` },
            { value: 'Self-harming behavior', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.selfHarmingBehavior')}` },
            { value: 'Schizophrenia', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.schizophrenia')}` },
            { value: 'Eating disorder', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.eatingDisorder')}` },
            { value: 'Substance abuse', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.substanceAbuse')}` },
            { value: 'Visual impairment', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.visualImpairment')}` },
            { value: 'Attachment disorder', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.attachmentDisorder')}` },
            { value: 'Outward-directed behavior', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.outwardDirectedBehavior')}` },
            { value: 'Developmental disability', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.developmentalDisability')}` },
        ],
        offers: [
            { value: 'Activity and companionship offer §104', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.activityAndCompanionshipOffer104')}` },
            { value: 'General Housing Act §85 and §105 Social-pedagogical support in residential facilities', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.generalHousingAct85And105SocialPedagogicalSupportInResidentialFacilities')}` },
            { value: 'Child Act §43', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.childAct43')}` },
            { value: 'Treatment school', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.treatmentSchool')}` },
            { value: 'Substance abuse treatment §101', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.substanceAbuseTreatment101')}` },
            { value: 'Protected employment §103', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.protectedEmployment103')}` },
            { value: 'Temporary residential facility §107', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.temporaryResidentialFacility107')}` },
            { value: 'Both §66, subsection 1, no. 5 and §107', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.both66Subsection1No5And107')}` },
            { value: 'Day treatment §52', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.dayTreatment52')}` },
            { value: 'Partially closed residential institution §66, subsection 1, no. 6', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.partiallyClosedResidentialInstitution66Subsection1No6')}` },
            { value: 'Family treatment', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.familyTreatment')}` },
            { value: 'Shelter §110', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.shelter110')}` },
            { value: 'Contact person §52', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.contactPerson52')}` },
            { value: 'Crisis center §109', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.crisisCenter109')}` },
            { value: 'Long-term residential facility §108', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.longTermResidentialFacility108')}` },
            { value: 'Residential facility §66, subsection 1, no. 5', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.residentialFacility66Subsection1No5')}` },
            { value: 'SEL §102', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.sel102')}` },
            { value: 'Schools', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.schools')}` },
            { value: 'Social-pedagogical residential facility §66, subsection 1, no. 6', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.socialPedagogicalResidentialFacility66Subsection1No6')}` },
            { value: 'Social-pedagogical support outside residential facilities §85', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.socialPedagogicalSupportOutsideResidentialFacilities85')}` },
            { value: 'Criminal Enforcement Act - Prison sentence in an institution and similar §78', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.criminalEnforcementActPrisonSentenceInAnInstitutionAndSimilar78')}` },
            { value: 'STU (Specially Adapted Youth Education)', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.stuSpeciallyAdaptedYouthEducation')}` },
            { value: 'Support contact persons for adults §99', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.supportContactPersonsForAdults99')}` },
            { value: 'Health Act - Treatment for alcohol abuse §141', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.healthActTreatmentForAlcoholAbuse141')}` },
            { value: 'Youth education for young people with special needs under LBK no. 783 STU', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.youthEducationForYoungPeopleWithSpecialNeedsUnderLbkNo783Stu')}` },
            { value: 'Youth support §76', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.youthSupport76')}` },
            { value: 'Youth support §114', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.youthSupport114')}` },
            { value: 'Social Services Act §52, subsection 3, no. 5', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.socialServicesAct52Subsection3No5')}` },
        ],
        regions: [],
        municipalities: [],
    }
})

watch(() => props.isModalOpen, () => {
    state.error = {}
    state.formManageCompany = {
        company_name: '',
        address: '',
        domain: '',
        contact_person: {
            firstname: '',
            lastname: '',
        },
        phone_number: '',
        offers: '',
        number_of_available_spots: '',
        number_of_allocated_spots: '',
        deputy_manager: '',
        chairperson: '',
        leader: '',
        prices: '',
        visitation_manager: '',
        notice_period: '',
        diagnosis: '',
        age: '',
        additional_services: '',
        municipality: '',
        region: '',
        link_to_the_offer_portal: '',
        description_of_your_social_service: '',
        selected_files: [] as any,
    }
    state.options.additional_services = [
        { value: 'Youth Support §76', label: `${t('findsocialetilbuddk.manageCompany.form.options.additionalServices.youthSupport76')}` },
        { value: 'Residential Support §85', label: `${t('findsocialetilbuddk.manageCompany.form.options.additionalServices.residentialSupport85')}` },
        { value: 'Family Treatment', label: `${t('findsocialetilbuddk.manageCompany.form.options.additionalServices.familyTreatment')}` },
        { value: 'Emergency Placements', label: `${t('findsocialetilbuddk.manageCompany.form.options.additionalServices.emergencyPlacements')}` },
        { value: 'Personal Support Schemes', label: `${t('findsocialetilbuddk.manageCompany.form.options.additionalServices.personalSupportSchemes')}` },
    ]
    state.options.age = [
        { value: 'Age 0 to 5 years', label: `${t('findsocialetilbuddk.manageCompany.form.options.age.age0To5Years')}` },
        { value: 'Age 6 to 12 years', label: `${t('findsocialetilbuddk.manageCompany.form.options.age.age6To12Years')}` },
        { value: 'Age 13 to 17 years', label: `${t('findsocialetilbuddk.manageCompany.form.options.age.age13To17Years')}` },
        { value: 'Age 16 to 23 years', label: `${t('findsocialetilbuddk.manageCompany.form.options.age.age16To23Years')}` },
        { value: 'Age 18 to 23 years', label: `${t('findsocialetilbuddk.manageCompany.form.options.age.age18To23Years')}` },
        { value: 'Age 24 to 30 years', label: `${t('findsocialetilbuddk.manageCompany.form.options.age.age24To30Years')}` },
        { value: 'Age 30 plus years', label: `${t('findsocialetilbuddk.manageCompany.form.options.age.age30PlusYears')}` },
    ]
    state.options.diagnoses = [
        { value: 'Behavioral and emotional disorders', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.behavioralAndEmotionalDisorders')}` },
        { value: 'Behavioral changes due to physical and physiological factors', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.behavioralChangesDueToPhysicalAndPhysiologicalFactors')}` },
        { value: 'ADHD', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.adhd')}` },
        { value: 'ADD', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.add')}` },
        { value: 'Personality deviations', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.personalityDeviations')}` },
        { value: 'Alcohol abuse', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.alcoholAbuse')}` },
        { value: 'Anxiety', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.anxiety')}` },
        { value: 'Anorexia', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.anorexia')}` },
        { value: 'Asperger\'s syndrome', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.aspergersSyndrome')}` },
        { value: 'Autism', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.autism')}` },
        { value: 'Bulimia', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.bulimia')}` },
        { value: 'Dementia', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.dementia')}` },
        { value: 'Depression', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.depression')}` },
        { value: 'Deafblindness', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.deafblindness')}` },
        { value: 'Altered perception of reality', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.alteredPerceptionOfReality')}` },
        { value: 'Refugee', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.refugee')}` },
        { value: 'Homelessness', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.homelessness')}` },
        { value: 'Acquired brain injury', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.acquiredBrainInjury')}` },
        { value: 'Congenital brain injury', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.congenitalBrainInjury')}` },
        { value: 'Hearing impairment', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.hearingImpairment')}` },
        { value: 'Inward-directed behavior', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.inwardDirectedBehavior')}` },
        { value: 'Cognitive disorder', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.cognitiveDisorder')}` },
        { value: 'Mania', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.mania')}` },
        { value: 'Nervous or stress-related conditions', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.nervousOrStressRelatedConditions')}` },
        { value: 'Norm-breaking behavior', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.normBreakingBehavior')}` },
        { value: 'OCD (Obsessive-Compulsive Disorder)', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.ocdObsessiveCompulsiveDisorder')}` },
        { value: 'Neglect', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.neglect')}` },
        { value: 'Attention disorder', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.attentionDisorder')}` },
        { value: 'Personality disorder', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.personalityDisorder')}` },
        { value: 'PTSD (Post-Traumatic Stress Disorder)', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.ptsdPostTraumaticStressDisorder')}` },
        { value: 'Self-harming behavior', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.selfHarmingBehavior')}` },
        { value: 'Schizophrenia', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.schizophrenia')}` },
        { value: 'Eating disorder', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.eatingDisorder')}` },
        { value: 'Substance abuse', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.substanceAbuse')}` },
        { value: 'Visual impairment', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.visualImpairment')}` },
        { value: 'Attachment disorder', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.attachmentDisorder')}` },
        { value: 'Outward-directed behavior', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.outwardDirectedBehavior')}` },
        { value: 'Developmental disability', label: `${t('findsocialetilbuddk.manageCompany.form.options.diagnoses.developmentalDisability')}` },
    ]
    state.options.offers = [
        { value: 'Activity and companionship offer §104', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.activityAndCompanionshipOffer104')}` },
        { value: 'General Housing Act §85 and §105 Social-pedagogical support in residential facilities', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.generalHousingAct85And105SocialPedagogicalSupportInResidentialFacilities')}` },
        { value: 'Child Act §43', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.childAct43')}` },
        { value: 'Treatment school', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.treatmentSchool')}` },
        { value: 'Substance abuse treatment §101', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.substanceAbuseTreatment101')}` },
        { value: 'Protected employment §103', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.protectedEmployment103')}` },
        { value: 'Temporary residential facility §107', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.temporaryResidentialFacility107')}` },
        { value: 'Both §66, subsection 1, no. 5 and §107', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.both66Subsection1No5And107')}` },
        { value: 'Day treatment §52', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.dayTreatment52')}` },
        { value: 'Partially closed residential institution §66, subsection 1, no. 6', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.partiallyClosedResidentialInstitution66Subsection1No6')}` },
        { value: 'Family treatment', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.familyTreatment')}` },
        { value: 'Shelter §110', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.shelter110')}` },
        { value: 'Contact person §52', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.contactPerson52')}` },
        { value: 'Crisis center §109', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.crisisCenter109')}` },
        { value: 'Long-term residential facility §108', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.longTermResidentialFacility108')}` },
        { value: 'Residential facility §66, subsection 1, no. 5', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.residentialFacility66Subsection1No5')}` },
        { value: 'SEL §102', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.sel102')}` },
        { value: 'Schools', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.schools')}` },
        { value: 'Social-pedagogical residential facility §66, subsection 1, no. 6', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.socialPedagogicalResidentialFacility66Subsection1No6')}` },
        { value: 'Social-pedagogical support outside residential facilities §85', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.socialPedagogicalSupportOutsideResidentialFacilities85')}` },
        { value: 'Criminal Enforcement Act - Prison sentence in an institution and similar §78', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.criminalEnforcementActPrisonSentenceInAnInstitutionAndSimilar78')}` },
        { value: 'STU (Specially Adapted Youth Education)', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.stuSpeciallyAdaptedYouthEducation')}` },
        { value: 'Support contact persons for adults §99', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.supportContactPersonsForAdults99')}` },
        { value: 'Health Act - Treatment for alcohol abuse §141', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.healthActTreatmentForAlcoholAbuse141')}` },
        { value: 'Youth education for young people with special needs under LBK no. 783 STU', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.youthEducationForYoungPeopleWithSpecialNeedsUnderLbkNo783Stu')}` },
        { value: 'Youth support §76', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.youthSupport76')}` },
        { value: 'Youth support §114', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.youthSupport114')}` },
        { value: 'Social Services Act §52, subsection 3, no. 5', label: `${t('findsocialetilbuddk.manageCompany.form.options.offers.socialServicesAct52Subsection3No5')}` },
    ]
})

const rules = computed(() => {
    return {
        formManageCompany: {
            company_name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            address: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            contact_person: {
                firstname: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                lastname: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
            phone_number: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            offers: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            number_of_allocated_spots: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            number_of_available_spots: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            diagnosis: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            age: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            region: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})
const v$ = useVuelidate(rules, state)

onMounted(() => {
    fetchRegions()
})

async function fetchRegions() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await regionService.getAllRegions()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.regions = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchMunicipalitiesPerRegion(regionUuid: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            region_uuid: regionUuid
        }
        const response = await municipalityService.getAllMunicipalitiesPerRegion(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.municipalities = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function changeSelectedRegion(regionUuid: string) {
    fetchMunicipalitiesPerRegion(regionUuid)
}

function closeModal() {
    emit('close')
}

function triggerFileInput() {
    if (imagesUpload.value) {
        imagesUpload.value.click()
    }
}

function handleFileChange(event: any) {
    state.formManageCompany.selected_files = Array.from(event.target.files)
}

async function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        sendMessage()
    }
}

async function sendMessage() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = new FormData()
        state.formManageCompany.selected_files.forEach((file: any) => {
            params.append('selected_files[]', file)
        })
        params.append('additional_services', state.formManageCompany.additional_services)
        params.append('address', state.formManageCompany.address)
        params.append('age', state.formManageCompany.age)
        params.append('chairperson', state.formManageCompany.chairperson)
        params.append('company_name', state.formManageCompany.company_name)
        params.append('contact_person_firstname', state.formManageCompany.contact_person.firstname)
        params.append('contact_person_lastname', state.formManageCompany.contact_person.lastname)
        params.append('deputy_manager', state.formManageCompany.deputy_manager)
        params.append('description_of_your_social_service', state.formManageCompany.description_of_your_social_service)
        params.append('diagnosis', state.formManageCompany.diagnosis)
        params.append('domain', state.formManageCompany.domain)
        params.append('leader', state.formManageCompany.leader)
        params.append('link_to_the_offer_portal', state.formManageCompany.link_to_the_offer_portal)
        params.append('municipality', state.formManageCompany.municipality)
        params.append('notice_period', state.formManageCompany.notice_period)
        params.append('number_of_allocated_spots', state.formManageCompany.number_of_allocated_spots)
        params.append('number_of_available_spots', state.formManageCompany.number_of_available_spots)
        params.append('offers', state.formManageCompany.offers)
        params.append('phone_number', state.formManageCompany.phone_number)
        params.append('prices', state.formManageCompany.prices)
        params.append('region', state.formManageCompany.region)
        params.append('visitation_manager', state.formManageCompany.visitation_manager)

        const response = await findSocialeTilbudDkService.sendManageCompany(params)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('findsocialetilbuddk.manageCompany.form.alert.messageSuccessfullySent')}.`)
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>