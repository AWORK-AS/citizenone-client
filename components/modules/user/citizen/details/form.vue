<template>
    <form @submit.prevent="submitForm()" class="mt-6">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <FormSection :title="$t('citizens.sections.citizenDetails')"
            :description="$t('citizens.sections.citizenDetailsHelp')">
                <div class="space-y-1">
                    <div class="flex flex-col items-center">
                        <input type="file" ref="citizenImage" @change="onCitizenImageChange" class="hidden" />
                        <div class="relative cursor-pointer" @click="triggerCitizenImageInput">
                            <img :src="avatarUrl" alt="Avatar"
                                class="w-28 h-28 rounded-full object-cover border-2 border-tertiary-25" />
                            <div
                                class="rounded-full absolute inset-0 bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity">
                                <div class="flex items-center w-full h-full justify-center text-xs">
                                    {{ $t('changeImage') }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <FormError :error="props?.error?.errors?.image?.[0]" class="text-center" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="firstname" :label="$t('citizens.form.firstname')" />
                        <FormTextField id="firstname" name="firstname" v-model="state.formCitizen.firstname" />
                        <FormError :error="v$?.formCitizen?.firstname?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.firstname?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="lastname" :label="$t('citizens.form.lastname')" />
                        <FormTextField id="lastname" name="lastname" v-model="state.formCitizen.lastname" />
                        <FormError :error="v$?.formCitizen?.lastname?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.lastname?.[0]" />
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="social_security_number" :label="$t('citizens.form.ssn')" />
                        <FormTextField id="social_security_number" name="social_security_number"
                            :placeholder="$t('citizens.form.ssnPlaceholder')" :maxLength="10"
                            v-model="formattedSocialSecurityNumber" @input="updateSocialSecurityNumber" />
                        <FormError :error="v$?.formCitizen?.social_security_number?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.social_security_number?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="case_number" :label="$t('citizens.form.caseNumber')" />
                        <FormTextField id="case_number" name="case_number"
                            v-model="state.formCitizen.case_number" />
                        <p class="text-xs text-gray-500">{{ $t('citizens.form.caseNumberHint') }}</p>
                        <FormError :error="props?.error?.errors?.case_number?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="birthday" :label="$t('citizens.form.birthday')" />
                        <FormDateField id="birthday" name="birthday" v-model="state.formCitizen.birthday" showAge />
                        <p v-if="state.autoFilledFromSsn" class="flex items-center gap-x-1 text-xs text-tertiary">
                            <Icon name="ph:magic-wand" class="h-3.5 w-3.5" aria-hidden="true" />
                            {{ $t('citizens.form.autoFilledFromSsn') }}
                        </p>
                        <FormError :error="v$?.formCitizen?.birthday?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.birthday?.[0]" />
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="gender" :label="$t('citizens.form.gender')" />
                        <FormSelect id="gender" :options="state.options.genders"
                            :placeholder="$t('citizens.form.selectGender')" v-model="state.formCitizen.gender" />
                        <FormError :error="v$?.formCitizen?.gender?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.gender?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="email" :label="$t('citizens.form.emailAddress')" />
                        <FormTextField id="email" name="email" placeholder="navn@eksempel.dk"
                            v-model="state.formCitizen.email" />
                        <FormError :error="v$?.formCitizen?.email?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.email?.[0]" />
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="phone" :label="$t('citizens.form.phone')" />
                        <FormTextField id="phone" name="phone" v-model="state.formCitizen.phone" />
                        <FormError :error="v$?.formCitizen?.phone?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.phone?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <div class="flex justify-between items-center py-0.5">
                            <FormLabel for="departments"
                                :label="customPagesStore.getCustomPagesName?.department ?? $t('citizens.form.department')" />
                            <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                                @click="state.modal.isAddDepartmentOpen = true">
                                {{ $t('departments.addNewDepartment') }}
                            </span>
                        </div>
                        <FormSelectMultiple id="departments" :options="state.options.departments"
                            v-model="state.formCitizen.departments" />
                        <FormError :error="v$?.formCitizen?.departments?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.departments_uuid?.[0]" />
                    </div>
                </div>
                <div class="space-y-1"
                    v-if="userStore.getUser?.company?.industry?.system_name === 'social_welfare' && ['Crisis center', 'Shelter'].includes(userStore.getUser?.company?.facility_type?.en_name)">
                    <div class="flex justify-between items-center py-0.5">
                        <FormLabel for="rooms" :label="$t('citizens.form.room')" />
                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                            @click="state.modal.isAddRoomOpen = true">
                            {{ $t('rooms.addNewRoom') }}
                        </span>
                    </div>
                    <FormSelectMultiple id="rooms" :options="state.options.rooms" v-model="state.formCitizen.rooms" />
                    <FormError :error="v$?.formCitizen?.rooms?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.room_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <div class="flex justify-between items-center py-0.5">
                        <FormLabel for="street" :label="$t('citizens.form.street')" />
                        <div class="flex gap-x-1 items-center" @click="state.modal.isLocateCitizenOpen = true">
                            <Icon name="ph:map-pin" class="text-tertiary w-4 h-4" />
                            <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800">
                                {{ $t('citizens.form.locateCitizen') }}
                            </span>
                        </div>
                    </div>
                    <FormTextField id="street" name="street" :placeholder="$t('citizens.form.street')"
                        v-model="state.formCitizen.street" />
                    <FormError :error="v$?.formCitizen?.street?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.street?.[0]" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="region" :label="$t('citizens.form.region')" />
                        <FormSelect id="region" :options="state.options.regions" v-model="state.formCitizen.region"
                            @change="changeSelectedRegion" />
                        <FormError :error="v$?.formCitizen?.region?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.region_uuid?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="municipality" :label="$t('citizens.form.municipality')" />
                        <FormSelect id="municipality" :options="state.options.municipalitiesPerRegion"
                            v-model="state.formCitizen.municipality" @change="changeSelectedMunicipality" />
                        <FormError :error="v$?.formCitizen?.municipality?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.municipality_uuid?.[0]" />
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="city" :label="$t('citizens.form.city')" />
                        <FormTextField id="city" name="city" :placeholder="$t('citizens.form.city')"
                            v-model="state.formCitizen.city" />
                        <FormError :error="v$?.formCitizen?.city?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.city?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="post_code" :label="$t('citizens.form.postCode')" />
                        <FormTextField id="post_code" name="post_code" :placeholder="$t('citizens.form.postCode')"
                            v-model="state.formCitizen.post_code" />
                        <FormError :error="v$?.formCitizen?.post_code?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.post_code?.[0]" />
                    </div>
                </div>
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.formCitizen.is_foreign_city = !state.formCitizen.is_foreign_city">
                    <FormCheckbox id="foreign_city_checkbox" :value="state.formCitizen.is_foreign_city" />
                    {{ $t('citizens.form.foreignCityOfOrigin') }}
                </div>
                <div v-if="state.formCitizen.is_foreign_city">
                    <div class="space-y-1">
                        <div class="flex justify-between items-center py-0.5">
                            <FormLabel for="foreign_city" :label="$t('citizens.form.citizenOrigin')" />
                            <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                                @click="state.modal.isAddForeignCityOpen = true">
                                {{ $t('foreignCities.addNewForeignCity') }}
                            </span>
                        </div>
                        <FormSelect id="foreign_city" :options="state.options.foreignCities"
                            v-model="state.formCitizen.foreign_city" @change="changeSelectedRegion" />
                        <FormError :error="v$?.formCitizen?.foreign_city?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.foreign_city_uuid?.[0]" />
                    </div>
                </div>
                <div class="space-y-1" v-else>
                    <FormLabel for="origin" :label="$t('citizens.form.citizenOrigin')" />
                    <FormSelect id="origin" :options="state.options.municipalities" v-model="state.formCitizen.origin"
                        @change="changeSelectedMunicipality" />
                    <FormError :error="v$?.formCitizen?.origin?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.origin_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="spoken_languages" :label="$t('citizens.form.spokenLanguages')" />
                    <FormSelectMultiple id="spoken_languages" :options="state.options.spokenLanguages"
                        v-model="state.formCitizen.spoken_languages" />
                    <p class="text-xs text-gray-500">
                        {{ $t('citizens.form.spokenLanguagesDescription') }}
                    </p>
                    <FormError :error="props?.error?.errors?.spoken_languages_uuid?.[0]" />
                </div>
                <div class="space-y-1" v-if="state.formCitizen.spoken_languages?.length > 0">
                    <FormLabel for="primary_spoken_language" :label="$t('citizens.form.motherTongue')" />
                    <FormSelect id="primary_spoken_language" :options="selectedSpokenLanguageOptions"
                        v-model="state.formCitizen.primary_spoken_language" />
                    <FormError :error="props?.error?.errors?.primary_spoken_language_uuid?.[0]" />
                </div>
                <div class="w-fit cursor-pointer"
                    @click="state.formCitizen.requires_interpreter = !state.formCitizen.requires_interpreter">
                    <div class="flex items-center">
                        <FormCheckbox id="requires_interpreter" :value="state.formCitizen.requires_interpreter" />
                        {{ $t('citizens.form.requiresInterpreter') }}
                    </div>
                    <p class="ml-7 text-xs">
                        {{ $t('citizens.form.requiresInterpreterDescription') }}
                    </p>
                </div>
                <div class="space-y-1" v-if="isFieldVisible('diagnoses')">
                    <div class="flex justify-between items-center py-0.5">
                        <FormLabel for="diagnoses" :label="$t('citizens.form.diagnoses')" />
                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                            @click="state.modal.isAddDiagnosisOpen = true">
                            {{ $t('diagnoses.addNewDiagnosis') }}
                        </span>
                    </div>
                    <FormSelectMultiple id="diagnoses" :options="state.options.diagnoses"
                        v-model="state.formCitizen.diagnoses" />
                    <FormError :error="v$?.formCitizen?.diagnoses?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.diagnoses?.[0]" />
                </div>
                <div class="space-y-1" v-if="isFieldVisible('medication_allergies')">
                    <div class="flex justify-between items-center py-0.5">
                        <FormLabel for="medication_allergies" :label="$t('citizens.form.medicationAllergies')" />
                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                            @click="state.modal.isAddMedicationAllergyOpen = true">
                            {{ $t('medicationAllergies.addNewMedicationAllergy') }}
                        </span>
                    </div>
                    <FormSelectMultiple id="medication_allergies" :options="state.options.medicationAllergies"
                        v-model="state.formCitizen.medication_allergies" />
                    <FormError :error="v$?.formCitizen?.medication_allergies?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.medication_allergies?.[0]" />
                </div>
                <div class="space-y-1" v-if="isFieldVisible('addictions')">
                    <div class="flex justify-between items-center py-0.5">
                        <FormLabel for="addictions" :label="customPagesStore.getCustomPagesName?.addictions" />
                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                            @click="state.modal.isAddAddictionOpen = true">
                            {{ $t('addictions.addNew') }}
                            <span class="lowercase">
                                {{ customPagesStore.getCustomPagesName?.addictions }}
                            </span>
                        </span>
                    </div>
                    <FormSelectMultiple id="addictions" :options="state.options.addictions"
                        v-model="state.formCitizen.addictions" />
                    <FormError :error="v$?.formCitizen?.addictions?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.addictions?.[0]" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3" v-if="isFieldVisible('date_admitted')">
                    <div class="space-y-1">
                        <FormLabel for="date_admitted" :label="$t('citizens.form.dateAdmitted')" />
                        <FormDateField id="date_admitted" name="date_admitted"
                            :placeholder="$t('citizens.form.dateAdmitted')" v-model="state.formCitizen.date_admitted" />
                        <FormError :error="v$?.formCitizen?.date_admitted?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.date_admitted?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="date_discharged" :label="$t('citizens.form.dateDischarged')" />
                        <FormDateField id="date_discharged" name="date_discharged"
                            :placeholder="$t('citizens.form.dateDischarged')"
                            v-model="state.formCitizen.date_discharged" />
                        <FormError :error="v$?.formCitizen?.date_discharged?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.date_discharged?.[0]" />
                    </div>
                </div>
                <div class="w-fit cursor-pointer"
                    @click="state.formCitizen.is_discharge_reminded = !state.formCitizen.is_discharge_reminded"
                    v-if="isFieldVisible('date_admitted') && state.formCitizen.date_discharged">
                    <div class="flex items-center">
                        <FormCheckbox id="is_discharge_reminded" :value="state.formCitizen.is_discharge_reminded" />
                        {{ $t('citizens.form.dateDischargedReminder') }}
                    </div>
                    <p class="ml-7 text-xs">
                        {{ $t('citizens.form.dateDischargedReminderDescription') }}
                    </p>
                </div>
                <div class="space-y-1" v-if="isFieldVisible('section')">
                    <div class="flex justify-between items-center py-0.5">
                        <FormLabel for="section" :label="$t('citizens.form.section')" />
                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                            @click="state.modal.isAddSectionOpen = true">
                            {{ $t('sections.addNewSection') }}
                        </span>
                    </div>
                    <FormSelect id="section" :options="state.options.sections" v-model="state.formCitizen.section" />
                    <FormError :error="v$?.formCitizen?.section?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.section?.[0]" />
                    <!-- Customer feedback: no field named after the intervention type
                         (indsatstype) exists separately from the paragraph - the
                         paragraph's own name IS that type, so it's surfaced under
                         both labels rather than duplicating the catalogue. -->
                    <p v-if="selectedSectionLabel" class="text-xs text-gray-500">
                        {{ $t('citizens.form.interventionType') }}: {{ selectedSectionLabel }}
                    </p>
                </div>
                <!-- What the authority expects, and from when. The two together
                     create the recurring reminder the case team receives. -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3" v-if="isFieldVisible('reporting')">
                    <div class="space-y-1">
                        <FormLabel for="reporting_frequency" :label="$t('citizens.form.reportingFrequency')" />
                        <FormSelect id="reporting_frequency" :options="reportingFrequencyOptions"
                            :searchable="false" v-model="state.formCitizen.reporting_frequency" />
                        <p class="text-xs text-gray-500">{{ $t('citizens.form.reportingFrequencyHint') }}</p>
                        <FormError :error="props?.error?.errors?.reporting_frequency?.[0]" />
                    </div>
                    <div class="space-y-1" v-if="state.formCitizen.reporting_frequency">
                        <FormLabel for="reporting_starts_on" :label="$t('citizens.form.reportingStartsOn')" />
                        <FormDateField id="reporting_starts_on" name="reporting_starts_on"
                            v-model="state.formCitizen.reporting_starts_on" />
                        <FormError :error="props?.error?.errors?.reporting_starts_on?.[0]" />
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3" v-if="isFieldVisible('pricing')">
                    <div class="space-y-1">
                        <FormLabel for="pricing" :label="$t('citizens.form.pricing')" />
                        <FormTextField id="pricing" name="pricing" :placeholder="$t('citizens.form.pricing')"
                            v-model="state.formCitizen.pricing" />
                        <FormError :error="v$?.formCitizen?.pricing?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.pricing?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="pricing_start_date" :label="$t('citizens.form.pricingStartDate')" />
                        <FormDateField id="pricing_start_date" name="start_date"
                            :placeholder="$t('citizens.form.pricingStartDate')"
                            v-model="state.formCitizen.pricing_start_date" />
                        <FormError :error="v$?.formCitizen?.pricing_start_date?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.pricing_start_date?.[0]" />
                    </div>
                </div>
                <div class="space-y-1" v-if="isFieldVisible('primary_case_worker')">
                    <div class="flex justify-between items-center py-0.5">
                        <FormLabel for="primary_case_worker_uuid" :label="term('caseworker', $t('citizens.form.primaryCaseworker'))" />
                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                            @click="state.modal.isAddCaseworkerOpen = true">
                            {{ $t('citizens.caseWorker.addNewCaseworker', { term: term('caseworker', $t('settings.company.form.termCaseworker')) }) }}
                        </span>
                    </div>
                    <FormSelect id="primary_case_worker_uuid" :options="state.options.caseworkers"
                        v-model="state.formCitizen.primary_case_worker_uuid" />
                    <FormError :error="v$?.formCitizen?.primary_case_worker_uuid?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.primary_case_worker_uuid?.[0]" />
                </div>
                <div class="space-y-1" v-if="isFieldVisible('primary_case_worker')">
                    <FormLabel for="secondary_case_worker_uuid" :label="$t('citizens.form.secondaryCaseworker', { term: term('caseworker', $t('settings.company.form.termCaseworker')) })" />
                    <FormSelect id="secondary_case_worker_uuid" :options="state.options.caseworkers"
                        v-model="state.formCitizen.secondary_case_worker_uuid" />
                    <FormError :error="props?.error?.errors?.secondary_case_worker_uuid?.[0]" />
                </div>
                <div class="space-y-1" v-if="isFieldVisible('paying_municipality')">
                    <FormLabel for="paying_municipality" :label="$t('citizens.form.payingMunicipality')" />
                    <FormSelect id="paying_municipality" :options="state.options.municipalities"
                        v-model="state.formCitizen.paying_municipality" />
                    <FormError :error="v$?.formCitizen?.paying_municipality?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.paying_municipality?.[0]" />
                </div>
                <div class="space-y-1" v-if="isFieldVisible('assessment_municipality')">
                    <FormLabel for="assessment_municipality" :label="$t('citizens.form.assessmentMunicipality')" />
                    <FormSelect id="assessment_municipality" :options="state.options.municipalities"
                        v-model="state.formCitizen.assessment_municipality" />
                    <FormError :error="v$?.formCitizen?.assessment_municipality?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.assessment_municipality?.[0]" />
                </div>
                <div class="space-y-1" v-if="isFieldVisible('responsible_municipality')">
                    <FormLabel for="responsible_municipality" :label="$t('citizens.form.responsibleMunicipality')" />
                    <FormSelect id="responsible_municipality" :options="state.options.municipalities"
                        v-model="state.formCitizen.responsible_municipality" />
                    <FormError :error="v$?.formCitizen?.responsible_municipality?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.responsible_municipality?.[0]" />
                </div>
                <div class="space-y-1" v-if="isFieldVisible('ean_number')">
                    <FormLabel for="ean_number" :label="$t('citizens.form.eanNumber')" />
                    <FormTextField id="ean_number" name="ean_number" :placeholder="$t('citizens.form.eanNumber')"
                        v-model="state.formCitizen.ean_number" />
                    <FormError :error="v$?.formCitizen?.ean_number?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.ean_number?.[0]" />
                </div>
                <div class="space-y-1" v-if="isFieldVisible('transportation')">
                    <FormLabel for="transportation" :label="$t('citizens.form.transportation')" />
                    <FormTextField id="transportation" name="transportation"
                        :placeholder="$t('citizens.form.transportation')" v-model="state.formCitizen.transportation" />
                    <FormError :error="v$?.formCitizen?.transportation?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.transportation?.[0]" />
                </div>
                <div class="space-y-1" v-if="isFieldVisible('hourly_rate')">
                    <FormLabel for="hourly_rate" :label="$t('citizens.form.hourlyRate')" />
                    <FormTextField id="hourly_rate" name="hourly_rate" :placeholder="$t('citizens.form.hourlyRate')"
                        v-model="state.formCitizen.hourly_rate" />
                    <FormError :error="v$?.formCitizen?.hourly_rate?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.hourly_rate?.[0]" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3" v-if="isFieldVisible('allocated_hours')">
                    <div class="space-y-1">
                        <FormLabel for="allocated_daily_hours"
                            :label="$t('citizens.form.allocatedHours.allocatedDailyHours')" />
                        <FormTextField id="allocated_daily_hours" name="allocated_daily_hours"
                            :placeholder="$t('citizens.form.allocatedHours.allocatedDailyHours')"
                            v-model="state.formCitizen.allocated_daily_hours" />
                        <FormError :error="v$?.formCitizen?.allocated_daily_hours?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.allocated_daily_hours?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="allocated_weekly_hours"
                            :label="$t('citizens.form.allocatedHours.allocatedWeeklyHours')" />
                        <FormTextField id="allocated_weekly_hours" name="allocated_weekly_hours"
                            :placeholder="$t('citizens.form.allocatedHours.allocatedWeeklyHours')"
                            v-model="state.formCitizen.allocated_weekly_hours" />
                        <FormError :error="v$?.formCitizen?.allocated_weekly_hours?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.allocated_weekly_hours?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="allocated_monthly_hours"
                            :label="$t('citizens.form.allocatedHours.allocatedMonthlyHours')" />
                        <FormTextField id="allocated_monthly_hours" name="allocated_monthly_hours"
                            :placeholder="$t('citizens.form.allocatedHours.allocatedMonthlyHours')"
                            v-model="state.formCitizen.allocated_monthly_hours" />
                        <FormError :error="v$?.formCitizen?.allocated_monthly_hours?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.allocated_monthly_hours?.[0]" />
                    </div>
                </div>
                <div class="space-y-1" v-if="isFieldVisible('note')">
                    <p class="text-sm text-gray-600">{{ $t('citizens.form.note') }}</p>
                    <ckeditor :editor="editor" v-model="state.formCitizen.note" :config="editorNoteConfig" />
                    <FormError :error="v$?.formCitizen?.note?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.note?.[0]" />
                </div>
                <div class="space-y-1" v-if="isFieldVisible('traffic_lights')">
                    <p class="text-sm text-gray-600">
                        {{ $t('citizens.form.trafficLights.trafficLights') }}
                    </p>
                    <FormLabel for="green" :label="$t('citizens.form.trafficLights.green')" />
                    <FormTextArea id="green" name="green" :placeholder="$t('citizens.form.trafficLights.green')"
                        v-model="state.formCitizen.green" />
                    <FormError :error="v$?.formCitizen?.green?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.green?.[0]" />
                </div>
                <div class="space-y-1" v-if="isFieldVisible('traffic_lights')">
                    <FormLabel for="yellow" :label="$t('citizens.form.trafficLights.yellow')" />
                    <FormTextArea id="yellow" name="green" :placeholder="$t('citizens.form.trafficLights.yellow')"
                        v-model="state.formCitizen.yellow" />
                    <FormError :error="v$?.formCitizen?.yellow?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.yellow?.[0]" />
                </div>
                <div class="space-y-1" v-if="isFieldVisible('traffic_lights')">
                    <FormLabel for="red" :label="$t('citizens.form.trafficLights.red')" />
                    <FormTextArea id="red" name="red" :placeholder="$t('citizens.form.trafficLights.red')"
                        v-model="state.formCitizen.red" />
                    <FormError :error="v$?.formCitizen?.red?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.red?.[0]" />
                </div>
                <!-- Portal access has its own section when the clinic runs the
                     patient portal; here it stays inline for citizen access. -->
                <div v-if="userStore.getUser?.has_citizen_app && !hasPatientPortal && isFieldVisible('system_access')"
                    class="space-y-1 flex items-center gap-x-2">
                    <FormSwitch :value="state.formCitizen.has_system_access"
                        @toggleSwitch="state.formCitizen.has_system_access = !state.formCitizen.has_system_access" />
                    <p>{{ $t('citizens.form.allowSystemAccess') }}</p>
                </div>
                <div v-if="userStore.getUser?.has_citizen_app && !hasPatientPortal && isFieldVisible('system_access')"
                    class="space-y-1 flex items-center gap-x-2">
                    <FormSwitch :value="state.formCitizen.has_chat_access"
                        @toggleSwitch="state.formCitizen.has_chat_access = !state.formCitizen.has_chat_access" />
                    <p>{{ $t('citizens.form.allowChatAccess') }}</p>
                </div>
                <div v-if="userStore.getUser?.has_citizen_app && isFieldVisible('system_access')"
                    class="space-y-1 flex items-center gap-x-2">
                    <FormSwitch :value="state.formCitizen.has_duty_schedule_access"
                        @toggleSwitch="state.formCitizen.has_duty_schedule_access = !state.formCitizen.has_duty_schedule_access" />
                    <p>
                        {{ $t('citizens.form.allowDutyScheduleAccess') }}
                    </p>
                </div>
                <div v-if="userStore.getUser?.has_citizen_app && isFieldVisible('system_access')"
                    class="space-y-1 flex items-center gap-x-2">
                    <FormSwitch :value="state.formCitizen.has_bullet_board_access"
                        @toggleSwitch="state.formCitizen.has_bullet_board_access = !state.formCitizen.has_bullet_board_access" />
                    <p>
                        {{ $t('citizens.form.allowBulletBoardAccess') }}
                    </p>
                </div>
        </FormSection>
        <!-- Own section: a dentist looking for "how do I give this patient
             access" should not have to find a switch halfway down the master
             data form. -->
        <FormSection v-if="hasPatientPortal && isFieldVisible('system_access')"
            :title="$t('patient.staff.sectionTitle')" :description="$t('patient.staff.sectionHelp')">
                <div class="space-y-1 flex items-center gap-x-2">
                    <FormSwitch :value="state.formCitizen.has_system_access"
                        @toggleSwitch="state.formCitizen.has_system_access = !state.formCitizen.has_system_access" />
                    <div>
                        <p>{{ $t('patient.staff.portalAccess') }}</p>
                        <p class="text-xs text-gray-500">{{ $t('patient.staff.portalAccessHelp') }}</p>
                    </div>
                </div>
                <div class="space-y-1 flex items-center gap-x-2">
                    <FormSwitch :value="state.formCitizen.has_chat_access"
                        @toggleSwitch="state.formCitizen.has_chat_access = !state.formCitizen.has_chat_access" />
                    <p>{{ $t('patient.staff.messageAccess') }}</p>
                </div>
                <div class="space-y-1 flex items-center gap-x-2">
                    <FormSwitch :value="state.formCitizen.has_patient_journal_access"
                        @toggleSwitch="state.formCitizen.has_patient_journal_access = !state.formCitizen.has_patient_journal_access" />
                    <div>
                        <p>{{ $t('patient.staff.journalAccess') }}</p>
                        <p class="text-xs text-gray-500">{{ $t('patient.staff.journalAccessHelp') }}</p>
                    </div>
                </div>
        </FormSection>
        <!-- The clinic cannot know the portal exists if nothing ever mentions
             it, so a dental clinic without the app gets a quiet pointer here,
             where they would have looked for the setting. -->
        <FormSection v-if="isDentalClinic && !hasPatientPortal && isFieldVisible('system_access')"
            :title="$t('patient.staff.sectionTitle')" :description="$t('patient.staff.sectionHelp')">
                <div class="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                    <div class="flex items-start gap-3">
                        <Icon name="ph:device-mobile-speaker" class="h-6 w-6 text-primary shrink-0" aria-hidden="true" />
                        <div>
                            <p class="font-semibold text-gray-900">{{ $t('patient.staff.teaserTitle') }}</p>
                            <p class="text-sm text-gray-600 max-w-xl">{{ $t('patient.staff.teaserText') }}</p>
                        </div>
                    </div>
                    <FormButton type="button" buttonStyle="action"
                        @click="navigateTo('/apps?type=other&generic_name=patient-access')">
                        {{ $t('patient.staff.teaserAction') }}
                    </FormButton>
                </div>
        </FormSection>
        <FormSection v-if="userStore.getUser?.company?.industry?.system_name === 'social_welfare' && ['Crisis center', 'Shelter'].includes(userStore.getUser?.company?.facility_type?.en_name) && isFieldVisible('inquiry_data')" :title="$t('citizens.sections.inquiryData')" :description="$t('citizens.sections.inquiryDataHelp')">
                <div class="space-y-1">
                    <FormLabel for="inquiry_date" :label="$t('citizens.form.inquiryData.dateOfInquiry')" />
                    <FormDateField id="inquiry_date" name="inquiry_date"
                        :placeholder="$t('citizens.form.inquiryData.dateOfInquiry')"
                        v-model="state.formCitizen.inquiryData.inquiry_date" />
                    <FormError :error="v$?.formCitizen?.inquiryData.inquiry_date?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.inquiry_date?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="inquirer_name" :label="$t('citizens.form.inquiryData.inquirerName')" />
                    <FormTextField id="inquirer_name" name="inquirer_name"
                        :placeholder="$t('citizens.form.inquiryData.inquirerName')"
                        v-model="state.formCitizen.inquiryData.inquirer_name" />
                    <FormError :error="v$?.formCitizen?.inquiryData.inquirer_name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.inquirer_name?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="outcome" :label="$t('citizens.form.inquiryData.outcome')" />
                    <FormTextField id="outcome" name="outcome" :placeholder="$t('citizens.form.inquiryData.outcome')"
                        v-model="state.formCitizen.inquiryData.outcome" />
                    <FormError :error="v$?.formCitizen?.inquiryData.outcome?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.outcome?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="purpose" :label="$t('citizens.form.inquiryData.purpose')" />
                    <FormTextField id="purpose" name="purpose" :placeholder="$t('citizens.form.inquiryData.purpose')"
                        v-model="state.formCitizen.inquiryData.purpose" />
                    <FormError :error="v$?.formCitizen?.inquiryData.purpose?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.purpose?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="conversation_summary"
                        :label="$t('citizens.form.inquiryData.conversationSummary')" />
                    <FormTextArea id="conversation_summary" name="conversation_summary"
                        :placeholder="$t('citizens.form.inquiryData.conversationSummary')"
                        v-model="state.formCitizen.inquiryData.conversation_summary" />
                    <FormError
                        :error="v$?.formCitizen?.inquiryData.conversation_summary?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.conversation_summary?.[0]" />
                </div>
        </FormSection>
        <FormSection v-if="userStore.getUser?.company?.industry?.system_name === 'social_welfare' && ['Crisis center', 'Shelter'].includes(userStore.getUser?.company?.facility_type?.en_name) && isFieldVisible('stay_data')" :title="$t('citizens.sections.stayData')" :description="$t('citizens.sections.stayDataHelp')">
                <div class="space-y-1">
                    <FormLabel for="journal_number" :label="$t('citizens.form.stayData.journalNumber')" />
                    <FormTextField id="journal_number" name="journal_number"
                        :placeholder="$t('citizens.form.stayData.journalNumber')"
                        v-model="state.formCitizen.stayData.journal_number" />
                    <FormError :error="v$?.formCitizen?.stayData?.journal_number?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.journal_number?.[0]" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="contract_price" :label="$t('citizens.form.stayData.contractPrice')" />
                        <FormTextField id="contract_price" name="contract_price"
                            :placeholder="$t('citizens.form.stayData.contractPrice')"
                            v-model="state.formCitizen.stayData.contract_price" />
                        <FormError :error="props?.error?.errors?.contract_price?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="primary_split_percentage"
                            :label="$t('citizens.form.stayData.primarySplitPercentage')" />
                        <FormNumberField id="primary_split_percentage" name="primary_split_percentage" :min="0" :max="100"
                            placeholder="100" v-model="state.formCitizen.stayData.primary_split_percentage" />
                        <FormError :error="props?.error?.errors?.primary_split_percentage?.[0]" />
                    </div>
                </div>
                <!-- The hours the placement was agreed on. The billing extraction
                     holds delivery up against these; without them it can only
                     compare with the citizen's own allocation. -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="contract_hours" :label="$t('citizens.form.stayData.contractHours')" />
                        <FormNumberField id="contract_hours" name="contract_hours" :min="0"
                            :placeholder="$t('citizens.form.stayData.contractHours')"
                            v-model="state.formCitizen.stayData.contract_hours" />
                        <FormError :error="props?.error?.errors?.contract_hours?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="contract_hours_interval"
                            :label="$t('citizens.form.stayData.contractHoursInterval')" />
                        <FormSelect id="contract_hours_interval" :options="state.options.contractHoursIntervals"
                            :placeholder="$t('citizens.form.stayData.contractHoursInterval')"
                            v-model="state.formCitizen.stayData.contract_hours_interval" />
                        <FormError :error="props?.error?.errors?.contract_hours_interval?.[0]" />
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="accommodation_start_date"
                            :label="$t('citizens.form.stayData.accommodationStartDate')" />
                        <FormDateField id="accommodation_start_date" name="accommodation_start_date"
                            :placeholder="$t('citizens.form.stayData.accommodationStartDate')"
                            v-model="state.formCitizen.stayData.accommodation_start_date" />
                        <FormError
                            :error="v$?.formCitizen?.stayData?.accommodation_start_date?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.start_date?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="accommodation_end_date"
                            :label="$t('citizens.form.stayData.accommodationEndDate')" />
                        <FormDateField id="accommodation_end_date" name="accommodation_end_date"
                            :placeholder="$t('citizens.form.stayData.accommodationEndDate')"
                            v-model="state.formCitizen.stayData.accommodation_end_date" />
                        <FormError
                            :error="v$?.formCitizen?.stayData?.accommodation_end_date?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.end_date?.[0]" />
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="residence_before_uuid"
                            :label="$t('citizens.form.stayData.municipalityOfResidenceBefore')" />
                        <FormSelect id="residence_before_uuid" :options="state.options.municipalities"
                            v-model="state.formCitizen.stayData.residence_before_uuid" />
                        <FormError
                            :error="v$?.formCitizen?.stayData?.residence_before_uuid?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.residence_before_uuid?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="residence_after_uuid"
                            :label="$t('citizens.form.stayData.municipalityOfResidenceAfter')" />
                        <FormSelect id="residence_after_uuid" :options="state.options.municipalities"
                            v-model="state.formCitizen.stayData.residence_after_uuid" />
                        <FormError
                            :error="v$?.formCitizen?.stayData.residence_after_uuid?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.residence_after_uuid?.[0]" />
                    </div>
                </div>
                <div class="space-y-1">
                    <FormLabel for="discharge_reason" :label="$t('citizens.form.stayData.dischargeReason')" />
                    <FormTextField id="discharge_reason" name="discharge_reason"
                        :placeholder="$t('citizens.form.stayData.dischargeReason')"
                        v-model="state.formCitizen.stayData.discharge_reason" />
                    <FormError :error="v$?.formCitizen?.stayData?.discharge_reason?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.discharge_reason?.[0]" />
                </div>
                <div class="space-y-2">
                    <p class="text-sm font-medium text-gray-700">{{ $t('citizens.form.stayData.consentFields') }}</p>
                    <div class="rounded-lg border border-gray-200 divide-y divide-gray-100">
                        <div
                            class="grid grid-cols-[1fr_80px_80px] px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            <span></span>
                            <span class="text-center">{{ $t('yes') }}</span>
                            <span class="text-center">{{ $t('no') }}</span>
                        </div>
                        <div class="grid grid-cols-[1fr_80px_80px] items-center px-4 py-3">
                            <span class="text-sm text-gray-700">{{ $t('citizens.form.stayData.photo') }}</span>
                            <div class="flex justify-center">
                                <input type="radio" name="stayData_photo" value="yes"
                                    class="w-4 h-4 accent-tertiary cursor-pointer"
                                    :checked="state.formCitizen.stayData.photo === true"
                                    @change="state.formCitizen.stayData.photo = true" />
                            </div>
                            <div class="flex justify-center">
                                <input type="radio" name="stayData_photo" value="no"
                                    class="w-4 h-4 accent-tertiary cursor-pointer"
                                    :checked="state.formCitizen.stayData.photo === false"
                                    @change="state.formCitizen.stayData.photo = false" />
                            </div>
                        </div>
                        <div class="grid grid-cols-[1fr_80px_80px] items-center px-4 py-3">
                            <span class="text-sm text-gray-700">{{ $t('citizens.form.stayData.parentCollaboration')
                                }}</span>
                            <div class="flex justify-center">
                                <input type="radio" name="stayData_parent_collaboration" value="yes"
                                    class="w-4 h-4 accent-tertiary cursor-pointer"
                                    :checked="state.formCitizen.stayData.parent_collaboration === true"
                                    @change="state.formCitizen.stayData.parent_collaboration = true" />
                            </div>
                            <div class="flex justify-center">
                                <input type="radio" name="stayData_parent_collaboration" value="no"
                                    class="w-4 h-4 accent-tertiary cursor-pointer"
                                    :checked="state.formCitizen.stayData.parent_collaboration === false"
                                    @change="state.formCitizen.stayData.parent_collaboration = false" />
                            </div>
                        </div>
                        <div class="grid grid-cols-[1fr_80px_80px] items-center px-4 py-3">
                            <span class="text-sm text-gray-700">{{ $t('citizens.form.stayData.studentCollaboration')
                                }}</span>
                            <div class="flex justify-center">
                                <input type="radio" name="stayData_student_collaboration" value="yes"
                                    class="w-4 h-4 accent-tertiary cursor-pointer"
                                    :checked="state.formCitizen.stayData.student_collaboration === true"
                                    @change="state.formCitizen.stayData.student_collaboration = true" />
                            </div>
                            <div class="flex justify-center">
                                <input type="radio" name="stayData_student_collaboration" value="no"
                                    class="w-4 h-4 accent-tertiary cursor-pointer"
                                    :checked="state.formCitizen.stayData.student_collaboration === false"
                                    @change="state.formCitizen.stayData.student_collaboration = false" />
                            </div>
                        </div>
                        <div class="grid grid-cols-[1fr_80px_80px] items-center px-4 py-3">
                            <span class="text-sm text-gray-700">{{ $t('citizens.form.stayData.generalConsent') }}</span>
                            <div class="flex justify-center">
                                <input type="radio" name="stayData_general_consent" value="yes"
                                    class="w-4 h-4 accent-tertiary cursor-pointer"
                                    :checked="state.formCitizen.stayData.general_consent === true"
                                    @change="state.formCitizen.stayData.general_consent = true" />
                            </div>
                            <div class="flex justify-center">
                                <input type="radio" name="stayData_general_consent" value="no"
                                    class="w-4 h-4 accent-tertiary cursor-pointer"
                                    :checked="state.formCitizen.stayData.general_consent === false"
                                    @change="state.formCitizen.stayData.general_consent = false" />
                            </div>
                        </div>
                        <div v-for="(type, typeIndex) in state.options.consentDeclarationTypes" :key="typeIndex"
                            class="grid grid-cols-[1fr_80px_80px] items-center px-4 py-3">
                            <span class="text-sm text-gray-700">
                                {{ type.name }}
                            </span>
                            <div class="flex justify-center">
                                <input type="radio" :name="`consent_declaration_${type.id}`" value="yes"
                                    class="w-4 h-4 accent-tertiary cursor-pointer"
                                    :checked="getConsentDeclarationValue(type.id) === true"
                                    @change="setConsentDeclarationValue(type.id, true)" />
                            </div>
                            <div class="flex justify-center">
                                <input type="radio" :name="`consent_declaration_${type.id}`" value="no"
                                    class="w-4 h-4 accent-tertiary cursor-pointer"
                                    :checked="getConsentDeclarationValue(type.id) === false"
                                    @change="setConsentDeclarationValue(type.id, false)" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="space-y-2">
                    <p class="text-sm font-medium text-gray-700">
                        {{ $t('citizens.form.stayData.guardianship') }}
                    </p>
                    <div class="rounded-lg border border-gray-200 divide-y divide-gray-100">
                        <div
                            class="grid grid-cols-[1fr_80px_80px] px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            <span></span>
                            <span class="text-center">{{ $t('yes') }}</span>
                            <span class="text-center">{{ $t('no') }}</span>
                        </div>
                        <div class="grid grid-cols-[1fr_80px_80px] items-center px-4 py-3">
                            <span class="text-sm text-gray-700">
                                {{ $t('citizens.form.stayData.personalGuardianship') }}
                            </span>
                            <div class="flex justify-center">
                                <input type="radio" name="stayData_personal_guardianship" value="yes"
                                    class="w-4 h-4 accent-tertiary cursor-pointer"
                                    :checked="state.formCitizen.stayData.personal_guardianship === true"
                                    @change="state.formCitizen.stayData.personal_guardianship = true" />
                            </div>
                            <div class="flex justify-center">
                                <input type="radio" name="stayData_personal_guardianship" value="no"
                                    class="w-4 h-4 accent-tertiary cursor-pointer"
                                    :checked="state.formCitizen.stayData.personal_guardianship === false"
                                    @change="state.formCitizen.stayData.personal_guardianship = false" />
                            </div>
                        </div>
                        <div class="grid grid-cols-[1fr_80px_80px] items-center px-4 py-3">
                            <span class="text-sm text-gray-700">
                                {{ $t('citizens.form.stayData.financialGuardianship') }}
                            </span>
                            <div class="flex justify-center">
                                <input type="radio" name="stayData_financial_guardianship" value="yes"
                                    class="w-4 h-4 accent-tertiary cursor-pointer"
                                    :checked="state.formCitizen.stayData.financial_guardianship === true"
                                    @change="state.formCitizen.stayData.financial_guardianship = true" />
                            </div>
                            <div class="flex justify-center">
                                <input type="radio" name="stayData_financial_guardianship" value="no"
                                    class="w-4 h-4 accent-tertiary cursor-pointer"
                                    :checked="state.formCitizen.stayData.financial_guardianship === false"
                                    @change="state.formCitizen.stayData.financial_guardianship = false" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-gray-600">
                        {{ $t('citizens.form.stayData.accompanyingChildren.accompanyingChildren') }}
                    </p>
                    <div v-if="state.formCitizen.stayData.accompanying_children?.length < 1" class="py-3">
                        <FormButton buttonStyle="primary" @click="addAccompanyingChild()" class="w-full">
                            {{ $t('citizens.form.stayData.addAccompanyingChild') }}
                        </FormButton>
                    </div>
                    <div class="space-y-6">
                        <div v-for="(child, accompanyingChildenIndex) in state.formCitizen.stayData.accompanying_children"
                            :key="accompanyingChildenIndex" class="relative">
                            <div
                                class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg space-y-3 px-4 py-6 sm:p-8">
                                <div class="flex items-center gap-x-2">
                                    <div class="grow grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div class="space-y-1">
                                            <FormLabel :for="`firstname_${accompanyingChildenIndex}`"
                                                :label="$t('citizens.form.stayData.accompanyingChildren.firstname')" />
                                            <FormTextField :id="`firstname_${accompanyingChildenIndex}`"
                                                :name="`firstname_${accompanyingChildenIndex}`"
                                                :placeholder="$t('citizens.form.stayData.accompanyingChildren.firstname')"
                                                :value="child.firstname"
                                                @keyup="(event: any) => state.formCitizen.stayData.accompanying_children[accompanyingChildenIndex].firstname = event.target.value" />
                                        </div>
                                        <div class="space-y-1">
                                            <FormLabel :for="`lastname_${accompanyingChildenIndex}`"
                                                :label="$t('citizens.form.stayData.accompanyingChildren.lastname')" />
                                            <FormTextField :id="`lastname_${accompanyingChildenIndex}`"
                                                :name="`lastname_${accompanyingChildenIndex}`"
                                                :placeholder="$t('citizens.form.stayData.accompanyingChildren.lastname')"
                                                :value="child.lastname"
                                                @keyup="(event: any) => state.formCitizen.stayData.accompanying_children[accompanyingChildenIndex].lastname = event.target.value" />
                                        </div>
                                        <div class="space-y-1">
                                            <FormLabel :for="`ssn_${accompanyingChildenIndex}`"
                                                :label="$t('citizens.form.stayData.accompanyingChildren.cprNumber')" />
                                            <FormTextField :id="`ssn_${accompanyingChildenIndex}`"
                                                :name="`name_${accompanyingChildenIndex}`"
                                                :placeholder="$t('citizens.form.stayData.accompanyingChildren.cprNumber')"
                                                :maxLength="10"
                                                :value="child.social_security_number?.length === 10 ? child.social_security_number?.slice(0, 6) + '-' + child.social_security_number?.slice(6) : child.social_security_number"
                                                @keyup="(event: any) => state.formCitizen.stayData.accompanying_children[accompanyingChildenIndex].social_security_number = event.target.value" />
                                        </div>
                                        <div class="space-y-1">
                                            <FormLabel for="gender"
                                                :label="$t('citizens.form.stayData.accompanyingChildren.gender')" />
                                            <FormSelect :id="`gender_${accompanyingChildenIndex}`"
                                                :options="state.options.genders"
                                                v-model="state.formCitizen.stayData.accompanying_children[accompanyingChildenIndex].gender" />
                                        </div>
                                        <div class="space-y-1">
                                            <FormLabel :for="`birthday_${accompanyingChildenIndex}`"
                                                :label="$t('citizens.form.stayData.accompanyingChildren.birthday')" />
                                            <FormDateField :id="`birthday_${accompanyingChildenIndex}`"
                                                :name="`birthday_${accompanyingChildenIndex}`"
                                                :placeholder="$t('citizens.form.stayData.accompanyingChildren.birthday')"
                                                v-model="state.formCitizen.stayData.accompanying_children[accompanyingChildenIndex].birthday" />
                                        </div>
                                        <div class="space-y-1">
                                            <FormLabel :for="`origin_${accompanyingChildenIndex}`"
                                                :label="$t('citizens.form.stayData.accompanyingChildren.origin')" />
                                            <FormTextField :id="`origin_${accompanyingChildenIndex}`"
                                                :name="`origin_${accompanyingChildenIndex}`"
                                                :placeholder="$t('citizens.form.stayData.accompanyingChildren.origin')"
                                                :value="child.origin"
                                                @keyup="(event: any) => state.formCitizen.stayData.accompanying_children[accompanyingChildenIndex].origin = event.target.value" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button type="button"
                                class="absolute -top-3 -right-3 bg-red-700 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center"
                                @click="removeAccompanyingChild(accompanyingChildenIndex)">
                                <Icon name="ph:trash" class="h-4 w-4 text-white" aria-hidden="true" />
                            </button>
                            <button type="button"
                                class="absolute -bottom-4 inset-x-1/2 shadow-md bg-secondary hover:bg-secondary-800 rounded-full w-8 h-8 flex items-center justify-center"
                                @click="addAccompanyingChild()"
                                v-if="accompanyingChildenIndex === state.formCitizen.stayData.accompanying_children.length - 1">
                                <Icon name="ph:plus" class="h-4 w-4 text-white" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>
        </FormSection>
        <FormSection v-if="userStore.getUser?.company?.industry?.system_name === 'employment_services' && isFieldVisible('employment_data')" :title="$t('citizens.sections.employmentProgram')" :description="$t('citizens.sections.employmentProgramHelp')">
                <div class="space-y-1">
                    <FormLabel for="employment_case_type_uuid"
                        :label="$t('citizens.form.employmentProgram.caseType')" />
                    <FormSelect id="employment_case_type_uuid" :options="state.options.employmentCaseTypes"
                        v-model="state.formCitizen.employmentData.employment_case_type_uuid" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="employment_status_type_uuid"
                        :label="$t('citizens.form.employmentProgram.status')" />
                    <FormSelect id="employment_status_type_uuid" :options="state.options.employmentStatusTypes"
                        v-model="state.formCitizen.employmentData.employment_status_type_uuid" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="financial_support_basis"
                        :label="$t('citizens.form.employmentProgram.financialSupportBasis')" />
                    <FormTextField id="financial_support_basis" name="financial_support_basis"
                        :placeholder="$t('citizens.form.employmentProgram.financialSupportBasis')"
                        v-model="state.formCitizen.employmentData.financial_support_basis" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="primary_consultant_uuid"
                        :label="$t('citizens.form.employmentProgram.primaryConsultant')" />
                    <FormSelect id="primary_consultant_uuid" :options="state.options.consultants"
                        v-model="state.formCitizen.employmentData.primary_consultant_uuid" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="secondary_consultant_uuid"
                        :label="$t('citizens.form.employmentProgram.secondaryConsultant')" />
                    <FormSelect id="secondary_consultant_uuid" :options="state.options.consultants"
                        v-model="state.formCitizen.employmentData.secondary_consultant_uuid" />
                </div>
                <div class="space-y-2">
                    <p class="text-sm font-medium text-gray-700">{{ $t('citizens.form.employmentProgram.referrerInfo')
                    }}</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="space-y-1">
                            <FormLabel for="referrer_name"
                                :label="$t('citizens.form.employmentProgram.referrerName')" />
                            <FormTextField id="referrer_name" name="referrer_name"
                                :placeholder="$t('citizens.form.employmentProgram.referrerName')"
                                v-model="state.formCitizen.employmentData.referrer_name" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="referrer_organization"
                                :label="$t('citizens.form.employmentProgram.referrerOrganization')" />
                            <FormTextField id="referrer_organization" name="referrer_organization"
                                :placeholder="$t('citizens.form.employmentProgram.referrerOrganization')"
                                v-model="state.formCitizen.employmentData.referrer_organization" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="referrer_phone"
                                :label="$t('citizens.form.employmentProgram.referrerPhone')" />
                            <FormTextField id="referrer_phone" name="referrer_phone"
                                :placeholder="$t('citizens.form.employmentProgram.referrerPhone')"
                                v-model="state.formCitizen.employmentData.referrer_phone" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="referrer_email"
                                :label="$t('citizens.form.employmentProgram.referrerEmail')" />
                            <FormTextField id="referrer_email" name="referrer_email"
                                :placeholder="$t('citizens.form.employmentProgram.referrerEmail')"
                                v-model="state.formCitizen.employmentData.referrer_email" />
                        </div>
                    </div>
                </div>
                <div class="space-y-1">
                    <FormLabel for="referral_date" :label="$t('citizens.form.employmentProgram.referralDate')" />
                    <FormDateField id="referral_date" name="referral_date"
                        :placeholder="$t('citizens.form.employmentProgram.referralDate')"
                        v-model="state.formCitizen.employmentData.referral_date" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="case_start_date" :label="$t('citizens.form.employmentProgram.caseStartDate')" />
                        <FormDateField id="case_start_date" name="case_start_date"
                            :placeholder="$t('citizens.form.employmentProgram.caseStartDate')"
                            v-model="state.formCitizen.employmentData.case_start_date" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="case_end_date" :label="$t('citizens.form.employmentProgram.caseEndDate')" />
                        <FormDateField id="case_end_date" name="case_end_date"
                            :placeholder="$t('citizens.form.employmentProgram.caseEndDate')"
                            v-model="state.formCitizen.employmentData.case_end_date" />
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="total_weeks" :label="$t('citizens.form.employmentProgram.totalWeeks')" />
                        <FormTextField id="total_weeks" name="total_weeks"
                            :placeholder="$t('citizens.form.employmentProgram.totalWeeks')"
                            v-model="state.formCitizen.employmentData.total_weeks" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="weeks_used" :label="$t('citizens.form.employmentProgram.weeksUsed')" />
                        <FormTextField id="weeks_used" name="weeks_used"
                            :placeholder="$t('citizens.form.employmentProgram.weeksUsed')"
                            v-model="state.formCitizen.employmentData.weeks_used" />
                    </div>
                </div>
                <div class="space-y-1">
                    <FormLabel for="reporting_requirements"
                        :label="$t('citizens.form.employmentProgram.reportingRequirements')" />
                    <FormTextArea id="reporting_requirements" name="reporting_requirements"
                        :placeholder="$t('citizens.form.employmentProgram.reportingRequirements')"
                        v-model="state.formCitizen.employmentData.reporting_requirements" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="activation_deadline"
                        :label="$t('citizens.form.employmentProgram.activationDeadline')" />
                    <FormDateField id="activation_deadline" name="activation_deadline"
                        :placeholder="$t('citizens.form.employmentProgram.activationDeadline')"
                        v-model="state.formCitizen.employmentData.activation_deadline" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="referral_reason" :label="$t('citizens.form.employmentProgram.referralReason')" />
                    <FormTextArea id="referral_reason" name="referral_reason"
                        :placeholder="$t('citizens.form.employmentProgram.referralReason')"
                        v-model="state.formCitizen.employmentData.referral_reason" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="internship_company"
                        :label="$t('citizens.form.employmentProgram.internshipCompany')" />
                    <FormTextField id="internship_company" name="internship_company"
                        :placeholder="$t('citizens.form.employmentProgram.internshipCompany')"
                        v-model="state.formCitizen.employmentData.internship_company" />
                </div>
        </FormSection>
        <FormSection v-if="isDentalClinic && isFieldVisible('dental_profile')" :title="$t('citizens.sections.dentalProfile')" :description="$t('citizens.sections.dentalProfileHelp')">
                <div class="space-y-1">
                    <div class="w-fit flex items-center cursor-pointer"
                        @click="state.formCitizen.dentalData.is_member_of_sygeforsikring_danmark = !state.formCitizen.dentalData.is_member_of_sygeforsikring_danmark">
                        <FormCheckbox id="is_member_of_sygeforsikring_danmark"
                            :value="state.formCitizen.dentalData.is_member_of_sygeforsikring_danmark" />
                        {{ $t('citizens.form.dental.isMemberOfSygeforsikringDanmark') }}
                    </div>
                </div>
                <div class="space-y-1" v-if="state.formCitizen.dentalData.is_member_of_sygeforsikring_danmark">
                    <FormLabel for="danmark_group" :label="$t('citizens.form.dental.danmarkGroup.label')" />
                    <FormSelect id="danmark_group" :options="state.options.danmarkGroups"
                        v-model="state.formCitizen.dentalData.danmark_group" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="sygesikring_group" :label="$t('citizens.form.dental.sygesikringGroup.label')" />
                    <FormSelect id="sygesikring_group" :options="state.options.sygesikringGroups"
                        v-model="state.formCitizen.dentalData.sygesikring_group" />
                </div>
                <div class="space-y-1">
                    <div class="w-fit flex items-center cursor-pointer"
                        @click="state.formCitizen.dentalData.is_foreign_patient = !state.formCitizen.dentalData.is_foreign_patient">
                        <FormCheckbox id="is_foreign_patient"
                            :value="state.formCitizen.dentalData.is_foreign_patient" />
                        {{ $t('citizens.form.dental.isForeignPatient') }}
                    </div>
                    <p class="text-xs text-gray-500">{{ $t('citizens.form.dental.isForeignPatientHelp') }}</p>
                </div>
                <div class="space-y-1">
                    <FormLabel for="patient_number" :label="$t('citizens.form.dental.patientNumber')" />
                    <FormTextField id="patient_number" name="patient_number"
                        :placeholder="$t('citizens.form.dental.patientNumber')"
                        v-model="state.formCitizen.dentalData.patient_number" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="municipal_subsidy" :label="$t('citizens.form.dental.municipalSubsidy')" />
                    <FormTextField id="municipal_subsidy" name="municipal_subsidy"
                        :placeholder="$t('citizens.form.dental.municipalSubsidy')"
                        v-model="state.formCitizen.dentalData.municipal_subsidy" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="last_checkup_date" :label="$t('citizens.form.dental.lastCheckupDate')" />
                        <FormDateField id="last_checkup_date" name="last_checkup_date"
                            :placeholder="$t('citizens.form.dental.lastCheckupDate')"
                            v-model="state.formCitizen.dentalData.last_checkup_date" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="checkup_interval_months"
                            :label="$t('citizens.form.dental.checkupInterval.label')" />
                        <FormSelect id="checkup_interval_months" :options="state.options.checkupIntervals"
                            v-model="state.formCitizen.dentalData.checkup_interval_months" />
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="recall_channel" :label="$t('citizens.form.dental.recallChannel.label')" />
                        <FormSelect id="recall_channel" :options="state.options.recallChannels"
                            v-model="state.formCitizen.dentalData.recall_channel" />
                        <p class="text-xs text-gray-500">{{ $t('citizens.form.dental.recallChannel.help') }}</p>
                    </div>
                    <div class="space-y-1">
                        <div class="w-fit flex items-center cursor-pointer"
                            @click="state.formCitizen.dentalData.auto_reminder = !state.formCitizen.dentalData.auto_reminder">
                            <FormCheckbox id="auto_reminder" :value="state.formCitizen.dentalData.auto_reminder" />
                            {{ $t('citizens.form.dental.autoReminder') }}
                        </div>
                    </div>
                </div>
                <div class="space-y-1">
                    <FormLabel for="risk_profile" :label="$t('citizens.form.dental.riskProfile.label')" />
                    <div class="flex flex-wrap items-center gap-2">
                        <button type="button" v-for="option in state.options.riskProfiles" :key="option.value"
                            @click="toggleRiskProfile(option.value)" :class="[
                                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm',
                                state.formCitizen.dentalData.risk_profile === option.value
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                            ]">
                            <span class="size-3 rounded-full" :style="{ backgroundColor: option.color }" />
                            {{ option.label }}
                        </button>
                    </div>
                </div>
                <div class="space-y-1" v-if="state.formCitizen.dentalData.risk_profile">
                    <FormLabel for="risk_profile_note" :label="$t('citizens.form.dental.riskProfile.note')" />
                    <FormTextArea id="risk_profile_note" name="risk_profile_note" :rows="2"
                        :placeholder="$t('citizens.form.dental.riskProfile.notePlaceholder')"
                        v-model="state.formCitizen.dentalData.risk_profile_note" />
                </div>
        </FormSection>
        <!-- Follows the reader, so saving never means scrolling to the bottom. -->
        <div class="sticky bottom-0 z-20 -mx-4 mt-8 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur
            sm:mx-0 sm:rounded-lg sm:px-6">
            <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                <FormButton type="button" buttonStyle="cancel" class="sm:w-auto sm:px-8"
                    @click="navigateTo('/citizens')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="sm:w-auto sm:px-10">
                    {{ props.formType === 'create' ? $t('save') : $t('update') }}
                </FormButton>
            </div>
        </div>
        <ModulesUserForeignCityModalNew :isModalOpen="state.modal.isAddForeignCityOpen"
            @close="state.modal.isAddForeignCityOpen = false" @refreshForeignCities="fetchForeignCities" />
        <ModulesUserDepartmentModalNew :isModalOpen="state.modal.isAddDepartmentOpen"
            @close="state.modal.isAddDepartmentOpen = false" @refreshDepartments="fetchDepartments" />
        <ModulesUserRoomModalNew :isModalOpen="state.modal.isAddRoomOpen" @close="state.modal.isAddRoomOpen = false"
            @refreshRooms="fetchRooms" />
        <ModulesUserDiagnosisModalNew :isModalOpen="state.modal.isAddDiagnosisOpen"
            @close="state.modal.isAddDiagnosisOpen = false" @refreshDiagnoses="fetchDiagnoses" />
        <ModulesUserMedicationAllergyModalNew :isModalOpen="state.modal.isAddMedicationAllergyOpen"
            @close="state.modal.isAddMedicationAllergyOpen = false"
            @refreshMedicationAllergies="fetchMedicationAllergies" />
        <ModulesUserAddictionModalNew :isModalOpen="state.modal.isAddAddictionOpen"
            @close="state.modal.isAddAddictionOpen = false" @refreshAddictions="fetchAddictions" />
        <ModulesUserSectionModalNew :isModalOpen="state.modal.isAddSectionOpen"
            @close="state.modal.isAddSectionOpen = false" @refreshSections="fetchSections" />
        <ModulesUserCitizenContactModalNewCaseworker :isModalOpen="state.modal.isAddCaseworkerOpen"
            @close="state.modal.isAddCaseworkerOpen = false" @refreshCaseworkers="fetchCitizenCaseWorkers"
            v-if="state.modal.isAddCaseworkerOpen" />
        <ModulesUserCitizenDetailsModalLocateCitizen :isModalOpen="state.modal.isLocateCitizenOpen"
            :initialLocation="state.selectedCitizenLocation" :currentAddress="{
                street: state.formCitizen.street,
                city: state.formCitizen.city,
                postCode: state.formCitizen.post_code,
                municipality: state.options.municipalities.find((municipality: any) => municipality.value === state.formCitizen.municipality)?.label,
                region: state.options.regions.find((region: any) => region.value === state.formCitizen.region)?.label
            }" @close="state.modal.isLocateCitizenOpen = false" @locationSelected="onCitizenLocationSelected" />
    </form>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { citizenCaseworkerService } from '@/components/api/user/CitizenCaseworkerService'
