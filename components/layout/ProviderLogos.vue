<!-- PROVIDER LOGOS / SAĞLAYICI LOGOLARI -->
<template>
  <div class="mt-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-2xl">
    <h3 class="text-gray-900 font-bold text-lg mb-4 flex items-center gap-3">
      <div class="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z" />
        </svg>
      </div>
      Where to Watch
    </h3>
    
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <div class="relative">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-emerald-200 border-t-emerald-600"></div>
        <div class="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-400 animate-ping"></div>
      </div>
    </div>
    
    <div v-else class="space-y-4">
      <!-- Streaming -->
      <div v-if="providers.flatrate && providers.flatrate.length > 0">
        <h4 class="text-emerald-600 text-sm font-semibold mb-3 flex items-center gap-2">
          <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
          Streaming
        </h4>
        <div class="grid grid-cols-4 gap-4">
          <div 
            v-for="provider in providers.flatrate.slice(0, showAllProviders ? undefined : 8)" 
            :key="provider.provider_id"
            class="relative group bg-gray-50 rounded-xl p-1 flex items-center justify-center hover:bg-gray-100 transition-all duration-300 border border-gray-200 hover:border-emerald-300 hover:shadow-lg"
            :title="provider.provider_name"
          >
            <img 
              :src="provider.logo_path ? `https://image.tmdb.org/t/p/w92${provider.logo_path}` : '/no-photo.png'" 
              :alt="provider.provider_name"
              class="w-12 h-12 rounded-lg object-cover"
            />
            <!-- Tooltip -->
            <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
              {{ provider.provider_name }}
              <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
        <button 
          v-if="providers.flatrate.length > 8"
          @click="showAllProviders = !showAllProviders"
          class="text-emerald-600 text-xs hover:text-emerald-700 mt-3 font-medium transition-colors duration-300"
        >
          {{ showAllProviders ? 'Show Less' : `Show ${providers.flatrate.length - 8} More` }}
        </button>
      </div>

      <!-- Rent -->
      <div v-if="providers.rent && providers.rent.length > 0">
        <h4 class="text-emerald-600 text-sm font-semibold mb-3 flex items-center gap-2">
          <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
          Rent
        </h4>
        <div class="grid grid-cols-4 gap-4">
          <div 
            v-for="provider in providers.rent.slice(0, 4)" 
            :key="provider.provider_id"
            class="relative group bg-gray-50 rounded-xl p-1 flex items-center justify-center hover:bg-gray-100 transition-all duration-300 border border-gray-200 hover:border-emerald-300 hover:shadow-lg"
            :title="provider.provider_name"
          >
            <img 
              :src="provider.logo_path ? `https://image.tmdb.org/t/p/w92${provider.logo_path}` : '/no-photo.png'" 
              :alt="provider.provider_name"
              class="w-12 h-12 rounded-lg object-cover"
            />
            <!-- Tooltip -->
            <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
              {{ provider.provider_name }}
              <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Buy -->
      <div v-if="providers.buy && providers.buy.length > 0">
        <h4 class="text-emerald-600 text-sm font-semibold mb-3 flex items-center gap-2">
          <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
          Buy
        </h4>
        <div class="grid grid-cols-4 gap-4">
          <div 
            v-for="provider in providers.buy.slice(0, 4)" 
            :key="provider.provider_id"
            class="relative group bg-gray-50 rounded-xl p-1 flex items-center justify-center hover:bg-gray-100 transition-all duration-300 border border-gray-200 hover:border-emerald-300 hover:shadow-lg"
            :title="provider.provider_name"
          >
            <img 
              :src="provider.logo_path ? `https://image.tmdb.org/t/p/w92${provider.logo_path}` : '/no-photo.png'" 
              :alt="provider.provider_name"
              class="w-12 h-12 rounded-lg object-cover"
            />
            <!-- Tooltip -->
            <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
              {{ provider.provider_name }}
              <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!providers.flatrate && !providers.rent && !providers.buy" class="text-gray-500 text-sm text-center py-4">
        No streaming options available
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Provider {
  provider_id: number
  provider_name: string
  logo_path: string | null
}

interface Providers {
  flatrate?: Provider[]
  rent?: Provider[]
  buy?: Provider[]
}

interface Props {
  providers: Providers
  isLoading: boolean
}

defineProps<Props>()

const showAllProviders = ref(false)
</script>
