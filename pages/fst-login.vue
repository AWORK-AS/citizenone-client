<template>

	<Head>
		<Title>{{ $t('login.login') }} - {{ runtimeConfig?.public?.appName }}</Title>
	</Head>

	<div class="fst-page">

		<div class="fst-left">
			<div class="fst-bc fst-bc1"></div>
			<div class="fst-bc fst-bc2"></div>
			<div class="fst-bc fst-bc3"></div>

			<div class="hidden"><span id="fstAsset01"></span><span id="fstAsset02"></span></div>
			<div class="fst-left-top">
				<div class="fst-left-logo">
					<div class="fst-logo-icon">
						<div class="fst-ring fst-rg1"></div>
						<div class="fst-ring fst-rg2"></div>
						<div class="fst-ring fst-rg3"></div>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38.98 38.98" width="38" height="38"
							class="relative z-[2]">
							<circle class="fst-oc" cx="19.49" cy="19.49" r="18.99" fill="#1a3a5c" stroke="rgb(66,174,217)"
								stroke-width="1" />
							<circle class="fst-ic" cx="19.43" cy="19.55" r="11.93" fill="rgb(66,174,217)" stroke="#fff"
								stroke-width="0.5" />
						</svg>
					</div>
					<span class="fst-logo-wordmark">CitizenOne<sup class="text-[10px] align-super">™</sup></span>
				</div>
			</div>

			<div class="fst-left-mid">
				<div class="fst-left-tag">
					{{ $t('login.tagline') }}
				</div>
				<div class="fst-left-h">
					{{ $t('login.headlineLine1') }}<br>{{ $t('login.headlineLine2') }}
				</div>
				<p class="fst-left-p">
					{{ $t('login.description') }}
				</p>

				<div class="fst-idx-live">
					<div class="fst-idx-live-hdr">
						<div class="fst-idx-live-dot"></div>
						<span class="fst-idx-live-lbl">
							{{ $t('login.liveActivity') }}
						</span>
					</div>
					<div class="fst-idx-stats">
						<div class="fst-idx-stat">
							<div class="fst-idx-stat-num" id="fst-users">—</div>
							<div class="fst-idx-stat-lbl">
								{{ $t('login.activeUsers') }}
							</div>
						</div>
						<div class="fst-idx-stat">
							<div class="fst-idx-stat-num" id="fst-journals">—</div>
							<div class="fst-idx-stat-lbl">
								{{ $t('login.journalNotesToday') }}
							</div>
						</div>
						<div class="fst-idx-stat">
							<div class="fst-idx-stat-num" id="fst-shifts">—</div>
							<div class="fst-idx-stat-lbl">
								{{ $t('login.shiftsPlannedToday') }}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="fst-left-foot">
				<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(240,250,249,0.3)"
					stroke-width="2" stroke-linecap="round">
					<rect x="3" y="11" width="18" height="11" rx="2" />
					<path d="M7 11V7a5 5 0 0110 0v4" />
				</svg>
				{{ $t('login.gdprNote') }}
			</div>
		</div>

		<div class="fst-right">
			<div class="fst-right-bg">
				<div class="fst-rbc fst-rbc1"></div>
				<div class="fst-rbc fst-rbc2"></div>
				<div class="fst-rbc fst-rbc3"></div>
			</div>

			<ModulesUserAuthenticationModalOtpVerification
				v-if="state.modal.isIpOtpOpen"
				:isModalOpen="state.modal.isIpOtpOpen"
				otpType="ip"
				:email="state.formLogin.email ?? ''"
				:deviceUuid="state.deviceUuid"
				@close="state.modal.isIpOtpOpen = false" />

			<ModulesUserAuthenticationModalOtpVerification
				v-if="state.modal.isDeviceOtpOpen"
				:isModalOpen="state.modal.isDeviceOtpOpen"
				otpType="device"
				:email="state.formLogin.email ?? ''"
				:deviceUuid="state.deviceUuid"
				@close="state.modal.isDeviceOtpOpen = false" />

			<div class="fst-form-card">
				<Alert type="danger" :text="state?.error?.message"
					v-if="state.error?.message && state.error.message.length > 0" />

				<div class="flex justify-center mb-5">
					<LogoFst @click="navigateTo('/fst-login')" class="cursor-pointer" />
				</div>

				<div class="flex items-center justify-between mb-1">
					<h1 class="fst-form-title !mb-0">
						{{ $t('login.welcomeBack') }}
					</h1>
					<div class="relative" v-click-outside="() => state.langOpen = false">
						<button type="button" @click="state.langOpen = !state.langOpen"
							class="flex items-center gap-1.5 py-[5px] pr-[10px] pl-[6px] rounded-full border border-slate-200 bg-white cursor-pointer text-xs font-semibold text-slate-500 hover:border-slate-300 transition-colors">
							<img :src="identifyFlag()" alt="flag" class="w-5 h-5 rounded-full object-cover" />
							{{ language.locale.value === 'en' ? 'EN' : 'DK' }}
							<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
								stroke-width="2.5">
								<polyline points="6 9 12 15 18 9" />
							</svg>
						</button>
						<div v-if="state.langOpen"
							class="absolute right-0 top-[calc(100%+6px)] bg-white border border-slate-200 rounded-xl shadow-lg z-[100] min-w-[120px] overflow-hidden">
							<button type="button" @click="setLang('dk')"
								:class="['flex items-center gap-2 w-full px-3.5 py-2.5 border-0 bg-transparent cursor-pointer text-[13px] font-medium text-[#1a2332] hover:bg-[#edf5fb] transition-colors', language.locale.value === 'dk' && 'bg-[#edf5fb]']">
								<img src="/img/icons/flags/denmark.svg" class="w-5 h-5 rounded-full object-cover" />
								Dansk
							</button>
							<button type="button" @click="setLang('en')"
								:class="['flex items-center gap-2 w-full px-3.5 py-2.5 border-0 bg-transparent cursor-pointer text-[13px] font-medium text-[#1a2332] hover:bg-[#edf5fb] transition-colors', language.locale.value === 'en' && 'bg-[#edf5fb]']">
								<img src="/img/icons/flags/united-kingdom.svg"
									class="w-5 h-5 rounded-full object-cover" />
								English
							</button>
						</div>
					</div>
				</div>
				<p class="fst-form-sub">
					{{ $t('login.loginToContinueTo') }} CitizenOne.
				</p>

				<div class="fst-field">
					<label for="fst-email">
						{{ $t('login.form.emailAddress') }}
					</label>
					<input id="fst-email" v-model="state.formLogin.email" type="email"
						:placeholder="$t('login.form.emailPlaceholder')" autocomplete="email" />
				</div>

				<div class="fst-field">
					<label for="fst-pw">
						{{ $t('login.form.password') }}
					</label>
					<div class="fst-pw-wrap">
						<input id="fst-pw" v-model="state.formLogin.password"
							:type="state.showPassword ? 'text' : 'password'" placeholder="••••••••"
							autocomplete="current-password" />
						<button class="fst-pw-eye" type="button" @click="state.showPassword = !state.showPassword">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
								stroke-width="2" stroke-linecap="round">
								<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
								<circle cx="12" cy="12" r="3" />
							</svg>
						</button>
					</div>
				</div>

				<div class="fst-row-forgot">
					<label class="fst-remember">
						<input v-model="state.remember_me" type="checkbox" />
						{{ $t('login.form.rememberMeFor14Days') }}
					</label>
					<a class="fst-forgot-link" @click="navigateTo('/fst-forgot-password')">
						{{ $t('login.form.forgotPassword') }}?
					</a>
				</div>

				<button class="fst-btn-primary" type="button" :disabled="state.isPageLoading" @click="login">
					{{ state.isPageLoading ? $t('login.form.login') + '...' : $t('login.form.login') }}
				</button>

				<div class="fst-or-row">
					<div class="fst-or-line"></div><span class="fst-or-txt">
						{{ $t('login.form.or') }}
					</span>
					<div class="fst-or-line"></div>
				</div>

				<div class="fst-alt-links">
					<div class="fst-signup-row">
						{{ $t('login.form.dontHaveAnAccount') }}?
						<a @click="navigateTo('/fst-register')">
							{{ $t('login.form.createHere') }}</a> &nbsp;·&nbsp;
						<a href="https://citizenone.dk/support">
							{{ $t('login.form.help') }}
						</a>
					</div>
				</div>

				<div class="fst-iso-note">
					<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
						stroke-linecap="round">
						<rect x="3" y="11" width="18" height="11" rx="2" />
						<path d="M7 11V7a5 5 0 0110 0v4" />
					</svg>
					{{ $t('login.isoNote') }}
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { authService } from '@/components/api/user/AuthService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useDepartmentStore } from '@/store/department'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const departmentStore = useDepartmentStore()
const userStore = useUserStore()
const language = useI18n()
const { t } = language

