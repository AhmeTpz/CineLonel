# ===================================================
# SEARCH BUTTON / ARAMA BUTONU
# ===================================================

<script setup lang="ts">
interface Props {
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  click: []
}>()

function handleClick() {
  if (!props.loading) {
    emit('click')
  }
}
</script>

<template>
  <button
    @click="handleClick"
    :disabled="loading"
    class="group relative px-6 py-2 bg-gradient-to-r from-blue-500/50 via-indigo-500/60 to-purple-500/60 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
  >
    <!-- BACKGROUND GLOW EFFECT / ARKAPLAN PARLAK ETKİSİ -->
    <div class="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
    
    <!-- BUTTON CONTENT / BUTON İÇERİĞİ -->
    <div class="relative flex items-center gap-2">
      <!-- LOADING SPINNER / YÜKLEME DÖNDÜRÜCÜSÜ -->
      <div v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      
      <!-- SEARCH ICON / ARAMA İKONU -->
      <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 group-hover:scale-110 transition-transform duration-200">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      
      <!-- BUTTON TEXT / BUTON METNİ -->
      <span class="group-hover:tracking-wider transition-all duration-200">
        {{ loading ? 'Searching...' : 'Search' }}
      </span>
    </div>
  </button>
</template>
