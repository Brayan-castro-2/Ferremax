<template>
  <div id="ferremas-app" class="min-h-screen bg-surface text-on-surface">
    <NavBar v-if="showNav" />
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <AppFooter v-if="showFooter" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

const route = useRoute()

const MINIMAL_CHROME = new Set(['Login', 'Register', 'ForgotPassword', 'ResetPassword'])
const HIDE_FOOTER = new Set([
  'Login', 'Register', 'ForgotPassword', 'ResetPassword',
  'Admin', 'Vendedor', 'Bodeguero', 'Contador', 'Dashboard'
])

const showNav = computed(() => !MINIMAL_CHROME.has(route.name))
const showFooter = computed(() => !HIDE_FOOTER.has(route.name))
</script>

<style scoped>
#ferremas-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
