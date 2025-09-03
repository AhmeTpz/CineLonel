# ===================================================
# GENRE FILTER / TÜR FİLTRESİ
# ===================================================

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTmdb } from '~/composables/useTmdb'

interface Genre {
  id: number
  name: string
}

interface Props {
  contentType: 'movie' | 'tv'
  currentGenres?: number[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'genres-change': [genres: number[]]
}>()

const { request } = useTmdb()
const genres = ref<Genre[]>([])
const selectedGenres = ref<number[]>([])

async function fetchGenres() {
  try {
    const endpoint = props.contentType === 'movie' ? '/genre/movie/list' : '/genre/tv/list'
    const response = await request<{ genres: Genre[] }>(endpoint)
    genres.value = response.genres || []
      } catch (error) {
      // Genre fetch error - ignore
    }
}

function handleGenreToggle(genreId: number) {
  const index = selectedGenres.value.indexOf(genreId)
  if (index === -1) {
    selectedGenres.value.push(genreId)
  } else {
    selectedGenres.value.splice(index, 1)
  }
  emit('genres-change', selectedGenres.value)
}

function getGenreName(genreId: number): string {
  const genre = genres.value.find(g => g.id === genreId)
  return genre?.name || ''
}

onMounted(() => {
  fetchGenres()
  if (props.currentGenres) {
    selectedGenres.value = [...props.currentGenres]
  }
})
</script>

<template>
  <div class="space-y-3">
    <label class="block text-green-700 font-medium text-sm">Genres</label>
    <div class="bg-green-50 rounded-lg p-4 border border-green-100 min-h-[140px] max-h-[240px] overflow-y-auto">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="genre in genres"
          :key="genre.id"
          @click="handleGenreToggle(genre.id)"
          :class="[
            'px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 hover:scale-105',
            selectedGenres.includes(genre.id)
              ? 'bg-green-600 text-white border-green-600 shadow-md'
              : 'bg-white text-green-700 border-green-300 hover:border-green-500 hover:bg-green-50'
          ]"
        >
          {{ genre.name }}
        </button>
      </div>
    </div>
  </div>
</template>
