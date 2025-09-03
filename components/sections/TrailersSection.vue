# ===================================================
# TRAILERS SECTION / FRAGMANLAR BÖLÜMÜ
# ===================================================

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import HorizontalScroller from '../ui/HorizontalScroller.vue'
import TrailerModal from '../modals/TrailerModal.vue'
import { useTmdb } from '../composables/useTmdb'

const router = useRouter()
const trailersActiveTab = ref<'movies' | 'tv'>('movies')
const isTrailersLoading = ref(true)
const movieTrailers = ref<any[]>([])
const tvTrailers = ref<any[]>([])

// TRAILER MODAL STATE / FRAGMAN MODAL DURUMU
const showTrailerModal = ref(false)
const selectedTrailer = ref<{ key: string; title: string } | null>(null)

const { request, getImageUrl } = useTmdb()

onMounted(async () => {
  await fetchTrailers()
})

// FETCH FIXED TRAILERS / SABİT FRAGMANLARI ÇEK
async function fetchTrailers() {
  try {
    isTrailersLoading.value = true
    
    // Get current date for filtering
    const now = new Date()
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const twoMonthsFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
    
    // Fetch data sources
    const [
      recentMoviesResponse,
      upcomingMoviesResponse,
      tvOnAirResponse
    ] = await Promise.all([
      // Recent popular movies (last month)
      request<any>('/movie/popular', { page: 1, include_adult: false }),
      // Upcoming movies (next 2 months)
      request<any>('/movie/upcoming', { page: 1, include_adult: false }),
      // On the air TV shows - first 8
      request<any>('/tv/on_the_air', { page: 1, include_adult: false })
    ])
    
    // Get recent movies (last month) - filter by date first, then take top 4 by popularity
    const recentMovies = recentMoviesResponse.results
      .filter((movie: any) => 
        movie.release_date && 
        new Date(movie.release_date) >= oneMonthAgo && 
        new Date(movie.release_date) <= now
      )
      .sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 4)
    
    // Get upcoming movies (next 2 months) - filter by date first, then take top 4 by popularity
    const upcomingMovies = upcomingMoviesResponse.results
      .filter((movie: any) => 
        movie.release_date && 
        new Date(movie.release_date) > now && 
        new Date(movie.release_date) <= twoMonthsFromNow
      )
      .sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 4)
    
    // Get TV shows - directly first 8 from on the air
    const tvShows = tvOnAirResponse.results.slice(0, 8)
    
    // Combine: 4 recent + 4 upcoming for movies
    const allMovies = [...recentMovies, ...upcomingMovies]
    
    // Get trailers for movies
    const movieTrailerPromises = allMovies.map(async (movie: any) => {
      try {
        const videoResponse = await request<any>(`/movie/${movie.id}/videos`)
        const trailer = videoResponse.results?.find((video: any) => 
          video.type === 'Trailer' && video.site === 'YouTube'
        )
        return {
          ...movie,
          trailer_key: trailer?.key || null,
          isUpcoming: movie.release_date && new Date(movie.release_date) > now
        }
      } catch (error) {
        return {
          ...movie,
          trailer_key: null,
          isUpcoming: movie.release_date && new Date(movie.release_date) > now
        }
      }
    })
    
    // Get trailers for TV shows
    const tvTrailerPromises = tvShows.map(async (show: any) => {
      try {
        const videoResponse = await request<any>(`/tv/${show.id}/videos`)
        const trailer = videoResponse.results?.find((video: any) => 
          video.type === 'Trailer' && video.site === 'YouTube'
        )
        return {
          ...show,
          trailer_key: trailer?.key || null,
          isUpcoming: show.first_air_date && new Date(show.first_air_date) > now
        }
      } catch (error) {
        return {
          ...show,
          trailer_key: null,
          isUpcoming: show.first_air_date && new Date(show.first_air_date) > now
        }
      }
    })
    
    const [movieResults, tvResults] = await Promise.all([
      Promise.all(movieTrailerPromises),
      Promise.all(tvTrailerPromises)
    ])
    
    // Set results
    movieTrailers.value = movieResults.filter(item => item.trailer_key)
    tvTrailers.value = tvResults.filter(item => item.trailer_key)
    
      } catch (error) {
      // Trailers fetch error - ignore
    } finally {
    isTrailersLoading.value = false
  }
}

