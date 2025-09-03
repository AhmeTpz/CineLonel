const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

export function useTmdb() {
  const config = useRuntimeConfig()

  async function request<T>(path: string, params: Record<string, unknown> = {}): Promise<T> {
    const apiKey = config.public.tmdbApiKey
    if (!apiKey) throw new Error('TMDB API key is not set')
    
    const url = new URL(TMDB_BASE_URL + path)
    const finalParams: Record<string, string> = {
      api_key: apiKey,
      language: 'en-US',
      region: 'US', // Amerika bölgesi için daha güncel veriler
      ...params,
    }
    Object.entries(finalParams).forEach(([k, v]) => url.searchParams.set(k, String(v)))

    const res = await fetch(url.toString())
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`TMDB request failed: ${res.status} ${text}`)
    }
    return res.json() as Promise<T>
  }

  function getImageUrl(path: string | null | undefined, size: 'w92' | 'w185' | 'w342' | 'w500' | 'w1280' | 'original' = 'w342') {
    if (!path) return ''
    return `https://image.tmdb.org/t/p/${size}${path}`
  }

  return { request, getImageUrl }
}
