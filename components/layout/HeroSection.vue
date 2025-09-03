# ===================================================
# HERO SECTION / KAHRAMAN BÖLÜMÜ
# ===================================================

<template>
  <section class="relative overflow-hidden py-16" :class="gradientClass">
    <div class="container mx-auto px-4 relative z-10">
      <div class="text-center">
        <h1 class="text-5xl md:text-7xl font-bold text-white mb-4 animate-fade-in-up">
          <span :class="titleGradientClass">{{ title }}</span>
        </h1>
        <p class="text-xl text-white/90 mb-8 animate-fade-in-up" style="animation-delay: 0.2s;">
          {{ subtitle }}
        </p>

        <!-- STATS / İSTATİSTİKLER -->
        <div v-if="stats" class="flex justify-center gap-8 mb-8 animate-fade-in-up" style="animation-delay: 0.4s;">
          <div v-for="(stat, index) in stats" :key="index" class="text-center">
            <div class="text-3xl font-bold text-white">{{ stat.value }}</div>
            <div class="text-white/70 text-sm">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Stat {
  value: string | number
  label: string
}

interface Props {
  title: string
  subtitle: string
  gradientClass?: string
  titleGradientClass?: string
  stats?: Stat[]
}

const props = withDefaults(defineProps<Props>(), {
  gradientClass: 'bg-gradient-to-r from-red-600 via-pink-600 to-purple-600',
  titleGradientClass: 'bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent'
})
</script>

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
