<script setup>
import { onMounted, onUpdated, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app.ts'
import { useProductsStore } from '../stores/products.ts'
import ProductCard from '/src/components/ProductCard.vue'

const router = useRouter()
const appStore = useAppStore()
const productsStore = useProductsStore()

let aboutMeStatus = computed({
  get: () => appStore.getAboutMeStatus,
  set: (val) => appStore.setAboutMeStatus(val)
})

let searchInput = computed({
  get: () => appStore.getSearchInput,
  set: (val) => appStore.setSearchInput(val)
})

let products = computed({
  get: () => productsStore.getProducts,
  set: (val) => productsStore.updateProducts(val)
})

let page = computed({
  get: () => productsStore.getPage,
  set: (val) => productsStore.updatePage(val)
})

let pages = computed({
  get: () => productsStore.getPages,
  set: (val) => productsStore.updatePages(val)
})

let method

// Helper function to get elements by selector
const $ = (id) => document.querySelector(id)

onMounted(() => {
  // Function to search products from the API
  async function searchProduct() {
    const fields = 'id,image_front_small_url,brands,generic_name_fr,nutriscore_grade,nova_group'
    const route = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${searchInput.value}&fields=${fields}&sort_by=popularity_key&page_size=20&page=${page.value}&search_simple=1&action=process&json=1`

    try {
      const response = await fetch(route)
      const data = await response.json()
      data.products.forEach((product) => {
        products.value.push({
          id: product.id,
          image: product.image_front_small_url || '/logo.png',
          brand: product.brands || 'Fiche non finalisée',
          name: product.generic_name_fr || 'Fiche non finalisée',
          nutriscore: product.nutriscore_grade,
          nova: product.nova_group
        })
      })

      if (method === 'form') {
        for (let i = 1; i * 20 < data.count; i++) {
          pages.value++
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error.message)
    }
  }

  // Handle form submission
  $('form').addEventListener('submit', async (e) => {
    e.preventDefault()
    searchInput.value = $('#search-input').value

    let regex = /^[0-9]{8,13}$/
    if (regex.test(searchInput.value)) {
      router.push({ name: 'product', params: { id: searchInput.value } })
    } else {
      $('#search-bar button > svg').classList.add('hidden')
      $('#search-bar .lds-hourglass').classList.remove('hidden')

      method = 'form'
      window.scrollTo({ top: 0, behavior: 'smooth' })
      page.value = 1
      if (aboutMeStatus.value) {
        $('#website-name').style.opacity = '1'
        $('#header').style.display = 'none'
        $('#about-me').style.height = '0'
      }

      products.value.length = 0
      await searchProduct()

      setTimeout(() => {
        method = null
      }, 1000)
    }
  })

  // Handle scroll event to load more products
  let prevScrollpos = 0
  let refresh = true

  window.onscroll = async function () {
    const h = document.documentElement
    const b = document.body
    const currentScrollPos =
      ((h.scrollTop || b.scrollTop) / ((h.scrollHeight || b.scrollHeight) - h.clientHeight)) * 100

    if ($('#search-bar')) {
      const searchBarHeight = $('#search-bar').offsetHeight

      if (prevScrollpos > currentScrollPos) {
        $('#search-bar').style.top = '50px'
      } else {
        $('#search-bar').style.top = `-${searchBarHeight + 4}px`
      }
    }

    if (
      $('#search-results') &&
      currentScrollPos > prevScrollpos &&
      currentScrollPos > 70 &&
      method !== 'form' &&
      page.value < pages.value &&
      refresh
    ) {
      refresh = false
      $('#new-results .lds-hourglass').classList.remove('hidden')
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
  let timer
  clearTimeout(timer)

  timer = setTimeout(() => {
    document.querySelectorAll('.lds-hourglass').forEach((ele) => {
      ele.classList.add('hidden')
    })
    $('#search-bar button > svg').classList.remove('hidden')
    aboutMeStatus.value = false
  }, 500)
})
</script>

<template>
  <div v-if="aboutMeStatus" id="header" class="absolute top-0 md:top-[10%] w-full">
    <h1 class="text-6xl font-light text-center">Nutri<span class="text-[#00bd7e]">Vérif</span></h1>
    <h2 class="text-lg font-thin text-center">Manger (plus) sain</h2>
  </div>
  <div id="search-bar" class="relative">
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
          placeholder="Un nom de produit, un code-barres, une marque ou un type d'aliment"
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
  </div>
  <div id="search-results" class="mt-12">
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
  </div>
  <div v-if="aboutMeStatus" id="about-me">
    <span class="py-1 font-thin">
      NutriVérif est alimentée par "Open Food Facts", une base de données de produits alimentaires
      créée par tous et pour tous.
    </span>
    <div class="my-2"></div>
    <span class="py-1 font-thin">
      Vous pouvez l'utiliser pour faire de meilleurs choix alimentaires, et comme les données sont
      ouvertes, tout le monde peut les réutiliser pour tout usage.
    </span>
    <RouterLink :to="'/about-me'" class="flex items-center w-fit mt-2">
      En savoir plus
      <svg class="h-[15px] w-auto ml-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
        <path
          d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
        />
      </svg>
    </RouterLink>
  </div>
  <div id="new-results">
    <div class="lds-hourglass hidden"></div>
  </div>
</template>

<style>
#website-name {
  opacity: 0;
  transition: opacity 0.5s;
}
</style>

<style scoped>
h1 {
  font-family: 'Grand Hotel', cursive;
}

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

#about-me {
  height: 250px;
  overflow: hidden;
  transition: height 0.5s;
}

#about-me span {
  background-color: hsla(160, 100%, 37%, 0.6);
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
  #about-me {
    height: 130px;
  }

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
