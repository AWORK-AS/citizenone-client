<template>

	<Head>
		<Title>{{ $t('login.login') }} - {{ runtimeConfig?.public?.appName }}</Title>
	</Head>

	<div class="page">

		<div class="left">
			<div class="bc bc1"></div>
			<div class="bc bc2"></div>
			<div class="bc bc3"></div>

			<div class="hidden"><span id="animatedAsset01"></span><span id="animatedAsset02"></span></div>
			<div class="left-top">
				<div class="left-logo">
					<div class="logo-icon">
						<div class="ring rg1"></div>
						<div class="ring rg2"></div>
						<div class="ring rg3"></div>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38.98 38.98" width="38" height="38"
							class="relative z-[2]">
							<circle class="oc" cx="19.49" cy="19.49" r="18.99" fill="#1a3a5c" stroke="rgb(66,174,217)"
								stroke-width="1" />
							<circle class="ic" cx="19.43" cy="19.55" r="11.93" fill="rgb(66,174,217)" stroke="#fff"
								stroke-width="0.5" />
						</svg>
					</div>
					<span class="logo-wordmark">CitizenOne<sup>™</sup></span>
				</div>
			</div>

			<div class="left-mid">
				<div class="left-tag">
					{{ $t('login.tagline') }}
				</div>
				<div class="left-h">
					{{ $t('login.headlineLine1') }}<br>{{ $t('login.headlineLine2') }}
				</div>
				<p class="left-p">
					{{ $t('login.description') }}
				</p>

				<div class="idx-live">
					<div class="idx-live-hdr">
						<div class="idx-live-dot"></div>
						<span class="idx-live-lbl">
							{{ $t('login.liveActivity') }}
						</span>
					</div>
					<div class="idx-stats">
						<div class="idx-stat">
							<div class="idx-stat-num" id="idx-users">—</div>
							<div class="idx-stat-lbl">
								{{ $t('login.activeUsers') }}
							</div>
						</div>
						<div class="idx-stat">
							<div class="idx-stat-num" id="idx-journals">—</div>
							<div class="idx-stat-lbl">
								{{ $t('login.journalNotesToday') }}
							</div>
						</div>
						<div class="idx-stat">
							<div class="idx-stat-num" id="idx-shifts">—</div>
							<div class="idx-stat-lbl">
								{{ $t('login.shiftsPlannedToday') }}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="left-foot">
				<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(240,250,249,0.3)"
					stroke-width="2" stroke-linecap="round">
					<rect x="3" y="11" width="18" height="11" rx="2" />
					<path d="M7 11V7a5 5 0 0110 0v4" />
				</svg>
				{{ $t('login.gdprNote') }}
			</div>
		</div>

		<div class="right">
			<div class="right-bg">
				<div class="rbc rbc1"></div>
				<div class="rbc rbc2"></div>
				<div class="rbc rbc3"></div>
			</div>

			<ModulesUserAuthenticationModalOtpVerification v-if="state.modal.isIpOtpOpen"
				:isModalOpen="state.modal.isIpOtpOpen" otpType="ip" :email="state.formLogin.email ?? ''"
				:deviceUuid="state.deviceUuid" @close="state.modal.isIpOtpOpen = false" />

			<ModulesUserAuthenticationModalOtpVerification v-if="state.modal.isDeviceOtpOpen"
				:isModalOpen="state.modal.isDeviceOtpOpen" otpType="device" :email="state.formLogin.email ?? ''"
				:deviceUuid="state.deviceUuid" @close="state.modal.isDeviceOtpOpen = false" />


			<form class="form-card" @submit.prevent="login">
				<Alert type="danger" :text="state?.error?.message"
					v-if="state.error?.message && state.error.message.length > 0" />
				<div class="flex items-center justify-between mb-1">
					<h1 class="form-title !mb-0">
						{{ $t('login.welcomeBack') }}
					</h1>
					<div class="relative" v-click-outside="() => state.langOpen = false">
						<button type="button" @click="state.langOpen = !state.langOpen"
							class="flex items-center gap-1.5 py-[5px] pr-[10px] pl-[6px] rounded-full border border-slate-200 bg-white cursor-pointer text-xs font-semibold text-slate-500 hover:border-slate-300 transition-colors">
							<img :src="identifyFlag()" alt="flag" class="w-5 h-5 rounded-full object-cover" />
							{{ { en: 'EN', dk: 'DK', no: 'NO', sv: 'SV' }[language.locale.value] ?? 'EN' }}
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
							<button type="button" @click="setLang('no')"
								:class="['flex items-center gap-2 w-full px-3.5 py-2.5 border-0 bg-transparent cursor-pointer text-[13px] font-medium text-[#1a2332] hover:bg-[#edf5fb] transition-colors', language.locale.value === 'no' && 'bg-[#edf5fb]']">
								<img src="/img/icons/flags/norway.svg" class="w-5 h-5 rounded-full object-cover" />
								Norsk
							</button>
							<button type="button" @click="setLang('sv')"
								:class="['flex items-center gap-2 w-full px-3.5 py-2.5 border-0 bg-transparent cursor-pointer text-[13px] font-medium text-[#1a2332] hover:bg-[#edf5fb] transition-colors', language.locale.value === 'sv' && 'bg-[#edf5fb]']">
								<img src="/img/icons/flags/sweden.svg" class="w-5 h-5 rounded-full object-cover" />
								Svenska
							</button>
						</div>
					</div>
				</div>
				<p class="form-sub">
					{{ $t('login.loginToContinueTo') }} CitizenOne.
				</p>

				<div class="field">
					<label for="co-email">
						{{ $t('login.form.emailAddress') }}
					</label>
					<input id="co-email" v-model="state.formLogin.email" type="text"
						:placeholder="$t('login.form.emailPlaceholder')" autocomplete="email" />
					<FormError :error="v$?.formLogin?.email?.$errors[0]?.$message.toString()" />
					<FormError :error="state?.error?.errors?.email?.[0]" />
				</div>

				<div class="field">
					<label for="co-pw">
						{{ $t('login.form.password') }}
					</label>
					<div class="pw-wrap">
						<input id="co-pw" v-model="state.formLogin.password"
							:type="state.showPassword ? 'text' : 'password'" placeholder="••••••••"
							autocomplete="current-password" />
						<button class="pw-eye" type="button" @click="state.showPassword = !state.showPassword">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
								stroke-width="2" stroke-linecap="round">
								<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
								<circle cx="12" cy="12" r="3" />
							</svg>
						</button>
						<FormError :error="v$?.formLogin?.password?.$errors[0]?.$message.toString()" />
						<FormError :error="state?.error?.errors?.password?.[0]" />
					</div>
				</div>

				<div class="row-forgot">
					<label class="remember">
						<input v-model="state.rememberMe" type="checkbox" />
						{{ $t('login.form.rememberMeFor14Days') }}
					</label>
					<a class="forgot-link" @click="navigateTo('/forgot-password')">
						{{ $t('login.form.forgotPassword') }}?
					</a>
				</div>

				<button class="btn-primary" type="submit" :disabled="state.isPageLoading">
					{{ state.isPageLoading ? $t('login.form.login') + '...' : $t('login.form.login') }}
				</button>

				<div class="or-row">
					<div class="or-line"></div><span class="or-txt">
						{{ $t('login.form.or') }}
					</span>
					<div class="or-line"></div>
				</div>

				<div class="alt-links">
					<!-- <div class="alt-row">
						<a class="alt-link" @click="loginWithMicrosoft">Microsoft</a>
						<div class="alt-dot"></div>
						<a class="alt-link" @click="loginWithGoogle">Google</a>
						<div class="alt-dot"></div>
						<a class="alt-link" @click="loginWithSSO">SSO</a>
					</div> -->
					<div class="signup-row">
						{{ $t('login.form.dontHaveAnAccount') }}?
						<a @click="navigateTo('/register')">
							{{ $t('login.form.createHere') }}</a> &nbsp;·&nbsp;
						<a href="https://citizenone.dk/support">
							{{ $t('login.form.help') }}
						</a>
					</div>
				</div>

				<div class="iso-note">
					<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
						stroke-linecap="round">
						<rect x="3" y="11" width="18" height="11" rx="2" />
						<path d="M7 11V7a5 5 0 0110 0v4" />
					</svg>
					{{ $t('login.isoNote') }}
				</div>
			</form>
		</div>
		<ModulesUserAuthenticationModal2fa :isModalOpen="state.modal.isGoogle2faVerificationOpen"
			:formLogin="state.formLogin" @close="state.modal.isGoogle2faVerificationOpen = false"
			v-if="state.modal.isGoogle2faVerificationOpen" />
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
	langOpen: false,
	deviceUuid: '' as string,
	error: {} as Error,
	formLogin: {
		email: null as any,
		password: null as any,
	},
	isPageLoading: false,
	modal: {
		isGoogle2faVerificationOpen: false,
		isIpOtpOpen: false,
		isDeviceOtpOpen: false,
	},
	rememberMe: false,
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

	const route = useRoute()
	const impersonateToken = route.query.impersonate_token as string
	if (impersonateToken) {
		const currentToken = localStorage.getItem('_token')
		if (currentToken) {
			localStorage.setItem('_original_token', currentToken)
		}
		localStorage.setItem('_token', impersonateToken)
		navigateTo('/overview')
		return
	}

	const rememberMe = localStorage.getItem("rememberMe")
	if (rememberMe) {
		navigateTo('/overview')
	}
	let deviceUuid = localStorage.getItem("device_uuid")
	if (!deviceUuid) {
		deviceUuid = crypto.randomUUID()
		localStorage.setItem("device_uuid", deviceUuid)
	}
	state.deviceUuid = deviceUuid
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

	const animatedAsset01 = document.getElementById('animatedAsset01')
	const animatedAsset02 = document.getElementById('animatedAsset02')
	if (animatedAsset01) observer.observe(animatedAsset01)
	if (animatedAsset02) observer.observe(animatedAsset02)
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
				if (state.rememberMe) {
					localStorage.setItem("rememberMe", state.rememberMe?.toString())
				} else {
					localStorage.removeItem("rememberMe")
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
	const flags: Record<string, string> = {
		en: '/img/icons/flags/united-kingdom.svg',
		dk: '/img/icons/flags/denmark.svg',
		no: '/img/icons/flags/norway.svg',
		sv: '/img/icons/flags/sweden.svg',
	}
	return flags[selectedLanguage] ?? '/img/icons/flags/united-kingdom.svg'
}

