<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('formFieldConfig.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>
                {{ $t('formFieldConfig.title') }}
                <p class="text-sm font-normal text-gray-900">
                    {{ $t('formFieldConfig.subtitle') }}
                </p>
            </template>

            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="mt-8">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <!-- Entity type selector (commented out — only one option for now, kept for future use)
                    <div class="flex gap-x-4 mb-6">
                        <div class="space-y-1">
                            <FormLabel :label="$t('formFieldConfig.entityType')" />
                            <FormSelect id="entity_type" :options="entityTypeOptions"
                                v-model="state.selectedEntityType" :canClear="false" />
                        </div>
                    </div>
                    -->

                    <!-- Create / Edit tabs -->
                    <div class="flex gap-x-4 mb-6">
                        <button type="button"
                            :class="[state.activeFormType === 'create' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700', 'px-4 py-2 rounded-md text-sm font-medium']"
                            @click="state.activeFormType = 'create'">
                            {{ $t('formFieldConfig.createForm') }}
                        </button>
                        <button type="button"
                            :class="[state.activeFormType === 'edit' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700', 'px-4 py-2 rounded-md text-sm font-medium']"
                            @click="state.activeFormType = 'edit'">
                            {{ $t('formFieldConfig.editForm') }}
                        </button>
                    </div>

                    <!-- Sidebar + Preview layout -->
                    <div class="flex gap-x-6">
                        <!-- Toggle Sidebar -->
                        <div class="w-72 shrink-0">
                            <div class="sticky top-6 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6">
                                <h3 class="text-sm font-semibold text-gray-900 mb-4">
                                    {{ $t('formFieldConfig.fieldVisibility') }}
                                </h3>
                                <div class="space-y-3">
                                    <div class="flex items-center gap-x-2" v-for="field in citizenFormFields"
                                        :key="field.key">
                                        <FormSwitch
                                            :value="state.citizenFormConfig[state.activeFormType][field.key]"
                                            @toggleSwitch="state.citizenFormConfig[state.activeFormType][field.key] = !state.citizenFormConfig[state.activeFormType][field.key]" />
                                        <p class="text-sm text-gray-700">{{ $t(field.label) }}</p>
                                    </div>
                                </div>
                                <div class="mt-6">
                                    <FormButton type="button" buttonStyle="primary" class="rounded-md w-full"
                                        @click="submitFormFieldConfig()">
                                        {{ $t('save') }}
                                    </FormButton>
                                </div>
                            </div>
                        </div>

                        <!-- Form Preview -->
                        <div class="grow min-w-0">
                            <div class="pointer-events-none select-none">
                                <!-- Citizen Details Section -->
                                <div class="pb-10 mb-10 border-b border-gray-900/10">
                                    <div
                                        class="space-y-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8">
                                        <!-- Avatar -->
                                        <div class="space-y-1">
                                            <div class="flex flex-col items-center">
                                                <div class="relative">
                                                    <img src="/img/avatars/user.svg" alt="Avatar"
                                                        class="w-28 h-28 rounded-full object-cover border-2 border-tertiary-25 opacity-50" />
                                                </div>
                                            </div>
                                        </div>
                                        <!-- First name / Last name -->
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div class="space-y-1">
                                                <FormLabel :label="$t('citizens.form.firstname')" />
                                                <input type="text" disabled
                                                    :placeholder="$t('citizens.form.firstname')"
                                                    class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                            </div>
                                            <div class="space-y-1">
                                                <FormLabel :label="$t('citizens.form.lastname')" />
                                                <input type="text" disabled
                                                    :placeholder="$t('citizens.form.lastname')"
                                                    class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                            </div>
                                        </div>
                                        <!-- Gender -->
                                        <div class="space-y-1">
                                            <FormLabel :label="$t('citizens.form.gender')" />
                                            <div
                                                class="w-full px-4 h-11 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                                                <span class="text-gray-400 text-sm">{{ $t('citizens.form.gender')
                                                    }}</span>
                                            </div>
                                        </div>
                                        <!-- Email -->
                                        <div class="space-y-1">
                                            <FormLabel :label="$t('citizens.form.emailAddress')" />
                                            <input type="text" disabled
                                                :placeholder="$t('citizens.form.emailAddress')"
                                                class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                        </div>
                                        <!-- SSN / Birthday -->
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div class="space-y-1">
                                                <FormLabel :label="$t('citizens.form.ssn')" />
                                                <input type="text" disabled :placeholder="$t('citizens.form.ssn')"
                                                    class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                            </div>
                                            <div class="space-y-1">
                                                <FormLabel :label="$t('citizens.form.birthday')" />
                                                <input type="text" disabled
                                                    :placeholder="$t('citizens.form.birthday')"
                                                    class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                            </div>
                                        </div>
                                        <!-- Phone / Department -->
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div class="space-y-1">
                                                <FormLabel :label="$t('citizens.form.phone')" />
                                                <input type="text" disabled
                                                    :placeholder="$t('citizens.form.phone')"
                                                    class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                            </div>
                                            <div class="space-y-1">
                                                <FormLabel :label="$t('citizens.form.department')" />
                                                <div
                                                    class="w-full px-4 h-11 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                                                    <span class="text-gray-400 text-sm">{{
                                                        $t('citizens.form.department') }}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <!-- Street -->
                                        <div class="space-y-1">
                                            <FormLabel :label="$t('citizens.form.street')" />
                                            <input type="text" disabled :placeholder="$t('citizens.form.street')"
                                                class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                        </div>
                                        <!-- Region / Municipality -->
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div class="space-y-1">
                                                <FormLabel :label="$t('citizens.form.region')" />
                                                <div
                                                    class="w-full px-4 h-11 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                                                    <span class="text-gray-400 text-sm">{{
                                                        $t('citizens.form.region') }}</span>
                                                </div>
                                            </div>
                                            <div class="space-y-1">
                                                <FormLabel :label="$t('citizens.form.municipality')" />
                                                <div
                                                    class="w-full px-4 h-11 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                                                    <span class="text-gray-400 text-sm">{{
                                                        $t('citizens.form.municipality') }}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <!-- City / Post code -->
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div class="space-y-1">
                                                <FormLabel :label="$t('citizens.form.city')" />
                                                <input type="text" disabled :placeholder="$t('citizens.form.city')"
                                                    class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                            </div>
                                            <div class="space-y-1">
                                                <FormLabel :label="$t('citizens.form.postCode')" />
                                                <input type="text" disabled
                                                    :placeholder="$t('citizens.form.postCode')"
                                                    class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                            </div>
                                        </div>
                                        <!-- Origin -->
                                        <div class="space-y-1">
                                            <FormLabel :label="$t('citizens.form.citizenOrigin')" />
                                            <div
                                                class="w-full px-4 h-11 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                                                <span class="text-gray-400 text-sm">{{
                                                    $t('citizens.form.citizenOrigin') }}</span>
                                            </div>
                                        </div>

                                        <!-- === Configurable fields below === -->

                                        <!-- Diagnoses -->
                                        <div class="space-y-1" v-if="isFieldVisible('diagnoses')">
                                            <FormLabel :label="$t('citizens.form.diagnoses')" />
                                            <div
                                                class="w-full px-4 h-11 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                                                <span class="text-gray-400 text-sm">{{
                                                    $t('citizens.form.diagnoses') }}</span>
                                            </div>
                                        </div>
                                        <!-- Medication Allergies -->
                                        <div class="space-y-1" v-if="isFieldVisible('medication_allergies')">
                                            <FormLabel :label="$t('citizens.form.medicationAllergies')" />
                                            <div
                                                class="w-full px-4 h-11 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                                                <span class="text-gray-400 text-sm">{{
                                                    $t('citizens.form.medicationAllergies') }}</span>
                                            </div>
                                        </div>
                                        <!-- Addictions -->
                                        <div class="space-y-1" v-if="isFieldVisible('addictions')">
                                            <FormLabel :label="$t('addictions.addictions')" />
                                            <div
                                                class="w-full px-4 h-11 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                                                <span class="text-gray-400 text-sm">{{
                                                    $t('addictions.addictions') }}</span>
                                            </div>
                                        </div>
                                        <!-- Date Admitted / Discharged -->
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3"
                                            v-if="isFieldVisible('date_admitted')">
                                            <div class="space-y-1">
                                                <FormLabel :label="$t('citizens.form.dateAdmitted')" />
                                                <input type="text" disabled
                                                    :placeholder="$t('citizens.form.dateAdmitted')"
                                                    class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                            </div>
                                            <div class="space-y-1">
                                                <FormLabel :label="$t('citizens.form.dateDischarged')" />
                                                <input type="text" disabled
                                                    :placeholder="$t('citizens.form.dateDischarged')"
                                                    class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                            </div>
                                        </div>
                                        <!-- Section -->
                                        <div class="space-y-1" v-if="isFieldVisible('section')">
                                            <FormLabel :label="$t('citizens.form.section')" />
                                            <div
                                                class="w-full px-4 h-11 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                                                <span class="text-gray-400 text-sm">{{
                                                    $t('citizens.form.section') }}</span>
                                            </div>
                                        </div>
                                        <!-- Pricing -->
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3"
                                            v-if="isFieldVisible('pricing')">
                                            <div class="space-y-1">
                                                <FormLabel :label="$t('citizens.form.pricing')" />
                                                <input type="text" disabled
                                                    :placeholder="$t('citizens.form.pricing')"
                                                    class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                            </div>
                                            <div class="space-y-1">
                                                <FormLabel :label="$t('citizens.form.pricingStartDate')" />
                                                <input type="text" disabled
                                                    :placeholder="$t('citizens.form.pricingStartDate')"
                                                    class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                            </div>
                                        </div>
                                        <!-- Primary Caseworker -->
                                        <div class="space-y-1" v-if="isFieldVisible('primary_case_worker')">
                                            <FormLabel :label="$t('citizens.form.primaryCaseworker')" />
                                            <div
                                                class="w-full px-4 h-11 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                                                <span class="text-gray-400 text-sm">{{
                                                    $t('citizens.form.primaryCaseworker') }}</span>
                                            </div>
                                        </div>
                                        <!-- Paying Municipality -->
                                        <div class="space-y-1" v-if="isFieldVisible('paying_municipality')">
                                            <FormLabel :label="$t('citizens.form.payingMunicipality')" />
                                            <div
                                                class="w-full px-4 h-11 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                                                <span class="text-gray-400 text-sm">{{
                                                    $t('citizens.form.payingMunicipality') }}</span>
                                            </div>
                                        </div>
                                        <!-- Assessment Municipality -->
                                        <div class="space-y-1" v-if="isFieldVisible('assessment_municipality')">
                                            <FormLabel :label="$t('citizens.form.assessmentMunicipality')" />
                                            <div
                                                class="w-full px-4 h-11 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                                                <span class="text-gray-400 text-sm">{{
                                                    $t('citizens.form.assessmentMunicipality') }}</span>
                                            </div>
                                        </div>
                                        <!-- Responsible Municipality -->
                                        <div class="space-y-1" v-if="isFieldVisible('responsible_municipality')">
                                            <FormLabel :label="$t('citizens.form.responsibleMunicipality')" />
                                            <div
                                                class="w-full px-4 h-11 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                                                <span class="text-gray-400 text-sm">{{
                                                    $t('citizens.form.responsibleMunicipality') }}</span>
                                            </div>
                                        </div>
                                        <!-- EAN Number -->
                                        <div class="space-y-1" v-if="isFieldVisible('ean_number')">
                                            <FormLabel :label="$t('citizens.form.eanNumber')" />
                                            <input type="text" disabled :placeholder="$t('citizens.form.eanNumber')"
                                                class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                        </div>
                                        <!-- Transportation -->
                                        <div class="space-y-1" v-if="isFieldVisible('transportation')">
                                            <FormLabel :label="$t('citizens.form.transportation')" />
                                            <input type="text" disabled
                                                :placeholder="$t('citizens.form.transportation')"
                                                class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                        </div>
                                        <!-- Hourly Rate -->
                                        <div class="space-y-1" v-if="isFieldVisible('hourly_rate')">
                                            <FormLabel :label="$t('citizens.form.hourlyRate')" />
                                            <input type="text" disabled :placeholder="$t('citizens.form.hourlyRate')"
                                                class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                        </div>
                                        <!-- Allocated Hours -->
                                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3"
                                            v-if="isFieldVisible('allocated_hours')">
                                            <div class="space-y-1">
                                                <FormLabel
                                                    :label="$t('citizens.form.allocatedHours.allocatedDailyHours')" />
                                                <input type="text" disabled
                                                    :placeholder="$t('citizens.form.allocatedHours.allocatedDailyHours')"
                                                    class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                            </div>
                                            <div class="space-y-1">
                                                <FormLabel
                                                    :label="$t('citizens.form.allocatedHours.allocatedWeeklyHours')" />
                                                <input type="text" disabled
                                                    :placeholder="$t('citizens.form.allocatedHours.allocatedWeeklyHours')"
                                                    class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                            </div>
                                            <div class="space-y-1">
                                                <FormLabel
                                                    :label="$t('citizens.form.allocatedHours.allocatedMonthlyHours')" />
                                                <input type="text" disabled
                                                    :placeholder="$t('citizens.form.allocatedHours.allocatedMonthlyHours')"
                                                    class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                            </div>
                                        </div>
                                        <!-- Note -->
                                        <div class="space-y-1" v-if="isFieldVisible('note')">
                                            <FormLabel :label="$t('citizens.form.note')" />
                                            <textarea disabled :placeholder="$t('citizens.form.note')" rows="2"
                                                class="appearance-none block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm"></textarea>
                                        </div>
                                        <!-- Traffic Lights -->
                                        <div class="space-y-3" v-if="isFieldVisible('traffic_lights')">
                                            <p class="text-sm text-gray-600">
                                                {{ $t('citizens.form.trafficLights.trafficLights') }}
                                            </p>
                                            <div class="space-y-1">
                                                <FormLabel :label="$t('citizens.form.trafficLights.green')" />
                                                <textarea disabled
                                                    :placeholder="$t('citizens.form.trafficLights.green')" rows="2"
                                                    class="appearance-none block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm"></textarea>
                                            </div>
                                            <div class="space-y-1">
                                                <FormLabel :label="$t('citizens.form.trafficLights.yellow')" />
                                                <textarea disabled
                                                    :placeholder="$t('citizens.form.trafficLights.yellow')" rows="2"
                                                    class="appearance-none block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm"></textarea>
                                            </div>
                                            <div class="space-y-1">
                                                <FormLabel :label="$t('citizens.form.trafficLights.red')" />
                                                <textarea disabled
                                                    :placeholder="$t('citizens.form.trafficLights.red')" rows="2"
                                                    class="appearance-none block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm"></textarea>
                                            </div>
                                        </div>
                                        <!-- System Access -->
                                        <div class="space-y-2" v-if="isFieldVisible('system_access')">
                                            <div class="flex items-center gap-x-2 opacity-50">
                                                <FormSwitch :value="false" />
                                                <p class="text-sm">{{ $t('citizens.form.allowSystemAccess') }}</p>
                                            </div>
                                            <div class="flex items-center gap-x-2 opacity-50">
                                                <FormSwitch :value="false" />
                                                <p class="text-sm">{{ $t('citizens.form.allowChatAccess') }}</p>
                                            </div>
                                            <div class="flex items-center gap-x-2 opacity-50">
                                                <FormSwitch :value="false" />
                                                <p class="text-sm">{{ $t('citizens.form.allowDutyScheduleAccess') }}
                                                </p>
                                            </div>
                                            <div class="flex items-center gap-x-2 opacity-50">
                                                <FormSwitch :value="false" />
                                                <p class="text-sm">{{ $t('citizens.form.allowBulletBoardAccess') }}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Inquiry Data Section -->
                                <div class="grid grid-cols-1 gap-x-8 gap-y-4 pb-10 mb-10 xl:grid-cols-3 border-b border-gray-900/10"
                                    v-if="isFieldVisible('inquiry_data')">
                                    <div>
                                        <h2 class="text-base font-semibold leading-7 text-gray-900">
                                            {{ $t('citizens.sections.inquiryData') }}
                                        </h2>
                                    </div>
                                    <div
                                        class="md:col-span-2 space-y-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8">
                                        <div class="space-y-1">
                                            <FormLabel :label="$t('citizens.form.inquiryData.dateOfInquiry')" />
                                            <input type="text" disabled
                                                :placeholder="$t('citizens.form.inquiryData.dateOfInquiry')"
                                                class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                        </div>
                                        <div class="space-y-1">
                                            <FormLabel :label="$t('citizens.form.inquiryData.inquirerName')" />
                                            <input type="text" disabled
                                                :placeholder="$t('citizens.form.inquiryData.inquirerName')"
                                                class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                        </div>
                                        <div class="space-y-1">
                                            <FormLabel :label="$t('citizens.form.inquiryData.outcome')" />
                                            <input type="text" disabled
                                                :placeholder="$t('citizens.form.inquiryData.outcome')"
                                                class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                        </div>
                                        <div class="space-y-1">
                                            <FormLabel :label="$t('citizens.form.inquiryData.purpose')" />
                                            <input type="text" disabled
                                                :placeholder="$t('citizens.form.inquiryData.purpose')"
                                                class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                        </div>
                                        <div class="space-y-1">
                                            <FormLabel
                                                :label="$t('citizens.form.inquiryData.conversationSummary')" />
                                            <textarea disabled
                                                :placeholder="$t('citizens.form.inquiryData.conversationSummary')"
                                                rows="2"
                                                class="appearance-none block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm"></textarea>
                                        </div>
                                    </div>
                                </div>

                                <!-- Stay Data Section -->
                                <div class="grid grid-cols-1 gap-x-8 gap-y-4 pb-10 mb-10 xl:grid-cols-3 border-b border-gray-900/10"
                                    v-if="isFieldVisible('stay_data')">
                                    <div>
                                        <h2 class="text-base font-semibold leading-7 text-gray-900">
                                            {{ $t('citizens.sections.stayData') }}
                                        </h2>
                                    </div>
                                    <div
                                        class="md:col-span-2 space-y-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8">
                                        <div class="space-y-1">
                                            <FormLabel :label="$t('citizens.form.stayData.journalNumber')" />
                                            <input type="text" disabled
                                                :placeholder="$t('citizens.form.stayData.journalNumber')"
                                                class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                        </div>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div class="space-y-1">
                                                <FormLabel
                                                    :label="$t('citizens.form.stayData.accommodationStartDate')" />
                                                <input type="text" disabled
                                                    :placeholder="$t('citizens.form.stayData.accommodationStartDate')"
                                                    class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                            </div>
                                            <div class="space-y-1">
                                                <FormLabel
                                                    :label="$t('citizens.form.stayData.accommodationEndDate')" />
                                                <input type="text" disabled
                                                    :placeholder="$t('citizens.form.stayData.accommodationEndDate')"
                                                    class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                            </div>
                                        </div>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div class="space-y-1">
                                                <FormLabel
                                                    :label="$t('citizens.form.stayData.municipalityOfResidenceBefore')" />
                                                <div
                                                    class="w-full px-4 h-11 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                                                    <span class="text-gray-400 text-sm">{{
                                                        $t('citizens.form.stayData.municipalityOfResidenceBefore')
                                                        }}</span>
                                                </div>
                                            </div>
                                            <div class="space-y-1">
                                                <FormLabel
                                                    :label="$t('citizens.form.stayData.municipalityOfResidenceAfter')" />
                                                <div
                                                    class="w-full px-4 h-11 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                                                    <span class="text-gray-400 text-sm">{{
                                                        $t('citizens.form.stayData.municipalityOfResidenceAfter')
                                                        }}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="space-y-1">
                                            <FormLabel :label="$t('citizens.form.stayData.dischargeReason')" />
                                            <input type="text" disabled
                                                :placeholder="$t('citizens.form.stayData.dischargeReason')"
                                                class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { formFieldConfigService } from '@/components/api/user/FormFieldConfigService'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()

