# ===================================================
# WHERE TO WATCH DROPDOWN / NEREDE İZLENİR AÇILIR MENÜSÜ
# ===================================================

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useTmdb } from '~/composables/useTmdb'

interface Provider {
  provider_id: number
  provider_name: string
  logo_path: string | null
}

interface Props {
  contentType: 'movie' | 'tv'
  region?: string
  providerCounts?: Record<number, number>
  currentProviders?: number[]
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  region: 'US',
  providerCounts: () => ({}),
  currentProviders: () => [],
  isLoading: false
})

const emit = defineEmits<{ 'providers-change': [value: number[]] }>()

const { request } = useTmdb()

const isOpen = ref(false)
const rootEl = ref<HTMLElement | null>(null)
const allProviders = ref<Provider[]>([])
const selectedProviders = ref<number[]>([])

async function fetchProviders() {
  try {
    const endpoint = props.contentType === 'movie' ? '/watch/providers/movie' : '/watch/providers/tv'
    const res = await request<{ results: Provider[] }>(endpoint)
    allProviders.value = (res.results || []).filter(p => !!p.logo_path)
  } catch {
    allProviders.value = []
  }
}

function handleDocumentClick(e: MouseEvent) {
  const target = e.target as Node
  if (isOpen.value && rootEl.value && !rootEl.value.contains(target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  fetchProviders()
  if (props.currentProviders?.length) selectedProviders.value = [...props.currentProviders]
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})

const providersWithCount = computed(() => {
  const counts = props.providerCounts || {}
  return allProviders.value
    .map(p => ({ ...p, count: counts[p.provider_id] || 0 }))
    .filter(p => p.count > 0)
    .sort((a, b) => (b.count - a.count) || a.provider_name.localeCompare(b.provider_name))
})

function toggleProvider(id: number) {
  const idx = selectedProviders.value.indexOf(id)
  if (idx === -1) selectedProviders.value.push(id)
  else selectedProviders.value.splice(idx, 1)
  emit('providers-change', [...selectedProviders.value])
}

function clearAll() {
  selectedProviders.value = []
  emit('providers-change', [])
}

function isSelected(id: number) {
  return selectedProviders.value.includes(id)
}

function getLogoUrl(path: string | null) {
  if (!path) return '/no-photo.png'
  return `https://image.tmdb.org/t/p/w185${path}`
}
</script>

<template>
  <div class="relative" ref="rootEl">
    <button
      @click.stop="isOpen = !isOpen"
      class="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-yellow-400/60 via-lime-500/70 to-green-600/50 backdrop-blur-sm rounded-xl text-white font-medium transition-all duration-200 hover:from-yellow-500/80 hover:via-lime-500/90 hover:to-green-500/80 min-w-[140px] justify-between"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z" />
      </svg>
      <span class="hidden sm:inline">Where to Watch</span>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 transition-transform" :class="{ 'rotate-180': isOpen }">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    </button>

    <div v-if="isOpen" @click.stop class="absolute top-full left-0 mt-2 w-[420px] bg-white/95 backdrop-blur-xl border border-green-200/50 rounded-2xl shadow-2xl z-[9999] overflow-hidden">
      <div class="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-100 flex items-center justify-between">
        <h3 class="text-green-800 font-semibold text-lg flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z" />
          </svg>
          Where to Watch
        </h3>
        <button @click.stop="clearAll" class="relative px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-red-600 hover:bg-red-100 hover:border-red-300 hover:text-red-700 font-medium text-xs transition-all duration-200 whitespace-nowrap">
          Clear All
          <span v-if="selectedProviders.length" class="absolute -top-1 -right-1 min-w-[18px] h-5 px-1 rounded-full bg-red-600 text-white text-[10px] leading-5 text-center">{{ selectedProviders.length }}</span>
        </button>
      </div>

      <div class="p-4">
        <!-- Loading State -->
        <div v-if="isLoading" class="flex items-center justify-center py-8">
          <div class="flex items-center gap-3 text-green-600">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            <span class="text-sm font-medium">Loading providers...</span>
          </div>
        </div>
        
        <!-- Providers Grid -->
        <div v-else class="grid grid-cols-6 gap-3">
          <button
            v-for="p in providersWithCount"
            :key="p.provider_id"
            @click.stop="toggleProvider(p.provider_id)"
            class="relative rounded-md border flex items-center justify-center bg-white"
            :class="[
              isSelected(p.provider_id) ? 'border-green-500 ring-1 ring-green-300' : 'border-green-200 hover:border-green-400'
            ]"
            :title="p.provider_name"
            :aria-label="p.provider_name"
          >
            <img :src="getLogoUrl(p.logo_path)" :alt="p.provider_name" style="width: 1cm; height: 1cm; object-fit: contain;" />
            <span class="absolute -top-1 -right-1 min-w-[18px] h-5 px-1 rounded-full bg-green-600 text-white text-[10px] leading-5 text-center" :title="p.provider_name">
              {{ (p as any).count || 0 }}
            </span>
          </button>
        </div>
        
        <!-- No Providers Message -->
        <div v-if="!isLoading && providersWithCount.length === 0" class="text-center py-8 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto mb-3 text-gray-400">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z" />
          </svg>
          <p class="text-sm">No streaming providers available</p>
        </div>
      </div>
    </div>
  </div>
</template>
