<template>
  <v-overlay absolute :value="!isPageLoaded" z-index="9999">
    <v-progress-circular indeterminate size="64" width="6" />
  </v-overlay>

  <v-container v-show="isPageLoaded" class="main-container" fluid>
    <!-- Header -->
    <v-row class="align-center ma-0 pa-0" style="min-height: 80px; max-height: 100px;">
      <v-col cols="auto">
        <router-link to="/" class="gradient-title">
          <h2>Gif</h2>
        </router-link>
      </v-col>
      <v-col class="flex-grow-1">
        <v-text-field
          v-model="search"
          label="Поиск гифок"
          hide-details
          clearable
        />
      </v-col>
    </v-row>

    <!-- No results -->
    <div v-if="noResults" class="not-found">
      <div class="not-found-text">Not Found</div>
      <div class="not-found-gif">
        <img :src="fallbackGif?.images.fixed_width.url" alt="Not Found Gif" />
      </div>
    </div>

    <!-- Masonry with animated transition -->
    <transition name="fade-gifs" mode="out-in">
      <div
        class="gif-masonry pt-5"
        :key="search + page"
      >
        <div
          v-for="(colGifs, colIndex) in columns"
          :key="colIndex"
          class="masonry-column"
        >
          <div
            v-for="(gif, i) in colGifs"
            :key="gif.id"
            class="gif-item appear"
          >
            <GifCard :gif="gif" />
          </div>
        </div>
      </div>
    </transition>

    <div v-if="loading && gifs.length" class="loading">Загрузка...</div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { getTrendingGifs, searchGifs } from '@/api/gif.ts'
import { debounce } from '@/utils/debounce.ts'
import GifCard from '@/components/GifCard.vue'

// Page load
const isPageLoaded = ref(false)
function markAsLoaded() {
  isPageLoaded.value = true
}
onMounted(() => {
  if (document.readyState === 'complete') markAsLoaded()
  else window.addEventListener('load', markAsLoaded)
})
onUnmounted(() => window.removeEventListener('load', markAsLoaded))

// Core state
const search = ref('')
const gifs = ref<any[]>([])
const fallbackGif = ref<any | null>(null)
const page = ref(1)
const pageSize = 30
const loading = ref(false)
const noResults = ref(false)
const hasMore = ref(true)

// Responsive layout
const width = ref(window.innerWidth)
function onResize() { width.value = window.innerWidth }
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

const columnCount = computed(() => {
  if (width.value <= 600) return 1
  if (width.value <= 900) return 2
  if (width.value <= 1200) return 3
  return 4
})

const columns = computed(() => {
  const cols: any[][] = Array.from({ length: columnCount.value }, () => [])
  gifs.value.forEach((gif, idx) => {
    cols[idx % columnCount.value].push(gif)
  })
  return cols
})

// Animate gif appearance
watch(gifs, async () => {
  await nextTick()
  const items = document.querySelectorAll<HTMLElement>('.gif-item')
  items.forEach((el, i) => {
    el.classList.remove('appear')
    setTimeout(() => el.classList.add('appear'), i * 20)
  })
})

// Load gifs
const loadGifs = async (reset = false) => {
  loading.value = true
  let results: any[] = []
  try {
    results = search.value
      ? await searchGifs(search.value, pageSize, page.value)
      : await getTrendingGifs(pageSize, page.value)
  } catch (e) {
    console.error(e)
  }

  gifs.value = reset ? results : [...gifs.value, ...results]
  noResults.value = reset && !results.length
  hasMore.value = results.length === pageSize
  loading.value = false

  if (noResults.value) {
    const fb = await searchGifs('not found', 10, 1)
    fallbackGif.value = fb[Math.floor(Math.random() * fb.length)]
  }
}

// Debounced search
const debouncedSearch = debounce(async () => {
  page.value = 1
  await loadGifs(true)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}, 500)
watch(search, debouncedSearch)

// Infinite scroll
const fetchMore = async () => {
  if (loading.value || !hasMore.value) return
  page.value++
  await loadGifs(false)
}
function handleScroll() {
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 200) {
    fetchMore()
  }
}
onMounted(() => {
  loadGifs(true)
  window.addEventListener('scroll', handleScroll)
})
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<style scoped>
.main-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 16px;
}

.gif-masonry {
  display: flex;
  gap: 16px;
}
.masonry-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.gif-item {
  width: 100%;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.gif-item.appear {
  opacity: 1;
  transform: translateY(0);
}

.fade-gifs-enter-active,
.fade-gifs-leave-active {
  transition: opacity 0.4s ease;
}
.fade-gifs-enter-from,
.fade-gifs-leave-to {
  opacity: 0;
}

.loading {
  text-align: center;
  padding: 20px;
  font-size: 18px;
  color: #888;
}

.not-found {
  text-align: center;
  margin-top: 40px;
}
.not-found-text {
  font-size: 20px;
  color: #888;
  margin-bottom: 16px;
}
.not-found-gif img {
  max-width: 300px;
  border-radius: 8px;
}
</style>
