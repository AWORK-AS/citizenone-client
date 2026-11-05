<template>

    <Head>
        <Title>{{ $t('register.register') }} - {{ runtimeConfig?.public?.appName }}</Title>
        <!-- The website links here with ?industry=…&facility_type=… prefilled, and Google
             indexed each variant separately. One page, one address. -->
        <Link rel="canonical" :href="canonicalUrl" />
    </Head>

    <LoadingSpinner :isActive="state.isPageLoading">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-5 min-h-screen">
            <div class="w-full max-w-xl mx-auto pt-20 px-5 lg:px-0">
                <div class="flex items-end justify-between">
                    <Logo class="w-40" @click="navigateTo('/')" />
                    <p class="text-xs text-gray-700">
                        {{ $t('register.step') }} {{ state.progress.currentStep }}
                        <span class="lowercase">{{ $t('register.of') }}</span> 3
                    </p>
                </div>
                <div class="mt-5 flex items-center gap-x-2">
                    <div v-for="(bar, index) in progressBars" :key="index" class="h-2.5 w-full rounded-full bg-gray-200">
                        <div class="h-2.5 rounded-full bg-secondary transition-all duration-300"
                            :style="{ width: `${Math.round(bar * 100)}%` }"></div>
                    </div>
                    <img class="w-4" src="/img/icons/asset-app.png" :alt="$t('imageFailedToLoad')" />
                </div>
                <form v-if="!state.registeredEmail" class="mt-5" method="POST" @submit.prevent="register">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="space-y-1">
                        <!-- Came through a customer's "Del CitizenOne" link (task #16). -->
                        <div v-if="signupSource.share && !state.oauthProvider" data-testid="register-shared-banner"
                            class="mb-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                            <Icon name="ph:share-network" class="mt-0.5 size-[18px] shrink-0 text-[#42AED9]" />
                            <div>
                                <p class="text-sm font-semibold text-[#0f4c75]">{{ $t('register.sharedBannerTitle') }}</p>
                                <p class="text-xs text-[#64748b] mt-0.5">{{ $t('register.sharedBannerDescription') }}</p>
                                <!-- "Giv en måned, få en måned": the referred side's half of the offer. -->
                                <p class="text-xs text-[#64748b] mt-0.5" data-testid="register-referral-note">{{ $t('referralProgram.registerNote') }}</p>
                            </div>
                        </div>
                        <div v-if="state.oauthProvider"
                            class="mb-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                            <svg class="mt-0.5 flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none"
                                stroke="rgb(66,174,217)" stroke-width="2" stroke-linecap="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <div>
                                <p class="text-sm font-semibold text-[#0f4c75]">{{ $t('register.oauthBannerTitle') }}
                                </p>
                                <p class="text-xs text-[#64748b] mt-0.5">
                                    {{
                                        $t('register.oauthBannerDescription', {
                                            provider: state.oauthProvider === 'google' ? 'Google' : 'Microsoft'
                                        })
                                    }}
                                </p>
                            </div>
                        </div>
                        <!-- The answer from step 1 stays in sight, so every later step reads as
                             "for your clinic" and can be changed without starting over. -->
                        <div v-if="state.progress.currentStep > 1" class="mt-8 flex items-center justify-between gap-3">
                            <button type="button" class="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                                data-testid="register-back" @click="state.progress.currentStep -= 1">
                                <Icon name="ph:arrow-left" class="size-4" aria-hidden="true" />
                                {{ $t('back') }}
                            </button>
                            <button v-if="selectedIndustry" type="button" data-testid="register-chosen-industry"
                                class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:border-slate-300"
                                @click="state.progress.currentStep = 1">
                                <Icon :name="bucketIcon(selectedProfile)" class="size-4 text-primary" aria-hidden="true" />
                                {{ selectedIndustry.label }}
                                <span class="text-primary">· {{ $t('register.segment.change') }}</span>
                            </button>
                        </div>
                        <div :class="[state.progress.currentStep > 1 ? 'mt-4' : 'mt-10', 'flex justify-between items-center']">
                            <h3 class="font-bold text-2xl md:text-3xl">
                                <span v-if="state.progress.currentStep === 1">{{ $t('register.segment.title') }}</span>
                                <span v-else-if="state.progress.currentStep === 2">{{ $t('register.about.title') }}</span>
                                <span v-else>{{ $t('register.account.title') }}</span>
                            </h3>
                            <div class="relative" v-click-outside="() => state.langOpen = false">
                                <button type="button" @click="state.langOpen = !state.langOpen"
                                    class="flex items-center gap-1.5 py-[5px] pr-[10px] pl-[6px] rounded-full border border-slate-200 bg-white cursor-pointer text-xs font-semibold text-slate-500 hover:border-slate-300 transition-colors">
                                    <img :src="identifyFlag()" alt="flag" class="w-5 h-5 rounded-full object-cover" />
                                    {{ String(language.locale.value).toUpperCase() }}
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2.5">
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </button>
                                <div v-if="state.langOpen"
                                    class="absolute right-0 top-[calc(100%+6px)] bg-white border border-slate-200 rounded-xl shadow-lg z-[100] min-w-[120px] overflow-hidden">
                                    <button type="button" @click="setLang('dk')"
                                        :class="['flex items-center gap-2 w-full px-3.5 py-2.5 border-0 bg-transparent cursor-pointer text-[13px] font-medium text-[#1a2332] hover:bg-[#edf5fb] transition-colors', language.locale.value === 'dk' && 'bg-[#edf5fb]']">
                                        <img src="/img/icons/flags/denmark.svg"
                                            class="w-5 h-5 rounded-full object-cover" />
                                        Dansk
                                    </button>
                                    <button type="button" @click="setLang('en')"
                                        :class="['flex items-center gap-2 w-full px-3.5 py-2.5 border-0 bg-transparent cursor-pointer text-[13px] font-medium text-[#1a2332] hover:bg-[#edf5fb] transition-colors', language.locale.value === 'en' && 'bg-[#edf5fb]']">
                                        <img src="/img/icons/flags/united-kingdom.svg"
                                            class="w-5 h-5 rounded-full object-cover" />
                                        English
                                    </button>
                                    <button type="button" @click="setLang('no')"
                                        :class="['flex items-center gap-2 w-full px-3.5 py-2.5 border-0 bg-transparent cursor-pointer text-[13px] font-medium text-[#1a2332] hover:bg-[#edf5fb] transition-colors', language.locale.value === 'no' && 'bg-[#edf5fb]']">
                                        <img src="/img/icons/flags/norway.svg"
                                            class="w-5 h-5 rounded-full object-cover" />
                                        Norsk
                                    </button>
                                    <button type="button" @click="setLang('sv')"
                                        :class="['flex items-center gap-2 w-full px-3.5 py-2.5 border-0 bg-transparent cursor-pointer text-[13px] font-medium text-[#1a2332] hover:bg-[#edf5fb] transition-colors', language.locale.value === 'sv' && 'bg-[#edf5fb]']">
                                        <img src="/img/icons/flags/sweden.svg"
                                            class="w-5 h-5 rounded-full object-cover" />
                                        Svenska
                                    </button>
                                </div>
                            </div>
                        </div>
                        <p class="text-sm text-gray-600">
                            <span v-if="state.progress.currentStep === 1">{{ $t('register.segment.subtitle') }}</span>
                            <span v-else-if="state.progress.currentStep === 2">{{ $t('register.about.subtitle') }}</span>
                            <span v-else>{{ $t('register.account.subtitle') }}</span>
                        </p>
                    </div>
                    <!-- Step 1: one easy question with five big answers, before anything personal.
                         A bucket with one industry is answered by the click itself. -->
                    <div class="mt-6 space-y-5" v-if="state.progress.currentStep === 1" data-testid="register-segment">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button v-for="bucket in BUCKETS" :key="bucket.key" type="button"
                                :data-testid="`register-bucket-${bucket.key}`"
                                :aria-pressed="state.segment.bucket === bucket.key"
                                :class="['flex items-start gap-3 rounded-xl border bg-white p-4 text-left transition-colors',
                                    state.segment.bucket === bucket.key ? 'border-primary ring-1 ring-primary' : 'border-slate-200 hover:border-slate-300']"
                                @click="chooseBucket(bucket.key)">
                                <span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary-25 text-primary">
                                    <Icon :name="bucket.icon" class="size-5" aria-hidden="true" />
                                </span>
                                <span>
                                    <span class="block text-sm font-semibold text-gray-900">{{ $t(`register.segment.buckets.${bucket.key}.label`) }}</span>
                                    <span class="mt-0.5 block text-xs text-gray-500">{{ $t(`register.segment.buckets.${bucket.key}.desc`) }}</span>
                                </span>
                            </button>
                            <!-- Everyone else: beauty, teaching, and a profession that is not on
                                 the list at all. Nobody should be left without an answer. -->
                            <button type="button" data-testid="register-other"
                                :aria-pressed="state.segment.searchAll"
                                :class="['flex items-start gap-3 rounded-xl border bg-white p-4 text-left transition-colors',
                                    state.segment.searchAll ? 'border-primary ring-1 ring-primary' : 'border-slate-200 hover:border-slate-300']"
                                @click="openSearchAll">
                                <span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary-25 text-primary">
                                    <Icon name="ph:dots-three-circle" class="size-5" aria-hidden="true" />
                                </span>
                                <span>
                                    <span class="block text-sm font-semibold text-gray-900">{{ $t('register.segment.otherTile.label') }}</span>
                                    <span class="mt-0.5 block text-xs text-gray-500">{{ $t('register.segment.otherTile.desc') }}</span>
                                </span>
                            </button>
                        </div>

                        <div v-if="state.segment.bucket && bucketIndustries.length > 1" data-testid="register-which">
                            <p class="text-sm font-medium text-gray-900">{{ $t('register.segment.which') }}</p>
                            <FormTextField v-if="state.segment.showAll" id="industry-search" name="industry-search" class="mt-2"
                                :placeholder="$t('register.segment.search')" v-model="state.segment.query" />
                            <div class="mt-3 flex flex-wrap gap-2">
                                <button v-for="option in visibleBucketIndustries" :key="option.value" type="button"
                                    :class="industryChipClass(option)" @click="selectIndustry(option)">
                                    {{ option.label }}
                                </button>
                                <button v-if="!state.segment.showAll && bucketIndustries.length > VISIBLE_BEFORE_SHOW_ALL"
                                    type="button" class="rounded-full px-3 py-1.5 text-sm font-medium text-primary hover:underline"
                                    @click="state.segment.showAll = true">
                                    {{ $t('register.segment.showAll', { count: bucketIndustries.length }) }}
                                </button>
                            </div>
                            <p v-if="visibleBucketIndustries.length === 0" class="mt-2 text-sm text-gray-500">{{ $t('register.segment.noMatch') }}</p>
                        </div>

                        <div v-if="state.segment.searchAll" data-testid="register-search-all">
                            <FormTextField id="industry-search-all" name="industry-search-all"
                                :placeholder="$t('register.segment.search')" v-model="state.segment.query" />
                            <div class="mt-3 flex flex-wrap gap-2">
                                <button v-for="option in searchAllResults" :key="option.value" type="button"
                                    :class="industryChipClass(option)" @click="selectIndustry(option)">
                                    {{ option.label }}
                                </button>
                            </div>
                            <p v-if="searchAllResults.length === 0" class="mt-2 text-sm text-gray-500">{{ $t('register.segment.noMatch') }}</p>
                            <button v-if="otherIndustry" type="button" data-testid="register-not-listed"
                                class="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                                @click="selectIndustry(otherIndustry)">
                                {{ $t('register.segment.notListed') }}
                                <Icon name="ph:arrow-right" class="size-4" aria-hidden="true" />
                            </button>
                        </div>
                        <FormError :error="vRulesIndustry$?.formRegister?.industry?.$errors[0]?.$message.toString()" />
                        <FormError :error="state?.error?.errors?.industry_uuid?.[0] ?? state?.error?.errors?.industry?.[0]" />
                    </div>
                    <!-- Step 2: the organisation, in the words of the answer above. -->
                    <div class="mt-5 space-y-3" v-else-if="state.progress.currentStep === 2">
                        <div class="space-y-1">
                            <FormLabel for="company_name" :label="$t('register.form.companyLabel')" />
                            <FormTextField id="company_name" name="company_name"
                                :placeholder="$t(`register.about.placeholder.${panelProfile}`)"
                                v-model="state.formRegister.company_name" />
                            <FormError
                                :error="vRules2$?.formRegister?.company_name?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.name?.[0]" />
                        </div>
                        <div class="space-y-1" v-if="selectedProfile === 'social_welfare'">
                            <FormLabel for="facility_type_uuid" :label="$t('register.form.typeOfFacility')" />
                            <FormSelect id="facility_type_uuid" :options="state.options.typeOfFacilities"
                                v-model="state.formRegister.facility_type_uuid" />
                            <FormError :error="state?.error?.errors?.facility_type_uuid?.[0]" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="phone" :label="$t('register.form.phoneOptional')" />
                            <FormTextField id="phone" name="phone" type="tel" :placeholder="$t('register.form.phonePlaceholder')"
                                v-model="state.formRegister.phone" />
                            <FormError :error="state?.error?.errors?.phone?.[0]" />
                        </div>
                    </div>
                    <!-- Step 3: the login, last, once the visitor has already said what they are building. -->
                    <div class="mt-5 space-y-3" v-else>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 py-1">
                            <div class="space-y-1">
                                <FormLabel for="firstname" :label="$t('register.form.firstname')" />
                                <FormTextField id="firstname" name="firstname"
                                    :placeholder="$t('register.form.firstnamePlaceholder')"
                                    v-model="state.formRegister.firstname" />
                                <FormError
                                    :error="vRules1$?.formRegister?.firstname?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.firstname?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="lastname" :label="$t('register.form.lastname')" />
                                <FormTextField id="lastname" name="lastname"
                                    :placeholder="$t('register.form.lastnamePlaceholder')"
                                    v-model="state.formRegister.lastname" />
                                <FormError :error="vRules1$?.formRegister?.lastname?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.lastname?.[0]" />
                            </div>
                        </div>
                        <div class="space-y-1 py-1">
                            <FormLabel for="email" :label="$t('register.form.emailAddress')" />
                            <FormTextField id="email" name="email"
                                :placeholder="$t('register.form.emailAddressPlaceholder')"
                                v-model="state.formRegister.email" />
                            <FormError :error="vRules1$?.formRegister?.email?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.email?.[0]" />
                        </div>
                        <!-- Chosen here, so the mail only has to confirm the address. A Google or
                             Microsoft signup signs in through the provider and is not asked. -->
                        <div class="space-y-1 py-1" v-if="!state.oauthProvider">
                            <FormLabel for="password" :label="$t('register.form.password')" />
                            <!-- name doubles as autocomplete: "new-password" keeps the browser
                                 from filling in a saved password the customer never chose. -->
                            <FormPasswordField id="password" name="new-password"
                                :placeholder="$t('register.form.passwordHint')"
                                v-model="state.formRegister.password" />
                            <FormError :error="vRules1$?.formRegister?.password?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.password?.[0]" />
                        </div>
                        <div class="space-y-1">
                            <div class="w-fit flex items-center cursor-pointer"
                                @click="state.formRegister.agreeToTerms = !state.formRegister.agreeToTerms">
                                <FormCheckbox :value="state.formRegister.agreeToTerms" />
                                <span class="text-sm">
                                    {{ $t('register.form.iHaveReadAndAcceptThe') }}
                                    <span class="cursor-pointer text-tertiary hover:text-tertiary/90"
                                        @click="navigateToTAC">
                                        {{ $t('register.form.termsAndConditions') }}
                                    </span>
                                </span>
                            </div>
                            <span v-if="state.agreeToTermsValidation" class="text-sm text-red-500">
                                <span>{{ $t('register.form.agreetoTAC') }}</span>
                            </span>
                        </div>
                    </div>
                    <!-- Step 1 has no button: picking an answer is the step. -->
                    <div class="mt-5" v-if="state.progress.currentStep > 1">
                        <FormButton type="submit" buttonStyle="primary" class="w-full"
                            v-if="state.progress.currentStep === 2">
                            {{ $t('register.form.continue') }}
                        </FormButton>
                        <FormButton type="submit" buttonStyle="primary" class="w-full" v-else>
                            {{ $t('register.form.createFreeAccount') }}
                        </FormButton>
                    </div>
                    <p class="mt-3 text-center text-sm leading-6 text-gray-500 cursor-pointer" @click="navigateTo('/')">
                        {{ $t('register.form.alreadyHaveAnAccount') }}?
                        {{ ' ' }}
                        <a class="font-semibold text-primary hover:text-primary-800 cursor-pointer">
                            {{ $t('register.form.signin') }}
                        </a>
                    </p>
                </form>
                <div v-else class="mt-10" data-testid="register-done">
                    <div class="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-25 text-primary">
                        <Icon name="ph:envelope-simple-open" class="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 class="mt-4 font-bold text-2xl md:text-3xl">{{ $t('register.done.title') }}</h3>
                    <p class="mt-2 text-sm text-gray-600">
                        {{ $t('register.done.sentTo', { email: state.registeredEmail }) }}
                    </p>
                    <ol class="mt-6 space-y-4">
                        <li class="flex gap-x-3">
                            <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">1</span>
                            <span class="text-sm text-gray-700">{{ $t('register.done.confirm') }}</span>
                        </li>
                        <li class="flex gap-x-3">
                            <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">2</span>
                            <span class="text-sm text-gray-700">{{ $t('register.done.signIn') }}</span>
                        </li>
                    </ol>
                    <p class="mt-6 text-xs text-gray-500">{{ $t('register.done.noMail') }}</p>
                </div>
            </div>
            <div class="hidden lg:block p-4">
                <div class="co-panel">
                    <div class="co-bc co-bc1"></div>
                    <div class="co-bc co-bc2"></div>
                    <div class="co-bc co-bc3"></div>
                    <div class="co-top">
                        <div class="co-logo-row">
                            <div class="co-logo-icon">
                                <div class="co-ring co-rg1"></div>
                                <div class="co-ring co-rg2"></div>
                                <div class="co-ring co-rg3"></div>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38.98 38.98" width="38" height="38"
                                    style="position:relative;z-index:2">
                                    <circle class="co-oc" cx="19.49" cy="19.49" r="18.99" fill="#1a3a5c"
                                        stroke="rgb(66,174,217)" stroke-width="1" />
                                    <circle class="co-ic" cx="19.43" cy="19.55" r="11.93" fill="rgb(66,174,217)"
                                        stroke="#fff" stroke-width="0.5" />
                                </svg>
                            </div>
                            <span class="co-wordmark">CitizenOne<sup
                                    style="font-size:10px;vertical-align:super">&#x2122;</sup></span>
                        </div>
                    </div>
                    <!-- Once the visitor has answered, the panel shows what is being set up for
                         exactly them, so the rest of the form is filling in for something already theirs. -->
                    <div class="co-mid co-mid--swap" v-if="selectedIndustry" :key="panelProfile" data-testid="register-panel-profile">
                        <div class="co-tag">{{ $t(`register.panel.${panelProfile}.tag`) }}</div>
                        <div class="co-h1">{{ $t(`register.panel.${panelProfile}.title`) }}</div>
                        <ul class="co-points">
                            <li v-for="index in [0, 1, 2]" :key="index">{{ $t(`register.panel.${panelProfile}.points[${index}]`) }}</li>
                        </ul>
                        <!-- The desktop app sells nothing (purchaseAccess.ts): no word on cards or price. -->
                        <ul v-if="!isDesktopApp" class="co-points">
                            <li>{{ $t('register.noCommitment') }}</li>
                        </ul>
                    </div>
                    <div class="co-mid" v-else>
                        <div class="co-tag">{{ $t('login.tagline') }}</div>
                        <div class="co-h1">{{ $t('login.headlineLine1') }}<br>{{ $t('login.headlineLine2') }}</div>
                        <p class="co-desc">{{ $t('login.description') }}</p>
                        <!-- This held three "Live aktivitet" counters whose numbers were made up in the
                             browser from the date and nudged every few seconds. Two promises that
                             are true instead: a signup page is the last place to invent a figure. -->
                        <ul v-if="!isDesktopApp" class="co-points">
                            <li>{{ $t('register.noCommitment') }}</li>
                            <li>{{ $t('register.youCanExplore') }}</li>
                        </ul>
                    </div>
                    <div style="display:none"><span id="animatedAsset01"></span><span id="animatedAsset02"></span></div>
                    <div class="co-foot">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)"
                            stroke-width="2" stroke-linecap="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                        {{ $t('login.gdprNote') }}
                    </div>
                </div>
            </div>
        </div>
        <ModulesUserLanguageSlideOver :isOpen="state.slideOver.isLanguageSwitcherOpen"
            @close="state.slideOver.isLanguageSwitcherOpen = false" />
    </LoadingSpinner>
