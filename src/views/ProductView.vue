<script setup>
import { onBeforeMount, onMounted, onUnmounted, reactive, watch } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import ProductCard from '/src/components/ProductCard.vue'

const router = useRouter()
const route = useRoute()

const product = reactive({
  id: null,
  image: null,
  brand: null,
  generic_name: null,
  categories: [],
  lastUpdate: null,
  nutriscore: null,
  novaGroup: null,
  ingredients: null,
  calories100g: null,
  manufacturingPlace: null,
  productSheet: null
})

const moreProducts = reactive([])

const fetchData = async (url) => {
  try {
    const response = await fetch(url)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erreur lors de la récupération des données :', error)
    return null
  }
}

const resetProduct = () => {
  Object.assign(product, {
    id: null,
    image: null,
    brand: null,
    generic_name: null,
    categories: [],
    lastUpdate: null,
    nutriscore: null,
    novaGroup: null,
    ingredients: null,
    calories100g: null,
    manufacturingPlace: null,
    productSheet: null
  })
}

const fetchProduct = async () => {
  resetProduct() // Reset the product data before fetching new data

  const url = `https://world.openfoodfacts.org/api/v3/product/${route.params.id}.json`
  const data = await fetchData(url)

  if (!data || !data.product) {
    router.replace({ name: 'NotFound' })
    return
  }

  const p = data.product
  Object.assign(product, {
    id: p.id,
    image: p.image_front_url || '/logo.png',
    brand: p.brands,
    generic_name: p.generic_name_fr,
    categories: p.categories_hierarchy,
    lastUpdate: new Date(p.last_updated_t * 1000).toLocaleDateString('fr-FR'),
    nutriscore: p.nutriscore_grade,
    novaGroup: p.nova_group,
    ingredients: p.ingredients_text_fr,
    calories100g: p.nutriments?.['energy-kcal_100g'],
    manufacturingPlace: p.manufacturing_places,
    productSheet: p.link
  })

  if (product.nutriscore !== 'a') fetchMoreProducts() // Fetch similar products if Nutriscore isn't A
}

// Fetch similar products
const fetchMoreProducts = async () => {
  if (!product.categories?.length) return

  const fields =
    'id,categories_hierarchy,image_front_url,brands,generic_name_fr,nutriscore_grade,nova_group,last_updated_t,ingredients_text_fr,nutriments,manufacturing_places,link'
  const url = `https://world.openfoodfacts.org/api/v2/search?categories_tags=${product.categories.slice(0, 4).join(',')}&fields=${fields}&sort_by=nutriscore_score,popularity_key&page_size=4&action=process&json=1`
  const data = await fetchData(url)

  if (data?.products) {
    moreProducts.length = 0 // Reset the moreProducts array before adding new data
    data.products
      .filter((p) => p.id !== product.id)
      .slice(0, 3)
      .forEach((p) => {
        moreProducts.push({
          id: p.id,
          image: p.image_front_url || '/logo.png',
          brand: p.brands,
          generic_name: p.generic_name_fr,
          categories: p.categories_hierarchy,
          lastUpdate: new Date(p.last_updated_t * 1000).toLocaleDateString('fr-FR'),
          nutriscore: p.nutriscore_grade,
          novaGroup: p.nova_group,
          ingredients: p.ingredients_text_fr,
          calories100g: p.nutriments?.['energy-kcal_100g'],
          manufacturingPlace: p.manufacturing_places,
          productSheet: p.link
        })
      })
  }
}

// Update product when route changes
const updateProduct = async (productId) => {
  resetProduct() // Reset product data before updating

  const foundProduct = moreProducts.find((p) => p.id === productId)

  if (foundProduct) {
    // Clear previous product data and assign new data
    Object.assign(product, { ...foundProduct })
    fetchMoreProducts() // Re-fetch similar products for the new product
  } else {
    await fetchProduct() // If no similar product, fetch the new product directly
  }
}

onBeforeMount(fetchProduct) // Fetch product on initial mount

onMounted(() => {
  document.querySelector('body').style.backgroundColor = 'rgb(243, 244, 246, 1)'
})

onUnmounted(() => {
  document.querySelector('body').style.backgroundColor = 'rgb(255, 255, 255, 1)'
})

onBeforeRouteUpdate((to) => {
  updateProduct(to.params.id) // Update product when route changes
})

watch(
  () => route.params.id,
  (newId) => {
    updateProduct(newId) // Handle product updates when the route params change
  }
)
</script>