import { departmentService } from '@/components/api/user/DepartmentService'
import { roomService } from '@/components/api/user/RoomService'
import { consentDeclarationTypeService } from '@/components/api/user/ConsentDeclarationTypeService'
import { diagnosisService } from '@/components/api/user/DiagnosisService'
import { medicationAllergyService } from '@/components/api/user/MedicationAllergyService'
import { addictionService } from '@/components/api/user/AddictionService'
import { sectionService } from '@/components/api/user/SectionService'
import { regionService } from '@/components/api/user/RegionService'
import { municipalityService } from '@/components/api/user/MunicipalityService'
import { cityService } from '@/components/api/user/CityService'
import { foreignCityService } from '@/components/api/user/ForeignCityService'
import { spokenLanguageService } from '@/components/api/user/SpokenLanguageService'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useDanishCpr } from '@/composables/cpr'
import { useTerminology } from '@/composables/useTerminology'
import { useSpokenLanguages } from '@/composables/useSpokenLanguages'
import type { Error } from '@/types'
import { zipLookerService } from '~/components/api/ziplooker/ZipLookerService'
import { formFieldConfigService } from '@/components/api/user/FormFieldConfigService'
import { employmentService } from '@/components/api/user/EmploymentService'
import { employeeService } from '@/components/api/user/EmployeeService'
import ClassicEditor from '@/utils/editor'
import { journalService } from '@/components/api/user/JournalService'

