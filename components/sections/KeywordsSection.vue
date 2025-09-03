<!-- KEYWORDS SECTION / ANAHTAR KELİMELER BÖLÜMÜ -->
<template>
  <div class="mt-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-2xl">
    <h3 class="text-gray-900 font-bold text-lg mb-4 flex items-center gap-3">
      <div class="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.732.998 2.732.998s2.033-.299 2.732-.998l4.318-4.318c.699-.699.998-1.732.998-2.732s-.299-2.033-.998-2.732L13.159 3.659A2.25 2.25 0 0011.568 3H9.568z" />
        </svg>
      </div>
      Keywords
    </h3>
    
    <div v-if="keywords.length > 0" class="flex flex-wrap gap-2">
      <span 
        v-for="keyword in keywords.slice(0, 12)" 
        :key="keyword.id"
        class="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors duration-300"
      >
        {{ keyword.name }}
      </span>
    </div>
    
    <div v-else class="text-gray-500 text-sm text-center py-4">
      No keywords available
    </div>
  </div>
</template>

<script setup lang="ts">
interface Keyword {
  id: number
  name: string
}

interface Props {
  keywords: Keyword[]
}

defineProps<Props>()
</script>
