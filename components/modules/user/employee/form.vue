<template>
    <form @submit.prevent="submitForm()" class="mt-6">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <FormSection :title="$t('employees.form.header.employeeInformation')" :description="$t('employees.form.header.essentialDetailsOfTheEmployee')">
                <div class="space-y-1">
                    <div class="flex flex-col items-center">
                        <input type="file" ref="image" @change="onFileChange" class="hidden" />
                        <div class="relative cursor-pointer" @click="triggerFileInput">
                            <img :src="avatarUrl" alt="Avatar"
                                class="w-36 h-36 rounded-full object-cover border-2 border-tertiary-25" />
                            <div
                                class="rounded-full absolute inset-0 bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity">
                                <div class="flex items-center w-full h-full justify-center text-xs">
                                    {{ $t('changeImage') }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <FormError :error="v$?.formEmployee?.profile_image?.$errors[0]?.$message.toString()"
                        class="text-center" />
                    <FormError :error="props?.error?.errors?.profile_image?.[0]" class="text-center" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1" ref="firstnameField">
                        <FormLabel for="firstname" :label="$t('employees.form.firstname')" />
                        <FormTextField id="firstname" name="firstname"
                            v-model="state.formEmployee.firstname" />
                        <FormError :error="v$?.formEmployee?.firstname?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.firstname?.[0]" />
                    </div>
                    <div class="space-y-1" ref="lastnameField">
                        <FormLabel for="lastname" :label="$t('employees.form.lastname')" />
                        <FormTextField id="lastname" name="lastname"
                            v-model="state.formEmployee.lastname" />
                        <FormError :error="v$?.formEmployee?.lastname?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.lastname?.[0]" />
                    </div>
                </div>
                <div class="space-y-1" ref="emailField">
                    <FormLabel for="email" :label="$t('employees.form.emailAddress')" />
                    <FormTextField id="email" name="email"
                        v-model="state.formEmployee.email" />
                    <FormError :error="v$?.formEmployee?.email?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.email?.[0]" />
                </div>
                <div class="space-y-3" ref="passwordField" v-if="props.formType === 'update'">
                    <div class="space-y-1">
                        <div class="w-fit flex items-center cursor-pointer"
                            @click="state.isChangePassword = !state.isChangePassword">
                            <FormCheckbox id="change_password" :value="state.isChangePassword" />
                            {{ $t('employees.form.changePassword') }}
                        </div>
                    </div>
                    <div class="space-y-1" v-if="state.isChangePassword">
                        <FormLabel for="password" :label="$t('employees.form.password')" />
                        <FormPasswordField id="password" name="password"
                            v-model="state.formEmployee.password" />
                        <FormError :error="v$?.formEmployee?.password?.$errors[0]?.$message.toString()" />
                        <FormError :error="state?.error?.errors?.password?.[0]" />
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1" ref="phoneField">
                        <FormLabel for="phone" :label="$t('employees.form.phone')" />
                        <FormTextField id="phone" name="phone"
                            v-model="state.formEmployee.phone" />
                        <FormError :error="v$?.formEmployee?.phone?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.phone?.[0]" />
                        <div class="pt-4 space-y-1">
                            <FormLabel for="union_membership" :label="$t('employees.form.unionMembership')" />
                            <FormTextField id="union_membership" name="union_membership"
                                :placeholder="$t('employees.form.unionMembershipPlaceholder')"
                                v-model="state.formEmployee.union_membership" />
                        </div>
                        <div class="pt-4 space-y-1">
                            <FormLabel for="note" :label="$t('employees.form.note')" />
                            <FormTextArea id="note" name="note" :rows="3"
                                :placeholder="$t('employees.form.notePlaceholder')"
                                v-model="state.formEmployee.note" />
                        </div>
                    </div>
                    <div class="space-y-1" ref="birthdayField">
                        <FormLabel for="birthday" :label="$t('employees.form.birthday')" />
                        <FormDateField id="birthday" name="birthday"
                            v-model="state.formEmployee.birthday" />
                        <FormError :error="v$?.formEmployee?.birthday?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.birthday?.[0]" />
                    </div>
                </div>
                <div class="space-y-1">
                    <FormLabel for="seniority_date" :label="$t('employees.form.seniorityDate')" />
                    <FormDateField id="seniority_date" name="seniority_date" v-model="state.formEmployee.seniority_date" />
                    <FormError :error="v$?.formEmployee?.seniority_date?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.seniority_date?.[0]" />
                </div>
                <div class="grid grid-cols-1 gap-3" :class="[
                    isAtLeast('Admin') && 'md:grid-cols-2'
                ]">
                    <div class="space-y-1">
                        <div class="flex justify-between items-center py-0.5">
                            <FormLabel for="departments"
                                :label="customPagesStore.getCustomPagesName?.department ?? $t('employees.form.department')" />
                            <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                                @click="state.modal.isAddDepartmentOpen = true">
                                {{ $t('departments.addNewDepartment') }}
                            </span>
                        </div>
                        <FormSelectMultiple id="departments" :options="state.options.departments"
                            v-model="state.formEmployee.departments" />
                        <FormError :error="v$?.formEmployee?.departments?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.department_uuid?.[0]" />
                    </div>
                    <div class="space-y-1" ref="roleField" v-if="isAtLeast('Admin')">
                        <div class="flex justify-between items-center py-0.5">
                            <FormLabel for="roles" :label="$t('employees.form.role')" />
                            <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                                @click="state.modal.isAddRoleOpen = true">
                                {{ $t('roles.addNewRole') }}
                            </span>
                        </div>
                        <FormSelectMultiple id="roles" name="roles" :options="state.options.roleOptions"
                            v-model="state.formEmployee.roles" />
                        <FormError :error="props?.error?.errors?.roles?.[0]" />
                    </div>
                </div>
                <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div class="space-y-1">
                        <FormLabel for="spoken_languages" :label="$t('employees.form.spokenLanguages')" />
                        <FormSelectMultiple id="spoken_languages" :options="state.options.spokenLanguages"
                            v-model="state.formEmployee.spoken_languages" />
                        <p class="text-xs text-gray-500">
                            {{ $t('employees.form.spokenLanguagesDescription') }}
                        </p>
                        <FormError :error="props?.error?.errors?.spoken_languages_uuid?.[0]" />
                    </div>
                    <div class="space-y-1" v-if="state.formEmployee.spoken_languages?.length > 0">
                        <FormLabel for="primary_spoken_language" :label="$t('employees.form.motherTongue')" />
                        <FormSelect id="primary_spoken_language" :options="selectedSpokenLanguageOptions"
                            v-model="state.formEmployee.primary_spoken_language" />
                        <FormError :error="props?.error?.errors?.primary_spoken_language_uuid?.[0]" />
                    </div>
                </div>
                <div class="space-y-1" ref="streetField">
                    <FormLabel for="street" :label="$t('employees.form.street')" />
                    <FormTextField id="street" name="street"
                        v-model="state.formEmployee.street" />
                    <FormError :error="v$?.formEmployee?.street?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.street?.[0]" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1" ref="regionField">
                        <FormLabel for="region" :label="$t('employees.form.region')" />
                        <FormSelect id="region" :options="state.options.regions"
                            v-model="state.formEmployee.region_uuid" @change="changeSelectedRegion" />
                        <FormError :error="v$?.formEmployee?.region_uuid?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.region_uuid?.[0]" />
                    </div>
                    <div class="space-y-1" ref="municipalityField">
                        <FormLabel for="municipality" :label="$t('employees.form.municipality')" />
                        <FormSelect id="municipality" :options="state.options.municipalities"
                            v-model="state.formEmployee.municipality_uuid" @change="changeSelectedMunicipality" />
                        <FormError :error="v$?.formEmployee?.municipality_uuid?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.municipality_uuid?.[0]" />
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1" ref="cityField">
                        <FormLabel for="city" :label="$t('employees.form.city')" />
                        <FormTextField id="city" name="city"
                            v-model="state.formEmployee.city" />
                        <FormError :error="v$?.formEmployee?.city?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.city?.[0]" />
                    </div>
                    <div class="space-y-1" ref="postCodeField">
                        <FormLabel for="post_code" :label="$t('employees.form.postCode')" />
                        <FormTextField id="post_code" name="post_code"
                            v-model="state.formEmployee.post_code" />
                        <FormError :error="v$?.formEmployee?.post_code?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.post_code?.[0]" />
                    </div>
                </div>
                <div class="space-y-1" v-if="isAtLeast('Admin')">
                    <div class="flex items-center gap-x-2">
                        <p class="text-sm text-gray-600">
                            {{ $t('employees.form.mediaRisks.mediaRisks') }}
                        </p>
                        <div class="flex items-center cursor-help"
                            @click="state.modal.isShowMediaRiskExplainationOpen = true">
                            <Icon name="ph:question" class="size-4 cursor-pointer text-gray-700" aria-hidden="true" />
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        <div class="w-fit flex items-center cursor-pointer"
                            v-for="(mediaRisk, index) in state.options.media_risks" :key="index"
                            @click="toggleMediaRiskCheckbox(mediaRisk?.uuid)">
                            <FormCheckbox :id="mediaRisk?.uuid"
                                :value="checkIfMediaRiskUuidIsChecked(mediaRisk?.uuid)" />
                            <span v-if="mediaRisk?.type === 'Incident report'">
                                {{ $t('employees.form.mediaRisks.incidentReport') }}
                            </span>
                            <span v-if="mediaRisk?.type === 'Medicine deviation'">
                                {{ $t('employees.form.mediaRisks.medicineDeviation') }}
                            </span>
                            <span v-if="mediaRisk?.type === 'Use of force'">
                                {{ $t('employees.form.mediaRisks.useOfForce') }}
                            </span>
                        </div>
                    </div>
                    <FormError :error="props?.error?.errors?.media_risk?.[0]" />
                </div>
                <div class="space-y-1" v-if="isAtLeast('Admin')">
                    <p class="text-sm text-gray-600">
                        {{ $t('employees.form.permissions.permissions') }}
                    </p>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        <div class="w-fit flex items-center cursor-pointer" @click="changePermissionRead()">
                            <FormCheckbox id="permissions_read" :value="state.permissions.read" />
                            {{ $t('employees.form.permissions.read') }}
                        </div>
                        <div class="w-fit flex items-center cursor-pointer" @click="changePermissionCreate()">
                            <FormCheckbox id="permissions_create" :value="state.permissions.create" />
                            {{ $t('employees.form.permissions.create') }}
                        </div>
                        <div class="w-fit flex items-center cursor-pointer" @click="changePermissionUpdate()">
                            <FormCheckbox id="permissions_update" :value="state.permissions.update" />
                            {{ $t('employees.form.permissions.update') }}
                        </div>
                        <div class="w-fit flex items-center cursor-pointer" @click="changePermissionDelete()">
                            <FormCheckbox id="permissions_delete" :value="state.permissions.delete" />
                            {{ $t('employees.form.permissions.delete') }}
                        </div>
                    </div>
                    <FormError :error="props?.error?.errors?.permission?.[0]" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 py-2">
                    <div class="space-y-1" v-if="!state.formEmployee?.roles?.includes('Admin')">
                        <div class="w-fit flex items-center cursor-pointer"
                            @click="state.formEmployee.show_working_hours = !state.formEmployee.show_working_hours">
                            <FormCheckbox id="show_working_hours" :value="state.formEmployee.show_working_hours" />
                            {{ $t('employees.form.showWorkingHours') }}
                        </div>
                    </div>
                </div>
                <div class="space-y-1"
                    v-if="!state.formEmployee?.roles?.includes('Admin') && state.formEmployee.show_working_hours">
                    <div class="w-fit flex items-center cursor-pointer"
                        @click="state.formEmployee.show_compensatory_hours = !state.formEmployee.show_compensatory_hours">
                        <FormCheckbox id="show_compensatory_hours"
                            :value="state.formEmployee.show_compensatory_hours" />
                        {{ $t('employees.form.showCompensatoryHours') }}
                    </div>
                </div>
                <div class="space-y-1" v-if="isAtLeast('Admin')">
                    <FormLabel for="pages" :label="$t('employees.form.pageAccess')" />
                    <FormSelectMultiple id="pages" :options="state.options.pages" v-model="state.formEmployee.pages" />
                    <FormError :error="v$?.formEmployee?.pages?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.page_uuid?.[0]" />
                </div>
        </FormSection>
        <FormSection :title="$t('employees.form.header.employmentInformation')" :description="$t('employees.form.header.comprehensiveEmploymentDetailsWithinTheOrganization')">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3" v-if="isAtLeast('Admin')">
                    <div class="space-y-1 col-span-1 md:col-span-2" ref="salaryIDField">
                        <FormLabel for="salary_id" :label="$t('employees.form.employment.salaryID')" />
                        <FormTextField id="salary_id" name="salary_id"
                            v-model="state.formEmployee.employment.salary_id" />
                        <FormError
                            :error="v$?.formEmployee?.employment?.annual_norm_hours?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.annual_norm_hours?.[0]" />
                    </div>
                    <div class="space-y-1" ref="employmentDateField">
                        <FormLabel for="employment_date" :label="$t('employees.form.employment.employmentDate')" />
                        <FormDateField id="employment_date" name="employment_date"
                            v-model="state.formEmployee.employment.employment_date" />
                        <FormError
                            :error="v$?.formEmployee?.employment?.employment_date?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.employment_date?.[0]" />
                    </div>
                    <div class="space-y-1" ref="terminationDateField">
                        <FormLabel for="termination_date" :label="$t('employees.form.employment.terminationDate')" />
                        <FormDateField id="termination_date" name="termination_date"
                            v-model="state.formEmployee.employment.termination_date" />
                        <FormError
                            :error="v$?.formEmployee?.employment?.termination_date?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.termination_date?.[0]" />
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1" ref="annualNormHoursField" v-if="isAtLeast('Admin')">
                        <div class="flex items-center gap-x-1">
                            <FormLabel for="annual_norm_hours"
                                :label="$t('employees.form.employment.annualNormHours')" />
                            <Icon name="ph:question" class="size-4 cursor-pointer text-gray-700" aria-hidden="true"
                                @click="state.modal.isAnnualNormHoursInfoOpen = true" />
                        </div>
                        <!-- Hourly-paid staff have no annual norm to be measured against;
                             ticking this leaves the norm figures out of their schedule
                             entirely instead of showing them a norm of nothing. -->
                        <div class="w-fit flex items-center cursor-pointer gap-x-1 text-sm"
                            @click="state.formEmployee.employment.annual_norm_hours_disabled = !state.formEmployee.employment.annual_norm_hours_disabled">
                            <FormCheckbox id="annual_norm_hours_disabled"
                                :value="state.formEmployee.employment.annual_norm_hours_disabled" />
                            {{ $t('employees.form.employment.annualNormHoursNotUsed') }}
                        </div>
                        <FormTextField id="annual_norm_hours" name="annual_norm_hours" @input="onYearlyInput"
                            v-if="!state.formEmployee.employment.annual_norm_hours_disabled"
                            v-model="state.formEmployee.employment.annual_norm_hours" />
                        <FormError
                            :error="v$?.formEmployee?.employment?.annual_norm_hours?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.annual_norm_hours?.[0]" />
                        <FormError :error="state?.error?.errors?.annual_norm_hours?.[0]" />
                    </div>
                    <div class="space-y-1" ref="weeklyNormHoursField" v-if="isAtLeast('Admin')">
                        <div class="flex items-center gap-x-1">
                            <FormLabel for="weekly_norm_hours"
                                :label="$t('employees.form.employment.weeklyNormHours')" />
                            <Icon name="ph:question" class="size-4 cursor-pointer text-gray-700" aria-hidden="true"
                                @click="state.modal.isAnnualNormHoursInfoOpen = true" />
                        </div>
                        <FormTextField id="weekly_norm_hours" name="weekly_norm_hours" @input="onWeeklyInput"
                            v-model="state.formEmployee.employment.weekly_norm_hours" />
                        <FormError
                            :error="v$?.formEmployee?.employment?.weekly_norm_hours?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.weekly_norm_hours?.[0]" />
                        <FormError :error="state?.error?.errors?.weekly_norm_hours?.[0]" />
                    </div>
                    <div id="norm_period_uuid" class="space-y-1">
                        <div class="flex justify-between items-center py-0.5">
                            <FormLabel for="norm_period_uuid" :label="$t('normPeriod.form.normPeriod')" />
                            <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                                @click="state.modal.isAddNewNormPeriod = true">
                                {{ $t('normPeriod.addCustomNormPeriod') }}
                            </span>
                        </div>
                        <FormSelect id="norm_period_uuid" name="norm_period_uuid"
                            :placeholder="$t('normPeriod.form.normPeriod')" :options="state.options.normPeriods"
                            v-model="state.formEmployee.employment.norm_period_uuid" />
                        <FormError
                            :error="v$?.formEmployee?.employment?.norm_period_uuid?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.norm_period_uuid?.[0]" />
                    </div>
                    <div class="space-y-1" ref="vacationDaysField" v-if="isAtLeast('Admin')">
                        <FormLabel for="vacation_days" :label="$t('employees.form.employment.vacationDays')" />
                        <FormTextField id="vacation_days" name="vacation_days"
                            v-model="state.formEmployee.employment.vacation_days" />
                        <FormError
                            :error="v$?.formEmployee?.employment?.vacation_days?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.vacation_days?.[0]" />
                    </div>
                    <div class="space-y-1" ref="hourlyRateField"
                        v-if="isAtLeast('Admin') && userStore.getUser?.is_extended_duty_schedule_active">
                        <FormLabel for="hourly_rate" :label="$t('employees.form.employment.hourlyRate')" />
                        <FormTextField id="hourly_rate" name="hourly_rate"
                            v-model="state.formEmployee.employment.hourly_rate" />
                        <FormError
                            :error="v$?.formEmployee?.employment?.hourly_rate?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.hourly_rate?.[0]" />
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <div class="flex justify-between items-center py-0.5" ref="jobTitleField">
                            <FormLabel for="job_title_uuid" :label="$t('employees.form.employment.jobTitle')" />
                            <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                                @click="state.modal.isAddJobTitleOpen = true">
                                {{ $t('jobTitles.addNewJobTitle') }}
                            </span>
                        </div>
                        <FormSelect id="job_title_uuid" :options="state.options.jobTitles"
                            v-model="state.formEmployee.employment.job_title_uuid" @change="changeJobTitle" />
                        <FormError
                            :error="v$?.formEmployee?.employment?.job_title_uuid?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.employment?.job_title_uuid?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <div class="flex justify-between items-center py-0.5">
                            <FormLabel for="job_specialties"
                                :label="$t('dutySchedules.scheduleSlots.form.jobSpecialty')" />
                            <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                                @click="state.modal.isAddJobSpecialtyOpen = true">
                                {{ $t('jobSpecialties.addNewJobSpecialty') }}
                            </span>
                        </div>
                        <FormSelectMultiple id="job_specialties" name="job_specialties"
                            :options="state.options.jobSpecialties"
                            v-model="state.formEmployee.employment.job_specialties" />
                        <FormError
                            :error="v$?.formEmployee?.employment?.job_specialties?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.job_specialties?.[0]" />
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1" ref="workingHoursField" v-if="isAtLeast('Admin')">
                        <FormLabel for="working_hours" :label="$t('employees.form.employment.workingHours')" />
                        <FormSelect id="working_hours" :options="state.options.working_hours"
                            v-model="state.formEmployee.employment.working_hours" />
                        <FormError
                            :error="v$?.formEmployee?.employment?.working_hours?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.working_hours?.[0]" />
                    </div>
                    <div class="space-y-1" ref="employmentStatusField" v-if="isAtLeast('Admin')">
                        <FormLabel for="employment_status" :label="$t('employees.form.employment.employmentStatus')" />
                        <FormSelect id="employment_status" :options="state.options.employment_status"
                            v-model="state.formEmployee.employment.employment_status" />
                        <FormError
                            :error="v$?.formEmployee?.employment?.employment_status?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.employment_status?.[0]" />
                    </div>
                </div>
        </FormSection>
        <FormSection :title="$t('employees.form.header.emergencyInfo')" :description="$t('employees.form.header.emergencyContactDetailsInCaseOfAnUrgentSituation')" bare>
            <div class="grid grid-cols-1  gap-y-3">
                    <div ref="trusteesField">
                        <p class="text-sm text-gray-600 font-semibold leading-5">
                            {{ $t('employees.form.emergencyInfo.trustees') }}
                        </p>
                        <div class="mt-5">
                            <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8"
                                v-if="state.formEmployee.emergencyInfo.trustees.length === 0">
                                <div class="mx-auto max-w-md">
                                    <FormButton buttonStyle="primary" @click="addTrustee" class="w-full">
                                        {{ $t('employees.form.emergencyInfo.addTrustee') }}
                                    </FormButton>
                                </div>
                            </div>
                            <div v-else class="space-y-6">
                                <div v-for="(trustee, index) in state.formEmployee.emergencyInfo.trustees" :key="index"
                                    class="relative">
                                    <div
                                        class="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8">
                                        <div class="space-y-1">
                                            <FormLabel :for="`trustee_name_${index}`"
                                                :label="$t('employees.form.emergencyInfo.name')" />
                                            <FormTextField :id="`trustee_name_${index}`" name="trustee_name" :value="trustee.name"
                                                @keyup="(event: any) => state.formEmployee.emergencyInfo.trustees[index].name = event.target.value" />
                                            <FormError :error="trusteeError(index, 'name')" />
                                        </div>
                                        <div class="space-y-1">
                                            <FormLabel :for="`trustee_phone_${index}`"
                                                :label="$t('employees.form.emergencyInfo.phone')" />
                                            <FormTextField :id="`trustee_phone_${index}`" name="trustee_phone"
                                                :value="trustee.phone"
                                                @keyup="(event: any) => state.formEmployee.emergencyInfo.trustees[index].phone = event.target.value" />
                                            <FormError :error="trusteeError(index, 'phone')" />
                                        </div>
                                        <div class="space-y-1">
                                            <FormLabel :for="`trustee_email_${index}`"
                                                :label="$t('employees.form.emergencyInfo.email')" />
                                            <FormTextField :for="`trustee_email_${index}`" name="trustee_email"
                                                :value="trustee.email"
                                                @keyup="(event: any) => state.formEmployee.emergencyInfo.trustees[index].email = event.target.value" />
                                            <FormError :error="trusteeError(index, 'email')" />
                                        </div>
                                    </div>
                                    <button type="button"
                                        class="absolute -top-3 -right-3 bg-red-700 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center"
                                        @click="removeTrustee(index)">
                                        <Icon name="ph:trash" class="h-4 w-4 text-white" aria-hidden="true" />
                                    </button>
                                    <button type="button"
                                        class="absolute -bottom-4 inset-x-1/2 shadow-md bg-secondary hover:bg-secondary-800 rounded-full w-8 h-8 flex items-center justify-center"
                                        @click="addTrustee()"
                                        v-if="index === state.formEmployee.emergencyInfo.trustees.length - 1">
                                        <Icon name="ph:plus" class="h-4 w-4 text-white" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:col-span-2 gap-y-3 mt-5" ref="emergencyContactsField">
                        <p class="text-sm text-gray-600 font-semibold leading-5">
                            {{ $t('employees.form.emergencyInfo.emergencyContacts') }}
                        </p>
                        <div class="mt-5">
                            <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8"
                                v-if="state.formEmployee.emergencyInfo.emergency_contacts.length === 0">
                                <div class="mx-auto max-w-md">
                                    <FormButton buttonStyle="primary" @click="addEmergencyContact" class="w-full">
                                        {{ $t('employees.form.emergencyInfo.addEmergencyContactPerson') }}
                                    </FormButton>
                                </div>
                            </div>
                            <div v-else class="space-y-6">
                                <div v-for="(emergency_contact, index) in state.formEmployee.emergencyInfo.emergency_contacts"
                                    :key="index" class="relative">
                                    <div
                                        class="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8">
                                        <div class="space-y-1">
                                            <FormLabel :for="`emergency_contact_name_${index}`"
                                                :label="$t('employees.form.emergencyInfo.name')" />
                                            <FormTextField id="emergency_contact_name" name="emergency_contact_name"
                                                :value="emergency_contact.name"
                                                @keyup="(event: any) => state.formEmployee.emergencyInfo.emergency_contacts[index].name = event.target.value" />
                                            <FormError :error="emergencyContactError(index, 'name')" />
                                        </div>
                                        <div class="space-y-1">
                                            <FormLabel :for="`emergency_contact_phone_${index}`"
                                                :label="$t('employees.form.emergencyInfo.phone')" />
                                            <FormTextField :id="`emergency_contact_phone_${index}`"
                                                name="emergency_contact_phone"
                                                :value="emergency_contact.phone"
                                                @keyup="(event: any) => state.formEmployee.emergencyInfo.emergency_contacts[index].phone = event.target.value" />
                                            <FormError :error="emergencyContactError(index, 'phone')" />
                                        </div>
                                        <div class="space-y-1">
                                            <FormLabel :for="`emergency_contact_email_${index}`"
                                                :label="$t('employees.form.emergencyInfo.email')" />
                                            <FormTextField :id="`emergency_contact_email_${index}`"
                                                name="emergency_contact_email"
                                                :value="emergency_contact.email"
                                                @keyup="(event: any) => state.formEmployee.emergencyInfo.emergency_contacts[index].email = event.target.value" />
                                            <FormError :error="emergencyContactError(index, 'email')" />
                                        </div>
                                        <div class="space-y-1">
                                            <FormLabel :for="`emergency_contact_relation_${index}`"
                                                :label="$t('employees.form.emergencyInfo.relation')" />
                                            <FormTextField :id="`emergency_contact_relation_${index}`"
                                                name="emergency_contact_relation"
                                                :value="emergency_contact.relation"
                                                @keyup="(event: any) => state.formEmployee.emergencyInfo.emergency_contacts[index].relation = event.target.value" />
                                            <FormError :error="emergencyContactError(index, 'relation')" />
                                        </div>
                                    </div>
                                    <button type="button"
                                        class="absolute -top-3 -right-3 bg-red-700 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center"
                                        @click="removeEmergencyContact(index)">
                                        <Icon name="ph:trash" class="h-4 w-4 text-white" aria-hidden="true" />
                                    </button>
                                    <button type="button"
                                        class="absolute -bottom-4 inset-x-1/2 shadow-md bg-secondary hover:bg-secondary-800 rounded-full w-8 h-8 flex items-center justify-center"
                                        @click="addEmergencyContact()"
                                        v-if="index === state.formEmployee.emergencyInfo.emergency_contacts.length - 1">
                                        <Icon name="ph:plus" class="h-4 w-4 text-white" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>
        </FormSection>
        <!-- Follows the reader, so saving never means scrolling to the bottom. -->
        <div class="sticky bottom-0 z-20 -mx-4 mt-8 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur
            sm:mx-0 sm:rounded-lg sm:px-6">
            <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                <FormButton type="button" buttonStyle="cancel" class="sm:w-auto sm:px-8"
                    @click="navigateTo(router?.currentRoute?.value?.name === 'employees-employee_uuid-edit' ? `/employees` : `/employees/${employeeUuid}/view-details`)">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
        <ModulesUserEmployeeModalMediaRiskExplanation :isModalOpen="state.modal.isShowMediaRiskExplainationOpen"
            @close="state.modal.isShowMediaRiskExplainationOpen = false" />
        <ModulesUserDepartmentModalNew :isModalOpen="state.modal.isAddDepartmentOpen"
            @close="state.modal.isAddDepartmentOpen = false" @refreshDepartments="fetchDepartments" />
        <ModulesUserRoleModalNew :isModalOpen="state.modal.isAddRoleOpen" @close="state.modal.isAddRoleOpen = false"
            @refreshRoles="fetchRoles" />
        <ModulesUserJobTitleModalNew :isModalOpen="state.modal.isAddJobTitleOpen"
            @close="state.modal.isAddJobTitleOpen = false" @refreshJobTitles="fetchJobTitles" />
        <ModulesUserJobSpecialtyModalNew :isModalOpen="state.modal.isAddJobSpecialtyOpen"
            @close="state.modal.isAddJobSpecialtyOpen = false" @refreshJobTitles="fetchJobTitles"
            @refreshJobSpecialty="fetchJobSpecialties($event)" />
        <ModulesUserDutyScheduleNormHoursModalInfo :isModalOpen="state.modal.isAnnualNormHoursInfoOpen"
            @close="state.modal.isAnnualNormHoursInfoOpen = false" />
        <ModulesUserEmployeeModalNormPeriod :isModalOpen="state.modal.isAddNewNormPeriod"
            @close="state.modal.isAddNewNormPeriod = false" @refreshNormPeriods="fetchNormPeriods" />
    </form>
