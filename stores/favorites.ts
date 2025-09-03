import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface FavoriteItem {
  id: number
  title: string
  poster_path: string
  type: 'movie' | 'tv'
  vote_average: number
  release_date?: string
  first_air_date?: string
}

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref<FavoriteItem[]>([])

  // LocalStorage'dan favorileri yükle (client-side only)
  const loadFavorites = () => {
    if (import.meta.client) {
      const stored = localStorage.getItem('cineLonel-favorites')
      if (stored) {
        favorites.value = JSON.parse(stored)
      }
    }
  }

  // LocalStorage'a favorileri kaydet (client-side only)
  const saveFavorites = () => {
    if (import.meta.client) {
      localStorage.setItem('cineLonel-favorites', JSON.stringify(favorites.value))
    }
  }

  // Favori ekle/çıkar
  const toggleFavorite = (item: FavoriteItem) => {
    const existingIndex = favorites.value.findIndex(
      fav => fav.id === item.id && fav.type === item.type
    )

    if (existingIndex > -1) {
      favorites.value.splice(existingIndex, 1)
    } else {
      favorites.value.push(item)
    }

    saveFavorites()
  }

  // Favori olup olmadığını kontrol et
  const isFavorite = (id: number, type: 'movie' | 'tv') => {
    return favorites.value.some(fav => fav.id === id && fav.type === type)
  }

  // Favori filmleri getir
  const favoriteMovies = computed(() => {
    return favorites.value.filter(fav => fav.type === 'movie')
  })

  // Favori dizileri getir
  const favoriteTVShows = computed(() => {
    return favorites.value.filter(fav => fav.type === 'tv')
  })

  // Toplam favori sayısı
  const totalFavorites = computed(() => favorites.value.length)

  // İlk yüklemede localStorage'dan yükle (sadece client-side)
  if (import.meta.client) {
    loadFavorites()
  }

  return {
    favorites,
    favoriteMovies,
    favoriteTVShows,
    totalFavorites,
    toggleFavorite,
    isFavorite,
    loadFavorites,
    saveFavorites
  }
})
