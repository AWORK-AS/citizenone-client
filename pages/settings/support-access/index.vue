<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('supportAccess.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('supportAccess.title') }}</template>

            <div class="mt-8 space-y-6">
                <p class="text-sm text-gray-600 max-w-3xl">
                    {{ $t('supportAccess.intro') }}
                </p>

                <Alert type="danger" :text="state.error" v-if="state.error" />

                <!-- Det der venter på et svar. Øverst, fordi det er det eneste på siden
                     der har en frist: svarer ingen, bortfalder anmodningen. -->
                <section>
                    <h2 class="text-base font-semibold text-gray-900 mb-3">
                        {{ $t('supportAccess.pending.heading') }}
                    </h2>

                    <div v-if="pending.length === 0"
                        class="bg-white ring-1 ring-gray-200 rounded-md px-4 py-6 text-sm text-gray-500">
                        {{ $t('supportAccess.pending.empty') }}
                    </div>

                    <div v-for="item in pending" :key="item.uuid"
                        class="bg-white ring-1 ring-gray-200 rounded-md px-4 py-4 mb-3">
                        <div class="flex flex-wrap items-start justify-between gap-3">
                            <div class="min-w-0">
                                <p class="text-sm font-semibold text-gray-900">
                                    {{ item.requested_by?.name }}
                                    <span class="font-normal text-gray-500">{{ item.requested_by?.email }}</span>
                                </p>
                                <p class="text-sm text-gray-600 mt-0.5">
                                    {{ $t('supportAccess.pending.wantsAccessTo', { name: item.user?.name }) }}
                                </p>
                                <p class="text-xs text-gray-500 mt-1">
                                    {{ $t('supportAccess.pending.answerBefore') }}
                                    {{ formatDateTime(item.expires_at) }}
                                    <span v-if="item.case_reference"> &middot; {{ item.case_reference }}</span>
                                </p>
                            </div>

                            <div class="flex gap-2 shrink-0">
                                <FormButton type="button" buttonStyle="secondary" :disabled="state.isSaving"
                                    @click="decide(item, false)">
                                    {{ $t('supportAccess.pending.deny') }}
                                </FormButton>
                                <FormButton type="button" :disabled="state.isSaving" @click="decide(item, true)">
                                    {{ $t('supportAccess.pending.approve') }}
                                </FormButton>
                            </div>
                        </div>

                        <!-- Begrundelsen ordret. Det er hele grundlaget for at kunne svare,
                             så den står som den blev skrevet og forkortes ikke. -->
                        <div class="mt-3 bg-gray-50 border-l-2 border-secondary px-3 py-2 text-sm text-gray-700 whitespace-pre-line">
                            {{ item.reason }}
                        </div>
                    </div>
                </section>

                <!-- Aktiv adgang. Egen sektion frem for en etiket i en liste: det er den
                     ene tilstand hvor nogen er inde hos jer lige nu. -->
                <section v-if="active.length">
                    <h2 class="text-base font-semibold text-gray-900 mb-3">
                        {{ $t('supportAccess.active.heading') }}
                    </h2>

                    <div v-for="item in active" :key="item.uuid"
                        class="bg-white ring-1 ring-amber-300 rounded-md px-4 py-4 mb-3">
                        <div class="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p class="text-sm font-semibold text-gray-900">{{ item.requested_by?.name }}</p>
                                <p class="text-sm text-gray-600">
                                    {{ $t('supportAccess.active.until', {
                                        name: item.user?.name,
                                        time: formatDateTime(item.access_expires_at),
                                    }) }}
                                </p>
                            </div>

                            <FormButton type="button" buttonStyle="danger" :disabled="state.isSaving"
                                @click="revoke(item)">
                                {{ $t('supportAccess.active.revoke') }}
                            </FormButton>
                        </div>
                    </div>
                </section>

                <!-- Loggen. Den halvdel af aftalen der ikke kan rekonstrueres bagefter. -->
                <section>
                    <h2 class="text-base font-semibold text-gray-900 mb-3">
                        {{ $t('supportAccess.history.heading') }}
                    </h2>

                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.history"
                            :isLoading="state.isTableLoading">
                            <template #body v-if="!(state.isTableLoading || state.history?.data?.length === 0)">
                                <tr v-for="entry in state.history?.data" :key="entry.uuid">
                                    <td>{{ formatDateTime(entry.started_at) }}</td>
                                    <td>{{ entry.impersonator?.name }}</td>
                                    <td>{{ entry.user?.name }}</td>
                                    <td>
                                        <span v-if="entry.is_break_glass"
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                            {{ $t('supportAccess.history.breakGlass') }}
                                        </span>
                                        <span v-else
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            {{ $t('supportAccess.history.approved') }}
                                        </span>
                                    </td>
                                    <td class="max-w-md">
                                        <span class="text-sm text-gray-600">{{ entry.reason }}</span>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                </section>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { supportAccessService } from '@/components/api/user/SupportAccessService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

/**
 * Kundens side af bank-på-adgangen.
 *
 * Tre sektioner, fordi de tre tilstande kræver tre forskellige handlinger: noget der
 * venter på et svar og har en frist, noget der er åbent lige nu og kan lukkes, og noget
 * der er sket og kun kan læses.
 *
 * Loggen er ikke pynt. Den er den halvdel af databehandleraftalen der ikke kan
 * rekonstrueres bagefter, og den er grunden til at en godkendelse er til at leve med:
 * kunden kan se hvad der faktisk skete med det ja de gav.
 */
const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    error: '',
    isSaving: false,
    isTableLoading: true,
    requests: [] as any[],
    history: null as any,
    columnHeaders: [
        { name: 'supportAccess.history.when', isTranslateName: true },
        { name: 'supportAccess.history.who', isTranslateName: true },
        { name: 'supportAccess.history.account', isTranslateName: true },
        { name: 'supportAccess.history.basis', isTranslateName: true },
        { name: 'supportAccess.history.reason', isTranslateName: true },
    ],
})

