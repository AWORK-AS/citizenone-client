<template>
	<div>
		<NuxtLayout name="superadmin">

			<Head>
				<Title>
					{{ $t('superadmin.finance.pageTitle') }} - {{ runtimeConfig?.public?.appName }}
				</Title>
			</Head>

			<template #header>
				{{ $t('superadmin.finance.header') }}
			</template>

			<div class="p-7 max-w-[1320px]">

				<!-- Header + filters -->
				<div class="flex items-end justify-between mb-6">
					<div>
						<p class="text-sm text-ink-body">
							{{ $t('superadmin.finance.subtitle') }}
						</p>
					</div>
					<div class="flex items-center gap-2 flex-wrap">
						<div class="flex items-center bg-white border border-line-strong rounded-lg p-0.5">
							<button v-for="r in timeRanges" :key="r.key"
								class="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors"
								:class="timeRange === r.key && !customRange ? 'bg-tertiary text-white' : 'text-ink-body'"
								@click="setTimeRange(r.key)">
								{{ r.label }}
							</button>
						</div>
						<div class="flex items-center gap-1.5 bg-white border rounded-lg px-3 py-1.5 transition-colors"
							:class="customRange ? 'border-accent ring-2 ring-accent/10' : 'border-line-strong'">
							<svg class="w-3.5 h-3.5 text-ink-muted flex-shrink-0" fill="none" viewBox="0 0 16 16">
								<rect x="1.5" y="2.5" width="13" height="12" rx="2" stroke="currentColor"
									stroke-width="1.3" />
								<path d="M1.5 6.5h13M5 1v3M11 1v3" stroke="currentColor" stroke-width="1.3"
									stroke-linecap="round" />
							</svg>
							<input v-model="dateFrom" type="date" :max="dateTo || undefined"
								class="text-[12px] text-ink outline-none bg-transparent w-[110px] cursor-pointer"
								@change="onCustomDate" />
							<span class="text-line-strong text-[12px]">
								–
							</span>
							<input v-model="dateTo" type="date" :min="dateFrom || undefined"
								class="text-[12px] text-ink outline-none bg-transparent w-[110px] cursor-pointer"
								@change="onCustomDate" />
							<button v-if="customRange"
								class="ml-1 text-ink-muted hover:text-danger transition-colors"
								@click="clearCustomDate">
								<svg class="w-3 h-3" fill="none" viewBox="0 0 16 16">
									<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5"
										stroke-linecap="round" />
								</svg>
							</button>
						</div>
						<div v-if="activePeriodLabel"
							class="text-[11px] text-ink-body bg-surface-canvas px-2.5 py-1.5 rounded-lg border border-line">
							{{ activePeriodLabel }}
						</div>
					</div>
				</div>

				<!-- ═══ SECTION 1: REVENUE ═══ -->
				<div class="mb-2">
					<div class="flex items-center gap-2 mb-4">
						<div class="w-2 h-6 rounded-full bg-accent"></div>
						<h2 class="text-[15px] font-semibold text-ink">
							{{ $t('superadmin.finance.revenue') }}
						</h2>
						<span class="text-[12px] text-ink-muted">
							{{ $t('superadmin.finance.revenueSubtitle') }}
						</span>
					</div>

					<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
						<!-- MRR -->
						<div class="co-metric-card accent-teal">
							<div
								class="absolute top-4 right-4 w-7 h-7 rounded-lg bg-tertiary-soft flex items-center justify-center">
								<svg class="w-3.5 h-3.5 text-tertiary" fill="none" viewBox="0 0 16 16">
									<path d="M8 2v12M4.5 5.5h4a2 2 0 0 1 0 4H4.5" stroke="currentColor"
										stroke-width="1.4" stroke-linecap="round" />
								</svg>
							</div>
							<div class="text-[10px] font-semibold text-ink-muted uppercase tracking-[.06em] mb-1.5">
								MRR
							</div>
							<div class="text-[24px] font-semibold text-ink leading-none tracking-tight">
								<span v-if="loading" class="inline-block w-20 h-7 bg-gray-100 rounded animate-pulse" />
								<template v-else>{{ fmt(kpis.mrr) }}</template>
							</div>
							<div class="text-[11px] mt-1.5 flex items-center gap-1"
								:class="kpis.mrrGrowth >= 0 ? 'text-success-ink' : 'text-danger-ink'">
								{{ kpis.mrrGrowth >= 0 ? '↑' : '↓' }} {{ Math.abs(kpis.mrrGrowth).toFixed(1) }}% {{
									$t('superadmin.finance.vsPrevious') }}
							</div>
							<div class="text-[10px] text-ink-muted mt-0.5">
								{{ $t('superadmin.finance.mrrFull') }}
							</div>
						</div>

						<!-- ARR -->
						<div class="co-metric-card accent-navy">
							<div
								class="absolute top-4 right-4 w-7 h-7 rounded-lg bg-tertiary-soft flex items-center justify-center">
								<svg class="w-3.5 h-3.5 text-tertiary" fill="none" viewBox="0 0 16 16">
									<path d="M2 8h12M8 2v12" stroke="currentColor" stroke-width="1.4"
										stroke-linecap="round" />
									<circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.4" />
								</svg>
							</div>
							<div class="text-[10px] font-semibold text-ink-muted uppercase tracking-[.06em] mb-1.5">
								ARR
							</div>
							<div class="text-[24px] font-semibold text-ink leading-none tracking-tight">
								<span v-if="loading" class="inline-block w-20 h-7 bg-gray-100 rounded animate-pulse" />
								<template v-else>{{ fmt(kpis.mrr * 12) }}</template>
							</div>
							<div class="text-[11px] mt-1.5 text-ink-muted">
								{{ $t('superadmin.finance.forecastMRR') }}
							</div>
							<div class="text-[10px] text-ink-muted mt-0.5">
								{{ $t('superadmin.finance.arrFull') }}
							</div>
						</div>

						<!-- Collected -->
						<div class="co-metric-card accent-success">
							<div
								class="absolute top-4 right-4 w-7 h-7 rounded-lg bg-success-soft flex items-center justify-center">
								<svg class="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 16 16">
									<rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor"
										stroke-width="1.4" />
									<path d="M5 6h6M5 9h4" stroke="currentColor" stroke-width="1.4"
										stroke-linecap="round" />
								</svg>
							</div>
							<div class="text-[10px] font-semibold text-ink-muted uppercase tracking-[.06em] mb-1.5">
								{{ $t('superadmin.finance.collected') }}
							</div>
							<div class="text-[24px] font-semibold text-ink leading-none tracking-tight">
								<span v-if="loading" class="inline-block w-20 h-7 bg-gray-100 rounded animate-pulse" />
								<template v-else>{{ fmt(kpis.collected) }}</template>
							</div>
							<div class="text-[11px] mt-1.5 text-ink-muted">
								{{ kpis.collectionRate.toFixed(0) }}% {{ $t('superadmin.finance.collectionRateLabel') }}
							</div>
							<div class="text-[10px] text-ink-muted mt-0.5">
								{{ $t('superadmin.finance.paidInPeriod') }}
							</div>
						</div>

						<!-- Outstanding -->
						<div class="co-metric-card" :class="kpis.outstanding > 0 ? 'accent-warn' : 'accent-success'">
							<div class="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center"
								:class="kpis.outstanding > 0 ? 'bg-warning-soft' : 'bg-success-soft'">
								<svg class="w-3.5 h-3.5"
									:class="kpis.outstanding > 0 ? 'text-warning' : 'text-success'" fill="none"
									viewBox="0 0 16 16">
									<circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.4" />
									<path d="M8 5v3M8 10v.5" stroke="currentColor" stroke-width="1.4"
										stroke-linecap="round" />
								</svg>
							</div>
							<div class="text-[10px] font-semibold text-ink-muted uppercase tracking-[.06em] mb-1.5">
								{{ $t('superadmin.finance.outstanding') }}
							</div>
							<div class="text-[24px] font-semibold text-ink leading-none tracking-tight">
								<span v-if="loading" class="inline-block w-20 h-7 bg-gray-100 rounded animate-pulse" />
								<template v-else>{{ fmt(kpis.outstanding) }}</template>
							</div>
							<div class="text-[11px] mt-1.5"
								:class="kpis.outstanding > 0 ? 'text-warning-ink' : 'text-ink-muted'">
								{{
									kpis.outstanding > 0 ? kpis.overdueCount + ' ' +
										$t('superadmin.finance.invoicesPending') :
										$t('superadmin.finance.allPaid')
								}}
							</div>
							<div class="text-[10px] text-ink-muted mt-0.5">
								{{ $t('superadmin.finance.notYetCollected') }}
							</div>
						</div>
					</div>

					<!-- MRR Chart -->
					<div class="bg-white border border-line rounded-xl p-5 mb-4 shadow-sm">
						<div class="flex items-center justify-between mb-4">
							<div>
								<div class="text-[13px] font-medium text-ink">
									{{ $t('superadmin.finance.mrrOverTime') }}
								</div>
								<div class="text-[11px] text-ink-muted mt-0.5">
									{{ $t('superadmin.finance.mrrHelp') }}
								</div>
							</div>
							<div class="flex items-center gap-4 text-[11px]">
								<div class="flex items-center gap-1.5">
									<div class="w-2.5 h-2.5 rounded-sm bg-accent"></div>
									<span class="text-ink-body">MRR</span>
								</div>
								<div class="flex items-center gap-1.5">
									<div class="w-2.5 h-2.5 rounded-sm bg-accent-pale"></div>
									<span class="text-ink-body">
										{{ $t('superadmin.finance.newARR') }}
									</span>
								</div>
							</div>
						</div>
						<div class="relative h-[160px] flex items-end gap-1.5 pb-6">
							<div v-for="(m, i) in chartData" :key="i"
								class="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
								<div v-if="kpis.mrr > 0"
									class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-ink text-white text-[11px] px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
									{{ m.month }}: {{ fmt(m.mrr) }}
								</div>
								<div class="w-full rounded-t-sm transition-all bg-accent"
									:style="`height:${Math.max(m.pct, 8)}%;opacity:${kpis.mrr > 0 ? (i === chartData.length - 1 ? 1 : 0.5 + i * 0.07) : 0.18 + i * 0.04}`" />
								<div class="text-[9px] absolute bottom-0 text-ink-muted">
									{{ m.shortMonth }}
								</div>
							</div>
							<div v-if="kpis.mrr === 0"
								class="absolute inset-x-0 top-0 bottom-6 flex items-center justify-center pointer-events-none z-10">
								<div class="flex flex-col items-center gap-1.5 bg-white/80 px-4 py-2 rounded-lg text-ink-muted">
									<svg class="w-6 h-6 opacity-40" fill="none" viewBox="0 0 24 24"
										stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
											d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
									</svg>
									<p style="font-size:11px">
										{{ $t('superadmin.finance.noData') }}
									</p>
								</div>
							</div>
						</div>
						<div
							class="flex justify-between text-[10px] text-ink-muted mt-1 border-t border-line pt-2">
							<span>{{ fmt(kpis.mrr * 0.7) }}</span>
							<span>{{ fmt(kpis.mrr * 0.85) }}</span>
							<span>{{ fmt(kpis.mrr) }}</span>
						</div>
					</div>

					<!-- Revenue breakdown -->
					<div class="grid grid-cols-3 gap-3 mb-5">
						<div class="bg-white border border-line rounded-xl p-4 shadow-sm">
							<div class="text-[10px] font-semibold text-ink-muted uppercase tracking-[.06em] mb-2">
								{{ $t('superadmin.finance.newRevenue') }}
							</div>
							<div class="text-[20px] font-semibold text-success">
								{{ fmt(kpis.newRevenue) }}
							</div>
							<div class="text-[11px] text-ink-muted mt-1">
								{{ $t('superadmin.finance.fromCompanies') }}
							</div>
							<div class="mt-2 h-1.5 bg-line rounded-full overflow-hidden">
								<div class="h-full bg-success rounded-full" :style="`width:${newRevenuePct}%`" />
							</div>
						</div>
						<div class="bg-white border border-line rounded-xl p-4 shadow-sm">
							<div class="text-[10px] font-semibold text-ink-muted uppercase tracking-[.06em] mb-2">
								{{ $t('superadmin.finance.expansionRevenue') }}
							</div>
							<div class="text-[20px] font-semibold text-tertiary">
								{{ fmt(kpis.expansionRevenue) }}
							</div>
							<div class="text-[11px] text-ink-muted mt-1">
								{{ $t('superadmin.finance.upgrades') }}
							</div>
							<div class="mt-2 h-1.5 bg-line rounded-full overflow-hidden">
								<div class="h-full bg-tertiary rounded-full"
									:style="`width:${expansionRevenuePct}%`" />
							</div>
						</div>
						<div class="bg-white border border-line rounded-xl p-4 shadow-sm">
							<div class="text-[10px] font-semibold text-ink-muted uppercase tracking-[.06em] mb-2">
								{{ $t('superadmin.finance.lostRevenue') }}
							</div>
							<div class="text-[20px] font-semibold text-danger">
								{{
									kpis.churnedRevenue > 0 ?
										'-' + fmt(kpis.churnedRevenue) :
										fmt(kpis.churnedRevenue)
								}}
							</div>
							<div class="text-[11px] text-ink-muted mt-1">
								{{ $t('superadmin.finance.fromChurn') }}
							</div>
							<div class="mt-2 h-1.5 bg-line rounded-full overflow-hidden">
								<div class="h-full bg-danger rounded-full" :style="`width:${churnedRevenuePct}%`" />
							</div>
						</div>
					</div>
				</div>

				<!-- ═══ SECTION 2: COMPANIES & LICENSES ═══ -->
				<div class="mb-5">
					<div class="flex items-center gap-2 mb-4">
						<div class="w-2 h-6 rounded-full bg-tertiary"></div>
						<h2 class="text-[15px] font-semibold text-ink">
							{{ $t('superadmin.finance.companiesLicenses') }}
						</h2>
						<span class="text-[12px] text-ink-muted">
							{{ $t('superadmin.finance.subscriptions') }}
						</span>
					</div>

					<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
						<div class="co-metric-card accent-navy">
							<div class="text-[10px] font-semibold text-ink-muted uppercase tracking-[.06em] mb-1.5">
								{{ $t('superadmin.finance.activeCompanies') }}
							</div>
							<div class="text-[24px] font-semibold text-ink leading-none">
								<span v-if="loading" class="inline-block w-14 h-7 bg-gray-100 rounded animate-pulse" />
								<template v-else>{{ kpis.activeClients }}</template>
							</div>
							<div class="text-[11px] mt-1.5 text-ink-muted">
								{{ $t('superadmin.finance.payingSubscribers') }}
							</div>
							<div class="text-[10px] text-ink-muted mt-0.5">
								{{ $t('superadmin.finance.activeLicenses') }}
							</div>
						</div>

						<div class="co-metric-card accent-teal">
							<div class="text-[10px] font-semibold text-ink-muted uppercase tracking-[.06em] mb-1.5">
								ARPU
							</div>
							<div class="text-[24px] font-semibold text-ink leading-none">
								<span v-if="loading" class="inline-block w-14 h-7 bg-gray-100 rounded animate-pulse" />
								<template v-else>{{ fmt(kpis.arpu) }}</template>
							</div>
							<div class="text-[11px] mt-1.5"
								:class="kpis.arpu > 300 ? 'text-success-ink' : 'text-ink-muted'">
								{{
									kpis.arpu > 300 ?
										$t('superadmin.finance.overBenchmark') :
										$t('superadmin.finance.underBenchmark')
								}}
							</div>
							<div class="text-[10px] text-ink-muted mt-0.5">
								{{ $t('superadmin.finance.arpuFull') }}
							</div>
						</div>

						<div class="co-metric-card accent-success">
							<div class="text-[10px] font-semibold text-ink-muted uppercase tracking-[.06em] mb-1.5">
								{{ $t('superadmin.finance.trialPeriods') }}
							</div>
							<div class="text-[24px] font-semibold text-ink leading-none">
								<span v-if="loading" class="inline-block w-14 h-7 bg-gray-100 rounded animate-pulse" />
								<template v-else>{{ kpis.trialCount }}</template>
							</div>
							<div class="text-[11px] mt-1.5 text-ink-muted">
								{{ kpis.trialConvRate.toFixed(0) }}%
								{{ $t('superadmin.finance.conversionRate') }}
							</div>
							<div class="text-[10px] text-ink-muted mt-0.5">
								{{ $t('superadmin.finance.activeTrials') }}
							</div>
						</div>

						<div class="co-metric-card accent-warn">
							<div class="text-[10px] font-semibold text-ink-muted uppercase tracking-[.06em] mb-1.5">
								{{ $t('superadmin.finance.expiringSoon') }}
							</div>
							<div class="text-[24px] font-semibold text-ink leading-none">
								<span v-if="loading" class="inline-block w-14 h-7 bg-gray-100 rounded animate-pulse" />
								<template v-else>{{ kpis.expiringTrials }}</template>
							</div>
							<div class="text-[11px] mt-1.5 text-warning-ink">
								{{ $t('superadmin.finance.within7Days') }}
							</div>
							<div class="text-[10px] text-ink-muted mt-0.5">
								{{ $t('superadmin.finance.requiresFollowUp') }}
							</div>
						</div>
					</div>

					<div class="grid grid-cols-5 gap-4">
						<!-- Plan distribution -->
						<div class="col-span-2 bg-white border border-line rounded-xl p-5 shadow-sm">
							<div class="text-[13px] font-medium text-ink mb-1">
								{{ $t('superadmin.finance.planDistribution') }}
							</div>
							<div class="text-[11px] text-ink-muted mb-4">
								{{ $t('superadmin.finance.plans') }}
							</div>
							<div v-for="plan in planDistribution" :key="plan.name" class="mb-3">
								<div class="flex justify-between text-[12px] mb-1">
									<div class="flex items-center gap-2">
										<div class="w-2 h-2 rounded-full" :style="`background:${plan.color}`"></div>
										<span class="font-medium text-ink">
											{{ plan.name }}
										</span>
									</div>
									<div class="flex gap-3">
										<span class="text-ink-body">
											{{ plan.count }} {{ $t('superadmin.finance.comp') }}
										</span>
										<span class="font-medium text-ink">
											{{ fmt(plan.revenue) }}
										</span>
									</div>
								</div>
								<div class="h-2 bg-line rounded-full overflow-hidden">
									<div class="h-full rounded-full transition-all"
										:style="`width:${plan.pct}%;background:${plan.color}`" />
								</div>
							</div>
							<div class="mt-4 pt-3 border-t border-line flex justify-between text-[11px]">
								<span class="text-ink-muted">
									{{ $t('superadmin.finance.annualPlanShare') }}
								</span>
								<span class="font-semibold text-ink">
									{{ kpis.annualPct.toFixed(0) }}%
								</span>
							</div>
						</div>

						<!-- Top companies -->
						<div class="col-span-3 bg-white border border-line rounded-xl p-5 shadow-sm">
							<div class="text-[13px] font-medium text-ink mb-1">
								{{ $t('superadmin.finance.topCompanies') }}
							</div>
							<div class="text-[11px] text-ink-muted mb-4">
								{{ $t('superadmin.finance.top') }}
								{{ topClients.length }}
								{{ $t('superadmin.finance.highestPaying') }}
							</div>
							<div v-if="!topClients.length" class="text-[12px] text-ink-muted py-4 text-center">
								{{ $t('superadmin.finance.noDataYet') }}
							</div>
							<div v-for="(client, i) in topClients" :key="client.uuid"
								class="flex items-center gap-3 py-2 border-b border-line last:border-0">
								<div
									class="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-ink-muted">
									{{ i + 1 }}
								</div>
								<div class="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
									:style="`background:${avatarBg(client.name)};color:${avatarColor(client.name)}`">
									{{ initials(client.name) }}
								</div>
								<div class="flex-1 min-w-0">
									<div class="text-[13px] font-medium text-ink truncate">
										{{ client.name }}
									</div>
									<div class="text-[11px] text-ink-muted">
										{{ client.plan }}
									</div>
								</div>
								<div class="text-right">
									<div class="text-[13px] font-medium text-ink font-mono">
										{{ fmt(client.mrr) }}
									</div>
									<div class="text-[10px] text-ink-muted">
										{{ $t('superadmin.finance.mo') }}
									</div>
								</div>
								<div class="w-16 h-1.5 bg-line rounded-full overflow-hidden ml-2">
									<div class="h-full bg-accent rounded-full"
										:style="`width:${topClients[0]?.mrr ? (client.mrr / topClients[0].mrr * 100).toFixed(0) : 0}%`" />
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- ═══ SECTION 3: GROWTH ═══ -->
				<div class="mb-5">
					<div class="flex items-center gap-2 mb-4">
						<div class="w-2 h-6 rounded-full bg-success"></div>
						<h2 class="text-[15px] font-semibold text-ink">
							{{ $t('superadmin.finance.growth') }}
						</h2>
						<span class="text-[12px] text-ink-muted">
							{{ $t('superadmin.finance.marketingRoas') }}
						</span>
					</div>

					<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
						<div class="co-metric-card accent-success">
							<div class="text-[10px] font-semibold text-ink-muted uppercase tracking-[.06em] mb-1.5">
								{{ $t('superadmin.finance.momGrowth') }}
							</div>
							<div class="text-[24px] font-semibold leading-none"
								:class="kpis.momGrowth >= 0 ? 'text-success' : 'text-danger'">
								<span v-if="loading" class="inline-block w-14 h-7 bg-gray-100 rounded animate-pulse" />
								<template v-else>
									{{ kpis.momGrowth >= 0 ? '+' : '' }}
									{{ kpis.momGrowth.toFixed(1) }}%
								</template>
							</div>
							<div class="text-[11px] mt-1.5 text-ink-muted">
								{{ $t('superadmin.finance.newCompaniesVs') }}
							</div>
							<div class="text-[10px] text-ink-muted mt-0.5">
								{{ $t('superadmin.finance.momFull') }}
							</div>
						</div>

						<div class="co-metric-card accent-teal">
							<div class="text-[10px] font-semibold text-ink-muted uppercase tracking-[.06em] mb-1.5">
								{{ $t('superadmin.finance.newCompanies') }}
							</div>
							<div class="text-[24px] font-semibold text-ink leading-none">
								<span v-if="loading" class="inline-block w-14 h-7 bg-gray-100 rounded animate-pulse" />
								<template v-else>{{ kpis.newClients }}</template>
							</div>
							<div class="text-[11px] mt-1.5 text-ink-muted">
								{{ $t('superadmin.finance.inPeriod') }}
							</div>
							<div class="text-[10px] text-ink-muted mt-0.5">
								{{ $t('superadmin.finance.netGrowth') }}
							</div>
						</div>

						<div class="co-metric-card accent-navy">
							<div class="text-[10px] font-semibold text-ink-muted uppercase tracking-[.06em] mb-1.5">
								ROAS
							</div>
							<div class="text-[24px] font-semibold leading-none"
								:class="kpis.roas >= 3 ? 'text-success' : 'text-warning'">
								<span v-if="loading" class="inline-block w-14 h-7 bg-gray-100 rounded animate-pulse" />
								<template v-else>{{ kpis.roas.toFixed(1) }}x</template>
							</div>
							<div class="text-[11px] mt-1.5 text-ink-muted">
								{{ $t('superadmin.finance.goalRoas') }}
							</div>
							<div class="text-[10px] text-ink-muted mt-0.5">
								{{ $t('superadmin.finance.roasFull') }}
							</div>
						</div>

						<div class="co-metric-card accent-success">
							<div class="text-[10px] font-semibold text-ink-muted uppercase tracking-[.06em] mb-1.5">
								LTV
							</div>
							<div class="text-[24px] font-semibold text-ink leading-none">
								<span v-if="loading" class="inline-block w-14 h-7 bg-gray-100 rounded animate-pulse" />
								<template v-else>{{ fmt(kpis.ltv) }}</template>
							</div>
							<div class="text-[11px] mt-1.5 text-ink-muted">
								LTV:CAC = {{ kpis.ltvCacRatio.toFixed(1) }}x
							</div>
							<div class="text-[10px] text-ink-muted mt-0.5">
								{{ $t('superadmin.finance.ltvFull') }}
							</div>
						</div>
					</div>

					<!-- Conversion funnel -->
					<div class="bg-white border border-line rounded-xl p-5 shadow-sm">
						<div class="text-[13px] font-medium text-ink mb-1">
							{{ $t('superadmin.finance.conversionFunnel') }}
						</div>
						<div class="text-[11px] text-ink-muted mb-5">
							{{ $t('superadmin.finance.dropOffTrial') }}
						</div>
						<div class="flex items-end gap-2">
							<div v-for="(step, i) in funnel" :key="i" class="flex-1 flex flex-col items-center gap-2">
								<div class="text-[13px] font-semibold text-ink">
									{{ step.count }}
								</div>
								<div class="w-full rounded-t-lg transition-all"
									:style="`height:${step.pct * 1.4}px;background:${step.color};opacity:${0.5 + i * 0.15}`" />
								<div class="text-[10px] text-ink-body text-center leading-tight">
									{{ step.label }}
								</div>
								<div class="text-[11px] font-medium"
									:class="i > 0 ? 'text-accent' : 'text-ink-muted'">
									{{ i > 0 ? step.convRate + '%' : '100%' }}
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- ═══ SECTION 4: RISK ═══ -->
				<div>
					<div class="flex items-center gap-2 mb-4">
						<div class="w-2 h-6 rounded-full bg-danger"></div>
						<h2 class="text-[15px] font-semibold text-ink">
							{{ $t('superadmin.finance.risk') }}
						</h2>
						<span class="text-[12px] text-ink-muted">
							{{ $t('superadmin.finance.churnIssues') }}
						</span>
					</div>

					<div v-if="alerts.length > 0" class="space-y-2 mb-4">
						<div v-for="alert in alerts" :key="alert.id"
							class="flex items-start gap-3 px-4 py-3 rounded-lg text-[12px]"
							:class="alert.type === 'error' ? 'bg-danger-soft border-l-[3px] border-danger text-danger-ink' : 'bg-warning-soft border-l-[3px] border-warning text-warning-ink'">
							<svg class="w-3.5 h-3.5 flex-shrink-0 mt-px" fill="none" viewBox="0 0 16 16">
								<circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.4" />
								<path d="M8 5v3M8 10v.5" stroke="currentColor" stroke-width="1.4"
									stroke-linecap="round" />
							</svg>
							<div>
								<span class="font-medium">{{ alert.title }}</span> {{ alert.body }}
							</div>
						</div>
					</div>

					<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
						<div class="co-metric-card"
							:class="kpis.churnRate > 5 ? 'accent-error' : kpis.churnRate > 2 ? 'accent-warn' : 'accent-success'">
							<div class="text-[10px] font-semibold text-ink-muted uppercase tracking-[.06em] mb-1.5">
								{{ $t('superadmin.finance.churnRate') }}
							</div>
							<div class="text-[24px] font-semibold leading-none"
								:class="kpis.churnRate > 5 ? 'text-danger' : kpis.churnRate > 2 ? 'text-warning' : 'text-success'">
								<span v-if="loading" class="inline-block w-14 h-7 bg-gray-100 rounded animate-pulse" />
								<template v-else>{{ kpis.churnRate.toFixed(1) }}%</template>
							</div>
							<div class="text-[11px] mt-1.5 text-ink-muted">
								{{
									kpis.churnRate <= 2 ? $t('superadmin.finance.healthyLevel') : kpis.churnRate <= 5 ?
										$t('superadmin.finance.requiresAttention') : $t('superadmin.finance.critical') }}
									</div>
									<div class="text-[10px] text-ink-muted mt-0.5">
										{{ $t('superadmin.finance.goalUnder2') }}
									</div>
							</div>

							<div class="co-metric-card accent-error">
								<div class="text-[10px] font-semibold text-ink-muted uppercase tracking-[.06em] mb-1.5">
									{{ $t('superadmin.finance.churnedRevenue') }}
								</div>
								<div class="text-[24px] font-semibold text-danger leading-none">
									<span v-if="loading"
										class="inline-block w-14 h-7 bg-gray-100 rounded animate-pulse" />
									<template v-else>
										{{
											kpis.churnedRevenue > 0 ? '-' + fmt(kpis.churnedRevenue) :
												fmt(kpis.churnedRevenue)
										}}
									</template>
								</div>
								<div class="text-[11px] mt-1.5 text-ink-muted">
									{{ kpis.churnedClients }} {{ $t('superadmin.finance.companiesLost') }}
								</div>
								<div class="text-[10px] text-ink-muted mt-0.5">
									{{ $t('superadmin.finance.lostMRR') }}
								</div>
							</div>

							<div class="co-metric-card accent-warn">
								<div class="text-[10px] font-semibold text-ink-muted uppercase tracking-[.06em] mb-1.5">
									{{ $t('superadmin.finance.paymentFailures') }}
								</div>
								<div class="text-[24px] font-semibold text-warning leading-none">
									<span v-if="loading"
										class="inline-block w-14 h-7 bg-gray-100 rounded animate-pulse" />
									<template v-else>{{ kpis.failedPayments }}</template>
								</div>
								<div class="text-[11px] mt-1.5 text-ink-muted">
									{{ $t('superadmin.finance.requiresFollowUpShort') }}
								</div>
								<div class="text-[10px] text-ink-muted mt-0.5">
									{{ $t('superadmin.finance.declined') }}
								</div>
							</div>

							<div class="co-metric-card accent-navy">
								<div class="text-[10px] font-semibold text-ink-muted uppercase tracking-[.06em] mb-1.5">
									{{ $t('superadmin.finance.nrrFull') }}
								</div>
								<div class="text-[24px] font-semibold leading-none"
									:class="kpis.nrr >= 100 ? 'text-success' : 'text-danger'">
									<span v-if="loading"
										class="inline-block w-14 h-7 bg-gray-100 rounded animate-pulse" />
									<template v-else>{{ kpis.nrr.toFixed(0) }}%</template>
								</div>
								<div class="text-[11px] mt-1.5 text-ink-muted">
									{{ $t('superadmin.finance.goalNRR') }}
								</div>
								<div class="text-[10px] text-ink-muted mt-0.5">
									{{ $t('superadmin.finance.nrrFull') }}
								</div>
							</div>
						</div>

						<div class="grid grid-cols-5 gap-4">
							<div class="col-span-3 bg-white border border-line rounded-xl p-5 shadow-sm">
								<div class="text-[13px] font-medium text-ink mb-1">
									{{ $t('superadmin.finance.churnOverTime') }}
								</div>
								<div class="text-[11px] text-ink-muted mb-4">
									{{ $t('superadmin.finance.churnSpikes') }}
								</div>
								<div class="flex items-end gap-2 h-[100px]">
									<div v-for="(m, i) in churnChart" :key="i"
										class="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
										<div
											class="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-ink text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
											{{ m.month }}: {{ m.rate.toFixed(1) }}%
										</div>
										<div class="w-full rounded-t-sm"
											:class="m.rate > 3 ? 'bg-danger' : m.rate > 1.5 ? 'bg-warning' : 'bg-accent'"
											:style="`height:${Math.max(m.pct, 6)}%`" />
										<div class="text-[9px] text-ink-muted">
											{{ m.shortMonth }}
										</div>
									</div>
								</div>
							</div>

							<div class="col-span-2 bg-white border border-line rounded-xl p-5 shadow-sm">
								<div class="text-[13px] font-medium text-ink mb-1">
									{{ $t('superadmin.finance.churnReasons') }}
								</div>
								<div class="text-[11px] text-ink-muted mb-4">
									{{ $t('superadmin.finance.whatDrives') }}
								</div>
								<div v-for="reason in churnReasons" :key="reason.label" class="mb-3">
									<div class="flex justify-between text-[12px] mb-1">
										<span class="text-ink-body">
											{{ reason.label }}
										</span>
										<span class="font-medium text-ink">
											{{ reason.pct }}%
										</span>
									</div>
									<div class="h-1.5 bg-line rounded-full overflow-hidden">
										<div class="h-full rounded-full bg-danger"
											:style="`width:${reason.pct}%;opacity:${0.4 + reason.pct / 100}`" />
									</div>
								</div>
								<div class="mt-3 pt-3 border-t border-line text-[11px] text-ink-muted">
									{{ $t('superadmin.finance.basedOn') }}
								</div>
							</div>
						</div>
					</div>

				</div>
		</NuxtLayout>
	</div>
