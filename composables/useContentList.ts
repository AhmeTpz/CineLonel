// ===================================================
// CONTENT LIST COMPOSABLE / İÇERİK LİSTESİ COMPOSABLE
// ===================================================

import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTmdb } from './useTmdb'
import { useGlobalProviderCounts } from './useGlobalProviderCounts'
import type { FilterOptions } from './useFilters'

// CONTENT TYPES / İÇERİK TİPLERİ
export type ContentType = 'movie' | 'tv' | 'person'

// CONTENT INTERFACES / İÇERİK ARAYÜZLERİ
export interface Movie {
  id: number
  title: string
  name?: string
  release_date: string
  first_air_date?: string
  vote_average: number
  poster_path: string
  profile_path?: string
  popularity: number
  known_for_department?: string
}

export interface TVShow {
  id: number
  name: string
  title?: string
  first_air_date: string
  release_date?: string
  vote_average: number
  poster_path: string
  profile_path?: string
  popularity: number
  known_for_department?: string
}

export interface Person {
  id: number
  name: string
  title?: string
  release_date?: string
  first_air_date?: string
  vote_average?: number
  poster_path?: string
  profile_path: string
  popularity: number
  known_for_department: string
}

export type Content = Movie | TVShow | Person



// DEFAULT FILTERS / VARSayıLAN FİLTRELER
const getDefaultFilters = (): FilterOptions => ({
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

// API ENDPOINT MAPPING / API UÇ NOKTA EŞLEŞTİRMESİ
const getApiEndpoint = (contentType: ContentType): string => {
  switch (contentType) {
    case 'movie': return '/movie/popular'
    case 'tv': return '/tv/popular'
    case 'person': return '/person/popular'
    default: return '/movie/popular'
  }
}

// CONTENT LIST COMPOSABLE / İÇERİK LİSTESİ COMPOSABLE
export function useContentList(contentType: ContentType, pageConfig?: any) {
  const route = useRoute()
  const router = useRouter()
  const { request, getImageUrl } = useTmdb()
  const { fetchGlobalProviderCounts, getCachedCounts } = useGlobalProviderCounts()

  // CONSTANTS / SABİTLER
  const UI_MAX_PAGE = 500

  // REACTIVE STATE / REAKTİF DURUM
  const allItemsRaw = ref<Content[]>([])
  const allItems = ref<Content[]>([])
  const items = ref<Content[]>([])
  const isLoading = ref(false)
  const totalPages = ref(0)
  const providerCounts = ref<Record<number, number>>({})
  const selectedProviders = ref<number[]>([])
  const isProvidersLoading = ref(false)
  const isSearching = ref(false)
  const movieProviders = new Map<number, Set<number>>()

  // FILTER STATE / FİLTRE DURUMU
  const currentFilters = ref<FilterOptions>(getDefaultFilters())

  // COMPUTED PROPERTIES / HESAPLANMIŞ ÖZELLİKLER
  const page = computed(() => {
    const pageParam = Number(route.query.page) || 1
    return Math.max(1, Math.min(pageParam, UI_MAX_PAGE))
  })

  // FETCH ALL CONTENT / TÜM İÇERİĞİ GETİR
  async function fetchAllContent() {
    try {
      isLoading.value = true
      allItemsRaw.value = []
      
      // Tüm sayfaları getir (maksimum 500 sayfa)
      const allResults: any[] = []
      const maxPages = Math.min(500, 20) // İlk 20 sayfa yeterli
      
      for (let page = 1; page <= maxPages; page++) {
        const params: any = { 
          page,
          sort_by: 'popularity.desc',
          ...(pageConfig?.params || {})
        }
        
        const endpoint = getApiEndpoint(contentType)
        const response = await request(endpoint, params) as any
        
        if (response && response.results) {
          allResults.push(...response.results)
        }
        
        // Rate limiting için kısa bekleme
        if (page < maxPages) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      // TRANSFORM DATA / VERİYİ DÖNÜŞTÜR
      const transformData = (data: any[]): Content[] => {
        return data.map(item => ({
          id: item.id,
          title: item.title || item.name,
          name: item.name || item.title,
          release_date: item.release_date || item.first_air_date,
          first_air_date: item.first_air_date || item.release_date,
          vote_average: item.vote_average,
          poster_path: item.poster_path || item.profile_path,
          profile_path: item.profile_path || item.poster_path,
          popularity: item.popularity,
          known_for_department: item.known_for_department
        }))
      }
      
      allItemsRaw.value = transformData(allResults)
      allItems.value = [...allItemsRaw.value]
      applyFilters()
      
    } catch (error) {
      allItemsRaw.value = []
      allItems.value = []
      items.value = []
    } finally {
      isLoading.value = false
    }
  }

  // APPLY FILTERS / FİLTRELERİ UYGULA
  function applyFilters() {
    let filtered = [...allItemsRaw.value]
    
    // Genre filter
    if (currentFilters.value.genres.length > 0) {
      // Genre filtering logic here
    }
    
    // Rating filter
    if (currentFilters.value.minRating > 0 || currentFilters.value.maxRating < 10) {
      filtered = filtered.filter(item => {
        const rating = item.vote_average || 0
        return rating >= currentFilters.value.minRating && rating <= currentFilters.value.maxRating
      })
    }
    
    // Runtime filter
    if (currentFilters.value.minRuntime > 0 || currentFilters.value.maxRuntime < 360) {
      // Runtime filtering logic here
    }
    
    // Votes filter
    if (currentFilters.value.minVotes > 0 || currentFilters.value.maxVotes < 50000) {
      // Votes filtering logic here
    }
    
    // Language filter
    if (currentFilters.value.language) {
      // Language filtering logic here
    }
    
    // Date filter
    if (currentFilters.value.releaseDateFrom || currentFilters.value.releaseDateTo) {
      // Date filtering logic here
    }
    
    // Keywords filter
    if (currentFilters.value.keywords.length > 0) {
      // Keywords filtering logic here
    }
    
    // Sort
    if (currentFilters.value.sortBy && currentFilters.value.sortOrder) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any
        
        switch (currentFilters.value.sortBy) {
          case 'popularity':
            aValue = a.popularity || 0
            bValue = b.popularity || 0
            break
          case 'vote_average':
            aValue = a.vote_average || 0
            bValue = b.vote_average || 0
            break
          case 'release_date':
            aValue = new Date(a.release_date || a.first_air_date || '1900-01-01')
            bValue = new Date(b.release_date || b.first_air_date || '1900-01-01')
            break
          default:
            aValue = a.popularity || 0
            bValue = b.popularity || 0
        }
        
        if (currentFilters.value.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    }
    
    allItems.value = filtered
    updatePagination()
  }

  // UPDATE PAGINATION / SAYFALAMAYI GÜNCELLE
  function updatePagination() {
    const itemsPerPage = 20
    totalPages.value = Math.ceil(allItems.value.length / itemsPerPage)
    
    const startIndex = (page.value - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    items.value = allItems.value.slice(startIndex, endIndex)
  }

  // FILTER HANDLERS / FİLTRE İŞLEYİCİLERİ
  function handleGenresChange(genres: number[]) {
    currentFilters.value.genres = [...genres]
  }

  function handleUserScoreChange(range: { min: number; max: number }) {
    currentFilters.value.minRating = range.min
    currentFilters.value.maxRating = range.max
  }

  function handleRuntimeChange(range: { min: number; max: number }) {
    currentFilters.value.minRuntime = range.min
    currentFilters.value.maxRuntime = range.max
  }

  function handleVotesChange(range: { min: number; max: number }) {
    currentFilters.value.minVotes = range.min
    currentFilters.value.maxVotes = range.max
  }

  function handleLanguageChange(language: string) {
    currentFilters.value.language = language
  }

  function handleReleaseDateChange(range: { from: string; to: string }) {
    currentFilters.value.releaseDateFrom = range.from
    currentFilters.value.releaseDateTo = range.to
  }

  function handleKeywordsChange(keywords: { id: number; name: string }[]) {
    currentFilters.value.keywords = [...keywords]
  }

  function handleSortChange(sort: { sortBy: string; sortOrder: 'asc' | 'desc' }) {
    currentFilters.value.sortBy = sort.sortBy
    currentFilters.value.sortOrder = sort.sortOrder
  }

  function handleProvidersChange(providers: number[]) {
    selectedProviders.value = [...providers]
  }

  function handleSearch() {
    isSearching.value = true
    router.push({ query: { ...route.query, page: 1 } })
    applyFilters()
    setTimeout(() => {
      isSearching.value = false
    }, 1000)
  }

  // PAGINATION / SAYFALAMA
  function go(pageNum: number) {
    const safeTotal = totalPages.value || UI_MAX_PAGE
    const targetPage = Math.max(1, Math.min(safeTotal, pageNum))
    router.push({ query: { ...route.query, page: targetPage } })
    updatePagination()
  }

  // RESET FILTERS / FİLTRELERİ SIFIRLA
  function resetFilters() {
    currentFilters.value = getDefaultFilters()
    router.push({ query: {} })
    applyFilters()
  }

  // WATCH PAGE CHANGES / SAYFA DEĞİŞİKLİKLERİNİ İZLE
  watch(() => page.value, () => {
    updatePagination()
  })

  // INITIALIZE ON MOUNT / BAŞLATMA
  onMounted(() => {
    fetchAllContent()
  })

  // RETURN COMPOSABLE API / COMPOSABLE API'SİNİ DÖNDÜR
  return {
    // STATE / DURUM
    items,
    isLoading,
    totalPages,
    page,
    currentFilters,
    providerCounts,
    selectedProviders,
    isProvidersLoading,
    isSearching,
    
    // FUNCTIONS / FONKSİYONLAR
    fetchAllContent,
    go,
    resetFilters,
    
    // HANDLERS / İŞLEYİCİLER
    handleGenresChange,
    handleUserScoreChange,
    handleRuntimeChange,
    handleVotesChange,
    handleLanguageChange,
    handleReleaseDateChange,
    handleKeywordsChange,
    handleSortChange,
    handleProvidersChange,
    handleSearch,
    
    // UTILITIES / YARDIMCILAR
    getImageUrl
  }
}
