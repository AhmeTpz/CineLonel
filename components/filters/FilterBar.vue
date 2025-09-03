# ===================================================
# FILTER BAR / FİLTRE ÇUBUĞU
# ===================================================

<script setup lang="ts">
import FiltersDropdown from './dropdowns/FiltersDropdown.vue'
import WhereToWatchDropdown from './dropdowns/WhereToWatchDropdown.vue'
import SortDropdown from './dropdowns/SortDropdown.vue'
import SearchButton from './buttons/SearchButton.vue'
import Pagination from '../ui/Pagination.vue'
import type { ContentType } from '../../composables/useContentList'

// FILTER CONTENT TYPE / FİLTRE İÇERİK TİPİ
type FilterContentType = 'movie' | 'tv'
import type { FilterOptions } from '../../composables/useFilters'

// PROPS / ÖZELLİKLER
interface Props {
  contentType: FilterContentType
  currentFilters: FilterOptions
  providerCounts: Record<number, number>
  selectedProviders: number[]
  isProvidersLoading: boolean
  isSearching: boolean
  currentPage: number
  totalPages: number
}

const props = defineProps<Props>()

// EMITS / OLAYLAR
interface Emits {
  (e: 'filters-change', filters: Partial<FilterOptions>): void
  (e: 'providers-change', providers: number[]): void
  (e: 'sort-change', sort: { sortBy: string; sortOrder: 'asc' | 'desc' }): void
  (e: 'search'): void
  (e: 'page-change', page: number): void
}

const emit = defineEmits<Emits>()

// HANDLERS / İŞLEYİCİLER
const handleFiltersChange = (filters: Partial<FilterOptions>) => {
  emit('filters-change', filters)
}

const handleProvidersChange = (providers: number[]) => {
  emit('providers-change', providers)
}

const handleSortChange = (sort: { sortBy: string; sortOrder: 'asc' | 'desc' }) => {
  emit('sort-change', sort)
}

const handleSearch = () => {
  emit('search')
}

const handlePageChange = (page: number) => {
  emit('page-change', page)
}
</script>

<template>
  <!-- FILTER BAR / FİLTRE ÇUBUĞU -->
  <div class="relative flex items-center w-full">
    <!-- LEFT SIDE: FILTERS AND WHERE TO WATCH / SOL TARAF: FİLTRELER VE NEREDE İZLENİR -->
    <div class="flex items-center gap-10">
      <FiltersDropdown 
        :content-type="contentType"
        :current-genres="currentFilters.genres"
        :current-user-score="{ min: currentFilters.minRating, max: currentFilters.maxRating }"
        :current-runtime="{ min: currentFilters.minRuntime, max: currentFilters.maxRuntime }"
        :current-votes="{ min: currentFilters.minVotes, max: currentFilters.maxVotes }"
        :current-language="currentFilters.language"
        :current-release-date="{ from: currentFilters.releaseDateFrom, to: currentFilters.releaseDateTo }"
        :current-keywords="currentFilters.keywords"
        @genres-change="(genres) => handleFiltersChange({ genres })"
        @user-score-change="(range) => handleFiltersChange({ minRating: range.min, maxRating: range.max })"
        @runtime-change="(range) => handleFiltersChange({ minRuntime: range.min, maxRuntime: range.max })"
        @votes-change="(range) => handleFiltersChange({ minVotes: range.min, maxVotes: range.max })"
        @language-change="(language) => handleFiltersChange({ language })"
        @release-date-change="(range) => handleFiltersChange({ releaseDateFrom: range.from, releaseDateTo: range.to })"
        @keywords-change="(keywords) => handleFiltersChange({ keywords })"
      />
      <WhereToWatchDropdown
        :content-type="contentType"
        :provider-counts="providerCounts"
        :current-providers="selectedProviders"
        :is-loading="isProvidersLoading"
        @providers-change="handleProvidersChange"
      />
    </div>
    
    <!-- CENTER: PAGINATION / ORTA: SAYFALAMA -->
    <div class="absolute left-1/2 transform -translate-x-1/2">
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @update:page="handlePageChange"
      />
    </div>
    
    <!-- RIGHT SIDE: SORT AND SEARCH / SAĞ TARAF: SIRALAMA VE ARAMA -->
    <div class="flex items-center gap-10 ml-auto">
      <SortDropdown 
        :content-type="contentType"
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