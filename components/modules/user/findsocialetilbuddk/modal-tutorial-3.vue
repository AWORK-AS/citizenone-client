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
					<span v-if="language.locale.value === 'no'">
						Noen av de viktigste funksjonene inkluderer:
					</span>
					<span v-if="language.locale.value === 'sv'">
						Några av de viktigaste funktionerna inkluderar:
					</span>
				</p>
				<ul class="list-none text-gray-600 text-base space-y-3 mb-4">
					<li>
						<span v-if="language.locale.value === 'en'">
							<strong>📄 Journalizing:</strong> Easy and clear documentation, FMK, financial managemen
						</span>
						<span v-if="language.locale.value === 'dk'">
							<strong>📄 Journalisering:</strong> Nem og overskuelig dokumentation, FMK, økonomistyring
						</span>
						<span v-if="language.locale.value === 'no'">
							<strong>📄 Journalføring:</strong> Enkel og oversiktlig dokumentasjon, FMK, økonomistyring
						</span>
						<span v-if="language.locale.value === 'sv'">
							<strong>📄 Journalföring:</strong> Enkel och tydlig dokumentation, FMK, ekonomihantering
						</span>
					</li>
					<li>
						<span v-if="language.locale.value === 'en'">
							<strong>👥 Employee management:</strong> Shift scheduling, time tracking, calendar, etc.
						</span>
						<span v-if="language.locale.value === 'dk'">
							<strong>👥 Medarbejderstyring:</strong> Vagtplanlægning, tidsregistrering, kalender m.m.
						</span>
						<span v-if="language.locale.value === 'no'">
							<strong>👥 Ansattstyring:</strong> Vaktplanlegging, tidsregistrering, kalender m.m.
						</span>
						<span v-if="language.locale.value === 'sv'">
							<strong>👥 Personalhantering:</strong> Schemaläggning, tidsregistrering, kalender m.m.
						</span>
					</li>
					<li>
						<span v-if="language.locale.value === 'en'">
							<strong>📧 Communication tools:</strong> Internal chat for employees and citizens.
						</span>
						<span v-if="language.locale.value === 'dk'">
							<strong>📧 Kommunikationsværktøjer:</strong> Intern chat medarbejder og borger
						</span>
						<span v-if="language.locale.value === 'no'">
							<strong>📧 Kommunikasjonsverktøy:</strong> Intern chat for ansatte og borgere
						</span>
						<span v-if="language.locale.value === 'sv'">
							<strong>📧 Kommunikationsverktyg:</strong> Intern chatt för anställda och medborgare
						</span>
					</li>
					<li>
						<span v-if="language.locale.value === 'en'">
							<strong>🕒 Shift scheduling:</strong> Simple and flexible scheduling of shifts.
						</span>
						<span v-if="language.locale.value === 'dk'">
							<strong>🕒 Vagtplanlægning:</strong> Enkel og fleksibel planlægning af vagter
						</span>
						<span v-if="language.locale.value === 'no'">
							<strong>🕒 Vaktplanlegging:</strong> Enkel og fleksibel planlegging av vakter
						</span>
						<span v-if="language.locale.value === 'sv'">
							<strong>🕒 Schemaläggning:</strong> Enkel och flexibel planering av skift
						</span>
					</li>
					<li>
						<span v-if="language.locale.value === 'en'">
							<strong>📱 iOS and Android apps:</strong> Work easily on the go with full access to the
							system directly from
							your smartphone.
						</span>
						<span v-if="language.locale.value === 'dk'">
							<strong>📱 iOS- og Android-apps:</strong> Arbejd nemt på farten med fuld adgang til systemet
							direkte fra din
							smartphone
						</span>
						<span v-if="language.locale.value === 'no'">
							<strong>📱 iOS- og Android-apper:</strong> Jobb enkelt på farten med full tilgang til
							systemet
							direkte fra
							smarttelefonen din
						</span>
						<span v-if="language.locale.value === 'sv'">
							<strong>📱 iOS- och Android-appar:</strong> Arbeta enkelt på språng med full åtkomst till
							systemet
							direkt från
							din smartphone
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
					<span v-if="language.locale.value === 'no'">
						<p class="text-base text-gray-700 mb-6">
							<span class="font-bold">
								<a href="https://citizenone.dk/book-gratis-demo-af-journalsystemet" target="_blank"
									class="text-blue-500 underline hover:text-blue-700">
									Book en gratis demo nå
								</a>
							</span>
							og få 10 % rabatt hvis du vil komme i gang. Rabattkoden: FSTKUNDECO2025
							er gyldig fra dags dato og 14 dager fremover!
						</p>
					</span>
					<span v-if="language.locale.value === 'sv'">
						<p class="text-base text-gray-700 mb-6">
							<span class="font-bold">
								<a href="https://citizenone.dk/book-gratis-demo-af-journalsystemet" target="_blank"
									class="text-blue-500 underline hover:text-blue-700">
									Boka en gratis demo nu
								</a>
							</span>
							och få 10 % om du vill komma igång. Rabattkoden: FSTKUNDECO2025
							gäller från och med idag och 14 dagar framåt!
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
					<button v-if="language.locale.value === 'no'" @click="doneAndClose"
						class="px-6 py-2 bg-tertiary text-white rounded-md text-lg">
						Ferdig
					</button>
					<button v-if="language.locale.value === 'sv'" @click="doneAndClose"
						class="px-6 py-2 bg-tertiary text-white rounded-md text-lg">
						Klar
					</button>
				</div>
			</template>
		</Modal>
	</div>
</template>

<script setup>
import { useI18n } from "vue-i18n"

const props = defineProps({
	isModalThreeOpen: {
		type: Boolean,
		required: true,
	},
})

const language = useI18n()
const modalTitle = computed(() => {
	if (language.locale.value === 'en') return 'CitizenOne - all in one journal system'
	if (language.locale.value === 'no') return 'CitizenOne - alt i ett journalsystem'
	if (language.locale.value === 'sv') return 'CitizenOne - allt i ett journalsystem'
	return 'CitizenOne - alt i ét journalsystem'
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
