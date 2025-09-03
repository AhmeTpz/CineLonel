# ===================================================
# SORT DROPDOWN / SIRALAMA AÇILIR MENÜSÜ
# ===================================================

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  contentType: 'movie' | 'tv'
  modelValue: { sortBy: string; sortOrder: 'asc' | 'desc' }
}

interface SortOption {
  value: string
  label: string
  order: 'asc' | 'desc'
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: { sortBy: string; sortOrder: 'asc' | 'desc' }]
}>()

const isOpen = ref(false)

// SORT OPTIONS / SIRALAMA SEÇENEKLERİ
const movieSortOptions: SortOption[] = [
  { value: 'popularity', label: 'Popularity (High to Low)', order: 'desc' },
  { value: 'popularity', label: 'Popularity (Low to High)', order: 'asc' },
  { value: 'release_date', label: 'Release Date (Newest)', order: 'desc' },
  { value: 'release_date', label: 'Release Date (Oldest)', order: 'asc' },
  { value: 'vote_average', label: 'Rating (High to Low)', order: 'desc' },
  { value: 'vote_average', label: 'Rating (Low to High)', order: 'asc' },
  { value: 'title', label: 'Title (A-Z)', order: 'asc' },
  { value: 'title', label: 'Title (Z-A)', order: 'desc' }
]

const tvSortOptions: SortOption[] = [
  { value: 'popularity', label: 'Popularity (High to Low)', order: 'desc' },
  { value: 'popularity', label: 'Popularity (Low to High)', order: 'asc' },
  { value: 'first_air_date', label: 'First Air Date (Newest)', order: 'desc' },
  { value: 'first_air_date', label: 'First Air Date (Oldest)', order: 'asc' },
  { value: 'vote_average', label: 'Rating (High to Low)', order: 'desc' },
  { value: 'vote_average', label: 'Rating (Low to High)', order: 'asc' },
  { value: 'name', label: 'Name (A-Z)', order: 'asc' },
  { value: 'name', label: 'Name (Z-A)', order: 'desc' }
]

const sortOptions = computed(() => {
  return props.contentType === 'movie' ? movieSortOptions : tvSortOptions
})

const selectedLabel = computed(() => {
  const option = sortOptions.value.find(
    opt => opt.value === props.modelValue.sortBy && opt.order === props.modelValue.sortOrder
  )
  return option?.label || 'Popularity'
})

function selectSort(option: SortOption) {
  emit('update:modelValue', {
    sortBy: option.value,
    sortOrder: option.order
  })
  isOpen.value = false
}

function handleClickOutside() {
  isOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="relative">
    <button
      @click.stop="isOpen = !isOpen"
      class="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-teal-500/60 via-cyan-500/70 to-blue-500/60 backdrop-blur-sm rounded-xl text-white font-medium transition-all duration-200 hover:from-teal-500/80 hover:via-cyan-500/90 hover:to-blue-500/80 min-w-[160px] justify-between"
    >
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
        </svg>
        <span class="truncate">{{ selectedLabel }}</span>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 transition-transform flex-shrink-0" :class="{ 'rotate-180': isOpen }">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    </button>
    
    <!-- Sort Dropdown -->
    <div v-if="isOpen" class="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl border border-green-200/50 rounded-2xl shadow-2xl z-[9999] overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-green-100">
        <h3 class="text-green-800 font-semibold text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
          </svg>
          Sort Options
        </h3>
      </div>
      
      <!-- Sort Options -->
      <div class="max-h-64 overflow-y-auto">
        <button
          v-for="option in sortOptions"
          :key="`${option.value}-${option.order}`"
          @click="selectSort(option)"
          class="w-full px-4 py-3 text-left text-green-700 hover:bg-green-50 transition-colors border-b border-green-100 last:border-b-0 flex items-center justify-between"
          :class="{ 'bg-green-100 text-green-800 font-medium': modelValue.sortBy === option.value && modelValue.sortOrder === option.order }"
        >
          <span class="text-sm">{{ option.label }}</span>
          <svg v-if="modelValue.sortBy === option.value && modelValue.sortOrder === option.order" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-green-600">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
