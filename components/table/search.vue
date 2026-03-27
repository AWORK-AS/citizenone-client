<template>
    <form class="flex" @submit.prevent="handleSearch" autocomplete="off">
        <div class="grow relative">
            <span class="flex items-center gap-x-1 text-gray-800 absolute left-3 top-3">
                <Icon name="ic:search" class="text-primary w-6 h-6" />
            </span>
            <input type="text" :id="props.id" :name="props.name" autocomplete="off"
                class="appearance-none block w-full pl-10 h-12 border border-primary placeholder-gray-500 text-gray-900 rounded-tl-md rounded-bl-md focus:outline-none focus:ring-primary-700 focus:border-primary-700 focus:z-10 sm:text-sm"
                :placeholder="$t('search')" v-model="state.search" @input="onInput" @focus="onFocus" @blur="hideSuggestions" />

        </div>
        <button type="submit"
            class="bg-primary px-6 py-1.5 border border-primary text-white hover:bg-primary-800 hover:border-primary-800 right-0.5 top-0.5 rounded-tr-md rounded-br-md text-xs">
            {{ $t('search') }}
        </button>
    </form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import OneDriveService from '@/components/api/oneDrive/OneDriveService'
const oneDriveService = new OneDriveService()
const loadingSuggestions = ref(false)

function onFocus() {
    showSuggestions.value = true;
}

const props = defineProps({
    id: {
        type: String,
        required: false,
    },
    name: {
        type: String,
        required: false,
        default: 'search'
    },
    placeholder: {
        type: String,
        required: false,
    },
    isOneDrive: {
        type: Boolean,
        required: false,
        default: false
    }
})

const emit = defineEmits(['search'])

const state = reactive({
    search: '',
})
const suggestions = ref<any[]>([])
const suggestionMap = ref<Record<string, any>>({})
const showSuggestions = ref(false)

const userId = localStorage.getItem('user_id') || ''
let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function onInput() {
    const val = state.search.trim()

    if (val.length === 0) {
        suggestions.value = []
        showSuggestions.value = false
        loadingSuggestions.value = false
        return
    }

    // Minimum 2 tegn før søgning startes
    if (val.length < 2) return

    // Debounce - vent 400ms efter sidste tastetryk
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
        if (props.isOneDrive) {
            showSuggestions.value = true
            loadingSuggestions.value = true
            try {
                const results = await oneDriveService.searchAllOneDrive(val, userId)
                const items = Array.isArray(results?.value) ? results.value : []
                let suggestionsList = items
                    .filter((item: Record<string, any>) => item?.id && (item?.folder || item?.file))
                    .map((item: Record<string, any>) => {
                        if (item.folder) {
                            return { ...item, type: 'folder', is_onedrive: true, uuid: item.id }
                        } else {
                            return { ...item, type: 'file', is_onedrive: true, uuid: item.id, file_url: item.webUrl || item['@microsoft.graph.downloadUrl'] || null }
                        }
                    })

                if (typeof window !== 'undefined') {
                    const urlParams = new URLSearchParams(window.location.search)
                    const currentFolderId = urlParams.get('onedrive_folder_id')
                    const currentFolderName = document.querySelector('.table-responsive .table-responsive + div .text-tertiary')?.textContent?.trim() || ''
                    if (currentFolderId && currentFolderName && currentFolderName.toLowerCase().includes(val.toLowerCase()) && !suggestionsList.some((f: any) => f.uuid === currentFolderId)) {
                        suggestionsList = [
                            { id: currentFolderId, uuid: currentFolderId, name: currentFolderName, type: 'folder', is_onedrive: true },
                            ...suggestionsList
                        ]
                    }
                }
                suggestions.value = suggestionsList.slice(0, 8)
            } catch (e) {
                suggestions.value = []
            } finally {
                loadingSuggestions.value = false
            }
        } else {
            suggestionMap.value = {}
            suggestions.value = []
            emit('search', val)
        }
    }, 400)
}

function selectSuggestion(suggestion: any) {
    state.search = ''
    showSuggestions.value = false
    emit('search', suggestion)
}

function hideSuggestions() {
    setTimeout(() => { showSuggestions.value = false }, 100)
}

function handleSearch() {
    if (debounceTimer) clearTimeout(debounceTimer)
    emit('search', state.search.trim())
    showSuggestions.value = false
}
</script>
