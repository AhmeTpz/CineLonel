# ===================================================
# PEOPLE LIST PAGE / KİŞİLER LİSTESİ SAYFASI
# ===================================================

<script setup lang="ts">
import PageLayout from './PageLayout.vue'
import HeroSection from './HeroSection.vue'
import ContentSection from './ContentSection.vue'
import ContentGrid from '../cards/ContentGrid.vue'
import Pagination from '../ui/Pagination.vue'
import type { Content } from '../../composables/useContentList'

// PROPS / ÖZELLİKLER
interface Props {
  // PAGE CONFIG / SAYFA YAPILANDIRMASI
  title: string
  subtitle: string
  gradientClass: string
  titleGradientClass: string
  stats: Array<{ value: number | string; label: string }>
  
  // CONTENT CONFIG / İÇERİK YAPILANDIRMASI
  items: Content[]
  isLoading: boolean
  
  // LOADING CONFIG / YÜKLEME YAPILANDIRMASI
  loadingText: string
  loadingColor: string
  noResultsTitle: string
  noResultsText: string
  iconGradient: string
  
  // PAGINATION CONFIG / SAYFALAMA YAPILANDIRMASI
  currentPage: number
  totalPages: number
}

const props = defineProps<Props>()

// EMITS / YAYINLANAN OLAYLAR
interface Emits {
  (e: 'update:page', page: number): void
}

const emit = defineEmits<Emits>()

// HANDLE PAGE UPDATE / SAYFA GÜNCELLEMESİNİ YÖNET
const handlePageUpdate = (newPage: number) => {
  emit('update:page', newPage)
}
</script>

<template>
  <!-- PEOPLE LIST PAGE / KİŞİLER LİSTESİ SAYFASI -->
  <PageLayout>
    <!-- HERO SECTION / KAHRAMAN BÖLÜMÜ -->
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
    >
      <!-- SIMPLE PAGINATION / BASİT SAYFALAMA -->
      <template #pagination>
        <div class="w-full flex justify-center">
          <Pagination
            :current-page="currentPage"
            :total-pages="totalPages"
            @update:page="handlePageUpdate"
          />
        </div>
      </template>

      <!-- CONTENT GRID / İÇERİK GRİDİ -->
      <ContentGrid
        :items="items"
        content-type="person"
      />

      <!-- BOTTOM PAGINATION / ALT SAYFALANDIRMA -->
      <template #bottom-pagination>
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @update:page="handlePageUpdate"
        />
      </template>
    </ContentSection>
  </PageLayout>
</template>
