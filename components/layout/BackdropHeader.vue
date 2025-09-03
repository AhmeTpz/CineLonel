<!-- BACKDROP HEADER / ARKA PLAN BAŞLIĞI -->
<template>
  <div class="relative h-96 overflow-hidden">
    <div 
      class="absolute inset-0 bg-cover bg-center"
      :style="`background-image: url(${getImageUrl(backdropPath, 'w1280')})`"
    ></div>
    <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-emerald-900/30"></div>
    
    <!-- Back Button -->
    <button 
      @click="router.back()"
      class="absolute top-6 left-6 z-10 group bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white p-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 group-hover:scale-110 transition-transform duration-300">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useTmdb } from '../../composables/useTmdb'

const router = useRouter()
const { getImageUrl } = useTmdb()

interface Props {
  backdropPath: string | null
}

defineProps<Props>()
</script>
