<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTmdb } from '../../composables/useTmdb'
import { useFavoritesStore } from '../../stores/favorites'
import TrailerModal from '../../components/modals/TrailerModal.vue'
import AnimatedBackground from '../../components/layout/AnimatedBackground.vue'
import BackdropHeader from '../../components/layout/BackdropHeader.vue'
import ProviderLogos from '../../components/layout/ProviderLogos.vue'
import CastCrewSection from '../../components/sections/CastCrewSection.vue'
import ProductionCompanies from '../../components/sections/ProductionCompanies.vue'
import KeywordsSection from '../../components/sections/KeywordsSection.vue'
import UserScoreSection from '../../components/sections/UserScoreSection.vue'

const route = useRoute()
const router = useRouter()
const { request, getImageUrl } = useTmdb()
const favoritesStore = useFavoritesStore()

interface Movie {
  id: number
  title: string
  original_title: string
  overview: string
  release_date: string
  runtime: number
  vote_average: number
  vote_count: number
  poster_path: string
  backdrop_path: string
  genres: Array<{ id: number; name: string }>
  production_companies: Array<{ id: number; name: string; logo_path: string | null }>
  status: string
  original_language: string
  budget: number
  revenue: number
  tagline: string
  adult?: boolean
  certification?: string
}

interface Keyword {
  id: number
  name: string
}

interface Video {
  key: string
  site: string
  size: number
  type: string
  official: boolean
  published_at: string
  id: string
}

