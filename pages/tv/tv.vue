# ===================================================
# POPULAR TV SHOWS PAGE / POPÜLER TV DİZİLERİ SAYFASI
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
}

const items = ref<TvShow[]>([])
const isLoading = ref(false)
const totalPages = ref(0)
const providerCounts = ref<Record<number, number>>({})
const selectedProviders = ref<number[]>([])
const isProvidersLoading = ref(false)
const showProviders = new Map<number, Set<number>>()

const { fetchGlobalProviderCounts, getCachedCounts } = useGlobalProviderCounts()

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

async function fetchTvShows(pageNum: number, filters?: FilterOptions) {
  try {
    isLoading.value = true

    const params: any = { 
      page: pageNum,
      sort_by: 'popularity.desc'
    }
    
    if (filters) {
      if (filters.sortBy && filters.sortOrder) {
        params.sort_by = `${filters.sortBy}.${filters.sortOrder}`
      }
      
      if (filters.genres.length > 0) {
        params.with_genres = filters.genres.join(',')
      }
      
      if (filters.minRating > 0 || filters.maxRating < 10) {
        params['vote_average.gte'] = filters.minRating
        params['vote_average.lte'] = filters.maxRating
      }
      
      if (filters.releaseYear) {
        params.first_air_date_year = filters.releaseYear
      }

      if (filters.minRuntime > 0 || filters.maxRuntime < 360) {
        params['with_runtime.gte'] = filters.minRuntime
        params['with_runtime.lte'] = filters.maxRuntime
      }

      if (filters.minVotes > 0 || filters.maxVotes < 50000) {
        params['vote_count.gte'] = filters.minVotes
        params['vote_count.lte'] = filters.maxVotes
      }

      if (filters.language) {
        params.with_original_language = filters.language
      }
      
      if (filters.keywords && filters.keywords.length > 0) {
        params.with_keywords = filters.keywords.map(k => k.id).join('|')
      }

      if (selectedProviders.value && selectedProviders.value.length > 0) {
        params.with_watch_providers = selectedProviders.value.join('|')
        params.watch_region = 'US'
        params.with_watch_monetization_types = 'flatrate|rent|buy|ads|free'
      }
      
      if (filters.releaseDateFrom) {
        params['first_air_date.gte'] = filters.releaseDateFrom
      }
      if (filters.releaseDateTo) {
        params['first_air_date.lte'] = filters.releaseDateTo
      } else {
        const currentDate = new Date()
        const maxTvDate = new Date()
        maxTvDate.setMonth(currentDate.getMonth() + 6)
        params['first_air_date.lte'] = maxTvDate.toISOString().split('T')[0]
      }
    }

    const response = await request<{ total_pages: number; results: TvShow[] }>('/discover/tv', params)

    items.value = response.results || []
    totalPages.value = Math.min(response.total_pages || 0, UI_MAX_PAGE)
  } catch (error) {
    items.value = []
  } finally {
    isLoading.value = false
  }
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

function handleSearch() {
  router.push({ query: {} })
  fetchTvShows(1, currentFilters.value)
}



const isSearching = ref(false)

onMounted(async () => {
  fetchTvShows(page.value, currentFilters.value)
  
  setTimeout(async () => {
    isProvidersLoading.value = true
    try {
      const cached = getCachedCounts('tv')
      if (Object.keys(cached).length > 0) {
        providerCounts.value = cached
      } else {
        providerCounts.value = await fetchGlobalProviderCounts('tv')
      }
    } catch (error) {
      // Provider counts load error - ignore
    } finally {
      isProvidersLoading.value = false
    }
  }, 100)
})

watch(() => page.value, (newPage) => {
  fetchTvShows(newPage, currentFilters.value)
})

function go(p: number) {
  const safeTotal = totalPages.value || UI_MAX_PAGE
  router.push({ query: { page: Math.max(1, Math.min(safeTotal, p)) } })
}

function handleProvidersChange(list: number[]) {
  selectedProviders.value = [...list]
}


</script>

<template>
  <PageLayout>
    <HeroSection
      title="Popular TV Shows"
      subtitle="The most popular TV shows trending right now"
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
      loading-text="Loading popular TV shows..."
      loading-color="border-blue-500 border-t-transparent"
      no-results-title="No TV Shows Found"
      no-results-text="Try adjusting your search or check back later for new series."
      icon-gradient="bg-gradient-to-r from-blue-500 to-indigo-500"
      @reset-filters="() => { currentFilters = { sortBy: 'popularity', sortOrder: 'desc', genres: [], whereToWatch: [], minRating: 0, maxRating: 10, releaseYear: '', minRuntime: 0, maxRuntime: 360, minVotes: 0, maxVotes: 50000, language: '', releaseDateFrom: '', releaseDateTo: '', keywords: [] }; router.push({ query: {} }); fetchTvShows(1, currentFilters); }"
    >
      <template #pagination>
        <div class="relative flex items-center w-full">
          <!-- Sol taraf: Filtreleme ve Platforms -->
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
              @providers-change="handleProvidersChange"
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

      <!-- TV Shows Grid with Animation -->
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