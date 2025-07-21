<template>
  <v-overlay absolute :value="!isPageLoaded" z-index="9999">
    <v-progress-circular indeterminate size="64" width="6" />
  </v-overlay>

  <v-container v-show="isPageLoaded" class="main-container" fluid>
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

    <div v-if="noResults" class="not-found">
      <div class="not-found-text">Not Found</div>
      <div class="gif-item not-found-gif">
        <img :src="fallbackGif?.images.fixed_width.url" alt="Not Found Gif" />
      </div>
    </div>

    <div class="gif-masonry pt-5">
      <div v-for="(colGifs, colIndex) in columns" :key="colIndex" class="masonry-column">
        <GifCard
          v-for="(gif, i) in colGifs"
          :key="gif.id"
          :gif="gif"
          :index="i"
        />
      </div>
    </div>

    <div v-if="loading && !noResults" class="loading">Загрузка...</div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { getTrendingGifs, searchGifs } from '@/api/gif.ts'
import { debounce } from '@/utils/debounce.ts'
import GifCard from '@/components/GifCard.vue'

const isPageLoaded = ref(false)
function markAsLoaded() {
  isPageLoaded.value = true
}
onMounted(() => {
  if (document.readyState === 'complete') markAsLoaded()
  else window.addEventListener('load', markAsLoaded)
})
onUnmounted(() => window.removeEventListener('load', markAsLoaded))

const search = ref('')
const gifs = ref<any[]>([])
const fallbackGif = ref<any | null>(null)
const page = ref(1)
const pageSize = 30
const loading = ref(false)
const noResults = ref(false)
const hasMore = ref(true)

// Responsive columns
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

const debouncedSearch = debounce(async () => {
  page.value = 1
  await loadGifs(true)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}, 500)
watch(search, debouncedSearch)

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

.gradient-title {
  text-decoration: none;
}
.gradient-title h2 {
  background: linear-gradient(90deg, #ff8a00, #e52e71);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
  font-size: 32px;
}
.gradient-title:hover {
  opacity: 0.8;
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
