<template>
    <div class="mt-10 max-w-4xl mx-auto p-10 bg-white shadow-md rounded-md">
        <h2 class="text-2xl font-semibold mb-4">Form Builder</h2>

        <!-- Add New Field Form -->
        <div class="mb-6">
            <h3 class="text-lg font-semibold mb-2">Add a Field</h3>
            <div class="grid grid-cols-1 gap-4">
                <input v-model="newField.label" type="text" placeholder="Field Label" class="input" />
                <select v-model="newField.type" class="input">
                    <option value="input">Text Input</option>
                    <option value="textarea">Textarea</option>
                    <option value="select">Select Dropdown</option>
                </select>
                <button @click="addField" class="btn">Add Field</button>
            </div>
        </div>

        <!-- Display Form Fields -->
        <div v-for="(field, index) in fields" :key="index" class="mb-4 border-b pb-4">
            <h4 class="text-lg font-semibold">{{ field.label }}</h4>
            <p>Type: {{ field.type }}</p>
            <button @click="removeField(index)" class="text-red-500 mt-2">Remove Field</button>
        </div>

        <!-- Render the Form -->
        <h2 class="text-2xl font-semibold mt-8 mb-4">Generated Form</h2>
        <form @submit.prevent="submitForm">
            <div v-for="(field, index) in fields" :key="index" class="mb-4">
                <label :for="field.label" class="block text-sm font-medium">{{ field.label }}</label>
                <component :is="getComponent(field)" v-model="responses[field.label]"
                    :type="field.type === 'input' ? 'text' : undefined" class="input" :options="field.options || []" />
            </div>
            <button type="submit" class="btn mt-4">Submit</button>
        </form>

        <pre class="mt-6 p-4 bg-gray-100 rounded">{{ responses }}</pre>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

type FieldType = 'input' | 'textarea' | 'select'

interface Field {
    label: string
    type: FieldType
    options?: string[]
}

const fields = ref<Field[]>([])
const responses = reactive<Record<string, any>>({})
const newField = reactive<Field>({ label: '', type: 'input', options: [] })

const addField = () => {
    if (!newField.label) return alert('Field label is required')
    fields.value.push({ ...newField })
    responses[newField.label] = ''
    newField.label = ''
}

const removeField = (index: number) => {
    const field = fields.value[index]
    delete responses[field.label]
    fields.value.splice(index, 1)
}

const submitForm = () => {
    console.log('Form submitted:', responses)
    alert('Form submitted! Check the console for data.')
}

const getComponent = (field: Field) => {
    if (field.type === 'select') return 'select'
    if (field.type === 'textarea') return 'textarea'
    return 'input'
}
</script>

<style scoped>
.input {
    display: block;
    width: 100%;
    padding: 8px;
    margin-top: 4px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.btn {
    display: inline-block;
    padding: 8px 16px;
    background-color: #4f46e5;
    color: white;
    border-radius: 4px;
    cursor: pointer;
    text-align: center;
}

.btn:hover {
    background-color: #3730a3;
}
</style>