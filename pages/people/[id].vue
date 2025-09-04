 <script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTmdb } from '../../composables/useTmdb'
import PeopleFilter from '../../components/filters/inputs/PeopleFilter.vue'

const route = useRoute()
const router = useRouter()
const { request, getImageUrl } = useTmdb()

interface Person {
  id: number
  name: string
  biography: string
  birthday: string
  deathday: string | null
  place_of_birth: string
  known_for_department: string
  profile_path: string
  adult: boolean
  gender: number
  popularity: number
  also_known_as: string[]
  imdb_id: string
  homepage: string
}

interface MovieCredit {
  id: number
  title: string
  original_title: string
  character: string
  poster_path: string
  release_date: string
  vote_average: number
  vote_count: number
  media_type: 'movie'
}

interface TvCredit {
  id: number
  name: string
  original_name: string
  character: string
  poster_path: string
  first_air_date: string
  vote_average: number
  vote_count: number
  media_type: 'tv'
  episode_count?: number
  first_episode_air_date?: string
  last_episode_air_date?: string
}

interface Image {
  file_path: string
  aspect_ratio: number
  height: number
  width: number
  iso_639_1: string | null
  vote_average: number
  vote_count: number
}

const person = ref<Person | null>(null)
const actingCredits = ref<any[]>([])
const productionCredits = ref<any[]>([])
const directingCredits = ref<any[]>([])
const images = ref<Image[]>([])
const isLoading = ref(true)
const showAllImages = ref(false)
const showAllCredits = ref(false)
const selectedImage = ref<Image | null>(null)
const showImageModal = ref(false)
const showAllKnownFor = ref(false)
const showKnownForModal = ref(false)
const mediaTypeFilter = ref('all')
const departmentFilter = ref('all')

const personId = computed(() => Number(route.params.id))

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const calculateAge = (birthday: string, deathday?: string | null) => {
  if (!birthday) return null
  const birth = new Date(birthday)
  const end = deathday ? new Date(deathday) : new Date()
  const age = end.getFullYear() - birth.getFullYear()
  const monthDiff = end.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
    return age - 1
  }
  return age
}

const formatVoteAverage = (vote: number) => {
  return Math.round(vote * 10)
}



const getTvCreditDate = (credit: TvCredit) => {
  return credit.first_episode_air_date || credit.first_air_date
}



const filteredActingCredits = computed(() => {
  let credits = [...actingCredits.value]
  
  if (mediaTypeFilter.value === 'movie') {
    credits = credits.filter(credit => credit.media_type === 'movie')
  } else if (mediaTypeFilter.value === 'tv') {
    credits = credits.filter(credit => credit.media_type === 'tv')
  }
  
  return credits
})

const filteredProductionCredits = computed(() => {
  let credits = [...productionCredits.value]
  
  if (mediaTypeFilter.value === 'movie') {
    credits = credits.filter(credit => credit.media_type === 'movie')
  } else if (mediaTypeFilter.value === 'tv') {
    credits = credits.filter(credit => credit.media_type === 'tv')
  }
  
  return credits
})

const filteredDirectingCredits = computed(() => {
  let credits = [...directingCredits.value]
  
  if (mediaTypeFilter.value === 'movie') {
    credits = credits.filter(credit => credit.media_type === 'movie')
  } else if (mediaTypeFilter.value === 'tv') {
    credits = credits.filter(credit => credit.media_type === 'tv')
  }
  
  return credits
})