</template>

<script setup lang="ts">
import { employmentOptionService } from '@/components/api/user/EmploymentOptionService'
import { jobTitleService } from '@/components/api/user/JobTitleService'
import { jobSpecialtyService } from '@/components/api/user/JobSpecialtyService'
import { departmentService } from '@/components/api/user/DepartmentService'
import { roleService } from '@/components/api/user/RoleService'
import { pageService } from '@/components/api/user/PageService'
import { regionService } from '@/components/api/user/RegionService'
import { municipalityService } from '@/components/api/user/MunicipalityService'
import { cityService } from '@/components/api/user/CityService'
import { mediaRiskService } from '@/components/api/user/MediaRiskService'
import { normPeriodService } from '@/components/api/user/NormPeriodService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import { usePermissions } from '@/composables/usePermissions'
import { useSpokenLanguages } from '@/composables/useSpokenLanguages'
import type { EmployeeForm, Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedEmployee: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])
const customPagesStore = useCustomPagesStore() as any
const router = useRouter()
const employeeUuid = router?.currentRoute?.value?.params?.employee_uuid
const userStore = useUserStore() as any
const { isAtLeast, can } = usePermissions()
const image = ref<HTMLInputElement | null>(null)
const avatarUrl = ref('/img/avatars/user.svg')
const { errorAlert } = useAlert()
const { t } = useI18n()
const language = useI18n()
const { fetchOptions: fetchSpokenLanguageOptions } = useSpokenLanguages()
const firstnameField = ref<HTMLElement | null>(null)
const lastnameField = ref<HTMLElement | null>(null)
const emailField = ref<HTMLElement | null>(null)
const passwordField = ref<HTMLElement | null>(null)
const phoneField = ref<HTMLElement | null>(null)
const birthdayField = ref<HTMLElement | null>(null)
const roleField = ref<HTMLElement | null>(null)
const streetField = ref<HTMLElement | null>(null)
const regionField = ref<HTMLElement | null>(null)
const municipalityField = ref<HTMLElement | null>(null)
const cityField = ref<HTMLElement | null>(null)
const postCodeField = ref<HTMLElement | null>(null)
const salaryIDField = ref<HTMLElement | null>(null)
const employmentDateField = ref<HTMLElement | null>(null)
const terminationDateField = ref<HTMLElement | null>(null)
const annualNormHoursField = ref<HTMLElement | null>(null)
const vacationDaysField = ref<HTMLElement | null>(null)
const jobTitleField = ref<HTMLElement | null>(null)
const workingHoursField = ref<HTMLElement | null>(null)
const employmentStatusField = ref<HTMLElement | null>(null)

