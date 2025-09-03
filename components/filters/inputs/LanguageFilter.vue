# ===================================================
# LANGUAGE FILTER / DİL FİLTRESİ
# ===================================================

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useTmdb } from '~/composables/useTmdb'

interface Language {
  iso_639_1: string
  english_name: string
  name: string
  content_count?: number
}

interface Props {
  contentType: 'movie' | 'tv'
  currentLanguage?: string
  languageCounts?: Record<string, number>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'language-change': [language: string]
}>()

const { request } = useTmdb()
const languages = ref<Language[]>([])
const selectedLanguage = ref<string>('')
const languageDropdownOpen = ref(false)

async function fetchLanguages() {
  try {
    const languageResponse = await request<Language[]>('/configuration/languages')

    if (props.languageCounts && Object.keys(props.languageCounts).length > 0) {
      const withCounts = languageResponse.map((lang) => ({
        ...lang,
        content_count: props.languageCounts?.[lang.iso_639_1] ?? 0
      }))
      languages.value = withCounts
        .filter(l => (l.content_count || 0) > 0)
        .sort((a, b) => (b.content_count || 0) - (a.content_count || 0) || a.english_name.localeCompare(b.english_name))
        .slice(0, 50)
      return
    }

    const languagesWithCount = await Promise.all(
      languageResponse.map(async (lang) => {
        try {
          const endpoint = props.contentType === 'movie' ? '/discover/movie' : '/discover/tv'
          const countResponse = await request<{ total_results: number }>(endpoint, {
            with_original_language: lang.iso_639_1,
            page: 1
          })
          return { ...lang, content_count: countResponse.total_results || 0 }
        } catch {
          return { ...lang, content_count: 0 }
        }
      })
    )

    languages.value = languagesWithCount
      .filter(lang => (lang.content_count || 0) > 0)
      .sort((a, b) => (b.content_count || 0) - (a.content_count || 0) || a.english_name.localeCompare(b.english_name))
      .slice(0, 50)
      
      } catch (error) {
      // Language fetch error - ignore
    }
}

function handleLanguageSelect(languageCode: string) {
  selectedLanguage.value = languageCode
  languageDropdownOpen.value = false
  emit('language-change', languageCode)
}

function toggleLanguageDropdown() {
  languageDropdownOpen.value = !languageDropdownOpen.value
  if (languageDropdownOpen.value) {
    fetchLanguages()
  }
}

function getSelectedLanguageName() {
  if (!selectedLanguage.value) return 'All Languages'
  const language = languages.value.find(lang => lang.iso_639_1 === selectedLanguage.value)
  return language ? language.english_name : 'All Languages'
}

function resetLanguage() {
  selectedLanguage.value = ''
  emit('language-change', '')
}

watch(() => props.languageCounts, () => {
  fetchLanguages()
})

onMounted(() => {
  fetchLanguages()
  if (props.currentLanguage) {
    selectedLanguage.value = props.currentLanguage
  }
})
</script>

<template>
  <div class="space-y-3">
    <label class="block text-green-700 font-medium text-sm">Language</label>
    <div class="bg-green-50 rounded-lg p-4 border border-green-100 relative">
      <!-- LANGUAGE DROPDOWN BUTTON / DİL AÇILIR MENÜ BUTONU -->
      <button
        @click="toggleLanguageDropdown"
        class="w-full flex items-center justify-between px-4 py-2 bg-white rounded-lg border border-green-200 hover:border-green-400 transition-colors text-sm"
      >
        <span class="text-green-700 font-medium">{{ getSelectedLanguageName() }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" 
             class="w-4 h-4 text-green-600 transition-transform" 
             :class="{ 'rotate-180': languageDropdownOpen }">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      
      <!-- LANGUAGE DROPDOWN MENU / DİL AÇILIR MENÜ -->
      <div v-if="languageDropdownOpen" 
           class="absolute top-full left-4 right-4 mt-1 bg-white border border-green-200 rounded-lg shadow-xl z-[10000] max-h-48 overflow-y-auto">
        <!-- ALL LANGUAGES OPTION / TÜM DİLLER SEÇENEĞİ -->
        <button
          @click="handleLanguageSelect('')"
          class="w-full px-3 py-1.5 text-left hover:bg-green-50 transition-colors flex items-center justify-between text-sm"
          :class="{ 'bg-green-100 text-green-700 font-medium': !selectedLanguage }"
        >
          <span>All Languages</span>
          <span class="text-xs text-green-500">(All)</span>
        </button>
        
        <!-- LANGUAGE OPTIONS / DİL SEÇENEKLERİ -->
        <button
          v-for="language in languages"
          :key="language.iso_639_1"
          @click="handleLanguageSelect(language.iso_639_1)"
          class="w-full px-3 py-1.5 text-left hover:bg-green-50 transition-colors flex items-center justify-between text-sm"
          :class="{ 'bg-green-100 text-green-700 font-medium': selectedLanguage === language.iso_639_1 }"
        >
          <span>{{ language.english_name }}</span>
          <span class="text-xs text-green-500">({{ language.content_count?.toLocaleString() || 0 }})</span>
        </button>
      </div>
    </div>
  </div>
</template>