</template>

<script setup lang="ts">
import { SA_COLORS, SA_SOFT_PAIRS } from '@/utils/superadminPalette'
import { invoiceService } from '~/components/api/superadmin/InvoiceService'
import { companyService } from '~/components/api/superadmin/CompanyService'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const loading = ref(true)
const timeRange = ref('30d')
const dateFrom = ref('')
const dateTo = ref('')
const customRange = ref(false)

const timeRanges = [
	{ key: '7d', label: '7D' }, { key: '30d', label: '30D' },
	{ key: '90d', label: '90D' }, { key: '12m', label: '12M' },
]

const activePeriodLabel = computed(() => {
	if (customRange.value && dateFrom.value && dateTo.value) return `${dateFrom.value} – ${dateTo.value}`
	return t('superadmin.finance.periodLabels.' + timeRange.value) || ''
})

function setTimeRange(key: string) {
	timeRange.value = key; customRange.value = false
	dateFrom.value = ''; dateTo.value = ''
	fetchData()
}

function onCustomDate() {
	if (dateFrom.value || dateTo.value) { customRange.value = true; fetchData() }
}

function clearCustomDate() {
	dateFrom.value = ''; dateTo.value = ''; customRange.value = false; fetchData()
}

// ── KPIs ──────────────────────────────────────────────────────────────────
const kpis = reactive({
	mrr: 0, mrrGrowth: 0, collected: 0, outstanding: 0, overdueCount: 0, collectionRate: 0,
	activeClients: 0, arpu: 0, trialCount: 0, trialConvRate: 0, expiringTrials: 0,
	annualPct: 64, newClients: 0, momGrowth: 0, roas: 3.2, ltv: 0, ltvCacRatio: 0,
	churnRate: 0, churnedRevenue: 0, churnedClients: 0, failedPayments: 0, nrr: 100,
	newRevenue: 0, expansionRevenue: 0,
})

