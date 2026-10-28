<template>
    <div :class="[
        'bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-100 border-l-4',
        journal.is_pinned ? 'border-l-primary' : 'border-l-secondary'
    ]" :data-uuid="journal.uuid">
        <div class="space-y-3">
            <div class="space-y-1.5">
                <div>
                    <div class="flex items-center gap-x-3 justify-between">
                        <div class="flex items-center gap-x-3">
                            <h3 class="text-md font-semibold">
                                {{ journal.title }}
                            </h3>
                            <div v-if="journal.is_pinned"
                                class="flex items-center gap-x-1 text-primary text-xs font-medium">
                                <Icon name="ph:push-pin-fill" class="size-3.5" />
                            </div>
                            <!-- Lock moved into the actions menu, so its state is shown here instead. -->
                            <div v-if="journal.is_locked">
                                <span class="inline-flex items-center gap-1 rounded-full bg-surface-100 px-2 py-1 text-xs font-medium text-slate-600">
                                    <Icon name="ph:lock" class="size-3" aria-hidden="true" />
                                    {{ $t('citizens.citizenJournals.form.locked') }}
                                </span>
                            </div>
                            <div v-if="journal.is_internal">
                                <span class="inline-flex items-center gap-1 rounded-full bg-surface-100 px-2 py-1 text-xs font-medium text-slate-600">
                                    <Icon name="ph:lock-simple" class="size-3" aria-hidden="true" />
                                    {{ $t('citizens.citizenJournals.form.internal') }}
                                </span>
                            </div>
                            <div v-if="journal.is_draft">
                                <Badge type="primary">
                                    <p class="text-xs">
                                        {{ $t('citizens.citizenJournals.form.draft') }}
                                    </p>
                                </Badge>
                            </div>
                            <div v-if="journal.is_medical_record">
                                <Badge type="primary">
                                    <p class="text-xs">
                                        {{ $t('citizens.nursingAreas.doctorJournals') }}
                                    </p>
                                </Badge>
                            </div>
                            <div v-if="journal.is_ai_used">
                                <span
                                    class="inline-flex items-center gap-1 rounded-full bg-ai-bg ring-1 ring-ai-border px-2 py-0.5 text-xs font-medium text-ai-ink">
                                    <Icon name="ph:sparkle-fill" class="size-3 shrink-0" />
                                    {{ $t('citizens.citizenJournals.aiUsed') }}
                                </span>
                            </div>
                        </div>
                        <div v-if="['Standard view', 'Risk assessment view'].includes(filterView)">
                            <Badge type="no-risk" v-if="journal.assessment === 'no risk'">
                                <p class="text-xs">
                                    {{ $t('citizens.citizenJournals.form.risk.noRisk') }}
                                </p>
                            </Badge>
                            <Badge type="increased-risk" v-if="journal.assessment === 'increased risk'">
                                <p class="text-xs">
                                    {{
                                        $t('citizens.citizenJournals.form.risk.increasedRisk')
                                    }}
                                </p>
                            </Badge>
                            <Badge type="acute-increased-risk" v-if="journal.assessment === 'acute increased risk'">
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
                <div class="text-sm text-muted-400"
                    v-if="['Standard view', 'Journal note view'].includes(filterView)">
                    <JournalMentionContent :html="journal.content" />
                </div>
                <div class="flex items-center gap-x-1"
                    v-if="['Standard view', 'Journal note view'].includes(filterView)">
                    <div class="px-2 py-1 rounded-full text-white text-xxs" :style="`background:${journalTag?.color};`"
                        v-for="(journalTag, index) in journal?.journal_tags" :index="index">
                        {{ journalTag?.name }}
                    </div>
                </div>
                <div class="text-sm text-muted-400"
                    v-if="['Standard view', 'Risk assessment view'].includes(filterView) && journal.note">
                    <p class="font-semibold">
                        {{ customPagesStore.getCustomPagesName?.riskAssessment }}:
                    </p>
                    <JournalMentionContent :html="journal.note" />
                </div>
                <div class="flex items-center gap-x-1"
                    v-if="['Standard view', 'Risk assessment view'].includes(filterView)">
                    <div class="px-2 py-1 rounded-full text-white text-xxs" :style="`background:${riskTag?.color};`"
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
                    <!-- Trailing space inside: the newline before the next span is dropped by the compiler. -->
                    <span v-if="formatJobTitles(journal.user)">({{ formatJobTitles(journal.user) }}) </span>
                    <span class="lowercase">{{ $t('citizens.citizenJournals.on') }}</span>
                    {{ formatDateTimeToReadable(journal.created_at) }}
                </p>
                <ModulesUserJournalLinkedToBadge v-if="plansAndGoalsBasePath" :journal="journal"
                    :plansAndGoalsBasePath="plansAndGoalsBasePath" />
            </div>
            <div class="ms-auto">
                <!-- Nine unlabelled icons of equal weight left people guessing which was
                     which. Edit and favourite stay in reach; the rest sit in one labelled
                     menu, and delete is set apart at the bottom. -->
                <div class="flex items-center gap-x-2">
                    <FormButton v-if="journal?.is_editable" buttonStyle="action" buttonSize="xs" class="!px-3"
                        @click="emit('edit', journal)">
                        <Icon name="ph:pencil-simple" class="size-4" aria-hidden="true" />
                        {{ $t('citizens.citizenJournals.actions.edit') }}
                    </FormButton>
                    <ModulesUserJournalFavoriteButton :journal="journal"
                        :buttonClass="journal?.is_favorite ? '' : '!bg-blue-50 !text-blue-700 !border-blue-200 hover:!border-blue-700'"
                        @updated="(j: any) => emit('favorite-updated', j)" />
                    <Menu as="div" class="relative inline-block text-left">
                        <MenuButton as="template">
                            <FormButton buttonStyle="action" buttonSize="xs"
                                :aria-label="$t('citizens.citizenJournals.actions.more')">
                                <Icon name="ph:dots-three-outline-fill" class="size-4" aria-hidden="true" />
                            </FormButton>
                        </MenuButton>
                        <transition enter-active-class="transition duration-100 ease-out"
                            enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                            leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100"
                            leave-to-class="transform scale-95 opacity-0">
                            <MenuItems
                                class="absolute left-0 z-30 mt-2 w-60 origin-top-left divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                                <div class="px-1 py-1">
                                    <MenuItem v-for="item in menuItems" :key="item.key" v-slot="{ active }">
                                        <button type="button" @click="item.run()" :data-testid="item.testid"
                                            :class="[active && 'bg-gray-100', 'group flex w-full items-center gap-2 rounded-md px-2 py-2.5 text-sm']">
                                            <Icon :name="item.icon" class="size-4 text-gray-500" aria-hidden="true" />
                                            {{ item.label }}
                                        </button>
                                    </MenuItem>
                                </div>
                                <div class="px-1 py-1" v-if="journal?.is_deletable">
                                    <MenuItem v-slot="{ active }">
                                        <button type="button" @click="emit('delete', journal)"
                                            :class="[active && 'bg-red-50', 'group flex w-full items-center gap-2 rounded-md px-2 py-2.5 text-sm text-red-600']">
                                            <Icon name="ph:trash" class="size-4" aria-hidden="true" />
                                            {{ $t('citizens.citizenJournals.actions.delete') }}
                                        </button>
                                    </MenuItem>
                                </div>
                            </MenuItems>
                        </transition>
                    </Menu>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useTerminology } from '@/composables/useTerminology'
