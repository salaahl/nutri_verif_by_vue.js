<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentRoute = computed(() => {
  return router.currentRoute.value.path
})

onMounted(() => {
  document.querySelector('main').style.minHeight = 'calc(100vh - ' + document.querySelector('header').offsetHeight + 'px)'
})
</script>

<template>
  <header>
    <div v-if="currentRoute !== '/'" id="back-link" class="flex items-center mb-4">
      <a @click="$router.back()" class="flex"><svg class="h-[20px]" xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512">
          <path
            d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
        </svg>
      </a>
    </div>
    <a href="/" class="block w-fit mx-auto">
      <img alt="Logo du site" id="logo" class="m-auto" src="./assets/logo.png" width="125" height="125" />
      <div class="wrapper">
        <h1 class="text-2xl">Nutri<span class="text-green">Vérif</span></h1>
      </div>
    </a>
  </header>

  <main class="content-center">
    <router-view v-slot="{ Component, route }">
      <transition :name="route.meta.transition || 'slide-fade'">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>

  <footer class="w-full py-4">
    <div class="max-w-screen-xl mx-auto py-6 rounded-lg space-y-4 overflow-hidden bg-gray-50">
      <nav class="flex flex-wrap justify-center -mx-5 -my-2">
        <div class="px-2 md:px-6">
          <RouterLink :to="'/about-me'" class="text-base leading-6 text-gray-500 hover:text-gray-900">
            À propos de nous
          </RouterLink>
        </div>
        <div class="px-2 md:px-6">
          <RouterLink :to="'/legal-notice'" class="text-base leading-6 text-gray-500 hover:text-gray-900">
            Mentions légales
          </RouterLink>
        </div>
      </nav>
      <p class="text-sm leading-6 text-center text-gray-400">
        <a href="https://www.linkedin.com/in/salaha-sokhona/" target="_blank">© 2024 Salaha SOKHONA. Tous droits
          réservés.</a>
      </p>
    </div>
  </footer>
</template>

<style>
.slide-fade-enter-active {
  transition: all 0.6s ease-in;
}

.slide-fade-leave-active {
  position: absolute;
  transition: all 0.25s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

header,
main {
  position: relative;
  width: 100%;
}

header {
  height: fit-content;
  padding: 10px var(--app-padding-x);
  background-color: white;
}

#logo {
  height: 50px;
  width: auto;
}

#back-link {
  position: absolute;
  bottom: 50%;
  top: 50%;
  left: 0%;
}

header h1 {
  width: fit-content;
  margin: 10px auto;
  font-family: 'Grand Hotel', cursive;
  font-weight: 400;
  font-style: normal;
}

@media (min-width: 768px) {
  header {
    padding: 20px var(--app-padding-x);
  }

  #logo {
    height: 80px;
  }
}
</style>