const state = reactive({
    error: {} as Error,
    formEmployee: {
        profile_image: '',
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        phone: '',
        note: '',
        union_membership: '',
        birthday: '',
        seniority_date: '',
        departments: [],
        roles: [] as string[],
        street: '',
        region_uuid: '',
        municipality_uuid: '',
        city: '',
        post_code: '',
        permissions: [],
        media_risks: [],
        pages: [],
        spoken_languages: [],
        primary_spoken_language: '',
        employment: {
            salary_id: '',
            employment_date: '',
            termination_date: '',
            job_title_uuid: '',
            job_specialties: [],
            working_hours: '',
            employment_status: '',
            annual_norm_hours: '',
            annual_norm_hours_disabled: false,
            weekly_norm_hours: '',
            vacation_days: '',
            norm_period_uuid: '',
            hourly_rate: '',
        },
        emergencyInfo: {
            emergency_contacts: [],
            trustees: [],
        },
        show_working_hours: false,
        show_compensatory_hours: false,
        do_not_count_sick_leave: false,
    } as EmployeeForm,
    isChangePassword: false,
    modal: {
        isAddDepartmentOpen: false,
        isAddJobSpecialtyOpen: false,
        isAddJobTitleOpen: false,
        isAddRoleOpen: false,
        isShowMediaRiskExplainationOpen: false,
        isAnnualNormHoursInfoOpen: false,
        isAddNewNormPeriod: false,
    },
    permissions: {
        read: false,
        create: false,
        update: false,
        delete: false,
    },
    options: {
        cities: [],
        departments: [],
        // Seeded with the built-in options so the form is usable before the
        // company's own additions arrive; fetchEmploymentOptions() replaces both
        // lists with system + company entries.
        employment_status: [
            { value: 'permanent', label: `${t('employees.employmentStatus.permanent')}` },
            { value: 'temporary', label: `${t('employees.employmentStatus.temporary')}` },
            { value: 'substitute', label: `${t('employees.employmentStatus.substitute')}` },
        ],
        jobSpecialties: [],
        jobTitles: [],
        spokenLanguages: [] as any,
        media_risks: [] as any,
        municipalities: [],
        pages: [],
        regions: [],
        roleOptions: [],
        working_hours: [
            { value: 'full_time', label: `${t('employees.workingHours.fulltime')}` },
            { value: 'part_time', label: `${t('employees.workingHours.parttime')}` },
        ],
        normPeriods: [] as any[],
    },
    normPeriodDetailsByUuid: {} as Record<string, { calculated_annual_standard_hours: number }>,
})

