<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTmdb } from '../../composables/useTmdb'
import { useFavoritesStore } from '../../stores/favorites'
import TrailerModal from '../../components/modals/TrailerModal.vue'

const route = useRoute()
const router = useRouter()
const { request, getImageUrl } = useTmdb()
const favoritesStore = useFavoritesStore()

interface TvShow {
  id: number
  name: string
  original_name: string
  overview: string
  first_air_date: string
  last_air_date: string
  episode_run_time: number[]
  vote_average: number
  vote_count: number
  poster_path: string
  backdrop_path: string
  genres: Array<{ id: number; name: string }>
  production_companies: Array<{ id: number; name: string; logo_path: string | null }>
  status: string
  original_language: string
  number_of_seasons: number
  number_of_episodes: number
  tagline: string
  networks: Array<{ id: number; name: string; logo_path: string | null }>
  adult?: boolean
  certification?: string
  seasons?: Array<{
    id: number
    name: string
    overview: string
    air_date: string
    episode_count: number
    season_number: number
    poster_path: string | null
    vote_average?: number
  }>
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

const show = ref<TvShow | null>(null)
const cast = ref<Cast[]>([])
const allCast = ref<Cast[]>([])
const allCrew = ref<Crew[]>([])
const providers = ref<{ flatrate?: Provider[]; rent?: Provider[]; buy?: Provider[]; ads?: Provider[]; free?: Provider[] }>({})
const keywords = ref<Keyword[]>([])
const videos = ref<Video[]>([])
const isLoading = ref(true)
const isProvidersLoading = ref(true)
const showAllProviders = ref(false)
const showTrailerModal = ref(false)
const selectedVideo = ref<Video | null>(null)
const showSeasonsModal = ref(false)
const showCastCrewModal = ref(false)

const showId = computed(() => Number(route.params.id))

const formatRuntime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatVoteAverage = (vote: number) => {
  return Math.round(vote * 10)
}

const toggleFavorite = () => {
  if (!show.value) return
  
  const favoriteItem = {
    id: show.value.id,
    title: show.value.name,
    poster_path: show.value.poster_path,
    type: 'tv' as const,
    vote_average: show.value.vote_average,
    first_air_date: show.value.first_air_date
  }
  
  favoritesStore.toggleFavorite(favoriteItem)
}

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

const openSeasonsModal = () => {
  showSeasonsModal.value = true
}

const closeSeasonsModal = () => {
  showSeasonsModal.value = false
}

const openCastCrewModal = () => {
  showCastCrewModal.value = true
}

const closeCastCrewModal = () => {
  showCastCrewModal.value = false
}

const groupedCrew = computed(() => {
  const groups: Record<string, Crew[]> = {}
  if (allCrew.value) {
    allCrew.value.forEach(crew => {
      const department = crew.department || 'Unknown'
      if (!groups[department]) {
        groups[department] = []
      }
      groups[department].push(crew)
    })
  }
  return groups
})

async function fetchShowDetails() {
  try {
    isLoading.value = true
    
    const showResponse = await request<TvShow>(`/tv/${showId.value}`)
    show.value = showResponse
    
    try {
      let creditsResponse;
      let isAggregate = false;
      try {
        creditsResponse = await request<any>(`/tv/${showId.value}/aggregate_credits`, {
          language: 'en-US'
        })
        isAggregate = true;
      } catch (aggregateError) {
        creditsResponse = await request<any>(`/tv/${showId.value}/credits`, {
          language: 'en-US'
        })
        isAggregate = false;
      }
      
      if (creditsResponse && creditsResponse.cast) {
        if (creditsResponse.cast[0]?.roles) {
          allCast.value = creditsResponse.cast.map((person: any) => ({
            id: person.id,
            name: person.name,
            character: person.roles?.[0]?.character || 'Unknown',
            profile_path: person.profile_path,
            order: person.order || 0
          }))
        } else {
          allCast.value = creditsResponse.cast
        }
        cast.value = allCast.value.slice(0, 10)
      } else {
        allCast.value = []
        cast.value = []
      }
      
      if (creditsResponse && creditsResponse.crew) {
        if (isAggregate) {
          allCrew.value = creditsResponse.crew.flatMap((person: any) => {
            if (person.jobs && person.jobs.length > 0) {
              return person.jobs.map((job: any) => ({
                id: person.id,
                name: person.name,
                job: job.job || 'Unknown',
                department: job.department || 'Unknown',
                profile_path: person.profile_path
              }))
            } else {
              return [{
                id: person.id,
                name: person.name,
                job: person.job || 'Unknown',
                department: person.department || 'Unknown',
                profile_path: person.profile_path
              }]
            }
          })
          
          allCrew.value = allCrew.value.map(crew => {
            const job = crew.job.toLowerCase();
            let department = crew.department;
            
            if (job.includes('director') || job.includes('directing')) {
              department = 'Directing';
            } else if (job.includes('producer') || job.includes('production')) {
              department = 'Production';
            } else if (job.includes('writer') || job.includes('writing')) {
              department = 'Writing';
            } else if (job.includes('camera') || job.includes('cinematography') || job.includes('photography')) {
              department = 'Camera';
            } else if (job.includes('art') || job.includes('design')) {
              department = 'Art';
            } else if (job.includes('costume') || job.includes('makeup') || job.includes('make-up')) {
              department = 'Costume & Make-Up';
            } else if (job.includes('music') || job.includes('sound')) {
              department = 'Sound';
            } else if (job.includes('editor') || job.includes('editing')) {
              department = 'Editing';
            } else if (job.includes('stunt')) {
              department = 'Stunts';
            } else {
              department = 'Crew';
            }
            
            return { ...crew, department };
          });
        } else {
          allCrew.value = creditsResponse.crew
        }
      } else {
        allCrew.value = []
      }
    } catch (error) {
      allCast.value = []
      allCrew.value = []
      cast.value = []
    }
    
    const providersResponse = await request<{ results: { US: any } }>(`/tv/${showId.value}/watch/providers`)
    providers.value = providersResponse.results?.US || {}
    
    const keywordsResponse = await request<{ results: Keyword[] }>(`/tv/${showId.value}/keywords`)
    keywords.value = keywordsResponse.results || []
    
    const videosResponse = await request<{ results: Video[] }>(`/tv/${showId.value}/videos`)
    videos.value = videosResponse.results || []
    
    const seasonsResponse = await request<{ seasons: any[] }>(`/tv/${showId.value}`)
    if (seasonsResponse.seasons) {
      show.value.seasons = seasonsResponse.seasons
    }
    
  } catch (error) {
    router.push('/tv')
  } finally {
    isLoading.value = false
    isProvidersLoading.value = false
  }
}

onMounted(() => {
  fetchShowDetails()
})
</script>

<template>
  <div v-if="isLoading" class="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 flex items-center justify-center">
    <div class="relative">
      <div class="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600"></div>
      <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-400 animate-ping"></div>
    </div>
  </div>

