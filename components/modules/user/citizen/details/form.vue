<template>
    <form @submit.prevent="submitForm()" class="mt-6">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="grid grid-cols-1 gap-x-8 gap-y-4 pb-10 mb-10 xl:grid-cols-3 border-b border-gray-900/10">
            <div>
                <h2 class="text-base font-semibold leading-7 text-gray-900">
                    {{ $t('citizens.sections.citizenDetails') }}
                </h2>
            </div>
            <div class="md:col-span-2 space-y-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8">
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
                        <FormTextField id="firstname" name="firstname" :placeholder="$t('citizens.form.firstname')"
                            v-model="state.formCitizen.firstname" />
                        <FormError :error="v$?.formCitizen?.firstname?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.firstname?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="lastname" :label="$t('citizens.form.lastname')" />
                        <FormTextField id="lastname" name="lastname" :placeholder="$t('citizens.form.lastname')"
                            v-model="state.formCitizen.lastname" />
                        <FormError :error="v$?.formCitizen?.lastname?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.lastname?.[0]" />
                    </div>
                </div>
                <div class="space-y-1">
                    <FormLabel for="gender" :label="$t('citizens.form.gender')" />
                    <FormSelect id="gender" :options="state.options.genders" v-model="state.formCitizen.gender" />
                    <FormError :error="v$?.formCitizen?.gender?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.gender?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="email" :label="$t('citizens.form.emailAddress')" />
                    <FormTextField id="email" name="email" :placeholder="$t('citizens.form.emailAddress')"
                        v-model="state.formCitizen.email" />
                    <FormError :error="v$?.formCitizen?.email?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.email?.[0]" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="social_security_number" :label="$t('citizens.form.ssn')" />
                        <FormTextField id="social_security_number" name="social_security_number"
                            :placeholder="$t('citizens.form.ssn')" :maxLength="10"
                            v-model="formattedSocialSecurityNumber" @input="updateSocialSecurityNumber" />
                        <FormError :error="v$?.formCitizen?.social_security_number?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.social_security_number?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="birthday" :label="$t('citizens.form.birthday')" />
                        <FormDateField id="birthday" name="birthday" :placeholder="$t('citizens.form.birthday')"
                            v-model="state.formCitizen.birthday" />
                        <FormError :error="v$?.formCitizen?.birthday?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.birthday?.[0]" />
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="phone" :label="$t('citizens.form.phone')" />
                        <FormTextField id="phone" name="phone" :placeholder="$t('citizens.form.phone')"
                            v-model="state.formCitizen.phone" />
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
                        <FormLabel for="primary_case_worker_uuid" :label="$t('citizens.form.primaryCaseworker')" />
                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                            @click="state.modal.isAddCaseworkerOpen = true">
                            {{ $t('citizens.caseWorker.addNewCaseworker') }}
                        </span>
                    </div>
                    <FormSelect id="primary_case_worker_uuid" :options="state.options.caseworkers"
                        v-model="state.formCitizen.primary_case_worker_uuid" />
                    <FormError :error="v$?.formCitizen?.primary_case_worker_uuid?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.primary_case_worker_uuid?.[0]" />
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
                    <FormLabel for="note" :label="$t('citizens.form.note')" />
                    <FormTextArea id="note" name="note" :placeholder="$t('citizens.form.note')"
                        v-model="state.formCitizen.note" />
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
                <div v-if="userStore.getUser?.has_citizen_app && isFieldVisible('system_access')"
                    class="space-y-1 flex items-center gap-x-2">
                    <FormSwitch :value="state.formCitizen.has_system_access"
                        @toggleSwitch="state.formCitizen.has_system_access = !state.formCitizen.has_system_access" />
                    <p>
                        {{ $t('citizens.form.allowSystemAccess') }}
                    </p>
                </div>
                <div v-if="userStore.getUser?.has_citizen_app && isFieldVisible('system_access')"
                    class="space-y-1 flex items-center gap-x-2">
                    <FormSwitch :value="state.formCitizen.has_chat_access"
                        @toggleSwitch="state.formCitizen.has_chat_access = !state.formCitizen.has_chat_access" />
                    <p>
                        {{ $t('citizens.form.allowChatAccess') }}
                    </p>
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
            </div>
        </div>
        <div class="grid grid-cols-1 gap-x-8 gap-y-4 pb-10 mb-10 xl:grid-cols-3 border-b border-gray-900/10"
            v-if="userStore.getUser?.company?.industry?.system_name === 'social_welfare' && ['Crisis center', 'Shelter'].includes(userStore.getUser?.company?.facility_type?.en_name) && isFieldVisible('inquiry_data')">
            <div>
                <h2 class="text-base font-semibold leading-7 text-gray-900">
                    {{ $t('citizens.sections.inquiryData') }}
                </h2>
            </div>
            <div class="md:col-span-2 space-y-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8">
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
            </div>
        </div>
        <div class="grid grid-cols-1 gap-x-8 gap-y-4 pb-10 mb-10 xl:grid-cols-3 border-b border-gray-900/10"
            v-if="userStore.getUser?.company?.industry?.system_name === 'social_welfare' && ['Crisis center', 'Shelter'].includes(userStore.getUser?.company?.facility_type?.en_name) && isFieldVisible('stay_data')">
            <div>
                <h2 class="text-base font-semibold leading-7 text-gray-900">
                    {{ $t('citizens.sections.stayData') }}
                </h2>
            </div>
            <div class="md:col-span-2 space-y-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8">
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
            </div>
        </div>
        <div class="grid grid-cols-1 gap-x-8 gap-y-4 pb-10 mb-10 xl:grid-cols-3 border-b border-gray-900/10"
            v-if="userStore.getUser?.company?.industry?.system_name === 'employment_services' && isFieldVisible('employment_data')">
            <div>
                <h2 class="text-base font-semibold leading-7 text-gray-900">
                    {{ $t('citizens.sections.employmentProgram') }}
                </h2>
            </div>
            <div class="md:col-span-2 space-y-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8">
                <div class="space-y-1">
                    <FormLabel for="employment_case_type_uuid" :label="$t('citizens.form.employmentProgram.caseType')" />
                    <FormSelect id="employment_case_type_uuid" :options="state.options.employmentCaseTypes"
                        v-model="state.formCitizen.employmentData.employment_case_type_uuid" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="employment_status_type_uuid" :label="$t('citizens.form.employmentProgram.status')" />
                    <FormSelect id="employment_status_type_uuid" :options="state.options.employmentStatusTypes"
                        v-model="state.formCitizen.employmentData.employment_status_type_uuid" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="financial_support_basis" :label="$t('citizens.form.employmentProgram.financialSupportBasis')" />
                    <FormTextField id="financial_support_basis" name="financial_support_basis"
                        :placeholder="$t('citizens.form.employmentProgram.financialSupportBasis')"
                        v-model="state.formCitizen.employmentData.financial_support_basis" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="primary_consultant_uuid" :label="$t('citizens.form.employmentProgram.primaryConsultant')" />
                    <FormSelect id="primary_consultant_uuid" :options="state.options.consultants"
                        v-model="state.formCitizen.employmentData.primary_consultant_uuid" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="secondary_consultant_uuid" :label="$t('citizens.form.employmentProgram.secondaryConsultant')" />
                    <FormSelect id="secondary_consultant_uuid" :options="state.options.consultants"
                        v-model="state.formCitizen.employmentData.secondary_consultant_uuid" />
                </div>
                <div class="space-y-2">
                    <p class="text-sm font-medium text-gray-700">{{ $t('citizens.form.employmentProgram.referrerInfo') }}</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="space-y-1">
                            <FormLabel for="referrer_name" :label="$t('citizens.form.employmentProgram.referrerName')" />
                            <FormTextField id="referrer_name" name="referrer_name"
                                :placeholder="$t('citizens.form.employmentProgram.referrerName')"
                                v-model="state.formCitizen.employmentData.referrer_name" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="referrer_organization" :label="$t('citizens.form.employmentProgram.referrerOrganization')" />
                            <FormTextField id="referrer_organization" name="referrer_organization"
                                :placeholder="$t('citizens.form.employmentProgram.referrerOrganization')"
                                v-model="state.formCitizen.employmentData.referrer_organization" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="referrer_phone" :label="$t('citizens.form.employmentProgram.referrerPhone')" />
                            <FormTextField id="referrer_phone" name="referrer_phone"
                                :placeholder="$t('citizens.form.employmentProgram.referrerPhone')"
                                v-model="state.formCitizen.employmentData.referrer_phone" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="referrer_email" :label="$t('citizens.form.employmentProgram.referrerEmail')" />
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
                    <FormLabel for="reporting_requirements" :label="$t('citizens.form.employmentProgram.reportingRequirements')" />
                    <FormTextArea id="reporting_requirements" name="reporting_requirements"
                        :placeholder="$t('citizens.form.employmentProgram.reportingRequirements')"
                        v-model="state.formCitizen.employmentData.reporting_requirements" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="activation_deadline" :label="$t('citizens.form.employmentProgram.activationDeadline')" />
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
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="navigateTo('/citizens')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="w-full">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
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
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useCustomPagesStore } from '@/store/custom-pages'
import type { Error } from '@/types'
import { zipLookerService } from '~/components/api/ziplooker/ZipLookerService'
import { formFieldConfigService } from '@/components/api/user/FormFieldConfigService'
import { employmentService } from '@/components/api/user/EmploymentService'
import { employeeService } from '@/components/api/user/EmployeeService'

