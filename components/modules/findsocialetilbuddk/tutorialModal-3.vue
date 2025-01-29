<template>
	<div class="custom-body">
		<!-- Pass the flag prop to the Modal -->
		<Modal size="xl" :title="modalTitle" :show="props.isModalThreeOpen" class="custom-modal" :flag="4"
			@close="handleClose">
			<template #modal-body>
				<p class="text-base text-gray-700 mb-4">
					<span v-if="language.locale.value === 'en'">
						Some of the key features include:
					</span>
					<span v-if="language.locale.value === 'dk'">
						Nogle af de vigtigste funktioner inkluderer:
					</span>
				</p>
				<ul class="list-none text-gray-600 text-base space-y-3 mb-4">
					<li>
						<span v-if="language.locale.value === 'en'">
							📄 Journalizing: Easy and clear documentation, FMK, financial managemen
						</span>
						<span v-if="language.locale.value === 'dk'">
							📄 Journalisering: Nem og overskuelig dokumentation, FMK, økonomistyring
						</span>
					</li>
					<li>
						<span v-if="language.locale.value === 'en'">
							👥 Employee management: Shift scheduling, time tracking, calendar, etc.
						</span>
						<span v-if="language.locale.value === 'dk'">
							👥 Medarbejderstyring: Vagtplanlægning, tidsregistrering, kalender m.m.
						</span>
					</li>
					<li>
						<span v-if="language.locale.value === 'en'">
							📧 Communication tools: Internal chat for employees and citizens.
						</span>
						<span v-if="language.locale.value === 'dk'">
							📧 Kommunikationsværktøjer: Intern chat medarbejder og borger
						</span>
					</li>
					<li>
						<span v-if="language.locale.value === 'en'">
							🕒 Shift scheduling: Simple and flexible scheduling of shifts.
						</span>
						<span v-if="language.locale.value === 'dk'">
							🕒 Vagtplanlægning: Enkel og fleksibel planlægning af vagter
						</span>
					</li>
					<li>
						<span v-if="language.locale.value === 'en'">
							📱 iOS and Android apps: Work easily on the go with full access to the system directly from
							your smartphone.
						</span>
						<span v-if="language.locale.value === 'dk'">
							📱 iOS- og Android-apps: Arbejd nemt på farten med fuld adgang til systemet direkte fra din
							smartphone
						</span>
					</li>
				</ul>
				<p class="text-base text-gray-700 mb-6">
					<span v-if="language.locale.value === 'en'">
						Would you like a free walkthrough of the system and all its features?
						<a href="https://citizenone.dk/book-gratis-demo-af-journalsystemet" target="_blank"
							class="text-blue-500 underline hover:text-blue-700">
							Book a demo here
						</a>
						and see how CitizenOne can make a difference for you and your organization.
					</span>
					<span v-if="language.locale.value === 'dk'">
						<p class="text-base text-gray-700 mb-6">
							<span class="font-bold">
								<a href="https://citizenone.dk/book-gratis-demo-af-journalsystemet" target="_blank"
									class="text-blue-500 underline hover:text-blue-700">
									Book en gratis demo nu
								</a>
							</span>
							og få 10 % hvis du gerne vil i gang. Denne rabatkode: FSTKUNDECO2025
							er gældende fra dags dato og 14 dage frem!
						</p>
					</span>

				</p>


				<div class="flex justify-end">
					<button v-if="language.locale.value === 'en'" @click="doneAndClose"
						class="px-6 py-2 bg-tertiary text-white rounded-md text-lg">
						Done
					</button>
					<button v-if="language.locale.value === 'dk'" @click="doneAndClose"
						class="px-6 py-2 bg-tertiary text-white rounded-md text-lg">
						Færdig
					</button>
				</div>
			</template>
		</Modal>
	</div>
</template>

<script setup>
import { useI18n } from "vue-i18n"

const language = useI18n()
const modalTitle = computed(() => {
	return language.locale.value === 'en'
		? 'CitizenOne - all in one journal system'
		: 'CitizenOne - alt i ét journalsystem'
})

const props = defineProps({
	isModalThreeOpen: {
		type: Boolean,
		required: true,
	},
})

const emit = defineEmits(['close'])

const handleClose = () => {
	emit('close')
}

const doneAndClose = () => {
	window.scrollTo({
		top: 0,
		behavior: 'smooth',
	})
	emit('close')
}
</script>
