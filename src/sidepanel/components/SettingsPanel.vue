<script setup lang="ts">
import {
  serverUrl,
} from '~/logic/storage'
// import { fetchAllSeries } from '~/background/main'
</script>

<template>
  <div class="space-y-8">
    <!-- 表單區域 -->
    <div class="space-y-7">
      <!-- 圖片路徑映射記錄 URL -->
      <div class="form-group">
        <label class="block text-sm font-medium text-[#1D1D1F] mb-2.5">伺服器網址</label>
        <input
          v-model="serverUrl"
          class="w-full px-4 py-3 rounded-xl bg-white border border-[#E5E5E7]
                 focus:border-[#0066CC] focus:ring focus:ring-[#0066CC20]
                 transition-all duration-200 text-sm"
          placeholder="請輸入伺服器網址"
        >
      </div>

      <!-- 當前設定區域 -->
      <div class="p-5 bg-white rounded-2xl shadow-sm border border-[#E5E5E7]">
        <h2 class="text-lg font-medium text-[#1D1D1F] mb-4">
          目前設定
        </h2>
        <div class="space-y-4">
          <div class="flex flex-col">
            <span class="text-sm text-[#86868B] mb-1">伺服器網址</span>
            <span class="text-sm font-mono text-[#1D1D1F] break-all">
              {{ serverUrl || '尚未設定' }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <!-- <button @click="fetchAllSeries">
      Fetch
    </button> -->
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
