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
                                    class="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary">
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
                <div class="flex items-center gap-x-2">
                    <Tooltip :text="$t('citizens.citizenJournals.actions.edit')" v-if="journal?.is_editable">
                        <FormButton :aria-label="$t('citizens.citizenJournals.actions.edit')" buttonStyle="primary"
                            buttonSize="xs" @click="emit('edit', journal)">
                            <Icon name="ph:pencil-duotone" class="size-4" />
                        </FormButton>
                    </Tooltip>
                    <Tooltip :text="$t('citizens.citizenJournals.actions.copy')" v-if="journal?.is_copyable">
                        <FormButton :aria-label="$t('citizens.citizenJournals.actions.copy')" buttonStyle="primary"
                            buttonSize="xs" @click="emit('copy', journal)">
                            <Icon name="ph:copy" class="size-4" />
                        </FormButton>
                    </Tooltip>
                    <Tooltip :text="$t('citizens.citizenJournals.actions.move')" v-if="journal?.is_movable">
                        <FormButton :aria-label="$t('citizens.citizenJournals.actions.move')" buttonStyle="primary"
                            buttonSize="xs" @click="emit('move', journal)">
                            <Icon name="ph:arrows-out-cardinal" class="size-4" />
                        </FormButton>
                    </Tooltip>
                    <ModulesUserJournalFavoriteButton :journal="journal" @updated="(j: any) => emit('favorite-updated', j)" />
                    <Tooltip
                        :text="journal?.is_locked ? `Unlock ${term('journal', 'Journal')}` : `Lock ${term('journal', 'Journal')}`">
                        <FormButton
                            :aria-label="journal?.is_locked ? `Unlock ${term('journal', 'Journal')}` : `Lock ${term('journal', 'Journal')}`"
                            buttonSize="xs" :class="[
                                journal?.is_locked && 'border-primary bg-primary text-white',
                                'w-full md:w-fit']" @click="emit('lock-unlock', journal.uuid)">
                            <Icon name="ph:lock" class="size-4" v-if="journal.is_locked" />
                            <Icon name="ph:lock-open" class="size-4" v-else />
                        </FormButton>
                    </Tooltip>
                    <Tooltip
                        :text="journal?.is_pinned ? `Unpin ${term('journal', 'Journal')}` : `Pin ${term('journal', 'Journal')}`">
                        <FormButton
                            :aria-label="journal?.is_pinned ? `Unpin ${term('journal', 'Journal')}` : `Pin ${term('journal', 'Journal')}`"
                            buttonSize="xs" :class="[
                                journal?.is_pinned && 'border-primary bg-primary text-white',
                                'w-full md:w-fit']" @click="emit('pin-unpin', journal.uuid)">
                            <Icon name="ph:push-pin-fill" class="size-4" v-if="journal.is_pinned" />
                            <Icon name="ph:push-pin" class="size-4" v-else />
                        </FormButton>
                    </Tooltip>
                    <Tooltip :text="`${term('journal', 'Journal')} logs`">
                        <FormButton :aria-label="`${term('journal', 'Journal')} logs`" buttonStyle="primary"
                            buttonSize="xs" @click="emit('view-logs', journal)">
                            <Icon name="ph:clock-clockwise" class="size-4" />
                        </FormButton>
                    </Tooltip>
                    <Tooltip :text="$t('recordHistory.viewHistory')">
                        <FormButton :aria-label="$t('recordHistory.viewHistory')" buttonStyle="action" buttonSize="xs"
                            data-testid="journal-history" @click="emit('view-history', journal)">
                            <Icon name="ph:clock-counter-clockwise" class="size-4" />
                        </FormButton>
                    </Tooltip>
                    <Tooltip :text="$t('citizens.citizenJournals.actions.delete')">
                        <FormButton :aria-label="$t('citizens.citizenJournals.actions.delete')" buttonStyle="danger"
                            buttonSize="xs" @click="emit('delete', journal)" v-if="journal?.is_deletable">
                            <Icon name="ph:trash-duotone" class="size-4" />
                        </FormButton>
                    </Tooltip>
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

const { formatDateToReadable, formatDateTimeToReadable } = useDatetimeFormatter()
const { term } = useTerminology()
const customPagesStore = useCustomPagesStore() as any
const language = useI18n()

withDefaults(defineProps<{
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
</script>
