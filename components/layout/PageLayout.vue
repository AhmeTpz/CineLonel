# ===================================================
# PAGE LAYOUT / SAYFA DÜZENİ
# ===================================================

<template>
  <div class="min-h-screen relative overflow-visible">
    <!-- ANIMATED BACKGROUND / ANİMASYONLU ARKAPLAN -->
    <AnimatedBackground />

    <!-- CONTENT / İÇERİK -->
    <div class="relative z-10">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import AnimatedBackground from './AnimatedBackground.vue'
</script>

<style scoped>
/* Common page styles */
</style>