// PLAY TRAILER / FRAGMAN OYNAT
const playTrailer = (trailerKey: string, title: string) => {
  selectedTrailer.value = { key: trailerKey, title }
  showTrailerModal.value = true
}

// CLOSE TRAILER MODAL / FRAGMAN MODALINI KAPAT
const closeTrailerModal = () => {
  showTrailerModal.value = false
  selectedTrailer.value = null
}

// NAVIGATE TO DETAIL PAGE / DETAY SAYFASINA YÖNLENDİR
const navigateToDetail = (item: any, type: 'movie' | 'tv') => {
  if (type === 'movie') {
    router.push(`/movies/${item.id}`)
  } else {
    router.push(`/tv/${item.id}`)
  }
}
</script>

<template>
  <section class="relative py-12">
    <div class="container mx-auto px-8 relative z-0">
      <div class="mb-8 text-left">
        <div class="title-container">
          <h2 class="simple-title">
            Latest Trailers
          </h2>
        </div>
      </div>

      <!-- TRAILERS TAB NAVIGATION / FRAGMANLAR SEKME NAVİGASYONU -->
      <div class="flex justify-start mb-10">
        <div class="inline-flex gap-2 bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-white/20">
          <button
            @click="trailersActiveTab = 'movies'"
            :class="[
              'group relative px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ease-out overflow-hidden',
              trailersActiveTab === 'movies'
                ? 'text-white shadow-lg transform scale-105'
                : 'text-gray-700 hover:text-blue-600 hover:scale-105'
            ]"
          >
            <!-- Active Background -->
            <div v-if="trailersActiveTab === 'movies'"
                 class="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl"></div>

            <!-- Hover Background -->
            <div v-else
                 class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <span class="relative z-10 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0 1 18 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0 1 18 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 0 1 6 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
              </svg>
              Movies
            </span>
          </button>

          <button
            @click="trailersActiveTab = 'tv'"
            :class="[
              'group relative px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ease-out overflow-hidden',
              trailersActiveTab === 'tv'
                ? 'text-white shadow-lg transform scale-105'
                : 'text-gray-700 hover:text-blue-600 hover:scale-105'
            ]"
          >
            <div v-if="trailersActiveTab === 'tv'"
                 class="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl"></div>
            <div v-else
                 class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <span class="relative z-10 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
              TV Shows
            </span>
          </button>
        </div>
      </div>

      <!-- TRAILERS CARDS CONTAINER / FRAGMANLAR KART KONTEYNERİ -->
      <div class="cards-container trailers-container">
        <!-- LOADING SKELETON / YÜKLEME İSKELETİ -->
        <div v-if="isTrailersLoading" class="animate-fade-in">
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

        <!-- TRAILERS CONTENT / FRAGMANLAR İÇERİĞİ -->
        <div v-else>
                     <!-- MOVIES TRAILERS / FİLM FRAGMANLARI -->
           <div v-if="trailersActiveTab === 'movies'" class="animate-fade-in">
             <HorizontalScroller theme="blue">
               <div v-for="(movie, index) in movieTrailers" :key="movie.id" class="w-64 flex-shrink-0">
                 <div class="trailer-card cursor-pointer" @click="navigateToDetail(movie, 'movie')">
                   <div class="trailer-image-container">
                     <img 
                       :src="getImageUrl(movie.backdrop_path, 'w500')" 
                       :alt="movie.title"
                       class="trailer-image"
                     />
                     <div class="play-overlay">
                       <button 
                         @click.stop="playTrailer(movie.trailer_key, movie.title)"
                         class="play-button"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="play-icon">
                           <path d="M8 5v14l11-7z"/>
                         </svg>
                       </button>
                     </div>
                   </div>
                   <div class="trailer-info">
                     <h3 class="trailer-title">{{ movie.title }}</h3>
                     <p class="trailer-description">
                       <span v-if="movie.isUpcoming" class="upcoming-badge">Coming Soon</span>
                       <span v-else>{{ movie.release_date ? new Date(movie.release_date).getFullYear() : 'Now Playing' }}</span>
                     </p>
                   </div>
                 </div>
               </div>
             </HorizontalScroller>
           </div>

                     <!-- TV SHOWS TRAILERS / DİZİ FRAGMANLARI -->
           <div v-if="trailersActiveTab === 'tv'" class="animate-fade-in">
             <HorizontalScroller theme="blue">
               <div v-for="(show, index) in tvTrailers" :key="show.id" class="w-64 flex-shrink-0">
                 <div class="trailer-card cursor-pointer" @click="navigateToDetail(show, 'tv')">
                   <div class="trailer-image-container">
                     <img 
                       :src="getImageUrl(show.backdrop_path, 'w500')" 
                       :alt="show.name"
                       class="trailer-image"
                     />
                     <div class="play-overlay">
                       <button 
                         @click.stop="playTrailer(show.trailer_key, show.name)"
                         class="play-button"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="play-icon">
                           <path d="M8 5v14l11-7z"/>
                         </svg>
                       </button>
                     </div>
                   </div>
                   <div class="trailer-info">
                     <h3 class="trailer-title">{{ show.name }}</h3>
                     <p class="trailer-description">
                       <span v-if="show.isUpcoming" class="upcoming-badge">Coming Soon</span>
                       <span v-else>{{ show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'Now Airing' }}</span>
                     </p>
                   </div>
                 </div>
               </div>
             </HorizontalScroller>
           </div>
        </div>
      </div>
    </div>
  </section>

  <!-- TRAILER MODAL / FRAGMAN MODALI -->
  <TrailerModal
    :is-open="showTrailerModal"
    :trailer-key="selectedTrailer?.key || null"
    :title="selectedTrailer?.title || ''"
    @close="closeTrailerModal"
  />
