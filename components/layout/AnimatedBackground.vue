# ===================================================
# ANIMATED BACKGROUND / ANİMASYONLU ARKAPLAN
# ===================================================

<template>
  <div class="absolute inset-0">
    <!-- ANIMATED GREEN PATTERN / ANİMASYONLU YEŞİL DESEN -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute inset-0" style="background-image:
        radial-gradient(circle at 25% 25%, #10b981 2px, transparent 2px),
        radial-gradient(circle at 75% 75%, #059669 2px, transparent 2px),
        radial-gradient(circle at 50% 50%, #16a34a 1px, transparent 1px);
        background-size: 60px 60px, 80px 80px, 40px 40px;
        animation: patternMove 20s linear infinite;"></div>
    </div>

    <!-- GRADIENT ORBS / GRADİYENT KÜRELER -->
    <div class="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-emerald-200/40 to-green-200/40 rounded-full blur-3xl animate-float"></div>
    <div class="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-lime-200/30 to-emerald-200/30 rounded-full blur-3xl animate-float-delayed"></div>
    <div class="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-green-200/25 to-teal-200/25 rounded-full blur-3xl animate-float-slow"></div>

    <!-- FLOATING PARTICLES / YÜZEN PARÇACIKLAR -->
    <div class="particles-container">
      <div v-for="i in 12" :key="i"
           class="particle"
           :style="{
             '--delay': `${Math.random() * 3}s`,
             '--duration': `${2 + Math.random() * 3}s`,
             '--x': `${Math.random() * 100}%`,
             '--y': `${Math.random() * 100}%`
           }">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Component logic here if needed
</script>

<style scoped>
@keyframes patternMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(60px, 60px); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes float-delayed {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}

@keyframes float-slow {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes particleFloat {
  0% {
    transform: translate(var(--x), var(--y)) scale(0);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translate(calc(var(--x) + 100px), calc(var(--y) - 100px)) scale(1);
    opacity: 0;
  }
}

.particles-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(16, 185, 129, 0.3);
  border-radius: 50%;
  animation: particleFloat var(--duration) ease-in-out infinite;
  animation-delay: var(--delay);
}
</style>
