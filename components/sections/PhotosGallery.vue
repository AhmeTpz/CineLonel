<!-- PHOTOS GALLERY / FOTOĞRAF GALERİSİ -->
<template>
  <div v-if="images.length > 0" class="mt-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-2xl">
    <h3 class="text-gray-900 font-bold text-lg mb-4 flex items-center gap-3">
      <div class="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      </div>
      Photos
    </h3>
    
    <div class="grid grid-cols-3 gap-4">
      <div 
        v-for="image in images.slice(0, showAllImages ? undefined : 9)" 
        :key="image.file_path"
        class="relative group cursor-pointer"
        @click="openImageModal(image)"
      >
        <img 
          :src="getImageUrl(image.file_path, 'w185')" 
          :alt="personName"
          class="w-full h-32 object-cover rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl"
        />
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-xl"></div>
      </div>
    </div>
    
    <button 
      v-if="images.length > 9"
      @click="showAllImages = !showAllImages"
      class="mt-6 text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-300"
    >
      {{ showAllImages ? 'Show Less' : `Show ${images.length - 9} More Photos` }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTmdb } from '../../composables/useTmdb'

const { getImageUrl } = useTmdb()

interface Image {
  file_path: string
}

interface Props {
  images: Image[]
  personName: string
  openImageModal: (image: Image) => void
}

defineProps<Props>()

const showAllImages = ref(false)
</script>
