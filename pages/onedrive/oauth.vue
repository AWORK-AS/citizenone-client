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

// An OAuth return page; nothing here should be in a search index.
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
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
  const state = route.query.state as string
  const returnTo = localStorage.getItem('onedrive_return_to') || '/apps?onedrive_connected=1'

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

    const params = new URLSearchParams({ code })
    if (state) {
      params.set('state', state)
    }

    const response = await fetch(
      `/api/user/onedrive/oauth?${params.toString()}`,
      {
        method: 'GET',
        headers,
      }
    )
    const data = await response.json()

    if (!response.ok) throw new Error(data.error || data.message)

    if (data && (data.sanctum_token || data.token?.sanctum_token)) {
      const sanctumToken = data.sanctum_token || data.token?.sanctum_token
      await setSessionToken(sanctumToken)
    }

    localStorage.removeItem('onedrive_return_to')
    router.push(returnTo)

  } catch (error: any) {
    errorMessage.value = error.message || 'Kunne ikke hente OneDrive token'
    errorAlert('Fejl', errorMessage.value)
    localStorage.removeItem('onedrive_return_to')
    setTimeout(() => router.push('/apps'), 3000)
  }
})
</script>
