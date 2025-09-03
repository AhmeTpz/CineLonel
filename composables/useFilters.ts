// ===================================================
// FILTERS COMPOSABLE / FİLTRELER COMPOSABLE
// ===================================================

import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// FILTER OPTIONS INTERFACE / FİLTRE SEÇENEKLERİ ARAYÜZÜ
export interface FilterOptions {
  sortBy: string
  sortOrder: 'asc' | 'desc'
  genres: number[]
  whereToWatch: string[]
  minRating: number
  maxRating: number
  releaseYear: string
  minRuntime: number
  maxRuntime: number
  minVotes: number
  maxVotes: number
  language: string
  releaseDateFrom: string
  releaseDateTo: string
  keywords: { id: number; name: string }[]
}

// DEFAULT FILTERS / VARSayıLAN FİLTRELER
export const getDefaultFilters = (): FilterOptions => ({
  sortBy: 'popularity',
  sortOrder: 'desc',
  genres: [],
  whereToWatch: [],
  minRating: 0,
  maxRating: 10,
  releaseYear: '',
  minRuntime: 0,
  maxRuntime: 360,
  minVotes: 0,
  maxVotes: 50000,
  language: '',
  releaseDateFrom: '',
  releaseDateTo: '',
  keywords: []
})

// SORT OPTIONS / SIRALAMA SEÇENEKLERİ
export const getSortOptions = (contentType: 'movie' | 'tv' | 'person') => {
  const commonOptions = [
    { value: 'popularity', label: 'Popularity', order: 'desc' },
    { value: 'vote_average', label: 'Rating', order: 'desc' },
    { value: 'vote_count', label: 'Vote Count', order: 'desc' }
  ]

  if (contentType === 'movie') {
    return [
      ...commonOptions,
      { value: 'release_date', label: 'Release Date', order: 'desc' },
      { value: 'title', label: 'Title', order: 'asc' },
      { value: 'revenue', label: 'Revenue', order: 'desc' }
    ]
  }

  if (contentType === 'tv') {
    return [
      ...commonOptions,
      { value: 'first_air_date', label: 'First Air Date', order: 'desc' },
      { value: 'name', label: 'Name', order: 'asc' }
    ]
  }

  if (contentType === 'person') {
    return [
      ...commonOptions,
      { value: 'name', label: 'Name', order: 'asc' }
    ]
  }

  return commonOptions
}

// GENRE OPTIONS / TÜR SEÇENEKLERİ
export const getGenreOptions = (contentType: 'movie' | 'tv') => {
  if (contentType === 'movie') {
    return [
      { id: 28, name: 'Action' },
      { id: 12, name: 'Adventure' },
      { id: 16, name: 'Animation' },
      { id: 35, name: 'Comedy' },
      { id: 80, name: 'Crime' },
      { id: 99, name: 'Documentary' },
      { id: 18, name: 'Drama' },
      { id: 10751, name: 'Family' },
      { id: 14, name: 'Fantasy' },
      { id: 36, name: 'History' },
      { id: 27, name: 'Horror' },
      { id: 10402, name: 'Music' },
      { id: 9648, name: 'Mystery' },
      { id: 10749, name: 'Romance' },
      { id: 878, name: 'Science Fiction' },
      { id: 10770, name: 'TV Movie' },
      { id: 53, name: 'Thriller' },
      { id: 10752, name: 'War' },
      { id: 37, name: 'Western' }
    ]
  }

  if (contentType === 'tv') {
    return [
      { id: 10759, name: 'Action & Adventure' },
      { id: 16, name: 'Animation' },
      { id: 35, name: 'Comedy' },
      { id: 80, name: 'Crime' },
      { id: 99, name: 'Documentary' },
      { id: 18, name: 'Drama' },
      { id: 10751, name: 'Family' },
      { id: 10762, name: 'Kids' },
      { id: 9648, name: 'Mystery' },
      { id: 10763, name: 'News' },
      { id: 10764, name: 'Reality' },
      { id: 10765, name: 'Sci-Fi & Fantasy' },
      { id: 10766, name: 'Soap' },
      { id: 10767, name: 'Talk' },
      { id: 10768, name: 'War & Politics' },
      { id: 37, name: 'Western' }
    ]
  }

  return []
}

// LANGUAGE OPTIONS / DİL SEÇENEKLERİ
export const getLanguageOptions = () => [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  { code: 'tr', name: 'Turkish' }
]

// RUNTIME RANGES / SÜRE ARALIKLARI
export const getRuntimeRanges = () => [
  { min: 0, max: 60, label: 'Under 1 hour' },
  { min: 60, max: 90, label: '1-1.5 hours' },
  { min: 90, max: 120, label: '1.5-2 hours' },
  { min: 120, max: 180, label: '2-3 hours' },
  { min: 180, max: 360, label: 'Over 3 hours' }
]

// RATING RANGES / PUAN ARALIKLARI
export const getRatingRanges = () => [
  { min: 0, max: 2, label: '0-2' },
  { min: 2, max: 4, label: '2-4' },
  { min: 4, max: 6, label: '4-6' },
  { min: 6, max: 8, label: '6-8' },
  { min: 8, max: 10, label: '8-10' }
]

