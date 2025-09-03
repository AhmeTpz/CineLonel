import { ref } from 'vue'
import { useTmdb } from './useTmdb'

interface ProviderLight {
  provider_id: number
  logo_path: string | null
  display_priority?: number
}

export function useWatchProviderCounts() {
  const { request } = useTmdb()
  const memoryCache = (globalThis as any).__wl_provider_counts || ((globalThis as any).__wl_provider_counts = new Map<string, Record<number, number>>())

  function key(contentType: 'movie' | 'tv', region: string) {
    return `${contentType}:${region}`
  }

  function loadLocal(contentType: 'movie' | 'tv', region: string): Record<number, number> | null {
    const k = key(contentType, region)
    if (memoryCache.has(k)) return memoryCache.get(k)!
    try {
      const raw = localStorage.getItem(`wl_provider_counts:${k}`)
      if (!raw) return null
      const { ts, data } = JSON.parse(raw)
      // 7 gün cache
      if (Date.now() - ts > 7 * 24 * 60 * 60 * 1000) return null
      memoryCache.set(k, data)
      return data
    } catch {
      return null
    }
  }

  function saveLocal(contentType: 'movie' | 'tv', region: string, data: Record<number, number>) {
    const k = key(contentType, region)
    memoryCache.set(k, data)
    try {
      localStorage.setItem(`wl_provider_counts:${k}`, JSON.stringify({ ts: Date.now(), data }))
    } catch {/* ignore */}
  }

  async function fetchCounts(contentType: 'movie' | 'tv', region: string, topN?: number): Promise<Record<number, number>> {
    const cached = loadLocal(contentType, region)
    if (cached) return cached

    const provEndpoint = contentType === 'movie' ? '/watch/providers/movie' : '/watch/providers/tv'
    const res = await request<{ results: ProviderLight[] }>(provEndpoint)
    let providers = (res.results || []).filter(p => !!p.logo_path)
    providers = providers.sort((a, b) => (a.display_priority ?? 9999) - (b.display_priority ?? 9999))
    if (typeof topN === 'number') {
      providers = providers.slice(0, topN)
    }

    const counts: Record<number, number> = {}
    const limit = 8
    let idx = 0
    async function worker() {
      while (idx < providers.length) {
        const i = idx++
        const p = providers[i]
        if (!p) continue
        try {
          const r = await request<{ total_results: number }>(
            contentType === 'movie' ? '/discover/movie' : '/discover/tv',
            {
              with_watch_providers: p.provider_id,
              watch_region: region,
              with_watch_monetization_types: 'flatrate|rent|buy|ads|free',
              page: 1
            }
          )
          counts[p.provider_id] = r.total_results || 0
        } catch {/* ignore per provider */}
      }
    }
    await Promise.all(Array.from({ length: Math.min(limit, providers.length) }, () => worker()))
    const filtered = Object.fromEntries(Object.entries(counts).filter(([, v]) => (v as number) > 0))
    saveLocal(contentType, region, filtered)
    return filtered
  }

  return { fetchCounts }
}


