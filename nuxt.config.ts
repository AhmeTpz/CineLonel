export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: true,
  nitro: {
    prerender: {
      routes: ['/']
    }
  },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],
  
  pages: true,
  
  hooks: {
    'pages:extend'(pages) {
      // /movies URL'si için movies/movies.vue sayfasını kullan
      pages.push({
        name: 'movies',
        path: '/movies',
        file: '~/pages/movies/movies.vue'
      })
      
      // /tv URL'si için tv/tv.vue sayfasını kullan
      pages.push({
        name: 'tv',
        path: '/tv',
        file: '~/pages/tv/tv.vue'
      })
      
      // /people URL'si için people/index.vue  kullan
      pages.push({
        name: 'people',
        path: '/people',
        file: '~/pages/people/people.vue'
      })
    }
  },
  
  app: {
    head: {
      title: 'CineLonel - The Movie & Series Database',
      meta: [
        { name: 'description', content: 'Discover the latest movies, TV shows, and talented people in the entertainment industry.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo-mini.png' },
        { rel: 'shortcut icon', type: 'image/png', href: '/logo-mini.png' }
      ]
    }
  },
  
  runtimeConfig: {
    // Private keys (only available on server-side)
    tmdbApiKey: process.env.TMDB_API_KEY || '348088421ad3fb3a9d6e56bb6a9a8f80',
    // Public keys (exposed to client-side)
    public: {
      tmdbApiKey: process.env.TMDB_API_KEY || '348088421ad3fb3a9d6e56bb6a9a8f80'
    }
  }
})