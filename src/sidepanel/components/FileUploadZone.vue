<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  accept: string
  multiple?: boolean
  label: string
  buttonText: string
  selectedFile?: File | File[]
  onChange: (event: Event) => void
}

defineProps<Props>()

const fileInput = ref<HTMLInputElement | null>(null)
</script>

<template>
  <div class="space-y-2">
    <label class="block text-sm font-medium text-[#1D1D1F]">{{ label }}</label>
    <div
      class="border-2 border-dashed border-[#E5E5E7] rounded-xl p-6 text-center hover:border-[#0066CC] transition-colors duration-200"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        :multiple="multiple"
        class="hidden"
        @change="onChange"
      >
      <button
        class="text-[#0066CC] hover:text-[#004499] transition-colors duration-200"
        @click="fileInput?.click()"
      >
        {{ buttonText }}
      </button>
      <slot name="selected-info" />
    </div>
  </div>
</template>