const topKnownForCredits = computed(() => {
  const allCredits = [...actingCredits.value, ...productionCredits.value, ...directingCredits.value]
  const groupedCredits = new Map()
  
  allCredits.forEach(credit => {
    const key = `${credit.media_type}-${credit.id}`
    
    if (!groupedCredits.has(key)) {
      groupedCredits.set(key, {
        ...credit,
        roles: [credit.character || credit.job],
        departments: [credit.character ? 'Acting' : (credit.job?.toLowerCase().includes('producer') ? 'Production' : 'Directing')],
        importance: calculateImportance(credit)
      })
    } else {
      const existing = groupedCredits.get(key)
      if (credit.character && !existing.roles.includes(credit.character)) {
        existing.roles.push(credit.character)
      }
      if (credit.job && !existing.roles.includes(credit.job)) {
        existing.roles.push(credit.job)
      }
      
      const dept = credit.character ? 'Acting' : (credit.job?.toLowerCase().includes('producer') ? 'Production' : 'Directing')
      if (!existing.departments.includes(dept)) {
        existing.departments.push(dept)
      }
      
      const newImportance = calculateImportance(credit)
      if (newImportance > existing.importance) {
        existing.importance = newImportance
      }
    }
  })
  
  const uniqueCredits = Array.from(groupedCredits.values())
  
  uniqueCredits.sort((a, b) => b.importance - a.importance)
  
  return uniqueCredits.slice(0, 10)
})

const allKnownForCredits = computed(() => {
  const allCredits = [...actingCredits.value, ...productionCredits.value, ...directingCredits.value]
  
  const groupedCredits = new Map()
  
  allCredits.forEach(credit => {
    const key = `${credit.media_type}-${credit.id}`
    
    if (!groupedCredits.has(key)) {
      groupedCredits.set(key, {
        ...credit,
        roles: [credit.character || credit.job],
        departments: [credit.character ? 'Acting' : (credit.job?.toLowerCase().includes('producer') ? 'Production' : 'Directing')],
        importance: calculateImportance(credit)
      })
    } else {
      const existing = groupedCredits.get(key)
      if (credit.character && !existing.roles.includes(credit.character)) {
        existing.roles.push(credit.character)
      }
      if (credit.job && !existing.roles.includes(credit.job)) {
        existing.roles.push(credit.job)
      }
      
      const dept = credit.character ? 'Acting' : (credit.job?.toLowerCase().includes('producer') ? 'Production' : 'Directing')
      if (!existing.departments.includes(dept)) {
        existing.departments.push(dept)
      }
      
      const newImportance = calculateImportance(credit)
      if (newImportance > existing.importance) {
        existing.importance = newImportance
      }
    }
  })
  
  const uniqueCredits = Array.from(groupedCredits.values())
  
  uniqueCredits.sort((a, b) => b.importance - a.importance)
  
  return uniqueCredits.slice(0, 30)
})

const calculateImportance = (credit: any) => {
  let importance = 0
  
  if (credit.character) {
    if (credit.order !== undefined) {
      if (credit.order <= 2) {
        importance += 1000
      } else if (credit.order <= 5) {
        importance += 500
      } else {
        importance += 100
      }
    }
    
    if (credit.vote_average) {
      importance += credit.vote_average * 50
    }
    
    if (credit.vote_count) {
      if (credit.media_type === 'movie') {
        importance += Math.min(credit.vote_count / 200, 250)
      } else {
        importance += Math.min(credit.vote_count / 50, 350)
      }
    }
    
    if (credit.vote_average && credit.vote_count) {
      let popularityScore
      if (credit.media_type === 'movie') {
        popularityScore = credit.vote_average * Math.log(credit.vote_count + 1) * 15
      } else {
        popularityScore = credit.vote_average * Math.log(credit.vote_count + 1) * 25
      }
      importance += popularityScore
    }
  }
  
  if (credit.job) {
    if (credit.job.toLowerCase().includes('director')) {
      importance += 800 
    } else if (credit.job.toLowerCase().includes('executive producer')) {
      importance += 600
    } else if (credit.job.toLowerCase().includes('producer')) {
      importance += 500
    } else {
      importance += 200
    }
    
    if (credit.vote_average) {
      importance += credit.vote_average * 30
    }
    
    if (credit.vote_count) {
      if (credit.media_type === 'movie') {
        importance += Math.min(credit.vote_count / 300, 150)
      } else {
        importance += Math.min(credit.vote_count / 100, 200)
      }
    }
    
    if (credit.vote_average && credit.vote_count) {
      let popularityScore
      if (credit.media_type === 'movie') {
        popularityScore = credit.vote_average * Math.log(credit.vote_count + 1) * 10
      } else {
        popularityScore = credit.vote_average * Math.log(credit.vote_count + 1) * 15
      }
      importance += popularityScore
    }
  }
  
  return importance
}

