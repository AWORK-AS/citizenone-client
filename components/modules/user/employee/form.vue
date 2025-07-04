<template>
    <form @submit.prevent="submitForm()" class="mt-6">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="grid grid-cols-1 gap-x-8 gap-y-4 pb-10 mb-10 xl:grid-cols-3 border-b border-gray-900/10">
            <div>
                <h2 class="text-base font-semibold leading-7 text-gray-900">
                    {{ $t('employees.form.header.employeeInformation') }}
                </h2>
                <p class="mt-1 text-sm leading-6 text-gray-600">
                    {{ $t('employees.form.header.essentialDetailsOfTheEmployee') }}.
                </p>
            </div>
            <div class="md:col-span-2 space-y-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8">
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
                        <FormTextField id="firstname" name="firstname" :placeholder="$t('employees.form.firstname')"
                            v-model="state.formEmployee.firstname" />
                        <FormError :error="v$?.formEmployee?.firstname?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.firstname?.[0]" />
                    </div>
                    <div class="space-y-1" ref="lastnameField">
                        <FormLabel for="lastname" :label="$t('employees.form.lastname')" />
                        <FormTextField id="lastname" name="lastname" :placeholder="$t('employees.form.lastname')"
                            v-model="state.formEmployee.lastname" />
                        <FormError :error="v$?.formEmployee?.lastname?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.lastname?.[0]" />
                    </div>
                </div>
                <div class="space-y-1" ref="emailField">
                    <FormLabel for="email" :label="$t('employees.form.emailAddress')" />
                    <FormTextField id="email" name="email" :placeholder="$t('employees.form.emailAddress')"
                        v-model="state.formEmployee.email" />
                    <FormError :error="v$?.formEmployee?.email?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.email?.[0]" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1" ref="phoneField">
                        <FormLabel for="phone" :label="$t('employees.form.phone')" />
                        <FormTextField id="phone" name="phone" :placeholder="$t('employees.form.phone')"
                            v-model="state.formEmployee.phone" />
                        <FormError :error="v$?.formEmployee?.phone?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.phone?.[0]" />
                    </div>
                    <div class="space-y-1" ref="birthdayField">
                        <FormLabel for="birthday" :label="$t('employees.form.birthday')" />
                        <FormDateField id="birthday" name="birthday" :placeholder="$t('employees.form.birthday')"
                            v-model="state.formEmployee.birthday" />
                        <FormError :error="v$?.formEmployee?.birthday?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.birthday?.[0]" />
                    </div>
                </div>
                <div class="space-y-1">
                    <FormLabel for="seniority_date" :label="$t('employees.form.seniorityDate')" />
                    <FormDateField id="seniority_date" name="seniority_date"
                        :placeholder="$t('employees.form.seniorityDate')" v-model="state.formEmployee.seniority_date" />
                    <FormError :error="v$?.formEmployee?.seniority_date?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.seniority_date?.[0]" />
                </div>
                <div class="grid grid-cols-1 gap-3" :class="[
                    isAdmin(userStore.getUser?.roles) && 'md:grid-cols-2'
                ]">
                    <div class="space-y-1">
                        <div class="flex justify-between items-center py-0.5">
                            <FormLabel for="departments" :label="$t('employees.form.department')" />
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
                    <div class="space-y-1" ref="roleField" v-if="userStore.getUser?.roles?.[0]?.name === 'Admin'">
                        <FormLabel for="role" :label="$t('employees.form.role')" />
                        <FormSelect id="role" name="role" :options="state.options.roleOptions"
                            v-model="state.formEmployee.role" />
                        <FormError :error="v$?.formEmployee?.role?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.role?.[0]" />
                    </div>
                </div>
                <div class="space-y-1" ref="streetField">
                    <FormLabel for="street" :label="$t('employees.form.street')" />
                    <FormTextField id="street" name="street" :placeholder="$t('employees.form.street')"
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
                        <FormSelect id="city" :options="state.options.cities" v-model="state.formEmployee.city_uuid" />
                        <FormError :error="v$?.formEmployee?.city_uuid?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.city_uuid?.[0]" />
                    </div>
                    <div class="space-y-1" ref="postCodeField">
                        <FormLabel for="post_code" :label="$t('employees.form.postCode')" />
                        <FormTextField id="post_code" name="post_code" :placeholder="$t('employees.form.postCode')"
                            v-model="state.formEmployee.post_code" />
                        <FormError :error="v$?.formEmployee?.post_code?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.post_code?.[0]" />
                    </div>
                </div>
                <div class="space-y-1" v-if="isAdmin(userStore.getUser?.roles)">
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
                <div class="space-y-1" v-if="isAdmin(userStore.getUser?.roles)">
                    <FormLabel for="permissions" :label="$t('employees.form.permissions.permissions')" />
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        <div class="w-fit flex items-center cursor-pointer" @click="changePermissionRead()">
                            <FormCheckbox id="permissions" :value="state.permissions.read" />
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
                <div class="space-y-1" v-if="props.formType === 'update' && isAdmin(userStore.getUser?.roles)">
                    <FormLabel for="pages" :label="$t('employees.form.pageAccess')" />
                    <FormSelectMultiple id="pages" :options="state.options.pages" v-model="state.formEmployee.pages" />
                    <FormError :error="v$?.formEmployee?.pages?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.page_uuid?.[0]" />
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 gap-x-8 gap-y-4 pb-10 mb-10 xl:grid-cols-3 border-b border-gray-900/10">
            <div>
                <h2 class="text-base font-semibold leading-7 text-gray-900">
                    {{ $t('employees.form.header.employmentInformation') }}
                </h2>
                <p class="mt-1 text-sm leading-6 text-gray-600">
                    {{ $t('employees.form.header.comprehensiveEmploymentDetailsWithinTheOrganization') }}.
                </p>
            </div>
            <div class="md:col-span-2 space-y-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8">
                <div class="space-y-1" ref="employmentDateField" v-if="isAdmin(userStore.getUser?.roles)">
                    <FormLabel for="employment_date" :label="$t('employees.form.employment.employmentDate')" />
                    <FormDateField id="employment_date" name="employment_date"
                        :placeholder="$t('employees.form.employment.employmentDate')"
                        v-model="state.formEmployee.employment.employment_date" />
                    <FormError
                        :error="v$?.formEmployee?.employment?.employment_date?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.employment_date?.[0]" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1" ref="annualNormHoursField" v-if="isAdmin(userStore.getUser?.roles)">
                        <FormLabel for="annual_norm_hours" :label="$t('employees.form.employment.annualNormHours')" />
                        <FormTextField id="annual_norm_hours" name="annual_norm_hours"
                            :placeholder="$t('employees.form.employment.annualNormHours')"
                            v-model="state.formEmployee.employment.annual_norm_hours" />
                        <FormError
                            :error="v$?.formEmployee?.employment?.annual_norm_hours?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.annual_norm_hours?.[0]" />
                    </div>
                    <div class="space-y-1" ref="vacationDaysField" v-if="isAdmin(userStore.getUser?.roles)">
                        <FormLabel for="vacation_days" :label="$t('employees.form.employment.vacationDays')" />
                        <FormTextField id="vacation_days" name="vacation_days"
                            :placeholder="$t('employees.form.employment.vacationDays')"
                            v-model="state.formEmployee.employment.vacation_days" />
                        <FormError
                            :error="v$?.formEmployee?.employment?.vacation_days?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.vacation_days?.[0]" />
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
                                @click="addNewJobSpecialty">
                                {{ $t('jobSpecialties.addNewJobSpecialty') }}
                            </span>
                        </div>
                        <FormSelectMultiple id="job_specialties" name="job_specialties"
                            :options="state.options.jobSpecialties"
                            v-model="state.formEmployee.employment.job_specialties" />
                        <FormError
                            :error="v$?.formScheduleSlot?.employment?.job_specialties?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.job_specialties?.[0]" />
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1" ref="workingHoursField" v-if="isAdmin(userStore.getUser?.roles)">
                        <FormLabel for="working_hours" :label="$t('employees.form.employment.workingHours')" />
                        <FormSelect id="working_hours" :options="state.options.working_hours"
                            v-model="state.formEmployee.employment.working_hours" />
                        <FormError
                            :error="v$?.formEmployee?.employment?.working_hours?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.working_hours?.[0]" />
                    </div>
                    <div class="space-y-1" ref="employmentStatusField" v-if="isAdmin(userStore.getUser?.roles)">
                        <FormLabel for="employment_status" :label="$t('employees.form.employment.employmentStatus')" />
                        <FormSelect id="employment_status" :options="state.options.employment_status"
                            v-model="state.formEmployee.employment.employment_status" />
                        <FormError
                            :error="v$?.formEmployee?.employment?.employment_status?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.employment_status?.[0]" />
                    </div>
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 gap-x-8 gap-y-4 pb-10 xl:grid-cols-3 border-b border-gray-900/10">
            <div>
                <h2 class="text-base font-semibold leading-7 text-gray-900">
                    {{ $t('employees.form.header.emergencyInfo') }}
                </h2>
                <p class="mt-1 text-sm leading-6 text-gray-600">
                    {{ $t('employees.form.header.emergencyContactDetailsInCaseOfAnUrgentSituation') }}
                </p>
            </div>
            <div class="grid grid-cols-1 md:col-span-2 gap-y-3">
                <div>
                    <p class="text-sm text-gray-600 font-semibold leading-5">
                        {{ $t('employees.form.emergencyInfo.trustees') }}
                    </p>
                    <div class="mt-5">
                        <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8"
                            v-if="state.formEmployee.emergencyInfo.trustees.length === 0">
                            <div class="mx-auto max-w-md">
                                <FormButton buttonStyle="primary" @click="addTrustee" class="w-full rounded-md">
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
                                        <FormTextField :id="`trustee_name_${index}`" name="trustee_name"
                                            :placeholder="$t('employees.form.emergencyInfo.name')" :value="trustee.name"
                                            @keyup="(event: any) => state.formEmployee.emergencyInfo.trustees[index].name = event.target.value" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel :for="`trustee_phone_${index}`"
                                            :label="$t('employees.form.emergencyInfo.phone')" />
                                        <FormTextField :id="`trustee_phone_${index}`" name="trustee_phone"
                                            :placeholder="$t('employees.form.emergencyInfo.phone')"
                                            :value="trustee.phone"
                                            @keyup="(event: any) => state.formEmployee.emergencyInfo.trustees[index].phone = event.target.value" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel :for="`trustee_email_${index}`"
                                            :label="$t('employees.form.emergencyInfo.email')" />
                                        <FormTextField :for="`trustee_email_${index}`" name="trustee_email"
                                            :placeholder="$t('employees.form.emergencyInfo.email')"
                                            :value="trustee.email"
                                            @keyup="(event: any) => state.formEmployee.emergencyInfo.trustees[index].email = event.target.value" />
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
                <div class="grid grid-cols-1 md:col-span-2 gap-y-3 mt-5">
                    <p class="text-sm text-gray-600 font-semibold leading-5">
                        {{ $t('employees.form.emergencyInfo.emergencyContacts') }}
                    </p>
                    <div class="mt-5">
                        <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8"
                            v-if="state.formEmployee.emergencyInfo.emergency_contacts.length === 0">
                            <div class="mx-auto max-w-md">
                                <FormButton buttonStyle="primary" @click="addEmergencyContact"
                                    class="w-full rounded-md">
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
                                            :placeholder="$t('employees.form.emergencyInfo.name')"
                                            :value="emergency_contact.name"
                                            @keyup="(event: any) => state.formEmployee.emergencyInfo.emergency_contacts[index].name = event.target.value" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel :for="`emergency_contact_phone_${index}`"
                                            :label="$t('employees.form.emergencyInfo.phone')" />
                                        <FormTextField :id="`emergency_contact_phone_${index}`"
                                            name="emergency_contact_phone"
                                            :placeholder="$t('employees.form.emergencyInfo.phone')"
                                            :value="emergency_contact.phone"
                                            @keyup="(event: any) => state.formEmployee.emergencyInfo.emergency_contacts[index].phone = event.target.value" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel :for="`emergency_contact_email_${index}`"
                                            :label="$t('employees.form.emergencyInfo.email')" />
                                        <FormTextField :id="`emergency_contact_email_${index}`"
                                            name="emergency_contact_email"
                                            :placeholder="$t('employees.form.emergencyInfo.email')"
                                            :value="emergency_contact.email"
                                            @keyup="(event: any) => state.formEmployee.emergencyInfo.emergency_contacts[index].email = event.target.value" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel :for="`emergency_contact_relation_${index}`"
                                            :label="$t('employees.form.emergencyInfo.relation')" />
                                        <FormTextField :id="`emergency_contact_relation_${index}`"
                                            name="emergency_contact_relation"
                                            :placeholder="$t('employees.form.emergencyInfo.relation')"
                                            :value="emergency_contact.relation"
                                            @keyup="(event: any) => state.formEmployee.emergencyInfo.emergency_contacts[index].relation = event.target.value" />
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
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="navigateTo('/employees')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
        <ModulesUserEmployeeModalMediaRiskExplanation :isModalOpen="state.modal.isShowMediaRiskExplainationOpen"
            @close="state.modal.isShowMediaRiskExplainationOpen = false" />
        <ModulesUserDepartmentModalNew :isModalOpen="state.modal.isAddDepartmentOpen"
            @close="state.modal.isAddDepartmentOpen = false" @refreshDepartments="fetchDepartments" />
        <ModulesUserJobTitleModalNew :isModalOpen="state.modal.isAddJobTitleOpen"
            @close="state.modal.isAddJobTitleOpen = false" @refreshJobTitle="fetchJobTitles" />
        <ModulesUserJobSpecialtyModalNew :isModalOpen="state.modal.isAddJobSpecialtyOpen"
            :selectedJobTitleUuid="state.formEmployee.employment.job_title_uuid"
            @close="state.modal.isAddJobSpecialtyOpen = false"
            @refreshJobSpecialty="fetchJobSpecialties(state.formEmployee.employment.job_title_uuid)" />
    </form>