const isPopulatingEmployee = ref(false)

const DEFAULT_ANNUAL_STANDARD_HOURS = '1924'

// Danish (and other non-English) number conventions use a comma as the decimal
// separator. Annual Standard Hours can carry a fraction (e.g. 1122.31 for a
// custom norm period), so the raw API/JS value needs converting before it's
// shown in this locale-aware editable field.
function localizeDecimalSeparator(value: number | string | null | undefined) {
    if (value === null || value === undefined || value === '') {
        return value
    }
    return language.locale.value !== 'en' ? String(value).replace('.', ',') : String(value)
}

watch(() => language.locale.value, (newValue: any) => {
    if (newValue != null) {
        state.options.employment_status = [
            { value: 'permanent', label: `${t('employees.employmentStatus.permanent')}` },
            { value: 'temporary', label: `${t('employees.employmentStatus.temporary')}` },
            { value: 'substitute', label: `${t('employees.employmentStatus.substitute')}` },
        ]
        state.options.working_hours = [
            { value: 'full_time', label: `${t('employees.workingHours.fulltime')}` },
            { value: 'part_time', label: `${t('employees.workingHours.parttime')}` },
        ]
        // Relabelling the built-in options above drops the company's own entries,
        // and this watcher also fires on the initial locale sync - which is what
        // wiped them straight after the first fetch. Put them back.
        fetchEmploymentOptions()
        // Language names are Danish or English depending on the locale, so relabel.
        fetchSpokenLanguages()
    }
})