const openImageModal = (image: Image) => {
  selectedImage.value = image
  showImageModal.value = true
}

const closeImageModal = () => {
  showImageModal.value = false
  selectedImage.value = null
}

async function fetchPersonDetails() {
  try {
    isLoading.value = true
    
    const personResponse = await request<Person>(`/person/${personId.value}`)
    person.value = personResponse
    
    const creditsResponse = await request<any>(`/person/${personId.value}/combined_credits`)
    
    if (creditsResponse && creditsResponse.cast) {
      actingCredits.value = creditsResponse.cast.sort((a: any, b: any) => {
        const dateA = a.media_type === 'movie' ? a.release_date : (a.first_episode_air_date || a.first_air_date)
        const dateB = b.media_type === 'movie' ? b.release_date : (b.first_episode_air_date || b.first_air_date)
        return new Date(dateB || '1900-01-01').getTime() - new Date(dateA || '1900-01-01').getTime()
      })
    }
    
    if (creditsResponse && creditsResponse.crew) {
      productionCredits.value = creditsResponse.crew
        .filter((credit: any) => credit.job?.toLowerCase().includes('producer'))
        .sort((a: any, b: any) => {
          const dateA = a.media_type === 'movie' ? a.release_date : (a.first_episode_air_date || a.first_air_date)
          const dateB = b.media_type === 'movie' ? b.release_date : (b.first_episode_air_date || b.first_air_date)
          return new Date(dateB || '1900-01-01').getTime() - new Date(dateA || '1900-01-01').getTime()
        })
      
      directingCredits.value = creditsResponse.crew
        .filter((credit: any) => credit.job?.toLowerCase().includes('director'))
        .sort((a: any, b: any) => {
          const dateA = a.media_type === 'movie' ? a.release_date : (a.first_episode_air_date || a.first_air_date)
          const dateB = b.media_type === 'movie' ? b.release_date : (b.first_episode_air_date || b.first_air_date)
          return new Date(dateB || '1900-01-01').getTime() - new Date(dateA || '1900-01-01').getTime()
        })
    }
    
    const imagesResponse = await request<{ profiles: Image[] }>(`/person/${personId.value}/images`)
    images.value = imagesResponse.profiles || []
    
      } catch (error) {
    } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (personId.value && !isNaN(personId.value)) {
    fetchPersonDetails()
  } else {
    isLoading.value = false
  }
})
</script>

