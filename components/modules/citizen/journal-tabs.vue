<template>
    <div>
        <div class="block md:hidden">
            <label for="selected-tab" class="sr-only">Select a tab</label>
            <select id="selected-tab" name="selected-tab"
                class="block w-full rounded-md border border-tertiary py-2 pl-3 pr-10 text-base focus:border-tertiary focus:outline-none focus:ring-tertiary-500 sm:text-sm"
                @change="changeTab">
                <option value="Journals" :selected="'citizens-uuid-journals' === $route.name">
                    {{ $t('citizens.tabs.journals') }}
                </option>
                <option value="Medicine Journals" :selected="'citizens-uuid-medicine-journals' === $route.name">
                    {{ $t('citizens.tabs.medicineCard') }}
                </option>
                <option value="Plans and Goals" :selected="'citizens-uuid-plans-and-goals' === $route.name">
                    {{ $t('citizens.tabs.plansAndGoals') }}
                </option>
                <option value="Nursing Areas" :selected="'citizens-uuid-nursing-areas' === $route.name" disabled="true">
                    {{ $t('citizens.tabs.nursingAreas') }} ({{ $t('comingSoon') }})
                </option>
                <option value="Documents" :selected="'citizens-uuid-documents' === $route.name">
                    {{ $t('citizens.tabs.documents') }}
                </option>
                <option value="Attendance" :selected="'citizens-uuid-attendance' === $route.name">
                    {{ $t('citizens.tabs.attendance') }}
                </option>
                <option value="Calendar" :selected="'citizens-uuid-calendar' === $route.name">
                    {{ $t('citizens.tabs.calendar') }}
                </option>
                <option value="Economy" :selected="'citizens-uuid-economy' === $route.name" disabled="true">
                    {{ $t('citizens.tabs.economy') }} ({{ $t('comingSoon') }})
                </option>
                <option value="Contacts" :selected="'citizens-uuid-contacts' === $route.name" disabled="true">
                    {{ $t('citizens.tabs.contacts') }} ({{ $t('comingSoon') }})
                </option>
            </select>
        </div>
        <div class="hidden md:block">
            <div class="border-b border-gray-200">
                <nav class="-mb-px flex flex-wrap space-x-2">
                    <a class="whitespace-nowrap px-4 py-4 border-b-2 font-medium text-sm cursor-pointer"
                        :class="'citizens-uuid-journals' === $route.name ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'"
                        @click="navigateTo(`/citizens/${uuid}/journals`)">
                        {{ $t('citizens.tabs.journals') }}
                    </a>
                    <a class="whitespace-nowrap px-4 py-4 border-b-2 font-medium text-sm cursor-pointer"
                        :class="'citizens-uuid-medicine-journals' === $route.name ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'"
                        @click="navigateTo(`/citizens/${uuid}/medicine-journals`)">
                        {{ $t('citizens.tabs.medicineCard') }}
                    </a>
                    <a class="whitespace-nowrap px-4 py-4 border-b-2 font-medium text-sm cursor-pointer"
                        :class="'citizens-uuid-plans-and-goals' === $route.name ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'"
                        @click="navigateTo(`/citizens/${uuid}/plans-and-goals`)">
                        {{ $t('citizens.tabs.plansAndGoals') }}
                    </a>
                    <a class="relative whitespace-nowrap px-4 py-4 border-b-2 font-medium text-sm cursor-not-allowed"
                        :class="'citizens-uuid-nursing-areas' === $route.name ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'">
                        {{ $t('citizens.tabs.nursingAreas') }}
                        <Badge type="coming-soon" class="absolute -top-3 text-[8px]" :class="[
                            selectedLanguage === 'en' && 'left-8',
                            selectedLanguage === 'dk' && 'left-12',
                        ]">
                            {{ $t('comingSoon') }}
                        </Badge>
                    </a>
                    <a class="whitespace-nowrap px-4 py-4 border-b-2 font-medium text-sm cursor-pointer"
                        :class="'citizens-uuid-documents' === $route.name ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'"
                        @click="navigateTo(`/citizens/${uuid}/documents`)">
                        {{ $t('citizens.tabs.documents') }}
                    </a>
                    <a class="whitespace-nowrap px-4 py-4 border-b-2 font-medium text-sm cursor-pointer"
                        :class="'citizens-uuid-attendance' === $route.name ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'"
                        @click="navigateTo(`/citizens/${uuid}/attendance`)">
                        {{ $t('citizens.tabs.attendance') }}
                    </a>
                    <a class="whitespace-nowrap px-4 py-4 border-b-2 font-medium text-sm cursor-pointer"
                        :class="'citizens-uuid-calendar' === $route.name ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'"
                        @click="navigateTo(`/citizens/${uuid}/calendar`)">
                        {{ $t('citizens.tabs.calendar') }}
                    </a>
                    <a class="relative whitespace-nowrap px-4 py-4 border-b-2 font-medium text-sm cursor-not-allowed"
                        :class="'citizens-uuid-economy' === $route.name ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'">
                        {{ $t('citizens.tabs.economy') }}
                        <Badge type="coming-soon" class="absolute -top-3 text-[8px]" :class="[
                            selectedLanguage === 'en' && 'left-3.5',
                            selectedLanguage === 'dk' && 'left-3',
                        ]">
                            {{ $t('comingSoon') }}
                        </Badge>
                    </a>
                    <a class="whitespace-nowrap px-4 py-4 border-b-2 font-medium text-sm cursor-pointer"
                        :class="'citizens-uuid-contacts' === $route.name ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'"
                        @click="navigateTo(`/citizens/${uuid}/contacts`)">
                        {{ $t('citizens.tabs.contacts') }}
                    </a>
                </nav>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"

const language = useI18n()
const selectedLanguage = language?.locale

const router = useRouter()
const uuid = router?.currentRoute?.value?.params?.uuid

// const tabs = [
//     { name: 'citizens.tabs.journals', href: `/citizens/${uuid}/journals`, routeName: 'citizens-uuid-journals' },
//     { name: 'citizens.tabs.medicineCard', href: `/citizens/${uuid}/medicine-journals`, routeName: 'citizens-uuid-medicine-journals' },
//     { name: 'citizens.tabs.plansAndGoals', href: `/citizens/${uuid}/plans-and-goals`, routeName: 'citizens-uuid-plans-and-goals' },
//     { name: 'citizens.tabs.documents', href: `/citizens/${uuid}/documents`, routeName: 'citizens-uuid-documents' },
//     { name: 'citizens.tabs.attendance', href: `/citizens/${uuid}/attendance`, routeName: 'citizens-uuid-attendance' },
//     { name: 'citizens.tabs.calendar', href: `/citizens/${uuid}/calendar`, routeName: 'citizens-uuid-calendar' },
// ]

function changeTab(event: any) {
    const value = event?.target?.value
    if (value === 'Journals') {
        navigateTo(`/citizens/${uuid}/journals`)
    }
    else if (value === 'Medicine Journals') {
        navigateTo(`/citizens/${uuid}/medicine-journals`)
    }
    else if (value === 'Plans and Goals') {
        navigateTo(`/citizens/${uuid}/plans-and-goals`)
    }
    else if (value === 'Documents') {
        navigateTo(`/citizens/${uuid}/documents`)
    }
    else if (value === 'Attendance') {
        navigateTo(`/citizens/${uuid}/attendance`)
    }
    else if (value === 'Calendar') {
        navigateTo(`/citizens/${uuid}/calendar`)
    }
}
</script>