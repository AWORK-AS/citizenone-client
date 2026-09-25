<template>
    <div>
        <Modal size="sm" :title="$t('dutySchedules.favorites.manageFavorites')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <FormTextField v-model="state.search" :placeholder="$t('search')" />
                <div class="mt-3 max-h-96 overflow-y-auto divide-y divide-gray-100">
                    <div v-for="employee in filteredFavorites" :key="employee.uuid"
                        class="flex items-center justify-between py-2">
                        <div class="flex items-center gap-2 min-w-0">
                            <img :src="employee?.profile_image ?? avatarUrl(`${employee?.firstname + ' ' + (employee?.lastname ?? '')}`)"
                                class="h-8 w-8 flex-shrink-0 rounded-full bg-gray-50 object-cover" />
                            <span class="text-sm truncate">{{ employee?.firstname }} {{ employee?.lastname }}</span>
                        </div>
                        <button class="flex-shrink-0 text-gray-400 hover:text-red-500"
                            @click="removeFavorite(employee.uuid)">
                            <Icon name="mdi:star-off" class="h-4 w-4" />
                        </button>
                    </div>
                    <p v-if="!state.isPageLoading && filteredFavorites.length === 0"
                        class="text-xs text-gray-400 text-center py-6">
                        {{ $t('dutySchedules.favorites.noFavoritesYet') }}
                    </p>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { userService } from '@/components/api/user/UserService'
import { dutyScheduleFavoriteEmployeeService } from '@/components/api/user/DutyScheduleFavoriteEmployeeService'
import { useFavoriteEmployees } from '@/composables/useFavoriteEmployees'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshDutySchedules'])
const favoriteEmployees = useFavoriteEmployees()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    search: '',
    allEmployees: [] as any[],
})

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        state.search = ''
        fetchAllEmployees()
    }
})

const favoritedEmployees = computed(() =>
    state.allEmployees.filter((employee: any) => favoriteEmployees.isFavorited(employee.uuid))
)

const filteredFavorites = computed(() =>
    favoritedEmployees.value.filter((employee: any) =>
        `${employee?.firstname ?? ''} ${employee?.lastname ?? ''}`.toLowerCase().includes(state.search.toLowerCase())
    )
)

function closeModal() {
    emit('close')
}

async function fetchAllEmployees() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {}
        const response = await userService.getAllUsers(params)
        state.allEmployees = response?.data ?? []
        await favoriteEmployees.ensureLoaded()
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function removeFavorite(employeeUuid: string) {
    state.error = {}
    try {
        await dutyScheduleFavoriteEmployeeService.removeFavoriteEmployee(employeeUuid)
        favoriteEmployees.remove(employeeUuid)
        emit('refreshDutySchedules')
    } catch (error: any) {
        state.error = error
    }
}
</script>
