# ===================================================
# POPULAR CARD / POPÜLER KARTLAR
# ===================================================

<script setup lang="ts">
import { computed } from 'vue'
import { useFavoritesStore, type FavoriteItem } from '../stores/favorites'

interface Props {
  id: number
  title: string
  poster: string
  releaseDate?: string
  rating?: number
  subtitle?: string
  type: 'movie' | 'tv' | 'people'
}

const props = defineProps<Props>()
const favoritesStore = useFavoritesStore()

const getRatingColor = (rating: number) => {
  if (rating >= 70) return 'bg-green-500'
  if (rating >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const toggleFavorite = (event: Event) => {
  event.stopPropagation()

  if (props.type === 'people') return

  const favoriteItem: FavoriteItem = {
    id: props.id,
    title: props.title,
    poster_path: props.poster,
    type: props.type as 'movie' | 'tv',
    vote_average: (props.rating || 0) / 10,
    release_date: props.type === 'movie' ? props.releaseDate : undefined,
    first_air_date: props.type === 'tv' ? props.releaseDate : undefined
  }

  favoritesStore.toggleFavorite(favoriteItem)
}

const isFavorite = computed(() => {
  if (props.type === 'people') return false
  return favoritesStore.isFavorite(props.id, props.type as 'movie' | 'tv')
})

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target) {
    target.src = '/no-photo.png'
  }
}

const router = useRouter()

const navigateToDetail = () => {
  if (props.type === 'movie') {
    router.push(`/movies/${props.id}`)
  } else if (props.type === 'tv') {
    router.push(`/tv/${props.id}`)
  } else if (props.type === 'people') {
    router.push(`/people/${props.id}`)
  }
}
</script>

<template>
  <div class="group cursor-pointer card-wrapper" @click="navigateToDetail" @click.stop>
    <!-- Poster Container -->
    <div class="poster-container">
      <img
        :src="poster || '/no-photo.png'"
        :alt="title"
        class="poster-image"
        @error="handleImageError"
      />

      <!-- Rating Badge -->
      <div v-if="typeof rating === 'number'" class="rating-badge">
        <div class="rating-content">
          <div :class="`rating-indicator ${getRatingColor(rating!)}`"></div>
          <span class="rating-text">{{ rating }}%</span>
        </div>
      </div>

      <!-- Favorite Button -->
      <div v-if="type !== 'people'" class="favorite-button-container">
        <button
          @click="toggleFavorite"
          class="favorite-button"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            :fill="isFavorite ? 'currentColor' : 'none'"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="favorite-icon"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        </button>
      </div>

      <!-- Subtle Overlay -->
      <div class="poster-overlay"></div>
    </div>

    <!-- Card Info -->
    <div class="card-info">
      <h4 class="card-title">
        {{ title }}
      </h4>
      <p class="card-subtitle">
        {{ releaseDate ? formatDate(releaseDate) : (subtitle || '') }}
      </p>
    </div>
  </div>
</template>

<style scoped>
/* CARD WRAPPER / KART SARICI */
.card-wrapper {
  transition: all 0.3s ease;
}

.card-wrapper:hover {
  transform: translateY(-4px);
}

/* POSTER CONTAINER / POSTER KONTEYNERİ */
.poster-container {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  aspect-ratio: 2 / 3;
  background: #f3f4f6;
}

.card-wrapper:hover .poster-container {
  box-shadow: 0 12px 35px rgba(16, 185, 129, 0.2);
}

.poster-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.card-wrapper:hover .poster-image {
  transform: scale(1.05);
}

/* POSTER OVERLAY / POSTER KAPLAMA */
.poster-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 70%,
    rgba(0, 0, 0, 0.3) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card-wrapper:hover .poster-overlay {
  opacity: 1;
}

/* RATING BADGE / PUAN ROZETİ */
.rating-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

.rating-content {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  padding: 4px 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.card-wrapper:hover .rating-content {
  transform: scale(1.05);
}

.rating-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: ratingPulse 2s ease-in-out infinite;
}

.rating-text {
  color: white;
  font-size: 11px;
  font-weight: bold;
}

/* FAVORITE BUTTON / FAVORİ BUTONU */
.favorite-button-container {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
  z-index: 20;
}

.card-wrapper:hover .favorite-button-container {
  opacity: 1;
}

.favorite-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #fbbf24;
  transition: all 0.3s ease;
  transform: scale(0.8);
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-wrapper:hover .favorite-button {
  transform: scale(1);
}

.favorite-icon {
  width: 40px;
  height: 40px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;
}

.favorite-button:hover .favorite-icon {
  transform: scale(1.1);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
}

/* CARD INFO / KART BİLGİSİ */
.card-info {
  margin-top: 12px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  line-height: 1.4;
  margin-bottom: 4px;
  transition: color 0.3s ease;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-wrapper:hover .card-title {
  color: #10b981;
}

.card-subtitle {
  font-size: 12px;
  color: #6b7280;
  transition: color 0.3s ease;
}

.card-wrapper:hover .card-subtitle {
  color: #9ca3af;
}

/* ANIMATION KEYFRAMES / ANİMASYON ANAHTAR KARELERİ */
@keyframes ratingPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

/* RESPONSIVE / DUYARLI */
@media (max-width: 768px) {
  .card-wrapper:hover {
    transform: translateY(-2px);
  }
}
</style>
