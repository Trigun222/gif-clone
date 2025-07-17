<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps<{
  gif: {
    id: string
    title?: string
  }
}>()

function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text)
  }
  return new Promise((resolve, reject) => {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.top = '0'
    ta.style.left = '0'
    ta.style.width = '1px'
    ta.style.height = '1px'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    try {
      if (document.execCommand('copy')) {
        resolve()
      } else {
        reject(new Error('execCommand failed'))
      }
    } catch (err) {
      reject(err)
    } finally {
      document.body.removeChild(ta)
    }
  })
}

const shareGif = async () => {
  const { id, title } = props.gif
  const shareUrl = `${window.location.origin}/gif/${id}`

  if (navigator.share) {
    try {
      await navigator.share({
        title: title || 'Гифка',
        text: 'Посмотри эту гифку!',
        url: shareUrl
      })
    } catch (err) {
      console.warn('Share cancelled or failed', err)
    }
  } else {
    try {
      await copyToClipboard(shareUrl)
      console.log('Ссылка скопирована в буфер обмена!')
    } catch (err) {
      console.error('Не удалось скопировать ссылку', err)
    }
  }
}
</script>

<template>
  <button class="share-button" @click.stop="shareGif">
    Поделиться
  </button>
</template>

<style scoped>
.share-button {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 10px;
  font-size: 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s ease-in-out;
}
.share-button:hover {
  opacity: 1;
}
</style>
