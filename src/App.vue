<template>
  <v-app>
    <v-overlay absolute :value="isPageLoading" z-index="9999">
      <v-progress-circular indeterminate size="64" width="6" />
    </v-overlay>

    <v-main>
      <router-view v-show="!isPageLoading" />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { isPageLoading } from '@/utils/loading.ts'
</script>
