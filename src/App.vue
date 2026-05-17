<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentRoute = computed(() => {
  return router.currentRoute.value.path
})
</script>

<template>
  <div class="bg">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" width="100%" height="100%">
      <g id="decorations-left" transform="translate(40, 500)">
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

      <g id="decorations-right" transform="translate(1360, 60)">
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
        <span id="website-name" class="relative text-2xl"
          >Nutri<span class="text-white">Vérif</span></span
        >
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
/* Fond de page */
.bg {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
}

.bg .bg-main {
  fill: whitesmoke;
}

.bg .card-bg {
  fill: #ffffff;
  filter: drop-shadow(0px 10px 30px rgba(0, 0, 0, 0.04));
}

/* Couleur des épis de blé */
.bg .plant-primary {
  fill: #2e5a44;
  fill-opacity: 0.12;
}

/* Variantes de feuillage */
.bg .plant-secondary {
  fill: #4a7c59;
  fill-opacity: 0.08;
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

header {
  height: fit-content;
  padding: 20px var(--app-padding-x);
}

header > a::before {
  content: '';
  position: absolute;
  top: -15px;
  left: 0;
  height: 100%;
  width: 100%;
  transform: scale(1.5);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 600' width='900' height='600'%3E%3Cg transform='translate(416.34369726421266 281.01462663501235)'%3E%3Cpath d='M149 -145.8C185.3 -112.7 201.7 -56.3 208.9 7.2C216 70.7 214.1 141.4 177.8 180.8C141.4 220.1 70.7 228 11.7 216.4C-47.4 204.7 -94.8 173.4 -119.8 134.1C-144.8 94.8 -147.4 47.4 -143.3 4.1C-139.1 -39.1 -128.3 -78.3 -103.3 -111.4C-78.3 -144.6 -39.1 -171.8 8.6 -180.4C56.3 -189 112.7 -179 149 -145.8' fill='%2300BD7E'/%3E%3C/g%3E%3C/svg%3E");
  background-size: contain;
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

#website-name {
  width: fit-content;
  margin: 10px auto;
  font-family: 'Grand Hotel', cursive;
  font-weight: 400;
  font-style: normal;
  transition: opacity 0.15s;
}

#logo {
  height: 80px;
  width: auto;
  filter: invert(0.95);
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

  header > a::before {
    transform: scale(5);
  }

  footer > div {
    box-shadow:
      rgba(255, 255, 255, 0.1) 0px 1px 1px 0px inset,
      rgba(50, 50, 93, 0.25) 0px 50px 100px -20px,
      rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;
  }
}
</style>
