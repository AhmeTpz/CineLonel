# ===================================================
# ON THE AIR TV SHOWS PAGE / YAYINDAKİ TV DİZİLERİ SAYFASI
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

interface TvShow {
  id: number
  name: string
  first_air_date: string
  vote_average: number
  poster_path: string
  popularity?: number
}

const allShowsRaw = ref<TvShow[]>([])
const allShows = ref<TvShow[]>([])
const providerCounts = ref<Record<number, number>>({})
const selectedProviders = ref<number[]>([])
const isProvidersLoading = ref(false)
const showProviders = new Map<number, Set<number>>()
const items = ref<TvShow[]>([])
const isLoading = ref(false)
const totalPages = ref(0)
const isSearching = ref(false)
const languageCounts = ref<Record<string, number>>({})

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

async function fetchAllShows() {
  try {
    isLoading.value = true

    const allResults: TvShow[] = []
    let currentPage = 1
    let hasMorePages = true

    while (hasMorePages && currentPage <= 75) {
      const response = await request<{ total_pages: number; results: TvShow[] }>('/tv/on_the_air', {
        page: currentPage,
        region: 'US'
      })

      if (response.results && response.results.length > 0) {
        allResults.push(...response.results)
        currentPage++
        hasMorePages = currentPage <= response.total_pages
      } else {
        hasMorePages = false
      }
    }

    const uniqueShows = allResults.filter((show, index, self) =>
      index === self.findIndex(s => s.id === show.id)
    )

    allShowsRaw.value = uniqueShows
    languageCounts.value = aggregateLanguageCounts(allShowsRaw.value)
    allShows.value = uniqueShows
    totalPages.value = Math.ceil(allShows.value.length / 20)
    updateDisplayedItems()
    
    setTimeout(() => {
      computeProviderCountsForList(allShowsRaw.value)
    }, 100)
  } catch (error) {
    allShows.value = []
    items.value = []
  } finally {
    isLoading.value = false
  }
}

function updateDisplayedItems() {
  const startIndex = (page.value - 1) * 20
  const endIndex = startIndex + 20
  items.value = allShows.value.slice(startIndex, endIndex)
}

function aggregateLanguageCounts(list: TvShow[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const s of list) {
    const lang = (s as any).original_language || ''
    if (!lang) continue
    counts[lang] = (counts[lang] || 0) + 1
  }
  return counts
}

function handleSortChange(sortValue: { sortBy: string; sortOrder: 'asc' | 'desc' }) {
  currentFilters.value.sortBy = sortValue.sortBy
  currentFilters.value.sortOrder = sortValue.sortOrder
}

async function handleSearch() {
  await applyFiltersAndSort()
  updateDisplayedItems()
}

function sortAllShows(list: TvShow[]) {
  const sorted = [...list].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (currentFilters.value.sortBy) {
      case 'popularity':
        aValue = a.popularity ?? a.vote_average ?? 0
        bValue = b.popularity ?? b.vote_average ?? 0
        break
      case 'vote_average':
        aValue = a.vote_average || 0
        bValue = b.vote_average || 0
        break
      case 'first_air_date':
        aValue = new Date(a.first_air_date || '1900-01-01')
        bValue = new Date(b.first_air_date || '1900-01-01')
        break
      case 'name':
        aValue = a.name || ''
        bValue = b.name || ''
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

const runtimeCache = new Map<number, number | null>()
async function ensureRuntimesFor(shows: TvShow[]) {
  const toFetch = shows.filter(s => !runtimeCache.has(s.id))
  let idx = 0
  const concurrency = 6
  async function worker() {
    while (idx < toFetch.length) {
      const cur = toFetch[idx++] as TvShow
      try {
        const detail = await request<{ episode_run_time?: number[] | null }>(`/tv/${cur.id}`)
        const rtArr = detail.episode_run_time ?? null
        const run: number | null = Array.isArray(rtArr) && rtArr.length > 0 ? (rtArr[0] as number) : null
        runtimeCache.set(cur.id, run)
      } catch {
        runtimeCache.set(cur.id, null)
      }
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, toFetch.length) }, worker)
  await Promise.all(workers)
}

async function computeProviderCountsForList(list: TvShow[]) {
  providerCounts.value = {}
  showProviders.clear()
  isProvidersLoading.value = true
  const counts: Record<number, number> = {}
  const concurrency = 12
  let index = 0
  async function worker() {
    while (index < list.length) {
      const i = index++
      const s = list[i]
      if (!s) continue
      try {
        const wp = await request<any>(`/tv/${s.id}/watch/providers`)
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
        showProviders.set(s.id, set)
      } catch {}
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, list.length) }, () => worker()))
  providerCounts.value = counts
  isProvidersLoading.value = false
}