</template>

<script setup lang="ts">
import { jobTitleService } from '@/components/api/user/JobTitleService'
import { jobSpecialtyService } from '@/components/api/user/JobSpecialtyService'
import { departmentService } from '@/components/api/user/DepartmentService'
import { pageService } from '@/components/api/user/PageService'
import { regionService } from '@/components/api/user/RegionService'
import { municipalityService } from '@/components/api/user/MunicipalityService'
import { cityService } from '@/components/api/user/CityService'
import { mediaRiskService } from '@/components/api/user/MediaRiskService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
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
const userStore = useUserStore() as any
const image = ref<HTMLInputElement | null>(null)
const avatarUrl = ref('/img/avatars/user.svg')
const { errorAlert } = useAlert()
const { t } = useI18n()
const language = useI18n()
const firstnameField = ref<HTMLElement | null>(null)
const lastnameField = ref<HTMLElement | null>(null)
const emailField = ref<HTMLElement | null>(null)
const phoneField = ref<HTMLElement | null>(null)
const birthdayField = ref<HTMLElement | null>(null)
const roleField = ref<HTMLElement | null>(null)
const streetField = ref<HTMLElement | null>(null)
const regionField = ref<HTMLElement | null>(null)
const municipalityField = ref<HTMLElement | null>(null)
const cityField = ref<HTMLElement | null>(null)
const postCodeField = ref<HTMLElement | null>(null)
const employmentDateField = ref<HTMLElement | null>(null)
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
        phone: '',
        birthday: '',
        seniority_date: '',
        departments: [],
        role: '',
        street: '',
        region_uuid: '',
        municipality_uuid: '',
        city_uuid: '',
        post_code: '',
        permissions: [],
        media_risks: [],
        pages: [],
        employment: {
            employment_date: '',
            job_title_uuid: '',
            job_specialties: [],
            working_hours: '',
            employment_status: '',
            annual_norm_hours: '',
            vacation_days: '',
        },
        emergencyInfo: {
            emergency_contacts: [],
            trustees: [],
        },
    } as EmployeeForm,
    modal: {
        isAddDepartmentOpen: false,
        isAddJobSpecialtyOpen: false,
        isAddJobTitleOpen: false,
        isShowMediaRiskExplainationOpen: false,
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
        employment_status: [
            { value: 'permanent', label: `${t('employees.employmentStatus.permanent')}` },
            { value: 'temporary', label: `${t('employees.employmentStatus.temporary')}` },
            { value: 'substitute', label: `${t('employees.employmentStatus.substitute')}` },
        ],
        jobSpecialties: [],
        jobTitles: [],
        media_risks: [] as any,
        municipalities: [],
        pages: [],
        regions: [],
        roleOptions: [
            { value: 'Admin', label: `${t('employees.roles.administrator')}` },
            { value: 'User', label: `${t('employees.roles.user')}` },
        ],
        working_hours: [
            { value: 'full_time', label: `${t('employees.workingHours.fulltime')}` },
            { value: 'part_time', label: `${t('employees.workingHours.parttime')}` },
        ],
    }
})

