# ===================================================
# CONTENT LIST PAGE LAYOUT / İÇERİK LİSTESİ SAYFA DÜZENİ
# ===================================================

<script setup lang="ts">
import PageLayout from './PageLayout.vue'
import HeroSection from './HeroSection.vue'
import ContentSection from './ContentSection.vue'
import FilterBar from '../filters/FilterBar.vue'
import ContentGrid from '../cards/ContentGrid.vue'
import Pagination from '../ui/Pagination.vue'
import type { Content, ContentType } from '../../composables/useContentList'

// FILTER CONTENT TYPE / FİLTRE İÇERİK TİPİ
type FilterContentType = 'movie' | 'tv'
import type { FilterOptions } from '../../composables/useFilters'

// PROPS / ÖZELLİKLER
interface Props {
  // PAGE CONFIG / SAYFA YAPILANDIRMASI
  title: string
  subtitle: string
  gradientClass: string
  titleGradientClass: string
  stats: Array<{ value: number | string; label: string }>
  
  // CONTENT CONFIG / İÇERİK YAPILANDIRMASI
  contentType: ContentType
  filterContentType: FilterContentType
  items: Content[]
  isLoading: boolean
  currentFilters: FilterOptions
  
  // LOADING CONFIG / YÜKLEME YAPILANDIRMASI
  loadingText: string
  loadingColor: string
  noResultsTitle: string
  noResultsText: string
  iconGradient: string
  
  // PROVIDER CONFIG / SAĞLAYICI YAPILANDIRMASI
  providerCounts: Record<number, number>
  selectedProviders: number[]
  isProvidersLoading: boolean
  isSearching: boolean
  
  // PAGINATION CONFIG / SAYFALAMA YAPILANDIRMASI
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
  (e: 'reset-filters'): void
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

const handleResetFilters = () => {
  emit('reset-filters')
}
</script>

<template>
  <!-- CONTENT LIST PAGE / İÇERİK LİSTESİ SAYFASI -->
  <PageLayout>
    <!-- HERO SECTION / HERO BÖLÜMÜ -->
    <HeroSection
      :title="title"
      :subtitle="subtitle"
      :gradient-class="gradientClass"
      :title-gradient-class="titleGradientClass"
      :stats="stats"
    />

    <!-- CONTENT SECTION / İÇERİK BÖLÜMÜ -->
    <ContentSection
      class="content-section"
      :is-loading="isLoading"
      :has-items="items.length > 0"
      :loading-text="loadingText"
      :loading-color="loadingColor"
      :no-results-title="noResultsTitle"
      :no-results-text="noResultsText"
      :icon-gradient="iconGradient"
      @reset-filters="handleResetFilters"
    >
      <!-- FILTER BAR SLOT / FİLTRE ÇUBUĞU YUVASI -->
      <template #pagination>
        <FilterBar
          :content-type="filterContentType"
          :current-filters="currentFilters"
          :provider-counts="providerCounts"
          :selected-providers="selectedProviders"
          :is-providers-loading="isProvidersLoading"
          :is-searching="isSearching"
          :current-page="currentPage"
          :total-pages="totalPages"
          @filters-change="handleFiltersChange"
          @providers-change="handleProvidersChange"
          @sort-change="handleSortChange"
          @search="handleSearch"
          @page-change="handlePageChange"
        />
      </template>

      <!-- CONTENT GRID / İÇERİK GRİDİ -->
      <ContentGrid
        :items="items"
        :content-type="contentType"
        :animation-delay="0.1"
      />

      <!-- BOTTOM PAGINATION / ALT SAYFALAMA -->
      <template #bottom-pagination>
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @update:page="handlePageChange"
        />
      </template>
    </ContentSection>
  </PageLayout>
</template>