</template>

<script setup lang="ts">
// Same origin as the page, so the app on another market's domain points at itself.
const canonicalUrl = `${useRequestURL().origin}/register`
import { signupSourceFromQuery } from '@/composables/signupSource'
import { BUCKETS, OTHER_INDUSTRY, VISIBLE_BEFORE_SHOW_ALL, industriesIn, industryLabel, isBucket, matchesSearch, profileOf, type IndustryOption, type SignupBucket } from '@/composables/signupSegments'
import { authService } from '@/components/api/user/AuthService'
import { industryService } from '@/components/api/user/IndustryService'
import { facilityTypeService } from '@/components/api/user/FacilityTypeService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers, minLength, sameAs } from '@vuelidate/validators'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useGtag } from '@/composables/gTags'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const isDesktopApp = useIsDesktopApp()

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
const language = useI18n()
const { successAlert } = useAlert()
const { pushSignUpEvent, pushSignupStep } = useGtag()
const { t } = useI18n()
const route = useRoute()

// Set language
language.locale.value = userStore.getLanguage

const state = reactive({
    agreeToTermsValidation: false,
    registeredEmail: '',
    error: {} as Error,
    formRegister: {
        industry: '',
        facility_type_uuid: '',
        firstname: '',
        lastname: '',
        company_name: '',
        phone: '',
        email: '',
        password: '',
        oauthProvider: '' as string,
        agreeToTerms: false
    } as any,
    isPageLoading: false,
    langOpen: false,
    // Step 1: which bucket was clicked, whether its long tail is open, and the
    // "something else" search across every industry.
    segment: {
        bucket: null as SignupBucket | null,
        showAll: false,
        searchAll: false,
        query: '',
    },
    options: {
        industries: [] as any,
        typeOfFacilities: [] as any,
    },
    progress: {
        currentStep: 1,
    },
    slideOver: {
        isLanguageSwitcherOpen: false
    },
})