// VOTES RANGES / OY ARALIKLARI
export const getVotesRanges = () => [
  { min: 0, max: 100, label: '0-100' },
  { min: 100, max: 500, label: '100-500' },
  { min: 500, max: 1000, label: '500-1K' },
  { min: 1000, max: 5000, label: '1K-5K' },
  { min: 5000, max: 50000, label: '5K+' }
]

// FILTERS COMPOSABLE / FİLTRELER COMPOSABLE
export function useFilters() {
  const route = useRoute()
  const router = useRouter()

  // FILTER STATE / FİLTRE DURUMU
  const currentFilters = ref<FilterOptions>(getDefaultFilters())

  // COMPUTED PROPERTIES / HESAPLANMIŞ ÖZELLİKLER
  const hasActiveFilters = computed(() => {
    const filters = currentFilters.value
    return (
      filters.genres.length > 0 ||
      filters.minRating > 0 ||
      filters.maxRating < 10 ||
      filters.minRuntime > 0 ||
      filters.maxRuntime < 360 ||
      filters.minVotes > 0 ||
      filters.maxVotes < 50000 ||
      filters.language !== '' ||
      filters.releaseDateFrom !== '' ||
      filters.releaseDateTo !== '' ||
      filters.keywords.length > 0 ||
      filters.sortBy !== 'popularity' ||
      filters.sortOrder !== 'desc'
    )
  })

  const activeFiltersCount = computed(() => {
    let count = 0
    const filters = currentFilters.value
    
    if (filters.genres.length > 0) count++
    if (filters.minRating > 0 || filters.maxRating < 10) count++
    if (filters.minRuntime > 0 || filters.maxRuntime < 360) count++
    if (filters.minVotes > 0 || filters.maxVotes < 50000) count++
    if (filters.language !== '') count++
    if (filters.releaseDateFrom !== '' || filters.releaseDateTo !== '') count++
    if (filters.keywords.length > 0) count++
    if (filters.sortBy !== 'popularity' || filters.sortOrder !== 'desc') count++
    
    return count
  })

  // FILTER FUNCTIONS / FİLTRE FONKSİYONLARI
  function updateFilters(newFilters: Partial<FilterOptions>) {
    currentFilters.value = { ...currentFilters.value, ...newFilters }
  }

  function resetFilters() {
    currentFilters.value = getDefaultFilters()
    router.push({ query: {} })
  }

  function applyFilters() {
    // Update URL with current filters
    const query: any = {}
    
    if (currentFilters.value.genres.length > 0) {
      query.genres = currentFilters.value.genres.join(',')
    }
    
    if (currentFilters.value.minRating > 0) {
      query.minRating = currentFilters.value.minRating
    }
    
    if (currentFilters.value.maxRating < 10) {
      query.maxRating = currentFilters.value.maxRating
    }
    
    if (currentFilters.value.minRuntime > 0) {
      query.minRuntime = currentFilters.value.minRuntime
    }
    
    if (currentFilters.value.maxRuntime < 360) {
      query.maxRuntime = currentFilters.value.maxRuntime
    }
    
    if (currentFilters.value.minVotes > 0) {
      query.minVotes = currentFilters.value.minVotes
    }
    
    if (currentFilters.value.maxVotes < 50000) {
      query.maxVotes = currentFilters.value.maxVotes
    }
    
    if (currentFilters.value.language) {
      query.language = currentFilters.value.language
    }
    
    if (currentFilters.value.releaseDateFrom) {
      query.releaseDateFrom = currentFilters.value.releaseDateFrom
    }
    
    if (currentFilters.value.releaseDateTo) {
      query.releaseDateTo = currentFilters.value.releaseDateTo
    }
    
    if (currentFilters.value.keywords.length > 0) {
      query.keywords = currentFilters.value.keywords.map(k => k.id).join(',')
    }
    
    if (currentFilters.value.sortBy !== 'popularity') {
      query.sortBy = currentFilters.value.sortBy
    }
    
    if (currentFilters.value.sortOrder !== 'desc') {
      query.sortOrder = currentFilters.value.sortOrder
    }
    
    router.push({ query })
  }

  function clearFilter(filterType: keyof FilterOptions) {
    const defaultFilters = getDefaultFilters()
    currentFilters.value[filterType] = defaultFilters[filterType] as any
    applyFilters()
  }

  // RETURN COMPOSABLE API / COMPOSABLE API'SİNİ DÖNDÜR
  return {
    // STATE / DURUM
    currentFilters,
    
    // COMPUTED / HESAPLANMIŞ
    hasActiveFilters,
    activeFiltersCount,
    
    // FUNCTIONS / FONKSİYONLAR
    updateFilters,
    resetFilters,
    applyFilters,
    clearFilter,
    
    // UTILITIES / YARDIMCILAR
    getDefaultFilters,
    getSortOptions,
    getGenreOptions,
    getLanguageOptions,
    getRuntimeRanges,
    getRatingRanges,
    getVotesRanges
  }
}
