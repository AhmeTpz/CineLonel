# ===================================================
# RUNTIME FILTER / SÜRE FİLTRESİ
# ===================================================

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  currentRuntime?: { min: number; max: number }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'runtime-change': [runtime: { min: number; max: number }]
}>()

const runtimeRange = ref<[number, number]>([0, 360])

function handleRuntimeChange(event: Event, index: number) {
  const target = event.target as HTMLInputElement
  const value = parseInt(target.value)
  runtimeRange.value[index] = value
  emit('runtime-change', { min: runtimeRange.value[0], max: runtimeRange.value[1] })
}

function resetRuntime() {
  runtimeRange.value = [0, 360]
  emit('runtime-change', { min: 0, max: 360 })
}

function formatRuntime(minutes: number): string {
  if (minutes === 0) return '0'
  return `${minutes}`
}

onMounted(() => {
  if (props.currentRuntime) {
    runtimeRange.value = [props.currentRuntime.min, props.currentRuntime.max]
  }
})
</script>

<template>
  <div class="space-y-3">
    <label class="block text-green-700 font-medium text-sm">Runtime (minutes)</label>
    <div class="bg-green-50 rounded-lg p-4 border border-green-100 space-y-6">
      <!-- RUNTIME VALUES DISPLAY / SÜRE DEĞERLERİ GÖSTERİMİ -->
      <div class="flex justify-between items-center">
        <span class="text-sm text-green-700 font-medium">{{ formatRuntime(runtimeRange[0] ?? 0) }}min</span>
        <span class="text-sm text-green-700 font-medium">{{ formatRuntime(runtimeRange[1] ?? 360) }}min</span>
      </div>
      
      <!-- DUAL RUNTIME SLIDER CONTAINER / ÇİFT SÜRE KAYDIRICI KONTEYNER -->
      <div class="relative">
        <!-- SCALE LINES (EQUAL INTERVALS) / ÖLÇEK ÇİZGİLERİ (EŞİT ARALIKLAR) -->
        <div class="absolute w-full h-2 top-0">
          <!-- MAJOR SCALE LINES / ANA ÖLÇEK ÇİZGİLERİ -->
          <div class="absolute h-3 w-px bg-green-400" style="left: 0%; top: -1px"></div>
          <div class="absolute h-3 w-px bg-green-400" style="left: 20%; top: -1px"></div>
          <div class="absolute h-3 w-px bg-green-400" style="left: 40%; top: -1px"></div>
          <div class="absolute h-3 w-px bg-green-400" style="left: 60%; top: -1px"></div>
          <div class="absolute h-3 w-px bg-green-400" style="left: 80%; top: -1px"></div>
          <div class="absolute h-3 w-px bg-green-400" style="left: 100%; top: -1px"></div>
          
          <!-- MINOR SCALE LINES / KÜÇÜK ÖLÇEK ÇİZGİLERİ -->
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
            left: ((runtimeRange[0] ?? 0) / 360) * 100 + '%', 
            width: (((runtimeRange[1] ?? 360) - (runtimeRange[0] ?? 0)) / 360) * 100 + '%' 
          }"
        ></div>
        
        <!-- MIN RUNTIME SLIDER / MİNİMUM SÜRE KAYDIRICI -->
        <input
          type="range"
          min="0"
          max="360"
          step="10"
          :value="runtimeRange[0]"
          @input="handleRuntimeChange($event, 0)"
          class="absolute w-full h-2 bg-transparent appearance-none cursor-pointer range-slider"
          style="z-index: 2;"
        />
        
        <!-- MAX RUNTIME SLIDER / MAKSİMUM SÜRE KAYDIRICI -->
        <input
          type="range"
          min="0"
          max="360"
          step="10"
          :value="runtimeRange[1]"
          @input="handleRuntimeChange($event, 1)"
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