watch(() => language.locale.value, (newValue: any) => {
    if (newValue != null) {
        state.options.employment_status = [
            { value: 'permanent', label: `${t('employees.employmentStatus.permanent')}` },
            { value: 'temporary', label: `${t('employees.employmentStatus.temporary')}` },
            { value: 'substitute', label: `${t('employees.employmentStatus.substitute')}` },
        ]
        state.options.roleOptions = [
            { value: 'Admin', label: `${t('employees.roles.administrator')}` },
            { value: 'User', label: `${t('employees.roles.user')}` },
        ]
        state.options.working_hours = [
            { value: 'full_time', label: `${t('employees.workingHours.fulltime')}` },
            { value: 'part_time', label: `${t('employees.workingHours.parttime')}` },
        ]
    }
})

watch(() => props.selectedEmployee, (newValue: any) => {
    if (newValue != null) {
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
            phone: newValue.phone,
            birthday: newValue.birthday,
            seniority_date: newValue.seniority_date,
            departments: newValue.departments,
            role: newValue.role,
            street: newValue.street,
            region_uuid: newValue.region_uuid,
            municipality_uuid: newValue.municipality_uuid,
            city_uuid: newValue.city_uuid,
            post_code: newValue.post_code,
            permissions: [],
            media_risks: newValue.media_risks,
            pages: newValue.pages,
            emergencyInfo: {
                emergency_contacts: newValue.emergencyInfo.emergency_contacts,
                trustees: newValue.emergencyInfo.trustees,
            },
            employment: {
                employment_date: newValue.employment.employment_date,
                job_title_uuid: newValue.employment.job_title_uuid,
                job_specialties: newValue.employment.job_specialties,
                working_hours: newValue.employment.working_hours,
                employment_status: newValue.employment.employment_status,
                annual_norm_hours: newValue.employment.annual_norm_hours,
                vacation_days: newValue.employment.vacation_days,
            }
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
    }
})

