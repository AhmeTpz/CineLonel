<!-- USER SCORE SECTION / KULLANICI PUANI BÖLÜMÜ -->
<template>
  <div class="flex items-center gap-6 mb-8">
    <div class="relative">
      <svg class="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
        <path 
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none" 
          stroke="#d1d5db" 
          stroke-width="2"
        />
        <path 
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none" 
          stroke="#10b981" 
          stroke-width="2"
          :stroke-dasharray="`${formatVoteAverage(voteAverage)}, 100`"
        />
      </svg>
      <div class="absolute inset-0 flex items-center justify-center">
        <span class="text-gray-900 font-bold text-lg">{{ formatVoteAverage(voteAverage) }}%</span>
      </div>
    </div>
    <div>
      <div class="text-gray-900 font-bold text-lg">User Score</div>
      <div class="text-emerald-600 text-sm">{{ voteCount.toLocaleString() }} votes</div>
    </div>
    
    <!-- Play Trailer Button -->
    <button 
      v-if="hasTrailers"
      @click="playTrailer"
      class="flex items-center gap-4 group"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="#10b981" viewBox="0 0 24 24" class="w-12 h-12 group-hover:animate-pulse transition-all duration-300">
        <path d="M8 5v14l11-7z"/>
      </svg>
      <div class="text-left">
        <div class="text-gray-900 font-bold text-lg">Play Trailer</div>
        <div class="text-emerald-600 text-sm">Watch the official trailer</div>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  voteAverage: number
  voteCount: number
  hasTrailers: boolean
  playTrailer: () => void
}

defineProps<Props>()

const formatVoteAverage = (vote: number): number => {
  return Math.round(vote * 10)
}
</script>
