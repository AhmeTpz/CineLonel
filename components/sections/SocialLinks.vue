<!-- SOCIAL LINKS / SOSYAL MEDYA LİNKLERİ -->
<template>
  <div v-if="homepage || imdbId" class="mt-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-2xl">
    <h3 class="text-gray-900 font-bold text-lg mb-4 flex items-center gap-3">
      <div class="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.338.025-.675.075-1.003M12 3a8.959 8.959 0 00-8.716 2.253M12 3a8.959 8.959 0 018.716 2.253M12 3a8.959 8.959 0 00-8.716 2.253M12 3a8.959 8.959 0 018.716 2.253" />
        </svg>
      </div>
      External Links
    </h3>
    
    <div class="flex gap-4">
      <a 
        v-if="homepage"
        :href="homepage" 
        target="_blank" 
        rel="noopener noreferrer"
        class="flex items-center gap-3 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-300 hover:scale-105 group"
        title="Official Website"
      >
        <img 
          src="https://cdn-icons-png.flaticon.com/512/2991/2991110.png" 
          alt="Website"
          class="w-8 h-8 object-contain"
        />
        <span class="text-gray-700 font-medium group-hover:text-gray-900">Official Website</span>
      </a>
      
      <a 
        v-if="imdbId"
        :href="`https://www.imdb.com/name/${imdbId}`" 
        target="_blank" 
        rel="noopener noreferrer"
        class="flex items-center gap-3 p-3 bg-yellow-500 hover:bg-yellow-600 rounded-lg transition-all duration-300 hover:scale-105 group"
        title="IMDb Profile"
      >
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg" 
          alt="IMDb"
          class="w-8 h-8 object-contain"
        />
        <span class="text-white font-medium group-hover:text-yellow-100">IMDb Profile</span>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  homepage: string | null
  imdbId: string | null
}

defineProps<Props>()
</script>
