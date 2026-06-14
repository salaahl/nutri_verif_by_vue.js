<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProducts } from '@/composables/useProducts'

const router = useRouter()
// Déclenchement de l'animation des blobs
router.afterEach(() => {
  document.querySelectorAll('#background-blobs g').forEach((el) => {
    el.style.animation = 'none'
    el.getBoundingClientRect()
    el.style.animation = ''
  })
})

const { input, products } = useProducts()

function handleBack() {
  if (router.currentRoute.value.path === '/search') {
    input.value = ''
    products.value = []
  }
  router.back()
}

onMounted(() => {
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    fetch('https://jokes-api-platform.onrender.com/')
      .then((res) => {
        if (res.status === 204) {
          document.getElementById('loader').classList.add('hide')
        }
      })
      .catch(() => {
        setTimeout(() => {
          document.getElementById('loader').classList.add('hide')
        }, 10000)
        console.log('Le serveur dort encore, réveil (toujours) en cours...')
      })
  } else {
    document.getElementById('loader').classList.add('hide')
  }
})
</script>

<template>
  <div id="loader" class="z-50 fixed inset-0 flex items-center justify-center bg-zinc-950">
    <div class="wrapper">
      <span class="website-name text-6xl font-bold tracking-wide select-none text-white">
        <span class="animate-letter inline-block" style="animation-delay: 0s">N</span>
        <span class="animate-letter inline-block" style="animation-delay: 0.1s">u</span>
        <span class="animate-letter inline-block" style="animation-delay: 0.2s">t</span>
        <span class="animate-letter inline-block" style="animation-delay: 0.3s">r</span>
        <span class="animate-letter inline-block" style="animation-delay: 0.4s">i</span>
        <span class="animate-letter inline-block" style="animation-delay: 0.5s">V</span>
        <span class="animate-letter inline-block" style="animation-delay: 0.6s">é</span>
        <span class="animate-letter inline-block" style="animation-delay: 0.7s">r</span>
        <span class="animate-letter inline-block" style="animation-delay: 0.8s">i</span>
        <span class="animate-letter inline-block" style="animation-delay: 0.9s">f</span>
      </span>
    </div>
  </div>
  <div
    :class="`${router.currentRoute.value.name}-view bg absolute inset-0 w-full h-full min-h-screen overflow-hidden -z-10 bg-[#ffffff]`"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 900"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      class="w-full h-full"
    >
      <rect class="bg-base" width="100%" height="100%" />

      <g id="background-blobs" transform="scale(1.6, 1.5)">
        <g transform="translate(900, 0)">
          <path
            d="M0 486.7C-52.4 455.1 -104.8 423.5 -168 405.6C-231.2 387.6 -305.1 383.3 -344.2 344.2C-383.3 305.1 -387.6 231.2 -405.6 168C-423.5 104.8 -455.1 52.4 -486.7 0L0 0Z"
          />
        </g>
        <g transform="translate(925, -25)">
          <path
            d="M0 486.7C-52.4 455.1 -104.8 423.5 -168 405.6C-231.2 387.6 -305.1 383.3 -344.2 344.2C-383.3 305.1 -387.6 231.2 -405.6 168C-423.5 104.8 -455.1 52.4 -486.7 0L0 0Z"
          />
        </g>
        <g transform="translate(950, -50)">
          <path
            d="M0 486.7C-52.4 455.1 -104.8 423.5 -168 405.6C-231.2 387.6 -305.1 383.3 -344.2 344.2C-383.3 305.1 -387.6 231.2 -405.6 168C-423.5 104.8 -455.1 52.4 -486.7 0L0 0Z"
          />
        </g>
        <g transform="translate(0, 600)">
          <path
            d="M0 -486.7C58.5 -454.5 116.9 -422.2 160.3 -387.1C203.8 -352 232.2 -314.2 284.3 -284.3C336.3 -254.3 412 -232.3 449.7 -186.3C487.4 -140.2 487.1 -70.1 486.7 0L0 0Z"
          />
        </g>
        <g transform="translate(-25, 625)">
          <path
            d="M0 -486.7C58.5 -454.5 116.9 -422.2 160.3 -387.1C203.8 -352 232.2 -314.2 284.3 -284.3C336.3 -254.3 412 -232.3 449.7 -186.3C487.4 -140.2 487.1 -70.1 486.7 0L0 0Z"
          />
        </g>
        <g transform="translate(-50, 650)">
          <path
            d="M0 -486.7C58.5 -454.5 116.9 -422.2 160.3 -387.1C203.8 -352 232.2 -314.2 284.3 -284.3C336.3 -254.3 412 -232.3 449.7 -186.3C487.4 -140.2 487.1 -70.1 486.7 0L0 0Z"
          />
        </g>
      </g>

      <g id="decorations-left" class="decorations" transform="translate(40, 500)">
        <g class="plant-primary" transform="rotate(-20) scale(1.4)">
          <path d="M38.5,0 L41.5,0 L41.5,240 L38.5,240 Z" />
          <path d="M40,0 C35,-15 35,-30 40,-45 C45,-30 45,-15 40,0 Z" />
          <path d="M38,15 C20,10 10,-5 25,-15 C35,-5 37,5 38,15 Z" />
          <path d="M42,15 C60,10 70,-5 55,-15 C45,-5 43,5 42,15 Z" />
          <path d="M38,45 C20,40 10,25 25,15 C35,25 37,35 38,45 Z" />
          <path d="M42,45 C60,40 70,25 55,15 C45,25 43,35 42,45 Z" />
          <path d="M38,75 C20,70 10,55 25,45 C35,55 37,65 38,75 Z" />
          <path d="M42,75 C60,70 70,55 55,45 C45,55 43,65 42,75 Z" />
          <path d="M38,105 C20,100 10,85 25,75 C35,85 37,95 38,105 Z" />
          <path d="M42,105 C60,100 70,85 55,75 C45,85 43,95 42,105 Z" />
          <path d="M38,135 C20,130 10,115 25,105 C35,115 37,125 38,135 Z" />
          <path d="M42,135 C60,130 70,115 55,105 C45,115 43,125 42,135 Z" />
          <path d="M38,165 C20,160 10,145 25,135 C35,145 37,155 38,165 Z" />
          <path d="M42,165 C60,160 70,145 55,135 C45,145 43,155 42,165 Z" />
        </g>
        <g class="plant-secondary" transform="translate(70, 60) rotate(-40) scale(1)">
          <path d="M38.5,0 L41.5,0 L41.5,200 L38.5,200 Z" />
          <path d="M40,0 C35,-15 35,-30 40,-45 C45,-30 45,-15 40,0 Z" />
          <path d="M38,15 C20,10 10,-5 25,-15 Z" />
          <path d="M42,15 C60,10 70,-5 55,-15 Z" />
          <path d="M38,45 C20,40 10,25 25,15 Z" />
          <path d="M42,45 C60,40 70,25 55,15 Z" />
          <path d="M38,75 C20,70 10,55 25,45 Z" />
          <path d="M42,75 C60,70 70,55 55,45 Z" />
          <path d="M38,105 C20,100 10,85 25,75 Z" />
          <path d="M42,105 C60,100 70,85 55,75 Z" />
        </g>
      </g>

      <g id="decorations-right" class="decorations" transform="translate(1360, 60)">
        <g class="plant-primary" transform="rotate(60) scale(1.4)">
          <path d="M38.5,0 L41.5,0 L41.5,240 L38.5,240 Z" />
          <path d="M40,0 C36,-10 36,-20 40,-30 C44,-20 44,-10 40,0 Z" />
          <path d="M38,15 C25,10 15,-5 25,-15 C35,-5 37,5 38,15 Z" />
          <path d="M42,15 C60,10 70,-5 55,-15 C45,-5 43,5 42,15 Z" />
          <path d="M38,45 C25,40 15,25 25,15 C35,25 37,35 38,45 Z" />
          <path d="M42,45 C60,40 70,25 55,15 C45,25 43,35 42,45 Z" />
          <path d="M38,75 C25,70 15,55 25,45 C35,55 37,65 38,75 Z" />
          <path d="M42,75 C60,70 70,55 55,45 C45,55 43,65 42,75 Z" />
          <path d="M38,105 C25,100 15,85 25,75 C35,85 37,95 38,105 Z" />
          <path d="M42,105 C60,100 70,85 55,75 C45,85 43,95 42,105 Z" />
          <path d="M38,135 C25,130 15,115 25,105 C35,115 37,125 38,135 Z" />
          <path d="M42,135 C60,130 70,115 55,105 C45,115 43,125 42,135 Z" />
          <path d="M38,165 C25,160 15,145 25,135 C35,145 37,155 38,165 Z" />
          <path d="M42,165 C60,160 70,145 55,135 C45,145 43,155 42,165 Z" />
          <path d="M38,195 C25,190 15,175 25,165 C35,175 37,185 38,195 Z" />
          <path d="M42,195 C60,190 70,175 55,165 C45,175 43,185 42,195 Z" />
        </g>
        <g class="plant-secondary" transform="translate(-70, 60) rotate(80) scale(1)">
          <path d="M38.5,0 L41.5,0 L41.5,200 L38.5,200 Z" />
          <path d="M40,0 C36,-10 36,-20 40,-30 C44,-20 44,-10 40,0 Z" />
          <path d="M38,15 C25,10 15,-5 25,-15 Z" />
          <path d="M42,15 C60,10 70,-5 55,-15 Z" />
          <path d="M38,45 C25,40 15,25 25,15 Z" />
          <path d="M42,45 C60,40 70,25 55,15 Z" />
          <path d="M38,75 C25,70 15,55 25,45 Z" />
          <path d="M42,75 C60,70 70,55 55,45 Z" />
          <path d="M38,105 C25,100 15,85 25,75 Z" />
          <path d="M42,105 C60,100 70,85 55,75 Z" />
        </g>
      </g>
    </svg>
  </div>

  <header class="h-[172px]">
    <div
      v-if="router.currentRoute.value.path !== '/'"
      id="back-link"
      class="flex items-center mb-4 cursor-pointer"
    >
      <a @click="handleBack" class="flex">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path
            d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"
          />
        </svg>
      </a>
    </div>
    <a href="/" class="block w-fit mx-auto">
      <img alt="Logo du site" id="logo" class="m-auto" src="/logo.png" width="125" height="125" />
    </a>
  </header>

  <main :class="`${router.currentRoute.value.name}-view content-center`">
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
      class="flex flex-wrap justify-center items-center max-w-screen-xl mx-auto my-4 py-4 rounded-lg overflow-hidden"
    >
      <nav class="flex flex-wrap justify-center">
        <div class="px-2 md:px-6">
          <RouterLink :to="'/about'" class="text-base leading-6 text-gray-500 hover:text-gray-900">
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
          >© 2026 Salaha Sokhona. Tous droits réservés.</a
        >
      </div>
    </div>
  </footer>