const rules = computed(() => {
    return {
        formEmployee: {
            firstname: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            lastname: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            email: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            phone: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            birthday: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            street: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            region_uuid: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            municipality_uuid: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            city_uuid: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            post_code: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            role: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            employment: {
                employment_date: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required)
                },
                job_title_uuid: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required)
                },
                working_hours: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required)
                },
                employment_status: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required)
                },
            }
        },
    }
})

const v$ = useVuelidate(rules, state)

onMounted(() => {
    fetchMediaRisks()
    fetchDepartments()
    fetchJobTitles()
    fetchPages()
    fetchRegions()
})

function isAdmin(roles: any) {
    return roles && roles.some((role: any) => role.name === 'Admin')
}

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
        const response = await departmentService.getAllDepartments()
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

function addNewJobSpecialty() {
    if (state.formEmployee.employment.job_title_uuid) {
        state.modal.isAddJobSpecialtyOpen = true
    } else {
        errorAlert(`${t('alert.required')}!`, `${t('alert.jobTitleRequired')}.`)
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
    if (v$.value.$error) {
        // Check specific fields in the order you want
        if (v$.value.formEmployee.firstname?.$error && firstnameField.value) {
            firstnameField.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else if (v$.value.formEmployee.lastname?.$error && lastnameField.value) {
            lastnameField.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else if (v$.value.formEmployee.email?.$error && emailField.value) {
            emailField.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
        } else if (v$.value.formEmployee.city_uuid?.$error && cityField.value) {
            cityField.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else if (v$.value.formEmployee.post_code?.$error && postCodeField.value) {
            postCodeField.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else if (v$.value.formEmployee.employment.employment_date?.$error && employmentDateField.value) {
            employmentDateField.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
</script>