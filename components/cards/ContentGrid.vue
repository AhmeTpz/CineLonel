# ===================================================
# CONTENT GRID / İÇERİK GRİDİ
# ===================================================

<script setup lang="ts">
import PopularCard from './PopularCard.vue'
import { useTmdb } from '../../composables/useTmdb'
import type { Content, ContentType } from '../../composables/useContentList'

// PROPS / ÖZELLİKLER
interface Props {
  items: Content[]
  contentType: ContentType
  animationDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  animationDelay: 0.1
})

// TMDB COMPOSABLE
const { getImageUrl } = useTmdb()

// UTILITY FUNCTIONS / YARDIMCI FONKSİYONLAR
const getTitle = (item: Content): string => {
  if ('title' in item) return item.title
  if ('name' in item) return item.name
  return 'Unknown'
}

const getReleaseDate = (item: Content): string => {
  if ('release_date' in item) return item.release_date
  if ('first_air_date' in item) return item.first_air_date
  return ''
}

const getRating = (item: Content): number => {
  if ('vote_average' in item) {
    return Math.round((item.vote_average || 0) * 10)
  }
  return 0
}

const getPoster = (item: Content): string => {
  if ('poster_path' in item && item.poster_path) {
    return getImageUrl(item.poster_path, 'w500')
  }
  if ('profile_path' in item && item.profile_path) {
    return getImageUrl(item.profile_path, 'w500')
  }
  return '/no-photo.png'
}
</script>

<template>
  <!-- CONTENT GRID / İÇERİK GRİDİ -->
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
    <div 
      v-for="(item, index) in items" 
      :key="item.id"
      class="animate-fade-in-up"
      :style="`animation-delay: ${index * animationDelay}s;`"
    >
      <PopularCard
        :id="item.id"
        :title="getTitle(item)"
        :release-date="getReleaseDate(item)"
        :rating="getRating(item)"
        :poster="getPoster(item)"
        :type="contentType === 'person' ? 'people' : contentType"
      />
    </div>
  </div>
</template>

<style scoped>
/* FADE IN UP ANIMATION / YUKARI FADE ANİMASYONU */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}
</style>
