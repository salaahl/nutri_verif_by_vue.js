<script setup lang="ts">
import { onMounted, onUpdated, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '../stores/products'
import ProductCard from '/src/components/ProductCard.vue'

interface Product {
  id: string
  image?: string
  brand?: string
  name?: string
  nutriscore?: number | string
  nova?: number | string
}

const router = useRouter()
const productsStore = useProductsStore()

let products = computed<Product[]>({
  get: () => productsStore.getProducts,
  set: (val) => productsStore.updateProducts(val)
})

const productsIsLoading = ref<boolean>(false)

let input = computed<string>({
  get: () => productsStore.getInput,
  set: (val) => productsStore.updateInput(val)
})

let page = computed<number>({
  get: () => productsStore.getPage,
  set: (val) => productsStore.updatePage(val)
})

let pages = computed<number>({
  get: () => productsStore.getPages,
  set: (val) => productsStore.updatePages(val)
})

// Utilisé pour savoir si la requête est faite par le formulaire (nouvelle recherche) ou par le scrolling (dans quel cas j'incrémente la page)
let method: string | null = null

// Helper function to get elements by selector
const $ = (id: string) => document.querySelector(id)

onMounted(() => {
  // Function to search products from the API
  async function searchProduct() {
    productsIsLoading.value = true
    const fields: string =
      'id,image_front_small_url,brands,generic_name_fr,nutriscore_grade,nova_group'
    const route: string = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${input.value}&fields=${fields}&sort_by=popularity_key,completeness&page_size=20&page=${page.value}&search_simple=1&action=process&json=1`

    try {
      const response: any = await fetch(route)
      const data: any = await response.json()

      data.products.forEach(
        (product: {
          id?: string
          image_front_small_url?: string
          brands?: string
          generic_name_fr?: string
          nutriscore_grade?: string
          nova_group?: string
        }) => {
          products.value.push({
            id: product.id ?? 'unknown',
            image: product.image_front_small_url ?? './logo.png',
            brand: product.brands ?? 'Marque inconnue',
            name: product.generic_name_fr ?? 'Fiche non finalisée',
            nutriscore: product.nutriscore_grade ?? 'unknown',
            nova: product.nova_group ?? 'unknown'
          })
        }
      )

      if (method === 'form') {
        pages.value = Math.ceil(data.count / 20)
      }
    } catch (error: any) {
      console.error('Error fetching data:', error.message)
    }

    productsIsLoading.value = false
  }

  searchProduct()

  const form = $('form') as HTMLFormElement
  if (!form) return
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const searchInput = $('#search-input') as HTMLInputElement
    if (!searchInput) return
    input.value = searchInput.value

    const regex: RegExp = /^[0-9]{8,13}$/
    if (regex.test(input.value)) {
      router.push({ name: 'product', params: { id: input.value } })
    } else {
      const searchBarBtnSvg: HTMLElement = $('#search-bar button > svg') as HTMLElement
      const searchBarBtnLoader: HTMLElement = $('#search-bar button .lds-hourglass') as HTMLElement
      if (!searchBarBtnSvg || !searchBarBtnLoader) return
      searchBarBtnSvg.classList.add('hidden')
      searchBarBtnLoader.classList.remove('hidden')

      method = 'form'
      window.scrollTo({ top: 0, behavior: 'smooth' })
      page.value = 1

      products.value.length = 0
      await searchProduct()

      // Laisse le temps à la page de remonter et ainsi d'éviter de déclencher le scroll event
      setTimeout(() => {
        method = null
      }, 1000)
    }
  })

  let prevScrollpos: number = 0
  let refresh: boolean = true

  window.onscroll = async function () {
    const h: HTMLElement = document.documentElement
    const b: HTMLElement = document.body
    if (!h || !b) return
    const currentScrollPos: number =
      ((h.scrollTop || b.scrollTop) / ((h.scrollHeight || b.scrollHeight) - h.clientHeight)) * 100

    const searchBar: HTMLElement = $('#search-bar') as HTMLElement
    if (!searchBar) return
    const searchBarHeight: number = searchBar.offsetHeight

    if (prevScrollpos > currentScrollPos) {
      searchBar.style.top = '50px'
    } else {
      searchBar.style.top = `-${searchBarHeight + 4}px`
    }

    const searchResults: HTMLElement = $('#search-results') as HTMLElement
    if (!searchResults) return

    if (
      searchResults &&
      currentScrollPos > prevScrollpos &&
      currentScrollPos > 70 &&
      method !== 'form' &&
      page.value < pages.value &&
      refresh
    ) {
      refresh = false
      page.value++
      await searchProduct()

      setTimeout(() => {
        refresh = true
      }, 1000)
    }
    prevScrollpos = currentScrollPos
  }
})

onUpdated(() => {
  // Timeout to hide the loading indicator and show the search button again
  let timer: number = 500
  clearTimeout(timer)

  timer = setTimeout(() => {
    document.querySelectorAll('.lds-hourglass').forEach((ele) => {
      (ele as HTMLElement).classList.add('hidden')
    })
    const searchBarBtnSvg = $('#search-bar button > svg') as HTMLElement
    if (!searchBarBtnSvg) return
    searchBarBtnSvg.classList.remove('hidden')
  }, 500)
})
</script>

<template>
  <section id="search-bar" class="relative mb-16">
    <form class="flex items-center">
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
  <div id="new-results">
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
