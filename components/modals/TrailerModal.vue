# ===================================================
# TRAILER MODAL / FRAGMAN EKRANI
# ===================================================

<script setup lang="ts">
interface Props {
  isOpen: boolean
  trailerKey: string | null
  title: string
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// CLOSE MODAL / MODALI KAPAT
const closeModal = () => {
  emit('close')
}

// ESC KEY HANDLER / ESC TUŞU İŞLEYİCİSİ
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeModal()
  }
}

// CLICK OUTSIDE HANDLER / DIŞARISI TIKLAMA İŞLEYİCİSİ
const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}
</script>

<template>
  <!-- TRAILER MODAL / FRAGMAN MODALI -->
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    @click="handleBackdropClick"
    @keydown="handleKeydown"
    tabindex="0"
  >
    <div class="relative w-full max-w-4xl mx-4">
      <!-- CLOSE BUTTON / KAPATMA BUTONU -->
      <button 
        @click="closeModal"
        class="absolute -top-12 right-0 z-10 text-white hover:text-gray-300 transition-colors duration-300 group"
      >
        <div class="bg-black/50 backdrop-blur-sm rounded-full p-2 group-hover:bg-black/70 transition-colors duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </button>
      
      <!-- VIDEO CONTAINER / VİDEO KONTEYNERİ -->
      <div class="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
        <iframe 
          v-if="trailerKey"
          :src="`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`"
          class="w-full h-full"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
        
        <!-- FALLBACK / YEDEK -->
        <div v-else class="flex items-center justify-center h-full text-white">
          <div class="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 mx-auto mb-4 text-gray-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a6.048 6.048 0 01-1.5 0m1.5-2.383V18.75a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9a2.25 2.25 0 012.25-2.25h9a2.25 2.25 0 012.25 2.25v9z" />
            </svg>
            <p class="text-lg font-medium">Trailer not available</p>
            <p class="text-sm text-gray-400">This content doesn't have a trailer</p>
          </div>
        </div>
      </div>
      
      <!-- TITLE / BAŞLIK -->
      <div v-if="title" class="mt-4 text-center">
        <h3 class="text-white text-xl font-semibold">{{ title }}</h3>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* MODAL ANIMATION / MODAL ANİMASYONU */
.fixed {
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* VIDEO CONTAINER ANIMATION / VİDEO KONTEYNER ANİMASYONU */
.relative {
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