const userStore = useUserStore() as any
const { industryHasFeature } = useIndustryFeatures()
const { t } = useI18n()
const { term } = useTerminology()
const { fetchOptions: fetchSpokenLanguageOptions } = useSpokenLanguages()
const { formatPrice } = useNumberFormatter()
const language = useI18n()
const citizenImage = ref<HTMLInputElement | null>(null)
const avatarUrl = ref('/img/avatars/user.svg')
const router = useRouter()
const customPagesStore = useCustomPagesStore() as any
const citizenUuid = router?.currentRoute?.value?.params?.uuid

const editor = ref(ClassicEditor)
const editorNoteConfig = ref({
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
}) as any

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedCitizen: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const formConfig = ref<Record<string, boolean>>({})

function isFieldVisible(fieldKey: string): boolean {
    if (Object.keys(formConfig.value).length === 0) return true
    return formConfig.value[fieldKey] !== false
}

// The frequencies an authority is reported to on. Deliberately not the full
// reminder vocabulary: nobody reports daily or at weekends, and offering it
// would only invite a mistake.
const reportingFrequencyOptions = computed(() => [
    { value: 'weekly', label: t('citizens.form.reportingOptions.weekly') },
    { value: 'biweekly', label: t('citizens.form.reportingOptions.biweekly') },
    { value: 'monthly', label: t('citizens.form.reportingOptions.monthly') },
    { value: 'every_three_months', label: t('citizens.form.reportingOptions.everyThreeMonths') },
    { value: 'every_six_months', label: t('citizens.form.reportingOptions.everySixMonths') },
    { value: 'yearly', label: t('citizens.form.reportingOptions.yearly') },
])

