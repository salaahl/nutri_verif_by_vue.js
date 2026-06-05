<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '../stores/products'
import { useProducts } from '../composables/useProducts'
import SearchBar from '@/components/SearchBar.vue'
import ProductCard from '@/components/ProductCard.vue'
import AlternativesProducts from '@/components/AlternativesProducts.vue'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const router = useRouter()

const productsStore = useProductsStore()
const isFirstLaunch = computed<boolean>({
  get: () => productsStore.getLaunchStatus,
  set: (val) => productsStore.setLaunchStatus(val)
})

const {
  searchProducts,
  productsIsLoading,
  products,
  fetchProduct,
  productIsLoading,
  product,
  suggestedProductsIsLoading,
  homeSuggestedProducts,
  fetchSuggestedProducts,
  fetchLastProducts,
  lastProductsIsLoading,
  lastProducts
} = useProducts()

const categories = [
  'yaourts',
  'céréales',
  'boissons',
  'snacks',
  'plats préparés',
  'bio',
  'sans gluten'
]

const showLastProducts = ref(false)

const searchLastProducts: Function = () => {
  showLastProducts.value = true
  fetchLastProducts()
}

const searchProductsByCategory: Function = async (category: string) => {
  await searchProducts(category, null, 'complete')
  router.push({ name: 'search' })
}