<template>
  <div v-if="isLoading" class="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 flex items-center justify-center">
    <div class="relative">
      <div class="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600"></div>
      <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-400 animate-ping"></div>
    </div>
  </div>

  <div v-else-if="person && !isLoading" class="min-h-screen relative overflow-hidden">
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
        :style="`background-image: url(${getImageUrl(person.profile_path, 'w1280')})`"
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
          
          <!-- Left Column - Profile & Info -->
          <div class="lg:w-80 flex-shrink-0">
            <!-- Profile Image -->
            <div class="relative group">
              <img 
                :src="person.profile_path ? getImageUrl(person.profile_path, 'w500') : '/no-photo.png'" 
                :alt="person.name"
                class="w-full rounded-2xl shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-emerald-500/25"
              />
            </div>

            <!-- Personal Information -->
            <div class="mt-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-2xl">
              <h3 class="text-gray-900 font-bold text-lg mb-4 flex items-center gap-3">
                <div class="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                Personal Information
              </h3>
              
                             <div class="space-y-4 text-gray-700">
                 <div class="flex justify-between items-center py-2 border-b border-gray-200">
                   <span class="font-semibold">Known For:</span>
                   <span class="text-emerald-600">{{ person.known_for_department }}</span>
                 </div>
                 
                 <div class="flex justify-between items-center py-2 border-b border-gray-200">
                   <span class="font-semibold">Known Credits:</span>
                   <span class="text-emerald-600">{{ actingCredits.length + productionCredits.length + directingCredits.length }}</span>
                 </div>
                 
                 <div class="flex justify-between items-center py-2 border-b border-gray-200">
                   <span class="font-semibold">Gender:</span>
                   <span class="text-emerald-600">{{ person.gender === 1 ? 'Female' : person.gender === 2 ? 'Male' : 'Other' }}</span>
                 </div>
                 
                 <div v-if="person.birthday" class="py-2 border-b border-gray-200">
                   <div class="font-semibold mb-1">Birthday:</div>
                   <div class="text-emerald-600 text-sm">
                     {{ formatDate(person.birthday) }}
                     <span v-if="calculateAge(person.birthday, person.deathday)" class="text-gray-500">
                       ({{ calculateAge(person.birthday, person.deathday) }} years old)
                     </span>
                   </div>
                 </div>
                 
                 <div v-if="person.place_of_birth" class="py-2 border-b border-gray-200">
                   <div class="font-semibold mb-1">Place of Birth:</div>
                   <div class="text-emerald-600 text-sm">{{ person.place_of_birth }}</div>
                 </div>
                 
                 <div v-if="person.deathday" class="py-2 border-b border-gray-200">
                   <div class="font-semibold mb-1">Death Date:</div>
                   <div class="text-emerald-600 text-sm">{{ formatDate(person.deathday) }}</div>
                 </div>
               </div>
            </div>

            <!-- Also Known As -->
            <div v-if="person.also_known_as && person.also_known_as.length > 0" class="mt-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-2xl">
              <h3 class="text-gray-900 font-bold text-lg mb-4 flex items-center gap-3">
                <div class="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                </div>
                Also Known As
              </h3>
              
              <div class="space-y-2">
                <div 
                  v-for="name in person.also_known_as.slice(0, showAllCredits ? undefined : 5)" 
                  :key="name"
                  class="text-gray-700 text-sm py-1 border-b border-gray-100 last:border-b-0"
                >
                  {{ name }}
                </div>
                
                <button 
                  v-if="person.also_known_as.length > 5"
                  @click="showAllCredits = !showAllCredits"
                  class="text-emerald-600 text-xs hover:text-emerald-700 mt-3 font-medium transition-colors duration-300"
                >
                  {{ showAllCredits ? 'Show Less' : `Show ${person.also_known_as.length - 5} More` }}
                </button>
              </div>
            </div>

            <!-- Photos -->
            <div v-if="images.length > 0" class="mt-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-2xl">
              <h3 class="text-gray-900 font-bold text-lg mb-4 flex items-center gap-3">
                <div class="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                Photos
              </h3>
              
              <div class="grid grid-cols-3 gap-4">
                <div 
                  v-for="image in images.slice(0, showAllImages ? undefined : 9)" 
                  :key="image.file_path"
                  class="relative group cursor-pointer"
                  @click="openImageModal(image)"
                >
                  <img 
                    :src="getImageUrl(image.file_path, 'w185')" 
                    :alt="person.name"
                    class="w-full h-32 object-cover rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl"
                  />
                  <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-xl"></div>
                </div>
              </div>
              
              <button 
                v-if="images.length > 9"
                @click="showAllImages = !showAllImages"
                class="mt-6 text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-300"
              >
                {{ showAllImages ? 'Show Less' : `Show ${images.length - 9} More Photos` }}
              </button>
            </div>

            <!-- Social Links -->
            <div v-if="person.homepage || person.imdb_id" class="mt-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-2xl">
              <h3 class="text-gray-900 font-bold text-lg mb-4 flex items-center gap-3">
                <div class="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.338.025-.675.075-1.003M12 3a8.959 8.959 0 00-8.716 2.253M12 3a8.959 8.959 0 018.716 2.253M12 3a8.959 8.959 0 00-8.716 2.253M12 3a8.959 8.959 0 018.716 2.253" />
                  </svg>
                </div>
                External Links
              </h3>
              
              <div class="flex gap-4">
                <a 
                  v-if="person.homepage"
                  :href="person.homepage" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="flex items-center gap-3 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-300 hover:scale-105 group"
                  title="Official Website"
                >
                  <img 
                    src="https://cdn-icons-png.flaticon.com/512/2991/2991110.png" 
                    alt="Website"
                    class="w-8 h-8 object-contain"
                  />
                  <span class="text-gray-700 font-medium group-hover:text-gray-900">Official Website</span>
                </a>
                
                <a 
                  v-if="person.imdb_id"
                  :href="`https://www.imdb.com/name/${person.imdb_id}`" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="flex items-center gap-3 p-3 bg-yellow-500 hover:bg-yellow-600 rounded-lg transition-all duration-300 hover:scale-105 group"
                  title="IMDb Profile"
                >
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg" 
                    alt="IMDb"
                    class="w-8 h-8 object-contain"
                  />
                  <span class="text-white font-medium group-hover:text-yellow-100">IMDb Profile</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Right Column - Person Info -->
          <div class="flex-1">
                         <!-- Title & Basic Info -->
             <div class="mb-8">
               <div class="min-h-[120px] flex flex-col justify-center">
                 <h1 class="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight line-clamp-2">
                   {{ person.name }}
                 </h1>

               </div>
               
               <div class="flex flex-wrap items-center gap-4 text-gray-600 mb-6" style="margin-top: 1rem;">
                 <span class="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">{{ person.known_for_department }}</span>
                 <span v-if="person.birthday" class="flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                     <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                   </svg>
                   {{ formatDate(person.birthday) }}
                   <span v-if="calculateAge(person.birthday, person.deathday)" class="text-gray-600">
                     ({{ calculateAge(person.birthday, person.deathday) }} years old)
                   </span>
                 </span>
                 <span v-if="person.place_of_birth" class="flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                     <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                     <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                   </svg>
                   {{ person.place_of_birth }}
                 </span>
                 <span class="flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                     <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                   </svg>
                   {{ actingCredits.length + productionCredits.length + directingCredits.length }} credits
                 </span>
               </div>
             </div>

            <!-- Biography -->
            <div v-if="person.biography" class="mb-10">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div class="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                Biography
              </h2>
              <p class="text-gray-700 leading-relaxed text-lg">{{ person.biography }}</p>
            </div>

                         <!-- Known For -->
             <div v-if="actingCredits.length > 0 || productionCredits.length > 0 || directingCredits.length > 0" class="mb-10">
               <h2 class="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                 <div class="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
                     <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                   </svg>
                 </div>
                 Known For
               </h2>
               
               <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                 <!-- Credits -->
                 <div 
                   v-for="credit in topKnownForCredits" 
                   :key="`${credit.media_type}-${credit.id}`"
                   class="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden hover:bg-white/20 transition-all duration-300 border border-white/10 hover:scale-105 hover:shadow-2xl cursor-pointer"
                   @click="credit.media_type === 'movie' ? router.push(`/movies/${credit.id}`) : router.push(`/tv/${credit.id}`)"
                 >
                   <img 
                     :src="credit.poster_path ? getImageUrl(credit.poster_path, 'w185') : '/no-photo.png'" 
                     :alt="credit.media_type === 'movie' ? credit.title : credit.name"
                     class="w-full h-48 object-cover"
                   />
                   <div class="p-4">
                     <div class="text-gray-900 font-semibold text-sm mb-1">
                       {{ credit.media_type === 'movie' ? credit.title : credit.name }}
                     </div>
                     <div class="text-emerald-600 text-xs">
                       {{ credit.roles.join(', ') }}
                     </div>
                     <div class="text-gray-500 text-xs mt-1">
                       {{ credit.media_type === 'movie' ? formatDate(credit.release_date) : formatDate(credit.first_air_date) }}
                     </div>
                   </div>
                 </div>
               </div>
               
               <!-- View More Button -->
               <div class="mt-6 flex justify-start">
                 <button 
                   v-if="(actingCredits.length + productionCredits.length + directingCredits.length) > 10"
                   @click="showKnownForModal = true"
                   class="text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-300 flex items-center gap-2"
                 >
                   View More
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                     <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                   </svg>
                 </button>
               </div>
             </div>

                         <!-- Filter Dropdowns -->
             <div class="mb-6 flex justify-end gap-4">
               <PeopleFilter
                 :options="[
                   { label: 'All', value: 'all' },
                   { label: 'Movies', value: 'movie' },
                   { label: 'TV Shows', value: 'tv' }
                 ]"
                 v-model="mediaTypeFilter"
               />
               <PeopleFilter
                 :options="[
                   { label: 'All Departments', value: 'all' },
                   { label: 'Acting', value: 'acting' },
                   { label: 'Production', value: 'production' },
                   { label: 'Directing', value: 'directing' }
                 ]"
                 v-model="departmentFilter"
               />
             </div>

                         <!-- Acting Credits -->
             <div v-if="actingCredits.length > 0 && (departmentFilter === 'all' || departmentFilter === 'acting')" class="mb-10">
               <div class="flex items-center justify-between mb-6">
                 <h2 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
                   <div class="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
                       <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                     </svg>
                   </div>
                   Acting
                 </h2>
               </div>
               
               <!-- Credits List -->
               <div class="space-y-4">
                 <div v-for="credit in filteredActingCredits" :key="`${credit.media_type}-${credit.id}`" class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 cursor-pointer" @click="credit.media_type === 'movie' ? router.push(`/movies/${credit.id}`) : router.push(`/tv/${credit.id}`)">
                   <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
                   <div class="flex-1">
                     <div class="text-gray-900 font-semibold">
                       {{ credit.media_type === 'movie' ? credit.title : credit.name }}
                     </div>
                     <div class="text-emerald-600 text-sm">
                       as {{ credit.character }}
                     </div>
                     <div class="text-gray-500 text-xs">
                       {{ credit.media_type === 'movie' ? formatDate(credit.release_date) : formatDate(credit.first_air_date) }}
                       <span v-if="credit.episode_count" class="ml-2">({{ credit.episode_count }} episodes)</span>
                     </div>
                   </div>
                 </div>
               </div>
             </div>

             <!-- Production Credits -->
             <div v-if="productionCredits.length > 0 && (departmentFilter === 'all' || departmentFilter === 'production')" class="mb-10">
               <div class="flex items-center justify-between mb-6">
                 <h2 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
                   <div class="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
                       <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                     </svg>
                   </div>
                   Production
                 </h2>
               </div>
               
               <!-- Credits List -->
               <div class="space-y-4">
                 <div v-for="credit in filteredProductionCredits" :key="`${credit.media_type}-${credit.id}`" class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 cursor-pointer" @click="credit.media_type === 'movie' ? router.push(`/movies/${credit.id}`) : router.push(`/tv/${credit.id}`)">
                   <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
                   <div class="flex-1">
                     <div class="text-gray-900 font-semibold">
                       {{ credit.media_type === 'movie' ? credit.title : credit.name }}
                     </div>
                     <div class="text-emerald-600 text-sm">
                       {{ credit.job }}
                     </div>
                     <div class="text-gray-500 text-xs">
                       {{ credit.media_type === 'movie' ? formatDate(credit.release_date) : formatDate(credit.first_air_date) }}
                     </div>
                   </div>
                 </div>
               </div>
             </div>

             <!-- Directing Credits -->
             <div v-if="directingCredits.length > 0 && (departmentFilter === 'all' || departmentFilter === 'directing')" class="mb-10">
               <div class="flex items-center justify-between mb-6">
                 <h2 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
                   <div class="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
                       <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                     </svg>
                   </div>
                   Directing
                 </h2>
               </div>
               
               <!-- Credits List -->
               <div class="space-y-4">
                 <div v-for="credit in filteredDirectingCredits" :key="`${credit.media_type}-${credit.id}`" class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 cursor-pointer" @click="credit.media_type === 'movie' ? router.push(`/movies/${credit.id}`) : router.push(`/tv/${credit.id}`)">
                   <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
                   <div class="flex-1">
                     <div class="text-gray-900 font-semibold">
                       {{ credit.media_type === 'movie' ? credit.title : credit.name }}
                     </div>
                     <div class="text-emerald-600 text-sm">
                       {{ credit.job }}
                     </div>
                     <div class="text-gray-500 text-xs">
                       {{ credit.media_type === 'movie' ? formatDate(credit.release_date) : formatDate(credit.first_air_date) }}
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

  <!-- Error State -->
  <div v-else-if="!isLoading && !person" class="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 flex items-center justify-center">
    <div class="text-center">
      <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-white">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Person Not Found</h2>
      <p class="text-gray-600 mb-6">The person you're looking for doesn't exist or there was an error loading their information.</p>
      <button 
        @click="router.push('/people')"
        class="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
      >
        Back to People
      </button>
    </div>
  </div>

     <!-- Image Modal -->
   <div v-if="showImageModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
     <div class="relative w-full max-w-4xl mx-4">
       <!-- Close Button -->
       <button 
         @click="closeImageModal"
         class="absolute -top-12 right-0 z-10 text-white hover:text-gray-300 transition-colors duration-300"
       >
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8">
           <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
         </svg>
       </button>
       
       <!-- Image Container -->
       <div class="relative w-full bg-black rounded-2xl overflow-hidden shadow-2xl">
         <img 
           v-if="selectedImage"
           :src="getImageUrl(selectedImage.file_path, 'original')" 
           :alt="person?.name"
           class="w-full h-auto max-h-[80vh] object-contain"
         />
       </div>
     </div>
   </div>

   <!-- Known For Modal -->
   <div v-if="showKnownForModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
     <div class="relative w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden">
       <!-- Header -->
       <div class="flex items-center justify-between p-6 border-b border-gray-200">
         <h2 class="text-2xl font-bold text-gray-900">All Credits</h2>
         <button 
           @click="showKnownForModal = false"
           class="text-gray-500 hover:text-gray-700 transition-colors duration-300"
         >
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
             <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
           </svg>
         </button>
       </div>
       
       <!-- Content -->
       <div class="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
         <div class="space-y-4">
           <!-- All Credits -->
           <div v-for="credit in allKnownForCredits" :key="`${credit.media_type}-${credit.id}`" class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 cursor-pointer" @click="credit.media_type === 'movie' ? router.push(`/movies/${credit.id}`) : router.push(`/tv/${credit.id}`)">
             
             <img 
               :src="credit.poster_path ? getImageUrl(credit.poster_path, 'w92') : '/no-photo.png'" 
               :alt="credit.media_type === 'movie' ? credit.title : credit.name"
               class="w-16 h-24 object-cover rounded-lg"
             />
             <div class="flex-1">
               <div class="text-gray-900 font-semibold">
                 {{ credit.media_type === 'movie' ? credit.title : credit.name }}
               </div>
               <div class="text-emerald-600 text-sm">
                 {{ credit.roles.join(', ') }}
               </div>
               <div class="text-gray-500 text-xs">
                 {{ credit.media_type === 'movie' ? formatDate(credit.release_date) : formatDate(credit.first_air_date) }}
                 <span v-if="credit.episode_count" class="ml-2">({{ credit.episode_count }} episodes)</span>
               </div>
             </div>
             <div v-if="credit.vote_average > 0" class="text-right">
               <div class="text-gray-900 font-bold text-sm">{{ formatVoteAverage(credit.vote_average) }}%</div>
               <div class="text-gray-500 text-xs">{{ credit.vote_count.toLocaleString() }} votes</div>
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
