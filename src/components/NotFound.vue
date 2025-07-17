<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps<{
  gif: any | null
}>()
</script>

<template>
  <div class="not-found">
    <div class="not-found-text">Not Found</div>
    <div class="gif-item not-found-gif" v-if="gif">
      <img :src="gif.images.fixed_width.url" alt="Not Found Gif" />
    </div>
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  margin-top: 60px;
}
.not-found-text {
  font-size: 32px;
  font-weight: bold;
  color: #ccc;
  margin-bottom: 20px;
}
.not-found-gif {
  display: inline-block;
  max-width: 300px;
  margin: 0 auto;
}
.not-found-gif img {
  width: 100%;
  border-radius: 12px;
}
</style>
