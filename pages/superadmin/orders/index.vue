<template>
    <div>
        <NuxtLayout name="superadmin">
            <Head><Title>Ordrer - {{ runtimeConfig?.public?.appName }}</Title></Head>
            <template #header>Ordrer</template>

            <div class="p-1">
                <!-- Header -->
                <div class="flex items-center justify-between mb-5">
                    <div>
                        <h1 class="text-[22px] font-semibold text-[#1F2533]">Ordrer</h1>
                        <p class="text-sm text-[#5C6478] mt-0.5">{{ state.orders?.total ?? 0 }} ordrer i alt</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button v-if="state.completedCount > 0"
                            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700 border border-green-200"
                            @click="setTab('completed')">
                            <span class="w-2 h-2 rounded-full bg-green-500"></span>
                            {{ state.completedCount }} gennemført
                        </button>
                        <button v-if="state.pendingCount > 0"
                            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200"
                            @click="setTab('pending')">
                            <span class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                            {{ state.pendingCount }} afventer
                        </button>
                        <button @click="openWizard"
                            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm"
                            style="background:#205E77">
                            <Icon name="ph:plus" class="w-4 h-4" />
                            Ny ordre
                        </button>
                    </div>
                </div>

                <!-- Search + tabs + sort -->
                <div class="flex flex-wrap items-center gap-3 mb-4">
                    <div class="relative flex-1 min-w-[220px] max-w-[380px]">
                        <Icon name="ph:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8891A4]" />
                        <input v-model="searchQuery" type="text"
                            placeholder="Søg på ordrenr., virksomhed eller plan..."
                            class="w-full pl-9 pr-3 py-2 text-sm border border-[#EAECF0] rounded-lg bg-white text-[#1F2533] placeholder-[#8891A4] outline-none focus:border-[#42AED9] focus:ring-2 focus:ring-[#42AED9]/10 transition-colors"
                            @input="debouncedSearch" />
                    </div>
                    <div class="flex items-center bg-white border border-[#EAECF0] rounded-lg p-0.5">
                        <button v-for="tab in tabs" :key="tab.key"
                            class="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors flex items-center gap-1.5"
                            :style="state.activeTab === tab.key ? 'background:#205E77;color:#fff' : 'color:#5C6478'"
                            @click="setTab(tab.key)">
                            {{ tab.label }}
                            <span v-if="tab.count > 0" class="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                                :style="state.activeTab === tab.key ? 'background:rgba(255,255,255,0.2)' : 'background:#F5F6F8'">
                                {{ tab.count }}
                            </span>
                        </button>
                    </div>
                    <select v-model="sortLabel" class="ml-auto text-sm border border-[#EAECF0] rounded-lg px-3 py-2 bg-white text-[#5C6478] outline-none cursor-pointer"
                        @change="handleSortChange">
                        <option value="id_desc">Nyeste først</option>
                        <option value="id_asc">Ældste først</option>
                        <option value="total_desc">Højeste beløb</option>
                        <option value="status_asc">Status</option>
                    </select>
                </div>

                <Alert type="danger" :text="state.error?.message" v-if="state.error?.message?.length > 0" />

                <!-- Table -->
                <div class="bg-white border border-[#EAECF0] rounded-xl overflow-hidden shadow-sm">
                    <div v-if="state.isLoading" class="flex justify-center py-16">
                        <Icon name="ph:spinner" class="w-7 h-7 text-[#42AED9] animate-spin" />
                    </div>
                    <div v-else-if="!state.orders?.data?.length" class="flex flex-col items-center gap-3 py-16 text-[#8891A4]">
                        <Icon name="ph:receipt" class="w-12 h-12 opacity-30" />
                        <p class="text-sm font-medium">Ingen ordrer fundet</p>
                        <button @click="openWizard"
                            class="mt-1 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                            style="background:#205E77">Opret ny ordre</button>
                    </div>
                    <table v-else class="w-full">
                        <thead>
                            <tr class="border-b border-[#EAECF0] bg-[#F9FAFB]">
                                <th class="co-th">Ordre</th>
                                <th class="co-th">Virksomhed</th>
                                <th class="co-th">Produkter</th>
                                <th class="co-th">Total</th>
                                <th class="co-th">Status</th>
                                <th class="co-th">Dato</th>
                                <th class="co-th"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="order in state.orders.data" :key="order.uuid ?? order.id"
                                class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors group">
                                <td class="co-td text-[12px] text-[#8891A4] font-mono">#{{ order.id ?? order.uuid?.slice(-6) }}</td>
                                <td class="co-td">
                                    <div class="flex items-center gap-2">
                                        <div class="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                                            :style="`background:${avatarColor(order.company?.name ?? order.company_name)}`">
                                            {{ (order.company?.name ?? order.company_name ?? '?').charAt(0).toUpperCase() }}
                                        </div>
                                        <span class="text-[13px] font-medium text-[#1F2533]">{{ order.company?.name ?? order.company_name ?? '—' }}</span>
                                    </div>
                                </td>
                                <td class="co-td">
                                    <div class="flex flex-wrap gap-1">
                                        <span v-if="order.plan" class="co-badge co-badge-navy text-[10px]">{{ planLabel(order.plan) }}</span>
                                        <span v-for="app in (order.apps ?? [])" :key="app" class="co-badge co-badge-gray text-[10px]">{{ app }}</span>
                                        <span v-if="order.extra_users > 0" class="co-badge co-badge-gray text-[10px]">+{{ order.extra_users }} brugere</span>
                                        <span v-if="order.extra_departments > 0" class="co-badge co-badge-gray text-[10px]">+{{ order.extra_departments }} afdelinger</span>
                                    </div>
                                </td>
                                <td class="co-td">
                                    <p class="text-[14px] font-bold text-[#1F2533]">kr. {{ order.total ?? 0 }}</p>
                                    <p class="text-[11px] text-[#8891A4]">{{ order.billing_period === 'yearly' ? '/år' : '/md.' }}</p>
                                </td>
                                <td class="co-td">
                                    <span class="co-badge text-[11px]" :style="`background:${statusMap[order.status]?.bg};color:${statusMap[order.status]?.color}`">
                                        <Icon :name="statusMap[order.status]?.icon ?? 'ph:clock'" class="w-3 h-3" />
                                        {{ statusMap[order.status]?.label ?? order.status }}
                                    </span>
                                </td>
                                <td class="co-td text-[12px] text-[#5C6478]">{{ formatDate(order.created_at) }}</td>
                                <td class="co-td">
                                    <div class="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button v-if="order.status === 'pending'"
                                            class="co-action-btn !text-green-700 !bg-green-50 !border-green-200"
                                            @click="completeOrder(order)">
                                            <Icon name="ph:check" class="w-3.5 h-3.5" /> Godkend
                                        </button>
                                        <button class="co-action-btn !text-[#CC3B2D] hover:!bg-red-50 !border-red-200"
                                            @click="confirmCancel(order)">
                                            <Icon name="ph:x" class="w-3.5 h-3.5" /> Annuller
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="mt-4">
                    <Pagination :data="state.orders" @previous="previous" @next="next" />
                </div>
            </div>

            <!-- ═══════════════════════════════════════════════
                 NY ORDRE WIZARD — 3-STEP MODAL
            ═══════════════════════════════════════════════ -->
            <Teleport to="body">
                <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0" enter-to-class="opacity-100"
                    leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
                    <div v-if="wizard.open" class="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4" @click.self="closeWizard">

                        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-[620px] max-h-[90vh] flex flex-col">

                            <!-- Wizard header + steps -->
                            <div class="px-6 pt-5 pb-4 border-b border-[#EAECF0]">
                                <div class="flex items-center justify-between mb-4">
                                    <h2 class="text-[17px] font-bold text-[#1F2533]">Ny ordre</h2>
                                    <button @click="closeWizard" class="w-8 h-8 rounded-lg flex items-center justify-center text-[#8891A4] hover:bg-[#F5F6F8]">
                                        <Icon name="ph:x" class="w-4 h-4" />
                                    </button>
                                </div>
                                <!-- Step indicators -->
                                <div class="flex items-center">
                                    <div v-for="(step, i) in steps" :key="i" class="flex items-center">
                                        <div class="flex items-center gap-2">
                                            <div class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors"
                                                :style="wizard.step > i+1 ? 'background:#2E9E33;color:white' :
                                                        wizard.step === i+1 ? 'background:#205E77;color:white' :
                                                        'background:#EAECF0;color:#8891A4'">
                                                <Icon v-if="wizard.step > i+1" name="ph:check-bold" class="w-3 h-3" />
                                                <span v-else>{{ i+1 }}</span>
                                            </div>
                                            <span class="text-[12px] font-medium"
                                                :class="wizard.step === i+1 ? 'text-[#1F2533]' : 'text-[#8891A4]'">
                                                {{ step }}
                                            </span>
                                        </div>
                                        <div v-if="i < steps.length-1" class="w-8 h-px mx-2" style="background:#EAECF0"></div>
                                    </div>
                                </div>
                            </div>

                            <!-- Wizard body -->
                            <div class="flex-1 overflow-y-auto px-6 py-5">

                                <!-- ── STEP 1: VIRKSOMHED ── -->
                                <div v-if="wizard.step === 1">
                                    <h3 class="text-[15px] font-semibold text-[#1F2533] mb-4">Vælg virksomhed</h3>

                                    <!-- Mode cards -->
                                    <div class="grid grid-cols-2 gap-3 mb-5">
                                        <button class="p-4 rounded-xl border-2 text-left transition-colors"
                                            :style="wizard.companyMode==='existing' ? 'border-color:#42AED9;background:#F0FAFD' : 'border-color:#EAECF0;background:white'"
                                            @click="wizard.companyMode='existing'">
                                            <Icon name="ph:buildings" class="w-5 h-5 mb-2" :style="wizard.companyMode==='existing' ? 'color:#205E77' : 'color:#8891A4'" />
                                            <p class="text-[13px] font-semibold text-[#1F2533]">Eksisterende</p>
                                            <p class="text-[11px] text-[#8891A4]">Tilføj ordre til en eksisterende virksomhed</p>
                                        </button>
                                        <button class="p-4 rounded-xl border-2 text-left transition-colors"
                                            :style="wizard.companyMode==='new' ? 'border-color:#42AED9;background:#F0FAFD' : 'border-color:#EAECF0;background:white'"
                                            @click="wizard.companyMode='new'">
                                            <Icon name="ph:plus-circle" class="w-5 h-5 mb-2" :style="wizard.companyMode==='new' ? 'color:#205E77' : 'color:#8891A4'" />
                                            <p class="text-[13px] font-semibold text-[#1F2533]">Ny virksomhed</p>
                                            <p class="text-[11px] text-[#8891A4]">Opret ny virksomhed og tilføj licenser</p>
                                        </button>
                                    </div>

                                    <!-- Eksisterende: search -->
                                    <div v-if="wizard.companyMode === 'existing'">
                                        <label class="co-label">Søg virksomhed</label>
                                        <div class="relative">
                                            <Icon name="ph:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8891A4]" />
                                            <input v-model="wizard.companySearch" type="text" placeholder="Søg navn eller email..."
                                                class="co-input pl-9" @input="searchCompanies" />
                                        </div>
                                        <div v-if="wizard.companyResults.length" class="mt-1 border border-[#EAECF0] rounded-xl bg-white shadow-lg max-h-48 overflow-y-auto">
                                            <button v-for="c in wizard.companyResults" :key="c.uuid"
                                                class="w-full text-left px-3 py-2.5 hover:bg-[#F5F6F8] flex items-center gap-3 transition-colors"
                                                @click="selectCompany(c)">
                                                <div class="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                                                    :style="`background:${avatarColor(c.name)}`">{{ (c.name||'?').charAt(0).toUpperCase() }}</div>
                                                <div>
                                                    <p class="text-[13px] font-medium text-[#1F2533]">{{ c.name }}</p>
                                                    <p v-if="c.email" class="text-[11px] text-[#8891A4]">{{ c.email }}</p>
                                                </div>
                                            </button>
                                        </div>
                                        <div v-if="wizard.selectedCompany" class="mt-2 flex items-center gap-3 px-3 py-2.5 bg-[#E4F1F6] rounded-xl border border-[#42AED9]/20">
                                            <div class="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
                                                :style="`background:${avatarColor(wizard.selectedCompany.name)}`">
                                                {{ wizard.selectedCompany.name.charAt(0).toUpperCase() }}
                                            </div>
                                            <div class="flex-1">
                                                <p class="text-[13px] font-semibold text-[#205E77]">{{ wizard.selectedCompany.name }}</p>
                                                <p v-if="wizard.selectedCompany.email" class="text-[11px] text-[#42AED9]">{{ wizard.selectedCompany.email }}</p>
                                            </div>
                                            <button @click="wizard.selectedCompany = null; wizard.companySearch=''" class="text-[#205E77]/50 hover:text-[#205E77]">
                                                <Icon name="ph:x" class="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p v-if="wizard.errors.company" class="co-error mt-2">{{ wizard.errors.company }}</p>
                                    </div>

                                    <!-- Ny virksomhed: mini-form -->
                                    <div v-else class="space-y-3">
                                        <div>
                                            <label class="co-label">Virksomhedsnavn <span class="text-red-500">*</span></label>
                                            <input v-model="wizard.newCompany.name" type="text" placeholder="Virksomhedsnavn" class="co-input"
                                                :class="wizard.errors.newName ? 'border-red-300' : ''" />
                                            <p v-if="wizard.errors.newName" class="co-error">{{ wizard.errors.newName }}</p>
                                        </div>
                                        <div class="grid grid-cols-2 gap-3">
                                            <div>
                                                <label class="co-label">Fornavn</label>
                                                <input v-model="wizard.newCompany.firstname" type="text" placeholder="Fornavn" class="co-input" />
                                            </div>
                                            <div>
                                                <label class="co-label">Efternavn</label>
                                                <input v-model="wizard.newCompany.lastname" type="text" placeholder="Efternavn" class="co-input" />
                                            </div>
                                        </div>
                                        <div>
                                            <label class="co-label">Email</label>
                                            <input v-model="wizard.newCompany.email" type="email" placeholder="email@virksomhed.dk" class="co-input" />
                                        </div>
                                        <div>
                                            <label class="co-label">Telefon</label>
                                            <input v-model="wizard.newCompany.phone" type="tel" placeholder="+45 12 34 56 78" class="co-input" />
                                        </div>
                                    </div>
                                </div>

                                <!-- ── STEP 2: PRODUKTER ── -->
                                <div v-if="wizard.step === 2">
                                    <h3 class="text-[15px] font-semibold text-[#1F2533] mb-1">Vælg produkter</h3>
                                    <p class="text-[12px] text-[#8891A4] mb-4">Pakke, apps, kurser og tilkøb</p>

                                    <!-- ─ Pakker ─ -->
                                    <div class="mb-5">
                                        <p class="text-[10px] font-bold text-[#8891A4] uppercase tracking-[0.08em] mb-2">Abonnementspakke</p>
                                        <div class="space-y-2">
                                            <button v-for="plan in plans" :key="plan.key"
                                                class="w-full text-left p-3.5 rounded-xl border-2 transition-colors flex items-center justify-between"
                                                :style="wizard.form.plan===plan.key
                                                    ? 'border-color:#42AED9;background:#F0FAFD'
                                                    : 'border-color:#EAECF0;background:white'"
                                                @click="wizard.form.plan = wizard.form.plan === plan.key ? '' : plan.key">
                                                <div class="flex items-center gap-3">
                                                    <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                                        :style="`background:${plan.color}20;color:${plan.color}`">
                                                        <Icon :name="plan.icon" class="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p class="text-[13px] font-semibold text-[#1F2533]">{{ plan.name }}</p>
                                                        <p class="text-[11px] text-[#5C6478]">{{ plan.description }}</p>
                                                    </div>
                                                </div>
                                                <div class="text-right flex-shrink-0 ml-4 flex items-center gap-2">
                                                    <div>
                                                        <p class="text-[14px] font-bold text-[#1F2533]">{{ plan.price === 0 ? 'Gratis' : `kr. ${plan.price}` }}</p>
                                                        <p v-if="plan.price > 0" class="text-[11px] text-[#8891A4]">/md.</p>
                                                    </div>
                                                    <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                                                        :style="wizard.form.plan===plan.key ? 'border-color:#42AED9;background:#42AED9' : 'border-color:#D5D9E2'">
                                                        <div v-if="wizard.form.plan===plan.key" class="w-1.5 h-1.5 rounded-full bg-white"></div>
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    <!-- ─ Faktureringsperiode ─ -->
                                    <div class="mb-5">
                                        <p class="text-[10px] font-bold text-[#8891A4] uppercase tracking-[0.08em] mb-2">Faktureringsperiode</p>
                                        <div class="flex gap-2">
                                            <button class="flex-1 py-2.5 rounded-xl text-[13px] font-medium border-2 transition-colors"
                                                :style="wizard.form.billing_period==='monthly' ? 'border-color:#42AED9;background:#F0FAFD;color:#205E77' : 'border-color:#EAECF0;background:white;color:#5C6478'"
                                                @click="wizard.form.billing_period='monthly'">Månedlig</button>
                                            <button class="flex-1 py-2.5 rounded-xl text-[13px] font-medium border-2 transition-colors flex items-center justify-center gap-1.5"
                                                :style="wizard.form.billing_period==='yearly' ? 'border-color:#42AED9;background:#F0FAFD;color:#205E77' : 'border-color:#EAECF0;background:white;color:#5C6478'"
                                                @click="wizard.form.billing_period='yearly'">
                                                Årlig
                                                <span class="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">-15%</span>
                                            </button>
                                        </div>
                                    </div>

                                    <!-- ─ Ekstra brugere + afdelinger ─ -->
                                    <div class="mb-5">
                                        <p class="text-[10px] font-bold text-[#8891A4] uppercase tracking-[0.08em] mb-2">Tilkøb til pakke</p>
                                        <div class="grid grid-cols-2 gap-3">
                                            <div>
                                                <label class="co-label">Ekstra brugere</label>
                                                <input v-model.number="wizard.form.extra_users" type="number" min="0" placeholder="0" class="co-input" />
                                                <p class="text-[11px] text-[#8891A4] mt-1">+kr. 39/md. per bruger</p>
                                            </div>
                                            <div>
                                                <label class="co-label">Ekstra afdelinger</label>
                                                <input v-model.number="wizard.form.extra_departments" type="number" min="0" placeholder="0" class="co-input" />
                                                <p class="text-[11px] text-[#8891A4] mt-1">+kr. 79/md. per afdeling</p>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- ─ Apps ─ -->
                                    <div v-if="availableApps.length" class="mb-5">
                                        <p class="text-[10px] font-bold text-[#8891A4] uppercase tracking-[0.08em] mb-2">Apps (App Store tilkøb)</p>
                                        <div class="space-y-2">
                                            <button v-for="app in availableApps" :key="app.uuid ?? app.id"
                                                class="w-full text-left p-3 rounded-xl border-2 transition-colors flex items-center justify-between"
                                                :style="isAppSelected(app) ? 'border-color:#42AED9;background:#F0FAFD' : 'border-color:#EAECF0;background:white'"
                                                @click="toggleApp(app)">
                                                <div class="flex items-center gap-3">
                                                    <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                                        :style="`background:${appColor(app.name)}20;color:${appColor(app.name)}`">
                                                        <Icon :name="appIcon(app.name)" class="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                        <p class="text-[13px] font-semibold text-[#1F2533]">{{ app.name }}</p>
                                                        <p v-if="app.description" class="text-[11px] text-[#5C6478] truncate max-w-[240px]">{{ app.description }}</p>
                                                    </div>
                                                </div>
                                                <div class="flex items-center gap-2 flex-shrink-0 ml-3">
                                                    <div class="text-right">
                                                        <p v-if="app.one_time_price > 0" class="text-[13px] font-bold text-[#1F2533]">kr. {{ app.one_time_price }}</p>
                                                        <p v-else-if="app.monthly_price > 0" class="text-[13px] font-bold text-[#1F2533]">kr. {{ app.monthly_price }}/md.</p>
                                                        <p v-else class="text-[12px] text-[#8891A4]">Gratis</p>
                                                        <span v-if="app.one_time_price > 0" class="text-[10px] text-[#D4900A] font-medium">Én gang</span>
                                                    </div>
                                                    <div class="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
                                                        :style="isAppSelected(app) ? 'border-color:#42AED9;background:#42AED9' : 'border-color:#D5D9E2;background:white'">
                                                        <Icon v-if="isAppSelected(app)" name="ph:check-bold" class="w-3 h-3 text-white" />
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    <!-- ─ Prisoversigt ─ -->
                                    <div class="bg-[#F5F6F8] rounded-xl p-4 border border-[#EAECF0]">
                                        <p class="text-[11px] font-bold text-[#8891A4] uppercase tracking-[0.06em] mb-3">Ordreoversigt</p>

                                        <div v-if="!wizard.form.plan && !wizard.form.selectedApps?.length && wizard.form.extra_users === 0 && wizard.form.extra_departments === 0"
                                            class="text-[12px] text-[#8891A4] text-center py-2">Vælg mindst ét produkt</div>

                                        <div v-if="wizard.form.plan && selectedPlan" class="flex justify-between text-[13px] mb-1.5">
                                            <span class="text-[#5C6478]">{{ selectedPlan.name }}</span>
                                            <span class="font-medium text-[#1F2533]">kr. {{ selectedPlan.price }}/md.</span>
                                        </div>
                                        <div v-if="wizard.form.extra_users > 0" class="flex justify-between text-[13px] mb-1.5">
                                            <span class="text-[#5C6478]">{{ wizard.form.extra_users }} ekstra bruger(e)</span>
                                            <span class="font-medium text-[#1F2533]">kr. {{ wizard.form.extra_users * 39 }}/md.</span>
                                        </div>
                                        <div v-if="wizard.form.extra_departments > 0" class="flex justify-between text-[13px] mb-1.5">
                                            <span class="text-[#5C6478]">{{ wizard.form.extra_departments }} ekstra afdeling(er)</span>
                                            <span class="font-medium text-[#1F2533]">kr. {{ wizard.form.extra_departments * 79 }}/md.</span>
                                        </div>
                                        <div v-for="app in selectedApps" :key="app.uuid ?? app.id" class="flex justify-between text-[13px] mb-1.5">
                                            <span class="text-[#5C6478] flex items-center gap-1.5">
                                                <Icon :name="appIcon(app.name)" class="w-3 h-3" />
                                                {{ app.name }}
                                            </span>
                                            <span class="font-medium text-[#1F2533]">
                                                <span v-if="app.one_time_price > 0">kr. {{ app.one_time_price }} <span class="text-[10px] text-[#D4900A]">én gang</span></span>
                                                <span v-else-if="app.monthly_price > 0">kr. {{ app.monthly_price }}/md.</span>
                                                <span v-else>Gratis</span>
                                            </span>
                                        </div>
                                        <div class="border-t border-[#EAECF0] pt-3 mt-2">
                                            <div class="flex justify-between">
                                                <span class="text-[13px] font-bold text-[#1F2533]">Månedlig total</span>
                                                <span class="text-[17px] font-extrabold text-[#205E77]">kr. {{ calculatedRecurring }}</span>
                                            </div>
                                            <div v-if="calculatedOneTime > 0" class="flex justify-between mt-1">
                                                <span class="text-[12px] text-[#D4900A] font-medium">Én gangs gebyrer</span>
                                                <span class="text-[14px] font-bold text-[#D4900A]">kr. {{ calculatedOneTime }}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p v-if="wizard.errors.plan" class="co-error mt-2">{{ wizard.errors.plan }}</p>
                                </div>

                                <!-- ── STEP 3: BETALING ── -->
                                <div v-if="wizard.step === 3">
                                    <h3 class="text-[15px] font-semibold text-[#1F2533] mb-4">Betaling & afslutning</h3>

                                    <div class="mb-4">
                                        <label class="co-label">Sælger</label>
                                        <input v-model="wizard.form.seller_name" type="text" placeholder="Dit navn" class="co-input" />
                                    </div>
                                    <div class="mb-4">
                                        <label class="co-label">Startdato</label>
                                        <input v-model="wizard.form.start_date" type="date" class="co-input" />
                                    </div>

                                    <!-- Betalingsmetode -->
                                    <div class="mb-4">
                                        <label class="co-label">Betalingsmetode</label>
                                        <div class="grid grid-cols-2 gap-2">
                                            <button v-for="pm in paymentMethods" :key="pm.value"
                                                class="py-2.5 px-3 rounded-xl border-2 text-[12px] font-medium transition-colors flex items-center gap-2"
                                                :style="wizard.form.payment_method===pm.value ? 'border-color:#42AED9;background:#F0FAFD;color:#205E77' : 'border-color:#EAECF0;background:white;color:#5C6478'"
                                                @click="wizard.form.payment_method=pm.value">
                                                <Icon :name="pm.icon" class="w-4 h-4" />
                                                {{ pm.label }}
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Ordrestatus -->
                                    <div class="mb-4">
                                        <label class="co-label">Ordrestatus</label>
                                        <div class="flex gap-2">
                                            <button v-for="s in orderStatuses" :key="s.value"
                                                class="flex-1 py-2.5 rounded-xl border-2 text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5"
                                                :style="wizard.form.status===s.value ? `border-color:${s.color};background:${s.bg};color:${s.color}` : 'border-color:#EAECF0;background:white;color:#5C6478'"
                                                @click="wizard.form.status=s.value">
                                                <Icon :name="s.icon" class="w-3.5 h-3.5" />
                                                {{ s.label }}
                                            </button>
                                        </div>
                                    </div>

                                    <div class="mb-5">
                                        <label class="co-label">Noter</label>
                                        <textarea v-model="wizard.form.notes" rows="3" placeholder="Interne noter om ordren..."
                                            class="co-input resize-none"></textarea>
                                    </div>

                                    <!-- Final summary -->
                                    <div class="bg-[#F5F6F8] rounded-xl p-4 border border-[#EAECF0]">
                                        <p class="text-[11px] font-bold text-[#8891A4] uppercase tracking-[0.06em] mb-3">Ordreoversigt</p>
                                        <div class="flex justify-between text-[13px] mb-1.5">
                                            <span class="text-[#5C6478]">Virksomhed</span>
                                            <span class="font-medium text-[#1F2533]">{{ wizard.selectedCompany?.name ?? wizard.newCompany.name }}</span>
                                        </div>
                                        <div v-if="wizard.form.plan && selectedPlan" class="flex justify-between text-[13px] mb-1.5">
                                            <span class="text-[#5C6478]">Plan</span>
                                            <span class="font-medium text-[#1F2533]">{{ selectedPlan.name }}</span>
                                        </div>
                                        <div v-for="app in selectedApps" :key="app.uuid" class="flex justify-between text-[13px] mb-1.5">
                                            <span class="text-[#5C6478]">{{ app.name }}</span>
                                            <span class="font-medium text-[#1F2533]">
                                                <span v-if="app.one_time_price > 0">kr. {{ app.one_time_price }}</span>
                                                <span v-else-if="app.monthly_price > 0">kr. {{ app.monthly_price }}/md.</span>
                                                <span v-else>Gratis</span>
                                            </span>
                                        </div>
                                        <div class="border-t border-[#EAECF0] pt-3 mt-2">
                                            <div class="flex justify-between">
                                                <span class="text-[13px] font-bold text-[#1F2533]">Månedlig total</span>
                                                <span class="text-[17px] font-extrabold text-[#205E77]">kr. {{ calculatedRecurring }}</span>
                                            </div>
                                            <div v-if="calculatedOneTime > 0" class="flex justify-between mt-1">
                                                <span class="text-[12px] text-[#D4900A] font-medium">Én gangs gebyrer</span>
                                                <span class="text-[14px] font-bold text-[#D4900A]">kr. {{ calculatedOneTime }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            <!-- Wizard footer -->
                            <div class="flex items-center gap-3 px-6 py-4 border-t border-[#EAECF0]">
                                <button @click="wizardBack"
                                    class="px-5 py-2.5 rounded-lg text-sm font-medium text-[#5C6478] bg-white border border-[#EAECF0] hover:bg-[#F5F6F8] transition-colors">
                                    {{ wizard.step === 1 ? 'Annuller' : '← Tilbage' }}
                                </button>
                                <button @click="wizardNext"
                                    class="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm flex items-center justify-center gap-2"
                                    style="background:#205E77" :disabled="wizard.isSaving">
                                    <span v-if="wizard.isSaving"><Icon name="ph:spinner" class="w-4 h-4 animate-spin" /> Gemmer...</span>
                                    <span v-else-if="wizard.step < 3">Fortsæt →</span>
                                    <span v-else>Opret ordre</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </Transition>
            </Teleport>

            <DialogConfirmation :isModalOpen="state.modal.isCancelOpen"
                message="Annuller denne ordre? Den kan ikke fortrydes."
                @close="state.modal.isCancelOpen = false"
                @confirm="cancelOrder" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { orderService } from '@/components/api/superadmin/OrderService'
import { companyService } from '@/components/api/superadmin/CompanyService'
import { appService } from '@/components/api/superadmin/AppService'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()

let currentPage = 1
let searchTimeout: any = null
let companySearchTimeout: any = null
const searchQuery = ref('')
const sortLabel = ref('id_desc')

const COLORS = ['#205E77','#2E9E33','#368F8B','#1A4D99','#D4900A','#9B4D9B']
const avatarColor = (name: string) => COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length]
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('da-DK', { day:'numeric', month:'short', year:'numeric' }) : '—'
const planLabel = (key: string) => plans.find(p => p.key === key)?.name ?? key

const APP_ICONS: Record<string, string> = {
    'mail': 'ph:envelope', 'booking': 'ph:calendar', 'kursus': 'ph:graduation-cap',
    'leads': 'ph:funnel', 'ai': 'ph:robot', 'chat': 'ph:chat',
}
const appIcon = (name: string) => {
    const key = (name||'').toLowerCase()
    const match = Object.keys(APP_ICONS).find(k => key.includes(k))
    return match ? APP_ICONS[match] : 'ph:squares-four'
}
const appColor = (name: string) => COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length]

const steps = ['Virksomhed', 'Produkter', 'Betaling']

const plans = [
    { key:'gratis', name:'Gratis',  price:0,   color:'#8891A4', icon:'ph:gift',         description:'1 bruger, 1 afdeling, 1 GB' },
    { key:'basis',  name:'Basis',   price:249,  color:'#42AED9', icon:'ph:star',         description:'1 bruger inkl., ubegrænset borgere' },
    { key:'pro',    name:'Pro',     price:449,  color:'#205E77', icon:'ph:crown-simple', description:'3 brugere, 3 afdelinger, 3 GB, FMK' },
]

const paymentMethods = [
    { value:'card',    label:'Betalingskort', icon:'ph:credit-card' },
    { value:'invoice', label:'Faktura',       icon:'ph:file-text' },
    { value:'free',    label:'Gratis',        icon:'ph:gift' },
    { value:'other',   label:'Andet',         icon:'ph:dots-three' },
]

const orderStatuses = [
    { value:'pending',   label:'Afventer',   icon:'ph:clock',        color:'#D4900A', bg:'#FFF9EC' },
    { value:'completed', label:'Gennemført', icon:'ph:check-circle', color:'#2E9E33', bg:'#EDF7EE' },
    { value:'cancelled', label:'Annulleret', icon:'ph:x-circle',     color:'#CC3B2D', bg:'#FFF0F0' },
]

const statusMap: Record<string, any> = {
    pending:   { label:'Afventer',   icon:'ph:clock',        color:'#D4900A', bg:'#FFF9EC' },
    completed: { label:'Gennemført', icon:'ph:check-circle', color:'#2E9E33', bg:'#EDF7EE' },
    cancelled: { label:'Annulleret', icon:'ph:x-circle',     color:'#CC3B2D', bg:'#FFF0F0' },
}

const state = reactive({
    orders: [] as any,
    availableApps: [] as any[],
    activeTab: 'all',
    completedCount: 0, pendingCount: 0, cancelledCount: 0,
    error: {} as Error,
    isLoading: false,
    modal: { isCancelOpen: false },
    selectedOrder: {} as any,
    sortData: { sortField: 'id', sortOrder: 'descend' },
    dataFilter: { search: '' },
})

const wizard = reactive({
    open: false,
    step: 1,
    isSaving: false,
    companyMode: 'existing' as 'existing'|'new',
    companySearch: '',
    companyResults: [] as any[],
    selectedCompany: null as any,
    newCompany: { name:'', firstname:'', lastname:'', email:'', phone:'' },
    form: {
        plan: '' as string,
        billing_period: 'monthly',
        extra_users: 0,
        extra_departments: 0,
        selectedApps: [] as any[],
        seller_name: '',
        notes: '',
        start_date: new Date().toISOString().split('T')[0],
        payment_method: 'card',
        status: 'pending',
    },
    errors: { company:'', newName:'', plan:'' },
})

const tabs = computed(() => [
    { key:'all',       label:'Alle',       count: state.orders?.total ?? 0 },
    { key:'active',    label:'Aktive',     count: state.completedCount },
    { key:'pending',   label:'Afventer',   count: state.pendingCount },
    { key:'cancelled', label:'Annulleret', count: state.cancelledCount },
])

const availableApps = computed(() => state.availableApps.filter((a: any) => a.is_active !== false))
const selectedApps = computed(() => wizard.form.selectedApps)
const selectedPlan = computed(() => plans.find(p => p.key === wizard.form.plan))

const calculatedRecurring = computed(() => {
    const base = selectedPlan.value?.price ?? 0
    const addons = (wizard.form.extra_users || 0) * 39 + (wizard.form.extra_departments || 0) * 79
    const appMonthly = selectedApps.value.reduce((s: number, a: any) => s + (a.monthly_price ?? 0), 0)
    return base + addons + appMonthly
})

const calculatedOneTime = computed(() =>
    selectedApps.value.reduce((s: number, a: any) => s + (a.one_time_price ?? 0), 0)
)

function isAppSelected(app: any) {
    return wizard.form.selectedApps.some((a: any) => (a.uuid ?? a.id) === (app.uuid ?? app.id))
}

function toggleApp(app: any) {
    if (isAppSelected(app)) {
        wizard.form.selectedApps = wizard.form.selectedApps.filter((a: any) => (a.uuid ?? a.id) !== (app.uuid ?? app.id))
    } else {
        wizard.form.selectedApps.push(app)
    }
}

function openWizard() {
    wizard.step = 1; wizard.companyMode = 'existing'
    wizard.companySearch = ''; wizard.companyResults = []; wizard.selectedCompany = null
    wizard.newCompany = { name:'', firstname:'', lastname:'', email:'', phone:'' }
    wizard.form = { plan:'', billing_period:'monthly', extra_users:0, extra_departments:0, selectedApps:[], seller_name:'', notes:'', start_date:new Date().toISOString().split('T')[0], payment_method:'card', status:'pending' }
    wizard.errors = { company:'', newName:'', plan:'' }
    wizard.open = true
    document.body.style.overflow = 'hidden'
}

function closeWizard() { wizard.open = false; document.body.style.overflow = '' }

function wizardBack() {
    if (wizard.step === 1) closeWizard()
    else wizard.step--
}

function wizardNext() {
    wizard.errors = { company:'', newName:'', plan:'' }
    if (wizard.step === 1) {
        if (wizard.companyMode === 'existing' && !wizard.selectedCompany) { wizard.errors.company = 'Vælg eller søg en virksomhed'; return }
        if (wizard.companyMode === 'new' && !wizard.newCompany.name) { wizard.errors.newName = 'Virksomhedsnavn er påkrævet'; return }
        wizard.step = 2
    } else if (wizard.step === 2) {
        if (!wizard.form.plan && !wizard.form.selectedApps.length) { wizard.errors.plan = 'Vælg mindst en pakke eller en app'; return }
        wizard.step = 3
    } else {
        saveOrder()
    }
}

async function saveOrder() {
    wizard.isSaving = true
    try {
        const params: any = {
            plan: wizard.form.plan,
            billing_period: wizard.form.billing_period,
            extra_users: wizard.form.extra_users,
            extra_departments: wizard.form.extra_departments,
            apps: wizard.form.selectedApps.map((a: any) => a.uuid ?? a.id),
            total: calculatedRecurring.value,
            one_time_total: calculatedOneTime.value,
            seller_name: wizard.form.seller_name,
            notes: wizard.form.notes,
            start_date: wizard.form.start_date,
            payment_method: wizard.form.payment_method,
            status: wizard.form.status,
        }
        if (wizard.companyMode === 'existing') {
            params.company_uuid = wizard.selectedCompany.uuid
        } else {
            params.new_company = wizard.newCompany
        }
        await orderService.createOrder(params)
        const name = wizard.selectedCompany?.name ?? wizard.newCompany.name
        successAlert('Ordre oprettet!', `Ordre til ${name} er oprettet.`)
        closeWizard(); fetchOrders()
    } catch (error: any) { state.error = error }
    wizard.isSaving = false
}

function searchCompanies() {
    clearTimeout(companySearchTimeout)
    if (!wizard.companySearch.trim()) { wizard.companyResults = []; return }
    companySearchTimeout = setTimeout(async () => {
        try {
            const r = await companyService.getCompanies({ search: wizard.companySearch, page: 1 })
            wizard.companyResults = r?.data?.slice(0, 8) ?? []
        } catch (_) {}
    }, 300)
}

function selectCompany(c: any) { wizard.selectedCompany = c; wizard.companySearch = c.name; wizard.companyResults = [] }

onMounted(() => { fetchOrders(); fetchApps() })

async function fetchApps() {
    try {
        const r = await appService.getApplications()
        state.availableApps = Array.isArray(r) ? r : (r?.data ?? [])
    } catch (_) {}
}

async function fetchOrders() {
    state.error = {}; state.isLoading = true
    try {
        const params: any = { page: currentPage, sortField: state.sortData.sortField, sortOrder: state.sortData.sortOrder, ...state.dataFilter }
        if (state.activeTab !== 'all') params.status = state.activeTab === 'active' ? 'completed' : state.activeTab
        const response = await orderService.getOrders(params)
        if (response) {
            state.orders = response
            const items = response?.data ?? []
            state.completedCount = items.filter((o: any) => o.status==='completed').length
            state.pendingCount   = items.filter((o: any) => o.status==='pending').length
            state.cancelledCount = items.filter((o: any) => o.status==='cancelled').length
        }
    } catch (error: any) { state.error = error }
    state.isLoading = false
}

function debouncedSearch() {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => { state.dataFilter.search = searchQuery.value; currentPage = 1; fetchOrders() }, 350)
}
function setTab(tab: string) { state.activeTab = tab; currentPage = 1; fetchOrders() }
function handleSortChange() {
    const parts = sortLabel.value.split('_'); const order = parts.pop()
    state.sortData.sortField = parts.join('_'); state.sortData.sortOrder = order==='asc'?'ascend':'descend'
    currentPage = 1; fetchOrders()
}
function previous() { currentPage--; fetchOrders() }
function next()     { currentPage++; fetchOrders() }
function confirmCancel(order: any) { state.selectedOrder = order; state.modal.isCancelOpen = true }