</template>

<style>
#app {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--app-padding-x);
  font-weight: normal;
}

.slide-fade-enter-active {
  transition: all 0.45s ease-in;
}

.slide-fade-enter-from {
  transform: translateX(20px);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}

#loader {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  opacity: 1;
  pointer-events: auto;
  transition: opacity 0.5s ease-in-out;
}

#loader.hide {
  opacity: 0;
  pointer-events: none;
}

#loader .animate-letter {
  animation: waveEffect 2s ease-in-out infinite;
}

#loader.hide .animate-letter {
  animation: none !important;
}

.website-name {
  font-family: 'Grand Hotel', cursive;
  font-weight: 400;
  font-style: normal;
  transition: opacity 0.15s;
}

/* Fond de page */
.bg {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
}

.bg > svg {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
}

.bg-base {
  fill: white;
}

#background-blobs > g {
  transition: fill 0.5s 0.5s;
  animation: translateBlobs 2s cubic-bezier(0.4, 0, 0.2, 1);
}

#background-blobs > g:nth-child(2),
#background-blobs > g:nth-child(5) {
  animation-delay: 0.2s;
}

#background-blobs > g:nth-child(3),
#background-blobs > g:nth-child(6) {
  animation-delay: 0.3s;
}

#background-blobs > g:nth-child(4),
#background-blobs > g:nth-child(5),
#background-blobs > g:nth-child(6) {
  --blob-direction: -1;
}