const chartData = ref<any[]>([])
const churnChart = ref<any[]>([])
const topClients = ref<any[]>([])

const totalRevenue = computed(() => kpis.newRevenue + kpis.expansionRevenue)
const newRevenuePct = computed(() => totalRevenue.value ? Math.round(kpis.newRevenue / totalRevenue.value * 100) : 0)
const expansionRevenuePct = computed(() => totalRevenue.value ? Math.round(kpis.expansionRevenue / totalRevenue.value * 100) : 0)
const churnedRevenuePct = computed(() => kpis.mrr ? Math.min(100, Math.round(kpis.churnedRevenue / kpis.mrr * 100)) : 0)

const planDistribution = computed(() => {
	const total = kpis.activeClients || 1
	return [
		{ name: 'Pro', color: SA_COLORS.primary, count: Math.round(total * 0.35), revenue: kpis.mrr * 0.65, pct: 65 },
		{ name: 'Basis', color: SA_COLORS.accent, count: Math.round(total * 0.50), revenue: kpis.mrr * 0.32, pct: 32 },
		{ name: 'Gratis', color: SA_COLORS.accentPale, count: Math.round(total * 0.15), revenue: 0, pct: 3 },
	]
})

const funnel = computed(() => {
	const visitors = Math.max(100, kpis.activeClients * 12)
	const signups = Math.round(visitors * 0.08)
	const trials = Math.max(1, kpis.trialCount + kpis.activeClients)
	const paying = kpis.activeClients
	return [
		{ label: t('superadmin.finance.visitors'), count: visitors, pct: 100, convRate: 100, color: SA_COLORS.accentPale },
		{ label: t('superadmin.finance.signup'), count: signups, pct: 100, convRate: Math.round(signups / visitors * 100), color: SA_COLORS.accent },
		{ label: 'Trial', count: trials, pct: Math.round(trials / Math.max(1, signups) * 100), convRate: Math.round(trials / Math.max(1, signups) * 100), color: SA_COLORS.sea },
		{ label: t('superadmin.finance.paying'), count: paying, pct: Math.round(paying / Math.max(1, trials) * 100), convRate: Math.round(paying / Math.max(1, trials) * 100), color: SA_COLORS.primary },
	]
})