// The mother tongue can only be one of the languages actually selected.
const selectedSpokenLanguageOptions = computed(() =>
    state.options.spokenLanguages.filter((option: any) =>
        state.formEmployee.spoken_languages?.includes(option.value)
    )
)

// Deselecting a language that was the mother tongue would otherwise leave a
// dangling uuid that the backend silently drops on save.
watch(() => state.formEmployee.spoken_languages, (languages: any) => {
    if (state.formEmployee.primary_spoken_language && !languages?.includes(state.formEmployee.primary_spoken_language)) {
        state.formEmployee.primary_spoken_language = ''
    }
}, { deep: true })

watch(() => props.selectedEmployee, (newValue: any) => {
    if (newValue != null) {
        isPopulatingEmployee.value = true
        if (newValue.employment.job_title_uuid) {
            fetchJobSpecialties(newValue.employment.job_title_uuid)
        }
        if (newValue.profile_image) {
            avatarUrl.value = newValue.profile_image
        }
        state.formEmployee = {
            profile_image: '',
            firstname: newValue.firstname,
            lastname: newValue.lastname,
            email: newValue.email,
            password: '',
            phone: newValue.phone,
            note: newValue.note ?? '',
            union_membership: newValue.union_membership ?? '',
            birthday: newValue.birthday,
            seniority_date: newValue.seniority_date,
            departments: newValue.departments,
            roles: newValue.roles ?? [],
            street: newValue.street,
            region_uuid: newValue.region_uuid,
            municipality_uuid: newValue.municipality_uuid,
            city: newValue.city,
            post_code: newValue.post_code,
            permissions: [],
            media_risks: newValue.media_risks,
            pages: newValue.pages,
            spoken_languages: newValue.spoken_languages ?? [],
            primary_spoken_language: newValue.primary_spoken_language ?? '',
            emergencyInfo: {
                emergency_contacts: newValue.emergencyInfo.emergency_contacts,
                trustees: newValue.emergencyInfo.trustees,
            },
            employment: {
                salary_id: newValue.employment.salary_id,
                employment_date: newValue.employment.employment_date,
                termination_date: newValue.employment.termination_date,
                job_title_uuid: newValue.employment.job_title_uuid,
                job_specialties: newValue.employment.job_specialties,
                working_hours: newValue.employment.working_hours,
                employment_status: newValue.employment.employment_status,
                annual_norm_hours: localizeDecimalSeparator(newValue.employment.annual_norm_hours),
                annual_norm_hours_disabled: newValue.employment.annual_norm_hours_disabled ?? false,
                weekly_norm_hours: newValue.employment.annual_norm_hours
                    ? Math.round(Number(newValue.employment.annual_norm_hours) / 52)
                    : '',
                vacation_days: newValue.employment.vacation_days,
                norm_period_uuid: newValue.employment?.norm_period_uuid || 'default',
                hourly_rate: newValue.employment.hourly_rate ?? '',
            },
            show_working_hours: newValue.show_working_hours,
            show_compensatory_hours: newValue.show_compensatory_hours ?? false,
            do_not_count_sick_leave: newValue.do_not_count_sick_leave,
        }
        fetchMunicipalitiesPerRegion(newValue.region_uuid)
        fetchCities(newValue.municipality_uuid)
        newValue?.permissions.forEach((permission: any) => {
            if (permission?.name === 'read') {
                state.permissions.read = true
                state.formEmployee.permissions.push("read")
            } else if (permission?.name === 'create') {
                state.permissions.create = true
                state.formEmployee.permissions.push("create")
            } else if (permission?.name === 'update') {
                state.permissions.update = true
                state.formEmployee.permissions.push("update")
            } else if (permission?.name === 'delete') {
                state.permissions.delete = true
                state.formEmployee.permissions.push("delete")
            }
        })
        nextTick(() => {
            isPopulatingEmployee.value = false
        })
    }
})

