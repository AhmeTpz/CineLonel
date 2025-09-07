# ===================================================
# DATE FILTER / TARİH FİLTRESİ
# ===================================================

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  contentType: 'movie' | 'tv'
  currentReleaseDate?: { from: string; to: string }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'release-date-change': [date: { from: string; to: string }]
}>()

const releaseDateFrom = ref<string>('')
const releaseDateTo = ref<string>('')

function handleDateFromInput() {
  emit('release-date-change', { from: releaseDateFrom.value, to: releaseDateTo.value })
}

function handleDateToInput() {
  emit('release-date-change', { from: releaseDateFrom.value, to: releaseDateTo.value })
}

function getDateDisplayText() {
  if (!releaseDateFrom.value && !releaseDateTo.value) return 'All Dates'
  if (releaseDateFrom.value && releaseDateTo.value) return `${releaseDateFrom.value} - ${releaseDateTo.value}`
  if (releaseDateFrom.value) return `From ${releaseDateFrom.value}`
  if (releaseDateTo.value) return `To ${releaseDateTo.value}`
  return 'All Dates'
}

function resetReleaseDate() {
  releaseDateFrom.value = ''
  releaseDateTo.value = ''
  emit('release-date-change', { from: '', to: '' })
}

onMounted(() => {
  if (props.currentReleaseDate) {
    releaseDateFrom.value = props.currentReleaseDate.from
    releaseDateTo.value = props.currentReleaseDate.to
  }
})
</script>

<template>
  <div class="space-y-3">
    <label class="block text-green-700 font-medium text-sm">
      {{ contentType === 'movie' ? 'Release Date' : 'First Air Date' }}
    </label>
    <div class="bg-green-50 rounded-lg p-4 border border-green-100 relative">
      <!-- DATE RANGE CONTAINER / TARİH ARALIĞI KONTEYNER -->
      <div class="flex items-end gap-3">
        <!-- FROM DATE / BAŞLANGIÇ TARİHİ -->
        <div class="flex-1">
          <label class="block text-xs text-green-600 mb-1">From</label>
          <input
            type="date"
            v-model="releaseDateFrom"
            @input="handleDateFromInput"
            class="w-full px-3 py-2 bg-white rounded-lg border border-green-200 hover:border-green-400 focus:border-green-500 focus:outline-none transition-colors text-sm text-green-700 font-medium [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:saturate-100 [&::-webkit-calendar-picker-indicator]:invert-[0.34] [&::-webkit-calendar-picker-indicator]:sepia-[0.91] [&::-webkit-calendar-picker-indicator]:saturate-[6.48] [&::-webkit-calendar-picker-indicator]:hue-rotate-[92deg] [&::-webkit-calendar-picker-indicator]:brightness-[0.95] [&::-webkit-calendar-picker-indicator]:contrast-[0.86] [&::-webkit-calendar-picker-indicator]:opacity-100"
          />
        </div>
        
        <!-- TO DATE / BİTİŞ TARİHİ -->
        <div class="flex-1">
          <label class="block text-xs text-green-600 mb-1">To</label>
          <input
            type="date"
            v-model="releaseDateTo"
            @input="handleDateToInput"
            class="w-full px-3 py-2 bg-white rounded-lg border border-green-200 hover:border-green-400 focus:border-green-500 focus:outline-none transition-colors text-sm text-green-700 font-medium [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:saturate-100 [&::-webkit-calendar-picker-indicator]:invert-[0.34] [&::-webkit-calendar-picker-indicator]:sepia-[0.91] [&::-webkit-calendar-picker-indicator]:saturate-[6.48] [&::-webkit-calendar-picker-indicator]:hue-rotate-[92deg] [&::-webkit-calendar-picker-indicator]:brightness-[0.95] [&::-webkit-calendar-picker-indicator]:contrast-[0.86] [&::-webkit-calendar-picker-indicator]:opacity-100"
          />
        </div>
      </div>
    </div>
  </div>
</template>