const selectedSectionLabel = computed(() => {
    return state.options.sections.find((option: any) => option.value === state.formCitizen.section)?.label ?? ''
})

const { parse: parseCpr } = useDanishCpr()

const state = reactive({
    // True while the birthday field's current value came from the CPR number and
    // has not been edited by hand since - drives the hint text under the field.
    autoFilledFromSsn: false,
    // Same, tracked separately for gender: birthday and gender are corrected
    // independently, so one being edited by hand must not re-lock the other.
    genderAutoFilledFromSsn: false,
    error: {} as Error,
    formCitizen: {
        image: '',
        firstname: '',
        lastname: '',
        gender: '',
        email: '',
        social_security_number: '',
        case_number: '',
        birthday: '',
        phone: '',
        departments: [],
        rooms: [],
        is_foreign_city: false,
        foreign_city: '',
        street: '',
        region: '',
        municipality: '',
        city: '',
        post_code: '',
        latitude: '',
        longitude: '',
        origin: '',
        spoken_languages: [],
        primary_spoken_language: '',
        requires_interpreter: false,
        diagnoses: [],
        medication_allergies: [],
        addictions: [],
        date_admitted: '',
        date_discharged: '',
        is_discharge_reminded: false,
        section: '',
        pricing: '',
        pricing_start_date: '',
        primary_case_worker_uuid: '',
        secondary_case_worker_uuid: '',
        paying_municipality: '',
        assessment_municipality: '',
        responsible_municipality: '',
        ean_number: '',
        transportation: '',
        hourly_rate: '',
        allocated_daily_hours: '',
        allocated_weekly_hours: '',
        allocated_monthly_hours: '',
        note: '',
        green: '',
        yellow: '',
        red: '',
        has_system_access: false,
        has_chat_access: false,
        has_patient_journal_access: false,
        has_duty_schedule_access: false,
        has_bullet_board_access: false,
        inquiryData: {
            conversation_summary: '',
            reporting_frequency: '',
            reporting_starts_on: '',
            inquiry_date: '',
            inquirer_name: '',
            outcome: '',
            purpose: '',
        },
        stayData: {
            accommodation_end_date: '',
            accommodation_start_date: '',
            journal_number: '',
            contract_price: '',
            contract_hours: '',
            contract_hours_interval: 'weekly',
            primary_split_percentage: '',
            accompanying_children: [{
                name: '',
                social_security_number: '',
                gender: '',
                age: '',
                origin: '',
            }],
            residence_before_uuid: '',
            residence_after_uuid: '',
            discharge_reason: '',
            consent_declarations: [] as { consent_declaration_type_id: number, value: boolean }[],
            photo: false,
            parent_collaboration: false,
            student_collaboration: false,
            general_consent: false,
            personal_guardianship: false,
            financial_guardianship: false,
        } as any,
        employmentData: {
            employment_case_type_uuid: '',
            employment_status_type_uuid: '',
            financial_support_basis: '',
            primary_consultant_uuid: '',
            secondary_consultant_uuid: '',
            referrer_name: '',
            referrer_phone: '',
            referrer_email: '',
            referrer_organization: '',
            referral_date: '',
            case_start_date: '',
            case_end_date: '',
            total_weeks: '',
            weeks_used: '',
            reporting_requirements: '',
            activation_deadline: '',
            referral_reason: '',
        } as any,
        dentalData: {
            is_member_of_sygeforsikring_danmark: false,
            danmark_group: '',
            sygesikring_group: '',
            is_foreign_patient: false,
            risk_profile: '',
            risk_profile_note: '',
            recall_channel: '',
            auto_reminder: true,
            patient_number: '',
            municipal_subsidy: '',
            last_checkup_date: '',
            checkup_interval_months: '',
        } as any,
    },
    formattedSocialSecurityNumber: '',
    modal: {
        isAddAddictionOpen: false,
        isAddCaseworkerOpen: false,
        isAddDepartmentOpen: false,
        isAddDiagnosisOpen: false,
        isAddForeignCityOpen: false,
        isAddSectionOpen: false,
        isAddMedicationAllergyOpen: false,
        isAddRoomOpen: false,
        isLocateCitizenOpen: false,
    },
    options: {
        addictions: [] as any,
        cities: [] as any,
        caseworkers: [] as any,
        departments: [] as any,
        diagnoses: [] as any,
        foreignCities: [] as any,
        genders: [
            { value: 'male', label: `${t('gender.male')}`, },
            { value: 'female', label: `${t('gender.female')}`, },
            { value: 'non_binary', label: `${t('gender.nonbinary')}`, },
            { value: 'will_not_disclose', label: `${t('gender.willNotDisclose')}`, },
        ],
        consentDeclarationTypes: [] as any,
        medicationAllergies: [] as any,
        municipalities: [] as any,
        municipalitiesPerRegion: [] as any,
        regions: [] as any,
        rooms: [] as any,
        sections: [] as any,
        spokenLanguages: [] as any,
        employmentCaseTypes: [] as any,
        employmentStatusTypes: [] as any,
        consultants: [] as any,
        contractHoursIntervals: [
            { value: 'weekly', label: `${t('citizens.form.stayData.contractHoursWeekly')}`, },
            { value: 'monthly', label: `${t('citizens.form.stayData.contractHoursMonthly')}`, },
            { value: 'total', label: `${t('citizens.form.stayData.contractHoursTotal')}`, },
        ],
        sygesikringGroups: [
            { value: 'group_1', label: `${t('citizens.form.dental.sygesikringGroup.group1')}`, },
            { value: 'group_2', label: `${t('citizens.form.dental.sygesikringGroup.group2')}`, },
            { value: 'group_4', label: `${t('citizens.form.dental.sygesikringGroup.group4')}`, },
            { value: 'but', label: `${t('citizens.form.dental.sygesikringGroup.but')}`, },
            { value: 'foreign_insurance', label: `${t('citizens.form.dental.sygesikringGroup.foreignInsurance')}`, },
            { value: 'other', label: `${t('citizens.form.dental.sygesikringGroup.other')}`, },
        ],
        checkupIntervals: [
            { value: 6, label: `${t('citizens.form.dental.checkupInterval.everySixMonths')}`, },
            { value: 12, label: `${t('citizens.form.dental.checkupInterval.everyTwelveMonths')}`, },
        ],
        danmarkGroups: danmarkGroupOptions(),
        recallChannels: recallChannelOptions(),
        riskProfiles: riskProfileOptions(),
    },
    selectedCitizenLocation: null as { lat: number; lng: number } | null,
})