const breadcrumbLinks = [
    {
        name: 'citizens.citizens',
        translate: true,
        href: '/citizens',
    },
    {
        name: 'formFieldConfig.title',
        translate: true,
        href: '/citizens/citizen-form',
    },
]

const entityTypeOptions = [
    { value: 'citizen', label: 'Citizen' },
]

const defaultFields = () => ({
    diagnoses: true,
    medication_allergies: true,
    addictions: true,
    date_admitted: true,
    section: true,
    pricing: true,
    primary_case_worker: true,
    paying_municipality: true,
    assessment_municipality: true,
    responsible_municipality: true,
    ean_number: true,
    transportation: true,
    hourly_rate: true,
    allocated_hours: true,
    note: true,
    traffic_lights: true,
    system_access: true,
    inquiry_data: true,
    stay_data: true,
})

const citizenFormFields = [
    { key: 'diagnoses', label: 'formFieldConfig.fields.diagnoses' },
    { key: 'medication_allergies', label: 'formFieldConfig.fields.medicationAllergies' },
    { key: 'addictions', label: 'formFieldConfig.fields.addictions' },
    { key: 'date_admitted', label: 'formFieldConfig.fields.dateAdmitted' },
    { key: 'section', label: 'formFieldConfig.fields.section' },
    { key: 'pricing', label: 'formFieldConfig.fields.pricing' },
    { key: 'primary_case_worker', label: 'formFieldConfig.fields.primaryCaseWorker' },
    { key: 'paying_municipality', label: 'formFieldConfig.fields.payingMunicipality' },
    { key: 'assessment_municipality', label: 'formFieldConfig.fields.assessmentMunicipality' },
    { key: 'responsible_municipality', label: 'formFieldConfig.fields.responsibleMunicipality' },
    { key: 'ean_number', label: 'formFieldConfig.fields.eanNumber' },
    { key: 'transportation', label: 'formFieldConfig.fields.transportation' },
    { key: 'hourly_rate', label: 'formFieldConfig.fields.hourlyRate' },
    { key: 'allocated_hours', label: 'formFieldConfig.fields.allocatedHours' },
    { key: 'note', label: 'formFieldConfig.fields.note' },
    { key: 'traffic_lights', label: 'formFieldConfig.fields.trafficLights' },
    { key: 'system_access', label: 'formFieldConfig.fields.systemAccess' },
    { key: 'inquiry_data', label: 'formFieldConfig.fields.inquiryData' },
    { key: 'stay_data', label: 'formFieldConfig.fields.stayData' },
]

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    selectedEntityType: 'citizen',
    activeFormType: 'create' as 'create' | 'edit',
    citizenFormConfig: {
        create: defaultFields(),
        edit: defaultFields(),
    } as Record<string, Record<string, boolean>>,
})

function isFieldVisible(fieldKey: string): boolean {
    return state.citizenFormConfig[state.activeFormType][fieldKey] !== false
}

onMounted(() => {
    fetchFormFieldConfigs()
})

async function fetchFormFieldConfigs() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await formFieldConfigService.getFormConfigs({ entity_type: state.selectedEntityType })
        if (response?.data) {
            response.data.forEach((config: any) => {
                if (config.form_type === 'create' || config.form_type === 'edit') {
                    const fields = defaultFields()
                    if (config.form_fields) {
                        Object.keys(config.form_fields).forEach((key: string) => {
                            if (key in fields) {
                                (fields as any)[key] = config.form_fields[key]
                            }
                        })
                    }
                    state.citizenFormConfig[config.form_type] = fields
                }
            })
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function submitFormFieldConfig() {
    state.error = {}
    state.isPageLoading = true
    try {
        await formFieldConfigService.updateFormConfig({
            entity_type: state.selectedEntityType,
            form_type: state.activeFormType,
            form_fields: state.citizenFormConfig[state.activeFormType],
        })
        successAlert(`${t('alert.success')}!`, `${t('formFieldConfig.alert.successfullyUpdated')}.`)
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
