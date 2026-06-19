<template>
    <div class="relative">
        <input :type="state.showPassword ? 'text' : 'password'" :id="props.id" :name="props.name"
            :autocomplete="props.name"
            class="appearance-none block w-full pl-4 pr-8 py-2.5 border border-gray-200 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-700 focus:border-primary-700 focus:z-10 sm:text-sm"
            :placeholder="props.placeholder" :value="props.modelValue" @input="updateValue($event)" />
        <Icon name="ph:eye-slash" class="h-4 w-4 cursor-pointer absolute top-3.5 right-3" aria-hidden="true"
            v-if="state.showPassword" @click="state.showPassword = !state.showPassword" />
        <Icon name="ph:eye" class="h-4 w-4 cursor-pointer absolute top-3.5 right-3" aria-hidden="true" v-else
            @click="state.showPassword = !state.showPassword" />
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

const state = reactive({
    showPassword: false,
})

function updateValue(event: any) {
    emit('update:modelValue', event.target.value)
}
</script>