interface Cast {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

interface Crew {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

interface Provider {
  provider_id: number
  provider_name: string
  logo_path: string
  display_priority: number
}

const movie = ref<Movie | null>(null)
const cast = ref<Cast[]>([])
const allCast = ref<Cast[]>([])
const allCrew = ref<Crew[]>([])
const providers = ref<{ flatrate?: Provider[]; rent?: Provider[]; buy?: Provider[]; ads?: Provider[]; free?: Provider[] }>({})
const keywords = ref<Keyword[]>([])
const videos = ref<Video[]>([])
const isLoading = ref(true)
const isProvidersLoading = ref(true)

const showTrailerModal = ref(false)
const selectedVideo = ref<Video | null>(null)
const showCastCrewModal = ref(false)

const movieId = computed(() => Number(route.params.id))

// Runtime formatı
const formatRuntime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

// Para formatı
const formatMoney = (amount: number) => {
  if (amount === 0) return 'Unknown'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Tarih formatı
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Vote average formatı


// Favori işlemleri
const toggleFavorite = () => {
  if (!movie.value) return
  
  const favoriteItem = {
    id: movie.value.id,
    title: movie.value.title,
    poster_path: movie.value.poster_path,
    type: 'movie' as const,
    vote_average: movie.value.vote_average,
    release_date: movie.value.release_date
  }
  
  favoritesStore.toggleFavorite(favoriteItem)
}

// Trailer işlemleri
const playTrailer = () => {
  const trailer = videos.value.find(video => video.type === 'Trailer' && video.site === 'YouTube')
  if (trailer) {
    selectedVideo.value = trailer
    showTrailerModal.value = true
  }
}

const closeTrailerModal = () => {
  showTrailerModal.value = false
  selectedVideo.value = null
}

const openCastCrewModal = () => {
  showCastCrewModal.value = true
}

const closeCastCrewModal = () => {
  showCastCrewModal.value = false
}

// Crew'ları departmanlara göre grupla
const groupedCrew = computed(() => {
  const groups: Record<string, Crew[]> = {}
  if (allCrew.value) {
    allCrew.value.forEach(crew => {
      if (!groups[crew.department]) {
        groups[crew.department] = []
      }
      groups[crew.department].push(crew)
    })
  }
  return groups
})

// Film verilerini yükle
async function fetchMovieDetails() {
  try {
    isLoading.value = true
    
    // Film detayları
    const movieResponse = await request<Movie>(`/movie/${movieId.value}`)
    movie.value = movieResponse
    
    // Oyuncular ve Crew
          try {
        const creditsResponse = await request<any>(`/movie/${movieId.value}/credits`, {
          language: 'en-US'
        })
        
        if (creditsResponse && creditsResponse.cast) {
          allCast.value = creditsResponse.cast
          cast.value = allCast.value.slice(0, 10)
        } else {
          allCast.value = []
          cast.value = []
        }
        
        if (creditsResponse && creditsResponse.crew) {
          allCrew.value = creditsResponse.crew
        } else {
          allCrew.value = []
        }
      } catch (error) {
        allCast.value = []
        allCrew.value = []
        cast.value = []
      }
    
    // Provider'lar
    const providersResponse = await request<{ results: { US: any } }>(`/movie/${movieId.value}/watch/providers`)
    providers.value = providersResponse.results?.US || {}
    
    // Keywords
    const keywordsResponse = await request<{ keywords: Keyword[] }>(`/movie/${movieId.value}/keywords`)
    keywords.value = keywordsResponse.keywords || []
    
    // Videos/Trailers
    const videosResponse = await request<{ results: Video[] }>(`/movie/${movieId.value}/videos`)
    videos.value = videosResponse.results || []
    
  } catch (error) {
    router.push('/movies')
  } finally {
    isLoading.value = false
    isProvidersLoading.value = false
  }
}

onMounted(() => {
  fetchMovieDetails()
})
</script>

<template>
  <div v-if="isLoading" class="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 flex items-center justify-center">
    <div class="relative">
      <div class="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600"></div>
      <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-400 animate-ping"></div>
    </div>
  </div>

  <div v-else-if="movie" class="min-h-screen relative overflow-hidden">
    <AnimatedBackground />

          <BackdropHeader :backdrop-path="movie.backdrop_path" />

    <!-- Content -->
    <div class="relative -mt-32 px-4 sm:px-6 lg:px-8 pb-8">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col lg:flex-row gap-8">
          
          <!-- Left Column - Poster & Providers -->
          <div class="lg:w-80 flex-shrink-0">
            <!-- Poster -->
            <div class="relative group">
              <img 
                :src="movie.poster_path ? getImageUrl(movie.poster_path, 'w500') : '/no-photo.png'" 
                :alt="movie.title"
                class="w-full rounded-2xl shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-emerald-500/25"
              />
              
              <!-- Favorite Button -->
              <button 
                @click="toggleFavorite"
                class="absolute top-3 right-3 bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white p-2.5 rounded-xl transition-all duration-300 hover:scale-110 border border-white/20"
                :class="{ 'text-yellow-400 bg-yellow-400/20': favoritesStore.isFavorite(movie.id, 'movie') }"
              >
                <svg v-if="favoritesStore.isFavorite(movie.id, 'movie')" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                  <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </button>
            </div>

            <ProviderLogos 
              :providers="providers"
              :is-loading="isProvidersLoading"
            />

            <KeywordsSection :keywords="keywords" />
          </div>

          <!-- Right Column - Movie Info -->
          <div class="flex-1">
            <!-- Title & Basic Info -->
            <div class="mb-8">
                             <div class="min-h-[120px] flex flex-col justify-center">
                 <h1 class="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight line-clamp-2">
                   {{ movie.title }}
                   <span class="text-gray-300 font-normal">({{ new Date(movie.release_date).getFullYear() }})</span>
                 </h1>
                 <p v-if="movie.original_title !== movie.title" class="text-white text-base mb-6 italic line-clamp-1">{{ movie.original_title }}</p>
               </div>
               
                              <div class="flex flex-wrap items-center gap-4 text-gray-600 mb-6" style="margin-top: 1rem;">
                 <span class="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">Released</span>
                 <span v-if="movie.adult === false" class="text-gray-600">PG-13</span>
                 <span v-else-if="movie.adult === true" class="text-gray-600">R</span>
                 <span class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  {{ formatDate(movie.release_date) }}
                </span>
                <span v-if="movie.runtime" class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ formatRuntime(movie.runtime) }}
                </span>
                <span class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.732.998 2.732.998s2.033-.299 2.732-.998l4.318-4.318c.699-.699.998-1.732.998-2.732s-.299-2.033-.998-2.732L13.159 3.659A2.25 2.25 0 0011.568 3H9.568z" />
                  </svg>
                  {{ movie.genres.map(g => g.name).join(', ') }}
                </span>
              </div>

                      <UserScoreSection 
          :vote-average="movie.vote_average"
          :vote-count="movie.vote_count"
          :has-trailers="videos.length > 0"
          :play-trailer="playTrailer"
        />
            </div>

            <!-- Tagline -->
            <div v-if="movie.tagline" class="mb-8">
              <p class="text-emerald-700 italic text-xl font-medium">"{{ movie.tagline }}"</p>
            </div>

