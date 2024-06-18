<template>
    <div class="relative">
        <input type="date" :id="props.id" :name="props.name" :autocomplete="props.name"
            class="appearance-none block w-full px-3 py-2.5 border border-primary placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
            :placeholder="props.placeholder" :value="props.modelValue" @input="updateValue($event)" ref="dateInput"
            @click="openDateInput" />
        <div v-if="props.modelValue" class="absolute top-3 left-3 bg-white w-2/3" @click="openDateInput">{{
            formattedDate
        }}</div>
        <div v-else class="absolute top-3 left-3 bg-white w-2/3" @click="openDateInput">
            {{ $t('selectADate') }}
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    id: {
        type: String,
        required: false,
    },
    name: {
        type: String,
        required: true,
    },
    modelValue: String,
    placeholder: {
        type: String,
        required: true,
    },
})

const emit = defineEmits(['update:modelValue'])
const formattedDate = ref('')

const dateInput = ref(null)
function openDateInput() {
    dateInput.value.showPicker()
}

watch(() => props.modelValue, (newValue: any) => {
    if (newValue != null) {
        const date = new Date(newValue)
        const day = String(date.getDate()).padStart(2, '0')
        const month = date.toLocaleString('default', { month: 'long' })
        const year = date.getFullYear()
        formattedDate.value = `${day}, ${month} ${year}`
    }
})

function updateValue(event: any) {
    const date = new Date(event.target.value)
    const day = String(date.getDate()).padStart(2, '0')
    const month = date.toLocaleString('default', { month: 'long' })
    const year = date.getFullYear()
    formattedDate.value = `${day}, ${month} ${year}`
    emit('update:modelValue', event.target.value)
}
</script>