const rules1 = computed(() => {
    return {
        formRegister: {
            firstname: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            lastname: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            email: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            ...(state.oauthProvider ? {} : {
                password: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                    minLength: helpers.withMessage(() => `${t('alert.setupPassword.required8Characters')}.`, minLength(8)),
                },
            }),
            // Optional since the signup form asked for a number the product never uses: it only ends
            // up in the new-user mail to support. A field that is not needed is a reason to leave.
        }
    }
})

const rules2 = computed(() => {
    return {
        formRegister: {
            company_name: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        }
    }
})
const rulesIndustry = computed(() => ({
    formRegister: {
        industry: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
    },
}))
// rules1 is the login (step 3), rules2 the organisation (step 2), rulesIndustry step 1.
const vRules1$ = useVuelidate(rules1, state)
const vRules2$ = useVuelidate(rules2, state)
const vRulesIndustry$ = useVuelidate(rulesIndustry, state)

// Where the signup came from: the website adds utm_*, gclid, landing, ref and a Salesflow sequence's sf to the register link
// (see lib/attribution.ts in the website). Kept in sessionStorage because a Google or Microsoft
// login round-trips back here with only ?email=&provider=, and the origin would be lost.
const SIGNUP_SOURCE_STORE = 'citizenone:signup-source'