import { useI18n } from 'vue-i18n'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'

const { formatDateToReadable, formatDateTimeToReadable } = useDatetimeFormatter()
const { term } = useTerminology()
const customPagesStore = useCustomPagesStore() as any
const language = useI18n()

const props = withDefaults(defineProps<{
    journal: any,
    filterView?: string,
    plansAndGoalsBasePath?: string,
}>(), {
    filterView: 'Standard view',
})

const emit = defineEmits<{
    edit: [journal: any],
    copy: [journal: any],
    move: [journal: any],
    'favorite-updated': [journal: any],
    'lock-unlock': [uuid: string],
    'pin-unpin': [uuid: string],
    'view-logs': [journal: any],
    'view-history': [journal: any],
    delete: [journal: any],
}>()

const menuItems = computed(() => {
    const journal = props.journal
    const t = language.t
    return [
        journal?.is_copyable && { key: 'copy', icon: 'ph:copy', label: t('citizens.citizenJournals.actions.copy'), run: () => emit('copy', journal) },
        journal?.is_movable && { key: 'move', icon: 'ph:arrows-out-cardinal', label: t('citizens.citizenJournals.actions.move'), run: () => emit('move', journal) },
        {
            key: 'pin',
            icon: journal?.is_pinned ? 'ph:push-pin-slash' : 'ph:push-pin',
            label: journal?.is_pinned ? t('citizens.citizenJournals.actions.unpin') : t('citizens.citizenJournals.actions.pin'),
            run: () => emit('pin-unpin', journal.uuid),
        },
        {
            key: 'lock',
            icon: journal?.is_locked ? 'ph:lock-open' : 'ph:lock',
            label: journal?.is_locked ? t('citizens.citizenJournals.actions.unlock') : t('citizens.citizenJournals.actions.lock'),
            run: () => emit('lock-unlock', journal.uuid),
        },
        { key: 'logs', icon: 'ph:list-magnifying-glass', label: t('citizens.citizenJournals.actions.journalLogs'), run: () => emit('view-logs', journal) },
        { key: 'history', icon: 'ph:clock-counter-clockwise', label: t('recordHistory.viewHistory'), testid: 'journal-history', run: () => emit('view-history', journal) },
    ].filter(Boolean) as { key: string, icon: string, label: string, testid?: string, run: () => void }[]
})
</script>
