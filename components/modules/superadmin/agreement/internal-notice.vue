<template>
    <Tooltip :text="$t('superadmin.agreements.internal.help')" position="bottom" wrap class="block">
        <div class="flex items-start gap-2 rounded-lg border border-[#E4F1F6] bg-[#F1F8FB] px-3 py-2 text-[12px] text-[#205E77]"
            role="note">
            <Icon name="ph:eye-slash" class="w-4 h-4 mt-px flex-shrink-0" :aria-label="$t('superadmin.agreements.internal.title')" />
            <p>
                <strong>{{ $t('superadmin.agreements.internal.title') }}</strong>
                {{ $t('superadmin.agreements.internal.body') }}
            </p>
        </div>
    </Tooltip>
</template>
