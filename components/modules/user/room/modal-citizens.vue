<template>
    <div>
        <Modal :show="props.isModalOpen" :title="props.selectedRoom?.name" size="sm" @close="closeModal">
            <template #modal-body>
                <div v-if="state.isLoading" class="space-y-3 py-2">
                    <div v-for="i in 4" :key="i" class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full bg-gray-200 animate-pulse shrink-0" />
                        <div class="h-3.5 bg-gray-200 rounded animate-pulse w-40" />
                    </div>
                </div>

                <div v-else class="space-y-4 pb-4">
                    <!-- Add citizen -->
                    <div class="space-y-2">
                        <FormLabel :label="$t('rooms.addCitizen')" />
                        <div class="flex items-center gap-2">
                            <div class="flex-1">
                                <FormSelectMultiple
                                    id="add-citizens"
                                    name="add-citizens"
                                    :options="addableCitizenOptions"
                                    v-model="state.citizensToAdd"
                                />
                            </div>
                            <FormButton buttonStyle="action"
                                :disabled="!state.citizensToAdd?.length || state.isSaving"
                                @click="addCitizens">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('rooms.addCitizen') }}
                            </FormButton>
                        </div>
                        <Alert type="danger" :text="state.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                    </div>

                    <div class="border-t border-gray-100" />

                    <!-- Citizens list -->
                    <div v-if="state.citizens?.length" class="space-y-1">
                        <div v-for="(citizen, ci) in state.citizens" :key="ci">
                            <!-- Inline remove confirmation -->
                            <div v-if="state.citizenToRemove?.uuid === citizen.uuid"
                                class="flex items-center gap-3 py-2 px-2 rounded-md bg-red-50 ring-1 ring-red-200">
                                <img
                                    :src="citizen?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${citizen?.firstname}+${citizen?.lastname}`"
                                    :alt="`${citizen?.firstname} ${citizen?.lastname}`"
                                    class="w-9 h-9 rounded-full object-cover shrink-0"
                                />
                                <span class="text-xs text-red-700 flex-1">
                                    {{ $t('rooms.removeConfirmation') }} <strong>{{ citizen?.firstname }} {{ citizen?.lastname }}</strong>?
                                </span>
                                <div class="flex items-center gap-1 shrink-0">
                                    <FormButton buttonStyle="danger" buttonSize="xs"
                                        :disabled="state.isSaving"
                                        @click.stop="confirmRemoveCitizen">
                                        {{ $t('confirm') }}
                                    </FormButton>
                                    <FormButton buttonStyle="cancel" buttonSize="xs"
                                        :disabled="state.isSaving"
                                        @click.stop="state.citizenToRemove = null">
                                        {{ $t('cancel') }}
                                    </FormButton>
                                </div>
                            </div>
                            <!-- Normal row -->
                            <div v-else class="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-gray-50 group">
                                <img
                                    :src="citizen?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${citizen?.firstname}+${citizen?.lastname}`"
                                    :alt="`${citizen?.firstname} ${citizen?.lastname}`"
                                    class="w-9 h-9 rounded-full object-cover shrink-0"
                                />
                                <span class="text-sm text-gray-800 flex-1">
                                    {{ citizen?.firstname }} {{ citizen?.lastname }}
                                </span>
                                <FormButton type="button" buttonStyle="danger" buttonSize="xs"
                                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                                    :disabled="state.isSaving"
                                    @click.stop="state.citizenToRemove = citizen">
                                    <Icon name="ph:trash" class="size-3.5" />
                                </FormButton>
                            </div>
                        </div>
                    </div>

                    <div v-else class="py-4 text-center text-sm text-gray-400">
                        {{ $t('rooms.noCitizens') }}
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { roomService } from '@/components/api/user/RoomService'
import { citizenService } from '@/components/api/user/CitizenService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedRoom: {
        type: Object,
        required: false,
        default: null,
    },
})

const emit = defineEmits(['close', 'refreshCitizens'])

const state = reactive({
    citizens: [] as any[],
    allCitizens: [] as any[],
    citizensToAdd: [] as string[],
    citizenToRemove: null as any,
    error: {} as Error,
    isLoading: false,
    isSaving: false,
})

const addableCitizenOptions = computed(() => {
    const existing = new Set(state.citizens.map((c: any) => c.uuid))
    return state.allCitizens
        .filter((c: any) => !existing.has(c.uuid))
        .map((c: any) => ({
            value: c.uuid,
            label: `${c.firstname} ${c.lastname ?? ''}`.trim(),
        }))
})

watch(() => props.isModalOpen, async (isOpen) => {
    if (isOpen && props.selectedRoom) {
        state.citizensToAdd = []
        state.citizenToRemove = null
        state.error = {}
        await Promise.all([fetchRoomCitizens(), fetchAllCitizens()])
    }
})

async function fetchRoomCitizens() {
    state.isLoading = true
    try {
        const details = await roomService.getRoom(props.selectedRoom.uuid)
        if (details) {
            state.citizens = details?.citizens ?? details?.data?.citizens ?? []
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function fetchAllCitizens() {
    try {
        const response = await citizenService.getAllCitizens({})
        if (response?.data) {
            state.allCitizens = response.data
        }
    } catch {
        // non-critical
    }
}

async function addCitizens() {
    if (!state.citizensToAdd?.length || !props.selectedRoom) return
    state.error = {}
    state.isSaving = true
    try {
        const response = await roomService.addCitizenToRoom(props.selectedRoom.uuid, state.citizensToAdd)
        if (response) {
            await fetchRoomCitizens()
            state.citizensToAdd = []
            emit('refreshCitizens', props.selectedRoom.uuid)
            successAlert(`${t('alert.success')}!`, `${t('rooms.citizenAddedSuccessfully')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

async function confirmRemoveCitizen() {
    if (!state.citizenToRemove || !props.selectedRoom) return
    state.error = {}
    state.isSaving = true
    try {
        const response = await roomService.removeCitizenFromRoom(props.selectedRoom.uuid, [state.citizenToRemove.uuid])
        if (response) {
            state.citizens = state.citizens.filter((c: any) => c.uuid !== state.citizenToRemove.uuid)
            state.citizenToRemove = null
            emit('refreshCitizens', props.selectedRoom.uuid)
            successAlert(`${t('alert.success')}!`, `${t('rooms.citizenRemovedSuccessfully')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

function closeModal() {
    state.citizenToRemove = null
    state.citizensToAdd = []
    state.error = {}
    emit('close')
}
</script>
