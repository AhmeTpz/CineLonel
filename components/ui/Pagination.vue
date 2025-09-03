# ===================================================
# PAGINATION / SAYFALAMA
# ===================================================

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentPage: number
  totalPages: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:page': [page: number]
}>()

const pageWindow = computed(() => {
  const windowSize = 3
  const halfWindow = Math.floor(windowSize / 2)

  let start = Math.max(1, props.currentPage - halfWindow)
  const end = Math.min(props.totalPages, start + windowSize - 1)

  // ADJUST START IF WE'RE NEAR THE END / SONA YAKINSAN BAŞLANGICI AYARLA
  if (end === props.totalPages) {
    start = Math.max(1, end - windowSize + 1)
  }

  const pages: number[] = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

function go(page: number) {
  if (page >= 1 && page <= props.totalPages) {
    emit('update:page', page)
  }
}
// VUE STYLE GUIDES SUGGEST MULTI-WORD COMPONENT NAMES. WE KEEP AS PAGINATION BY DESIGN. / VUE STİL REHBERLERİ ÇOK KELİMELİ BİLEŞEN ADLARI ÖNERİR. TASARIM GEREĞİ PAGINATION OLARAK TUTUYORUZ.
</script>

<template>
  <div class="flex items-center justify-center gap-1 bg-gradient-to-r from-green-600/50 via-emerald-600/60 to-teal-600/50 backdrop-blur-sm rounded-3xl p-2" v-if="totalPages > 1">
    <!-- PREVIOUS BUTTON / ÖNCEKİ BUTONU -->
    <button
      @click="$emit('update:page', currentPage - 1)"
      :disabled="currentPage === 1"
      class="px-4 py-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      :class="currentPage === 1 ? 'text-gray-400' : 'text-white hover:text-green-300'"
    >
      <span class="flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        <span class="hidden sm:inline">Previous</span>
      </span>
    </button>

    <!-- PAGE NUMBERS / SAYFA NUMARALARI -->
    <div class="flex items-center gap-1">
      <!-- FIRST PAGE / İLK SAYFA -->
      <button
        v-if="pageWindow[0] > 1"
        @click="$emit('update:page', 1)"
        class="px-3 py-2 rounded-xl font-medium text-white/80 hover:text-white transition-all duration-200"
      >
        1
      </button>

      <!-- ELLIPSIS / ÜÇ NOKTA -->
      <span v-if="pageWindow[0] > 2" class="px-2 text-white/50">...</span>

      <!-- PAGE NUMBERS / SAYFA NUMARALARI -->
      <button
        v-for="page in pageWindow"
        :key="page"
        @click="$emit('update:page', page)"
        class="px-3 py-2 rounded-xl font-medium transition-all duration-200"
        :class="page === currentPage
          ? 'text-white bg-gradient-to-r from-green-600/80 via-emerald-600/90 to-teal-600/80 shadow-lg scale-105'
          : 'text-white/80 hover:text-white'"
      >
        {{ page }}
      </button>

      <!-- ELLIPSIS / ÜÇ NOKTA -->
      <span v-if="pageWindow[pageWindow.length - 1] < totalPages - 1" class="px-2 text-white/50">...</span>

      <!-- LAST PAGE / SON SAYFA -->
      <button
        v-if="pageWindow[pageWindow.length - 1] < totalPages"
        @click="$emit('update:page', totalPages)"
        class="px-3 py-2 rounded-xl font-medium text-white/80 hover:text-white transition-all duration-200"
      >
        {{ totalPages }}
      </button>
    </div>

    <!-- NEXT BUTTON / SONRAKİ BUTONU -->
    <button
      @click="$emit('update:page', currentPage + 1)"
      :disabled="currentPage === totalPages"
      class="px-4 py-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      :class="currentPage === totalPages ? 'text-gray-400' : 'text-white hover:text-green-300'"
    >
      <span class="flex items-center gap-1">
        <span class="hidden sm:inline">Next</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </span>
    </button>

    <!-- PAGE INFO (MOBILE) / SAYFA BİLGİSİ (MOBİL) -->
    <div class="sm:hidden ml-4 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-white/60 text-sm">
      {{ currentPage }} / {{ totalPages }}
    </div>
  </div>
</template>

<style scoped></style>
