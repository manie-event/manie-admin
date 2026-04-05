<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
      <h1 class="text-xl font-bold text-gray-800">Manie Admin</h1>
      <router-link to="/keywords" class="text-sm text-gray-500 hover:text-blue-500">
        Mots clés
      </router-link>
      <button @click="authStore.logout()" class="text-sm text-gray-500 hover:text-red-500">
        Se déconnecter
      </button>
    </header>

    <!-- Content -->
    <main class="max-w-5xl mx-auto py-8 px-4">
      <h2 class="text-lg font-semibold text-gray-700 mb-6">Services en attente de validation</h2>

      <div v-if="loading" class="text-center text-gray-500 py-12">Chargement...</div>

      <div v-else-if="pendingServices.length === 0" class="text-center text-gray-500 py-12">
        Aucun service en attente de validation 🎉
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="service in pendingServices"
          :key="service.uuid"
          class="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center"
        >
          <div>
            <p class="font-semibold text-gray-800">{{ service.name }}</p>
            <p class="text-sm text-gray-500 mt-1">
              Professionnel : {{ service.professional?.name }}
            </p>
            <p class="text-sm text-gray-500">Service : {{ service.service?.name }}</p>

            <!-- Ajout des keywords -->
            <div class="flex flex-wrap gap-2 mt-2">
              <span
                v-for="keyword in service.keywords"
                :key="keyword.uuid"
                class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
              >
                {{ keyword.value }}
              </span>
            </div>

            <p class="text-xs text-gray-400 mt-2">Créé le {{ formatDate(service.createdAt) }}</p>
          </div>

          <div class="flex gap-3">
            <button
              @click="verify(service.uuid)"
              :disabled="loadingUuid === service.uuid"
              class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
            >
              ✓ Valider
            </button>
            <button
              @click="reject(service.uuid)"
              :disabled="loadingUuid === service.uuid"
              class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
            >
              ✗ Rejeter
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { professionalServiceService } from '../services/api'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const pendingServices = ref<any[]>([])
const loading = ref(false)
const loadingUuid = ref<string | null>(null)

async function fetchPending() {
  loading.value = true
  try {
    const response = await professionalServiceService.listPending()
    pendingServices.value = response.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function verify(uuid: string) {
  loadingUuid.value = uuid
  try {
    await professionalServiceService.verify(uuid)
    pendingServices.value = pendingServices.value.filter((s) => s.uuid !== uuid)
  } catch (e) {
    console.error(e)
  } finally {
    loadingUuid.value = null
  }
}

async function reject(uuid: string) {
  loadingUuid.value = uuid
  try {
    await professionalServiceService.reject(uuid)
    pendingServices.value = pendingServices.value.filter((s) => s.uuid !== uuid)
  } catch (e) {
    console.error(e)
  } finally {
    loadingUuid.value = null
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR')
}

onMounted(() => fetchPending())
</script>