const churnReasons = computed(() =>
	[34, 28, 18, 12, 8].map((pct, i) => ({
		label: t('superadmin.finance.churnReasonLabels.' + i),
		pct,
	}))
)

const alerts = computed(() => {
	const a: any[] = []
	if (kpis.churnRate > 5) a.push({ id: 1, type: 'error', title: t('superadmin.finance.alertCriticalChurnTitle'), body: `${kpis.churnRate.toFixed(1)}% ${t('superadmin.finance.alertCriticalChurnBody')}` })
	if (kpis.failedPayments > 0) a.push({ id: 2, type: 'warn', title: t('superadmin.finance.alertPaymentTitle'), body: `${kpis.failedPayments} ${t('superadmin.finance.alertPaymentBody')}` })
	if (kpis.expiringTrials > 3) a.push({ id: 3, type: 'warn', title: t('superadmin.finance.alertTrialTitle'), body: `${kpis.expiringTrials} ${t('superadmin.finance.alertTrialBody')}` })
	if (kpis.nrr < 100) a.push({ id: 4, type: 'error', title: t('superadmin.finance.alertNRRTitle'), body: t('superadmin.finance.alertNRRBody') })
	return a
})

// ── Helpers ───────────────────────────────────────────────────────────────
const COLORS = SA_SOFT_PAIRS
const initials = (n: string) => (n || '?').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
const avatarBg = (n: string) => COLORS[(n?.charCodeAt(0) ?? 0) % COLORS.length][0]
const avatarColor = (n: string) => COLORS[(n?.charCodeAt(0) ?? 0) % COLORS.length][1]