/* Couleurs par défaut */
#background-blobs > g:nth-child(1),
#background-blobs > g:nth-child(4) {
  fill: hsla(160, 100%, 37%, 0.25);
}

#background-blobs > g:nth-child(2),
#background-blobs > g:nth-child(5) {
  fill: hsla(160, 100%, 37%, 0.5);
}

#background-blobs > g:nth-child(3),
#background-blobs > g:nth-child(6) {
  fill: hsla(160, 100%, 37%, 1);
}

/* Couleurs personnalisées  */
.about-view > svg > #background-blobs > g:nth-child(1),
.scanner-view > svg > #background-blobs > g:nth-child(1),
.legal-notice-view > svg > #background-blobs > g:nth-child(1),
.search-view > svg > #background-blobs > g:nth-child(1),
.about-view > svg > #background-blobs > g:nth-child(4),
.scanner-view > svg > #background-blobs > g:nth-child(4),
.legal-notice-view > svg > #background-blobs > g:nth-child(4),
.search-view > svg > #background-blobs > g:nth-child(4) {
  fill: rgb(245, 245, 245, 0.33);
}

.about-view > svg > #background-blobs > g:nth-child(2),
.scanner-view > svg > #background-blobs > g:nth-child(2),
.legal-notice-view > svg > #background-blobs > g:nth-child(2),
.search-view > svg > #background-blobs > g:nth-child(2),
.about-view > svg > #background-blobs > g:nth-child(5),
.scanner-view > svg > #background-blobs > g:nth-child(5),
.legal-notice-view > svg > #background-blobs > g:nth-child(5),
.search-view > svg > #background-blobs > g:nth-child(5) {
  fill: rgb(245, 245, 245, 0.66);
}