function readSignupSource(): Record<string, string> {
    const fromUrl = signupSourceFromQuery(window.location.search)
    if (!fromUrl.ref && document.referrer) {
        try {
            const host = new URL(document.referrer).hostname
            if (host && !host.endsWith('citizenone.dk')) fromUrl.ref = host
        } catch { /* an unreadable referrer is no referrer */ }
    }
    try {
        if (Object.keys(fromUrl).length > 0) {
            sessionStorage.setItem(SIGNUP_SOURCE_STORE, JSON.stringify(fromUrl))
            return fromUrl
        }
        return JSON.parse(sessionStorage.getItem(SIGNUP_SOURCE_STORE) || '{}')
    } catch {
        return fromUrl
    }
}

const signupSource = ref<Record<string, string>>({})

onMounted(() => {
    signupSource.value = readSignupSource()

    // Pre-udfyld email fra OAuth redirect (Google/Microsoft)
    const urlParams = new URLSearchParams(window.location.search)
    const emailParam = urlParams.get('email')
    const providerParam = urlParams.get('provider')
    if (emailParam) {
        state.formRegister.email = emailParam
        // Vis en besked om at de skal færdiggøre registreringen
        if (providerParam) {
            state.oauthProvider = providerParam
        }
    }

    animateAssets()
    fetchAllIndustries()
    fetchAllFacilityTypes()
})