function danmarkGroupOptions() {
    return [
        { value: 'basis', label: `${t('citizens.form.dental.danmarkGroup.basis')}` },
        { value: 'group_1', label: `${t('citizens.form.dental.danmarkGroup.group1')}` },
        { value: 'group_2', label: `${t('citizens.form.dental.danmarkGroup.group2')}` },
        { value: 'group_5', label: `${t('citizens.form.dental.danmarkGroup.group5')}` },
    ]
}

function recallChannelOptions() {
    return [
        { value: 'letter', label: `${t('citizens.form.dental.recallChannel.letter')}` },
        { value: 'sms', label: `${t('citizens.form.dental.recallChannel.sms')}` },
        { value: 'email', label: `${t('citizens.form.dental.recallChannel.email')}` },
        { value: 'app', label: `${t('citizens.form.dental.recallChannel.app')}` },
        { value: 'phone', label: `${t('citizens.form.dental.recallChannel.phone')}` },
    ]
}

// Green, yellow and red is how a clinic marks caries risk, so the colours are
// part of the meaning rather than decoration.
function riskProfileOptions() {
    return [
        { value: 'green', color: '#16a34a', label: `${t('citizens.form.dental.riskProfile.green')}` },
        { value: 'yellow', color: '#eab308', label: `${t('citizens.form.dental.riskProfile.yellow')}` },
        { value: 'red', color: '#dc2626', label: `${t('citizens.form.dental.riskProfile.red')}` },
    ]
}