// Set language
language.locale.value = userStore.getLanguage

const state = reactive({
	deviceUuid: '' as string,
	error: {} as Error,
	formLogin: {
		email: null as any,
		password: null as any,
	},
	isPageLoading: false,
	langOpen: false,
	modal: {
		isGoogle2faVerificationOpen: false,
		isIpOtpOpen: false,
		isDeviceOtpOpen: false,
	},
	remember_me: false,
	showPassword: false,
})

const rules = computed(() => {
	return {
		formLogin: {
			email: {
				required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
			},
			password: {
				required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
			},
		}
	}
})
const v$ = useVuelidate(rules, state)

onMounted(() => {
	animateAssets()
	const rememberMe = localStorage.getItem("remember_me")
	if (rememberMe) {
		navigateTo('/overview')
	}
	let deviceUuid = localStorage.getItem("device_uuid")
	if (!deviceUuid) {
		deviceUuid = crypto.randomUUID()
		localStorage.setItem("device_uuid", deviceUuid)
	}
	state.deviceUuid = deviceUuid

	// Live stats
	const fstFmt = (n: number) => Math.round(n).toLocaleString('da-DK')
	const fstAnim = (id: string, target: number, dur: number) => {
		const el = document.getElementById(id)
		if (!el) return
		const start = performance.now()
		const step = (now: number) => {
			const p = Math.min((now - start) / dur, 1)
			const e = 1 - Math.pow(1 - p, 3)
			el.textContent = fstFmt(Math.round(e * target))
			if (p < 1) requestAnimationFrame(step)
		}
		requestAnimationFrame(step)
	}
	const now = new Date()
	const base = new Date('2024-01-01')
	const months = Math.max(1, (now.getFullYear() - base.getFullYear()) * 12 + (now.getMonth() - base.getMonth()))
	const gf = months <= 12 ? Math.pow(1.08, months) : Math.pow(1.08, 12) * Math.pow(1.04, months - 12)
	const seed = now.getDate() * 31 + now.getMonth() * 7
	const sr = (min: number, max: number, off: number) => {
		const x = Math.abs(Math.sin(seed + off) * 99991)
		return Math.round(min + (x - Math.floor(x)) * (max - min))
	}
	const h = now.getHours()
	const wd = now.getDay()
	const isWE = wd === 0 || wd === 6
	const tMul = isWE ? 0.6 : (h >= 7 && h <= 17 ? 1.0 : 0.35)
	const journalMax = Math.round(Math.min(gf * 5200, 17000))
	const minsSinceMidnight = h * 60 + now.getMinutes()
	const jCurve = (() => {
		const m = minsSinceMidnight
		if (m < 360) return 18 + m * 0.04
		if (m < 420) return 32 + (m - 360) * 2.5
		if (m < 540) return 182 + (m - 420) * 28
		if (m < 720) return 3542 + (m - 540) * 42
		if (m < 1020) return 11102 + (m - 720) * 19
		if (m < 1380) return 16802 + (m - 1020) * 0.5
		return journalMax - 30
	})()
	let users = Math.max(200, Math.min(999, Math.round(sr(750, 999, 1) * tMul)))
	let journals = Math.max(18, Math.min(journalMax, Math.round(jCurve * (journalMax / 17000))))
	if (isWE) journals = Math.round(journals * 0.45)
	const jSkew = Math.round((sr(0, 100, 9) - 50) * 1.2)
	journals = Math.max(18, Math.min(journalMax, journals + jSkew))
	if (journals % 100 === 0) journals += 43
	if (journals % 50 === 0) journals += 17
	let shifts = sr(300, 800, 3)
	if (shifts % 100 === 0) shifts += 23

	setTimeout(() => {
		fstAnim('fst-users', users, 1600)
		fstAnim('fst-journals', journals, 2000)
		fstAnim('fst-shifts', shifts, 1800)
	}, 800)
	setInterval(() => {
		const el = document.getElementById('fst-users')
		if (!el) return
		const d = (Math.random() > 0.5 ? 1 : -1) * Math.ceil(Math.random() * 3)
		users = Math.max(Math.round(500 * tMul), Math.min(999, users + d))
		el.textContent = fstFmt(users)
	}, 4000)
	setInterval(() => {
		const el = document.getElementById('fst-journals')
		if (!el) return
		journals = Math.min(journalMax, journals + Math.ceil(Math.random() * 2))
		el.textContent = fstFmt(journals)
	}, 7000)
	setInterval(() => {
		const el = document.getElementById('fst-shifts')
		if (!el) return
		if (Math.random() > 0.65) {
			shifts = Math.min(800, shifts + 1)
			el.textContent = fstFmt(shifts)
		}
	}, 11000)
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
	const a1 = document.getElementById('fstAsset01')
	const a2 = document.getElementById('fstAsset02')
	if (a1) observer.observe(a1)
	if (a2) observer.observe(a2)
}

async function login() {
	state.error = {}
	v$.value.$validate()
	if (!v$.value.$error) {
		state.isPageLoading = true
		try {
			const params = {
				email: state.formLogin.email,
				password: state.formLogin.password,
				device_uuid: state.deviceUuid,
			}
			const response = await authService.login(params)
			if (response.requires_ip_otp) {
				state.modal.isIpOtpOpen = true
			} else if (response.requires_device_otp) {
				state.modal.isDeviceOtpOpen = true
			} else if (response.data) {
				if (state.remember_me) {
					localStorage.setItem("remember_me", state.remember_me?.toString())
				} else {
					localStorage.removeItem("remember_me")
				}
				if (response.data?.user?.is_google_2fa_enabled) {
					state.modal.isGoogle2faVerificationOpen = true
				} else {
					localStorage.setItem("_token", response.data?.token)
					departmentStore.resetSelectedDepartment()
					departmentStore.resetSelectedDepartmentColor()
					departmentStore.resetSelectedDepartmentName()
					userStore.setUser(response?.data?.user)
					userStore.setLanguage(response?.data?.user?.language?.code)
					language.locale.value = response?.data?.user?.language?.code
					if (response.data.user?.role === 'Citizen') {
						navigateTo('/citizen/overview')
					} else if (response.data.user?.role === 'Relative') {
						navigateTo('/relative/citizens')
					} else {
						navigateTo('/overview')
					}
				}
			}
		} catch (error: any) {
			state.error = error
		}
		state.isPageLoading = false
	}
}

function setLang(lang: string) {
	language.locale.value = lang
	userStore.setLanguage(lang)
	state.langOpen = false
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

async function navigateToSupport() {
	await navigateTo('https://citizenone.dk/support', {
		external: true,
		open: { target: '_blank' }
	})
}
</script>

<style scoped>
* { box-sizing: border-box; }

.fst-page { min-height: 100vh; display: flex; font-family: 'Inter', -apple-system, sans-serif; }

.fst-left {
	width: 460px; flex-shrink: 0;
	background: linear-gradient(160deg, #0f2b46 0%, #1a4a70 50%, #0a2840 100%);
	display: flex; flex-direction: column; justify-content: space-between;
	padding: 3rem; position: relative; overflow: hidden;
}
.fst-bc { position: absolute; border-radius: 50%; background: rgba(66,174,217,0.09); }
.fst-bc1 { width:400px;height:400px;top:-140px;right:-140px;animation:fbc1 16s ease-in-out infinite; }
.fst-bc2 { width:240px;height:240px;bottom:-90px;left:-80px;animation:fbc2 20s ease-in-out infinite; }
.fst-bc3 { width:140px;height:140px;bottom:100px;right:40px;animation:fbc3 12s ease-in-out infinite; }
@keyframes fbc1 { 0%,100%{transform:translate(0,0)} 40%{transform:translate(-20px,16px)} 70%{transform:translate(14px,-12px)} }
@keyframes fbc2 { 0%,100%{transform:translate(0,0)} 45%{transform:translate(22px,-18px)} 75%{transform:translate(-12px,12px)} }
@keyframes fbc3 { 0%,100%{transform:translate(0,0)} 35%{transform:translate(-16px,-20px)} 68%{transform:translate(18px,10px)} }

.fst-left-top { position:relative;z-index:2; }
.fst-left-logo { display:flex;align-items:center;gap:14px; }
.fst-logo-icon { position:relative;width:46px;height:46px;display:flex;align-items:center;justify-content:center; }
.fst-ring { position:absolute;border-radius:50%;border:1px solid rgba(66,174,217,0.35);animation:fringa 3s ease-in-out infinite; }
.fst-rg1 { width:46px;height:46px;animation-delay:0s; }
.fst-rg2 { width:68px;height:68px;animation-delay:0.8s; }
.fst-rg3 { width:90px;height:90px;animation-delay:1.5s; }
@keyframes fringa { 0%{opacity:0;transform:scale(0.8)} 40%{opacity:1} 100%{opacity:0;transform:scale(1.2)} }
.fst-oc { animation:foca 0.9s cubic-bezier(0.34,1.56,0.64,1) 0.3s both;transform-origin:19.49px 19.49px; }
.fst-ic { animation:fica 0.9s cubic-bezier(0.34,1.56,0.64,1) 0.65s both;transform-origin:19.43px 19.55px; }
@keyframes foca { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
@keyframes fica { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:0.9} }
.fst-logo-wordmark { font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.3px;opacity:0;animation:ffua 0.5s ease 1.2s forwards; }

.fst-left-mid { position:relative;z-index:2;opacity:0;animation:ffua 0.6s ease 1.4s forwards; }
@keyframes ffua { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
.fst-left-tag { font-size:10px;font-weight:700;color:rgba(66,174,217,0.85);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:1rem; }
.fst-left-h { font-size:32px;font-weight:700;color:#fff;line-height:1.2;letter-spacing:-0.8px;margin-bottom:0.75rem; }
.fst-left-p { font-size:13px;color:rgba(255,255,255,0.5);line-height:1.75;max-width:300px;margin-bottom:1.5rem; }
.fst-left-foot { position:relative;z-index:2;font-size:11px;color:rgba(255,255,255,0.2);display:flex;align-items:center;gap:6px; }

.fst-idx-live { margin-top:0; }
.fst-idx-live-hdr { display:flex;align-items:center;gap:8px;margin-bottom:0.75rem; }
.fst-idx-live-dot { width:7px;height:7px;border-radius:50%;background:rgb(66,174,217);animation:fpulsea 2s ease-in-out infinite; }
@keyframes fpulsea { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.75)} }
.fst-idx-live-lbl { font-size:10px;font-weight:700;color:rgba(66,174,217,0.8);letter-spacing:1px;text-transform:uppercase; }
.fst-idx-stats { display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px; }
.fst-idx-stat { background:rgba(66,174,217,0.08);border:1px solid rgba(66,174,217,0.15);border-radius:9px;padding:10px 12px; }
.fst-idx-stat-num { font-size:18px;font-weight:700;color:#fff;letter-spacing:-0.5px;line-height:1;margin-bottom:4px;font-variant-numeric:tabular-nums; }
.fst-idx-stat-lbl { font-size:9px;color:rgba(255,255,255,0.4);font-weight:500;line-height:1.3; }

.fst-right { flex:1;display:flex;align-items:center;justify-content:center;padding:3rem 2rem;position:relative;overflow:hidden;background:#edf5fb; }
.fst-right-bg { position:absolute;inset:0;pointer-events:none;z-index:0;overflow:hidden; }
.fst-rbc { position:absolute;border-radius:50%; }
.fst-rbc1 { width:600px;height:600px;top:-220px;right:-180px;background:radial-gradient(circle,rgba(66,174,217,0.25) 0%,rgba(66,174,217,0.08) 45%,transparent 70%);animation:frbc1 18s ease-in-out infinite; }
.fst-rbc2 { width:420px;height:420px;bottom:-150px;left:-120px;background:radial-gradient(circle,rgba(45,186,178,0.20) 0%,rgba(45,186,178,0.06) 45%,transparent 70%);animation:frbc2 22s ease-in-out infinite; }
.fst-rbc3 { width:280px;height:280px;top:38%;right:3%;background:radial-gradient(circle,rgba(66,174,217,0.18) 0%,rgba(66,174,217,0.05) 45%,transparent 70%);animation:frbc3 14s ease-in-out infinite; }
@keyframes frbc1 { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(-30px,20px) scale(1.05)} 70%{transform:translate(20px,-15px) scale(0.95)} }
@keyframes frbc2 { 0%,100%{transform:translate(0,0) scale(1)} 45%{transform:translate(25px,-20px) scale(1.08)} 75%{transform:translate(-15px,15px) scale(0.97)} }
@keyframes frbc3 { 0%,100%{transform:translate(0,0) scale(1)} 35%{transform:translate(-20px,-25px) scale(1.1)} 68%{transform:translate(22px,12px) scale(0.9)} }

.fst-form-card { position:relative;z-index:1;background:#f8fbfe;border-radius:20px;box-shadow:0 4px 24px rgba(15,43,70,0.06),0 1px 4px rgba(15,43,70,0.03);padding:2.5rem;width:100%;max-width:420px;border:1px solid rgba(66,174,217,0.18); }
.fst-form-title { font-size:26px;font-weight:700;color:#0f2b46;letter-spacing:-0.5px;margin-bottom:4px; }
.fst-form-sub { font-size:14px;color:#64748b;margin-bottom:1.75rem; }

.fst-field { margin-bottom:14px; }
.fst-field label { display:block;font-size:12px;font-weight:600;color:#1b6d8a;margin-bottom:6px; }
.fst-field input { width:100%;height:44px;padding:0 14px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;font-family:inherit;color:#1a2332;background:#f8fafc;outline:none;transition:border-color 0.15s; }
.fst-field input:focus { border-color:rgb(66,174,217);background:#fff;box-shadow:0 0 0 3px rgba(66,174,217,0.12); }
.fst-field input::placeholder { color:#b0bec5; }
.fst-pw-wrap { position:relative; }
.fst-pw-wrap input { padding-right:42px; }
.fst-pw-eye { position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#64748b;padding:4px;display:flex; }
.fst-pw-eye:hover { color:rgb(66,174,217); }

.fst-row-forgot { display:flex;align-items:center;justify-content:space-between;margin-bottom:20px; }
.fst-remember { display:flex;align-items:center;gap:7px;font-size:13px;color:#64748b;cursor:pointer; }
.fst-remember input { width:15px;height:15px;accent-color:rgb(66,174,217); }
.fst-forgot-link { font-size:13px;color:rgb(66,174,217);font-weight:500;cursor:pointer; }
.fst-forgot-link:hover { text-decoration:underline; }

.fst-btn-primary { width:100%;height:46px;background:rgb(66,174,217);color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:600;font-family:inherit;cursor:pointer;transition:background 0.15s;margin-bottom:16px; }
.fst-btn-primary:hover:not(:disabled) { background:#1b6d8a; }
.fst-btn-primary:disabled { opacity:0.65;cursor:not-allowed; }

.fst-or-row { display:flex;align-items:center;gap:12px;margin-bottom:14px; }
.fst-or-line { flex:1;height:1px;background:#e2e8f0; }
.fst-or-txt { font-size:11px;font-weight:600;color:#b0bec5;text-transform:uppercase;letter-spacing:0.8px;white-space:nowrap; }

.fst-alt-links { display:flex;flex-direction:column;align-items:center;gap:10px;margin-bottom:1.5rem; }
.fst-signup-row { font-size:13px;color:#64748b;text-align:center; }
.fst-signup-row a { color:#0f4c75;font-weight:600;text-decoration:none;cursor:pointer; }
.fst-signup-row a:hover { text-decoration:underline; }

.fst-iso-note { font-size:11px;color:#b0bec5;text-align:center;display:flex;align-items:center;justify-content:center;gap:6px; }

@media (max-width: 820px) { .fst-left { display:none; } }
</style>
