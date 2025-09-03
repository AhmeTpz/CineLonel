<!-- CAST & CREW SECTION / OYUNCU VE EKİP BÖLÜMÜ -->
<template>
  <div v-if="cast.length > 0" class="mb-10">
    <h2 class="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
      <div class="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 003.9-.128 3 3 0 10-5.799 0c.617.174 1.268.287 1.949.328zM4.5 8.25a3 3 0 116 0 3 3 0 01-6 0zM14.25 8.25a3 3 0 116 0 3 3 0 01-6 0zM1.5 19.128v-.377a6.375 6.375 0 0112.75 0v.377A12.318 12.318 0 017.875 21c-2.303 0-4.465-.657-6.375-1.872z" />
        </svg>
      </div>
      Top Billed Cast
    </h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      <div 
        v-for="person in cast" 
        :key="person.id"
        class="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden hover:bg-white/20 transition-all duration-300 border border-white/10 hover:scale-105 hover:shadow-2xl cursor-pointer"
        @click="router.push(`/people/${person.id}`)"
      >
        <img 
          :src="person.profile_path ? getImageUrl(person.profile_path, 'w185') : '/no-photo.png'" 
          :alt="person.name"
          class="w-full h-48 object-cover"
        />
        <div class="p-4">
          <div class="text-gray-900 font-semibold text-sm mb-1">{{ person.name }}</div>
          <div class="text-emerald-600 text-xs">{{ person.character }}</div>
        </div>
      </div>
    </div>
    <div class="text-left mt-4">
      <button 
        @click="openCastCrewModal"
        class="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors duration-300 group"
      >
        <span>View More Cast & Crew</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useTmdb } from '../../composables/useTmdb'

const router = useRouter()
const { getImageUrl } = useTmdb()

interface CastPerson {
  id: number
  name: string
  character: string
  profile_path: string | null
}

interface Props {
  cast: CastPerson[]
  openCastCrewModal: () => void
}

defineProps<Props>()
</script>
