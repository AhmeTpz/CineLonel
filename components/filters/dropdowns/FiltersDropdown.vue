# ===================================================
# FILTERS DROPDOWN / FİLTRELER AÇILIR MENÜSÜ
# ===================================================

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useTmdb } from '~/composables/useTmdb'
import GenreFilter from '../inputs/GenreFilter.vue'
import ScoreFilter from '../inputs/ScoreFilter.vue'
import VotesFilter from '../inputs/VotesFilter.vue'
import RuntimeFilter from '../inputs/RuntimeFilter.vue'
import DateFilter from '../inputs/DateFilter.vue'
import KeywordFilter from '../inputs/KeywordFilter.vue'
import LanguageFilter from '../inputs/LanguageFilter.vue'
import ActiveFilters from '../buttons/ActiveFilters.vue'

interface Props {
  contentType: 'movie' | 'tv'
  currentGenres?: number[]
  currentUserScore?: { min: number; max: number }
  currentRuntime?: { min: number; max: number }
  currentVotes?: { min: number; max: number }
  currentLanguage?: string
  currentReleaseDate?: { from: string; to: string }
  languageCounts?: Record<string, number>
  currentKeywords?: { id: number; name: string }[]
}

const props = defineProps<Props>()
const emit = defineEmits(['genres-change', 'user-score-change', 'runtime-change', 'votes-change', 'language-change', 'release-date-change', 'keywords-change'])

const isOpen = ref(false)

// FILTER STATE / FİLTRE DURUMU
const selectedGenres = ref<number[]>([])
const userScoreRange = ref<[number, number]>([0, 10])
const runtimeRange = ref<[number, number]>([0, 360])
const votesRange = ref<[number, number]>([0, 50000])
const selectedLanguage = ref<string>('')
const releaseDateFrom = ref<string>('')
const releaseDateTo = ref<string>('')
const selectedKeywords = ref<{ id: number; name: string }[]>([])

// GENRE AND LANGUAGE DATA / TÜR VE DİL VERİLERİ
const genres = ref<{ id: number; name: string }[]>([])
const languages = ref<{ iso_639_1: string; english_name: string }[]>([])

// FETCH GENRES AND LANGUAGES / TÜR VE DİLLERİ ÇEK
const { request } = useTmdb()

async function fetchGenres() {
  try {
    const endpoint = props.contentType === 'movie' ? '/genre/movie/list' : '/genre/tv/list'
    const response = await request<{ genres: { id: number; name: string }[] }>(endpoint)
    genres.value = response.genres || []
      } catch (error) {
      // Genre fetch error - ignore
    }
}

async function fetchLanguages() {
  try {
    const languageResponse = await request<{ iso_639_1: string; english_name: string; name: string }[]>('/configuration/languages')
    languages.value = languageResponse.map(lang => ({
      iso_639_1: lang.iso_639_1,
      english_name: lang.english_name
    }))
      } catch (error) {
      // Language fetch error - ignore
    }
}

function handleClickOutside() {
  isOpen.value = false
}