watch(() => language.locale.value, (newValue: any) => {
    if (newValue != null) {
        fetchAllIndustries()
        fetchAllFacilityTypes()
    }
})

// One bar per step, each full exactly when its step is answered. The first one
// fills on a single click, which is the point: the visitor starts out ahead.
const progressBars = computed(() => {
    const isFilled = (value: unknown) => String(value ?? '').trim().length > 0
    const account = [state.formRegister.firstname, state.formRegister.lastname, state.formRegister.email]
    if (!state.oauthProvider) account.push(state.formRegister.password)
    const accountDone = account.filter(isFilled).length + (state.formRegister.agreeToTerms ? 1 : 0)

    return [
        isFilled(state.formRegister.industry) ? 1 : 0,
        isFilled(state.formRegister.company_name) ? 1 : 0,
        accountDone / (account.length + 1),
    ]
})

const selectedIndustry = computed<IndustryOption | undefined>(() =>
    state.options.industries.find((option: IndustryOption) => option.value === state.formRegister.industry))
const selectedProfile = computed(() => profileOf(selectedIndustry.value))
// The profile the copy is written for. Beauty, teaching and unknown industries use the neutral text.
const panelProfile = computed(() => (isBucket(selectedProfile.value) ? selectedProfile.value : 'default'))

