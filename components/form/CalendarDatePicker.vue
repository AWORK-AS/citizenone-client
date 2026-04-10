<template>
    <flat-pickr ref="fpRef" v-model="state.dateValue" :config="state.datePickerConfig" :id="props.id" :name="props.name"
        :placeholder="props.placeholder"
        class="hidden appearance-none w-full px-3 py-2.5 border border-primary placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" />
</template>

<script setup lang="ts">
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'
import moment from 'moment'
import { useI18n } from "vue-i18n"
import { Danish } from 'flatpickr/dist/l10n/da.js'

const props = defineProps({
    id: String,
    name: { type: String, required: true },
    modelValue: String,
    placeholder: { type: String, required: true },
    availableDates: { type: Array, required: true },
})

const emit = defineEmits(['update:modelValue'])
const { locale } = useI18n()
const fpRef = ref(null)

const updateWkLabel = () => {
    nextTick(() => {
        const wk = document.querySelector('.flatpickr-weekwrapper .flatpickr-weekday')
        if (wk) wk.textContent = locale.value === 'dk' ? 'Uge' : 'Wk'
    })
}

const state = reactive({
    dateValue: props.modelValue ? new Date(props.modelValue) : '',
    datePickerConfig: {
        enable: props.availableDates as string[] || [],
        enableTime: false,
        dateFormat: 'd. F Y',
        disableMobile: true,
        inline: true,
        weekNumbers: true,
        locale: locale.value === 'dk'
            ? { ...Danish, firstDayOfWeek: 1, weekAbbreviation: 'Uge' }
            : { firstDayOfWeek: 1, weekAbbreviation: 'Uge' },
        onMonthChange: [(_:any,__:any,fp:any) => updateWkLabel()],
        onYearChange: [(_:any,__:any,fp:any) => updateWkLabel()],
    },
})

onMounted(() => {
    setTimeout(() => updateWkLabel(), 100)
    setTimeout(() => updateWkLabel(), 500)
})

watch(() => state.dateValue, (newValue) => {
    if (newValue) emit('update:modelValue', moment(newValue).format('YYYY-MM-DD'))
})

watch(() => locale.value, (lang) => {
    state.datePickerConfig.locale = lang === 'dk'
        ? { ...Danish, firstDayOfWeek: 1, weekAbbreviation: 'Uge' }
        : { firstDayOfWeek: 1, weekAbbreviation: 'Wk' }
    updateWkLabel()
})

watch(() => props.modelValue, (newValue) => {
    if (newValue && newValue !== moment(state.dateValue).format('YYYY-MM-DD')) {
        state.dateValue = new Date(newValue)
    }
})
</script>

<style>
.flatpickr-calendar {
    width: 100% !important;
    max-width: none !important;
    box-shadow: none;
    border: none;
}
.flatpickr-days,
.dayContainer {
    width: 100% !important;
    max-width: none !important;
    display: grid !important;
    grid-template-columns: repeat(7, 1fr) !important;
}
</style>