const userStore = useUserStore() as any
const { t } = useI18n()
const { formatPrice } = useNumberFormatter()
const language = useI18n()
const citizenImage = ref<HTMLInputElement | null>(null)
const avatarUrl = ref('/img/avatars/user.svg')
const router = useRouter()
const customPagesStore = useCustomPagesStore() as any
const citizenUuid = router?.currentRoute?.value?.params?.uuid

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

const state = reactive({
    error: {} as Error,
    formCitizen: {
        image: '',
        firstname: '',
        lastname: '',
        gender: '',
        email: '',
        social_security_number: '',
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
        has_duty_schedule_access: false,
        has_bullet_board_access: false,
        inquiryData: {
            conversation_summary: '',
            inquiry_date: '',
            inquirer_name: '',
            outcome: '',
            purpose: '',
        },
        stayData: {
            accommodation_end_date: '',
            accommodation_start_date: '',
            journal_number: '',
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
        employmentCaseTypes: [] as any,
        employmentStatusTypes: [] as any,
        consultants: [] as any,
    },
    selectedCitizenLocation: null as { lat: number; lng: number } | null,
})

watch(() => language.locale.value, () => {
    state.options.genders = [
        { value: 'male', label: `${t('gender.male')}`, },
        { value: 'female', label: `${t('gender.female')}`, },
        { value: 'non_binary', label: `${t('gender.nonbinary')}`, },
        { value: 'will_not_disclose', label: `${t('gender.willNotDisclose')}`, },
    ]
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
            paying_municipality: selectedCitizen.paying_municipality,
            assessment_municipality: selectedCitizen.assessment_municipality,
            responsible_municipality: selectedCitizen.responsible_municipality,
            ean_number: selectedCitizen.ean_number,
            transportation: selectedCitizen.transportation,
            hourly_rate: selectedCitizen.hourly_rate,
            allocated_daily_hours: selectedCitizen.allocated_daily_hours,
            allocated_weekly_hours: selectedCitizen.allocated_weekly_hours,
            allocated_monthly_hours: selectedCitizen.allocated_monthly_hours,
            note: selectedCitizen.note,
            green: selectedCitizen.green,
            yellow: selectedCitizen.yellow,
            red: selectedCitizen.red,
            has_system_access: selectedCitizen.has_system_access,
            has_chat_access: selectedCitizen.has_chat_access,
            has_duty_schedule_access: selectedCitizen.has_duty_schedule_access,
            has_bullet_board_access: selectedCitizen.has_bullet_board_access,
            inquiryData: {
                conversation_summary: selectedCitizen.inquiryData?.conversation_summary || '',
                inquiry_date: selectedCitizen.inquiryData?.inquiry_date || '',
                inquirer_name: selectedCitizen.inquiryData?.inquirer_name || '',
                outcome: selectedCitizen.inquiryData?.outcome || '',
                purpose: selectedCitizen.inquiryData?.purpose || '',
            },
            stayData: {
                accommodation_end_date: selectedCitizen.stayData?.accommodation_end_date || '',
                accommodation_start_date: selectedCitizen.stayData?.accommodation_start_date || '',
                journal_number: selectedCitizen.stayData?.journal_number || '',
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
        }
    }
})