const bucketIndustries = computed(() =>
    state.segment.bucket ? industriesIn(state.segment.bucket, state.options.industries) : [])
const visibleBucketIndustries = computed(() => {
    if (!state.segment.showAll) return bucketIndustries.value.slice(0, VISIBLE_BEFORE_SHOW_ALL)
    return bucketIndustries.value.filter(option => matchesSearch(option, state.segment.query))
})
// "Other" is not offered as a profession of its own in the list; it is the
// "not on the list" button below it. Missing until OtherIndustrySeeder has run.
const otherIndustry = computed(() =>
    (state.options.industries as IndustryOption[]).find(option => option.en_name === OTHER_INDUSTRY))
const searchAllResults = computed(() => {
    const all = (state.options.industries as IndustryOption[])
        .filter(option => option.en_name !== OTHER_INDUSTRY)
        .sort((a, b) => a.label.localeCompare(b.label))
    return state.segment.query.trim() === '' ? all.slice(0, 12) : all.filter(option => matchesSearch(option, state.segment.query))
})

// The funnel, step by step (see useGtag().pushSignupStep). Step 1 is reported once
// the industries are loaded, so a link that skips it is told apart from a visitor who saw it.
const prefilled = ref(false)
watch(() => state.progress.currentStep, (step) => {
    const details = { profile: selectedProfile.value, industry: selectedIndustry.value?.en_name, prefilled: prefilled.value }
    if (step === 2) pushSignupStep('about', details)
    if (step === 3) pushSignupStep('account', details)
})

function bucketIcon(profile: string) {
    return BUCKETS.find(bucket => bucket.key === profile)?.icon ?? 'ph:dots-three-circle'
}

function industryChipClass(option: IndustryOption) {
    return ['rounded-full border px-3 py-1.5 text-sm transition-colors',
        option.value === state.formRegister.industry
            ? 'border-primary bg-primary text-white'
            : 'border-slate-200 bg-white text-gray-800 hover:border-slate-300']
}

function selectIndustry(option: IndustryOption) {
    state.formRegister.industry = option.value
    if (profileOf(option) !== 'social_welfare') state.formRegister.facility_type_uuid = ''
    state.progress.currentStep = 2
}

function chooseBucket(bucket: SignupBucket) {
    state.segment.bucket = bucket
    state.segment.searchAll = false
    state.segment.showAll = false
    state.segment.query = ''

    const industries = industriesIn(bucket, state.options.industries)
    // A dental clinic, a social service and an employment service are each one industry:
    // the click on the bucket is the whole answer.
    if (industries.length === 1) selectIndustry(industries[0])
}

function openSearchAll() {
    state.segment.bucket = null
    state.segment.showAll = false
    state.segment.query = ''
    state.segment.searchAll = true
}

function animateAssets() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in')
            } else {
                entry.target.classList.remove('animate-fade-in')
            }
        })
    })

    const animatedAsset01 = document.getElementById('animatedAsset01')
    const animatedAsset02 = document.getElementById('animatedAsset02')
    if (animatedAsset01) observer.observe(animatedAsset01)
    if (animatedAsset02) observer.observe(animatedAsset02)
}

