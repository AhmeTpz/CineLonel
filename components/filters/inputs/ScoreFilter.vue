# ===================================================
# SCORE FILTER / PUAN FİLTRESİ
# ===================================================

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  currentUserScore?: { min: number; max: number }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'user-score-change': [score: { min: number; max: number }]
}>()

const userScoreRange = ref([0, 10])

function handleUserScoreChange(event: Event, index: number) {
  const target = event.target as HTMLInputElement
  const value = parseFloat(target.value)
  userScoreRange.value[index] = value
  emit('user-score-change', { min: userScoreRange.value[0], max: userScoreRange.value[1] })
}

function resetUserScore() {
  userScoreRange.value = [0, 10]
  emit('user-score-change', { min: 0, max: 10 })
}

onMounted(() => {
  if (props.currentUserScore) {
    userScoreRange.value = [props.currentUserScore.min, props.currentUserScore.max]
  }
})
</script>

<template>
  <div class="space-y-3">
    <label class="block text-green-700 font-medium text-sm">User Score</label>
    <div class="bg-green-50 rounded-lg p-4 border border-green-100 space-y-6">
      <!-- SCORE VALUES DISPLAY / PUAN DEĞERLERİ GÖSTERİMİ -->
      <div class="flex justify-between items-center">
        <span class="text-sm text-green-700 font-medium">{{ userScoreRange[0] ?? 0 }}</span>
        <span class="text-sm text-green-700 font-medium">{{ userScoreRange[1] ?? 10 }}</span>
      </div>
      
      <!-- DUAL RANGE SLIDER CONTAINER / ÇİFT ARALIK KAYDIRICI KONTEYNER -->
      <div class="relative">
        <!-- SCALE LINES / ÖLÇEK ÇİZGİLERİ -->
        <div class="absolute w-full h-2 top-0">
          <div class="absolute h-3 w-px bg-green-400" style="left: 0%; top: -1px"></div>
          <div class="absolute h-3 w-px bg-green-400" style="left: 20%; top: -1px"></div>
          <div class="absolute h-3 w-px bg-green-400" style="left: 40%; top: -1px"></div>
          <div class="absolute h-3 w-px bg-green-400" style="left: 60%; top: -1px"></div>
          <div class="absolute h-3 w-px bg-green-400" style="left: 80%; top: -1px"></div>
          <div class="absolute h-3 w-px bg-green-400" style="left: 100%; top: -1px"></div>
          
          <div class="absolute h-1 w-px bg-green-300" style="left: 10%"></div>
          <div class="absolute h-1 w-px bg-green-300" style="left: 30%"></div>
          <div class="absolute h-1 w-px bg-green-300" style="left: 50%"></div>
          <div class="absolute h-1 w-px bg-green-300" style="left: 70%"></div>
          <div class="absolute h-1 w-px bg-green-300" style="left: 90%"></div>
        </div>
        
        <!-- BACKGROUND TRACK / ARKAPLAN İZ -->
        <div class="w-full h-2 bg-green-200 rounded-lg absolute top-0"></div>
        
        <!-- ACTIVE RANGE TRACK / AKTİF ARALIK İZ -->
        <div 
          class="h-2 bg-green-500 rounded-lg absolute top-0"
          :style="{ 
            left: ((userScoreRange[0] ?? 0) / 10) * 100 + '%', 
            width: (((userScoreRange[1] ?? 10) - (userScoreRange[0] ?? 0)) / 10) * 100 + '%' 
          }"
        ></div>
        
        <!-- MIN RANGE SLIDER / MİNİMUM ARALIK KAYDIRICI -->
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          :value="userScoreRange[0]"
          @input="handleUserScoreChange($event, 0)"
          class="absolute w-full h-2 bg-transparent appearance-none cursor-pointer range-slider"
          style="z-index: 2;"
        />
        
        <!-- MAX RANGE SLIDER / MAKSİMUM ARALIK KAYDIRICI -->
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          :value="userScoreRange[1]"
          @input="handleUserScoreChange($event, 1)"
          class="absolute w-full h-2 bg-transparent appearance-none cursor-pointer range-slider"
          style="z-index: 1;"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* CUSTOM DUAL RANGE SLIDER STYLES / ÖZEL ÇİFT ARALIK KAYDIRICI STİLLERİ */
.range-slider::-webkit-slider-thumb {
  appearance: none;
  height: 18px;
  width: 18px;
  border-radius: 50%;
  background: #16a34a;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  pointer-events: all;
  position: relative;
  z-index: 3;
}

.range-slider::-moz-range-thumb {
  height: 18px;
  width: 18px;
  border-radius: 50%;
  background: #16a34a;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  pointer-events: all;
}

.range-slider {
  pointer-events: none;
}

.range-slider::-webkit-slider-thumb {
  pointer-events: all;
}

.range-slider::-moz-range-thumb {
  pointer-events: all;
}

input[type="range"]:focus {
  outline: none;
}

input[type="range"]:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
}

.range-slider::-webkit-slider-track {
  background: transparent;
}

.range-slider::-moz-range-track {
  background: transparent;
}
</style>