// Clicking the marked profile again clears it: the profile is optional.
function toggleRiskProfile(value: string) {
    state.formCitizen.dentalData.risk_profile =
        state.formCitizen.dentalData.risk_profile === value ? '' : value

    if (!state.formCitizen.dentalData.risk_profile) {
        state.formCitizen.dentalData.risk_profile_note = ''
    }
}

watch(() => language.locale.value, () => {
    state.options.genders = [
        { value: 'male', label: `${t('gender.male')}`, },
        { value: 'female', label: `${t('gender.female')}`, },
        { value: 'non_binary', label: `${t('gender.nonbinary')}`, },
        { value: 'will_not_disclose', label: `${t('gender.willNotDisclose')}`, },
    ]
    state.options.sygesikringGroups = [
        { value: 'group_1', label: `${t('citizens.form.dental.sygesikringGroup.group1')}`, },
        { value: 'group_2', label: `${t('citizens.form.dental.sygesikringGroup.group2')}`, },
        { value: 'group_4', label: `${t('citizens.form.dental.sygesikringGroup.group4')}`, },
        { value: 'but', label: `${t('citizens.form.dental.sygesikringGroup.but')}`, },
        { value: 'foreign_insurance', label: `${t('citizens.form.dental.sygesikringGroup.foreignInsurance')}`, },
        { value: 'other', label: `${t('citizens.form.dental.sygesikringGroup.other')}`, },
    ]
    state.options.checkupIntervals = [
        { value: 6, label: `${t('citizens.form.dental.checkupInterval.everySixMonths')}`, },
        { value: 12, label: `${t('citizens.form.dental.checkupInterval.everyTwelveMonths')}`, },
    ]
    state.options.danmarkGroups = danmarkGroupOptions()
    state.options.recallChannels = recallChannelOptions()
    state.options.riskProfiles = riskProfileOptions()
    // Language names are Danish or English depending on the locale, so relabel.
    fetchSpokenLanguages()
})

