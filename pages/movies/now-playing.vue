# ===================================================
# NOW PLAYING MOVIES PAGE / ŞU AN OYNATILAN FİLMLER SAYFASI
# ===================================================

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useTmdb } from '../../composables/useTmdb'
import PopularCard from '../../components/cards/PopularCard.vue'
import Pagination from '../../components/ui/Pagination.vue'
import PageLayout from '../../components/layout/PageLayout.vue'
import HeroSection from '../../components/layout/HeroSection.vue'
import ContentSection from '../../components/layout/ContentSection.vue'
import FiltersDropdown from '../../components/filters/dropdowns/FiltersDropdown.vue'
import WhereToWatchDropdown from '../../components/filters/dropdowns/WhereToWatchDropdown.vue'
import SortDropdown from '../../components/filters/dropdowns/SortDropdown.vue'
import SearchButton from '../../components/filters/buttons/SearchButton.vue'

const route = useRoute()
const router = useRouter()
const { request, getImageUrl } = useTmdb()

const UI_MAX_PAGE = 500

interface Movie {
  id: number
  title: string
  release_date: string
  vote_average: number
  poster_path: string
  popularity?: number
}

const allMoviesRaw = ref<Movie[]>([])
const allMovies = ref<Movie[]>([])
const items = ref<Movie[]>([])
const languageCounts = ref<Record<string, number>>({})
const providerCounts = ref<Record<number, number>>({})
const selectedProviders = ref<number[]>([])
const isProvidersLoading = ref(false)
const movieProviders = new Map<number, Set<number>>()
const isLoading = ref(false)
const totalPages = ref(0)