onMounted(async () => {
  if (isFirstLaunch.value) {
    // Animation des sections
    document.querySelectorAll('main > div > section').forEach((section) => {
      gsap.from(section, {
        y: window.innerWidth < 768 ? '15%' : '250',
        opacity: window.innerWidth < 768 ? 0 : 1,
        duration: 0.4,
        scrollTrigger: {
          trigger: section,
          start: window.innerWidth < 768 ? '0 85%' : '0 100%'
        }
      })
    })

    isFirstLaunch.value = false
  }

  // Retirer le nom du site sur la page d'accueil
  const websiteName = document.querySelector('#website-name') as HTMLElement
  if (!websiteName) return
  websiteName.classList.add('opacity-0')

  // Affichage conditionnel de la vidéo Youtube
  const videoContainer = document.getElementById('video-container') as HTMLElement
  const cookieAuthorisation = document.getElementById('accept-cookies') as HTMLElement

  cookieAuthorisation.addEventListener('click', function () {
    if (
      !confirm(
        'Cette vidéo est hébergée par YouTube. Son affichage sur ce site implique le dépôt de cookies par YouTube (Google).\n\nCes cookies sont uniquement liés à la lecture de la vidéo et n’ont pas d’effet sur vos autres services Google.\n\nVoulez-vous les accepter et afficher la vidéo ?'
      )
    ) {
      return
    }
    localStorage.setItem('cookiesAccepted', 'true')

    // Remplacement du bouton par l'iframe YouTube
    videoContainer.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/D1jzT02IBRA"
        class="h-full w-full"
        title="Open Food Facts - Présentation"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    `
  })

  // Vérification si l'utilisateur a déjà accepté
  if (localStorage.getItem('cookiesAccepted') === 'true') {
    videoContainer.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/D1jzT02IBRA"
        class="h-full w-full"
        title="Open Food Facts - Présentation"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    `
  }

  await fetchProduct('3608580758686')
})

onUnmounted(() => {
  const websiteName = document.querySelector('#website-name') as HTMLElement
  if (websiteName) {
    websiteName.classList.remove('opacity-0')
  }
})
</script>

<template>
  <section id="header" class="w-full my-20">
    <h1 class="text-6xl font-light text-center text-[#00bd7e]">
      Nutri<span class="text-black">Vérif</span>
    </h1>
    <h3 class="text-lg text-center">Manger (plus) sain</h3>
  </section>
  <section id="search-container" class="w-full mb-20">
    <SearchBar />
    <div
      v-if="categories.length"
      class="radio-toolbar relative flex flex-wrap justify-center mb-12"
    >
      <label
        v-for="category in categories"
        :key="category"
        :class="`${productsIsLoading ? 'pointer-events-none' : ''} tag mt-2 mr-2 py-2 px-3 text-sm font-semibold text-white rounded-full`"
        @click="searchProductsByCategory(category)"
      >
        {{ category }}
      </label>
    </div>
    <div
      :class="`${products.length > 0 || productsIsLoading ? 'max-h-[750px] md:max-h-[400px]' : 'max-h-0'} overflow-hidden transition-all duration-300 ease-in-out`"
    >
      <div
        id="search-results"
        class="relative flex flex-wrap justify-between md:justify-start mb-8 p-4 rounded-lg"
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
          :category="product.category"
        />
        <article
          v-if="products.length > 4"
          class="md:product w-full md:w-[18.6%] flex items-center justify-center mt-[2.5%] md:mt-0"
        >
          <RouterLink
            :key="'Plus de résultats'"
            :to="'/search'"
            class="h-full w-full flex items-center justify-center p-3 md:text-4xl text-center text-white font-semibold bg-[#00bd7e] rounded-lg"
          >
            +
          </RouterLink>
        </article>
      </div>
    </div>
    <h3 id="total-products" class="text-2xl lg:text-3xl text-center">
      + de 1 234 100 produits référencés
    </h3>
  </section>
  <section id="about" class="mb-24">
    <article class="mb-8">
      <div
        id="video-container"
        class="w-full aspect-[2/1] border-[3px] border-black rounded-xl overflow-hidden"
      >
        <div class="cookies h-full w-full flex items-center justify-center">
          <button id="accept-cookies">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="h-[75px] w-[75px]">
              <path
                fill="whitesmoke"
                d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z"
              />
            </svg>
          </button>
        </div>
      </div>
    </article>
    <article>
      <span class="text-highlighted red py-[2.5px] font-[200]">
        NutriVérif est alimentée par "Open Food Facts", une base de données de produits alimentaires
        créée par tous et pour tous.
      </span>
      <div class="my-2"></div>
      <span class="text-highlighted red py-[2.5px] font-[200]">
        Vous pouvez l'utiliser pour faire de meilleurs choix alimentaires, et comme les données sont
        ouvertes, tout le monde peut les réutiliser pour tout usage.
      </span>
      <RouterLink
        :to="'/about'"
        class="flex items-center w-fit mt-4 py-1 px-3 bg-white rounded-full transition ease-in-out duration-300 hover:translate-x-1 hover:bg-[#00bd7e]"
      >
        En savoir plus
        <svg class="h-[15px] w-auto ml-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path
            d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
          />
        </svg>
      </RouterLink>
    </article>
  </section>
  <section id="score-explanations" class="mb-24">
    <h2 class="title mb-12 text-2xl lg:text-3xl font-light">
      Votre alimentation <span class="text-[indianred]">décryptée</span>
    </h2>
    <div class="flex flex-wrap justify-between">
      <article
        id="nutriscore-explanation"
        class="w-full md:w-[48%] mb-8 md:mb-0 p-8 md:p-12 bg-white rounded-lg text-justify"
      >
        <div class="h-full flex flex-col md:flex-col items-center">
          <img
            src="https://static.openfoodfacts.org/images/attributes/dist/nutriscore-a.svg"
            alt="Nutriscore"
            class="w-[10rem] mb-8"
          />
          <p class="w-full font-thin">
            Le Nutri-Score est un système d'étiquetage nutritionnel qui aide les consommateurs à
            identifier la qualité nutritionnelle des aliments. Il classe les produits de A
            (meilleure qualité nutritionnelle) à E (moins favorable), en prenant en compte des
            critères tels que les nutriments bénéfiques (fibres, protéines) et les éléments à
            limiter (sucre, sel). Ce score, accompagné de couleurs, permet de faire des choix
            alimentaires plus éclairés.
          </p>
        </div>
      </article>
      <article
        id="nova-explanation"
        class="w-full md:w-[48%] p-8 md:p-12 bg-white rounded-lg text-justify"
      >
        <div class="h-full flex flex-col md:flex-col items-center">
          <img
            src="https://static.openfoodfacts.org/images/attributes/dist/nova-group-1.svg"
            alt="NOVA"
            class="w-[2.5rem] mb-8"
          />
          <p class="w-full font-thin">
            Le système NOVA évalue le degré de transformation des aliments plutôt que leur valeur
            nutritionnelle directe. Il classe les produits en quatre groupes, allant des aliments
            bruts ou peu transformés (groupe 1) aux produits ultratransformés (groupe 4). Ce système
            met en avant l'importance de privilégier les aliments naturels et peu modifiés pour une
            alimentation plus saine.
          </p>
        </div>
      </article>
    </div>
  </section>
  <section id="alternatives-functionality" class="mb-24">
    <h2 class="title mb-12 text-2xl lg:text-3xl font-light text-center">
      Découvrez des <span class="text-[#00bd7e]">alternatives</span> plus saines
    </h2>
    <span class="inline-block mb-8">
      <span class="text-highlighted">Vous méritez le meilleur pour votre alimentation </span>
      <span>. Si un produit a un Nutri-Score jugé trop faible :</span>
    </span>
    <div
      id="product-container"
      class="flex flex-wrap justify-between md:flex-nowrap flex-col md:flex-row"
    >
      <section
        id="product-images-container"
        class="w-full md:w-2/4 flex items-center justify-center aspect-square md:aspect-auto bg-white rounded-[32px]"
      >
        <div class="flex md:w-full">
          <div
            v-if="productIsLoading"
            class="loader-container h-full flex justify-center items-center"
          ></div>
          <img
            id="product-img"
            :src="product.image"
            :alt="product.name"
            class="h-auto max-h-72 lg:max-h-full w-auto max-w-[70%] m-auto"
          />
        </div>
      </section>
      <section id="product-details-container" class="relative w-full md:w-2/4 max-md:mt-8 md:pl-6">
        <div
          v-if="productIsLoading"
          class="loader-container md:absolute h-full w-full flex justify-center items-center"
        >
          <div class="lds-hourglass"></div>
        </div>
        <div id="product-detail" class="h-full text-black/25">
          <div class="h-full flex flex-col justify-evently">
            <div>
              <h3 v-if="product.brand" class="title text-xl md:text-2xl font-bold text-[#00bd7e]">
                {{ product.brand }}
              </h3>
              <h3 v-if="product.name" class="title text-xl md:text-2xl font-bold">
                {{ product.name }}
              </h3>
              <h4 v-if="product.lastUpdate" class="mt-2 text-xs">
                Dernière mise à jour : <span id="last-update">{{ product.lastUpdate }}</span>
              </h4>
            </div>
            <div>
              <div class="scores mt-8">
                <img
                  id="nutriscore-img"
                  class="max-w-[100px]"
                  :src="
                    'https://static.openfoodfacts.org/images/attributes/dist/nutriscore-' +
                    product.nutriscore +
                    '.svg'
                  "
                  :alt="'Nutriscore : ' + product.nutriscore"
                />
                <div class="flex items-end">
                  <img
                    id="nova-group-img"
                    class="max-w-[25px] mt-2 opacity-25"
                    :src="
                      'https://static.openfoodfacts.org/images/attributes/dist/nova-group-' +
                      product.novaGroup +
                      '.svg'
                    "
                    :alt="'Groupe Nova : ' + product.novaGroup"
                  />
                </div>
              </div>
              <div
                v-if="product.nutrient_levels"
                id="nutrient-levels"
                class="flex flex-wrap mt-2 opacity-25"
              >
                <span
                  v-for="(level, nutrient) in product.nutrient_levels"
                  :key="nutrient"
                  :class="[
                    'mt-4 mr-2 py-2 px-3 text-sm font-semibold text-white rounded-full',
                    level === 'low' ? 'bg-[#00bd7e]' : '',
                    level === 'moderate' ? 'bg-yellow-500' : '',
                    level === 'high' ? 'bg-red-500' : ''
                  ]"
                >
                  {{
                    nutrient.toString() === 'fat'
                      ? 'matieres grasses'
                      : nutrient.toString() === 'salt'
                        ? 'sel'
                        : nutrient.toString() === 'saturated-fat'
                          ? 'graisses saturées'
                          : nutrient.toString() === 'sugars'
                            ? 'sucres'
                            : ''
                  }}
                </span>
              </div>
              <h4 v-if="product.quantity" class="mt-8 font-semibold">Quantité :</h4>
              <h5 id="quantity">{{ product.quantity }}</h5>
              <h4 v-if="product.ingredients" class="mt-4 font-semibold">Ingrédients :</h4>
              <h5 v-html="product.ingredients" id="ingredients"></h5>
              <h4 v-if="product.manufacturingPlace" class="mt-4 font-semibold">
                Lieu de fabrication :
              </h4>
              <h5 id="manufacturing-place">
                {{ product.manufacturingPlace }}
              </h5>
              <h4 v-if="product.id" class="mt-4 font-semibold">Code-barres :</h4>
              <h5 id="barcode">{{ product.id }}</h5>
              <h4 v-if="product.link" class="mt-4 font-semibold">Plus d'infos :</h4>
              <h5>
                <a :href="product.link" target="_blank" id="link" class="underline break-words">{{
                  product.link
                }}</a>
              </h5>
            </div>
          </div>
        </div>
      </section>
    </div>
    <span class="inline-block my-8">
      notre fonctionnalité intelligente vous propose instantanément des alternatives
      <span class="text-highlighted">mieux notées et tout aussi savoureuses</span> :
    </span>
    <AlternativesProducts
      :from="'home'"
      :hasProduct="product.id ? true : false"
      :isLoading="suggestedProductsIsLoading"
      :products="homeSuggestedProducts"
      @trigger-search="fetchSuggestedProducts({ isFrom: 'home' })"
    />
    <span class="inline-block my-8">
      Trouvez des options <span class="text-highlighted">plus saines</span> et faites de chaque
      choix un pas vers une meilleure santé.</span
    >
  </section>
  <section id="last-products" class="mb-24">
    <h2 class="title mb-12 text-2xl lg:text-3xl font-light text-right">
      Produits <span class="text-[indianred]">récemment</span> ajoutés
    </h2>
    <div
      v-if="!showLastProducts"
      class="relative flex flex-wrap justify-between md:justify-start p-4 rounded-lg"
    >
      <ProductCard v-for="i in [0, 1, 2, 3]" :key="i" />
      <article
        class="md:product w-full md:w-[18.6%] flex items-center justify-center mt-[2.5%] md:mt-0"
      >
        <button
          id="last-products-button"
          class="h-full w-full flex items-center justify-center p-3 text-center text-white font-semibold bg-[#00bd7e] md:bg-[#343a40] rounded-lg"
          @click="searchLastProducts()"
        >
          <span
            class="md:backdrop-contrast-50 md:px-4 md:py-2 text-sm font-semibold md:rounded-[25px]"
            >Afficher les produits</span
          >
        </button>
      </article>
    </div>
    <div v-else class="relative flex flex-wrap justify-between md:justify-start p-4 rounded-lg">
      <div
        v-if="lastProductsIsLoading"
        class="loader-container w-fit flex justify-center items-center m-auto"
      >
        <div class="lds-hourglass"></div>
      </div>
      <ProductCard
        v-else-if="!lastProductsIsLoading && lastProducts.length > 0"
        v-for="product in lastProducts"
        :key="product.id"
        :product="product"
        :id="product.id"
        :image="product.image"
        :brand="product.brand"
        :generic-name="product.name"
        :nutriscore="product.nutriscore"
        :nova="product.nova"
        :category="product.category"
      />
      <div v-else class="w-full">
        <h3 class="text-center text-2xl font-semibold">Aucun produit trouvé</h3>
      </div>
    </div>
  </section>
  <section id="last-section">
    <img
      src="/logo.png"
      alt="logo de l'application"
      class="h-auto w-auto max-w-[300px] mx-auto mb-24 opacity-75"
    />
  </section>