watch(() => state.formEmployee.employment.norm_period_uuid, (newUuid: any, oldUuid: any) => {
    if (!newUuid || newUuid === oldUuid) {
        return
    }
    if (isPopulatingEmployee.value && state.formEmployee.employment.annual_norm_hours) {
        return
    }
    if (newUuid === 'default') {
        state.formEmployee.employment.annual_norm_hours = DEFAULT_ANNUAL_STANDARD_HOURS
        return
    }
    const calculatedAnnualHours = state.normPeriodDetailsByUuid[newUuid]?.calculated_annual_standard_hours
    if (calculatedAnnualHours != null) {
        state.formEmployee.employment.annual_norm_hours = localizeDecimalSeparator(calculatedAnnualHours)
    }
})

const rules = computed(() => {
    if (state.isChangePassword) {
        return {
            formEmployee: {
                firstname: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
                password: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    } else {
        return {
            formEmployee: {
                firstname: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const hasSubmittedEmergencyContacts = ref(false)
const emergencyContactsField = ref<HTMLElement | null>(null)

function emergencyContactError(index: number, field: 'name' | 'phone' | 'email' | 'relation') {
    if (!hasSubmittedEmergencyContacts.value) {
        return ''
    }
    const contact = state.formEmployee.emergencyInfo.emergency_contacts[index] as any
    const value = contact?.[field]
    if (field === 'email') {
        if (value && !EMAIL_REGEX.test(value)) {
            return `${t('validation.invalidEmailAddress')}.`
        }
        return ''
    }
    if (!value) {
        return `${t('validation.thisFieldIsRequired')}.`
    }
    return ''
}

function hasEmergencyContactErrors() {
    return state.formEmployee.emergencyInfo.emergency_contacts.some((contact: any) =>
        !contact?.name || !contact?.phone || !contact?.relation || (contact?.email && !EMAIL_REGEX.test(contact.email))
    )
}

const hasSubmittedTrustees = ref(false)
const trusteesField = ref<HTMLElement | null>(null)

function trusteeError(index: number, field: 'name' | 'phone' | 'email') {
    if (!hasSubmittedTrustees.value) {
        return ''
    }
    const trustee = state.formEmployee.emergencyInfo.trustees[index] as any
    const value = trustee?.[field]
    if (field === 'email') {
        if (value && !EMAIL_REGEX.test(value)) {
            return `${t('validation.invalidEmailAddress')}.`
        }
        return ''
    }
    if (!value) {
        return `${t('validation.thisFieldIsRequired')}.`
    }
    return ''
}

function hasTrusteeErrors() {
    return state.formEmployee.emergencyInfo.trustees.some((trustee: any) =>
        !trustee?.name || !trustee?.phone || (trustee?.email && !EMAIL_REGEX.test(trustee.email))
    )
}

/**
 * Both employment dropdowns: the built-in options (translated here, since the
 * API deliberately does not pin them to one language) followed by whatever the
 * company has added under Settings.
 */
const SYSTEM_OPTION_LABELS: Record<string, string> = {
    full_time: 'employees.workingHours.fulltime',
    part_time: 'employees.workingHours.parttime',
    permanent: 'employees.employmentStatus.permanent',
    temporary: 'employees.employmentStatus.temporary',
    substitute: 'employees.employmentStatus.substitute',
}

async function fetchEmploymentOptions() {
    try {
        const response = await employmentOptionService.getOptions()
        const data = response?.data

        if (!data) return

        const mapped = (entries: any[]) => (entries ?? []).map((entry: any) => ({
            value: entry.value,
            label: entry.is_system && SYSTEM_OPTION_LABELS[entry.value]
                ? t(SYSTEM_OPTION_LABELS[entry.value])
                : entry.label,
        }))

        if (data.working_hours?.length) state.options.working_hours = mapped(data.working_hours)
        if (data.employment_status?.length) state.options.employment_status = mapped(data.employment_status)
    } catch (_) {
        // The built-in options are already seeded, so the form stays usable.
    }
}

onMounted(() => {
    fetchMediaRisks()
    fetchSpokenLanguages()
    fetchDepartments()
    fetchRoles()
    fetchJobTitles()
    fetchPages()
    fetchRegions()
    fetchNormPeriods()
    fetchEmploymentOptions()
})

function triggerFileInput() {
    if (image.value) {
        image.value.click()
    }
}

function onFileChange(event: any) {
    const file = event.target.files[0]
    state.formEmployee.profile_image = event.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e: any) => {
            avatarUrl.value = e.target.result
        }
        reader.readAsDataURL(file)
    }
}

function addTrustee() {
    state.formEmployee.emergencyInfo.trustees.push({
        name: '',
        phone: '',
        email: '',
    })
}

function removeTrustee(index: number) {
    state.formEmployee.emergencyInfo.trustees.splice(index, 1)
}

function addEmergencyContact() {
    state.formEmployee.emergencyInfo.emergency_contacts.push({
        name: '',
        phone: '',
        email: '',
        relation: '',
    })
}

function removeEmergencyContact(index: number) {
    state.formEmployee.emergencyInfo.emergency_contacts.splice(index, 1)
}

async function fetchDepartments() {
    emit('isPageLoading', true)
    state.error = {}
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

async function fetchRoles() {
    emit('isPageLoading', true)
    state.error = {}
    try {
        const response = await roleService.getAllRoles()
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.name,
                    label: item.name,
                })
            )
            state.options.roleOptions = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchJobTitles() {
    emit('isPageLoading', true)
    state.error = {}
    try {
        const response = await jobTitleService.getAllJobTitles()
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.title,
                })
            )
            state.options.jobTitles = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

function changeJobTitle(jobTitleUuid: any) {
    if (jobTitleUuid) {
        fetchJobSpecialties(jobTitleUuid)
    }
}

async function fetchJobSpecialties(jobTitleUuid: any) {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {
            job_title_uuid: jobTitleUuid
        }
        const response = await jobSpecialtyService.getAllJobSpecialties(params)
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.title,
                })
            )
            state.options.jobSpecialties = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchPages() {
    emit('isPageLoading', true)
    state.error = {}
    try {
        const response = await pageService.getAllPages()
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.pages = options
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
            state.options.municipalities = options
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

async function fetchMediaRisks() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const response = await mediaRiskService.getMediaRisks()
        if (response) {
            state.options.media_risks = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

function checkIfMediaRiskUuidIsChecked(mediaRiskUuid: string) {
    return state.formEmployee.media_risks.includes(mediaRiskUuid)
}

function toggleMediaRiskCheckbox(mediaRisk: string) {
    if (state.formEmployee.media_risks.includes(mediaRisk)) {
        state.formEmployee.media_risks = state.formEmployee.media_risks.filter((media: string) => media !== mediaRisk);
    } else {
        state.formEmployee.media_risks.push(mediaRisk)
    }
}

function changeSelectedRegion(regionUuid: string) {
    fetchMunicipalitiesPerRegion(regionUuid)
}

function changeSelectedMunicipality(municipalityUuid: string) {
    fetchCities(municipalityUuid)
}

function submitForm() {
    v$.value.$validate()
    hasSubmittedTrustees.value = true
    if (hasTrusteeErrors() && trusteesField.value) {
        trusteesField.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        return
    }
    hasSubmittedEmergencyContacts.value = true
    if (hasEmergencyContactErrors() && emergencyContactsField.value) {
        emergencyContactsField.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        return
    }
    if (v$.value.$error) {
        // Check specific fields in the order you want
        if (v$.value.formEmployee.firstname?.$error && firstnameField.value) {
            firstnameField.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else if (v$.value.formEmployee.lastname?.$error && lastnameField.value) {
            lastnameField.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else if (v$.value.formEmployee.email?.$error && emailField.value) {
            emailField.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else if (v$.value.formEmployee.password?.$error && passwordField.value) {
            passwordField.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else if (v$.value.formEmployee.phone?.$error && phoneField.value) {
            phoneField.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else if (v$.value.formEmployee.birthday?.$error && birthdayField.value) {
            birthdayField.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else if (v$.value.formEmployee.role?.$error && roleField.value) {
            roleField.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else if (v$.value.formEmployee.street?.$error && streetField.value) {
            streetField.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else if (v$.value.formEmployee.region_uuid?.$error && regionField.value) {
            regionField.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else if (v$.value.formEmployee.municipality_uuid?.$error && municipalityField.value) {
            municipalityField.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else if (v$.value.formEmployee.city?.$error && cityField.value) {
            cityField.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else if (v$.value.formEmployee.post_code?.$error && postCodeField.value) {
            postCodeField.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else if (v$.value.formEmployee.employment.salary_id?.$error && salaryIDField.value) {
            salaryIDField.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else if (v$.value.formEmployee.employment.employment_date?.$error && employmentDateField.value) {
            employmentDateField.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else if (v$.value.formEmployee.employment.termination_date?.$error && terminationDateField.value) {
            terminationDateField.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else if (v$.value.formEmployee.employment.job_title_uuid?.$error && jobTitleField.value) {
            jobTitleField.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else if (v$.value.formEmployee.employment.working_hours?.$error && workingHoursField.value) {
            workingHoursField.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else if (v$.value.formEmployee.employment.employment_status?.$error && employmentStatusField.value) {
            employmentStatusField.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
        return
    }

    emit('submitForm', state.formEmployee)
}

function changePermissionRead() {
    state.permissions.read = !state.permissions.read
    if (state.permissions.read) {
        state.formEmployee.permissions.push("read")
    } else {
        removePermission('read')
    }
}

function changePermissionCreate() {
    state.permissions.create = !state.permissions.create
    if (state.permissions.create) {
        state.formEmployee.permissions.push("create")
    } else {
        removePermission('create')
    }
}

function changePermissionUpdate() {
    state.permissions.update = !state.permissions.update
    if (state.permissions.update) {
        state.formEmployee.permissions.push("update")
    } else {
        removePermission('update')
    }
}

function changePermissionDelete() {
    state.permissions.delete = !state.permissions.delete
    if (state.permissions.delete) {
        state.formEmployee.permissions.push("delete")
    } else {
        removePermission('delete')
    }
}

function removePermission(permissionToRemove: string) {
    state.formEmployee.permissions = state.formEmployee.permissions.filter((permission: any) => permission !== permissionToRemove);
}

function removeMedia(mediaToRemove: string) {
    state.formEmployee.media_risks = state.formEmployee.media_risks.filter((media: string) => media !== mediaToRemove);
}

function onWeeklyInput(event: any) {
    const value = event.target.value
    const weeklyHours = parseFloat(value)

    if (value === '') {
        state.formEmployee.employment.weekly_norm_hours = ''
        delete state?.error?.errors?.weekly_norm_hours
        return
    }
    if (isNaN(weeklyHours) || weeklyHours < 0 || /^\d*\.?\d*$/.test(value) === false) {
        state.error.errors = {
            ...state.error.errors,
            weekly_norm_hours: [t('validation.invalidNumber')]
        }
        return
    }

    delete state?.error?.errors?.weekly_norm_hours
    state.formEmployee.employment.weekly_norm_hours = value
}

function onYearlyInput(event: any) {
    const value = event.target.value
    const annualHours = parseFloat(String(value).replace(',', '.'))

    if (value === '') {
        state.formEmployee.employment.annual_norm_hours = ''
        delete state?.error?.errors?.annual_norm_hours
        return
    }
    if (isNaN(annualHours) || annualHours < 0 || /^\d*[.,]?\d*$/.test(value) === false) {
        state.error.errors = {
            ...state.error.errors,
            annual_norm_hours: [t('validation.invalidNumber')]
        }
        return
    }

    delete state?.error?.errors?.annual_norm_hours
    state.formEmployee.employment.annual_norm_hours = value
}

async function fetchNormPeriods() {
    try {
        const response = await normPeriodService.getAllNormPeriods()
        if (response?.data) {
            state.options.normPeriods = [
                { value: 'default', label: `${t('employees.normPeriods.default')} (01.01 - 31.12)` },
                ...response.data.map((normPeriod: any) => ({
                    value: normPeriod.uuid,
                    label: normPeriod.display_label,
                }))
            ]
            state.normPeriodDetailsByUuid = Object.fromEntries(
                response.data.map((normPeriod: any) => [
                    normPeriod.uuid,
                    { calculated_annual_standard_hours: normPeriod.calculated_annual_standard_hours },
                ])
            )
        }
    } catch (error: any) {
        state.error = error
    }
}
</script>