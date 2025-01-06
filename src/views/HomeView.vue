<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProducts } from '../composables/useProducts'
import ProductCard from '/src/components/ProductCard.vue'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const router = useRouter()

const {
  searchProducts,
  productsIsLoading,
  products,
  fetchProduct,
  productIsLoading,
  product,
  fetchSuggestedProducts,
  suggestedProducts,
  suggestedProductsIsLoading,
  fetchLastProduct,
  lastProductsIsLoading,
  lastProducts
} = useProducts()
const moreProductsLink = ref<{ name: string; to: string } | null>(null)

onMounted(async () => {
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
        await searchProducts(searchInput.value, null, 'complete')
        moreProductsLink.value = { name: 'Plus de résultats', to: '/search' }
      }
    }, 1000)
  })

  await fetchProduct('8000500310427')
  fetchSuggestedProducts()
  fetchLastProduct()
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
    <h3 class="text-lg font-thin text-center">Manger (plus) sain</h3>
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
          placeholder="Entrez un nom de produit, un code-barres, une marque ou un type d'aliment"
          class="block w-full px-12 p-2.5 text-ellipsis bg-gray-50 border-4 text-gray-900 text-sm rounded-full outline-0 focus:ring-gray-400 focus:border-gray-400"
          required
        />
      </div>
    </div>
    <div
      :class="`${products.length > 0 || productsIsLoading ? 'max-h-[750px] md:max-h-[400px]' : 'max-h-0'} overflow-hidden transition-all duration-300 ease-in-out`"
    >
      <div id="search-results" class="relative flex flex-wrap justify-between p-4 bg-neutral-200 rounded-lg">
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
            class="h-full w-full flex items-center justify-center p-3 md:text-4xl text-center text-white font-semibold bg-[#00bd7e] rounded-lg"
          >
            +
          </RouterLink>
        </article>
      </div>
    </div>
    <h3 id="total-products" class="my-8 text-2xl lg:text-3xl text-center">
      + de 1 082 462 produits référencés
    </h3>
  </section>
  <section id="about" class="mb-24">
    <article class="mb-8">
      <iframe
        src="https://www.youtube.com/embed/D1jzT02IBRA"
        class="w-full aspect-[2/1] border-[3px] rounded-xl"
        title="Open Food Facts - Présentation"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </article>
    <article>
      <span class="text-highlighted py-1 font-thin">
        NutriVérif est alimentée par "Open Food Facts", une base de données de produits alimentaires
        créée par tous et pour tous.
      </span>
      <div class="my-2"></div>
      <span class="text-highlighted py-1 font-thin">
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
    </article>
  </section>
  <section id="score-explanations" class="mb-24">
    <h2 class="title mb-12 text-2xl lg:text-3xl">
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
    <h2 class="title mb-12 text-2xl lg:text-3xl text-center">
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
        class="w-full md:w-2/4 flex items-center justify-center bg-white rounded-xl"
      >
        <div class="md:w-full my-[50px]">
          <div
            v-if="productIsLoading"
            class="loader-container h-full flex justify-center items-center"
          ></div>
          <img
            id="product-img"
            :src="product.image"
            :alt="product.generic_name"
            class="h-auto w-auto m-auto"
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
              <h3 class="title text-xl md:text-2xl uppercase">
                <span v-if="product.brand" id="brand" class="text-[#00bd7e]"
                  >{{ product.brand }} -
                </span>
                <span v-if="product.generic_name" id="generic-name">{{
                  product.generic_name
                }}</span>
              </h3>
              <h4 v-if="product.lastUpdate" class="text-sm">
                Dernière mise à jour : <span id="last-update">{{ product.lastUpdate }}</span>
              </h4>
            </div>
            <div>
              <div class="scores">
                <img
                  id="nutriscore-img"
                  class="max-w-[100px] md:max-w-[115px] mt-2"
                  :src="
                    'https://static.openfoodfacts.org/images/attributes/dist/nutriscore-' +
                    product.nutriscore +
                    '-new-fr.svg'
                  "
                  :alt="'Nutriscore : ' + product.nutriscore"
                />
                <div class="flex items-end">
                  <img
                    id="nova-group-img"
                    class="max-h-[50px] md:max-h-[60px] mt-2 opacity-25"
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
                class="flex flex-wrap opacity-25"
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
              <h4 v-if="product.calories100g" class="mt-4 font-semibold">
                Calories pour 100 grammes / 100 millilitres :
              </h4>
              <h5 id="calories-100g">{{ product.calories100g }}</h5>
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
                <a :href="product.link" target="_blank" id="link" class="underline">{{
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
    <aside v-if="suggestedProducts.length || suggestedProductsIsLoading">
      <section
        id="more-products"
        class="relative w-full flex flex-wrap lg:flex-nowrap items-stretch lg:items-center justify-between p-4 bg-neutral-200 rounded-xl"
      >
        <h2 class="title w-full lg:w-1/4 mt-4 mb-8 lg:m-0 text-center text-3xl lg:text-2xl">
          Alternatives
        </h2>
        <div
          v-if="suggestedProductsIsLoading"
          class="loader-container md:absolute h-full w-full flex justify-center items-center"
        >
          <div class="lds-hourglass"></div>
        </div>
        <div class="relative w-full lg:w-3/4 flex flex-wrap md:flex-nowrap justify-end">
          <ProductCard
            v-for="product in suggestedProducts"
            :key="product.id"
            :id="product.id"
            :image="product.image"
            :brand="product.brand"
            :name="product.name"
            :nutriscore="product.nutriscore"
            :nova="product.nova"
          />
        </div>
      </section>
    </aside>
    <span class="inline-block my-8">
      Trouvez des options <span class="text-highlighted">plus saines</span> et faites de chaque
      choix un pas vers une meilleure santé.</span
    >
  </section>
  <section id="last-products" class="mb-24">
    <h2 class="title mb-12 text-2xl lg:text-3xl text-right">
      Produits <span class="text-[#00bd7e]">récemment</span> ajoutés
    </h2>
    <div class="relative flex flex-wrap justify-between p-4 bg-neutral-200 rounded-lg">
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
        :nova="product.nova"
      />
    </div>
  </section>
  <section id="last-section">
    <img
      src="/logo.png"
      alt="logo de l'application"
      class="h-auto w-auto max-w-[300px] mx-auto mb-24 contrast-0"
    />
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
  margin-bottom: 5%;
}

.product:nth-of-type(odd) {
  margin-right: 4%;
}

.text-highlighted {
  background-color: hsla(160, 100%, 37%, 0.6);
}

#total-products {
  font-family: 'Grand Hotel', cursive;
  color: transparent;
  background: linear-gradient(to left, #5d576b80, #2f2c36);
  background-clip: text;
}

#more-products > .title {
  font-family: 'Grand Hotel', cursive;
  font-size: xx-large;
}

#more-products > .title::first-letter {
  color: indianred;
}

#more-products .product {
  width: 48%;
  margin-bottom: 5%;
}

#more-products .product:nth-of-type(odd) {
  margin-right: 4%;
}

#product-detail > div > div:nth-of-type(1),
#product-detail .scores > div,
#product-detail > div > div:nth-of-type(2) > *:nth-child(n + 2) {
  filter: blur(1.5px);
  pointer-events: none;
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

  #more-products > .title {
    font-size: xxx-large;
  }

  #more-products .product {
    width: 23.75%;
    margin-bottom: 0;
  }

  #more-products .product:nth-of-type(odd) {
    margin-left: 1.25%;
    margin-right: 1.25%;
  }
}
</style>