watch(() => language.locale.value, (language: any) => {
    if (language != null) {
        if (language === 'en') {
            state.formCitizen.pricing = formatPrice(props.selectedCitizen.pricing, 'en')
        } else if (language === 'dk') {
            state.formCitizen.pricing = formatPrice(props.selectedCitizen.pricing, 'dk')
        }
    }
})

watch(() => state.formCitizen.social_security_number, (ssn) => {
    if (ssn?.length === 10) {
        state.formCitizen.social_security_number = ssn.slice(0, 6) + '-' + ssn.slice(6)
    }
})

watch(() => state.formCitizen.social_security_number, (ssn) => {
    // Format social security number with a hyphen after six digits
    if (ssn?.length === 10) {
        state.formCitizen.social_security_number = ssn.slice(0, 6) + '-' + ssn.slice(6)
    }

    // Check if the length is at least six digits to derive the birthdate
    if (ssn?.length >= 6) {
        const day = ssn.slice(0, 2)
        const month = ssn.slice(2, 4)
        let year = ssn.slice(4, 6)

        // Determine the century (adjust as needed for your specific case)
        const currentYear = new Date().getFullYear() % 100
        year = parseInt(year, 10) <= currentYear ? `20${year}` : `19${year}`

        // Create a valid date string in the format 'YYYY-MM-DD'
        const dateOfBirth = `${year}-${month}-${day}`

        if (isValidDate(year, month, day)) {
            // Update the birthday field if the date is valid
            if (!state.formCitizen.birthday) {
                state.formCitizen.birthday = dateOfBirth
            }
        } else {
            // Handle invalid date case (optional: clear or show error)
            state.formCitizen.birthday = ''
        }
    }
})

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
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
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