<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>FindSocialeTilbud.dk - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>FindSocialeTilbud.dk</template>

            <div>
                <div class="max-w-5xl mx-auto mt-24">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
                        <div>
                            <div
                                class="bg-white ring-1 ring-gray-200 rounded-md p-8 xl:p-10 flex flex-col justify-between h-full">
                                <div>
                                    <h3 class="text-base font-semibold leading-7 text-tertiary">
                                        <span v-if="language.locale.value === 'en'">
                                            Manage your company on FindSocialeTilbud.dk
                                        </span>
                                        <span v-if="language.locale.value === 'dk'">
                                            Administrér din virksomhed på FindSocialeTilbud.dk
                                        </span>
                                    </h3>
                                    <div class="mt-5 space-y-3">
                                        <p class="text-justify text-sm">
                                            <span v-if="language.locale.value === 'en'">
                                                Get your company noticed by a wide audience on Denmark's largest
                                                platform
                                                for social services. By managing your presence on FindSocialeTilbud.dk,
                                                you can
                                                showcase your
                                                services to caseworkers, social workers, citizens, and families looking
                                                for relevant
                                                support. Easily update your
                                                offerings, ensure your information is up to date, and connect with those
                                                in need of
                                                your services.
                                            </span>
                                            <span v-if="language.locale.value === 'dk'">
                                                Få din virksomhed bemærket af et bredt publikum på Danmarks største
                                                platform for
                                                sociale
                                                tilbud. Ved at administrere din tilstedeværelse på FindSocialeTilbud.dk
                                                kan du
                                                fremhæve dine
                                                tjenester over for sagsbehandlere, socialarbejdere, borgere og familier,
                                                der søger
                                                relevant
                                                støtte. Opdater nemt dine tilbud, sørg for, at dine oplysninger er
                                                opdaterede,
                                                og skab forbindelse til dem, der har brug for dine ydelser.
                                            </span>
                                        </p>
                                        <p class="text-justify text-sm">
                                            <span v-if="language.locale.value === 'en'">
                                                Whether you're a provider of social care, counseling, or other social
                                                offerings,
                                                FindSocialeTilbud.dk is the perfect place to reach those who need your
                                                help the
                                                most.
                                            </span>
                                            <span v-if="language.locale.value === 'dk'">
                                                Uanset om du tilbyder social omsorg, rådgivning eller andre sociale
                                                ydelser,
                                                er FindSocialeTilbud.dk det perfekte sted at nå dem, der har mest brug
                                                for din
                                                hjælp.
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div class="mt-8">
                                    <FormButton type="button" buttonStyle="primary" class="w-full"
                                        @click="state.modal.isManageCompanyOpen = true">
                                        {{ $t('findsocialetilbuddk.manageCompany.manageCompany') }}
                                    </FormButton>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div
                                class="bg-white ring-1 ring-gray-200 rounded-md p-8 xl:p-10 flex flex-col justify-between h-full">
                                <div>
                                    <h3 class="text-base font-semibold leading-7 text-tertiary">
                                        {{ $t('findsocialetilbuddk.showInterest.getInquiriesViaFindSocialeTilbudDk') }}
                                    </h3>
                                    <div class="mt-5 space-y-3">
                                        <p class="text-justify text-sm">
                                            <span v-if="language.locale.value === 'en'">
                                                FindSocialeTilbud.dk - Denmark's largest search engine for social
                                                services -
                                                provides easy access to important social resources. Through the
                                                platform,
                                                caseworkers, social
                                                workers, relatives, citizens, and other stakeholders can quickly find
                                                relevant
                                                services
                                                and offerings.
                                            </span>
                                            <span v-if="language.locale.value === 'dk'">
                                                FindSocialeTilbud.dk er Danmarks største søgemaskine for sociale tilbud,
                                                der giver
                                                nem
                                                adgang til vigtige sociale ressourcer. Platformen gør det muligt for
                                                sagsbehandlere,
                                                socialarbejdere, pårørende, borgere og andre interessenter hurtigt at
                                                finde
                                                relevante
                                                tjenester og tilbud.
                                            </span>
                                        </p>
                                        <p class="text-justify text-sm">
                                            <span v-if="language.locale.value === 'en'">
                                                Whether you're looking for assistance for a citizen, support for
                                                relatives, or
                                                social services
                                                in your area, you can rely on FindSocialeTilbud.dk to deliver accurate
                                                and
                                                up-to-date results,
                                                making it easier to make informed decisions.
                                            </span>
                                            <span v-if="language.locale.value === 'dk'">
                                                Uanset om du søger hjælp til en borger, støtte til pårørende eller
                                                sociale tilbud i
                                                dit
                                                område, kan du stole på FindSocialeTilbud.dk til at levere præcise og
                                                opdaterede
                                                resultater, hvilket gør det nemmere at træffe velinformerede
                                                beslutninger.
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div class="mt-8">
                                    <FormButton type="button" buttonStyle="primary" class="w-full"
                                        @click="state.modal.isShowInterestOpen = true">
                                        {{ $t('findsocialetilbuddk.showInterest.showInterest') }}
                                    </FormButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ModulesFindsocialetilbuddkModalManageCompany :isModalOpen="state.modal.isManageCompanyOpen"
                @close="state.modal.isManageCompanyOpen = false" />
            <ModulesFindsocialetilbuddkModalShowInterest :isModalOpen="state.modal.isShowInterestOpen"
                @close="state.modal.isShowInterestOpen = false" />
        </NuxtLayout>
    </div>
</template>


<script setup lang="ts">
import { useI18n } from "vue-i18n"

const runtimeConfig = useRuntimeConfig()
const language = useI18n()

const state = reactive({
    modal: {
        isManageCompanyOpen: false,
        isShowInterestOpen: false,
    },
})
</script>