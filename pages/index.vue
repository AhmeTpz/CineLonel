# ===================================================
# INDEX PAGE / ANA SAYFA
# ===================================================

<script setup lang="ts">
import SearchSection from '../components/sections/SearchSection.vue'
import PopularSection from '../components/sections/PopularSection.vue'
import TrailersSection from '../components/sections/TrailersSection.vue'
import RecommendationsSection from '../components/sections/RecommendationsSection.vue'
import AnimatedBackground from '../components/layout/AnimatedBackground.vue'
</script>

<template>
  <div class="relative bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 min-h-screen overflow-hidden">
    <!-- ORTAK ANİMASYONLU ARKAPLAN / SHARED ANIMATED BACKGROUND -->
    <AnimatedBackground />
    
    <!-- SEARCH SECTION / ARAMA BÖLÜMÜ -->
    <SearchSection />
    
        <!-- POPULAR SECTION / POPÜLERLER BÖLÜMÜ -->
    <PopularSection class="content-section" />nı 

    <!-- TRAILERS SECTION / FRAGMANLAR BÖLÜMÜ -->
    <TrailersSection />

    <!-- RECOMMENDATIONS SECTION / ÖNERİLER BÖLÜMÜ -->
    <RecommendationsSection />
  </div>
</template>

<style scoped></style>