</template>

<style scoped>
h1 {
  font-family: 'Grand Hotel', cursive;
}

h2::first-letter {
  font-weight: bold;
}

#search-container {
  padding: calc(var(--app-padding-x) * 2) var(--app-padding-x);
  background: radial-gradient(circle, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.5) 50%);
  border-radius: 10px;
  backdrop-filter: blur(5px);
}

#search-bar {
  position: sticky;
  width: 100%;
  max-width: 1024px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 1rem;
  z-index: 99;
  transition: top 0.25s;
}

.search-bar-icon {
  height: auto;
  width: 0.875rem;
  filter: contrast(0.5);
}

#open-scanner .search-bar-icon {
  width: 1.4rem;
}

.radio-toolbar label {
  background-color: #343a40;
}

.radio-toolbar label:hover {
  background-color: #00bd7e;
}

#search-results,
#last-products > div {
  background-color: rgb(255 255 255 / 0.5);
}

.product {
  width: 48%;
  margin-bottom: 5%;
}

.product:nth-of-type(odd) {
  margin-right: 4%;
}

.cookies {
  background-image: url(https://i.ytimg.com/vi/D1jzT02IBRA/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGGUgWShUMA8=&rs=AOn4CLC8xWb_RD5Ml98u-0_FNgJbU1WlHQ);
  background-size: 105% auto;
  background-position: 5% 0%;
}

.text-highlighted {
  background-color: hsla(160, 100%, 37%, 0.6);
}

.text-highlighted.red {
  background-color: rgb(205, 92, 92, 0.8);
}

#total-products {
  font-family: 'Grand Hotel', cursive;
  color: transparent;
  background: linear-gradient(to left, #5d576b80, #2f2c36);
  background-clip: text;
}

#product-detail > div > div:nth-of-type(1),
#product-detail .scores > div,
#product-detail > div > div:nth-of-type(2) > *:nth-child(n + 2) {
  filter: blur(1.5px);
  pointer-events: none;
}

