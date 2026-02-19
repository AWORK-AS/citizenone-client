<template>

    <Head>
        <Title>
            {{ $t('citizens.citizenJournals.shareJournal.citizenJournal') }} - {{ runtimeConfig?.public?.appName }}
        </Title>
    </Head>

    <LoadingSpinner :isActive="state.isPageLoading">
        <div
            class="bg-[#f5fafe] relative overflow-clip flex min-h-screen flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
            <img src="/img/icons/asset-01.svg" alt="Image failed to load"
                class="w-52 md:w-1/5 absolute -top-28 -right-24 opacity-0 transition-opacity duration-500"
                id="animatedAsset01">
            <img src="/img/icons/asset-02.svg" alt="Image failed to load"
                class="w-52 md:w-1/4 absolute -bottom-48 -left-44 opacity-0 transition-opacity duration-500"
                id="animatedAsset02">
            <div class="px-4 md:px-0 sm:mx-auto sm:w-full sm:max-w-3xl relative">
                <Logo @click="navigateTo('/')" class="mx-auto" />
                <button type="button" class="-m-2.5 rounded-full w-8 absolute right-5 top-1.5" @click="selectLanguage">
                    <img :src="identifyFlag()" alt="flag">
                </button>
            </div>

            <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-3xl">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <div class="mt-5 md:bg-white md:shadow-sm sm:rounded-lg">
                    <form class="mt-5 px-6 py-3 sm:px-12 md:py-8" method="POST" @submit.prevent="fetchJournals"
                        v-if="!state.showJournal">
                        <div class="space-y-3">
                            <h3 class="font-medium text-lg md:text-xl">
                                {{ $t('citizens.citizenJournals.shareJournal.form.unlockJournal') }}
                            </h3>
                            <div class="space-y-1">
                                <FormLabel for="password"
                                    :label="$t('citizens.citizenJournals.shareJournal.form.password')" />
                                <FormTextField id="password" name="password"
                                    :placeholder="$t('citizens.citizenJournals.shareJournal.form.password')"
                                    v-model="state.formSecuredJournals.password" />
                                <FormError
                                    :error="v$?.formSecuredJournals?.password?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.password?.[0]" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <FormButton type="submit" buttonStyle="primary" class="w-full">
                                {{ $t('citizens.citizenJournals.shareJournal.form.unlock') }}
                            </FormButton>
                        </div>
                    </form>
                    <div v-else class="space-y-5">
                        <div class="bg-white ring-1 ring-gray-200 rounded-md p-5 border-l-4 border-secondary"
                            v-for="(journal, index) in state.journals?.data" :key="index">
                            <div class="space-y-3">
                                <div class="space-y-1.5">
                                    <div>
                                        <div class="flex items-center gap-x-3 justify-between">
                                            <div class="flex items-center gap-x-3">
                                                <h3 class="text-md font-semibold">
                                                    {{ journal.title }}
                                                </h3>
                                                <div v-if="journal.is_draft">
                                                    <Badge type="primary">
                                                        <p class="text-xs">
                                                            {{ $t('citizens.citizenJournals.form.draft') }}
                                                        </p>
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div>
                                                <Badge type="no-risk" v-if="journal.assessment === 'no risk'">
                                                    <p class="text-xs">
                                                        {{ $t('citizens.citizenJournals.form.risk.noRisk') }}
                                                    </p>
                                                </Badge>
                                                <Badge type="increased-risk"
                                                    v-if="journal.assessment === 'increased risk'">
                                                    <p class="text-xs">
                                                        {{
                                                            $t('citizens.citizenJournals.form.risk.increasedRisk')
                                                        }}
                                                    </p>
                                                </Badge>
                                                <Badge type="acute-increased-risk"
                                                    v-if="journal.assessment === 'acute increased risk'">
                                                    <p class="text-xs">
                                                        {{
                                                            $t('citizens.citizenJournals.form.risk.acuteIncreasedRisk')
                                                        }}
                                                    </p>
                                                </Badge>
                                            </div>
                                        </div>
                                        <p class="mt-1 text-xs text-muted-400">
                                            <span>{{ formatDateToReadable(journal.date) }}</span>
                                        </p>
                                        <div class="mt-1">
                                            <Badge type="primary" class="w-fit" v-if="journal.score">
                                                <p class="text-xxs" v-if="journal.score === 1">
                                                    {{
                                                        $t('plansandgoals.table.expectedLevels.minorChallenges')
                                                    }}
                                                </p>
                                                <p class="text-xxs" v-if="journal.score === 2">
                                                    {{
                                                        $t('plansandgoals.table.expectedLevels.moderateChallenges')
                                                    }}
                                                </p>
                                                <p class="text-xxs" v-if="journal.score === 3">
                                                    {{
                                                        $t('plansandgoals.table.expectedLevels.significantChallenges')
                                                    }}
                                                </p>
                                                <p class="text-xxs" v-if="journal.score === 4">
                                                    {{
                                                        $t('plansandgoals.table.expectedLevels.severeChallenges')
                                                    }}
                                                </p>
                                                <p class="text-xxs" v-if="journal.score === 5">
                                                    {{
                                                        $t('plansandgoals.table.expectedLevels.verySubstantialChallenges')
                                                    }}
                                                </p>
                                            </Badge>
                                        </div>
                                    </div>
                                    <p class="text-sm text-muted-400">
                                        <div v-html="journal.content" class="content" />
                                    </p>
                                    <div class="flex items-center gap-x-1">
                                        <div class="px-2 py-1 rounded-full text-white text-xxs"
                                            :style="`background:${journalTag?.color};`"
                                            v-for="(journalTag, index) in journal?.journal_tags" :index="index">
                                            {{ journalTag?.name }}
                                        </div>
                                    </div>
                                    <div class="text-sm text-muted-400">
                                        <p class="font-semibold">
                                            {{ $t('citizens.citizenJournals.form.riskAssessment.riskAssessment') }}:
                                        </p>
                                        <div v-html="journal.note" class="content" />
                                    </div>
                                    <div class="flex items-center gap-x-1">
                                        <div class="px-2 py-1 rounded-full text-white text-xxs"
                                            :style="`background:${riskTag?.color};`"
                                            v-for="(riskTag, index) in journal?.risk_tags" :index="index">
                                            {{ riskTag?.name }}
                                        </div>
                                    </div>
                                    <div class="text-sm">
                                        <p v-for="(tooth, index) in journal?.teeth" :key="index">
                                            {{ tooth?.number }}.
                                            {{ language.locale.value === 'en' ? tooth?.en_name : tooth?.dk_name }}
                                        </p>
                                    </div>
                                    <p class="text-xs">
                                        {{ $t('citizens.citizenJournals.createdBy') }}:
                                        {{ journal.user?.firstname }} {{ journal.user?.lastname }}
                                        <span class="lowercase">{{ $t('citizens.citizenJournals.on') }}</span>
                                        {{ formatDateTimeToReadable(journal.created_at) }}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div v-if="state.journals?.data?.length === 0">
                            <p class="text-center py-10">
                                {{ $t('theresNoDataAvailableToDisplay') }}.
                            </p>
                        </div>
                        <Pagination :data="state.journals" @previous="previous" @next="next" />
                    </div>
                </div>
            </div>
        </div>
        <ModulesUserLanguageSlideOver :isOpen="state.slideOver.isLanguageSwitcherOpen"
            @close="state.slideOver.isLanguageSwitcherOpen = false" />
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { journalService } from '@/components/api/guest/JournalService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { fileHelper } from '@/composables/fileHelper'
import { saveAs } from 'file-saver'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
const language = useI18n()
const { formatDateToReadable, formatDateTimeToReadable } = useDatetimeFormatter()
const { t } = useI18n()
const router = useRouter()
const sharedJournalUuid = router?.currentRoute?.value?.params?.journal_uuid
let currentTablePage = 1

