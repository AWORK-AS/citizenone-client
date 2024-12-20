<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('settings.tabs.transactions') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('settings.tabs.transactions') }}</template>

            <ModulesSettingsTab />

            <div class="py-10">
                <div class="grid grid-cols-4 gap-x-3">
                    <button
                        class="flex items-center justify-center gap-x-2 outline-none rounded-md text-xs truncate font-semibold px-4 py-10 bg-tertiary border border-tertiary text-white hover:bg-tertiary-800"
                        @click="state.modal.isCitizenWalletTransactionsShow = true">
                        {{ $t('settings.wallets.citizenWalletTransactions') }}
                    </button>
                </div>
            </div>
            <ModulesSettingsModalCitizenWalletTransactions :isModalOpen="state.modal.isCitizenWalletTransactionsShow"
                @close="state.modal.isCitizenWalletTransactionsShow = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()

const state = reactive({
    modal: {
        isCitizenWalletTransactionsShow: false
    }
})
</script>