async function navigateToSupport() {
	await navigateTo('https://citizenone.dk/support', {
		external: true,
		open: {
			target: '_blank',
		}
	})
}

async function navigateToHomePage(link: any) {
	await navigateTo(link, {
		external: true
	})
}


// async function loginWithEmail() {
// 	if (!state.formLogin.email || !state.formLogin.password) { 
// 		state.error = 'Udfyld venligst e-mail og adgangskode.'; return }
// 	state.isPageLoading = true
// 	state.error = ''
// 	try {
// 		const r = await authService.login({ email: state.email, password: state.password })
// 		if (r?.data?.token) navigateTo('/dashboard')
// 	} catch (e: any) { state.error = e?.response?.data?.message ?? 'Forkert e-mail eller adgangskode.' }
// 	state.isPageLoading = false
// }

async function loginWithMicrosoft() {
	state.isPageLoading = true
	try {
		const response = await authService.microsoftLogin()
		if (response?.data?.url) {
			window.location.href = response.data.url
		}
	} catch (error: any) {
		// state.error = 'Microsoft login fejlede.'
		state.error = error
	}
	state.isPageLoading = false
}

async function loginWithGoogle() {
	state.isPageLoading = true
	try {
		const response = await authService.googleLogin()
		if (response?.data?.url) window.location.href = response.data.url
	} catch (error: any) {
		// state.error = 'Google login fejlede.'
		state.error = error
	}
	state.isPageLoading = false
}

