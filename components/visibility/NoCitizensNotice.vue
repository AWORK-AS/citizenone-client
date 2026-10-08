<template>
    <!-- Staff in a company that uses departments, with no department, no assigned
         citizen and no employee group, see no citizens by design. Say so, instead of
         leaving them with an empty list that looks like a fault. -->
    <div v-if="seesNoCitizens" role="status"
        class="flex items-start gap-3 rounded-lg bg-gray-100"
        :class="compact ? 'mt-2 px-3 py-2' : 'mb-4 px-4 py-3'">
        <Icon name="ph:info" class="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <p class="flex-1 font-medium text-primary" :class="compact ? 'text-xs' : 'text-sm'">
            {{ $t('citizenVisibility.notice') }}
        </p>
        <Tooltip :text="$t('citizenVisibility.noticeHelp')" :position="compact ? 'top' : 'left'" wrap>
            <button type="button"
                class="flex size-6 shrink-0 items-center justify-center rounded-full text-primary hover:bg-primary/10"
                :aria-label="$t('citizenVisibility.noticeHelpLabel')">
                <Icon name="ph:question" class="size-4" aria-hidden="true" />
            </button>
        </Tooltip>
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'

defineProps({
    compact: {
        type: Boolean,
        default: false,
    },
})

const userStore = useUserStore() as any

// A missing field (older backend) means the user is not in that situation.
const seesNoCitizens = computed(() => userStore.getUser?.sees_no_citizens === true)
</script>
