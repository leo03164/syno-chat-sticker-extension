<script setup lang="ts">
import { ref } from 'vue'
import SettingsPanel from './components/SettingsPanel.vue'
import StickersPanel from './components/StickersPanel.vue'

const activeTab = ref('settings')
</script>

<template>
  <div class="flex flex-col h-screen bg-[#F5F5F7]">
    <!-- 主要內容區 -->
    <main class="flex-1 overflow-y-auto">
      <!-- 標題區域 -->
      <div class="px-6 py-8">
        <h1 class="text-3xl font-medium text-[#1D1D1F] mb-3">
          設定
        </h1>
      </div>

      <!-- Tab 切換區 -->
      <div class="px-6 mb-6">
        <div class="flex space-x-4 border-b border-[#E5E5E7]">
          <button
            class="px-4 py-2 text-sm font-medium transition-all duration-200"
            :class="activeTab === 'settings'
              ? 'text-[#0066CC] border-b-2 border-[#0066CC]'
              : 'text-[#86868B] hover:text-[#1D1D1F]'"
            @click="activeTab = 'settings'"
          >
            設定
          </button>
          <button
            class="px-4 py-2 text-sm font-medium transition-all duration-200"
            :class="activeTab === 'stickers'
              ? 'text-[#0066CC] border-b-2 border-[#0066CC]'
              : 'text-[#86868B] hover:text-[#1D1D1F]'"
            @click="activeTab = 'stickers'"
          >
            貼圖
          </button>
        </div>
      </div>

      <!-- 內容區域 -->
      <div class="px-6">
        <SettingsPanel v-if="activeTab === 'settings'" />
        <StickersPanel v-else-if="activeTab === 'stickers'" />
      </div>
    </main>

    <!-- 固定在底部的 Footer -->
    <footer class="flex-shrink-0 py-4 px-6 text-center border-t border-[#E5E5E7] bg-white">
      <SharedSubtitle />
    </footer>
  </div>
</template>

<style scoped>
.form-group input {
  -webkit-appearance: none;
  appearance: none;
}

.form-group input:focus {
  outline: none;
}

.form-group input::placeholder {
  color: #86868B;
}
</style>