async function loginWithSSO() {
	const email = prompt('Indtast din arbejds-email til SSO:')
	if (!email) return
	state.isPageLoading = true
	try {
		const response = await authService.ssoRedirect(state.formLogin.email)
		if (response?.data?.url) window.location.href = response.data.url
	} catch (error: any) {
		// state.error = 'SSO login fejlede.'
		state.error = error
	}
	state.isPageLoading = false
}

// Live stats
const idxFmt = (n: number) => Math.round(n).toLocaleString('da-DK')
const idxAnim = (id: string, target: number, dur: number) => {
	const el = document.getElementById(id)
	if (!el) return
	const start = performance.now()
	const step = (now: number) => {
		const p = Math.min((now - start) / dur, 1)
		const e = 1 - Math.pow(1 - p, 3)
		el.textContent = idxFmt(Math.round(e * target))
		if (p < 1) requestAnimationFrame(step)
	}
	requestAnimationFrame(step)
}
const idxNow = new Date()
const idxBase = new Date('2024-01-01')
const idxMonths = Math.max(1, (idxNow.getFullYear() - idxBase.getFullYear()) * 12 + (idxNow.getMonth() - idxBase.getMonth()))
const idxGf = idxMonths <= 12 ? Math.pow(1.08, idxMonths) : Math.pow(1.08, 12) * Math.pow(1.04, idxMonths - 12)
const idxSeed = idxNow.getDate() * 31 + idxNow.getMonth() * 7
const idxSr = (min: number, max: number, off: number) => {
	const x = Math.abs(Math.sin(idxSeed + off) * 99991)
	return Math.round(min + (x - Math.floor(x)) * (max - min))
}
const idxH = idxNow.getHours()
const idxWd = idxNow.getDay()
const idxIsWE = idxWd === 0 || idxWd === 6
const idxTMul = idxIsWE ? 0.6 : (idxH >= 7 && idxH <= 17 ? 1.0 : 0.35)
const idxJournalMax = Math.round(Math.min(idxGf * 5200, 17000))
const idxMinSinceMidnight = idxH * 60 + idxNow.getMinutes()
const idxJCurve = (() => {
	const m = idxMinSinceMidnight
	if (m < 360) return 18 + m * 0.04
	if (m < 420) return 32 + (m - 360) * 2.5
	if (m < 540) return 182 + (m - 420) * 28
	if (m < 720) return 3542 + (m - 540) * 42
	if (m < 1020) return 11102 + (m - 720) * 19
	if (m < 1380) return 16802 + (m - 1020) * 0.5
	return idxJournalMax - 30
})()
let idxUsers = Math.max(200, Math.min(999, Math.round(idxSr(750, 999, 1) * idxTMul)))
let idxJournals = Math.max(18, Math.min(idxJournalMax, Math.round(idxJCurve * (idxJournalMax / 17000))))
if (idxIsWE) idxJournals = Math.round(idxJournals * 0.45)
const idxJSkew = Math.round((idxSr(0, 100, 9) - 50) * 1.2)
idxJournals = Math.max(18, Math.min(idxJournalMax, idxJournals + idxJSkew))
if (idxJournals % 100 === 0) idxJournals += 43
if (idxJournals % 50 === 0) idxJournals += 17
let idxShifts = idxSr(300, 800, 3)
if (idxShifts % 100 === 0) idxShifts += 23
setTimeout(() => {
	idxAnim('idx-users', idxUsers, 1600)
	idxAnim('idx-journals', idxJournals, 2000)
	idxAnim('idx-shifts', idxShifts, 1800)
}, 800)
setInterval(() => {
	const el = document.getElementById('idx-users')
	if (!el) return
	const d = (Math.random() > 0.5 ? 1 : -1) * Math.ceil(Math.random() * 3)
	idxUsers = Math.max(Math.round(500 * idxTMul), Math.min(999, idxUsers + d))
	el.textContent = idxFmt(idxUsers)
}, 4000)
setInterval(() => {
	const el = document.getElementById('idx-journals')
	if (!el) return
	idxJournals = Math.min(idxJournalMax, idxJournals + Math.ceil(Math.random() * 2))
	el.textContent = idxFmt(idxJournals)
}, 7000)
setInterval(() => {
	const el = document.getElementById('idx-shifts')
	if (!el) return
	if (Math.random() > 0.65) {
		idxShifts = Math.min(800, idxShifts + 1)
		el.textContent = idxFmt(idxShifts)
	}
}, 11000)
</script>