            <!-- Overview -->
            <div class="mb-10">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div class="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                Overview
              </h2>
              <p class="text-gray-700 leading-relaxed text-lg">{{ movie.overview }}</p>
            </div>

                    <CastCrewSection 
          :cast="cast"
          :open-cast-crew-modal="openCastCrewModal"
        />

            <!-- Additional Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h3 class="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <div class="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 text-white">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                  </div>
                  Additional Information
                </h3>
                <div class="space-y-3 text-gray-700">
                  <div class="flex justify-between items-center py-2 border-b border-gray-200">
                    <span class="font-semibold">Status:</span>
                    <span class="text-emerald-600">{{ movie.status }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-gray-200">
                    <span class="font-semibold">Original Language:</span>
                    <span class="text-emerald-600">{{ movie.original_language.toUpperCase() }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-gray-200">
                    <span class="font-semibold">Budget:</span>
                    <span class="text-emerald-600">{{ formatMoney(movie.budget) }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2">
                    <span class="font-semibold">Revenue:</span>
                    <span class="text-emerald-600">{{ formatMoney(movie.revenue) }}</span>
                  </div>
                </div>
              </div>

                      <ProductionCompanies 
          :companies="movie.production_companies"
          title="Production Companies"
        />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Trailer Modal -->
  <TrailerModal
    :is-open="showTrailerModal"
    :trailer-key="selectedVideo?.key || null"
    :title="movie?.title || ''"
    @close="closeTrailerModal"
  />

       <!-- Cast & Crew Modal -->
     <div v-if="showCastCrewModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
       <div class="relative w-full max-w-6xl mx-4 bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
         <!-- Header -->
         <div class="flex items-center justify-between p-6 border-b border-gray-200">
           <h2 class="text-2xl font-bold text-gray-900">Cast & Crew</h2>
           <button 
             @click="closeCastCrewModal"
             class="text-gray-500 hover:text-gray-700 transition-colors duration-300"
           >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
               <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
         </div>
         
         <!-- Content -->
         <div class="flex h-[calc(90vh-120px)]">
           <!-- Cast Section -->
           <div class="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
             <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 003.9-.128 3 3 0 10-5.799 0c.617.174 1.268.287 1.949.328zM4.5 8.25a3 3 0 116 0 3 3 0 01-6 0zM14.25 8.25a3 3 0 116 0 3 3 0 01-6 0zM1.5 19.128v-.377a6.375 6.375 0 0112.75 0v.377A12.318 12.318 0 017.875 21c-2.303 0-4.465-.657-6.375-1.872z" />
               </svg>
               Movie Cast {{ allCast.length }}
             </h3>
             <div class="space-y-3">
                                <div 
                   v-for="person in allCast" 
                   :key="person.id"
                   class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300 cursor-pointer"
                   @click="router.push(`/people/${person.id}`)"
                 >
                   <img 
                     :src="person.profile_path ? getImageUrl(person.profile_path, 'w92') : '/no-photo.png'" 
                     :alt="person.name"
                     class="w-12 h-12 rounded-lg object-cover"
                   />
                   <div class="flex-1">
                     <div class="text-gray-900 font-semibold text-sm">{{ person.name }}</div>
                     <div class="text-gray-600 text-xs">{{ person.character }}</div>
                   </div>
                 </div>
             </div>
           </div>

           <!-- Crew Section -->
           <div class="w-1/2 p-6 overflow-y-auto">
             <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
               </svg>
               Movie Crew {{ allCrew.length }}
             </h3>
             <div class="space-y-6">
               <div v-for="(departmentCrew, department) in groupedCrew" :key="department" class="space-y-3">
                 <h4 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">{{ department }}</h4>
                 <div class="space-y-2">
                   <div 
                     v-for="crewMember in departmentCrew" 
                     :key="crewMember.id"
                     class="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                   >
                     <img 
                       :src="crewMember.profile_path ? getImageUrl(crewMember.profile_path, 'w92') : '/no-photo.png'" 
                       :alt="crewMember.name"
                       class="w-10 h-10 rounded-lg object-cover"
                     />
                     <div class="flex-1">
                       <div class="text-gray-900 font-semibold text-sm">{{ crewMember.name }}</div>
                       <div class="text-gray-600 text-xs">{{ crewMember.job }}</div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>
     </div>
</template>