watch(() => props.selectedCitizen, async (selectedCitizen: any) => {
    if (selectedCitizen != null) {
        fetchMunicipalitiesPerRegion(selectedCitizen.region_uuid)

        // Fetch cities and resolve city name if it's a UUID
        let cityName = selectedCitizen.city || selectedCitizen.address?.city || ''
        if (selectedCitizen.municipality_uuid) {
            await fetchCities(selectedCitizen.municipality_uuid)
            // Check if city value is a UUID (contains hyphens and is 36 chars)
            if (cityName && cityName.length === 36 && cityName.includes('-')) {
                const cityOption = state.options.cities.find((c: any) => c.value === cityName)
                if (cityOption) {
                    cityName = cityOption.label
                }
            }
        }

        if (selectedCitizen.image) {
            avatarUrl.value = selectedCitizen.image
        }

        const lat = selectedCitizen.address?.latitude || selectedCitizen.latitude
        const lng = selectedCitizen.address?.longitude || selectedCitizen.longitude

        if (lat && lng) {
            state.selectedCitizenLocation = {
                lat: Number(lat),
                lng: Number(lng)
            }
        } else {
            state.selectedCitizenLocation = null
        }

        state.formCitizen = {
            image: selectedCitizen.image,
            firstname: selectedCitizen.firstname,
            lastname: selectedCitizen.lastname,
            gender: selectedCitizen.gender,
            email: selectedCitizen.email,
            social_security_number: selectedCitizen.social_security_number,
            case_number: selectedCitizen.case_number ?? '',
            birthday: selectedCitizen.birthday,
            phone: selectedCitizen.phone,
            departments: selectedCitizen.departments,
            rooms: selectedCitizen.rooms,
            is_foreign_city: selectedCitizen.foreign_city_uuid ? true : false,
            foreign_city: selectedCitizen.foreign_city_uuid,
            street: selectedCitizen.street || selectedCitizen.address?.street || '',
            region: selectedCitizen.region_uuid,
            municipality: selectedCitizen.municipality_uuid,
            city: cityName,
            post_code: selectedCitizen.post_code || selectedCitizen.address?.post_code || '',
            latitude: lat ? lat.toString() : '',
            longitude: lng ? lng.toString() : '',
            origin: selectedCitizen.origin,
            spoken_languages: selectedCitizen.spoken_languages ?? [],
            primary_spoken_language: selectedCitizen.primary_spoken_language ?? '',
            requires_interpreter: selectedCitizen.requires_interpreter ?? false,
            diagnoses: selectedCitizen.diagnoses,
            medication_allergies: selectedCitizen.medication_allergies,
            addictions: selectedCitizen.addictions,
            date_admitted: selectedCitizen.date_admitted,
            date_discharged: selectedCitizen.date_discharged,
            is_discharge_reminded: selectedCitizen.is_discharge_reminded,
            section: selectedCitizen.section,
            pricing: formatPrice(selectedCitizen.pricing, language.locale.value),
            pricing_start_date: selectedCitizen.pricing_start_date,
            primary_case_worker_uuid: selectedCitizen.primary_case_worker_uuid,
            secondary_case_worker_uuid: selectedCitizen.secondary_case_worker_uuid,
            paying_municipality: selectedCitizen.paying_municipality,
            assessment_municipality: selectedCitizen.assessment_municipality,
            responsible_municipality: selectedCitizen.responsible_municipality,
            ean_number: selectedCitizen.ean_number,
            transportation: selectedCitizen.transportation,
            hourly_rate: selectedCitizen.hourly_rate ? formatPrice(selectedCitizen.hourly_rate, language.locale.value) : '',
            allocated_daily_hours: selectedCitizen.allocated_daily_hours,
            allocated_weekly_hours: selectedCitizen.allocated_weekly_hours,
            allocated_monthly_hours: selectedCitizen.allocated_monthly_hours,
            note: selectedCitizen.note,
            green: selectedCitizen.green,
            yellow: selectedCitizen.yellow,
            red: selectedCitizen.red,
            has_system_access: selectedCitizen.has_system_access,
            has_chat_access: selectedCitizen.has_chat_access,
            has_patient_journal_access: selectedCitizen.has_patient_journal_access ?? false,
            has_duty_schedule_access: selectedCitizen.has_duty_schedule_access,
            has_bullet_board_access: selectedCitizen.has_bullet_board_access,
            inquiryData: {
                conversation_summary: selectedCitizen.inquiryData?.conversation_summary || '',
                reporting_frequency: selectedCitizen.reporting_frequency || '',
                reporting_starts_on: selectedCitizen.reporting_starts_on || '',
                inquiry_date: selectedCitizen.inquiryData?.inquiry_date || '',
                inquirer_name: selectedCitizen.inquiryData?.inquirer_name || '',
                outcome: selectedCitizen.inquiryData?.outcome || '',
                purpose: selectedCitizen.inquiryData?.purpose || '',
            },
            stayData: {
                accommodation_end_date: selectedCitizen.stayData?.accommodation_end_date || '',
                accommodation_start_date: selectedCitizen.stayData?.accommodation_start_date || '',
                journal_number: selectedCitizen.stayData?.journal_number || '',
                contract_price: selectedCitizen.stayData?.contract_price
                    ? formatPrice(selectedCitizen.stayData.contract_price, language.locale.value)
                    : '',
                contract_hours: selectedCitizen.stayData?.contract_hours ?? '',
                contract_hours_interval: selectedCitizen.stayData?.contract_hours_interval || 'weekly',
                primary_split_percentage: selectedCitizen.stayData?.primary_split_percentage || '',
                accompanying_children: selectedCitizen.stayData?.accompanying_children ?? [],
                residence_before_uuid: selectedCitizen.stayData?.residence_before_uuid || '',
                residence_after_uuid: selectedCitizen.stayData?.residence_after_uuid || '',
                discharge_reason: selectedCitizen.stayData?.discharge_reason || '',
                consent_declarations: selectedCitizen.stayData?.consent_declarations ?? [],
                photo: selectedCitizen.stayData?.photo ?? false,
                parent_collaboration: selectedCitizen.stayData?.parent_collaboration ?? false,
                student_collaboration: selectedCitizen.stayData?.student_collaboration ?? false,
                general_consent: selectedCitizen.stayData?.general_consent ?? false,
                personal_guardianship: selectedCitizen.stayData?.personal_guardianship ?? false,
                financial_guardianship: selectedCitizen.stayData?.financial_guardianship ?? false,
            },
            employmentData: {
                employment_case_type_uuid: selectedCitizen.employmentData?.employment_case_type_uuid || '',
                employment_status_type_uuid: selectedCitizen.employmentData?.employment_status_type_uuid || '',
                financial_support_basis: selectedCitizen.employmentData?.financial_support_basis || '',
                primary_consultant_uuid: selectedCitizen.employmentData?.primary_consultant_uuid || '',
                secondary_consultant_uuid: selectedCitizen.employmentData?.secondary_consultant_uuid || '',
                referrer_name: selectedCitizen.employmentData?.referrer_name || '',
                referrer_phone: selectedCitizen.employmentData?.referrer_phone || '',
                referrer_email: selectedCitizen.employmentData?.referrer_email || '',
                referrer_organization: selectedCitizen.employmentData?.referrer_organization || '',
                referral_date: selectedCitizen.employmentData?.referral_date || '',
                case_start_date: selectedCitizen.employmentData?.case_start_date || '',
                case_end_date: selectedCitizen.employmentData?.case_end_date || '',
                total_weeks: selectedCitizen.employmentData?.total_weeks || '',
                weeks_used: selectedCitizen.employmentData?.weeks_used || '',
                reporting_requirements: selectedCitizen.employmentData?.reporting_requirements || '',
                activation_deadline: selectedCitizen.employmentData?.activation_deadline || '',
                referral_reason: selectedCitizen.employmentData?.referral_reason || '',
            } as any,
            dentalData: {
                is_member_of_sygeforsikring_danmark: selectedCitizen.dentalData?.is_member_of_sygeforsikring_danmark ?? false,
                danmark_group: selectedCitizen.dentalData?.danmark_group || '',
                sygesikring_group: selectedCitizen.dentalData?.sygesikring_group || '',
                is_foreign_patient: selectedCitizen.dentalData?.is_foreign_patient ?? false,
                risk_profile: selectedCitizen.dentalData?.risk_profile || '',
                risk_profile_note: selectedCitizen.dentalData?.risk_profile_note || '',
                recall_channel: selectedCitizen.dentalData?.recall_channel || '',
                auto_reminder: selectedCitizen.dentalData?.auto_reminder ?? true,
                patient_number: selectedCitizen.dentalData?.patient_number || '',
                municipal_subsidy: selectedCitizen.dentalData?.municipal_subsidy || '',
                last_checkup_date: selectedCitizen.dentalData?.last_checkup_date || '',
                checkup_interval_months: selectedCitizen.dentalData?.checkup_interval_months || '',
            } as any,
        }
    }
})

watch(() => language.locale.value, (newLocale: any) => {
    if (newLocale != null) {
        state.formCitizen.pricing = formatPrice(props.selectedCitizen.pricing, newLocale)
        if (props.selectedCitizen?.stayData?.contract_price) {
            state.formCitizen.stayData.contract_price = formatPrice(props.selectedCitizen.stayData.contract_price, newLocale)
        }
        if (props.selectedCitizen?.hourly_rate) {
            state.formCitizen.hourly_rate = formatPrice(props.selectedCitizen.hourly_rate, newLocale)
        }
    }
})

// Note: SSN-derived birthday/gender now goes entirely through
// autoFillFromSocialSecurityNumber() below (backed by useDanishCpr, which knows
// the real century rule and derives gender too). A pair of older watchers used
// to duplicate the hyphen formatting here and derive the birthday with a cruder
// same-century-as-today heuristic - removed because they raced with the newer
// logic: since they fired on every keystroke from 6 digits onwards, they set
// (or blanked, on a not-yet-valid intermediate date) the birthday before the
// CPR was even fully typed, bypassing the auto-filled tracking used above to
// tell a manual correction apart from an auto-filled value.

watch(() => state.formCitizen.post_code, async (newPostCode, oldPostCode, onCleanup) => {
    if (!newPostCode || newPostCode.length < 4) return

    let isStale = false
    onCleanup(() => { isStale = true })

    await new Promise(resolve => setTimeout(resolve, 500))
    if (isStale) return

    const data = await zipLookerService.findCityRegionMunicipality(newPostCode)

    if (data && !isStale) {
        state.formCitizen.city = data.city

        const matchedRegion = state.options.regions.find(
            (r: any) => r.label.toLowerCase().includes(data.region.toLowerCase())
        ) as any

        state.formCitizen.region = matchedRegion?.value
        await changeSelectedRegion(matchedRegion?.value)

        const matchedMuni = state.options.municipalitiesPerRegion.find(
            (m: any) => m.label.toLowerCase().includes(data.municipality.toLowerCase())
        ) as any

        state.formCitizen.municipality = matchedMuni?.value
        await changeSelectedMunicipality(matchedMuni?.value)
    }
})

onMounted(async () => {
    try {
        const response = await formFieldConfigService.getFormConfigs({ entity_type: 'citizen' })
        if (response?.data) {
            // The form config is keyed 'create' / 'edit', but this form receives
            // formType 'create' / 'update' — map 'update' to the 'edit' config so the
            // Edit-form settings also apply to existing citizens (not just new ones).
            const configType = props.formType === 'create' ? 'create' : 'edit'
            const config = response.data.find((c: any) => c.form_type === configType)
            if (config?.form_fields) {
                formConfig.value = config.form_fields
            }
        }
    } catch (e) { /* silent — all fields visible on error */ }
    fetchCitizenCaseWorkers()
    fetchConsentDeclarationTypes()
    fetchDepartments()
    fetchRooms()
    fetchDiagnoses()
    fetchSpokenLanguages()
    fetchMedicationAllergies()
    fetchAddictions()
    fetchSections()
    fetchForeignCities()
    fetchRegions()
    fetchMunicipalities()
    if (userStore.getUser?.company?.industry?.system_name === 'employment_services') {
        fetchEmploymentCaseTypes()
        fetchEmploymentStatusTypes()
        fetchConsultants()
    }
})

const isValidDate = (y: string, m: string, d: string): boolean => {
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d)) // Month is zero-based
    return date && date.getFullYear() === parseInt(y) && (date.getMonth() + 1) === parseInt(m) && date.getDate() === parseInt(d)
}