<template>
  <div
    :key="route.params.id"
    id="product-container"
    class="md:min-h-[calc(100vh-344px)] flex flex-wrap justify-between md:flex-nowrap flex-col md:flex-row"
  >
    <section
      id="product-images-container"
      class="w-full md:w-2/4 flex items-center justify-center bg-white rounded-xl"
    >
      <div class="md:w-full my-[50px]">
        <div v-if="!product.image" class="loader-container h-full flex justify-center items-center">
          <img src="/logo.png" class="h-auto w-auto m-auto opacity-50" />
        </div>
        <img
          v-if="product.image"
          id="product-img"
          :src="product.image"
          :alt="product.generic_name"
          class="h-auto w-auto m-auto"
        />
      </div>
    </section>

    <section id="product-details-container" class="relative w-full md:w-2/4 max-md:my-8 md:pl-6">
      <div
        v-if="!product.lastUpdate"
        class="loader-container md:absolute h-full w-full flex justify-center items-center"
      >
        <div class="lds-hourglass"></div>
      </div>
      <div id="product-detail" class="h-full">
        <div class="h-full flex flex-col justify-evently">
          <div>
            <h1 class="title text-xl md:text-2xl uppercase">
              <span v-if="product.brand" id="brand" class="text-[#00bd7e]"
                >{{ product.brand }} -
              </span>
              <span v-if="product.generic_name" id="generic-name">{{ product.generic_name }}</span>
            </h1>
            <h3 v-if="product.lastUpdate" class="text-sm">
              Dernière mise à jour : <span id="last-update">{{ product.lastUpdate }}</span>
            </h3>
          </div>
          <div>
            <div>
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
                  class="max-h-[50px] md:max-h-[60px] mt-2"
                  :src="
                    'https://static.openfoodfacts.org/images/attributes/dist/nova-group-' +
                    product.novaGroup +
                    '.svg'
                  "
                  :alt="'Groupe Nova : ' + product.novaGroup"
                />
              </div>
            </div>
            <h3 v-if="product.ingredients" class="mt-4 font-semibold">Ingrédients :</h3>
            <h4 v-if="product.ingredients" id="ingredients">{{ product.ingredients }}</h4>
            <h3 v-if="product.calories100g" class="mt-4 font-semibold">
              Calories pour 100 grammes :
            </h3>
            <h4 v-if="product.calories100g" id="calories-100g">{{ product.calories100g }}</h4>
            <h3 v-if="product.manufacturingPlace" class="mt-4 font-semibold">
              Lieu de fabrication :
            </h3>
            <h4 v-if="product.manufacturingPlace" id="manufacturing-place">
              {{ product.manufacturingPlace }}
            </h4>
            <h3 v-if="product.id" class="mt-4 font-semibold">Code-barres :</h3>
            <h4 v-if="product.id" id="barcode">{{ product.id }}</h4>
            <h3 v-if="product.productSheet" class="mt-4 font-semibold">Plus d'infos :</h3>
            <h4 v-if="product.productSheet">
              <a :href="product.productSheet" id="product-sheet" class="underline">{{
                product.productSheet
              }}</a>
            </h4>
          </div>
        </div>
      </div>
    </section>
  </div>

  <aside v-if="moreProducts.length" class="mt-16">
    <section
      id="more-products"
      class="w-full flex flex-wrap lg:flex-nowrap items-center justify-between p-8 lg:px-16 bg-white rounded-xl"
    >
      <h2 class="title w-full lg:w-1/4 text-center lg:text-left text-2xl">Alternatives</h2>
      <ProductCard
        v-for="p in moreProducts"
        :key="p.id"
        :id="p.id"
        :image="p.image"
        :brand="p.brand"
        :name="p.generic_name"
        :nutriscore="p.nutriscore"
        :nova="p.novaGroup"
        :class="['w-full max-w-[300px] lg:max-w-[250px] mt-8 lg:mt-0 mx-auto lg:ml-8']"
      />
    </section>
  </aside>
</template>

<style scoped>
#product-details-container .lds-hourglass:after {
  margin: 8px;
  border: 32px solid #fff;
  border-color: black transparent var(--color-green) transparent;
}

#more-products > .title {
  font-family: 'Grand Hotel', cursive;
  font-size: xx-large;
}

#more-products > .title::first-letter {
  color: indianred;
}

@media (min-width: 768px) {
  #more-products > .title {
    font-size: xxx-large;
  }
}
</style>