const pending = computed(() => state.requests.filter((item: any) => item.is_actionable))
const active = computed(() => state.requests.filter((item: any) => item.grants_access_now))

onMounted(() => {
    load()
    loadHistory()
})

async function load() {
    state.error = ''

    try {
        const response = await supportAccessService.getRequests()
        state.requests = response?.data ?? []
    } catch (error: any) {
        state.error = error?.message ?? error
    }
}

async function loadHistory() {
    state.isTableLoading = true

    try {
        state.history = await supportAccessService.getHistory()
    } catch (error: any) {
        state.error = error?.message ?? error
    } finally {
        state.isTableLoading = false
    }
}

async function decide(item: any, approved: boolean) {
    state.isSaving = true
    state.error = ''

    try {
        await supportAccessService.decide(item.uuid, { approved })
        await load()
        successAlert(
            `${t('alert.success')}!`,
            approved ? t('supportAccess.alert.approved') : t('supportAccess.alert.denied'),
        )
    } catch (error: any) {
        // Blandt andet 409: anmodningen er udløbet eller allerede besvaret. Beskeden fra
        // backenden siger hvad tilstanden er, og listen hentes igen, så skærmen holder op
        // med at vise en knap der ikke kan bruges.
        state.error = error?.message ?? error
        await load()
    } finally {
        state.isSaving = false
    }
}

async function revoke(item: any) {
    state.isSaving = true
    state.error = ''

    try {
        await supportAccessService.revoke(item.uuid)
        await load()
        await loadHistory()
        successAlert(`${t('alert.success')}!`, t('supportAccess.alert.revoked'))
    } catch (error: any) {
        state.error = error?.message ?? error
        await load()
    } finally {
        state.isSaving = false
    }
}

function formatDateTime(value: string | null): string {
    if (!value) return '—'

    return new Date(value).toLocaleString('da-DK', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}
</script>
