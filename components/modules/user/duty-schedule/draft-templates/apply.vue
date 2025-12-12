<template>
    <div class="space-y-5">
            <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="flex h-full flex-col">
                    

                    <!-- Week Grid-->
                    <!-- <header class="grid grid-cols-1 xl:grid-cols-3 justify-between gap-3 py-3">
                        <div class="space-y-2">

                        </div>
                    </header> -->

                    <ModulesUserDutyScheduleDraftTemplatesApplyWeekGridX />
                    
                </div>
            </LoadingSpinner>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

</script>