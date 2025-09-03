# ===================================================
# ACTIVE FILTERS / AKTİF FİLTRELER
# ===================================================

<script setup lang="ts">
import { computed } from 'vue'

interface Genre {
  id: number
  name: string
}

interface Keyword {
  id: number
  name: string
}

interface Props {
  selectedGenres: number[]
  userScoreRange: [number, number]
  runtimeRange: [number, number]
  votesRange: [number, number]
  selectedLanguage: string
  releaseDateFrom: string
  releaseDateTo: string
  selectedKeywords: Keyword[]
  genres: Genre[]
  languages: Array<{ iso_639_1: string; english_name: string }>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'clear-all': []
  'remove-genre': [genreId: number]
  'reset-user-score': []
  'reset-runtime': []
  'reset-votes': []
  'reset-language': []
  'reset-release-date': []
  'remove-keyword': [keywordId: number]
}>()

const hasActiveFilters = computed(() => {
  return props.selectedGenres.length > 0 || 
         (props.userScoreRange[0] ?? 0) > 0 || 
         (props.userScoreRange[1] ?? 10) < 10 ||
         (props.runtimeRange[0] ?? 0) > 0 || 
         (props.runtimeRange[1] ?? 360) < 360 ||
         (props.votesRange[0] ?? 0) > 0 || 
         (props.votesRange[1] ?? 50000) < 50000 ||
         props.selectedLanguage !== '' ||
         props.releaseDateFrom !== '' ||
         props.releaseDateTo !== '' ||
         props.selectedKeywords.length > 0
})

function getGenreName(genreId: number): string {
  const genre = props.genres.find(g => g.id === genreId)
  return genre?.name || ''
}

function getSelectedLanguageName() {
  if (!props.selectedLanguage) return 'All Languages'
  const language = props.languages.find(lang => lang.iso_639_1 === props.selectedLanguage)
  return language ? language.english_name : 'All Languages'
}

function getDateDisplayText() {
  if (!props.releaseDateFrom && !props.releaseDateTo) return 'All Dates'
  if (props.releaseDateFrom && props.releaseDateTo) return `${props.releaseDateFrom} - ${props.releaseDateTo}`
  if (props.releaseDateFrom) return `From ${props.releaseDateFrom}`
  if (props.releaseDateTo) return `To ${props.releaseDateTo}`
  return 'All Dates'
}

function formatRuntime(minutes: number): string {
  if (minutes === 0) return '0'
  return `${minutes}`
}

function formatVotes(votes: number): string {
  return votes.toLocaleString()
}
</script>

<template>
  <div v-if="hasActiveFilters" class="px-6 py-4 bg-green-25 border-b border-green-100">
    <div class="flex items-center justify-between">
      <div class="flex flex-wrap gap-2">
        <!-- ACTIVE GENRE FILTERS / AKTİF TÜR FİLTRELERİ -->
        <div 
          v-for="genreId in selectedGenres" 
          :key="`active-${genreId}`"
          class="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
        >
          <span>{{ getGenreName(genreId) }}</span>
          <button 
            @click="$emit('remove-genre', genreId)"
            class="hover:text-green-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- ACTIVE USER SCORE FILTER / AKTİF KULLANICI PUANI FİLTRESİ -->
        <div 
          v-if="(userScoreRange[0] ?? 0) > 0 || (userScoreRange[1] ?? 10) < 10"
          class="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
        >
          <span>Score: {{ userScoreRange[0] ?? 0 }}-{{ userScoreRange[1] ?? 10 }}</span>
          <button 
            @click="$emit('reset-user-score')"
            class="hover:text-green-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- ACTIVE RUNTIME FILTER / AKTİF SÜRE FİLTRESİ -->
        <div 
          v-if="(runtimeRange[0] ?? 0) > 0 || (runtimeRange[1] ?? 360) < 360"
          class="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
        >
          <span>Runtime: {{ formatRuntime(runtimeRange[0] ?? 0) }}-{{ formatRuntime(runtimeRange[1] ?? 360) }}min</span>
          <button 
            @click="$emit('reset-runtime')"
            class="hover:text-green-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- ACTIVE VOTES FILTER / AKTİF OY FİLTRESİ -->
        <div 
          v-if="(votesRange[0] ?? 0) > 0 || (votesRange[1] ?? 50000) < 50000"
          class="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
        >
          <span>Votes: {{ formatVotes(votesRange[0] ?? 0) }}-{{ formatVotes(votesRange[1] ?? 50000) }}</span>
          <button 
            @click="$emit('reset-votes')"
            class="hover:text-green-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- ACTIVE LANGUAGE FILTER / AKTİF DİL FİLTRESİ -->
        <div 
          v-if="selectedLanguage"
          class="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
        >
          <span>{{ getSelectedLanguageName() }}</span>
          <button 
            @click="$emit('reset-language')"
            class="hover:text-green-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- ACTIVE RELEASE DATE FILTER / AKTİF YAYIN TARİHİ FİLTRESİ -->
        <div 
          v-if="releaseDateFrom || releaseDateTo"
          class="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
        >
          <span>{{ getDateDisplayText() }}</span>
          <button 
            @click="$emit('reset-release-date')"
            class="hover:text-green-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- ACTIVE KEYWORDS / AKTİF ANAHTAR KELİMELER -->
        <div v-for="k in selectedKeywords" :key="`activekw-${k.id}`" class="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
          <span>{{ k.name }}</span>
          <button @click="$emit('remove-keyword', k.id)" class="hover:text-green-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- CLEAR ALL BUTTON / TÜMÜNÜ TEMİZLE BUTONU -->
      <button 
        @click="$emit('clear-all')"
        class="px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-red-600 hover:bg-red-100 hover:border-red-300 hover:text-red-700 font-medium text-xs transition-all duration-200 whitespace-nowrap min-w-[80px] flex items-center justify-center"
      >
        Clear All
      </button>
    </div>
  </div>
</template>