.about-view > svg > #background-blobs > g:nth-child(3),
.scanner-view > svg > #background-blobs > g:nth-child(3),
.legal-notice-view > svg > #background-blobs > g:nth-child(3),
.search-view > svg > #background-blobs > g:nth-child(3),
.about-view > svg > #background-blobs > g:nth-child(6),
.scanner-view > svg > #background-blobs > g:nth-child(6),
.legal-notice-view > svg > #background-blobs > g:nth-child(6),
.search-view > svg > #background-blobs > g:nth-child(6),
.product-view > svg > #background-blobs > g {
  fill: rgb(245, 245, 245);
}

.product-view > svg > .bg-base {
  fill: whitesmoke;
}

.bg .bg-base,
.bg .plant-primary,
.bg .plant-secondary {
  transition: all 0.5s;
}

.bg .plant-primary,
.bg .plant-secondary {
  fill-opacity: 0.08;
}

.product-view > svg > .decorations > .plant-primary,
.product-view > svg > .decorations > .plant-secondary {
  fill-opacity: 0.04;
}

.bg .plant-primary {
  fill: #2e5a44;
}

.bg .plant-secondary {
  fill: #4a7c59;
}

header {
  padding: 20px var(--app-padding-x);
}

header > a::before {
  content: '';
  position: absolute;
  top: -25px;
  left: 0;
  height: 100%;
  width: 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 600' width='900' height='600'%3E%3Cg transform='translate(416.34369726421266 281.01462663501235)'%3E%3Cpath d='M149 -145.8C185.3 -112.7 201.7 -56.3 208.9 7.2C216 70.7 214.1 141.4 177.8 180.8C141.4 220.1 70.7 228 11.7 216.4C-47.4 204.7 -94.8 173.4 -119.8 134.1C-144.8 94.8 -147.4 47.4 -143.3 4.1C-139.1 -39.1 -128.3 -78.3 -103.3 -111.4C-78.3 -144.6 -39.1 -171.8 8.6 -180.4C56.3 -189 112.7 -179 149 -145.8' fill='%2300BD7E'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 100% 140%;
  background-repeat: no-repeat;
  background-position: center;
  z-index: 0;
  pointer-events: none;
}

header,
main {
  position: relative;
  width: 100%;
}

h1::first-letter {
  font-weight: bold;
}

.radio-toolbar input[type='radio'] {
  display: none;
}

.radio-toolbar label {
  height: auto;
  padding: 8px 14px;
  color: white;
  transition: background-color 0.25s;
}

.radio-toolbar label:hover {
  background-color: var(--color-green);
}

.radio-toolbar input[type='radio']:checked + label {
  background-color: var(--color-green);
}

#logo {
  height: 80px;
  width: auto;
  filter: invert(1);
}

#back-link {
  position: absolute;
  bottom: 50%;
  top: 50%;
  left: 0%;
  transition: transform 0.25s ease-in-out;
}

#back-link svg {
  height: 50px;
  padding: 15px;
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

  main.home-view {
    padding: 0 50px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.5) 50%, rgba(0, 0, 0, 0) 100%);
    border-radius: 20px;
  }

  main.home-view::before,
  main.home-view::after {
    content: '';
    position: absolute;
    width: 150px;
    height: 150px;
    border-color: indianred;
    border-style: solid;
  }

  main.home-view::before {
    top: 0;
    left: 0;
    border-radius: 20px 0 0 0;
    border-width: 4px 0 0 4px;
  }

  main.home-view::after {
    bottom: 0;
    right: 0;
    border-radius: 0 0 20px 0;
    border-width: 0 4px 4px 0;
  }
}

@keyframes waveEffect {
  0%,
  100% {
    transform: translateY(0);
    color: #ffffff;
  }
  20% {
    transform: translateY(-12px);
    color: #00bd7e;
  }
  40% {
    transform: translateY(0);
    color: #ffffff;
  }
}

@keyframes translateBlobs {
  0% {
    translate: 0%;
  }
  50% {
    translate: calc(var(--blob-direction, 1) * 100%);
  }
  100% {
    translate: 0%;
  }
}
</style>
