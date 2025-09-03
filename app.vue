# ===================================================
# MAIN APP COMPONENT / ANA UYGULAMA BİLEŞENİ
# ===================================================

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useFavoritesStore } from './stores/favorites'
import Logo from './components/brand/Logo.vue'
import ScrollEffect from './components/layout/ScrollEffect.vue'
import NavigationDropdown from './components/navigation/NavigationDropdown.vue'
import AnimatedBackground from './components/layout/AnimatedBackground.vue'
import { useTmdb } from './composables/useTmdb'
import SearchResults from './components/results/SearchResults.vue'

const favoritesStore = useFavoritesStore()
const { request, getImageUrl } = useTmdb()
const route = useRoute()

const isClient = ref(false)
const moviesDropdownOpen = ref(false)
const tvDropdownOpen = ref(false)

// HEADER SEARCH STATE
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
const showSearchInput = ref(false)
const searchContainer = ref<HTMLElement>()

let searchTimer: ReturnType<typeof setTimeout> | null = null

const movieCategories = [
  { label: 'Popular', path: '/movies' },
  { label: 'Now Playing', path: '/movies/now-playing' },
  { label: 'Upcoming', path: '/movies/upcoming' },
  { label: 'Top Rated', path: '/movies/top-rated' }
]

const tvCategories = [
  { label: 'Popular', path: '/tv' },
  { label: 'Airing Today', path: '/tv/airing-today' },
  { label: 'On The Air', path: '/tv/on-the-air' },
  { label: 'Top Rated', path: '/tv/top-rated' }
]

const handleMoviesClick = (event: Event) => {
  event.stopPropagation()
  moviesDropdownOpen.value = !moviesDropdownOpen.value
  tvDropdownOpen.value = false
}

const handleTvClick = (event: Event) => {
  event.stopPropagation()
  tvDropdownOpen.value = !tvDropdownOpen.value
  moviesDropdownOpen.value = false
}

const closeDropdowns = () => {
  moviesDropdownOpen.value = false
  tvDropdownOpen.value = false
}

// HEADER SEARCH FUNCTIONS
const handleClickOutside = (event: Event) => {
  if (!showSearchInput.value) return

  const target = event.target as HTMLElement
  if (target.tagName === 'INPUT' || target.closest('input')) return

  const searchContainerEl = searchContainer.value
  const searchResultsEl = document.querySelector('[data-search-results]')
  
  if (searchContainerEl && !searchContainerEl.contains(target) && 
      searchResultsEl && !searchResultsEl.contains(target)) {
    showResults.value = false
    showSearchInput.value = false
    searchQuery.value = ''
  }
}



const handleInputFocus = () => {
  if (searchQuery.value.length >= 3) {
    showResults.value = true
  }
}

const handleInputBlur = () => {
  if (showSearchInput.value && searchQuery.value.length > 0) {
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement
      if (input) {
        input.focus()
        input.setSelectionRange(input.value.length, input.value.length)
      }
    }, 10)
  }

  showResults.value = false
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.code === 'Space') {
  }
}

const handleInputChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  searchQuery.value = target.value
}





const toggleSearch = () => {
  if (showSearchInput.value && searchQuery.value.length > 0) {
    return
  }

  showSearchInput.value = !showSearchInput.value

  if (!showSearchInput.value) {
    showResults.value = false
    searchQuery.value = ''
  } else {
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement
      if (input) {
        input.focus()
      }
    }, 100)
  }
}

const closeSearch = () => {
  showSearchInput.value = false
  showResults.value = false
  searchQuery.value = ''
}

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

watch(() => route.path, () => {
  if (showSearchInput.value || showResults.value) {
    showSearchInput.value = false
    showResults.value = false
    searchQuery.value = ''
    if (searchTimer) {
      clearTimeout(searchTimer)
      searchTimer = null
    }
  }
})

