# ===================================================
# KEYWORD FILTER / ANAHTAR KELİME FİLTRESİ
# ===================================================

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTmdb } from '~/composables/useTmdb'

interface Keyword { 
  id: number
  name: string 
}

interface Props {
  currentKeywords?: Keyword[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'keywords-change': [keywords: Keyword[]]
}>()

const { request } = useTmdb()
const keywordQuery = ref('')
const keywordSuggestions = ref<Keyword[]>([])
const selectedKeywords = ref<Keyword[]>([])

async function searchKeywords(q: string) {
  if (!q || q.length < 2) {
    keywordSuggestions.value = []
    return
  }
  try {
    const res = await request<{ results: Keyword[] }>(`/search/keyword`, { query: q, page: 1 })
    keywordSuggestions.value = res.results || []
  } catch (e) {
    keywordSuggestions.value = []
  }
}

function addKeyword(k: Keyword) {
  if (!selectedKeywords.value.find(x => x.id === k.id)) {
    selectedKeywords.value.push(k)
    emit('keywords-change', selectedKeywords.value)
  }
  keywordQuery.value = ''
  keywordSuggestions.value = []
}

function removeKeyword(id: number) {
  selectedKeywords.value = selectedKeywords.value.filter(k => k.id !== id)
  emit('keywords-change', selectedKeywords.value)
}

onMounted(() => {
  if (props.currentKeywords) {
    selectedKeywords.value = [...props.currentKeywords]
  }
})
</script>

<template>
  <div class="space-y-3">
    <label class="block text-green-700 font-medium text-sm">Keywords</label>
    <div class="bg-green-50 rounded-lg p-4 border border-green-100">
      <div class="relative">
        <div class="w-full bg-white rounded-lg border border-green-200 focus-within:border-green-500 hover:border-green-400 transition-colors px-2 py-2 flex flex-wrap gap-2">
          <span v-for="k in selectedKeywords" :key="k.id" class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md border border-green-300 flex items-center gap-1">
            {{ k.name }}
            <button @click="removeKeyword(k.id)" class="hover:text-green-900">×</button>
          </span>
          <input
            v-model="keywordQuery"
            @input="searchKeywords(keywordQuery)"
            type="text"
            placeholder="Type to search keywords..."
            class="flex-1 min-w-[120px] outline-none text-sm text-green-700 bg-transparent"
          />
        </div>
        <div v-if="keywordSuggestions.length" class="absolute z-[10000] left-0 right-0 mt-1 bg-white border border-green-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
          <button v-for="s in keywordSuggestions" :key="s.id" @click="addKeyword(s)" class="w-full text-left px-3 py-2 hover:bg-green-50 text-sm">{{ s.name }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
