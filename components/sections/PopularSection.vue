# ===================================================
# POPULAR SECTION / POPÜLERLER BÖLÜMÜ
# ===================================================

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import PopularCard from '../cards/PopularCard.vue'
import HorizontalScroller from '../ui/HorizontalScroller.vue'
import { useTmdb } from '../composables/useTmdb'

const activeTab = ref<'movies' | 'tv' | 'people'>('movies')
const isLoading = ref(true)

const { request, getImageUrl } = useTmdb()
const popularMovies = ref<any[]>([])
const popularTvShows = ref<any[]>([])
const popularPeople = ref<any[]>([])

const currentData = computed(() => {
  switch (activeTab.value) {
    case 'movies': return popularMovies.value
    case 'tv': return popularTvShows.value
    case 'people': return popularPeople.value
    default: return []
  }
})

onMounted(async () => {
  try {
    const [m, t, p] = await Promise.all([
      request<any>('/movie/popular', { page: 1, include_adult: false }),
      request<any>('/tv/popular', { page: 1, include_adult: false }),
      request<any>('/person/popular', { page: 1 }),
    ])
    popularMovies.value = (m.results || []).slice(0, 12)
    popularTvShows.value = (t.results || []).slice(0, 12)
    popularPeople.value = (p.results || []).slice(0, 12)
  } finally {
    setTimeout(() => {
      isLoading.value = false
    }, 600)
  }
})
</script>

<template>
  <section class="relative">
    <!-- MAIN CONTENT / ANA İÇERİK -->
    <div class="container mx-auto p-8 relative z-0">
      <div class="mb-12 text-center">
        <div class="title-container">
          <h2 class="beautiful-title">
            What's Popular
          </h2>
          <div class="title-underline"></div>
          <div class="title-decoration">
            <div class="decoration-line left"></div>
            <div class="decoration-dot"></div>
            <div class="decoration-line right"></div>
          </div>
        </div>
      </div>

      <!-- TAB NAVIGATION - LEFT ALIGNED / SOL HİZALI SEKME NAVİGASYONU -->
      <div class="flex justify-start mb-10">
        <div class="inline-flex gap-2 bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-white/20">
          <button
            @click="activeTab = 'movies'"
            :class="[
              'group relative px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ease-out overflow-hidden',
              activeTab === 'movies'
                ? 'text-white shadow-lg transform scale-105'
                : 'text-gray-700 hover:text-lime-600 hover:scale-105'
            ]"
          >
            <!-- Active Background -->
            <div v-if="activeTab === 'movies'"
                 class="absolute inset-0 bg-gradient-to-r from-lime-500 to-emerald-500 rounded-xl"></div>

            <!-- Hover Background -->
            <div v-else
                 class="absolute inset-0 bg-gradient-to-r from-lime-500/20 to-emerald-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <span class="relative z-10 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0 1 18 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0 1 18 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 0 1 6 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
              </svg>
              Movies
            </span>
          </button>

          <button
            @click="activeTab = 'tv'"
            :class="[
              'group relative px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ease-out overflow-hidden',
              activeTab === 'tv'
                ? 'text-white shadow-lg transform scale-105'
                : 'text-gray-700 hover:text-lime-600 hover:scale-105'
            ]"
          >
            <div v-if="activeTab === 'tv'"
                 class="absolute inset-0 bg-gradient-to-r from-lime-500 to-emerald-500 rounded-xl"></div>
            <div v-else
                 class="absolute inset-0 bg-gradient-to-r from-lime-500/20 to-emerald-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <span class="relative z-10 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
              TV Shows
            </span>
          </button>

          <button
            @click="activeTab = 'people'"
            :class="[
              'group relative px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ease-out overflow-hidden',
              activeTab === 'people'
                ? 'text-white shadow-lg transform scale-105'
                : 'text-gray-700 hover:text-lime-600 hover:scale-105'
            ]"
          >
            <div v-if="activeTab === 'people'"
                 class="absolute inset-0 bg-gradient-to-r from-lime-500 to-emerald-500 rounded-xl"></div>
            <div v-else
                 class="absolute inset-0 bg-gradient-to-r from-lime-500/20 to-emerald-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <span class="relative z-10 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 003.9-.128 3 3 0 10-5.799 0c.617.174 1.268.287 1.949.328zM4.5 8.25a3 3 0 116 0 3 3 0 01-6 0zM14.25 8.25a3 3 0 116 0 3 3 0 01-6 0zM1.5 19.128v-.377a6.375 6.375 0 0112.75 0v.377A12.318 12.318 0 017.875 21c-2.303 0-4.465-.657-6.375-1.872z" />
              </svg>
              People
            </span>
          </button>
        </div>
      </div>

      <!-- CARDS CONTAINER / KART KONTEYNERİ -->
      <div class="cards-container">
        <!-- LOADING SKELETON / YÜKLEME İSKELETİ -->
        <div v-if="isLoading" class="animate-fade-in">
          <div class="flex gap-6 overflow-x-auto pb-4">
            <div v-for="i in 6" :key="i" class="w-64 flex-shrink-0">
              <div class="animate-pulse">
                <div class="bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl h-96 mb-4"></div>
                <div class="h-4 bg-gray-200 rounded mb-2"></div>
                <div class="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- CONTENT SECTIONS / İÇERİK BÖLÜMLERİ -->
        <div v-else>
          <!-- MOVIES SECTION / FİLMLER BÖLÜMÜ -->
          <div v-if="activeTab === 'movies'" class="animate-fade-in">
            <HorizontalScroller>
              <div v-for="(movie, index) in currentData" :key="movie.id" class="w-64 flex-shrink-0">
                <PopularCard
                  :id="movie.id"
                  :title="movie.title"
                  :release-date="movie.release_date"
                  :rating="Math.round((movie.vote_average || 0) * 10)"
                  :poster="getImageUrl(movie.poster_path, 'w500')"
                  type="movie"
                  :style="{ animationDelay: `${index * 0.05}s` }"
                />
              </div>
            </HorizontalScroller>
          </div>

          <!-- TV SHOWS SECTION / DİZİLER BÖLÜMÜ -->
          <div v-if="activeTab === 'tv'" class="animate-fade-in">
            <HorizontalScroller>
              <div v-for="(show, index) in currentData" :key="show.id" class="w-64 flex-shrink-0">
                <PopularCard
                  :id="show.id"
                  :title="show.name"
                  :release-date="show.first_air_date"
                  :rating="Math.round((show.vote_average || 0) * 10)"
                  :poster="getImageUrl(show.poster_path, 'w500')"
                  type="tv"
                  :style="{ animationDelay: `${index * 0.05}s` }"
                />
              </div>
            </HorizontalScroller>
          </div>

          <!-- PEOPLE SECTION / KİŞİLER BÖLÜMÜ -->
          <div v-if="activeTab === 'people'" class="animate-fade-in">
            <HorizontalScroller>
              <div v-for="(person, index) in currentData" :key="person.id" class="w-64 flex-shrink-0">
                <PopularCard
                  :id="person.id"
                  :title="person.name"
                  :subtitle="person.known_for_department"
                  :poster="getImageUrl(person.profile_path, 'w500')"
                  type="people"
                  :style="{ animationDelay: `${index * 0.05}s` }"
                />
              </div>
            </HorizontalScroller>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* TITLE / BAŞLIK */
