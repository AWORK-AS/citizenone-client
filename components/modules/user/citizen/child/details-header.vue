<template>
    <div>
        <LoadingSpinner :isActive="state.isPageLoading">
            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />
            <div class="grid grid-cols-12 gap-6 relative">
                <div
                    class="col-span-12 w-full bg-white ring-1 ring-gray-200 rounded-md p-5 border-l-4 border-secondary">
                    <div class="md:flex md:items-start md:gap-x-8">
                        <div class="flex justify-center flex-shrink-0">
                            <div class="relative">
                                <img :src="`https://ui-avatars.com/api/?background=42AED9&color=fff&name=${state.selectedChild?.data?.firstname + ' ' + state.selectedChild?.data?.lastname}`"
                                    class="rounded-full w-28 h-28 object-cover border-2" />
                                <span class="absolute inset-0 rounded-full shadow-inner" aria-hidden="true" />
                            </div>
                        </div>
                        <div class="w-full pt-1.5 space-y-3">
                            <div class="text-center md:text-left">
                                <div class="flex justify-between">
                                    <div>
                                        <div class="flex items-center gap-x-1">
                                            <h1 class="text-2xl font-bold text-gray-900 gr">
                                                {{ state.selectedChild?.data?.firstname }}
                                                {{ state.selectedChild?.data?.lastname }}
                                            </h1>
                                            <p class="text-sm">
                                                - {{ $t('children.childOf') }}
                                                <span class="text-secondary hover:text-secondary-800 cursor-pointer"
                                                    @click="navigateTo(`/citizens/${citizenUuid}/children`)">
                                                    {{ state.selectedChild?.data?.citizen?.firstname }}
                                                    {{ state.selectedChild?.data?.citizen?.lastname }}
                                                </span>
                                            </p>
                                            <!-- <Tooltip :text="$t('citizens.table.actions.edit')">
                                                <Icon name="ph:pencil-simple"
                                                    class="w-6 h-6 cursor-pointer text-primary"
                                                    @click="navigateTo(`/citizens/${state.selectedChild?.data?.uuid}/view-edit`)"
                                                    v-if="userStore.getUser?.roles?.[0]?.name === 'Admin'" />
                                            </Tooltip> -->
                                        </div>
                                        <p class="text-sm font-medium text-gray-700">
                                            {{ state.selectedChild?.data?.social_security_number }}
                                        </p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-x-1">
                                    <Tooltip :text="$t('citizens.address')" class="flex items-center">
                                        <Icon name="ph:map-pin" class="h-4 w-4" aria-hidden="true" />
                                    </Tooltip>
                                    <p class="text-sm font-medium text-gray-700">
                                        <span v-if="state.selectedChild?.data?.street">
                                            {{ state.selectedChild?.data?.street }},
                                        </span>
                                        <span v-if="state.selectedChild?.data?.region?.name">
                                            {{ state.selectedChild?.data?.region?.name }},
                                        </span>
                                        <span v-if="state.selectedChild?.data?.municipality">
                                            {{ state.selectedChild?.data?.municipality?.name }},
                                        </span>
                                        <span v-if="state.selectedChild?.data?.city">
                                            {{ state.selectedChild?.data?.city }},
                                        </span>
                                        <span v-if="state.selectedChild?.data?.post_code">
                                            {{ state.selectedChild?.data?.post_code }}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-5">
                                <div class="space-y-1">
                                    <div class="flex items-center gap-x-1">
                                        <Tooltip :text="$t('citizens.form.birthday')" class="flex items-center">
                                            <Icon name="ph:cake" class="h-4 w-4" aria-hidden="true" />
                                        </Tooltip>
                                        <p class="text-sm font-medium text-gray-700"
                                            v-if="state.selectedChild?.data?.birthday">
                                            {{ formatDateToReadable(state.selectedChild?.data?.birthday) }}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-x-1">
                                        <Tooltip :text="$t('citizens.form.emailAddress')" class="flex items-center">
                                            <Icon name="ph:envelope-open" class="h-4 w-4" aria-hidden="true" />
                                        </Tooltip>
                                        <p class="text-sm font-medium text-gray-700">
                                            {{ state.selectedChild?.data?.email }}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-x-1">
                                        <Tooltip :text="$t('citizens.form.phone')" class="flex items-center">
                                            <Icon name="ph:phone" class="h-4 w-4" aria-hidden="true" />
                                        </Tooltip>
                                        <p class="text-sm font-medium text-gray-700">
                                            {{ state.selectedChild?.data?.phone }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LoadingSpinner>
    </div>
</template>

<script setup lang="ts">
import { citizenChildService } from '@/components/api/user/CitizenChildService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const router = useRouter()
const { formatDateToReadable } = useDatetimeFormatter()
const userStore = useUserStore() as any
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const childUuid = router?.currentRoute?.value?.params?.child_uuid

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    selectedChild: {} as any,
})

onMounted(() => {
    fetchChild()
})

async function fetchChild() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await citizenChildService.getCitizenChild(childUuid)
        if (response) {
            state.selectedChild = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>