onMounted(() => {
  isClient.value = true
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<template>
  <div id="app">
    <!-- HEADER / BAŞLIK -->
    <header
      class="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-gradient-to-r from-green-500/30 via-emerald-500/40 to-teal-500/30 border-b border-white/20 shadow-2xl overflow-visible">
      <div class="max-w-7xl mx-auto px-4 py-4 relative overflow-visible">
        <div class="flex items-center justify-between">
          <!-- LOGO AND NAVIGATION -->
          <div class="flex items-center gap-6 -ml-64">
            <Logo />

            <!-- NAVIGATION BUTTONS -->
            <div class="flex items-center gap-3">
              <!-- MOVIES DROPDOWN -->
              <div class="relative">
                <button @click="handleMoviesClick"
                  class="group relative px-6 py-2 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-2xl hover:scale-105 hover:-translate-y-1 overflow-hidden">
                  <div
                    class="absolute inset-0 bg-gradient-to-r from-green-500/80 to-emerald-500/80 backdrop-blur-sm rounded-xl">
                  </div>
                  <div class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl"></div>
                  <span class="relative z-10 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                      stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0 1 18 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621-.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0 1 18 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 0 1 6 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
                    </svg>
                    Movies
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                      stroke="currentColor" class="w-4 h-4 transition-transform duration-200"
                      :class="{ 'rotate-180': moviesDropdownOpen }">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </span>
                </button>

                <NavigationDropdown :items="movieCategories" :is-open="moviesDropdownOpen" @close="closeDropdowns" />
              </div>

              <!-- TV SHOWS DROPDOWN -->
              <div class="relative">
                <button @click="handleTvClick"
                  class="group relative px-6 py-2 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-2xl hover:scale-105 hover:-translate-y-1 overflow-hidden">
                  <div
                    class="absolute inset-0 bg-gradient-to-r from-green-500/80 to-emerald-500/80 backdrop-blur-sm rounded-xl">
                  </div>
                  <div class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl"></div>
                  <span class="relative z-10 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                      stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z" />
                    </svg>
                    TV Shows
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                      stroke="currentColor" class="w-4 h-4 transition-transform duration-200"
                      :class="{ 'rotate-180': tvDropdownOpen }">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </span>
                </button>

                <NavigationDropdown :items="tvCategories" :is-open="tvDropdownOpen" @close="closeDropdowns" />
              </div>

              <NuxtLink to="/people"
                class="group relative px-6 py-2 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-2xl hover:scale-105 hover:-translate-y-1 overflow-hidden">
                <div
                  class="absolute inset-0 bg-gradient-to-r from-green-500/80 to-emerald-500/80 backdrop-blur-sm rounded-xl">
                </div>
                <div class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl"></div>
                <span class="relative z-10 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M15 19.128a9.38 9.38 0 003.9-.128 3 3 0 10-5.799 0c.617.174 1.268.287 1.949.328zM4.5 8.25a3 3 0 116 0 3 3 0 01-6 0zM14.25 8.25a3 3 0 116 0 3 3 0 01-6 0zM1.5 19.128v-.377a6.375 6.375 0 0112.75 0v.377A12.318 12.318 0 017.875 21c-2.303 0-4.465-.657-6.375-1.872z" />
                  </svg>
                  People
                </span>
              </NuxtLink>

              <!-- HEADER SEARCH -->
              <div ref="searchContainer" class="relative">
                <!-- EXPANDING SEARCH BUTTON -->
                <button @click.stop="toggleSearch"
                  class="group relative px-3.5 py-2.5 rounded-xl font-semibold text-white overflow-hidden flex items-center"
                  :class="showSearchInput ? 'w-64' : 'w-auto'"
                  style="transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1)">
                  <div
                    class="absolute inset-0 bg-gradient-to-r from-green-500/80 to-emerald-500/80 backdrop-blur-sm rounded-xl">
                  </div>
                  <div class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl"></div>

                  <!-- SEARCH ICON -->
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="w-5 h-5 relative z-10 flex-shrink-0">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>

                  <!-- SEARCH INPUT -->
                  <input v-if="showSearchInput" :value="searchQuery" @input="handleInputChange" type="text"
                    placeholder="Search..."
                    class="ml-2 w-full bg-transparent border-0 text-white placeholder:text-white/60 focus:outline-none text-sm relative z-10"
                    @click.stop @mousedown.stop @focus="handleInputFocus" @keydown="handleKeyDown" autofocus />

                  <!-- CLOSE BUTTON -->
                  <button v-if="showSearchInput" @click.stop="closeSearch" @keydown.stop
                    class="ml-2 text-white/60 hover:text-white transition-colors duration-200 relative z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                      stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </button>
              </div>
            </div>
          </div>

          <!-- USER ACTIONS -->
          <div class="flex items-center gap-2 -mr-36">
            <NuxtLink to="/favorites"
              class="group relative px-4 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-2xl hover:scale-105 hover:-translate-y-1 overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-r from-red-500/80 to-pink-500/80 backdrop-blur-sm rounded-xl">
              </div>
              <div class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl"></div>
              <span class="relative z-10 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" stroke-width="1.5"
                  stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                <span v-if="isClient && favoritesStore.totalFavorites > 0"
                  class="bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-bold">
                  {{ favoritesStore.totalFavorites }}
                </span>
              </span>
            </NuxtLink>

            <button
              class="group relative px-4 py-2 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-2xl hover:scale-105 hover:-translate-y-1 overflow-hidden">
              <div
                class="absolute inset-0 bg-gradient-to-r from-blue-500/80 to-indigo-500/80 backdrop-blur-sm rounded-xl">
              </div>
              <div class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl"></div>
              <span class="relative z-10">Login</span>
            </button>

            <button
              class="group relative px-4 py-2 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-2xl hover:scale-105 hover:-translate-y-1 overflow-hidden">
              <div
                class="absolute inset-0 bg-gradient-to-r from-purple-500/80 to-violet-500/80 backdrop-blur-sm rounded-xl">
              </div>
              <div class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl"></div>
              <span class="relative z-10">Register</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- HEADER SEARCH RESULTS -->
    <div v-if="showResults && showSearchInput"
      data-search-results
      class="fixed top-24 left-1/2 transform -translate-x-1/2 z-40 bg-gradient-to-b from-green-900/95 via-emerald-900/90 to-cyan-900/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-xl">
      <div class="w-[1000px] px-6 py-4">
        <SearchResults :show-results="showResults" :is-loading="isLoading" :search-results="searchResults"
          :get-image-url="getImageUrl" class="w-full" />
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <main class="pt-24">
      <NuxtPage />
    </main>

    <!-- SCROLL EFFECT -->
    <ClientOnly>
      <ScrollEffect />
    </ClientOnly>

    <!-- FOOTER -->
    <footer
      class="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-12 overflow-hidden">
      <!-- ANIMATED BACKGROUND -->
      <AnimatedBackground />

      <div class="relative max-w-7xl mx-auto px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- LOGO SECTION -->
          <div class="col-span-1 md:col-span-2">
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center overflow-hidden">
                <img src="/logo_mini2.png" alt="CineLonel" class="w-8 h-8 object-contain" />
              </div>
              <div>
                <h3 class="text-xl font-bold">CineLonel</h3>
                <p class="text-white/80 text-sm">THE MOVIE & SERIES DATABASE</p>
              </div>
            </div>
            <p class="text-white/80 mb-6 max-w-md">
              Discover the latest movies, TV shows, and talented people in the entertainment industry.
              Your ultimate destination for cinematic exploration.
            </p>
            <div class="flex gap-4">
              <a href="#"
                class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
                  <path
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#"
                class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
                  <path
                    d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="#"
                class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
                  <path
                    d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
                </svg>
              </a>
            </div>
          </div>

          <!-- QUICK LINKS -->
          <div>
            <h4 class="text-lg font-semibold mb-4">Quick Links</h4>
            <ul class="space-y-2">
              <li><a href="/movies" class="text-white/80 hover:text-white transition-colors duration-200">Movies</a>
              </li>
              <li><a href="/tv" class="text-white/80 hover:text-white transition-colors duration-200">TV Shows</a></li>
              <li><a href="/people" class="text-white/80 hover:text-white transition-colors duration-200">People</a>
              </li>
              <li><a href="/favorites"
                  class="text-white/80 hover:text-white transition-colors duration-200">Favorites</a></li>
            </ul>
          </div>

          <!-- SUPPORT -->
          <div>
            <h4 class="text-lg font-semibold mb-4">Support</h4>
            <ul class="space-y-2">
              <li><a href="#" class="text-white/80 hover:text-white transition-colors duration-200">Help Center</a></li>
              <li><a href="#" class="text-white/80 hover:text-white transition-colors duration-200">Contact Us</a></li>
              <li><a href="#" class="text-white/80 hover:text-white transition-colors duration-200">Privacy Policy</a>
              </li>
              <li><a href="#" class="text-white/80 hover:text-white transition-colors duration-200">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>

        <!-- BOTTOM BAR -->
        <div class="border-t border-white/20 mt-8 pt-8 text-center">
          <p class="text-white/60 text-sm mb-2">
            © 2025 CineLonel. All rights reserved. Made with ❤️ for movie lovers.
          </p>
          <p class="text-white/40 text-xs">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
            <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer"
              class="inline-flex items-center gap-1 ml-1 hover:text-white/60 transition-colors">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M18.5 0h-13C2.5 0 0 2.5 0 5.5v13C0 21.5 2.5 24 5.5 24h13c3 0 5.5-2.5 5.5-5.5v-13C24 2.5 21.5 0 18.5 0zM12 18.5c-3.6 0-6.5-2.9-6.5-6.5S8.4 5.5 12 5.5s6.5 2.9 6.5 6.5S15.6 18.5 12 18.5z" />
              </svg>
              TMDB
            </a>
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped></style>

<style></style>
