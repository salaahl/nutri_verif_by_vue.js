<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProducts } from '../composables/useProducts'
import ProductCard from '/src/components/ProductCard.vue'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
gsap.defaults({ ease: 'power1.out' })

const router = useRouter()
const { products, productsIsLoading, searchProducts } = useProducts()

// Gestion du formulaire de recherche
const onSubmit = async (event: Event) => {
  event.preventDefault()
  const searchInput = document.querySelector('#search-input') as HTMLInputElement
  if (!searchInput) return

  const regex = /^[0-9]{8,13}$/
  if (regex.test(searchInput.value)) {
    router.push({ name: 'product', params: { id: searchInput.value } })
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    await searchProducts(searchInput.value, 'complete')
  }
}

onMounted(() => {
  ScrollTrigger.create({
    trigger: '#new-results',
    start: window.innerWidth < 1024 ? '100% 100%' : '50% 100%',
    end: window.innerWidth < 1024 ? '100% 100%' : '50% 100%',
    markers: true,
    onEnter: async () => await searchProducts(null, 'scroll')
  })
})

onUnmounted(() => {
  //
})
</script>

<template>
  <section id="search-bar" class="relative mb-16">
    <form @submit="onSubmit" class="flex items-center">
      <label for="search-input" class="sr-only">Search</label>
      <div class="relative w-full">
        <div class="absolute inset-y-0 start-0 flex items-center ps-6 pointer-events-none">
          <svg id="search-bar-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path
              d="M416 0C400 0 288 32 288 176V288c0 35.3 28.7 64 64 64h32V480c0 17.7 14.3 32 32 32s32-14.3 32-32V352 240 32c0-17.7-14.3-32-32-32zM64 16C64 7.8 57.9 1 49.7 .1S34.2 4.6 32.4 12.5L2.1 148.8C.7 155.1 0 161.5 0 167.9c0 45.9 35.1 83.6 80 87.7V480c0 17.7 14.3 32 32 32s32-14.3 32-32V255.6c44.9-4.1 80-41.8 80-87.7c0-6.4-.7-12.8-2.1-19.1L191.6 12.5c-1.8-8-9.3-13.3-17.4-12.4S160 7.8 160 16V150.2c0 5.4-4.4 9.8-9.8 9.8c-5.1 0-9.3-3.9-9.8-9L127.9 14.6C127.2 6.3 120.3 0 112 0s-15.2 6.3-15.9 14.6L83.7 151c-.5 5.1-4.7 9-9.8 9c-5.4 0-9.8-4.4-9.8-9.8V16zm48.3 152l-.3 0-.3 0 .3-.7 .3 .7z"
            />
          </svg>
        </div>
        <input
          type="text"
          id="search-input"
          class="block w-full px-12 p-2.5 text-ellipsis bg-gray-50 border-4 text-gray-900 text-sm rounded-full outline-0 focus:ring-gray-400 focus:border-gray-400"
          placeholder="Entrez un nom de produit, un code-barres, une marque ou un type d'aliment"
          required
        />
      </div>
      <button
        type="submit"
        class="p-2.5 ms-2 text-sm font-medium text-white bg-blue-700 rounded-full border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300"
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
        <div class="lds-hourglass hidden"></div>
        <span class="sr-only">Search</span>
      </button>
    </form>
  </section>
  <section id="search-results">
    <ProductCard
      v-for="product in products"
      :key="product.id"
      :id="product.id"
      :image="product.image"
      :brand="product.brand"
      :name="product.name"
      :nutriscore="product.nutriscore"
      :nova="product.nova"
    />
  </section>
  <div id="new-results" class="h-[100px]">
    <div v-if="productsIsLoading" class="lds-hourglass"></div>
  </div>
</template>

<style scoped>
#search-bar {
  position: sticky;
  width: 100%;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  z-index: 99;
  transition: top 0.25s;
}

#search-bar-icon {
  height: auto;
  width: 0.875rem;
  filter: contrast(0.5);
}

#search-results {
  display: flex;
  flex-wrap: wrap;
}

#search-bar .lds-hourglass:after {
  margin: 0;
  border: 0.5rem solid #fff;
  border-color: hsla(160, 100%, 37%, 0.6) transparent var(--color-green) transparent;
}

#new-results .lds-hourglass:after {
  margin: 8px;
  border: 32px solid #fff;
  border-color: black transparent var(--color-green) transparent;
}

.product {
  width: 45%;
  margin-left: 2.5%;
  margin-right: 2.5%;
  margin-bottom: 2rem;
}

@media (min-width: 768px) and (max-width: 1023px) {
  .product {
    width: 32%;
  }

  .product:nth-of-type(3n + 2) {
    margin-left: 2%;
    margin-right: 2%;
  }
}

@media (min-width: 768px) {
  .product {
    margin-left: unset;
    margin-right: unset;
  }
}

@media (min-width: 1024px) {
  .product {
    width: 18.8%;
  }

  .product:nth-of-type(5n + 2) {
    margin-left: 1.5%;
    margin-right: 1.5%;
  }

  .product:nth-of-type(5n + 4) {
    margin-left: 1.5%;
    margin-right: 1.5%;
  }
}
</style>
