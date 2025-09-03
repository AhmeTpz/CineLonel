import { ref } from 'vue'
import { useTmdb } from './useTmdb'

interface ProviderCounts {
  [providerId: number]: number
}

const globalProviderCounts = ref<{ movie: ProviderCounts; tv: ProviderCounts }>({
  movie: {},
  tv: {}
})

const isLoading = ref(false)
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 gün

export function useGlobalProviderCounts() {
  const { request } = useTmdb()

  async function fetchGlobalProviderCounts(contentType: 'movie' | 'tv') {
    // Cache kontrolü
    const cacheKey = `global_provider_counts_${contentType}`
    const cached = localStorage.getItem(cacheKey)
    
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < CACHE_DURATION) {
          globalProviderCounts.value[contentType] = data
          return data
        }
      } catch (error) {
        // Cache parsing error - ignore
      }
    }

    isLoading.value = true
    
    try {
      // TMDB'den tüm provider'ları al
      const endpoint = contentType === 'movie' ? '/watch/providers/movie' : '/watch/providers/tv'
      const providersResponse = await request<{ results: Array<{ provider_id: number; provider_name: string }> }>(endpoint)
      
      const providers = providersResponse.results || []
      const counts: ProviderCounts = {}
      
      // Her provider için genel sayıyı al (sadece ilk sayfa)
      const concurrency = 8
      let index = 0
      
      async function worker() {
        while (index < providers.length) {
          const i = index++
          const provider = providers[i]
          if (!provider) continue
          
          try {
            // Her provider için discover endpoint'ini kullanarak toplam sayıyı al
            const discoverEndpoint = contentType === 'movie' ? '/discover/movie' : '/discover/tv'
            const response = await request<{ total_results: number }>(discoverEndpoint, {
              with_watch_providers: provider.provider_id,
              watch_region: 'US',
              with_watch_monetization_types: 'flatrate|rent|buy|ads|free',
              page: 1 // Sadece toplam sayıyı almak için
            })
            
            if (response.total_results > 0) {
              counts[provider.provider_id] = response.total_results
            }
          } catch (error) {
            // Provider count fetch error - ignore
          }
        }
      }
      
      await Promise.all(Array.from({ length: Math.min(concurrency, providers.length) }, () => worker()))
      
      // Cache'e kaydet
      localStorage.setItem(cacheKey, JSON.stringify({
        data: counts,
        timestamp: Date.now()
      }))
      
      globalProviderCounts.value[contentType] = counts
      return counts
      
    } catch (error) {
      return {}
    } finally {
      isLoading.value = false
    }
  }

  function getCachedCounts(contentType: 'movie' | 'tv') {
    return globalProviderCounts.value[contentType]
  }

  function clearCache() {
    localStorage.removeItem('global_provider_counts_movie')
    localStorage.removeItem('global_provider_counts_tv')
    globalProviderCounts.value = { movie: {}, tv: {} }
  }

  return {
    fetchGlobalProviderCounts,
    getCachedCounts,
    clearCache,
    isLoading
  }
}