  <div v-else-if="show" class="min-h-screen relative overflow-hidden">
    <!-- Animated Background -->
    <div class="absolute inset-0">
      <!-- Animated Green Pattern -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute inset-0" style="background-image:
          radial-gradient(circle at 25% 25%, #10b981 2px, transparent 2px),
          radial-gradient(circle at 75% 75%, #059669 2px, transparent 2px),
          radial-gradient(circle at 50% 50%, #16a34a 1px, transparent 1px);
          background-size: 60px 60px, 80px 80px, 40px 40px;
          animation: patternMove 20s linear infinite;"></div>
      </div>

      <!-- Gradient Orbs -->
      <div class="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-emerald-200/20 to-green-200/20 rounded-full blur-3xl animate-float"></div>
      <div class="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-lime-200/15 to-emerald-200/15 rounded-full blur-3xl animate-float-delayed"></div>
      <div class="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-green-200/10 to-teal-200/10 rounded-full blur-3xl animate-float-slow"></div>
    </div>

    <!-- Backdrop Image -->
    <div class="relative h-96 overflow-hidden">
      <div 
        class="absolute inset-0 bg-cover bg-center"
        :style="`background-image: url(${getImageUrl(show.backdrop_path, 'w1280')})`"
      ></div>
      <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-emerald-900/30"></div>
      
      <!-- Back Button -->
      <button 
        @click="router.back()"
        class="absolute top-6 left-6 z-10 group bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white p-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 group-hover:scale-110 transition-transform duration-300">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
      </button>
    </div>

    <!-- Content -->
    <div class="relative -mt-32 px-4 sm:px-6 lg:px-8 pb-8">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col lg:flex-row gap-8">
          
          <!-- Left Column - Poster & Providers -->
          <div class="lg:w-80 flex-shrink-0">
            <!-- Poster -->
            <div class="relative group">
              <img 
                :src="show.poster_path ? getImageUrl(show.poster_path, 'w500') : '/no-photo.png'" 
                :alt="show.name"
                class="w-full rounded-2xl shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-emerald-500/25"
              />
              
              <!-- Favorite Button -->
              <button 
                @click="toggleFavorite"
                class="absolute top-3 right-3 bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white p-2.5 rounded-xl transition-all duration-300 hover:scale-110 border border-white/20"
                :class="{ 'text-yellow-400 bg-yellow-400/20': favoritesStore.isFavorite(show.id, 'tv') }"
              >
                <svg v-if="favoritesStore.isFavorite(show.id, 'tv')" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                  <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </button>
            </div>

            <!-- Season Information -->
            <div class="mt-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-2xl">
              <h3 class="text-gray-900 font-bold text-lg mb-4 flex items-center gap-3">
                <div class="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                Season Information
              </h3>
              
              <div class="space-y-4">
                <!-- Current Season -->
                <div class="space-y-2">
                  <div class="flex justify-between items-center py-2">
                    <span class="text-gray-600">Seasons:</span>
                    <span class="font-semibold">{{ show.number_of_seasons }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2">
                    <span class="text-gray-600">Episodes:</span>
                    <span class="font-semibold">{{ show.number_of_episodes }}</span>
                  </div>

                </div>

                <!-- Season List -->
                <div v-if="show.seasons && show.seasons.length > 0" class="space-y-3">
                  <h4 class="text-gray-700 font-semibold text-sm">All Seasons</h4>
                  <div class="grid gap-3">
                    <div 
                      v-for="season in show.seasons.slice(0, 3)" 
                      :key="season.id"
                      class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                    >
                      <img 
                        v-if="season.poster_path"
                        :src="getImageUrl(season.poster_path, 'w92')" 
                        :alt="season.name"
                        class="w-12 h-12 rounded-lg object-cover"
                      />
                      <div v-else class="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                        <span class="text-white font-bold text-xs">S{{ season.season_number }}</span>
                      </div>
                      <div class="flex-1">
                        <div class="text-gray-900 font-medium text-sm">{{ season.name }}</div>
                        <div class="text-gray-500 text-xs">{{ season.episode_count }} Episodes</div>
                      </div>
                      <div class="text-right">
                        <div class="text-gray-600 text-xs">{{ season.air_date ? formatDate(season.air_date) : 'TBA' }}</div>
                        <div v-if="season.vote_average" class="text-emerald-600 text-xs font-medium mt-1">
                          {{ formatVoteAverage(season.vote_average) }}%
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="show.seasons.length > 3" class="text-center">
                    <button 
                      @click="openSeasonsModal"
                      class="text-emerald-600 text-sm hover:text-emerald-700 font-medium"
                    >
                      View All {{ show.seasons.length }} Seasons
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Where to Watch -->
            <div class="mt-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-2xl">
              <h3 class="text-gray-900 font-bold text-lg mb-4 flex items-center gap-3">
                <div class="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z" />
                </svg>
                </div>
                Where to Watch
              </h3>
              
              <div v-if="isProvidersLoading" class="flex items-center justify-center py-8">
                <div class="relative">
                  <div class="animate-spin rounded-full h-8 w-8 border-2 border-emerald-200 border-t-emerald-600"></div>
                  <div class="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-400 animate-ping"></div>
                </div>
              </div>
              
              <div v-else class="space-y-4">
                <!-- Streaming -->
                <div v-if="providers.flatrate && providers.flatrate.length > 0">
                  <h4 class="text-emerald-600 text-sm font-semibold mb-3 flex items-center gap-2">
                    <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    Streaming
                  </h4>
                  <div class="grid grid-cols-4 gap-4">
                    <div 
                      v-for="provider in providers.flatrate.slice(0, showAllProviders ? undefined : 8)" 
                      :key="provider.provider_id"
                      class="relative group bg-gray-50 rounded-xl p-1 flex items-center justify-center hover:bg-gray-100 transition-all duration-300 border border-gray-200 hover:border-emerald-300 hover:shadow-lg"
                      :title="provider.provider_name"
                    >
                      <img 
                        :src="provider.logo_path ? `https://image.tmdb.org/t/p/w92${provider.logo_path}` : '/no-photo.png'" 
                        :alt="provider.provider_name"
                        class="w-12 h-12 rounded-lg object-cover"
                      />
                      <!-- Tooltip -->
                      <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
                        {{ provider.provider_name }}
                        <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                  <button 
                    v-if="providers.flatrate.length > 8"
                    @click="showAllProviders = !showAllProviders"
                    class="text-emerald-600 text-xs hover:text-emerald-700 mt-3 font-medium transition-colors duration-300"
                  >
                    {{ showAllProviders ? 'Show Less' : `Show ${providers.flatrate.length - 8} More` }}
                  </button>
                </div>

                <!-- Rent -->
                <div v-if="providers.rent && providers.rent.length > 0">
                  <h4 class="text-emerald-600 text-sm font-semibold mb-3 flex items-center gap-2">
                    <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    Rent
                  </h4>
                  <div class="grid grid-cols-4 gap-4">
                    <div 
                      v-for="provider in providers.rent.slice(0, 4)" 
                      :key="provider.provider_id"
                      class="relative group bg-gray-50 rounded-xl p-1 flex items-center justify-center hover:bg-gray-100 transition-all duration-300 border border-gray-200 hover:border-emerald-300 hover:shadow-lg"
                      :title="provider.provider_name"
                    >
                      <img 
                        :src="provider.logo_path ? `https://image.tmdb.org/t/p/w92${provider.logo_path}` : '/no-photo.png'" 
                        :alt="provider.provider_name"
                        class="w-12 h-12 rounded-lg object-cover"
                      />
                      <!-- Tooltip -->
                      <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
                        {{ provider.provider_name }}
                        <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Buy -->
                <div v-if="providers.buy && providers.buy.length > 0">
                  <h4 class="text-emerald-600 text-sm font-semibold mb-3 flex items-center gap-2">
                    <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    Buy
                  </h4>
                  <div class="grid grid-cols-4 gap-4">
                    <div 
                      v-for="provider in providers.buy.slice(0, 4)" 
                      :key="provider.provider_id"
                      class="relative group bg-gray-50 rounded-xl p-1 flex items-center justify-center hover:bg-gray-100 transition-all duration-300 border border-gray-200 hover:border-emerald-300 hover:shadow-lg"
                      :title="provider.provider_name"
                    >
                      <img 
                        :src="provider.logo_path ? `https://image.tmdb.org/t/p/w92${provider.logo_path}` : '/no-photo.png'" 
                        :alt="provider.provider_name"
                        class="w-12 h-12 rounded-lg object-cover"
                      />
                      <!-- Tooltip -->
                      <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
                        {{ provider.provider_name }}
                        <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="!providers.flatrate && !providers.rent && !providers.buy" class="text-gray-500 text-sm text-center py-4">
                  No streaming options available
                </div>
              </div>
            </div>

            <!-- Keywords -->
            <div class="mt-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-2xl">
              <h3 class="text-gray-900 font-bold text-lg mb-4 flex items-center gap-3">
                <div class="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.732.998 2.732.998s2.033-.299 2.732-.998l4.318-4.318c.699-.699.998-1.732.998-2.732s-.299-2.033-.998-2.732L13.159 3.659A2.25 2.25 0 0011.568 3H9.568z" />
                  </svg>
                </div>
                Keywords
              </h3>
              
              <div v-if="keywords.length > 0" class="flex flex-wrap gap-2">
                <span 
                  v-for="keyword in keywords.slice(0, 12)" 
                  :key="keyword.id"
                  class="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors duration-300"
                >
                  {{ keyword.name }}
                </span>
              </div>
              
              <div v-else class="text-gray-500 text-sm text-center py-4">
                No keywords available
              </div>
            </div>
          </div>

          <!-- Right Column - Show Info -->
          <div class="flex-1">
            <!-- Title & Basic Info -->
            <div class="mb-8">
              <div class="min-h-[120px] flex flex-col justify-center">
                <h1 class="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight line-clamp-2">
                  {{ show.name }}
                  <span class="text-gray-300 font-normal">({{ new Date(show.first_air_date).getFullYear() }})</span>
                </h1>
                <p v-if="show.original_name !== show.name" class="text-white text-base mb-6 italic line-clamp-1">{{ show.original_name }}</p>
              </div>
              
              <div class="flex flex-wrap items-center gap-4 text-gray-600 mb-6" style="margin-top: 1rem;">
                <span class="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">{{ show.status }}</span>
                <span v-if="show.adult === false" class="text-gray-600">PG-13</span>
                <span v-else-if="show.adult === true" class="text-gray-600">R</span>
                <span class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  {{ formatDate(show.first_air_date) }}
                </span>
                <span v-if="show.episode_run_time && show.episode_run_time.length > 0" class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ formatRuntime(show.episode_run_time[0] || 0) }}
                </span>
                <span class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.732.998 2.732.998s2.033-.299 2.732-.998l4.318-4.318c.699-.699.998-1.732.998-2.732s-.299-2.033-.998-2.732L13.159 3.659A2.25 2.25 0 0011.568 3H9.568z" />
                  </svg>
                  {{ show.genres.map(g => g.name).join(', ') }}
                </span>
              </div>

              <!-- User Score -->
              <div class="flex items-center gap-6 mb-8">
                <div class="relative">
                  <svg class="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                    <path 
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" 
                      stroke="#d1d5db" 
                      stroke-width="2"
                    />
                    <path 
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" 
                      stroke="#10b981" 
                      stroke-width="2"
                      :stroke-dasharray="`${formatVoteAverage(show.vote_average)}, 100`"
                    />
                  </svg>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <span class="text-gray-900 font-bold text-lg">{{ formatVoteAverage(show.vote_average) }}%</span>
                  </div>
                </div>
                <div>
                  <div class="text-gray-900 font-bold text-lg">User Score</div>
                  <div class="text-emerald-600 text-sm">{{ show.vote_count.toLocaleString() }} votes</div>
                </div>
                
                <!-- Play Trailer Button -->
                <button 
                  v-if="videos.length > 0"
                  @click="playTrailer"
                  class="flex items-center gap-4 group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="#10b981" viewBox="0 0 24 24" class="w-12 h-12 group-hover:animate-pulse transition-all duration-300">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <div class="text-left">
                    <div class="text-gray-900 font-bold text-lg">Play Trailer</div>
                    <div class="text-emerald-600 text-sm">Watch the official trailer</div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Tagline -->
            <div v-if="show.tagline" class="mb-8">
              <p class="text-emerald-700 italic text-xl font-medium">"{{ show.tagline }}"</p>
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
              <p class="text-gray-700 leading-relaxed text-lg">{{ show.overview }}</p>
            </div>

            <!-- Cast -->
            <div v-if="cast.length > 0" class="mb-10">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div class="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 003.9-.128 3 3 0 10-5.799 0c.617.174 1.268.287 1.949.328zM4.5 8.25a3 3 0 116 0 3 3 0 01-6 0zM14.25 8.25a3 3 0 116 0 3 3 0 01-6 0zM1.5 19.128v-.377a6.375 6.375 0 0112.75 0v.377A12.318 12.318 0 017.875 21c-2.303 0-4.465-.657-6.375-1.872z" />
                  </svg>
                </div>
                Top Billed Cast
              </h2>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                <div 
                  v-for="person in cast" 
                  :key="person.id"
                  class="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden hover:bg-white/20 transition-all duration-300 border border-white/10 hover:scale-105 hover:shadow-2xl cursor-pointer"
                  @click="router.push(`/people/${person.id}`)"
                >
                  <img 
                    :src="person.profile_path ? getImageUrl(person.profile_path, 'w185') : '/no-photo.png'" 
                    :alt="person.name"
                    class="w-full h-48 object-cover"
                  />
                  <div class="p-4">
                    <div class="text-gray-900 font-semibold text-sm mb-1">{{ person.name }}</div>
                    <div class="text-emerald-600 text-xs">{{ person.character }}</div>
                  </div>
                </div>
              </div>
              <div class="text-left mt-4">
                <button 
                  @click="openCastCrewModal"
                  class="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors duration-300 group"
                >
                  <span>View More Cast & Crew</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>

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
                    <span class="text-emerald-600">{{ show.status }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-gray-200">
                    <span class="font-semibold">Original Language:</span>
                    <span class="text-emerald-600">{{ show.original_language.toUpperCase() }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-gray-200">
                    <span class="font-semibold">Number of Seasons:</span>
                    <span class="text-emerald-600">{{ show.number_of_seasons }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-gray-200">
                    <span class="font-semibold">Number of Episodes:</span>
                    <span class="text-emerald-600">{{ show.number_of_episodes }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-gray-200">
                    <span class="font-semibold">First Air Date:</span>
                    <span class="text-emerald-600">{{ formatDate(show.first_air_date) }}</span>
                  </div>
                  <div v-if="show.last_air_date" class="flex justify-between items-center py-2">
                    <span class="font-semibold">Last Air Date:</span>
                    <span class="text-emerald-600">{{ formatDate(show.last_air_date) }}</span>
                  </div>
                </div>
              </div>

              <div v-if="show.networks && show.networks.length > 0" class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h3 class="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <div class="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 text-white">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-6.75 4.5h6.75m-6.75 4.5h6.75m-6.75 4.5h6.75" />
                    </svg>
                  </div>
                  Networks
                </h3>
                <div class="space-y-3">
                  <div 
                    v-for="network in show.networks" 
                    :key="network.id"
                    class="flex items-center gap-3 py-2 border-b border-gray-200 last:border-b-0"
                  >
                    <img 
                      v-if="network.logo_path"
                      :src="getImageUrl(network.logo_path, 'w92')" 
                      :alt="network.name"
                      class="w-10 h-10 rounded-lg object-cover"
                    />
                    <div v-else class="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-white">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-6.75 4.5h6.75m-6.75 4.5h6.75m-6.75 4.5h6.75" />
                      </svg>
                    </div>
                    <span class="text-gray-700 font-medium">{{ network.name }}</span>
                  </div>
                </div>
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
      :title="show?.name || ''"
      @close="closeTrailerModal"
    />

    <!-- Seasons Modal -->
    <div v-if="showSeasonsModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div class="relative w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-2xl font-bold text-gray-900">All Seasons</h2>
          <button 
            @click="closeSeasonsModal"
            class="text-gray-500 hover:text-gray-700 transition-colors duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Seasons List -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div class="grid gap-4">
            <div 
              v-for="season in show.seasons" 
              :key="season.id"
              class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300"
            >
                              <img 
                  v-if="season.poster_path"
                  :src="getImageUrl(season.poster_path, 'w185')" 
                  :alt="season.name"
                  class="w-16 h-24 rounded-lg object-cover shadow-md"
                />
              <div v-else class="w-16 h-24 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center shadow-md">
                <span class="text-white font-bold text-sm">S{{ season.season_number }}</span>
              </div>
              
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-semibold text-gray-900">{{ season.name }}</h3>
                  <span class="text-sm text-gray-500">Season {{ season.season_number }}</span>
                </div>
                <div class="flex items-center gap-4 text-sm text-gray-600">
                  <span>{{ season.episode_count }} Episodes</span>
                  <span v-if="season.air_date">{{ formatDate(season.air_date) }}</span>
                  <span v-else class="text-gray-400">TBA</span>
                  <span v-if="season.vote_average" class="text-emerald-600 font-medium">
                    {{ formatVoteAverage(season.vote_average) }}%
                  </span>
                </div>
                <p v-if="season.overview" class="text-gray-700 text-sm mt-2 line-clamp-2">{{ season.overview }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

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
               Series Cast {{ allCast.length }}
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
               Series Crew {{ allCrew.length }}
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
  </div>
</template>

<style scoped>
@keyframes patternMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(60px, 60px); }
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, -20px) scale(1.05); }
}

@keyframes float-delayed {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-15px, 15px) scale(1.1); }
}

@keyframes float-slow {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(25px, -10px) scale(0.95); }
}
</style>
