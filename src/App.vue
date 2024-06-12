<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const currentRoute = computed(() => {
  return router.currentRoute.value.path
})

onMounted(() => {
  // Ajuste la largeur du header en le rendant responsive
  document.querySelector('header').style.marginLeft =
    '-' + document.querySelector('main').offsetLeft + 'px'
  document.querySelector('header').style.padding =
    '20px ' + document.querySelector('main').offsetLeft + 'px'

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
      <a @click="$router.back()" class="flex"
        ><svg class="h-[20px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path
            d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"
          />
        </svg>
      </a>
    </div>
    <a href="/">
      <img
        alt="Logo du site"
        id="logo"
        class="m-auto"
        src="./assets/logo.png"
        width="125"
        height="125"
      />
      <div class="wrapper">
        <h1 class="text-2xl">MangerSain</h1>
      </div>
    </a>
    <div v-if="currentRoute == '/'" id="search-bar" class="relative mt-12">
      <form class="flex items-center">
        <label for="search-input" class="sr-only">Search</label>
        <div class="relative w-full">
          <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              class="w-4 h-4 text-gray-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 18 20"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V6a3 3 0 0 0-3-3H9m1.5-2-2 2 2 2"
              />
            </svg>
          </div>
          <input
            type="text"
            id="search-input"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5"
            placeholder="Rechercher selon le nom du produit, la marque ou une catégorie"
            required
          />
        </div>
        <button
          type="submit"
          class="p-2.5 ms-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300"
        >
          <svg
            class="w-4 h-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
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

@media (min-width: 768px) {
  header {
    padding: 20px var(--app-padding-x);
  }

  #logo {
    height: 80px;
  }
}
</style>
