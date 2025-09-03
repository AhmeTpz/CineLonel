# ===================================================
# FAVORITES PAGE / FAVORİLER SAYFASI
# ===================================================

<script setup lang="ts">
import { useFavoritesStore } from '../stores/favorites'
import { useTmdb } from '../composables/useTmdb'
import PopularCard from '../components/cards/PopularCard.vue'
import PageLayout from '../components/layout/PageLayout.vue'
import HeroSection from '../components/layout/HeroSection.vue'

const favoritesStore = useFavoritesStore()
const { getImageUrl } = useTmdb()
</script>

<template>
  <PageLayout>
    <HeroSection
      title="Favorites"
      subtitle="Your beloved movies and TV shows collection"
      gradient-class="bg-gradient-to-r from-pink-600 via-rose-600 to-red-600"
      title-gradient-class="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent"
      :stats="[
        { value: favoritesStore.totalFavorites, label: 'Total' },
        { value: favoritesStore.favoriteMovies.length, label: 'Movies' },
        { value: favoritesStore.favoriteTVShows.length, label: 'TV Shows' }
      ]"
    />

    <!-- Favorites Content Section -->
    <section class="content-section container mx-auto p-4 mt-0 relative z-20">
      <!-- Empty State -->
      <div v-if="favoritesStore.totalFavorites === 0" class="text-center py-20">
        <div class="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl max-w-md mx-auto">
          <div class="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8 text-white">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">No Favorites Yet</h3>
          <p class="text-gray-600">Start adding movies and TV shows to your favorites!</p>
        </div>
      </div>

      <!-- Favorites Content -->
      <div v-else class="space-y-8">
        <!-- Movies Section -->
        <div v-if="favoritesStore.favoriteMovies.length > 0" class="space-y-4">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0 1 18 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0 1 18 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 0 1 6 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-800">Favorite Movies</h2>
            <span class="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">{{ favoritesStore.favoriteMovies.length }}</span>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <div v-for="(movie, index) in favoritesStore.favoriteMovies" :key="`movie-${movie.id}`"
                 class="animate-fade-in-up"
                 :style="`animation-delay: ${index * 0.1}s;`">
              <PopularCard
                :id="movie.id"
                :title="movie.title"
                :release-date="movie.release_date"
                :rating="Math.round((movie.vote_average || 0) * 10)"
                :poster="getImageUrl(movie.poster_path, 'w500')"
                type="movie"
              />
            </div>
          </div>
        </div>

        <!-- TV Shows Section -->
        <div v-if="favoritesStore.favoriteTVShows.length > 0" class="space-y-4">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-800">Favorite TV Shows</h2>
            <span class="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">{{ favoritesStore.favoriteTVShows.length }}</span>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <div v-for="(show, index) in favoritesStore.favoriteTVShows" :key="`tv-${show.id}`"
                 class="animate-fade-in-up"
                 :style="`animation-delay: ${index * 0.1}s;`">
              <PopularCard
                :id="show.id"
                :title="show.title"
                :release-date="show.first_air_date"
                :rating="Math.round((show.vote_average || 0) * 10)"
                :poster="getImageUrl(show.poster_path, 'w500')"
                type="tv"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </PageLayout>
</template>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}
</style>
