# ===================================================
# HORIZONTAL SCROLLER / YATAY KAYDIRICI
# ===================================================

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  theme?: 'green' | 'purple' | 'blue'
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'green'
})

const scroller = ref<HTMLDivElement | null>(null)

function scrollByAmount(amount: number) {
  scroller.value?.scrollBy({ left: amount, behavior: 'smooth' })
}
</script>

<template>
  <div class="scroller-container">
    <!-- Left Scroll Button -->
    <button
      :class="['scroll-button', `${props.theme}-theme`]"
      @click="scrollByAmount(-600)"
      aria-label="Scroll left"
      type="button"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="button-icon"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15.75 19.5L8.25 12l7.5-7.5"
        />
      </svg>
    </button>

    <!-- Scroll Container -->
    <div class="scroll-container">
      <div ref="scroller" class="scroll-content">
        <div class="scroll-items">
          <slot />
        </div>
      </div>
    </div>

    <!-- Right Scroll Button -->
    <button
      :class="['scroll-button', `${props.theme}-theme`]"
      @click="scrollByAmount(600)"
      aria-label="Scroll right"
      type="button"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="button-icon"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M8.25 4.5l7.5 7.5-7.5 7.5"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.scroller-container {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

/* SCROLL BUTTONS / KAYDIRMA BUTONLARI */
.scroll-button {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* GREEN THEME / YEŞİL TEMA */
.scroll-button.green-theme {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.scroll-button.green-theme:hover {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.4);
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.2);
}

/* PURPLE THEME / MOR TEMA */
.scroll-button.purple-theme {
  background: rgba(236, 72, 153, 0.1);
  border: 1px solid rgba(236, 72, 153, 0.2);
  color: #ec4899;
}

.scroll-button.purple-theme:hover {
  background: rgba(236, 72, 153, 0.2);
  border-color: rgba(236, 72, 153, 0.4);
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(236, 72, 153, 0.2);
}

/* BLUE THEME / MAVİ TEMA */
.scroll-button.blue-theme {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.scroll-button.blue-theme:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.2);
}

.scroll-button:active {
  transform: scale(0.95);
}

.button-icon {
  width: 20px;
  height: 20px;
  transition: all 0.3s ease;
}

.scroll-button:hover .button-icon {
  transform: scale(1.1);
}

/* SCROLL CONTAINER / KAYDIRMA KONTEYNERİ */
.scroll-container {
  flex: 1;
  overflow: hidden;
  border-radius: 12px;
}

.scroll-content {
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 4px;
}

.scroll-content::-webkit-scrollbar {
  display: none;
}

.scroll-items {
  display: flex;
  gap: 20px;
  transition: all 0.3s ease;
}

/* RESPONSIVE / DUYARLI */
@media (max-width: 768px) {
  .scroller-container {
    gap: 8px;
  }

  .scroll-button {
    width: 40px;
    height: 40px;
  }

  .button-icon {
    width: 18px;
    height: 18px;
  }

  .scroll-items {
    gap: 16px;
  }
}
</style>
