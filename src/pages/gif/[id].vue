<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <div class="d-flex align-center mt-4 mb-2">
          <v-btn icon @click="router.push('/')">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h2 class="ml-3 mb-0">{{ gif?.title }}</h2>
        </div>

        <div class="gif-wrapper" v-if="gif">
          <v-img
            :src="gif.images.original.url"
            :alt="gif.title"
            max-height="400"
            class="mb-4"
          />
          <ShareButton :gif="{ id: gif.id, title: gif.title }" />
        </div>
        <p v-else>Загрузка...</p>

        <p v-if="gif?.user?.username">
          Автор:
          <router-link
            :to="`/author/${gif.id}`"
            @click="handleAuthorClick"
          >
            {{ gif.user.display_name || gif.user.username }}
          </router-link>
        </p>
      </v-col>
    </v-row>

    <v-row class="mt-8">
      <v-col cols="12">
        <h3 class="mb-4">Случайные гифки</h3>
        <v-slide-group show-arrows class="random-slider">
          <v-slide-group-item
            v-for="item in randomGifs"
            :key="item.id"
          >
            <div
              @click="goToGif(item.id)"
              class="mx-2"
              style="width: 200px; cursor: pointer;"
            >
              <v-img
                :src="item.images.fixed_width.url"
                :alt="item.title"
                width="200"
                height="150"
                class="rounded uniform-gif"
              />
            </div>
          </v-slide-group-item>
        </v-slide-group>
      </v-col>
    </v-row>
  </v-container>
</template>

<<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getGifById, getRandomGif } from '@/api/gif'
import ShareButton from '@/components/ShareButton.vue'

interface Gif {
  id: string
  title: string
  images: {
    fixed_width: { url: string }
    original: { url: string }
  }
  user?: {
    username: string
    display_name?: string
    avatar_url?: string
    profile_url?: string
  }
}

interface RouteParams {
  id: string
}

const route = useRoute()
const router = useRouter()
const gif = ref<Gif | null>(null)
const randomGifs = ref<Gif[]>([])

async function fetchGif() {
  const id = (route.params as RouteParams).id
  gif.value = await getGifById(id)
}

async function fetchRandomGifs() {
  const promises = Array.from({ length: 20 }, () => getRandomGif())
  randomGifs.value = await Promise.all(promises)
}

function handleAuthorClick() {
  if (gif.value?.id) {
    localStorage.setItem('lastGifId', gif.value.id)
  }
}

function goToGif(id: string) {
  router.push(`/gif/${id}`)
}

onMounted(async () => {
  await fetchGif()
  await fetchRandomGifs()
})

watch(
  () => (route.params as RouteParams).id,
  async () => {
    await fetchGif()
    await fetchRandomGifs()
  }
)
</script>

<style scoped>
.gif-wrapper {
  position: relative;
}

.random-slider {
  overflow-x: auto;
  padding-bottom: 10px;
}

.uniform-gif {
  object-fit: cover;
}

@media (max-width: 600px) {
  .random-slider .v-slide-group__prev,
  .random-slider .v-slide-group__next {
    display: none !important;
  }
}
</style>
