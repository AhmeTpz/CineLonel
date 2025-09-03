# ===================================================
# LOGO / LOGO
# ===================================================

<template>
  <NuxtLink to="/" class="glass-logo relative bg-white/20 backdrop-blur-2x1 border border-white/40 rounded-xl flex items-center justify-center hover:bg-white/30 hover:shadow-2xl hover:border-white/60 transition-all duration-500 group overflow-hidden min-w-fit">
    <!-- GLASS REFLECTION EFFECT / CAM YANSIMASI ETKİSİ -->
    <div class="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-xl pointer-events-none"></div>
    <!-- FOG EFFECT / BUĞU ETKİSİ -->
    <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/10 via-white/5 to-transparent rounded-xl pointer-events-none"></div>
    <!-- LIGHT REFLECTION / IŞIK YANSIMASI -->
    <div class="absolute -top-2 -left-2 w-8 h-8 bg-white/20 rounded-full blur-xl group-hover:bg-white/40 transition-all duration-500"></div>
    <img src="/logo.png" alt="CineLonel" class="h-14 md:h-16 w-auto select-none relative z-10 rounded-xl" />
  </NuxtLink>
</template>

<script setup lang="ts">
// Component logic here if needed
</script>

<style scoped>
/* REAL GLASS EFFECT / GERÇEK CAM ETKİSİ */
.glass-logo {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.25) 0%,
    rgba(255, 255, 255, 0.15) 25%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 75%,
    rgba(255, 255, 255, 0.15) 100%
  );
  backdrop-filter: blur(15px) saturate(180%);
  -webkit-backdrop-filter: blur(15px) saturate(180%);
  box-shadow:
    0 8px 32px rgba(31, 38, 135, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  padding: 2px !important;
  line-height: 0;
}

.glass-logo::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.2) 50%,
    transparent 70%
  );
  transform: translateX(-100%);
  transition: transform 0.8s ease;
  border-radius: inherit;
}

.glass-logo:hover::before {
  transform: translateX(100%);
}

.glass-logo:hover {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.35) 0%,
    rgba(255, 255, 255, 0.25) 25%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    rgba(255, 255, 255, 0.25) 100%
  );
  box-shadow:
    0 16px 40px rgba(31, 38, 135, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    inset 0 -1px 0 rgba(255, 255, 255, 0.2);
}
</style>