// Filter options interface
interface FilterOptions {
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

const currentFilters = ref<FilterOptions>({
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

const page = computed(() => {
  const pageParam = Number(route.query.page) || 1
  return Math.max(1, Math.min(pageParam, UI_MAX_PAGE))
})

async function fetchAllMovies() {
  try {
    isLoading.value = true

    // Fetch all pages of now playing movies
    const allResults: Movie[] = []
    let currentPage = 1
    let hasMorePages = true

    while (hasMorePages && currentPage <= 30) { 
      const response = await request<{ total_pages: number; results: Movie[] }>('/movie/now_playing', { 
        page: currentPage,
        region: 'US' // Explicitly set US region for more accurate data
      })
      
      if (response.results && response.results.length > 0) {
        allResults.push(...response.results)
        currentPage++
        hasMorePages = currentPage <= response.total_pages
      } else {
        hasMorePages = false
      }
    }

    // Remove duplicates by ID
    const uniqueMovies = allResults.filter((movie, index, self) => 
      index === self.findIndex(m => m.id === movie.id)
    )

    // Filter movies from last 1 year
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    
    const recentMovies = uniqueMovies.filter(movie => {
      const releaseDate = new Date(movie.release_date)
      return releaseDate >= oneYearAgo
    })

    allMoviesRaw.value = recentMovies
    // Sayfaya özel dil sayımlarını hazırla
    languageCounts.value = aggregateLanguageCounts(allMoviesRaw.value)
    allMovies.value = recentMovies
    totalPages.value = Math.ceil(allMovies.value.length / 20)
    updateDisplayedItems()
    
    // WhereToWatch verilerini arka planda yükle (lazy loading)
    setTimeout(() => {
      computeProviderCountsForList(allMoviesRaw.value)
    }, 100)
  } catch (error) {
    allMovies.value = []
    items.value = []
  } finally {
    isLoading.value = false
  }
}

function updateDisplayedItems() {
  const startIndex = (page.value - 1) * 20
  const endIndex = startIndex + 20
  items.value = allMovies.value.slice(startIndex, endIndex)
}

function aggregateLanguageCounts(list: Movie[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const m of list) {
    const lang = (m as any).original_language || ''
    if (!lang) continue
    counts[lang] = (counts[lang] || 0) + 1
  }
  return counts
}

function handleSortChange(sortValue: { sortBy: string; sortOrder: 'asc' | 'desc' }) {
  currentFilters.value.sortBy = sortValue.sortBy
  currentFilters.value.sortOrder = sortValue.sortOrder
}

function handleGenresChange(genres: number[]) {
  currentFilters.value.genres = genres
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
  currentFilters.value.keywords = keywords
}

async function handleSearch() {
  await applyFiltersAndSort()
  updateDisplayedItems()
}

function sortAllMovies(list: Movie[]) {
  const sorted = [...list].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (currentFilters.value.sortBy) {
      case 'popularity':
        aValue = a.popularity ?? 0
        bValue = b.popularity ?? 0
        break
      case 'vote_average':
        aValue = a.vote_average || 0
        bValue = b.vote_average || 0
        break
      case 'release_date':
        aValue = new Date(a.release_date || '1900-01-01')
        bValue = new Date(b.release_date || '1900-01-01')
        break
      case 'title':
        aValue = a.title || ''
        bValue = b.title || ''
        break
      default:
        aValue = a.vote_average || 0
        bValue = b.vote_average || 0
    }

    if (currentFilters.value.sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  return sorted
}

const isSearching = ref(false)

// Runtime cache and filtering pipeline
const runtimeCache = new Map<number, number | null>()

async function ensureRuntimesFor(movies: Movie[]) {
  const toFetch = movies.filter(m => !runtimeCache.has(m.id))
  const concurrency = 6
  let index = 0
  async function worker() {
    while (index < toFetch.length) {
      const current = toFetch[index++] as Movie
      try {
        const detail = await request<{ runtime: number | null }>(`/movie/${current!.id}`)
        runtimeCache.set(current!.id, detail.runtime ?? null)
      } catch {
        runtimeCache.set(current!.id, null)
      }
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, toFetch.length) }, worker)
  await Promise.all(workers)
}

async function applyFiltersAndSort() {
  let list = [...allMoviesRaw.value]

  if (currentFilters.value.genres.length > 0) {
    list = list.filter(m => Array.isArray((m as any).genre_ids) && (m as any).genre_ids.some((g: number) => currentFilters.value.genres.includes(g)))
  }

  list = list.filter(m => (m.vote_average || 0) >= currentFilters.value.minRating && (m.vote_average || 0) <= currentFilters.value.maxRating)

  list = list.filter(m => ((m as any).vote_count || 0) >= currentFilters.value.minVotes && ((m as any).vote_count || 0) <= currentFilters.value.maxVotes)

  if (currentFilters.value.language) {
    list = list.filter(m => ((m as any).original_language || '') === currentFilters.value.language)
  }

  if (currentFilters.value.releaseDateFrom) {
    const from = new Date(currentFilters.value.releaseDateFrom).getTime()
    list = list.filter(m => new Date(m.release_date || '1900-01-01').getTime() >= from)
  }
  if (currentFilters.value.releaseDateTo) {
    const to = new Date(currentFilters.value.releaseDateTo).getTime()
    list = list.filter(m => new Date(m.release_date || '2900-01-01').getTime() <= to)
  }

  if (currentFilters.value.minRuntime > 0 || currentFilters.value.maxRuntime < 360) {
    await ensureRuntimesFor(list)
    list = list.filter(m => {
      const rt = runtimeCache.get(m.id)
      if (rt == null) return true
      return rt >= currentFilters.value.minRuntime && rt <= currentFilters.value.maxRuntime
    })
  }

  // Keywords filtering with OR logic
  if (currentFilters.value.keywords && currentFilters.value.keywords.length > 0) {
    const keywordMovies = new Set<number>()
    
    for (const keyword of currentFilters.value.keywords) {
      try {
        const response = await request<{ results: Movie[] }>('/discover/movie', {
          with_keywords: keyword.id.toString(),
          page: 1
        })
        
        if (response.results) {
          response.results.forEach(movie => keywordMovies.add(movie.id))
        }
          } catch (error) {
      // Keyword movies fetch error - ignore
    }
    }
    
    // Filter list to only include movies that match any of the keywords
    list = list.filter(movie => keywordMovies.has(movie.id))
  }

  // WhereToWatch provider filtering (OR)
  if (selectedProviders.value.length > 0) {
    list = list.filter(m => {
      const set = movieProviders.get(m.id)
      if (!set) return false
      return selectedProviders.value.some(pid => set.has(pid))
    })
  }

  list = sortAllMovies(list)

  allMovies.value = list
  totalPages.value = Math.ceil(allMovies.value.length / 20)
}

// Sayfa özel provider sayımı ve film->provider eşlemesi
async function computeProviderCountsForList(list: Movie[]) {
  providerCounts.value = {}
  movieProviders.clear()
  isProvidersLoading.value = true
  const counts: Record<number, number> = {}
  const concurrency = 12
  let index = 0
  async function worker() {
    while (index < list.length) {
      const i = index++
      const m = list[i]
      if (!m) continue
      try {
        const wp = await request<any>(`/movie/${m.id}/watch/providers`)
        const regionData = wp.results?.US
        const merged: Array<{ provider_id: number }> = [
          ...(regionData?.flatrate || []),
          ...(regionData?.rent || []),
          ...(regionData?.buy || []),
          ...(regionData?.ads || []),
          ...(regionData?.free || [])
        ]
        const set = new Set<number>()
        merged.forEach(pr => set.add(pr.provider_id))
        set.forEach(pid => { counts[pid] = (counts[pid] || 0) + 1 })
        movieProviders.set(m.id, set)
      } catch {}
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, list.length) }, () => worker()))
  providerCounts.value = counts
  isProvidersLoading.value = false
}

onMounted(() => {
  fetchAllMovies()
})

watch(() => page.value, () => {
  updateDisplayedItems()
})

function go(p: number) {
  const safeTotal = totalPages.value || UI_MAX_PAGE
  router.push({ query: { page: Math.max(1, Math.min(safeTotal, p)) } })
}
</script>

<template>
  <PageLayout>
    <HeroSection
      title="Now Playing Movies"
      subtitle="Movies currently playing in theaters"
      gradient-class="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600"
      title-gradient-class="bg-gradient-to-r from-lime-300 to-green-300 bg-clip-text text-transparent"
      :stats="[
        { value: items.length, label: 'Movies' },
        { value: totalPages, label: 'Pages' },
        { value: page, label: 'Current' }
      ]"
    />

    <ContentSection
      class="content-section"
      :is-loading="isLoading"
      :has-items="items.length > 0"
      loading-text="Loading now playing movies..."
      loading-color="border-green-500 border-t-transparent"
      no-results-title="No Movies Found"
      no-results-text="Try adjusting your search or check back later for new releases."
      icon-gradient="bg-gradient-to-r from-green-500 to-teal-500"
      @reset-filters="(() => { currentFilters = currentFilters; router.push({ query: {} }); fetchAllMovies(); })()"
    >
      <template #pagination>
        <div class="relative flex items-center w-full">
          <!-- Sol taraf: Filtreleme ve Where to Watch -->
          <div class="flex items-center gap-10">
            <FiltersDropdown 
              content-type="movie"
              :current-genres="currentFilters.genres"
              :current-user-score="{ min: currentFilters.minRating, max: currentFilters.maxRating }"
              :current-runtime="{ min: currentFilters.minRuntime, max: currentFilters.maxRuntime }"
              :current-votes="{ min: currentFilters.minVotes, max: currentFilters.maxVotes }"
              :current-language="currentFilters.language"
              :current-release-date="{ from: currentFilters.releaseDateFrom, to: currentFilters.releaseDateTo }"
              :current-keywords="currentFilters.keywords"
              :language-counts="languageCounts"
              @genres-change="handleGenresChange"
              @user-score-change="handleUserScoreChange"
              @runtime-change="handleRuntimeChange"
              @votes-change="handleVotesChange"
              @language-change="handleLanguageChange"
              @release-date-change="handleReleaseDateChange"
              @keywords-change="handleKeywordsChange"
            />
            <WhereToWatchDropdown 
              content-type="movie"
              :provider-counts="providerCounts"
              :current-providers="selectedProviders"
              :is-loading="isProvidersLoading"
              @providers-change="(l: number[]) => { selectedProviders = l as unknown as any; }"
            />
          </div>
          
          <!-- Orta: Pagination (mutlak ortada) -->
          <div class="absolute left-1/2 transform -translate-x-1/2">
            <Pagination
              :current-page="page"
              :total-pages="totalPages"
              @update:page="go"
            />
          </div>
          
          <!-- Sağ taraf: Sıralama ve Search -->
          <div class="flex items-center gap-10 ml-auto">
            <SortDropdown 
              content-type="movie"
              :model-value="{ sortBy: currentFilters.sortBy, sortOrder: currentFilters.sortOrder }"
              @update:model-value="handleSortChange"
            />
            <SearchButton 
              :loading="isSearching"
              @click="handleSearch"
            />
          </div>
        </div>
      </template>

      <!-- Movies Grid with Animation -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <div v-for="(movie, index) in items" :key="movie.id"
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

      <template #bottom-pagination>
        <Pagination
          :current-page="page"
          :total-pages="totalPages"
          @update:page="go"
        />
      </template>
    </ContentSection>
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