async function cancelOrder() {
    try { await orderService.updateOrderStatus(state.selectedOrder.uuid ?? state.selectedOrder.id, 'cancelled'); fetchOrders() }
    catch (error: any) { state.error = error }
}
async function completeOrder(order: any) {
    try { await orderService.updateOrderStatus(order.uuid ?? order.id, 'completed'); successAlert('Opdateret!', 'Ordren er gennemført.'); fetchOrders() }
    catch (error: any) { state.error = error }
}

onMounted(() => { window.addEventListener('keydown', (e) => { if (e.key==='Escape' && wizard.open) closeWizard() }) })
</script>

<style scoped>
.co-th { text-align:left; padding:10px 16px; font-size:11px; font-weight:600; color:#8891A4; text-transform:uppercase; letter-spacing:0.06em }
.co-td { padding:12px 16px; vertical-align:middle }
.co-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 8px; border-radius:999px; font-size:11px; font-weight:600; white-space:nowrap }
.co-badge-green { background:#EDF7EE; color:#2E9E33 }
.co-badge-red   { background:#FFF0F0; color:#CC3B2D }
.co-badge-navy  { background:#E4F1F6; color:#205E77 }
.co-badge-gray  { background:#F5F6F8; color:#5C6478 }
.co-badge-warn  { background:#FFF9EC; color:#D4900A }
.co-action-btn  { display:inline-flex; align-items:center; gap:4px; padding:5px 10px; border-radius:8px; font-size:12px; font-weight:500; background:#F5F6F8; color:#5C6478; border:1px solid #EAECF0; transition:all 0.15s; cursor:pointer }
.co-action-btn:hover { background:#EEF4FB; color:#205E77 }
.co-label { display:block; font-size:13px; font-weight:600; color:#1F2533; margin-bottom:5px }
.co-input { width:100%; padding:9px 13px; font-size:14px; color:#1F2533; background:white; border:1px solid #D5D9E2; border-radius:10px; outline:none; transition:border-color 0.15s, box-shadow 0.15s }
.co-input:focus { border-color:#42AED9; box-shadow:0 0 0 3px rgba(66,174,217,0.12) }
.co-input::placeholder { color:#B0B8C4 }
.co-error { font-size:11px; color:#CC3B2D; margin-top:4px }
</style>
