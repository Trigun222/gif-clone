<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getUserProfileByUsername } from '@/api/gif'
import router from "@/router";

const route = useRoute()
const username = ref('')
const displayName = ref('')
const avatarUrl = ref('')
const profileUrl = ref('')
const lastGifId = localStorage.getItem('lastGifId') ?? ''

const goBackToGif = () => {
  if (lastGifId) {
    router.push(`/gif/${lastGifId}`)
  } else {
    router.push('/')
  }
}

onMounted(async () => {
  const { username: routeUsername } = route.params as any
  username.value = routeUsername as string

  const user = await getUserProfileByUsername(username.value)
  if (user) {
    displayName.value = user.display_name || user.username
    avatarUrl.value = user.avatar_url
    profileUrl.value = user.profile_url
  }
})
</script>

<template>
  <v-container class="mt-8">
    <v-row class="align-center ma-0 pa-0" style="min-height: 80px; max-height: 100px;">
      <v-col cols="auto">
        <v-btn icon @click="goBackToGif">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>

      <v-col cols="auto">
        <router-link to="/" class="gradient-title">
          <h2>Gif</h2>
        </router-link>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <h3>{{ username }}</h3>
        <v-avatar size="100" class="mb-4" v-if="avatarUrl">
          <v-img :src="avatarUrl" />
        </v-avatar>

        <div>
          <a :href="profileUrl" target="_blank" rel="noopener" class="giphy-link">
            Перейти на профиль Giphy →
          </a>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>



<style scoped>
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

.giphy-link {
  font-weight: 500;
  color: #5b5bff;
  text-decoration: underline;
}
</style>

