<template>
  <v-container class="main-container" fluid>
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
      <transition-group
        :name="transitionName"
        tag="div"
        class="gif-grid"
      >
        <GifCard
          v-for="(gif, i) in gifs"
          :key="gif.id"
          :gif="gif"
          :index="i"
        />
      </transition-group>
    </div>

    <div v-if="loading && !noResults" class="loading">Загрузка...</div>

    <v-row
      justify="center"
      class="my-8 pagination-wrapper"
      v-if="!noResults && totalPages > 1"
    >
      <v-pagination
        v-model="page"
        :length="totalPages"
        @input="resetAndFetch"
        :total-visible="isMobile ? 3 : 7"
      />
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { getTrendingGifs, searchGifs } from '@/api/gif.ts'
import { debounce } from '@/utils/debounce.ts'
import GifCard from '@/components/GifCard.vue'

const search = ref('')
const gifs = ref<any[]>([])
const fallbackGif = ref<any | null>(null)
const page = ref(1)
const pageSize = 30
const loading = ref(false)
const noResults = ref(false)
const totalPages = ref(1)
const isMobile = ref(false)

const transitionName = computed(() =>
  search.value.trim() ? 'fade-scale' : 'slide-down'
)

const fetchGifs = async () => {
  loading.value = true

  const results = search.value
    ? await searchGifs(search.value, pageSize, page.value)
    : await getTrendingGifs(pageSize, page.value)

  gifs.value = results
  noResults.value = results.length === 0
  loading.value = false

  if (noResults.value) {
    await fetchFallbackGif()
  }

  totalPages.value =
    results.length < pageSize && page.value > 1
      ? page.value
      : 50
}

const resetAndFetch = async () => {
  await fetchGifs()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const fetchFallbackGif = async () => {
  const results = await searchGifs('not found', 10, 1)
  const randomIndex = Math.floor(Math.random() * results.length)
  fallbackGif.value = results[randomIndex]
}

const debouncedSearch = debounce(async () => {
  page.value = 1
  await resetAndFetch()
}, 500)

watch(search, () => debouncedSearch())
watch(page, () => resetAndFetch())

onMounted(() => {
  fetchGifs()
  isMobile.value = window.innerWidth <= 600
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth <= 600
  })
})
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
  column-count: 4;
  column-gap: 16px;
}
@media (max-width: 1200px) {
  .gif-masonry {
    column-count: 3;
  }
}
@media (max-width: 900px) {
  .gif-masonry {
    column-count: 2;
  }
}
@media (max-width: 600px) {
  .gif-masonry {
    column-count: 1;
  }
}

.gif-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: transform 0.4s ease, opacity 0.4s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
.fade-scale-enter-to,
.fade-scale-leave-from {
  opacity: 1;
  transform: scale(1);
}

.loading {
  text-align: center;
  padding: 20px;
  font-size: 18px;
  color: #888;
}

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
