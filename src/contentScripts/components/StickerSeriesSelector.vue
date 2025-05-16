<script setup lang="ts">
import { defineEmits, defineProps } from 'vue'
import type { SeriesForDisplay } from '~/types/series'

interface Props {
  seriesList: SeriesForDisplay[]
  currentSeries: string
}

defineProps<Props>()
const emit = defineEmits(['update:currentSeries'])

function selectSeries(id: string) {
  emit('update:currentSeries', id)
}
</script>

<template>
  <div class="relative">
    <div
      class="flex overflow-x-auto px-3 py-3 hide-scrollbar"
      style="scroll-behavior: smooth;"
    >
      <button
        v-for="series in seriesList"
        :key="series.id"
        class="relative shrink-0 w-9 h-9 transition-all duration-200 flex items-center justify-center mx-0.5 first:ml-0 last:mr-0"
        :class="[
          currentSeries === series.id
            ? 'text-[#1d1d1f]'
            : 'text-[#86868b] hover:text-[#1d1d1f]',
        ]"
        @click="selectSeries(series.id)"
      >
        <span class="text-xl">{{ series.img }}</span>
        <div
          v-if="currentSeries === series.id"
          class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#007AFF] rounded-full"
        />
      </button>
    </div>
  </div>
</template>
