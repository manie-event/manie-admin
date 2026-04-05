<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
      <h1 class="text-xl font-bold text-gray-800">Manie Admin</h1>
      <div class="flex gap-4 items-center">
        <router-link to="/" class="text-sm text-gray-500 hover:text-blue-500">
          Services en attente
        </router-link>
        <button @click="authStore.logout()" class="text-sm text-gray-500 hover:text-red-500">
          Se déconnecter
        </button>
      </div>
    </header>

    <main class="max-w-5xl mx-auto py-8 px-4">
      <h2 class="text-lg font-semibold text-gray-700 mb-6">Gestion des mots clés</h2>

      <!-- Formulaire d'ajout -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 class="font-semibold text-gray-700 mb-4">Ajouter un mot clé</h3>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Secteur</label>
            <input
              v-model="form.sector"
              type="text"
              placeholder="ex: restauration"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <input
              v-model="form.category"
              type="text"
              placeholder="ex: cuisine"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Valeur</label>
            <input
              v-model="form.value"
              type="text"
              placeholder="ex: gastronomique"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <p v-if="error" class="text-red-500 text-sm mt-3">{{ error }}</p>
        <button
          @click="addKeyword"
          :disabled="loading"
          class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
        >
          {{ loading ? 'Ajout...' : '+ Ajouter' }}
        </button>
      </div>

      <!-- Liste des mots clés -->

      <!-- Filtre par secteur -->
      <div class="flex gap-3 mb-6">
        <select
          v-model="selectedSector"
          class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les secteurs</option>
          <option v-for="sector in sectors" :key="sector" :value="sector">
            {{ sector }}
          </option>
        </select>
      </div>

      <div v-if="fetchLoading" class="text-center text-gray-500 py-12">Chargement...</div>

      <div v-else-if="keywords.length === 0" class="text-center text-gray-500 py-12">
        Aucun mot clé enregistré
      </div>

      <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th class="px-6 py-3 text-left">Secteur</th>
              <th class="px-6 py-3 text-left">Catégorie</th>
              <th class="px-6 py-3 text-left">Valeur</th>
              <th class="px-6 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="keyword in filteredKeywords" :key="keyword.uuid">
              <td class="px-6 py-4 text-gray-700">{{ keyword.sector }}</td>
              <td class="px-6 py-4 text-gray-700">{{ keyword.category }}</td>
              <td class="px-6 py-4 text-gray-700">{{ keyword.value }}</td>
              <td class="px-6 py-4">
                <button
                  @click="deleteKeyword(keyword.uuid)"
                  :disabled="deletingUuid === keyword.uuid"
                  class="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { keywordService } from '../services/api'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const selectedSector = ref('')

const keywords = ref<any[]>([])
const fetchLoading = ref(false)
const loading = ref(false)
const deletingUuid = ref<string | null>(null)
const error = ref('')

const form = ref({
  sector: '',
  category: '',
  value: '',
})

const sectors = computed(() => [...new Set(keywords.value.map((k) => k.sector))])

const filteredKeywords = computed(() =>
  selectedSector.value
    ? keywords.value.filter((k) => k.sector === selectedSector.value)
    : keywords.value,
)

async function fetchKeywords() {
  fetchLoading.value = true
  try {
    const response = await keywordService.list()
    keywords.value = response.data.data ?? response.data
  } catch (e) {
    console.error(e)
  } finally {
    fetchLoading.value = false
  }
}

async function addKeyword() {
  error.value = ''
  if (!form.value.sector || !form.value.category || !form.value.value) {
    error.value = 'Tous les champs sont obligatoires'
    return
  }
  loading.value = true
  try {
    await keywordService.create(form.value)
    form.value = { sector: '', category: '', value: '' }
    await fetchKeywords()
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'Erreur lors de la création'
  } finally {
    loading.value = false
  }
}

async function deleteKeyword(uuid: string) {
  deletingUuid.value = uuid
  try {
    await keywordService.delete(uuid)
    keywords.value = keywords.value.filter((k) => k.uuid !== uuid)
  } catch (e) {
    console.error(e)
  } finally {
    deletingUuid.value = null
  }
}

onMounted(() => fetchKeywords())
</script>