async function applyFiltersAndSort() {
  let list = [...allShowsRaw.value]

  if (currentFilters.value.genres.length > 0) {
    list = list.filter(s => Array.isArray((s as any).genre_ids) && (s as any).genre_ids.some((g: number) => currentFilters.value.genres.includes(g)))
  }

  list = list.filter(s => (s.vote_average || 0) >= currentFilters.value.minRating && (s.vote_average || 0) <= currentFilters.value.maxRating)

  list = list.filter(s => ((s as any).vote_count || 0) >= currentFilters.value.minVotes && ((s as any).vote_count || 0) <= currentFilters.value.maxVotes)

  if (currentFilters.value.language) {
    list = list.filter(s => ((s as any).original_language || '') === currentFilters.value.language)
  }

  if (currentFilters.value.releaseDateFrom) {
    const from = new Date(currentFilters.value.releaseDateFrom).getTime()
    list = list.filter(s => new Date(s.first_air_date || '1900-01-01').getTime() >= from)
  }
  if (currentFilters.value.releaseDateTo) {
    const to = new Date(currentFilters.value.releaseDateTo).getTime()
    list = list.filter(s => new Date(s.first_air_date || '2900-01-01').getTime() <= to)
  }

  if (currentFilters.value.minRuntime > 0 || currentFilters.value.maxRuntime < 360) {
    await ensureRuntimesFor(list)
    list = list.filter(s => {
      const rt = runtimeCache.get(s.id)
      if (rt == null) return true
      return rt >= currentFilters.value.minRuntime && rt <= currentFilters.value.maxRuntime
    })
  }

  // Keywords filtering with OR logic
  if (currentFilters.value.keywords && currentFilters.value.keywords.length > 0) {
    const keywordShows = new Set<number>()
    
    for (const keyword of currentFilters.value.keywords) {
      try {
        const response = await request<{ results: TvShow[] }>('/discover/tv', {
          with_keywords: keyword.id.toString(),
          page: 1
        })
        
        if (response.results) {
          response.results.forEach(show => keywordShows.add(show.id))
        }
          } catch (error) {
      // Keyword TV shows fetch error - ignore
    }
    }
    
    // Filter list to only include shows that match any of the keywords
    list = list.filter(show => keywordShows.has(show.id))
  }

  if (selectedProviders.value.length > 0) {
    list = list.filter(s => {
      const set = showProviders.get(s.id)
      if (!set) return false
      return selectedProviders.value.some(pid => set.has(pid))
    })
  }

  list = sortAllShows(list)
  allShows.value = list
  totalPages.value = Math.ceil(allShows.value.length / 20)
}

function handleGenresChange(genres: number[]) { currentFilters.value.genres = genres }
function handleUserScoreChange(range: { min: number; max: number }) { currentFilters.value.minRating = range.min; currentFilters.value.maxRating = range.max }
function handleRuntimeChange(range: { min: number; max: number }) { currentFilters.value.minRuntime = range.min; currentFilters.value.maxRuntime = range.max }
function handleVotesChange(range: { min: number; max: number }) { currentFilters.value.minVotes = range.min; currentFilters.value.maxVotes = range.max }
function handleLanguageChange(language: string) { currentFilters.value.language = language }
function handleReleaseDateChange(range: { from: string; to: string }) { 
  currentFilters.value.releaseDateFrom = range.from; 
  currentFilters.value.releaseDateTo = range.to 
}

function handleKeywordsChange(keywords: { id: number; name: string }[]) {
  currentFilters.value.keywords = keywords
}

onMounted(() => {
  fetchAllShows()
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
      title="On The Air"
      subtitle="Currently airing TV shows"
      gradient-class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
      title-gradient-class="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent"
      :stats="[
        { value: items.length, label: 'Shows' },
        { value: totalPages, label: 'Pages' },
        { value: page, label: 'Current' }
      ]"
    />

    <ContentSection
      class="content-section"
      :is-loading="isLoading"
      :has-items="items.length > 0"
      loading-text="Loading on the air TV shows..."
      loading-color="border-blue-500 border-t-transparent"
      no-results-title="No TV Shows Found"
      no-results-text="Try adjusting your search or check back later for new series."
      icon-gradient="bg-gradient-to-r from-blue-500 to-indigo-500"
      @reset-filters="(() => { router.push({ query: {} }); fetchAllShows(); })()"
    >
      <template #pagination>
        <div class="relative flex items-center w-full">
          <div class="flex items-center gap-10">
            <FiltersDropdown 
              content-type="tv"
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
              content-type="tv"
              :provider-counts="providerCounts"
              :current-providers="selectedProviders"
              :is-loading="isProvidersLoading"
              @providers-change="(l: number[]) => { selectedProviders = l as unknown as any; }"
            />
          </div>

          <div class="absolute left-1/2 transform -translate-x-1/2">
            <Pagination
              :current-page="page"
              :total-pages="totalPages"
              @update:page="go"
            />
          </div>

          <div class="flex items-center gap-10 ml-auto">
            <SortDropdown 
              content-type="tv"
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

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <div v-for="(show, index) in items" :key="show.id"
             class="animate-fade-in-up"
             :style="`animation-delay: ${index * 0.1}s;`">
          <PopularCard
            :id="show.id"
            :title="show.name"
            :release-date="show.first_air_date"
            :rating="Math.round((show.vote_average || 0) * 10)"
            :poster="getImageUrl(show.poster_path, 'w500')"
            type="tv"
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
