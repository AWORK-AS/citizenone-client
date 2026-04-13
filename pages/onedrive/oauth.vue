<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <p class="text-lg font-semibold">Logger ind hos OneDrive…</p>
      <p class="text-red-600 mt-4" v-if="errorMessage">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'

const router = useRouter()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const { errorAlert } = useAlert()
const userStore = useUserStore() as any
const errorMessage = ref('')

onMounted(async () => {
  const code = route.query.code as string

  if (!code) {
    errorMessage.value = 'Ingen authorization code modtaget'
    setTimeout(() => router.push('/apps'), 2000)
    return
  }

  try {
    const token = localStorage.getItem('_token')
    const userId = userStore.getUser?.id || localStorage.getItem('user_id')

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
    if (userId) {
      headers['X-User-Id'] = String(userId)
    }

    const response = await fetch(
      `/api/user/onedrive/oauth?code=${encodeURIComponent(code)}`,
      {
        method: 'GET',
        headers,
      }
    )
    const data = await response.json()

    if (!response.ok) throw new Error(data.error || data.message)

    if (data && (data.sanctum_token || data.token?.sanctum_token)) {
      const sanctumToken = data.sanctum_token || data.token?.sanctum_token
      localStorage.setItem('_token', sanctumToken)
    }

    // Send bruger tilbage til apps-siden med success-markering
    router.push('/apps?onedrive_connected=1')

  } catch (error: any) {
    errorMessage.value = error.message || 'Kunne ikke hente OneDrive token'
    errorAlert('Fejl', errorMessage.value)
    setTimeout(() => router.push('/apps'), 3000)
  }
})
</script>
