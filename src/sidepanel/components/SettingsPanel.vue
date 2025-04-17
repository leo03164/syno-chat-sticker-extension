<script setup lang="ts">
import {
  imgPathMapRecordUrl,
  mainImgServerUrl,
  thirdPartImgServerUrl,
} from '~/logic/storage'
</script>

<template>
  <div class="space-y-8">
    <!-- 表單區域 -->
    <div class="space-y-7">
      <!-- 圖片路徑映射記錄 URL -->
      <div class="form-group">
        <label class="block text-sm font-medium text-[#1D1D1F] mb-2.5">圖片路徑映射記錄 URL</label>
        <input
          v-model="imgPathMapRecordUrl"
          class="w-full px-4 py-3 rounded-xl bg-white border border-[#E5E5E7]
                 focus:border-[#0066CC] focus:ring focus:ring-[#0066CC20]
                 transition-all duration-200 text-sm"
          placeholder="請輸入圖片路徑映射記錄的網址"
        >
      </div>

      <!-- 主要圖片伺服器 URL -->
      <div class="form-group">
        <label class="block text-sm font-medium text-[#1D1D1F] mb-2.5">主要圖片伺服器 URL</label>
        <input
          v-model="mainImgServerUrl"
          class="w-full px-4 py-3 rounded-xl bg-white border border-[#E5E5E7]
                 focus:border-[#0066CC] focus:ring focus:ring-[#0066CC20]
                 transition-all duration-200 text-sm"
          placeholder="請輸入主要圖片伺服器的網址"
        >
      </div>

      <!-- 第三方圖片伺服器 URL -->
      <div class="form-group">
        <label class="block text-sm font-medium text-[#1D1D1F] mb-2.5">第三方圖片伺服器 URL</label>
        <input
          v-model="thirdPartImgServerUrl"
          class="w-full px-4 py-3 rounded-xl bg-white border border-[#E5E5E7]
                 focus:border-[#0066CC] focus:ring focus:ring-[#0066CC20]
                 transition-all duration-200 text-sm"
          placeholder="請輸入第三方圖片伺服器的網址"
        >
      </div>
    </div>

    <!-- 當前設定區域 -->
    <div class="p-5 bg-white rounded-2xl shadow-sm border border-[#E5E5E7]">
      <h2 class="text-lg font-medium text-[#1D1D1F] mb-4">
        目前設定
      </h2>
      <div class="space-y-4">
        <div class="flex flex-col">
          <span class="text-sm text-[#86868B] mb-1">圖片路徑映射記錄</span>
          <span class="text-sm font-mono text-[#1D1D1F] break-all">
            {{ imgPathMapRecordUrl || '尚未設定' }}
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-sm text-[#86868B] mb-1">主要圖片伺服器</span>
          <span class="text-sm font-mono text-[#1D1D1F] break-all">
            {{ mainImgServerUrl || '尚未設定' }}
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-sm text-[#86868B] mb-1">第三方圖片伺服器</span>
          <span class="text-sm font-mono text-[#1D1D1F] break-all">
            {{ thirdPartImgServerUrl || '尚未設定' }}
          </span>
        </div>
      </div>
    </div>
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
