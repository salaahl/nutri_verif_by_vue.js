<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProducts } from '../composables/useProducts'
import ProductCard from '/src/components/ProductCard.vue'

const router = useRouter()

const {
  searchProducts,
  productsIsLoading,
  products,
  fetchLastProduct,
  lastProducts,
  lastProductsIsLoading
} = useProducts()
const moreProductsLink = ref<{ name: string; to: string } | null>(null)

fetchLastProduct()

onMounted(() => {
  // Hide the website name in home view
  const websiteName = document.querySelector('#website-name') as HTMLElement
  if (!websiteName) return
  websiteName.classList.add('opacity-0')

  let timer: ReturnType<typeof setTimeout>

  const searchBar = document.querySelector('#search-bar') as HTMLElement
  if (!searchBar) return

  searchBar.addEventListener('input', () => {
    moreProductsLink.value = null
    products.value = [] // Doublon nécessaire à cause du timer
    clearTimeout(timer)

    timer = setTimeout(async function () {
      const searchInput = document.querySelector('#search-input') as HTMLInputElement
      if (!searchInput) return

      let regex = /^[0-9]{8,13}$/
      if (regex.test(searchInput.value)) {
        router.push({ name: 'product', params: { id: searchInput.value } })
      } else {
        await searchProducts(searchInput.value, 'complete')
        moreProductsLink.value = { name: 'Plus de résultats', to: '/search' }
      }
    }, 1000)
  })
})

onUnmounted(() => {
  const websiteName = document.querySelector('#website-name') as HTMLElement
  if (websiteName) {
    websiteName.classList.remove('opacity-0')
  }
})
</script>