.title-container {
  position: relative;
  display: inline-block;
}

.beautiful-title {
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #10b981, #059669, #16a34a);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: titleGradient 4s ease infinite;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.title-underline {
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 2px;
  margin: 0 auto 16px;
  animation: underlinePulse 3s ease-in-out infinite;
}

.title-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
}

.decoration-line {
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #10b981, transparent);
  animation: lineGlow 2s ease-in-out infinite;
}

.decoration-line.left {
  animation-delay: 0s;
}

.decoration-line.right {
  animation-delay: 1s;
}

.decoration-dot {
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  animation: dotPulse 2s ease-in-out infinite;
}

/* CARDS CONTAINER / KART KONTEYNERİ */
.cards-container {
  background: rgba(16, 185, 129, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 24px;
  padding: 32px;
  box-shadow:
    0 20px 40px -10px rgba(16, 185, 129, 0.15),
    0 8px 16px -4px rgba(16, 185, 129, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.cards-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(16, 185, 129, 0.03), transparent);
  animation: containerGlow 6s ease-in-out infinite;
  pointer-events: none;
}

/* ANIMATION KEYFRAMES / ANİMASYON ANAHTAR KARELERİ */
@keyframes titleGradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes underlinePulse {
  0%, 100% {
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
    transform: scaleX(1);
  }
  50% {
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.6);
    transform: scaleX(1.2);
  }
}

@keyframes lineGlow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

@keyframes dotPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.3);
    opacity: 1;
  }
}

@keyframes containerGlow {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

/* SUBTLE ANIMATIONS / İNCE ANİMASYONLAR */
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* RESPONSIVE / DUYARLI */
@media (max-width: 768px) {
  .beautiful-title {
    font-size: 2.5rem;
  }

  .cards-container {
    padding: 20px;
  }

  .title-decoration {
    gap: 12px;
  }

  .decoration-line {
    width: 30px;
  }
}
</style>