// The marketing site already knows which professional group a visitor belongs to
// before they reach this form, and links here with that answer attached. Matching
// accepts a system name, a visible label or a uuid, so the site can link with
// whichever of the three it has to hand.
//
// Both names are matched, not only the visible one. Three of the 59 industries
// have a system name, so for the other 56 the site can only send a name, and the
// name it has is Danish. Matching the label alone would have preselected nothing
// for a visitor whose form happened to be in English, silently, which is the one
// failure mode this preselection exists to avoid.
function findOption(options: any[], wanted: string) {
    const needle = wanted.trim().toLowerCase()
    const named = (option: any, key: string) => option[key]?.toLowerCase() === needle

    return options.find((option: any) => named(option, 'system_name'))
        ?? options.find((option: any) => named(option, 'label'))
        ?? options.find((option: any) => named(option, 'dk_name') || named(option, 'en_name') || named(option, 'no_name') || named(option, 'sv_name'))
        ?? options.find((option: any) => option.value?.toLowerCase() === needle)
}

// Only fills a field the visitor has not answered yet, so an unrecognised or
// stale link never overwrites a choice made in the form.
function applyPreselection(field: 'industry' | 'facility_type_uuid', queryKey: string, options: any[]): boolean {
    const wanted = route.query[queryKey]

    if (typeof wanted !== 'string' || wanted === '' || state.formRegister[field]) return false

    const match = findOption(options, wanted)

    if (match) state.formRegister[field] = match.value

    return !!match
}

async function fetchAllIndustries() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await industryService.getAllIndustries()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (industry: any) => options.push({
                    value: industry?.uuid,
                    label: industryLabel(industry, language.locale.value),
                    system_name: industry.system_name,
                    profile: industry.profile,
                    dk_name: industry.dk_name,
                    en_name: industry.en_name,
                    no_name: industry.no_name,
                    sv_name: industry.sv_name,
                })
            )
            state.options.industries = options
            // The website has already asked "what do you do?" on the profession page the
            // visitor came from, so a link that answers it skips the question here.
            if (applyPreselection('industry', 'industry', options) && state.progress.currentStep === 1) {
                prefilled.value = true
                const chosen = options.find((option: IndustryOption) => option.value === state.formRegister.industry)
                const profile = profileOf(chosen)
                state.segment.bucket = isBucket(profile) ? profile : null
                state.progress.currentStep = 2
            } else if (state.progress.currentStep === 1) {
                pushSignupStep('segment')
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchAllFacilityTypes() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await facilityTypeService.getAllFacilityTypesWithoutAuthentication()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item?.uuid,
                    label: language.locale.value === 'en' ? item.en_name : item.dk_name,
                    dk_name: item.dk_name,
                    en_name: item.en_name,
                })
            )
            state.options.typeOfFacilities = options
            applyPreselection('facility_type_uuid', 'facility_type', options)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function register() {
    state.error = {}

    if (state.progress.currentStep === 1) {
        await vRulesIndustry$.value.$validate()
        if (!vRulesIndustry$.value.$error) state.progress.currentStep = 2
        return
    }

    if (state.progress.currentStep === 2) {
        await vRules2$.value.$validate()
        if (!vRules2$.value.$error) state.progress.currentStep = 3
        return
    }

    await vRules1$.value.$validate()
    state.agreeToTermsValidation = !state.formRegister.agreeToTerms

    if (vRules1$.value.$error || !state.formRegister.agreeToTerms) return

    state.isPageLoading = true
    try {
        const params = {
            industry_uuid: state.formRegister.industry,
            facility_type_uuid: state.formRegister.facility_type_uuid,
            firstname: state.formRegister.firstname,
            lastname: state.formRegister.lastname,
            name: state.formRegister.company_name,
            phone: state.formRegister.phone,
            email: state.formRegister.email,
            ...(state.formRegister.password ? { password: state.formRegister.password } : {}),
            ...signupSource.value,
        }
        const response = await authService.register(params)
        if (response.data) {
            pushSignUpEvent(state.oauthProvider || 'email', signupSource.value, selectedProfile.value)
            // The account cannot be signed into yet: the address has to be confirmed
            // and the company switched on. Sending her to the login form said neither,
            // so the page now says what happens next instead.
            state.registeredEmail = state.formRegister.email
        }
    } catch (error: any) {
        state.error = error

        // Send the visitor back to the step that holds the field the server rejected.
        const errors = error?.errors ?? {}
        const has = (...keys: string[]) => keys.some(key => !!errors?.[key]?.length)

        if (has('industry', 'industry_uuid')) {
            state.progress.currentStep = 1
        } else if (has('name', 'phone', 'facility_type_uuid')) {
            state.progress.currentStep = 2
        }
    }
    state.isPageLoading = false
}

function setLang(lang: string) {
    language.locale.value = lang
    userStore.setLanguage(lang)
    state.langOpen = false
}

