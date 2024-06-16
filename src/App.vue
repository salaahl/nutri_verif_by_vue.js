<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const currentRoute = computed(() => {
  return router.currentRoute.value.path
})

onMounted(() => {
  if (currentRoute.value == '/') {
    // Rétracte la barre de navigation
    var prevScrollpos = window.scrollY

    window.onscroll = function () {
      var currentScrollPos = window.scrollY
      const headerHeight = document.querySelector('header').offsetHeight

      if (prevScrollpos > currentScrollPos) {
        document.querySelector('header').style.top = '0'
        document.querySelector('header').classList.add('border-b-4')
      } else {
        document.querySelector('header').style.top = '-' + (headerHeight + 4) + 'px'
      }

      if (currentScrollPos < 20) {
        document.querySelector('header').classList.remove('border-b-4')
      }
      prevScrollpos = currentScrollPos
    }
  }
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
    <a href="/">
      <img alt="Logo du site" id="logo" class="m-auto" src="./assets/logo.png" width="125" height="125" />
      <div class="wrapper">
        <h1 class="text-2xl">NutriVérif</h1>
      </div>
    </a>
    <div v-if="currentRoute == '/'" id="search-bar" class="relative mt-12">
      <form class="flex items-center">
        <label for="search-input" class="sr-only">Search</label>
        <div class="relative w-full">
          <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg id="search-bar-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path
                d="M416 0C400 0 288 32 288 176V288c0 35.3 28.7 64 64 64h32V480c0 17.7 14.3 32 32 32s32-14.3 32-32V352 240 32c0-17.7-14.3-32-32-32zM64 16C64 7.8 57.9 1 49.7 .1S34.2 4.6 32.4 12.5L2.1 148.8C.7 155.1 0 161.5 0 167.9c0 45.9 35.1 83.6 80 87.7V480c0 17.7 14.3 32 32 32s32-14.3 32-32V255.6c44.9-4.1 80-41.8 80-87.7c0-6.4-.7-12.8-2.1-19.1L191.6 12.5c-1.8-8-9.3-13.3-17.4-12.4S160 7.8 160 16V150.2c0 5.4-4.4 9.8-9.8 9.8c-5.1 0-9.3-3.9-9.8-9L127.9 14.6C127.2 6.3 120.3 0 112 0s-15.2 6.3-15.9 14.6L83.7 151c-.5 5.1-4.7 9-9.8 9c-5.4 0-9.8-4.4-9.8-9.8V16zm48.3 152l-.3 0-.3 0 .3-.7 .3 .7z" />
            </svg>
          </div>
          <input type="text" id="search-input"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5"
            placeholder="Nom du produit, la marque ou une catégorie" required />
        </div>
        <button type="submit"
          class="p-2.5 ms-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300">
          <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
          </svg>
          <span class="sr-only">Search</span>
        </button>
      </form>
    </div>
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
  position: sticky;
  height: fit-content;
  width: 100vw;
  padding: 10px var(--app-padding-x);
  background-color: white;
  z-index: 99;
  transition: top 0.5s;
}

#search-bar {
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
}

#search-bar-icon {
  height: auto;
  width: 0.875rem;
  filter: contrast(0.5);
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
  margin-top: 10px;
  margin-left: auto;
  margin-right: auto;
  font-family: 'Grand Hotel', cursive;
  font-weight: 400;
  font-style: normal;
}

main {
  width: 100%;
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