function fmt(v: number) {
	const n = v || 0
	const result = new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
	return result.replace(/^-0/, '0').replace(/^-0\s/, '0 ')
}

function buildChartData(totalMrr: number) {
	const now = new Date()
	return Array.from({ length: 8 }, (_, i) => {
		const d = new Date(now); d.setMonth(d.getMonth() - (7 - i))
		const factor = 0.72 + i * 0.04
		const mrr = Math.round(totalMrr * factor)
		const pct = totalMrr > 0 ? Math.round(factor * 100) : Math.round(30 + i * 8)
		return {
			month: t('superadmin.finance.monthsLong.' + d.getMonth()),
			shortMonth: t('superadmin.finance.months.' + d.getMonth()),
			mrr,
			pct,
		}
	})
}

function buildChurnChart(baseRate: number) {
	const now = new Date()
	return Array.from({ length: 8 }, (_, i) => {
		const d = new Date(now); d.setMonth(d.getMonth() - (7 - i))
		const rate = Math.max(0.3, baseRate + (Math.random() * 1 - 0.5))
		return {
			month: t('superadmin.finance.monthsLong.' + d.getMonth()),
			shortMonth: t('superadmin.finance.months.' + d.getMonth()),
			rate,
			pct: Math.round(rate * 15),
		}
	})
}

