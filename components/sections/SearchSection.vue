# ===================================================
# SEARCH SECTION / ARAMA BÖLÜMÜ
# ===================================================

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useTmdb } from '../composables/useTmdb'
import SearchResults from '../results/SearchResults.vue'
import AnimatedBackground from '../layout/AnimatedBackground.vue'

const { request, getImageUrl } = useTmdb()

const posterImages = [
  '/post1.jpg',
  '/post2.jpg',
  '/post3.jpg'
]

const searchQuery = ref('')
const searchResults = ref<{
  movies: any[]
  tvShows: any[]
  people: any[]
}>({
  movies: [],
  tvShows: [],
  people: []
})
const isLoading = ref(false)
const showResults = ref(false)
const searchContainer = ref<HTMLElement>()

let searchTimer: ReturnType<typeof setTimeout> | null = null

const handleClickOutside = (event: Event) => {
  if (searchContainer.value && !searchContainer.value.contains(event.target as Node)) {
    showResults.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const performSearch = async (query: string) => {
  if (query.length < 3) {
    searchResults.value = { movies: [], tvShows: [], people: [] }
    showResults.value = false
    return
  }

  isLoading.value = true
  showResults.value = true

  try {
    const [movies, tvShows, people] = await Promise.all([
      request<any>('/search/movie', { query, page: 1 }),
      request<any>('/search/tv', { query, page: 1 }),
      request<any>('/search/person', { query, page: 1 })
    ])

    searchResults.value = {
      movies: (movies.results || []).slice(0, 12),
      tvShows: (tvShows.results || []).slice(0, 12),
      people: (people.results || []).slice(0, 18)
    }
  } catch (error) {
    searchResults.value = { movies: [], tvShows: [], people: [] }
  } finally {
    isLoading.value = false
  }
}

watch(searchQuery, (newQuery) => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  if (newQuery.length >= 3) {
    searchTimer = setTimeout(() => {
      performSearch(newQuery)
    }, 500)
  } else {
    showResults.value = false
    searchResults.value = { movies: [], tvShows: [], people: [] }
  }
})
</script>

<template>
  <section class="relative min-h-screen overflow-visible" style="z-index: 1; position: relative;">
    <!-- ANIMATED BACKGROUND / ANİMASYONLU ARKAPLAN -->
    <div class="absolute inset-0 flex w-full">
      <img
        v-for="(image, i) in posterImages"
        :key="i"
        :src="image"
        :alt="`Poster ${i + 1}`"
        class="flex-1 object-cover h-full min-w-0"
      />
    </div>

    <div class="absolute inset-0 bg-gradient-to-br from-green-900/80 via-emerald-800/70 to-cyan-900/80 animate-gradient"></div>
    
    <AnimatedBackground />

          <div class="relative container mx-auto flex flex-col items-center gap-4 py-32 text-center" style="z-index: 10;">
      <!-- ANIMATED TITLE / ANİMASYONLU BAŞLIK -->
      <h2 class="text-6xl md:text-8xl font-bold tracking-tight text-white mb-4 animate-title">
        <span class="bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Explore
        </span>
      </h2>

      <p class="text-white/90 text-xl md:text-2xl mb-8 animate-fade-in-up">
        Discover your favorite movies, TV shows, and stars.
      </p>

      <!-- SEARCH CONTAINER / ARAMA KONTEYNERİ -->
      <div ref="searchContainer" class="w-full max-w-4xl relative group" style="z-index: 40;">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search movies, TV shows, people..."
          class="w-full rounded-full border-0 bg-white/10 backdrop-blur-xl px-8 py-6 pr-24 text-xl text-white placeholder:text-white/60 focus:outline-none ring-2 ring-lime-400/50 focus:ring-lime-400 shadow-2xl transition-all duration-500 group-hover:shadow-lime-500/25 focus:shadow-lime-500/50"
        />

        <!-- ANIMATED SEARCH BUTTON / ANİMASYONLU ARAMA BUTONU (iŞLEVSİZ) -->
        <button
          type="submit"
          class="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-600 hover:to-emerald-600 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-1"
        >
          <span class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Search
          </span>
        </button>

        <!-- SEARCH RESULTS / ARAMA SONUÇLARI -->
        <SearchResults
          :show-results="showResults"
          :is-loading="isLoading"
          :search-results="searchResults"
          :get-image-url="getImageUrl"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.animate-gradient {
  background-size: 400% 400%;
  animation: gradientShift 12s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}



.animate-title {
  animation: titleGlow 4s ease-in-out infinite alternate;
}

@keyframes titleGlow {
  from { text-shadow: 0 0 20px rgba(132, 204, 22, 0.3); }
  to { text-shadow: 0 0 40px rgba(16, 185, 129, 0.4), 0 0 60px rgba(6, 182, 212, 0.3); }
}

.animate-fade-in-up {
  animation: fadeInUp 1s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