function identifyFlag() {
    const selectedLanguage = userStore.getLanguage
    const flags: Record<string, string> = {
        en: '/img/icons/flags/united-kingdom.svg',
        dk: '/img/icons/flags/denmark.svg',
        no: '/img/icons/flags/norway.svg',
        sv: '/img/icons/flags/sweden.svg',
    }
    return flags[selectedLanguage] ?? '/img/icons/flags/united-kingdom.svg'
}

async function navigateToTAC() {
    await navigateTo('https://citizenone.dk/vilkaarogbetingelser/', {
        external: true,
        open: {
            target: '_blank',
        }
    })
}
</script>

<style scoped>
.co-panel {
    background: linear-gradient(160deg, #0f2b46 0%, #1a4a70 50%, #0a2840 100%);
    border-radius: 12px;
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 2.5rem;
    font-family: 'Inter', sans-serif
}

.co-bc {
    position: absolute;
    border-radius: 50%;
    background: rgba(66, 174, 217, 0.09)
}

.co-bc1 {
    width: 400px;
    height: 400px;
    top: -140px;
    right: -140px;
    animation: cob1 16s ease-in-out infinite
}

.co-bc2 {
    width: 240px;
    height: 240px;
    bottom: -90px;
    left: -80px;
    animation: cob2 20s ease-in-out infinite
}

.co-bc3 {
    width: 140px;
    height: 140px;
    bottom: 100px;
    right: 40px;
    animation: cob3 12s ease-in-out infinite
}

@keyframes cob1 {

    0%,
    100% {
        transform: translate(0, 0)
    }

    40% {
        transform: translate(-20px, 16px)
    }

    70% {
        transform: translate(14px, -12px)
    }
}

@keyframes cob2 {

    0%,
    100% {
        transform: translate(0, 0)
    }

    45% {
        transform: translate(22px, -18px)
    }

    75% {
        transform: translate(-12px, 12px)
    }
}

@keyframes cob3 {

    0%,
    100% {
        transform: translate(0, 0)
    }

    35% {
        transform: translate(-16px, -20px)
    }

    68% {
        transform: translate(18px, 10px)
    }
}

.co-top {
    position: relative;
    z-index: 2
}

.co-logo-row {
    display: flex;
    align-items: center;
    gap: 14px
}

.co-logo-icon {
    position: relative;
    width: 46px;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center
}

.co-ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(66, 174, 217, 0.35);
    animation: coring 3s ease-in-out infinite
}

.co-rg1 {
    width: 46px;
    height: 46px;
    animation-delay: 0s
}

.co-rg2 {
    width: 68px;
    height: 68px;
    animation-delay: 0.8s
}

.co-rg3 {
    width: 90px;
    height: 90px;
    animation-delay: 1.5s
}

@keyframes coring {
    0% {
        opacity: 0;
        transform: scale(0.8)
    }

    40% {
        opacity: 1
    }

    100% {
        opacity: 0;
        transform: scale(1.2)
    }
}


.co-oc {
    animation: cooc 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
    transform-origin: 19.49px 19.49px
}

.co-ic {
    animation: coic 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 0.65s both;
    transform-origin: 19.43px 19.55px
}

@keyframes cooc {
    from {
        transform: scale(0);
        opacity: 0
    }

    to {
        transform: scale(1);
        opacity: 1
    }
}

@keyframes coic {
    from {
        transform: scale(0);
        opacity: 0
    }

    to {
        transform: scale(1);
        opacity: 0.9
    }
}

.co-wordmark {
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.3px;
    opacity: 0;
    animation: cofu 0.5s ease 1.2s forwards
}

.co-mid {
    position: relative;
    z-index: 2;
    opacity: 0;
    animation: cofu 0.6s ease 1.4s forwards
}

/* The personalised panel replaces the first one after a click: waiting 1.4s
   for it to fade in would read as nothing happening. */
.co-mid--swap {
    animation-delay: 0.05s
}

@keyframes cofu {
    from {
        opacity: 0;
        transform: translateY(12px)
    }

    to {
        opacity: 1;
        transform: translateY(0)
    }
}

.co-tag {
    font-size: 10px;
    font-weight: 700;
    color: rgba(66, 174, 217, 0.85);
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 1rem
}

.co-h1 {
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    line-height: 1.2;
    letter-spacing: -0.8px;
    margin-bottom: 0.75rem
}

.co-desc {
    font-size: 12.5px;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.7;
    max-width: 300px;
    margin-bottom: 1.5rem
}

.co-points {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem;
    display: grid;
    gap: 10px;
    max-width: 320px
}

.co-points li {
    position: relative;
    padding-left: 22px;
    font-size: 12.5px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.75)
}

.co-points li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 5px;
    width: 10px;
    height: 6px;
    border-left: 2px solid rgb(66, 174, 217);
    border-bottom: 2px solid rgb(66, 174, 217);
    transform: rotate(-45deg)
}

.co-foot {
    position: relative;
    z-index: 2;
    opacity: 0;
    animation: cofu 0.5s ease 2s forwards;
    font-size: 10.5px;
    color: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    gap: 6px
}
</style>
