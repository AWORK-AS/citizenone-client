<template>
    <div>
        <Modal size="4xl" :title="$t('plansandgoals.notifications.notifications')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div>
                    <div class="flex justify-end items-center mb-5">
                        <FormButton buttonStyle="action" class="rounded-lg"
                            @click="state.modal.isAddNotificationOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('plansandgoals.notifications.newNotification') }}
                        </FormButton>
                    </div>
                    <div class="space-y-5">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <TableSearch @search="handleSearch" />
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.notifications"
                                :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                                <template #body
                                    v-if="!(state.isTableLoading || (state.notifications?.data?.length === 0))">
                                    <tr v-for="(notification, index) in state.notifications?.data" :key="index">
                                        <td width="25%">
                                            <p>
                                                {{ formatDateTimeToReadable(notification.date_time) }}
                                            </p>
                                            <Badge type="primary" class="w-fit text-xxs space-y-1"
                                                v-if="notification?.is_recurring">
                                                <div class="flex items-center flex-wrap gap-x-0.5">
                                                    <p>
                                                        {{
                                                            $t('recurring.recurring')
                                                        }}
                                                    </p>
                                                    <div class="lowercase">
                                                        <p v-if="notification?.recurring === 'everyday'">
                                                            {{
                                                                $t('recurring.everyDay')
                                                            }}
                                                        </p>

                                                        <p v-if="notification?.recurring === 'every_week'">
                                                            {{
                                                                $t('recurring.everyWeek')
                                                            }}
                                                        </p>

                                                        <p v-if="notification?.recurring === 'every_second_week'">
                                                            {{
                                                                $t('recurring.everySecondWeek')
                                                            }}
                                                        </p>

                                                        <p v-if="notification?.recurring === 'every_third_week'">
                                                            {{
                                                                $t('recurring.everyThirdWeek')
                                                            }}
                                                        </p>

                                                        <p v-if="notification?.recurring === 'every_fourth_week'">
                                                            {{
                                                                $t('recurring.everyFourthWeek')
                                                            }}
                                                        </p>

                                                        <p v-if="notification?.recurring === 'every_month'">
                                                            {{
                                                                $t('recurring.everyMonth')
                                                            }}
                                                        </p>

                                                    </div>
                                                </div>
                                            </Badge>
                                            <Badge type="primary" class="w-fit text-xxs space-y-1"
                                                v-if="notification?.is_recurring">
                                                <div class="flex items-center flex-wrap gap-x-0.5">

                                                    <p class="lowercase">
                                                        {{ $t('recurring.until') }}
                                                    </p>
                                                    <p>
                                                        {{ formatDateToReadable(notification?.recurring_until) }}
                                                    </p>
                                                </div>
                                            </Badge>
                                        </td>
                                        <td width="30%">
                                            <p v-for="(notificationUser, index) in notification?.notification_users"
                                                :key="index">
                                                {{ notificationUser?.user?.firstname }} {{
                                                    notificationUser?.user?.lastname }}
                                            </p>
                                        </td>
                                        <td width="35%">
                                            <div v-html="notification?.note" class="content table-responsive" />
                                        </td>
                                        <td width="10%">
                                            <div class="flex items-end gap-2">
                                                <FormButton class="rounded-md" buttonSize="sm"
                                                    @click="editNotification(notification)">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                    {{ $t('plansandgoals.notifications.table.actions.edit') }}
                                                </FormButton>
                                                <FormButton class="rounded-md" buttonSize="sm"
                                                    @click="confirmNotificationDeletion(notification)">
                                                    <Icon name="heroicons:trash" class="size-4" />
                                                    {{ $t('plansandgoals.notifications.table.actions.delete') }}
                                                </FormButton>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.notifications" @previous="previous" @next="next" />
                    </div>
                </div>
                <ModulesUserCitizenPlanNotificationModalNew :isModalOpen="state.modal.isAddNotificationOpen"
                    :selectedData="props.selectedData" :selectedNotification="state.selectedNotification"
                    @close="state.modal.isAddNotificationOpen = false" @refreshNotifications="fetchNotifications" />
                <ModulesUserCitizenPlanNotificationModalEdit :isModalOpen="state.modal.isEditNotificationOpen"
                    :selectedNotification="state.selectedNotification"
                    @close="state.modal.isEditNotificationOpen = false" @refreshNotifications="fetchNotifications" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteNotificationOpen"
                    :message="`${$t('plansandgoals.notifications.table.confirmation.deleteNotificationConfirmation')}?`"
                    @close="state.modal.isDeleteNotificationOpen = false" @confirm="deleteNotification" />
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { planGoalSubgoalNotificationService } from '@/components/api/user/PlanGoalSubgoalNotificationService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { formatDateTimeToReadable, formatDateToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedData: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['close'])

const state = reactive({
    columnHeaders: [
        { name: 'plansandgoals.notifications.table.dateTime', isTranslateName: true, sorter: true, key: 'created_at' },
        { name: 'plansandgoals.notifications.table.users', isTranslateName: true, },
        { name: 'plansandgoals.notifications.table.note', isTranslateName: true, },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isAddNotificationOpen: false,
        isDeleteNotificationOpen: false,
        isEditNotificationOpen: false,
    },
    selectedNotification: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
    notifications: [] as any
})

function closeModal() {
    emit('close')
}

watch(() => props.isModalOpen, (newValue: any) => {
    if (newValue) {
        fetchNotifications()
    }
})


async function fetchNotifications() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            plan_goal_subgoal_uuid: props.selectedData?.uuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await planGoalSubgoalNotificationService.getNotifications(params)
        if (response) {
            state.notifications = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchNotifications()
}

function next() {
    currentTablePage++
    fetchNotifications()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchNotifications()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchNotifications()
}

function editNotification(notification: any) {
    state.selectedNotification = notification
    state.modal.isEditNotificationOpen = true
}

function confirmNotificationDeletion(notification: any) {
    state.selectedNotification = notification
    state.modal.isDeleteNotificationOpen = true
}

async function deleteNotification() {
    state.error = {}
    state.isTableLoading = true
    try {
        const selectedNotificationUuid = state.selectedNotification.uuid
        const response = await planGoalSubgoalNotificationService.deleteNotification(selectedNotificationUuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchNotifications()
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.notifications.table.alert.notificationSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>