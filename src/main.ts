import { createApp } from 'vue'
import App from './App.vue'
import { isPageLoading } from '@/utils/loading.ts'
import { registerPlugins } from '@/plugins'
import { registerSW } from 'virtual:pwa-register'
import router from '@/router'

registerSW({ immediate: true })

const app = createApp(App)

router.beforeEach((to, from, next) => {
  isPageLoading.value = true
  next()
})

router.afterEach(() => {
  setTimeout(() => {
    isPageLoading.value = false
  }, 300)
})

registerPlugins(app)
app.use(router)
app.mount('#app')
