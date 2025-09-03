<!-- SEASONS SECTION / SEZON BİLGİLERİ BÖLÜMÜ -->
<template>
  <div class="mt-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-2xl">
    <h3 class="text-gray-900 font-bold text-lg mb-4 flex items-center gap-3">
      <div class="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      </div>
      Season Information
    </h3>
    
    <div class="space-y-4">
      <!-- Current Season -->
      <div class="space-y-2">
        <div class="flex justify-between items-center py-2">
          <span class="text-gray-600">Seasons:</span>
          <span class="font-semibold">{{ numberOfSeasons }}</span>
        </div>
        <div class="flex justify-between items-center py-2">
          <span class="text-gray-600">Episodes:</span>
          <span class="font-semibold">{{ numberOfEpisodes }}</span>
        </div>
      </div>

      <!-- Season List -->
      <div v-if="seasons && seasons.length > 0" class="space-y-3">
        <h4 class="text-gray-700 font-semibold text-sm">All Seasons</h4>
        <div class="grid gap-3">
          <div 
            v-for="season in seasons.slice(0, 3)" 
            :key="season.id"
            class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300"
          >
            <img 
              v-if="season.poster_path"
              :src="getImageUrl(season.poster_path, 'w92')" 
              :alt="season.name"
              class="w-12 h-12 rounded-lg object-cover"
            />
            <div v-else class="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-xs">S{{ season.season_number }}</span>
            </div>
            <div class="flex-1">
              <div class="text-gray-900 font-medium text-sm">{{ season.name }}</div>
              <div class="text-gray-500 text-xs">{{ season.episode_count }} Episodes</div>
            </div>
            <div class="text-right">
              <div class="text-gray-600 text-xs">{{ season.air_date ? formatDate(season.air_date) : 'TBA' }}</div>
              <div v-if="season.vote_average" class="text-emerald-600 text-xs font-medium mt-1">
                {{ formatVoteAverage(season.vote_average) }}%
              </div>
            </div>
          </div>
        </div>
        <div v-if="seasons.length > 3" class="text-center">
          <button 
            @click="openSeasonsModal"
            class="text-emerald-600 text-sm hover:text-emerald-700 font-medium"
          >
            View All {{ seasons.length }} Seasons
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTmdb } from '../../composables/useTmdb'

const { getImageUrl } = useTmdb()

interface Season {
  id: number
  name: string
  season_number: number
  episode_count: number
  air_date: string | null
  poster_path: string | null
  vote_average: number | null
}

interface Props {
  numberOfSeasons: number
  numberOfEpisodes: number
  seasons: Season[]
  openSeasonsModal: () => void
}

defineProps<Props>()

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const formatVoteAverage = (vote: number): number => {
  return Math.round(vote * 10)
}
</script>
