# ===================================================
# CONTENT SECTION / İÇERİK BÖLÜMÜ
# ===================================================

<template>
  <section class="container mx-auto p-4 mt-0 relative z-20">
    <!-- LOADING STATE / YÜKLEME DURUMU -->
    <div v-if="isLoading" class="text-center py-20">
      <div class="inline-flex items-center gap-3 bg-white/80 backdrop-blur-xl rounded-2xl px-8 py-6 shadow-2xl">
        <div class="w-8 h-8 border-4 rounded-full animate-spin" :class="loadingColor"></div>
        <span class="text-lg font-semibold text-gray-700">{{ loadingText }}</span>
      </div>
    </div>

    <!-- NO RESULTS / SONUÇ YOK -->
    <div v-else-if="!hasItems" class="text-center py-20">
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl max-w-md mx-auto">
        <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" :class="iconGradient">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8 text-white">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ noResultsTitle }}</h3>
        <p class="text-gray-600">{{ noResultsText }}</p>
        <div class="mt-6">
          <button @click="$emit('reset-filters')" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all">
            Refresh and Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- CONTENT / İÇERİK -->
    <div v-else class="space-y-8">
      <!-- ENHANCED PAGINATION / GELİŞTİRİLMİŞ SAYFALAMA -->
      <div v-if="showPagination" class="flex justify-center mb-8 mt-12">
        <slot name="pagination" />
      </div>

      <!-- MAIN CONTENT / ANA İÇERİK -->
      <slot />

      <!-- BOTTOM PAGINATION / ALT SAYFALAMA -->
      <div v-if="showPagination" class="flex justify-center mt-8">
        <slot name="bottom-pagination" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  isLoading?: boolean
  hasItems?: boolean
  loadingText?: string
  loadingColor?: string
  noResultsTitle?: string
  noResultsText?: string
  iconGradient?: string
  showPagination?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  hasItems: true,
  loadingText: 'Loading...',
  loadingColor: 'border-red-500 border-t-transparent',
  noResultsTitle: 'No Results Found',
  noResultsText: 'Try adjusting your search or check back later.',
  iconGradient: 'bg-gradient-to-r from-red-500 to-pink-500',
  showPagination: true
})
</script>
