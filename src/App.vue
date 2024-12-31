<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentRoute = computed(() => {
  return router.currentRoute.value.path
})
</script>

<template>
  <header class="h-[172px]">
    <div v-if="currentRoute !== '/'" id="back-link" class="flex items-center mb-4 cursor-pointer">
      <a @click="$router.back()" class="flex">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path
            d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"
          />
        </svg>
      </a>
    </div>
    <a href="/" class="block w-fit mx-auto">
      <img alt="Logo du site" id="logo" class="m-auto" src="/logo.png" width="125" height="125" />
      <div class="wrapper">
        <span id="website-name" class="text-2xl">Nutri<span class="text-green">Vérif</span></span>
      </div>
    </a>
  </header>

  <main class="content-center">
    <router-view v-slot="{ Component, route }">
      <transition :name="route.meta.transition || 'slide-fade'">
        <div :key="route.name" class="min-h-[calc(100vh-272px)] flex flex-col justify-center">
          <component :is="Component" />
        </div>
      </transition>
    </router-view>
  </main>

  <footer class="md:h-[100px] w-full">
    <div
      class="flex flex-wrap justify-center items-center max-w-screen-xl mx-auto py-4 rounded-lg overflow-hidden"
    >
      <nav class="flex flex-wrap justify-center">
        <div class="px-2 md:px-6">
          <RouterLink
            :to="'/about-me'"
            class="text-base leading-6 text-gray-500 hover:text-gray-900"
          >
            À propos de nous
          </RouterLink>
        </div>
        <div class="px-2 md:px-6">
          <RouterLink
            :to="'/legal-notice'"
            class="text-base leading-6 text-gray-500 hover:text-gray-900"
          >
            Mentions légales
          </RouterLink>
        </div>
      </nav>
      <div class="px-2 md:px-6 text-sm leading-6 text-center text-gray-500 hover:text-gray-900">
        <a href="https://www.linkedin.com/in/salaha-sokhona/" target="_blank"
          >© 2024 Salaha Sokhona. Tous droits réservés.</a
        >
      </div>
    </div>
  </footer>
</template>

<style>
.slide-fade-enter-active {
  transition: all 0.6s ease-in;
}

.slide-fade-leave-active {
  position: absolute;
  transition: all var(--transition-delay) ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

header {
  height: fit-content;
  padding: 20px var(--app-padding-x);
}

header,
main {
  position: relative;
  width: 100%;
}

#website-name {
  width: fit-content;
  margin: 10px auto;
  font-family: 'Grand Hotel', cursive;
  font-weight: 400;
  font-style: normal;
  transition: opacity 0.5s;
}

#logo {
  height: 80px;
  width: auto;
}

#back-link {
  position: absolute;
  bottom: 50%;
  top: 50%;
  left: 0%;
  transition: transform 0.25s ease-in-out;
}

#back-link svg {
  height: 40px;
  padding: 10px;
  border-radius: 999px;
}

footer > div,
#back-link svg {
  backdrop-filter: contrast(0.95);
}

@media (min-width: 768px) {
  #back-link:hover {
    transform: translateX(-10px);
  }

  footer > div {
    box-shadow:
      rgba(255, 255, 255, 0.1) 0px 1px 1px 0px inset,
      rgba(50, 50, 93, 0.25) 0px 50px 100px -20px,
      rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;
  }
}
</style>
