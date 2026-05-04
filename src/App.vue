<template>
  <div id="ferremas-app">
    <NavBar v-if="showNav" />
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '@/components/NavBar.vue'

const route = useRoute()
// Ocultar navbar solo en login
const showNav = computed(() => route.name !== 'Login')
</script>

<style scoped>
#ferremas-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
