<script setup lang="ts">
import { useRouter } from 'vue-router';
import { reactive } from 'vue'

const router = useRouter()
let homepage = reactive([])

homepage.push(router.currentRoute.value.path);
</script>

<template>
  <header>
    <div v-if="homepage !== '/'" class="flex items-center mb-4">
      <RouterLink :to="'/'" class="flex"
        ><svg class="h-[20px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path
            d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"
          />
        </svg>
        <span class="ml-2">Page d'accueil</span></RouterLink
      >
    </div>
    <RouterLink to="/">
      <img alt="Vue logo" class="logo m-auto" src="./assets/logo.svg" width="125" height="125" />
      <div class="wrapper">
        <h1 class="text-2xl">MyOpenFoodFacts</h1>
      </div>
    </RouterLink>
  </header>

  <main>
    <router-view v-slot="{ Component, route }">
      <transition :name="route.meta.transition || 'slide-fade'">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>
</template>

<style>
.slide-fade-enter-active {
  transition: all 0.6s ease-in;
}

.slide-fade-leave-active {
  position: absolute;
  transition: all 0.2s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

header {
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
  font-family: 'Sacramento', cursive;
  font-weight: 400;
  font-style: normal;
}
</style>