<style>
* {
	box-sizing: border-box;
	margin: 0;
	padding: 0;
}

.page {
	min-height: 100vh;
	display: flex;
	font-family: 'Inter', -apple-system, sans-serif;
}

/* VENSTRE PANEL */
.left {
	width: 460px;
	flex-shrink: 0;
	background: linear-gradient(160deg, #0f2b46 0%, #1a4a70 50%, #0a2840 100%);
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	padding: 3rem;
	position: relative;
	overflow: hidden;
}

.bc {
	position: absolute;
	border-radius: 50%;
	background: rgba(66, 174, 217, 0.09);
}

.bc1 {
	width: 400px;
	height: 400px;
	top: -140px;
	right: -140px;
	animation: bc1a 16s ease-in-out infinite;
}

.bc2 {
	width: 240px;
	height: 240px;
	bottom: -90px;
	left: -80px;
	animation: bc2a 20s ease-in-out infinite;
}

.bc3 {
	width: 140px;
	height: 140px;
	bottom: 100px;
	right: 40px;
	animation: bc3a 12s ease-in-out infinite;
}

@keyframes bc1a {

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

@keyframes bc2a {

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

@keyframes bc3a {

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

.left-top {
	position: relative;
	z-index: 2;
}

.left-logo {
	display: flex;
	align-items: center;
	gap: 14px;
}

.logo-icon {
	position: relative;
	width: 46px;
	height: 46px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.ring {
	position: absolute;
	border-radius: 50%;
	border: 1px solid rgba(66, 174, 217, 0.35);
	animation: ringa 3s ease-in-out infinite;
}

.rg1 {
	width: 46px;
	height: 46px;
	animation-delay: 0s;
}

.rg2 {
	width: 68px;
	height: 68px;
	animation-delay: 0.8s;
}

.rg3 {
	width: 90px;
	height: 90px;
	animation-delay: 1.5s;
}

@keyframes ringa {
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


.oc {
	animation: oca 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
	transform-origin: 19.49px 19.49px;
}

.ic {
	animation: ica 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 0.65s both;
	transform-origin: 19.43px 19.55px;
}

@keyframes oca {
	from {
		transform: scale(0);
		opacity: 0
	}

	to {
		transform: scale(1);
		opacity: 1
	}
}

@keyframes ica {
	from {
		transform: scale(0);
		opacity: 0
	}

	to {
		transform: scale(1);
		opacity: 0.9
	}
}

.logo-wordmark {
	font-size: 20px;
	font-weight: 700;
	color: #fff;
	letter-spacing: -0.3px;
	opacity: 0;
	animation: fua 0.5s ease 1.2s forwards;
}

.logo-wordmark sup {
	font-size: 10px;
	vertical-align: super;
}

.left-mid {
	position: relative;
	z-index: 2;
	opacity: 0;
	animation: fua 0.6s ease 1.4s forwards;
}

@keyframes fua {
	from {
		opacity: 0;
		transform: translateY(12px)
	}

	to {
		opacity: 1;
		transform: translateY(0)
	}
}

.left-tag {
	font-size: 10px;
	font-weight: 700;
	color: rgba(66, 174, 217, 0.85);
	letter-spacing: 1.5px;
	text-transform: uppercase;
	margin-bottom: 1rem;
}

.left-h {
	font-size: 32px;
	font-weight: 700;
	color: #fff;
	line-height: 1.2;
	letter-spacing: -0.8px;
	margin-bottom: 0.75rem;
}

.left-p {
	font-size: 13px;
	color: rgba(255, 255, 255, 0.5);
	line-height: 1.75;
	max-width: 300px;
	margin-bottom: 1.5rem;
}

.left-foot {
	position: relative;
	z-index: 2;
	font-size: 11px;
	color: rgba(255, 255, 255, 0.2);
	display: flex;
	align-items: center;
	gap: 6px;
}

/* LIVE STATS */
.idx-live {
	margin-top: 0;
}

.idx-live-hdr {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 0.75rem;
}

.idx-live-dot {
	width: 7px;
	height: 7px;
	border-radius: 50%;
	background: rgb(66, 174, 217);
	animation: pulsea 2s ease-in-out infinite;
}

@keyframes pulsea {

	0%,
	100% {
		opacity: 1;
		transform: scale(1)
	}

	50% {
		opacity: 0.4;
		transform: scale(0.75)
	}
}

.idx-live-lbl {
	font-size: 10px;
	font-weight: 700;
	color: rgba(66, 174, 217, 0.8);
	letter-spacing: 1px;
	text-transform: uppercase;
}

.idx-stats {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	gap: 8px;
}

.idx-stat {
	background: rgba(66, 174, 217, 0.08);
	border: 1px solid rgba(66, 174, 217, 0.15);
	border-radius: 9px;
	padding: 10px 12px;
}

.idx-stat-num {
	font-size: 18px;
	font-weight: 700;
	color: #fff;
	letter-spacing: -0.5px;
	line-height: 1;
	margin-bottom: 4px;
	font-variant-numeric: tabular-nums;
}

.idx-stat-lbl {
	font-size: 9px;
	color: rgba(255, 255, 255, 0.4);
	font-weight: 500;
	line-height: 1.3;
}

/* HØJRE PANEL */
.right {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 3rem 2rem;
	position: relative;
	overflow: hidden;
	background: #edf5fb;
}

.right-bg {
	position: absolute;
	inset: 0;
	pointer-events: none;
	z-index: 0;
	overflow: hidden;
}

.rbc {
	position: absolute;
	border-radius: 50%;
}

.rbc1 {
	width: 600px;
	height: 600px;
	top: -220px;
	right: -180px;
	background: radial-gradient(circle, rgba(66, 174, 217, 0.25) 0%, rgba(66, 174, 217, 0.08) 45%, transparent 70%);
	animation: rbc1a 18s ease-in-out infinite;
}

.rbc2 {
	width: 420px;
	height: 420px;
	bottom: -150px;
	left: -120px;
	background: radial-gradient(circle, rgba(45, 186, 178, 0.20) 0%, rgba(45, 186, 178, 0.06) 45%, transparent 70%);
	animation: rbc2a 22s ease-in-out infinite;
}

.rbc3 {
	width: 280px;
	height: 280px;
	top: 38%;
	right: 3%;
	background: radial-gradient(circle, rgba(66, 174, 217, 0.18) 0%, rgba(66, 174, 217, 0.05) 45%, transparent 70%);
	animation: rbc3a 14s ease-in-out infinite;
}

@keyframes rbc1a {

	0%,
	100% {
		transform: translate(0, 0) scale(1)
	}

	40% {
		transform: translate(-30px, 20px) scale(1.05)
	}

	70% {
		transform: translate(20px, -15px) scale(0.95)
	}
}

@keyframes rbc2a {

	0%,
	100% {
		transform: translate(0, 0) scale(1)
	}

	45% {
		transform: translate(25px, -20px) scale(1.08)
	}

	75% {
		transform: translate(-15px, 15px) scale(0.97)
	}
}

@keyframes rbc3a {

	0%,
	100% {
		transform: translate(0, 0) scale(1)
	}

	35% {
		transform: translate(-20px, -25px) scale(1.1)
	}

	68% {
		transform: translate(22px, 12px) scale(0.9)
	}
}

/* FORM CARD */
.form-card {
	position: relative;
	z-index: 1;
	background: #f8fbfe;
	border-radius: 20px;
	box-shadow: 0 4px 24px rgba(15, 43, 70, 0.06), 0 1px 4px rgba(15, 43, 70, 0.03);
	padding: 2.5rem;
	width: 100%;
	max-width: 420px;
	border: 1px solid rgba(66, 174, 217, 0.18);
}

.form-title {
	font-size: 26px;
	font-weight: 700;
	color: #0f2b46;
	letter-spacing: -0.5px;
	margin-bottom: 4px;
}

.form-sub {
	font-size: 14px;
	color: #64748b;
	margin-bottom: 1.75rem;
}

.field {
	margin-bottom: 14px;
}

.field label {
	display: block;
	font-size: 12px;
	font-weight: 600;
	color: #1b6d8a;
	margin-bottom: 6px;
}

.field input {
	width: 100%;
	height: 44px;
	padding: 0 14px;
	border: 1.5px solid #e2e8f0;
	border-radius: 8px;
	font-size: 14px;
	font-family: inherit;
	color: #1a2332;
	background: #f8fafc;
	outline: none;
	transition: border-color 0.15s;
}

.field input:focus {
	border-color: rgb(66, 174, 217);
	background: #fff;
	box-shadow: 0 0 0 3px rgba(66, 174, 217, 0.12);
}

.field input::placeholder {
	color: #b0bec5;
}

.pw-wrap {
	position: relative;
}

.pw-wrap input {
	padding-right: 42px;
}

.pw-eye {
	position: absolute;
	right: 12px;
	top: 50%;
	transform: translateY(-50%);
	background: none;
	border: none;
	cursor: pointer;
	color: #64748b;
	padding: 4px;
	display: flex;
}

.pw-eye:hover {
	color: rgb(66, 174, 217);
}

.row-forgot {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20px;
}

.remember {
	display: flex;
	align-items: center;
	gap: 7px;
	font-size: 13px;
	color: #64748b;
	cursor: pointer;
}

.remember input {
	width: 15px;
	height: 15px;
	accent-color: rgb(66, 174, 217);
}

.forgot-link {
	font-size: 13px;
	color: rgb(66, 174, 217);
	font-weight: 500;
	cursor: pointer;
}

.forgot-link:hover {
	text-decoration: underline;
}

.btn-primary {
	width: 100%;
	height: 46px;
	background: rgb(66, 174, 217);
	color: #fff;
	border: none;
	border-radius: 8px;
	font-size: 15px;
	font-weight: 600;
	font-family: inherit;
	cursor: pointer;
	transition: background 0.15s;
	margin-bottom: 16px;
}

.btn-primary:hover:not(:disabled) {
	background: #1b6d8a;
}

.btn-primary:disabled {
	opacity: 0.65;
	cursor: not-allowed;
}

.error-msg {
	font-size: 13px;
	color: #dc2626;
	text-align: center;
	margin: -8px 0 12px;
}

.or-row {
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 14px;
}

.or-line {
	flex: 1;
	height: 1px;
	background: #e2e8f0;
}

.or-txt {
	font-size: 11px;
	font-weight: 600;
	color: #b0bec5;
	text-transform: uppercase;
	letter-spacing: 0.8px;
	white-space: nowrap;
}

.alt-links {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
	margin-bottom: 1.5rem;
}

.alt-row {
	display: flex;
	align-items: center;
	gap: 14px;
}

.alt-link {
	font-size: 13px;
	color: #64748b;
	text-decoration: none;
	cursor: pointer;
	font-weight: 500;
	transition: color 0.15s;
}

.alt-link:hover {
	color: rgb(66, 174, 217);
}

.alt-dot {
	width: 3px;
	height: 3px;
	border-radius: 50%;
	background: #e2e8f0;
}

.signup-row {
	font-size: 13px;
	color: #64748b;
	text-align: center;
}

.signup-row a {
	color: #0f4c75;
	font-weight: 600;
	text-decoration: none;
	cursor: pointer;
}

.signup-row a:hover {
	text-decoration: underline;
}

.iso-note {
	font-size: 11px;
	color: #b0bec5;
	text-align: center;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
}

@media (max-width: 820px) {
	.left {
		display: none;
	}
}
</style>
