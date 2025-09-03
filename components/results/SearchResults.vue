# ===================================================
# SEARCH RESULTS / ARAMA SONUÇLARI
# ===================================================

<script setup lang="ts">
import PopularCard from '../cards/PopularCard.vue'

interface Props {
  showResults: boolean
  isLoading: boolean
  searchResults: {
    movies: any[]
    tvShows: any[]
    people: any[]
  }
  getImageUrl: (path: string | null | undefined, size?: 'w185' | 'w342' | 'w500' | 'original') => string
}

const props = defineProps<Props>()

const handleFavoriteClick = (event: Event) => {
  event.stopPropagation()
}
</script>

<template>
  <div
    v-if="showResults && (searchResults.movies.length > 0 || searchResults.tvShows.length > 0 || searchResults.people.length > 0)"
    class="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-lime-200/50 max-h-[800px] overflow-y-auto z-[60] mt-2 group"
    @click="handleFavoriteClick"
  >
    <!-- ANIMATED HEADER / ANİMASYONLU BAŞLIK -->
    <div class="sticky top-0 bg-gradient-to-r from-lime-500/10 to-emerald-500/10 backdrop-blur-xl border-b border-lime-200/30 p-4">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-gradient-to-r from-lime-500 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <h3 class="text-lg font-bold bg-gradient-to-r from-lime-600 to-emerald-600 bg-clip-text text-transparent">
          Search Results ({{ searchResults.movies.length + searchResults.tvShows.length + searchResults.people.length }})
        </h3>
      </div>
    </div>

    <!-- RESULTS CONTAINER WITH GLASS EFFECT / CAM ETKİLİ SONUÇ KONTEYNERİ -->
    <div class="p-4 space-y-6">
      <!-- MOVIES SECTION / FİLMLER BÖLÜMÜ -->
      <div v-if="searchResults.movies.length > 0" class="space-y-3">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 text-white">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0 1 18 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0 1 18 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 0 1 6 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
            </svg>
          </div>
          <h4 class="text-lg font-semibold text-gray-800">Movies</h4>
          <span class="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">{{ searchResults.movies.length }}</span>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          <PopularCard
            v-for="movie in searchResults.movies"
            :key="movie.id"
            :id="movie.id"
            :title="movie.title"
            :release-date="movie.release_date"
            :rating="Math.round((movie.vote_average || 0) * 10)"
            :poster="getImageUrl(movie.poster_path, 'w500')"
            type="movie"
          />
        </div>
      </div>

      <!-- TV SHOWS SECTION / DİZİLER BÖLÜMÜ -->
      <div v-if="searchResults.tvShows.length > 0" class="space-y-3">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 text-white">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
          </div>
          <h4 class="text-lg font-semibold text-gray-800">TV Shows</h4>
          <span class="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">{{ searchResults.tvShows.length }}</span>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          <PopularCard
            v-for="show in searchResults.tvShows"
            :key="show.id"
            :id="show.id"
            :title="show.name"
            :release-date="show.first_air_date"
            :rating="Math.round((show.vote_average || 0) * 10)"
            :poster="getImageUrl(show.poster_path, 'w500')"
            type="tv"
          />
        </div>
      </div>

      <!-- PEOPLE SECTION / KİŞİLER BÖLÜMÜ -->
      <div v-if="searchResults.people.length > 0" class="space-y-3">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-6 h-6 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 text-white">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 003.9-.128 3 3 0 10-5.799 0c.617.174 1.268.287 1.949.328zM4.5 8.25a3 3 0 116 0 3 3 0 01-6 0zM14.25 8.25a3 3 0 116 0 3 3 0 01-6 0zM1.5 19.128v-.377a6.375 6.375 0 0112.75 0v.377A12.318 12.318 0 017.875 21c-2.303 0-4.465-.657-6.375-1.872z" />
            </svg>
          </div>
          <h4 class="text-lg font-semibold text-gray-800">People</h4>
          <span class="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">{{ searchResults.people.length }}</span>
        </div>
        <div class="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          <PopularCard
            v-for="person in searchResults.people"
            :key="person.id"
            :id="person.id"
            :title="person.name"
            :subtitle="person.known_for_department"
            :poster="getImageUrl(person.profile_path, 'w500')"
            type="people"
          />
        </div>
      </div>
    </div>

    <!-- ANIMATED FOOTER / ANİMASYONLU ALT BİLGİ -->
    <div class="sticky bottom-0 bg-gradient-to-r from-lime-500/10 to-emerald-500/10 backdrop-blur-xl border-t border-lime-200/30 p-3">
      <div class="flex items-center justify-center gap-2 text-sm text-gray-600">
        <div class="w-2 h-2 bg-lime-500 rounded-full animate-pulse"></div>
        <span>Click outside to close</span>
        <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" style="animation-delay: 0.5s;"></div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
