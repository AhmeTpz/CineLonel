<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

import { useTmdb } from '../../composables/useTmdb'
import PopularCard from '../../components/cards/PopularCard.vue'
import Pagination from '../../components/ui/Pagination.vue'
import PageLayout from '../../components/layout/PageLayout.vue'
import HeroSection from '../../components/layout/HeroSection.vue'
import ContentSection from '../../components/layout/ContentSection.vue'
const route = useRoute()
const { request, getImageUrl } = useTmdb()

interface Person {
  id: number
  name: string
  known_for_department: string
  profile_path: string
}

const items = ref<Person[]>([])
const isLoading = ref(false)
const totalPages = ref(0)
const UI_MAX_PAGE = 500

const page = computed(() => {
  const pageParam = Number(route.query.page) || 1
  return Math.max(1, Math.min(pageParam, UI_MAX_PAGE))
})

async function fetchPeople(pageNum: number) {
  try {
    isLoading.value = true

    const apiPage1 = (pageNum - 1) * 2 + 1
    const apiPage2 = (pageNum - 1) * 2 + 2

    const [response1, response2] = await Promise.all([
      request<{ total_pages: number; results: Person[] }>('/person/popular', { page: apiPage1 }),
      request<{ total_pages: number; results: Person[] }>('/person/popular', { page: apiPage2 })
    ])

    const allResults = [
      ...(response1.results || []),
      ...(response2.results || [])
    ]

    const seenIds = new Set()
    const uniqueResults = allResults.filter(person => {
      if (seenIds.has(person.id)) {
        return false
      }
      seenIds.add(person.id)
      return true
    })

    items.value = uniqueResults
    totalPages.value = Math.min(response1.total_pages || 0, UI_MAX_PAGE)
  } catch (error) {
    items.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchPeople(page.value)
})


watch(() => page.value, (newPage) => {
  fetchPeople(newPage)
})

function go(p: number) {
  const safeTotal = totalPages.value || UI_MAX_PAGE
  navigateTo({ query: { page: Math.max(1, Math.min(safeTotal, p)) } })
}
</script>

<template>
  <PageLayout>
    <HeroSection
      title="People"
      subtitle="Discover talented actors, directors, and creators"
      gradient-class="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600"
      title-gradient-class="bg-gradient-to-r from-yellow-300 to-green-300 bg-clip-text text-transparent"
      :stats="[
        { value: items.length, label: 'People' },
        { value: totalPages, label: 'Pages' },
        { value: page, label: 'Current' }
      ]"
    />

    <ContentSection
      class="content-section"
      :is-loading="isLoading"
      :has-items="items.length > 0"
      loading-text="Loading amazing people..."
      loading-color="border-green-500 border-t-transparent"
      no-results-title="No People Found"
      no-results-text="Try adjusting your search or check back later for new profiles."
      icon-gradient="bg-gradient-to-r from-green-500 to-emerald-500"
    >
      <template #pagination>
        <Pagination
          :current-page="page"
          :total-pages="totalPages"
          @update:page="go"
        />
      </template>

      <!-- People Grid with Animation - 8 per row -->
      <div class="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        <div v-for="(person, index) in items" :key="person.id"
             class="animate-fade-in-up"
             :style="`animation-delay: ${index * 0.05}s;`">
          <PopularCard
            :id="person.id"
            :title="person.name"
            :subtitle="person.known_for_department"
            :poster="getImageUrl(person.profile_path, 'w500')"
            type="people"
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