// Set language
language.locale.value = userStore.getLanguage

const state = reactive({
    error: {} as Error,
    formSecuredJournals: {
        password: '',
    },
    isPageLoading: false,
    journals: [] as any,
    modal: {
        isReplySecuredMailOpen: false,
    },
    showJournal: false,
    slideOver: {
        isLanguageSwitcherOpen: false
    },
})

const rules = computed(() => {
    return {
        formSecuredJournals: {
            password: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        }
    }
})
const v$ = useVuelidate(rules, state)

onMounted(() => {
    animateAssets()
})

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

    const animatedAsset01 = document.getElementById('animatedAsset01') as any
    const animatedAsset02 = document.getElementById('animatedAsset02') as any
    observer.observe(animatedAsset01)
    observer.observe(animatedAsset02)
}

async function fetchJournals() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        state.isPageLoading = true
        try {
            const params = {
                page: currentTablePage,
                password: state.formSecuredJournals.password,
            }
            const response = await journalService.unlockJournal(sharedJournalUuid, params)
            if (response) {
                state.journals = response
                state.showJournal = true
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}

function previous() {
    currentTablePage--
    fetchJournals()
}

function next() {
    currentTablePage++
    fetchJournals()
}

function selectLanguage() {
    state.slideOver.isLanguageSwitcherOpen = true
}

function identifyFlag() {
    const selectedLanguage = userStore.getLanguage
    if (selectedLanguage === 'en') {
        return '/img/icons/flags/united-kingdom.svg'
    } else {
        if (selectedLanguage === 'dk') {
            return '/img/icons/flags/denmark.svg'
        }
    }
}
</script>