# ===================================================
# VOTES FILTER / OY FİLTRESİ
# ===================================================

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  currentVotes?: { min: number; max: number }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'votes-change': [votes: { min: number; max: number }]
}>()

const votesRange = ref<[number, number]>([0, 50000])

function handleVotesChange(event: Event, index: number) {
  const target = event.target as HTMLInputElement
  const linearValue = parseInt(target.value)  // 0-100
  const votesValue = linearToVotes(linearValue)  // Convert to votes with steps
  votesRange.value[index] = votesValue
  emit('votes-change', { min: votesRange.value[0], max: votesRange.value[1] })
}

function resetVotes() {
  votesRange.value = [0, 50000]
  emit('votes-change', { min: 0, max: 50000 })
}

// CONVERT LINEAR SLIDER (0-100) TO VOTES VALUE WITH STEP RANGES / DOĞRUSAL KAYDIRICIYI (0-100) ADIMLI OY DEĞERLERİNE ÇEVİR
function linearToVotes(linear: number): number {
  // 0-20% = 0-500 (50'şer)
  if (linear <= 20) {
    return Math.round((linear / 20) * 500 / 50) * 50
  }
  // 20-40% = 500-1000 (100'er)
  else if (linear <= 40) {
    const progress = (linear - 20) / 20  // 0-1
    return 500 + Math.round(progress * 500 / 100) * 100
  }
  // 40-60% = 1000-10000 (1000'er)
  else if (linear <= 60) {
    const progress = (linear - 40) / 20  // 0-1
    return 1000 + Math.round(progress * 9000 / 1000) * 1000
  }
  // 60-80% = 10000-25000 (5000'er)
  else if (linear <= 80) {
    const progress = (linear - 60) / 20  // 0-1
    return 10000 + Math.round(progress * 15000 / 5000) * 5000
  }
  // 80-100% = 25000-50000 (5000'er)
  else {
    const progress = (linear - 80) / 20  // 0-1
    return 25000 + Math.round(progress * 25000 / 5000) * 5000
  }
}

// CONVERT VOTES VALUE TO LINEAR SLIDER (0-100) / OY DEĞERİNİ DOĞRUSAL KAYDIRICIYA (0-100) ÇEVİR
function votesToLinear(votes: number): number {
  if (votes <= 500) {
    return (votes / 500) * 20
  }
  else if (votes <= 1000) {
    return 20 + ((votes - 500) / 500) * 20
  }
  else if (votes <= 10000) {
    return 40 + ((votes - 1000) / 9000) * 20
  }
  else if (votes <= 25000) {
    return 60 + ((votes - 10000) / 15000) * 20
  }
  else {
    return 80 + ((votes - 25000) / 25000) * 20
  }
}

function formatVotes(votes: number): string {
  return votes.toLocaleString()
}

onMounted(() => {
  if (props.currentVotes) {
    votesRange.value = [props.currentVotes.min, props.currentVotes.max]
  }
})
</script>

<template>
  <div class="space-y-3">
    <label class="block text-green-700 font-medium text-sm">User Votes</label>
    <div class="bg-green-50 rounded-lg p-4 border border-green-100 space-y-6">
      <!-- VOTES VALUES DISPLAY / OY DEĞERLERİ GÖSTERİMİ -->
      <div class="flex justify-between items-center">
        <span class="text-sm text-green-700 font-medium">{{ formatVotes(votesRange[0] ?? 0) }}</span>
        <span class="text-sm text-green-700 font-medium">{{ formatVotes(votesRange[1] ?? 50000) }}</span>
      </div>
      
      <!-- DUAL VOTES SLIDER CONTAINER / ÇİFT OY KAYDIRICI KONTEYNER -->
      <div class="relative py-3">
        <!-- SCALE LINES (PROGRESSIVE HEIGHT) / ÖLÇEK ÇİZGİLERİ (AŞAMALI YÜKSEKLİK) -->
        <div class="absolute w-full h-2 top-3">
          <!-- MAJOR SCALE LINES (PROGRESSIVE HEIGHT - GETS TALLER TO THE RIGHT) / ANA ÖLÇEK ÇİZGİLERİ (AŞAMALI YÜKSEKLİK - SAĞA DOĞRU UZAR) -->
          <div class="absolute h-2 w-px bg-green-400" style="left: 0%; top: 0px"></div>
          <div class="absolute h-3 w-px bg-green-400" style="left: 20%; top: -1px"></div>
          <div class="absolute h-4 w-px bg-green-400" style="left: 40%; top: -2px"></div>
          <div class="absolute h-5 w-px bg-green-400" style="left: 60%; top: -3px"></div>
          <div class="absolute h-6 w-px bg-green-400" style="left: 80%; top: -4px"></div>
          <div class="absolute h-7 w-px bg-green-400" style="left: 100%; top: -5px"></div>
          
          <!-- MINOR SCALE LINES (ALSO PROGRESSIVE) / KÜÇÜK ÖLÇEK ÇİZGİLERİ (AŞAMALI) -->
          <div class="absolute h-1 w-px bg-green-300" style="left: 5%"></div>
          <div class="absolute h-1 w-px bg-green-300" style="left: 10%"></div>
          <div class="absolute h-1 w-px bg-green-300" style="left: 15%"></div>
          <div class="absolute h-2 w-px bg-green-300" style="left: 25%"></div>
          <div class="absolute h-2 w-px bg-green-300" style="left: 30%"></div>
          <div class="absolute h-2 w-px bg-green-300" style="left: 35%"></div>
          <div class="absolute h-3 w-px bg-green-300" style="left: 45%"></div>
          <div class="absolute h-3 w-px bg-green-300" style="left: 50%"></div>
          <div class="absolute h-3 w-px bg-green-300" style="left: 55%"></div>
          <div class="absolute h-4 w-px bg-green-300" style="left: 65%"></div>
          <div class="absolute h-4 w-px bg-green-300" style="left: 70%"></div>
          <div class="absolute h-4 w-px bg-green-300" style="left: 75%"></div>
          <div class="absolute h-5 w-px bg-green-300" style="left: 85%"></div>
          <div class="absolute h-5 w-px bg-green-300" style="left: 90%"></div>
          <div class="absolute h-5 w-px bg-green-300" style="left: 95%"></div>
        </div>
        
        <!-- BACKGROUND TRACK / ARKAPLAN İZ -->
        <div class="w-full h-2 bg-green-200 rounded-lg absolute top-3"></div>
        
        <!-- ACTIVE RANGE TRACK / AKTİF ARALIK İZ -->
        <div 
          class="h-2 bg-green-500 rounded-lg absolute top-3"
          :style="{ 
            left: votesToLinear(votesRange[0] ?? 0) + '%', 
            width: (votesToLinear(votesRange[1] ?? 50000) - votesToLinear(votesRange[0] ?? 0)) + '%' 
          }"
        ></div>
        
        <!-- MIN VOTES SLIDER / MİNİMUM OY KAYDIRICI -->
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          :value="votesToLinear(votesRange[0] ?? 0)"
          @input="handleVotesChange($event, 0)"
          class="absolute w-full h-2 bg-transparent appearance-none cursor-pointer range-slider"
          style="z-index: 2; top: 12px;"
        />
        
        <!-- MAX VOTES SLIDER / MAKSİMUM OY KAYDIRICI -->
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          :value="votesToLinear(votesRange[1] ?? 50000)"
          @input="handleVotesChange($event, 1)"
          class="absolute w-full h-2 bg-transparent appearance-none cursor-pointer range-slider"
          style="z-index: 1; top: 12px;"
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