function clearAllFilters() {
  selectedGenres.value = []
  userScoreRange.value = [0, 10]
  runtimeRange.value = [0, 360]
  votesRange.value = [0, 50000]
  selectedLanguage.value = ''
  releaseDateFrom.value = ''
  releaseDateTo.value = ''
  selectedKeywords.value = []
  emit('genres-change', [])
  emit('user-score-change', { min: 0, max: 10 })
  emit('runtime-change', { min: 0, max: 360 })
  emit('votes-change', { min: 0, max: 50000 })
  emit('language-change', '')
  emit('release-date-change', { from: '', to: '' })
  emit('keywords-change', [])
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  // FETCH DATA / VERİLERİ ÇEK
  fetchGenres()
  fetchLanguages()
  
  // SET INITIAL VALUES FROM PARENT / EBEVEYNDEN BAŞLANGIÇ DEĞERLERİNİ AYARLA
  if (props.currentGenres) {
    selectedGenres.value = [...props.currentGenres]
  }
  if (props.currentUserScore) {
    userScoreRange.value = [props.currentUserScore.min, props.currentUserScore.max]
  }
  if (props.currentRuntime) {
    runtimeRange.value = [props.currentRuntime.min, props.currentRuntime.max]
  }
  if (props.currentVotes) {
    votesRange.value = [props.currentVotes.min, props.currentVotes.max]
  }
  if (props.currentLanguage) {
    selectedLanguage.value = props.currentLanguage
  }
  if (props.currentReleaseDate) {
    releaseDateFrom.value = props.currentReleaseDate.from
    releaseDateTo.value = props.currentReleaseDate.to
  }
  if (props.currentKeywords) {
    selectedKeywords.value = [...props.currentKeywords]
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="relative">
    <button
      @click.stop="isOpen = !isOpen"
      class="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-600/60 via-amber-600/50 to-yellow-500/60 backdrop-blur-sm rounded-xl text-white font-medium transition-all duration-200 hover:from-orange-500/80 hover:via-amber-500/90 hover:to-yellow-500/80 min-w-[140px] justify-between"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
      </svg>
      <span class="hidden sm:inline">Filters</span>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 transition-transform" :class="{ 'rotate-180': isOpen }">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    </button>
    
    <!-- FILTER DROPDOWN / FİLTRE AÇILIR MENÜSÜ -->
    <div v-if="isOpen" @click.stop class="absolute top-full left-0 mt-2 w-[800px] bg-white/95 backdrop-blur-xl border border-green-200/50 rounded-2xl shadow-2xl z-[9999] overflow-hidden">
      <!-- HEADER / BAŞLIK -->
      <div class="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-100">
        <h3 class="text-green-800 font-semibold text-lg flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
          </svg>
          Filters
        </h3>
      </div>
      
      <!-- ACTIVE FILTERS / AKTİF FİLTRELER -->
      <ActiveFilters
        :selected-genres="selectedGenres"
        :user-score-range="userScoreRange"
        :runtime-range="runtimeRange"
        :votes-range="votesRange"
        :selected-language="selectedLanguage"
        :release-date-from="releaseDateFrom"
        :release-date-to="releaseDateTo"
        :selected-keywords="selectedKeywords"
        :genres="genres"
        :languages="languages"
        @clear-all="clearAllFilters"
        @remove-genre="(id) => { selectedGenres = selectedGenres.filter(g => g !== id); emit('genres-change', selectedGenres) }"
        @reset-user-score="() => { userScoreRange = [0, 10]; emit('user-score-change', { min: 0, max: 10 }) }"
        @reset-runtime="() => { runtimeRange = [0, 360]; emit('runtime-change', { min: 0, max: 360 }) }"
        @reset-votes="() => { votesRange = [0, 50000]; emit('votes-change', { min: 0, max: 50000 }) }"
        @reset-language="() => { selectedLanguage = ''; emit('language-change', '') }"
        @reset-release-date="() => { releaseDateFrom = ''; releaseDateTo = ''; emit('release-date-change', { from: '', to: '' }) }"
        @remove-keyword="(id) => { selectedKeywords = selectedKeywords.filter(k => k.id !== id); emit('keywords-change', selectedKeywords) }"
      />
      
      <!-- CONTENT - TWO COLUMN LAYOUT / İÇERİK - İKİ SÜTUN DÜZENİ -->
      <div class="p-8">
        <div class="grid grid-cols-2 gap-10">
          <!-- LEFT COLUMN / SOL SÜTUN -->
          <div class="space-y-6">
            <!-- LANGUAGE FILTER / DİL FİLTRESİ -->
            <LanguageFilter
              :content-type="contentType"
              :current-language="selectedLanguage"
              :language-counts="languageCounts"
              @language-change="(lang) => { selectedLanguage = lang; emit('language-change', lang) }"
            />
            
            <!-- GENRE FILTER / TÜR FİLTRESİ -->
            <GenreFilter
              :content-type="contentType"
              :current-genres="selectedGenres"
              @genres-change="(genres) => { selectedGenres = genres; emit('genres-change', genres) }"
            />
            
            <!-- DATE FILTER / TARİH FİLTRESİ -->
            <DateFilter
              :content-type="contentType"
              :current-release-date="{ from: releaseDateFrom, to: releaseDateTo }"
              @release-date-change="(date) => { releaseDateFrom = date.from; releaseDateTo = date.to; emit('release-date-change', date) }"
            />
          </div>
          
          <!-- RIGHT COLUMN / SAĞ SÜTUN -->
          <div class="space-y-6">
            <!-- SCORE FILTER / PUAN FİLTRESİ -->
            <ScoreFilter
              :current-user-score="{ min: userScoreRange[0], max: userScoreRange[1] }"
              @user-score-change="(score) => { userScoreRange = [score.min, score.max]; emit('user-score-change', score) }"
            />
            
            <!-- VOTES FILTER / OY FİLTRESİ -->
            <VotesFilter
              :current-votes="{ min: votesRange[0], max: votesRange[1] }"
              @votes-change="(votes) => { votesRange = [votes.min, votes.max]; emit('votes-change', votes) }"
            />
            
            <!-- RUNTIME FILTER / SÜRE FİLTRESİ -->
            <RuntimeFilter
              :current-runtime="{ min: runtimeRange[0], max: runtimeRange[1] }"
              @runtime-change="(runtime) => { runtimeRange = [runtime.min, runtime.max]; emit('runtime-change', runtime) }"
            />
            
            <!-- KEYWORD FILTER / ANAHTAR KELİME FİLTRESİ -->
            <KeywordFilter
              :current-keywords="selectedKeywords"
              @keywords-change="(keywords) => { selectedKeywords = keywords; emit('keywords-change', keywords) }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
