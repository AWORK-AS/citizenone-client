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
                            <FormLabel for="departments" :label="$t('citizens.form.department')" />
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
                    v-if="userStore.getUser?.company?.industry?.system_name === 'social_welfare' && ['crisis_center', 'homeless_shelter'].includes(userStore.getUser?.company?.subcategory)">
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
                    <FormLabel for="street" :label="$t('citizens.form.street')" />
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
                        <FormSelect id="city" :options="state.options.cities" v-model="state.formCitizen.city" />
                        <FormError :error="v$?.formCitizen?.city?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.city_uuid?.[0]" />
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
                <div class="space-y-1">
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
                <div class="space-y-1">
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
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                    v-if="state.formCitizen.date_discharged">
                    <div class="flex items-center">
                        <FormCheckbox id="is_discharge_reminded" :value="state.formCitizen.is_discharge_reminded" />
                        {{ $t('citizens.form.dateDischargedReminder') }}
                    </div>
                    <p class="ml-7 text-xs">
                        {{ $t('citizens.form.dateDischargedReminderDescription') }}
                    </p>
                </div>
                <div class="space-y-1">
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
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                <div class="space-y-1">
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
                <div class="space-y-1">
                    <FormLabel for="paying_municipality" :label="$t('citizens.form.payingMunicipality')" />
                    <FormSelect id="paying_municipality" :options="state.options.municipalities"
                        v-model="state.formCitizen.paying_municipality" />
                    <FormError :error="v$?.formCitizen?.paying_municipality?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.paying_municipality?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="assessment_municipality" :label="$t('citizens.form.assessmentMunicipality')" />
                    <FormSelect id="assessment_municipality" :options="state.options.municipalities"
                        v-model="state.formCitizen.assessment_municipality" />
                    <FormError :error="v$?.formCitizen?.assessment_municipality?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.assessment_municipality?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="responsible_municipality" :label="$t('citizens.form.responsibleMunicipality')" />
                    <FormSelect id="responsible_municipality" :options="state.options.municipalities"
                        v-model="state.formCitizen.responsible_municipality" />
                    <FormError :error="v$?.formCitizen?.responsible_municipality?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.responsible_municipality?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="ean_number" :label="$t('citizens.form.eanNumber')" />
                    <FormTextField id="ean_number" name="ean_number" :placeholder="$t('citizens.form.eanNumber')"
                        v-model="state.formCitizen.ean_number" />
                    <FormError :error="v$?.formCitizen?.ean_number?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.ean_number?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="transportation" :label="$t('citizens.form.transportation')" />
                    <FormTextField id="transportation" name="transportation"
                        :placeholder="$t('citizens.form.transportation')" v-model="state.formCitizen.transportation" />
                    <FormError :error="v$?.formCitizen?.transportation?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.transportation?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="hourly_rate" :label="$t('citizens.form.hourlyRate')" />
                    <FormTextField id="hourly_rate" name="hourly_rate" :placeholder="$t('citizens.form.hourlyRate')"
                        v-model="state.formCitizen.hourly_rate" />
                    <FormError :error="v$?.formCitizen?.hourly_rate?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.hourly_rate?.[0]" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                <div class="space-y-1">
                    <FormLabel for="note" :label="$t('citizens.form.note')" />
                    <FormTextArea id="note" name="note" :placeholder="$t('citizens.form.note')"
                        v-model="state.formCitizen.note" />
                    <FormError :error="v$?.formCitizen?.note?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.note?.[0]" />
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-gray-600">
                        {{ $t('citizens.form.trafficLights.trafficLights') }}
                    </p>
                    <FormLabel for="green" :label="$t('citizens.form.trafficLights.green')" />
                    <FormTextArea id="green" name="green" :placeholder="$t('citizens.form.trafficLights.green')"
                        v-model="state.formCitizen.green" />
                    <FormError :error="v$?.formCitizen?.green?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.green?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="yellow" :label="$t('citizens.form.trafficLights.yellow')" />
                    <FormTextArea id="yellow" name="green" :placeholder="$t('citizens.form.trafficLights.yellow')"
                        v-model="state.formCitizen.yellow" />
                    <FormError :error="v$?.formCitizen?.yellow?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.yellow?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="red" :label="$t('citizens.form.trafficLights.red')" />
                    <FormTextArea id="red" name="red" :placeholder="$t('citizens.form.trafficLights.red')"
                        v-model="state.formCitizen.red" />
                    <FormError :error="v$?.formCitizen?.red?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.red?.[0]" />
                </div>
                <div v-if="userStore.getUser?.has_citizen_app" class="space-y-1 flex items-center gap-x-2">
                    <FormSwitch :value="state.formCitizen.has_system_access"
                        @toggleSwitch="state.formCitizen.has_system_access = !state.formCitizen.has_system_access" />
                    <p>
                        {{ $t('citizens.form.allowSystemAccess') }}
                    </p>
                </div>
                <div v-if="userStore.getUser?.has_citizen_app" class="space-y-1 flex items-center gap-x-2">
                    <FormSwitch :value="state.formCitizen.has_chat_access"
                        @toggleSwitch="state.formCitizen.has_chat_access = !state.formCitizen.has_chat_access" />
                    <p>
                        {{ $t('citizens.form.allowChatAccess') }}
                    </p>
                </div>
                <div v-if="userStore.getUser?.has_citizen_app" class="space-y-1 flex items-center gap-x-2">
                    <FormSwitch :value="state.formCitizen.has_duty_schedule_access"
                        @toggleSwitch="state.formCitizen.has_duty_schedule_access = !state.formCitizen.has_duty_schedule_access" />
                    <p>
                        {{ $t('citizens.form.allowDutyScheduleAccess') }}
                    </p>
                </div>
                <div v-if="userStore.getUser?.has_citizen_app" class="space-y-1 flex items-center gap-x-2">
                    <FormSwitch :value="state.formCitizen.has_bullet_board_access"
                        @toggleSwitch="state.formCitizen.has_bullet_board_access = !state.formCitizen.has_bullet_board_access" />
                    <p>
                        {{ $t('citizens.form.allowBulletBoardAccess') }}
                    </p>
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 gap-x-8 gap-y-4 pb-10 mb-10 xl:grid-cols-3 border-b border-gray-900/10"
            v-if="userStore.getUser?.company?.industry?.system_name === 'social_welfare' && userStore.getUser?.company?.facility_type_id">
            <div>
                <h2 class="text-base font-semibold leading-7 text-gray-900">
                    {{ $t('citizens.sections.inquiryData') }}
                </h2>
            </div>
            <div class="md:col-span-2 space-y-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8">
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
            </div>
        </div>
        <div class="grid grid-cols-1 gap-x-8 gap-y-4 pb-10 mb-10 xl:grid-cols-3 border-b border-gray-900/10"
            v-if="userStore.getUser?.company?.industry?.system_name === 'social_welfare' && userStore.getUser?.company?.facility_type_id">
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
                <div class="space-y-1">
                    <p class="text-sm text-gray-600">
                        {{ $t('citizens.form.stayData.accompanyingChildren.accompanyingChildren') }}
                    </p>
                    <div class="space-y-6">
                        <div v-for="(child, accompanyingChildenIndex) in state.formCitizen.stayData.accompanying_children"
                            :key="accompanyingChildenIndex" class="relative">
                            <div
                                class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg space-y-3 px-4 py-6 sm:p-8">
                                <div class="flex items-center gap-x-2">
                                    <div class="grow grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div class="space-y-1">
                                            <FormLabel :for="`name_${accompanyingChildenIndex}`"
                                                :label="$t('citizens.form.stayData.accompanyingChildren.name')" />
                                            <FormTextField :id="`name_${accompanyingChildenIndex}`"
                                                :name="`name_${accompanyingChildenIndex}`"
                                                :placeholder="$t('citizens.form.stayData.accompanyingChildren.name')"
                                                :value="child.name"
                                                @keyup="(event: any) => state.formCitizen.stayData.accompanying_children[accompanyingChildenIndex].name = event.target.value" />
                                        </div>
                                        <div class="space-y-1">
                                            <FormLabel for="gender"
                                                :label="$t('citizens.form.stayData.accompanyingChildren.gender')" />
                                            <FormSelect :id="`gender_${accompanyingChildenIndex}`"
                                                :options="state.options.genders"
                                                v-model="state.formCitizen.stayData.accompanying_children[accompanyingChildenIndex].gender" />
                                        </div>
                                        <div class="space-y-1">
                                            <FormLabel :for="`age_${accompanyingChildenIndex}`"
                                                :label="$t('citizens.form.stayData.accompanyingChildren.age')" />
                                            <FormTextField :id="`age_${accompanyingChildenIndex}`"
                                                :name="`age_${accompanyingChildenIndex}`"
                                                :placeholder="$t('citizens.form.stayData.accompanyingChildren.age')"
                                                :value="child.age"
                                                @keyup="(event: any) => state.formCitizen.stayData.accompanying_children[accompanyingChildenIndex].age = event.target.value" />
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
                                @click="removeAccompanyingChild(accompanyingChildenIndex)"
                                v-if="state.formCitizen.stayData.accompanying_children.length > 1">
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
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="navigateTo('/citizens')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
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
    </form>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { citizenCaseworkerService } from '@/components/api/user/CitizenCaseworkerService'
