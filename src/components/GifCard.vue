<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ShareButton from '@/components/ShareButton.vue'

defineProps<{
  gif: {
    id: string
    title: string
    images: { fixed_width: { url: string } }
  }
  index: number
}>()

const hover = ref(false)
const router = useRouter()

const goToGif = (id: string) => {
  router.push(`/gif/${id}`)
}
</script>

<template>
  <div
    class="gif-item"
    @click="goToGif(gif.id)"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <img :src="gif.images.fixed_width.url" :alt="gif.title" />

    <ShareButton v-if="hover" :gif="{ id: gif.id, title: gif.title }" />
  </div>
</template>

<style scoped>
.gif-item {
  position: relative;
  break-inside: avoid;
  margin-bottom: 16px;
  cursor: pointer;
  transition: transform 0.2s;
}
.gif-item:hover {
  transform: scale(1.03);
}
.gif-item img {
  width: 100%;
  border-radius: 8px;
  display: block;
}
</style>