async function fetchCitizenCaseWorkers() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const response = await citizenCaseworkerService.getAllCitizenCaseworkers(citizenUuid)
        if (response) {
            let options: any = []
            response.data.forEach(
                (caseworker: any) => options.push({
                    value: caseworker.uuid,
                    label: caseworker.firstname + ' ' + (caseworker.lastname ? caseworker.lastname : ''),
                })
            )
            state.options.caseworkers = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchDepartments() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {}
        const response = await departmentService.getAllDepartments(params)
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.departments = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchRooms() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {}
        const response = await roomService.getAllRooms(params)
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.rooms = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchConsentDeclarationTypes() {
    try {
        const response = await consentDeclarationTypeService.getAllConsentDeclarationTypes()
        if (response.data) {
            state.options.consentDeclarationTypes = response.data.map((item: any) => ({
                id: item.id,
                name: item.name,
            }))
            // Merge fetched types with any already-saved values from the API
            const saved = state.formCitizen.stayData.consent_declarations as any[]
            state.formCitizen.stayData.consent_declarations = state.options.consentDeclarationTypes.map((type: any) => {
                const existing = saved?.find((d: any) => d.consent_declaration_type_id === type.id)
                return {
                    consent_declaration_type_id: type.id,
                    value: existing ? existing.value : false
                }
            })
        }
    } catch (error: any) {
        state.error = error
    }
}

function getConsentDeclarationValue(typeId: number): boolean {
    const entry = (state.formCitizen.stayData.consent_declarations as any[])?.find(
        (d: any) => d.consent_declaration_type_id === typeId
    )
    return entry ? entry.value : false
}

function setConsentDeclarationValue(typeId: number, value: boolean) {
    const declarations = state.formCitizen.stayData.consent_declarations as any[]
    const index = declarations?.findIndex((d: any) => d.consent_declaration_type_id === typeId)
    if (index >= 0) {
        declarations[index].value = value
    } else {
        declarations?.push({ consent_declaration_type_id: typeId, value })
    }
}

async function fetchDiagnoses() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const response = await diagnosisService.getAllDiagnoses()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.diagnoses = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchSpokenLanguages() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        state.options.spokenLanguages = await fetchSpokenLanguageOptions()
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchMedicationAllergies() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const response = await medicationAllergyService.getAllMedicationAllergies()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.medicationAllergies = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchAddictions() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const response = await addictionService.getAllAddictions()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.addictions = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchSections() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const response = await sectionService.getAllSections()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                // label joins the paragraph and what it is for; name alone for
                // entries a customer has not split up yet.
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.label ?? item.name,
                })
            )
            state.options.sections = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchForeignCities() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const response = await foreignCityService.getAllForeignCities()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.foreignCities = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchRegions() {
    state.error = {}
    emit('isPageLoading', true)
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
    emit('isPageLoading', false)
}

async function fetchMunicipalities() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const response = await municipalityService.getAllMunicipalities()
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
    emit('isPageLoading', false)
}

async function fetchMunicipalitiesPerRegion(regionUuid: any) {
    state.error = {}
    emit('isPageLoading', true)
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
            state.options.municipalitiesPerRegion = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchCities(municipalityUuid: any) {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {
            municipality_uuid: municipalityUuid
        }
        const response = await cityService.getAllCities(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.cities = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function changeSelectedRegion(regionUuid: string) {
    if (regionUuid) {
        await fetchMunicipalitiesPerRegion(regionUuid)
    }
}

async function changeSelectedMunicipality(municipalityUuid: string) {
    if (municipalityUuid) {
        await fetchCities(municipalityUuid)
    }
}

// The patient portal is its own app; a dental clinic can have it without
// citizen access, and both open a portal login for the person.
const hasPatientPortal = computed(() => !!userStore.getUser?.has_patient_app)
const canGrantPortalAccess = computed(() => !!userStore.getUser?.has_citizen_app || hasPatientPortal.value)

// Which industries the dental fields exist for lives in one place, so turning
// them on for another kind of clinic is a word in that list. The API enforces
// the same rule.
const isDentalClinic = computed(() => industryHasFeature('toothChart'))

const rules = computed(() => {
    return {
        formCitizen: {
            firstname: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            inquiryData: {},
            stayData: {},
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        if (!state.formCitizen.region) {
            state.formCitizen.municipality = ''
        }
        emit('submitForm', state.formCitizen)
    }
}

function triggerCitizenImageInput() {
    if (citizenImage.value) {
        citizenImage.value.click()
    }
}

function onCitizenImageChange(event: any) {
    const file = event.target.files[0]
    state.formCitizen.image = event.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e: any) => {
            avatarUrl.value = e.target.result
        }
        reader.readAsDataURL(file)
    }
}

// The mother tongue can only be one of the languages actually selected.
const selectedSpokenLanguageOptions = computed(() =>
    state.options.spokenLanguages.filter((option: any) =>
        state.formCitizen.spoken_languages?.includes(option.value)
    )
)

// Deselecting a language that was the mother tongue would otherwise leave a
// dangling uuid that the backend silently drops on save.
watch(() => state.formCitizen.spoken_languages, (languages: any) => {
    if (state.formCitizen.primary_spoken_language && !languages?.includes(state.formCitizen.primary_spoken_language)) {
        state.formCitizen.primary_spoken_language = ''
    }
}, { deep: true })

const formattedSocialSecurityNumber = computed<string>({
    get() {
        const ssn = state.formCitizen.social_security_number
        if (ssn?.length === 10) {
            return ssn.slice(0, 6) + '-' + ssn.slice(6)
        }
        return ssn
    },
    set(value: string) {
        state.formCitizen.social_security_number = value.replace(/-/g, '')
    }
})

function updateSocialSecurityNumber(event: Event) {
    const target = event.target as HTMLInputElement
    state.formCitizen.social_security_number = target.value.replace(/-/g, '')
    autoFillFromSocialSecurityNumber()
}

// Set while autoFillFromSocialSecurityNumber() is writing a field itself, so the
// watchers below don't mistake that write for a manual edit and immediately
// clear the flag they were just asked to set.
let isAutoFillingFromSsn = false

watch(() => state.formCitizen.birthday, () => {
    if (!isAutoFillingFromSsn) state.autoFilledFromSsn = false
})

watch(() => state.formCitizen.gender, () => {
    if (!isAutoFillingFromSsn) state.genderAutoFilledFromSsn = false
})

/**
 * A CPR number already holds the birthday and the gender, so both are filled in
 * as soon as the number is complete. Each field tracks its own auto-filled state,
 * so correcting one by hand does not re-lock the other against the next edit of
 * the CPR number - and both stay editable afterwards.
 */
function autoFillFromSocialSecurityNumber() {
    const parsed = parseCpr(state.formCitizen.social_security_number)

    if (!parsed) {
        return
    }

    const birthdayIsFree = !state.formCitizen.birthday || state.autoFilledFromSsn
    const genderIsFree = !state.formCitizen.gender || state.genderAutoFilledFromSsn

    if (!birthdayIsFree && !genderIsFree) {
        return
    }

    isAutoFillingFromSsn = true
    if (birthdayIsFree) {
        state.formCitizen.birthday = parsed.birthday
        state.autoFilledFromSsn = true
    }
    if (genderIsFree) {
        state.formCitizen.gender = parsed.gender
        state.genderAutoFilledFromSsn = true
    }
    nextTick(() => { isAutoFillingFromSsn = false })
}

function addAccompanyingChild() {
    state.formCitizen.stayData.accompanying_children.push({
        firstname: '',
        lastname: '',
        social_security_number: '',
        gender: '',
        birthday: '',
        origin: '',
    })
}

function removeAccompanyingChild(index: number) {
    state.formCitizen.stayData.accompanying_children.splice(index, 1)
}

async function parseAndUpdateAddress(addressData: any, location: { lat: number; lng: number }) {
    if (!addressData || !addressData.address) {
        state.selectedCitizenLocation = location
        state.formCitizen.latitude = location.lat.toString()
        state.formCitizen.longitude = location.lng.toString()
        return
    }

    const address = addressData.address || {}

    const street = `${address.road || ''} ${address.house_number || ''}`.trim() || address.pedestrian || ''
    const postCode = address.postcode || ''
    const city = address.city || address.town || address.village || address.municipality || ''

    state.formCitizen.street = street
    state.formCitizen.post_code = postCode

    state.formCitizen.latitude = location.lat.toString()
    state.formCitizen.longitude = location.lng.toString()

    const regionName = address.state || address.region || ''
    if (regionName) {
        const normalizedRegionName = regionName.replace(/^Region\s+/i, '').trim()

        const matchedRegion = state.options.regions.find(
            (r: any) => {
                if (!r?.label) return false
                const normalizedLabel = r.label.trim()

                if (normalizedLabel.toLowerCase() === normalizedRegionName.toLowerCase()) {
                    return true
                }

                if (normalizedLabel.toLowerCase().includes(normalizedRegionName.toLowerCase()) ||
                    normalizedRegionName.toLowerCase().includes(normalizedLabel.toLowerCase())) {
                    return true
                }

                return false
            }
        )

        if (matchedRegion && matchedRegion.value) {
            state.formCitizen.region = matchedRegion.value
            await fetchMunicipalitiesPerRegion(matchedRegion.value)
        }
    }

    const municipalityName = address.municipality || address.county || ''
    if (municipalityName) {
        const normalizedMunicipalityName = municipalityName.replace(/\s+Kommune$/i, '').trim()

        let matchedMunicipality = state.options.municipalitiesPerRegion.find(
            (m: any) => {
                if (!m?.label) return false
                const normalizedLabel = m.label.trim()

                if (normalizedLabel.toLowerCase() === normalizedMunicipalityName.toLowerCase()) {
                    return true
                }

                if (normalizedLabel.toLowerCase().includes(normalizedMunicipalityName.toLowerCase()) ||
                    normalizedMunicipalityName.toLowerCase().includes(normalizedLabel.toLowerCase())) {
                    return true
                }

                return false
            }
        )

        if (!matchedMunicipality && state.options.municipalitiesPerRegion.length === 0) {
            matchedMunicipality = state.options.municipalities.find(
                (m: any) => {
                    if (!m?.label) return false
                    const normalizedLabel = m.label.trim()

                    if (normalizedLabel.toLowerCase() === normalizedMunicipalityName.toLowerCase()) {
                        return true
                    }

                    if (normalizedLabel.toLowerCase().includes(normalizedMunicipalityName.toLowerCase()) ||
                        normalizedMunicipalityName.toLowerCase().includes(normalizedLabel.toLowerCase())) {
                        return true
                    }

                    return false
                }
            )
        }

        if (matchedMunicipality && matchedMunicipality.value) {
            state.formCitizen.municipality = matchedMunicipality.value
            await fetchCities(matchedMunicipality.value)
        }
    }

    if (city) {
        const matchedCity = state.options.cities.find(
            (c: any) => c?.label && c.label.toLowerCase() === city.toLowerCase()
        )
        if (matchedCity && matchedCity.label) {
            state.formCitizen.city = matchedCity.label
        } else {
            state.formCitizen.city = city
        }
    }

    state.selectedCitizenLocation = location
}

async function onCitizenLocationSelected(location: { lat: number; lng: number }, address: string, addressData: any) {
    if (!addressData) {
        state.formCitizen.street = address
        state.formCitizen.latitude = location.lat.toString()
        state.formCitizen.longitude = location.lng.toString()
        state.selectedCitizenLocation = location
        return
    }

    await parseAndUpdateAddress(addressData, location)
}

async function fetchEmploymentCaseTypes() {
    try {
        const response = await employmentService.getAllCaseTypes()
        if (response.data) {
            state.options.employmentCaseTypes = response.data.map((item: any) => ({
                value: item.uuid,
                label: item.name,
            }))
        }
    } catch (error: any) {
        state.error = error
    }
}

async function fetchEmploymentStatusTypes() {
    try {
        const response = await employmentService.getAllStatusTypes()
        if (response.data) {
            state.options.employmentStatusTypes = response.data.map((item: any) => ({
                value: item.uuid,
                label: item.name,
            }))
        }
    } catch (error: any) {
        state.error = error
    }
}

async function fetchConsultants() {
    try {
        const response = await employeeService.getEmployees({})
        if (response.data) {
            state.options.consultants = response.data.map((item: any) => ({
                value: item.uuid,
                label: `${item.firstname}${item.lastname ? ' ' + item.lastname : ''}`,
            }))
        }
    } catch (error: any) {
        state.error = error
    }
}
</script>