<!-- PRODUCTION COMPANIES / YAPIM ŞİRKETLERİ -->
<template>
  <div v-if="companies.length > 0" class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
    <h3 class="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
      <div class="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 text-white">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-6.75 4.5h6.75m-6.75 4.5h6.75m-6.75 4.5h6.75" />
        </svg>
      </div>
      {{ title }}
    </h3>
    <div class="space-y-3">
      <div 
        v-for="company in companies" 
        :key="company.id"
        class="flex items-center gap-3 py-2 border-b border-gray-200 last:border-b-0"
      >
        <img 
          v-if="company.logo_path"
          :src="getImageUrl(company.logo_path, 'w92')" 
          :alt="company.name"
          class="w-10 h-10 rounded-lg object-cover"
        />
        <div v-else class="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-white">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-6.75 4.5h6.75m-6.75 4.5h6.75m-6.75 4.5h6.75" />
          </svg>
        </div>
        <span class="text-gray-700 font-medium">{{ company.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTmdb } from '../../composables/useTmdb'

const { getImageUrl } = useTmdb()

interface Company {
  id: number
  name: string
  logo_path: string | null
}

interface Props {
  companies: Company[]
  title: string
}

defineProps<Props>()
</script>