</template>

<style scoped>
/* TITLE / BAŞLIK */
.title-container {
  position: relative;
  display: inline-block;
}

.simple-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #3b82f6;
  margin: 0;
  letter-spacing: -0.01em;
  position: relative;
}

.simple-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #06b6d4);
  border-radius: 2px;
}

/* CARDS CONTAINER / KART KONTEYNERİ */
.cards-container {
  background: rgba(59, 130, 246, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 24px;
  padding: 24px;
  box-shadow:
    0 20px 40px -10px rgba(59, 130, 246, 0.15),
    0 8px 16px -4px rgba(59, 130, 246, 0.1),
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
  background: linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.03), transparent);
  animation: containerGlow 6s ease-in-out infinite;
  pointer-events: none;
}

/* TRAILER CARD / FRAGMAN KARTI */
.trailer-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.trailer-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.trailer-image-container {
  position: relative;
  aspect-ratio: 16/9;
  overflow: hidden;
}

.trailer-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.trailer-card:hover .trailer-image {
  transform: scale(1.05);
}

.play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.trailer-card:hover .play-overlay {
  opacity: 1;
}

.play-button {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.play-button:hover {
  background: white;
  transform: scale(1.1);
}

.play-icon {
  width: 32px;
  height: 32px;
  color: #3b82f6;
  margin-left: 4px;
}

.trailer-info {
  padding: 20px;
}

.trailer-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
  line-height: 1.3;
}

.trailer-description {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0;
}

.upcoming-badge {
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ANIMATION KEYFRAMES / ANİMASYON ANAHTAR KARELERİ */
@keyframes titleGradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes underlinePulse {
  0%, 100% {
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
    transform: scaleX(1);
  }
  50% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
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

  .play-button {
    width: 60px;
    height: 60px;
  }

  .play-icon {
    width: 24px;
    height: 24px;
  }
}
</style>
