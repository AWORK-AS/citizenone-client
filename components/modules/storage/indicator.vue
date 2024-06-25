<template>
    <div class="mt-4">
        <h2 class="text-md mb-2 text-white">Storage</h2>
        <div class="w-full bg-gray-200 rounded-full h-4 mb-4 relative">
            <div class="absolute top-0 h-full bg-yellow-500 rounded-l-full" style="width: 70%;">
            </div>
            <div class="absolute top-0 -right-0 h-full bg-gray-300 rounded-r-full" style="width: 30%;">
            </div>
        </div>
        <div class="space-y-2 text-xs text-white">
            <div class="flex items-center">
                <span class="inline-block w-3 h-3 bg-yellow-500 mr-2"></span>Documents (70%)
            </div>
            <div class="flex items-center">
                <span class="inline-block w-3 h-3 bg-gray-300 mr-2"></span>Available (30%)
            </div>
        </div>
    </div>
</template>