#video-container::before {
  content: '';
  position: absolute;
  left: 0;
  width: 100%;
  aspect-ratio: 2/1;
  background-color: hsla(160, 100%, 37%, 1);
  transform: rotateZ(2deg);
  border-radius: 10px;
  z-index: -1;
}

#video-container {
  z-index: 1;
}

#alternatives-functionality {
  margin-left: calc(var(--app-padding-x) * -1);
  margin-right: calc(var(--app-padding-x) * -1);
  padding: 2rem var(--app-padding-x) 0 var(--app-padding-x);
  background-color: rgb(255 255 255 / 0.5);
  backdrop-filter: blur(5px);
}

/* Container des alternatives */
#alternatives-functionality > aside {
  margin-bottom: 0;
}

@media (min-width: 768px) {
  .product {
    width: 19%;
    aspect-ratio: auto;
    margin-bottom: 0;
  }

  .product:nth-of-type(odd) {
    margin-right: unset;
  }

  #search-results .product:nth-of-type(even),
  #last-products .product:nth-of-type(even) {
    margin-left: 1.25%;
    margin-right: 1.25%;
  }

  #alternatives-functionality {
    margin-left: 0;
    margin-right: 0;
    background: radial-gradient(circle, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.5) 50%);
    border-radius: 0.5rem;
  }
}

@media (min-width: 1024px) {
  #search-container {
    padding: calc(var(--app-padding-x) * 2) var(--app-padding-x);
    border-radius: 100px;
  }

  .product {
    aspect-ratio: 2/3;
  }
}
</style>