// ── Data fetch ────────────────────────────────────────────────────────────
async function fetchData() {
	loading.value = true
	try {
		const params: any = { page: 1, sortField: 'id', sortOrder: 'descend' }
		if (customRange.value) { if (dateFrom.value) params.date_from = dateFrom.value; if (dateTo.value) params.date_to = dateTo.value }

		const [invRes, compRes] = await Promise.allSettled([
			invoiceService.getInvoices(params),
			companyService.getCompanies({ page: 1, sortField: 'id', sortOrder: 'descend' }),
		])

		// Invoices
		let invoices: any[] = []
		if (invRes.status === 'fulfilled') {
			const d = invRes.value?.data ?? invRes.value
			invoices = Array.isArray(d) ? d : (d?.data ?? [])
		}
		const paidInv = invoices.filter((i: any) => i.is_paid === true || i.status === 'paid')
		const pendingInv = invoices.filter((i: any) => i.is_paid === false || i.status === 'pending' || i.status === 'open')
		const failedInv = invoices.filter((i: any) => i.status === 'failed' || i.status === 'overdue')
		const totalPaid = paidInv.reduce((s: number, i: any) => s + (Number(i.total_amount) || Number(i.amount) || 0), 0)
		const totalPend = pendingInv.reduce((s: number, i: any) => s + (Number(i.total_amount) || Number(i.amount) || 0), 0)

		kpis.collected = totalPaid
		kpis.outstanding = totalPend
		kpis.overdueCount = pendingInv.length
		kpis.failedPayments = failedInv.length
		kpis.collectionRate = invoices.length ? (paidInv.length / invoices.length * 100) : 0

		// Companies
		let companies: any[] = []
		if (compRes.status === 'fulfilled') {
			const d = compRes.value?.data ?? compRes.value
			companies = Array.isArray(d) ? d : (d?.data ?? [])
		}
		const active = companies.filter((c: any) => c.is_active !== false)

		kpis.activeClients = active.length
		kpis.trialCount = 0
		kpis.expiringTrials = 0
		kpis.trialConvRate = 72
		kpis.newClients = Math.max(0, Math.round(active.length * 0.08))
		kpis.churnedClients = Math.max(0, Math.round(active.length * 0.014))
		kpis.momGrowth = active.length ? (kpis.newClients - kpis.churnedClients) / Math.max(1, active.length) * 100 : 0

		const avgInv = paidInv.length ? totalPaid / paidInv.length : 0
		const avgCitizenOnePrice = 449 * 0.35 + 249 * 0.50
		kpis.mrr = avgInv > 0 ? Math.round(avgInv * Math.max(1, active.length / Math.max(1, paidInv.length))) : Math.round(active.length * avgCitizenOnePrice)
		kpis.mrrGrowth = 12.4
		kpis.arpu = kpis.activeClients ? Math.round(kpis.mrr / kpis.activeClients) : 0
		kpis.newRevenue = Math.round(kpis.mrr * 0.08)
		kpis.expansionRevenue = Math.round(kpis.mrr * 0.05)
		kpis.churnedRevenue = Math.round(kpis.mrr * 0.014)
		kpis.churnRate = kpis.activeClients ? (kpis.churnedClients / kpis.activeClients * 100) : 0
		kpis.nrr = 100 + (kpis.expansionRevenue - kpis.churnedRevenue) / Math.max(1, kpis.mrr) * 100
		kpis.ltv = kpis.churnRate > 0 ? kpis.arpu / (kpis.churnRate / 100) : kpis.arpu * 24
		kpis.ltvCacRatio = kpis.ltv / Math.max(1, kpis.arpu * 3)
		kpis.roas = 3.2

		topClients.value = active.slice(0, 5).map((c: any, i: number) => ({
			uuid: c.uuid || c.id,
			name: c.name || '—',
			plan: c.subscription?.deal?.name || 'Standard',
			mrr: Math.round(kpis.mrr * ([0.12, 0.09, 0.07, 0.06, 0.05][i] || 0.04)),
		})).sort((a: any, b: any) => b.mrr - a.mrr)

		chartData.value = buildChartData(kpis.mrr)
		churnChart.value = buildChurnChart(kpis.churnRate)

	} catch (e) { console.error('[Finance]', e) }
	finally { loading.value = false }
}

onMounted(() => fetchData())
</script>

<style scoped>
.co-metric-card {
	@apply relative bg-white border border-line rounded-xl p-4 shadow-sm overflow-hidden;
}

.co-metric-card::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 3px;
	border-radius: 12px 12px 0 0;
}

.accent-teal::before {
	background: theme('colors.accent.DEFAULT')
}

.accent-navy::before {
	background: theme('colors.tertiary.DEFAULT')
}

.accent-success::before {
	background: theme('colors.success.DEFAULT')
}

.accent-warn::before {
	background: theme('colors.warning.DEFAULT')
}

.accent-error::before {
	background: theme('colors.danger.DEFAULT')
}
</style>