<template>
  <section id="header" class="w-full mb-20">
    <h1 class="text-6xl font-light text-center">Nutri<span class="text-[#00bd7e]">Vérif</span></h1>
    <h2 class="text-lg font-thin text-center">Manger (plus) sain</h2>
  </section>
  <section id="search-container" class="w-full mb-20">
    <div id="search-bar" class="relative mb-8">
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
    </div>
    <div
      v-if="products.length > 0 || productsIsLoading"
      id="search-results"
      class="relative flex flex-wrap p-4 bg-neutral-200 rounded-lg"
    >
      <div
        v-if="productsIsLoading"
        class="loader-container w-fit flex justify-center items-center m-auto"
      >
        <div class="lds-hourglass"></div>
      </div>
      <ProductCard
        v-for="product in products.slice(0, 4)"
        :key="product.id"
        :id="product.id"
        :image="product.image"
        :brand="product.brand"
        :name="product.name"
        :nutriscore="product.nutriscore"
        :nova="product.nova"
      />
      <article
        v-if="products.length > 0"
        class="md:product w-full md:w-[18.6%] flex items-center justify-center mt-[2.5%] md:mt-0"
      >
        <RouterLink
          :key="moreProductsLink?.name"
          :to="moreProductsLink?.to ?? ''"
          class="w-full p-3 text-center text-white font-semibold bg-gray-800 rounded-lg"
        >
          {{ moreProductsLink?.name }}
        </RouterLink>
      </article>
    </div>
    <h3 id="total-products" class="my-8 text-2xl lg:text-3xl text-center">
      + de 1 082 462 produits référencés
    </h3>
  </section>
  <section id="open-food-facts-video-presentation" class="mb-8">
    <iframe
      src="https://www.youtube.com/embed/D1jzT02IBRA"
      class="w-full aspect-[2/1] border-[3px] rounded-xl"
      title="Open Food Facts - Présentation"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    ></iframe>
  </section>
  <section id="about" class="mb-20">
    <span class="py-1 font-thin">
      NutriVérif est alimentée par "Open Food Facts", une base de données de produits alimentaires
      créée par tous et pour tous.
    </span>
    <div class="my-2"></div>
    <span class="py-1 font-thin">
      Vous pouvez l'utiliser pour faire de meilleurs choix alimentaires, et comme les données sont
      ouvertes, tout le monde peut les réutiliser pour tout usage.
    </span>
    <RouterLink :to="'/about'" class="flex items-center w-fit mt-2">
      En savoir plus
      <svg class="h-[15px] w-auto ml-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
        <path
          d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
        />
      </svg>
    </RouterLink>
  </section>
  <section id="score-explanations" class="mb-20">
    <h2 class="title mb-8 text-2xl lg:text-3xl">
      Votre alimentation <span class="text-[indianred]">décryptée</span>
    </h2>
    <div class="py-8 px-4 md:p-8 bg-white rounded-lg">
      <article id="nutriscore-explanation" class="w-full mr-auto mb-8 text-justify">
        <div class="flex flex-col md:flex-row md:justify-between items-center">
          <img
            src="https://static.openfoodfacts.org/images/attributes/dist/nutriscore-a.svg"
            alt="Nutriscore"
            class="w-[10rem] mb-4 md:mb-0 md:mr-8"
          />
          <p class="w-full md:w-3/4 font-thin">
            Le Nutri-Score est un étiquetage nutritionnel simple qui aide les consommateurs à
            choisir des aliments plus sains. Représenté par une échelle de A à E, avec des couleurs
            du vert au rouge, il évalue les produits selon leur composition, en équilibrant les
            éléments bénéfiques (fibres, protéines) et ceux à limiter (sucre, sel). Facile à
            comprendre, il encourage une alimentation équilibrée et des choix éclairés.
          </p>
        </div>
      </article>
      <article id="nova-explanation" class="w-full ml-auto md:mb-8 text-justify">
        <div class="flex flex-col md:flex-row md:justify-between items-center">
          <img
            src="https://static.openfoodfacts.org/images/attributes/dist/nova-group-1.svg"
            alt="NOVA"
            class="w-[2.5rem] mb-4 md:mb-0 md:mr-8"
          />
          <p class="w-full md:w-3/4 font-thin">
            Le NOVA est un étiquetage nutritionnel simple qui aide les consommateurs à choisir des
            aliments plus sains. Représenté par une échelle de 1 à 4, avec des couleurs du vert au
            rouge, il évalue les produits selon leur composition, en équilibrant les éléments
            bénéfiques (fibres, protéines) et ceux à limiter (sucre, sel). Facile à comprendre, il
            encourage une alimentation équilibrée et des choix éclairés.
          </p>
        </div>
      </article>
    </div>
  </section>
  <section id="last-products" class="mb-20">
    <h2 class="title mb-8 text-2xl lg:text-3xl text-right">
      Produits <span class="text-[#00bd7e]">récemment</span> ajoutés
    </h2>
    <div class="relative flex flex-wrap p-4 bg-neutral-200 rounded-lg">
      <div
        v-if="lastProductsIsLoading"
        class="loader-container w-fit flex justify-center items-center m-auto"
      >
        <div class="lds-hourglass"></div>
      </div>
      <ProductCard
        v-for="product in lastProducts"
        :key="product.id"
        :product="product"
        :id="product.id"
        :image="product.image"
        :brand="product.brand"
        :generic-name="product.name"
        :nutriscore="product.nutriscore"
        :nova-group="product.nova"
      />
    </div>
  </section>
</template>

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

.product {
  width: 48%;
  aspect-ratio: unset;
  margin-bottom: 5%;
}

.product:nth-of-type(odd) {
  margin-right: 4%;
}

#about span {
  background-color: hsla(160, 100%, 37%, 0.6);
}

#total-products {
  font-family: 'Grand Hotel', cursive;
  color: transparent;
  background: linear-gradient(to left, #5d576b80, #2f2c36);
  background-clip: text;
}

@media (min-width: 768px) {
  .product {
    width: 19%;
    margin-left: unset;
    margin-right: unset;
    margin-bottom: 0;
  }

  .product:nth-of-type(odd) {
    margin-right: unset;
  }

  .product:nth-of-type(2n + 2) {
    margin-left: 1.25%;
    margin-right: 1.25%;
  }
}
</style>