import { departmentService } from '@/components/api/user/DepartmentService'
import { roomService } from '@/components/api/user/RoomService'
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
                gender: '',
                age: '',
                origin: '',
            }],
            residence_before_uuid: '',
            residence_after_uuid: '',
            discharge_reason: '',
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
    },
    options: {
        addictions: [],
        cities: [],
        caseworkers: [],
        departments: [],
        diagnoses: [],
        foreignCities: [],
        genders: [
            { value: 'male', label: `${t('gender.male')}`, },
            { value: 'female', label: `${t('gender.female')}`, },
            { value: 'non_binary', label: `${t('gender.nonbinary')}`, },
            { value: 'will_not_disclose', label: `${t('gender.willNotDisclose')}`, },
        ],
        medicationAllergies: [],
        municipalities: [],
        municipalitiesPerRegion: [],
        regions: [],
        rooms: [],
        sections: [],
    }
})

watch(() => language.locale.value, () => {
    state.options.genders = [
        { value: 'male', label: `${t('gender.male')}`, },
        { value: 'female', label: `${t('gender.female')}`, },
        { value: 'non_binary', label: `${t('gender.nonbinary')}`, },
        { value: 'will_not_disclose', label: `${t('gender.willNotDisclose')}`, },
    ]
})

watch(() => props.selectedCitizen, (selectedCitizen: any) => {
    if (selectedCitizen != null) {
        fetchMunicipalitiesPerRegion(selectedCitizen.region_uuid)
        fetchCities(selectedCitizen.municipality_uuid)
        if (selectedCitizen.image) {
            avatarUrl.value = selectedCitizen.image
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
            street: selectedCitizen.street,
            region: selectedCitizen.region_uuid,
            municipality: selectedCitizen.municipality_uuid,
            city: selectedCitizen.city_uuid,
            post_code: selectedCitizen.post_code,
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
                conversation_summary: selectedCitizen.inquiryData.conversation_summary,
                inquiry_date: selectedCitizen.inquiryData.inquiry_date,
                inquirer_name: selectedCitizen.inquiryData.inquirer_name,
                outcome: selectedCitizen.inquiryData.outcome,
                purpose: selectedCitizen.inquiryData.purpose,
            },
            stayData: {
                accommodation_end_date: selectedCitizen.stayData.accommodation_end_date,
                accommodation_start_date: selectedCitizen.stayData.accommodation_start_date,
                journal_number: selectedCitizen.stayData.journal_number,
                accompanying_children: selectedCitizen.stayData.accompanying_children,
                residence_before_uuid: selectedCitizen.stayData.residence_before_uuid,
                residence_after_uuid: selectedCitizen.stayData.residence_after_uuid,
                discharge_reason: selectedCitizen.stayData.discharge_reason,
            }
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
    if (ssn.length === 10) {
        state.formCitizen.social_security_number = ssn.slice(0, 6) + '-' + ssn.slice(6)
    }
})

watch(() => state.formCitizen.social_security_number, (ssn) => {
    // Format social security number with a hyphen after six digits
    if (ssn.length === 10) {
        state.formCitizen.social_security_number = ssn.slice(0, 6) + '-' + ssn.slice(6)
    }

    // Check if the length is at least six digits to derive the birthdate
    if (ssn.length >= 6) {
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

onMounted(() => {
    fetchCitizenCaseWorkers()
    fetchDepartments()
    fetchRooms()
    fetchDiagnoses()
    fetchMedicationAllergies()
    fetchAddictions()
    fetchSections()
    fetchForeignCities()
    fetchRegions()
    fetchMunicipalities()
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

function changeSelectedRegion(regionUuid: string) {
    if (regionUuid) {
        fetchMunicipalitiesPerRegion(regionUuid)
    }
}

function changeSelectedMunicipality(municipalityUuid: string) {
    if (municipalityUuid) {
        fetchCities(municipalityUuid)
    }
}

const rules = computed(() => {
    return {
        formCitizen: {
            firstname: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
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
            state.formCitizen.city = ''
        }
        if (!state.formCitizen.municipality) {
            state.formCitizen.city = ''
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
        if (ssn.length === 10) {
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
        name: '',
        gender: '',
        age: '',
        origin: '',
    })
}

function removeAccompanyingChild(index: number) {
    state.formCitizen.stayData.accompanying_children.splice(index, 1)
}
</script>