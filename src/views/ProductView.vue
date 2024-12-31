<script setup>
import { onBeforeMount, computed, reactive, watch } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import { useProductsStore } from '../stores/products.ts'
import { franc } from 'franc-min'
import ProductCard from '/src/components/ProductCard.vue'

const router = useRouter()
const route = useRoute()
const productsStore = useProductsStore()

const product = reactive({
  id: null,
  image: null,
  brand: null,
  generic_name: null,
  categories: [],
  lastUpdate: null,
  nutriscore: 'unknown',
  novaGroup: 'unknown',
  quantity: null,
  ingredients: null,
  calories100g: null,
  nutrient_levels: null,
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
    nutriscore: 'unknown',
    novaGroup: 'unknown',
    quantity: null,
    ingredients: null,
    calories100g: null,
    nutrient_levels: null,
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
    categories: p.categories.split(','),
    lastUpdate: new Date(p.last_updated_t * 1000).toLocaleDateString('fr-FR'),
    nutriscore: p.nutriscore_grade || 'unknown',
    novaGroup: p.nova_group || 'unknown',
    quantity: p.quantity,
    ingredients: p.ingredients_text_with_allergens_fr,
    calories100g: p.nutriments?.['energy-kcal_100g'],
    nutrient_levels: p.nutrient_levels,
    manufacturingPlace: p.manufacturing_places,
    productSheet: p.link
  })

  if (product.nutriscore !== 'a') fetchMoreProducts() // Fetch similar products if Nutriscore isn't A
}

const isFrench = (text) => {
  return franc(text) === 'fra'
}

const filteredCategories = computed(() => {
  if (!product.categories.length) return []
  return product.categories
    .filter((category) => {
      // Si la catégorie commence par 'fr:', elle est incluse
      // Si elle ne commence pas par 'fr:', on vérifie si c'est du français
      return category.trim().startsWith('fr:') || isFrench(category)
    })
    .map((category) => {
      // Si la catégorie commence par 'fr:', on enlève le préfixe 'fr:'
      return category.trim().startsWith('fr:')
        ? category.trim().replace(/fr:/, '').trim()
        : category
    })
})

// Search for products by category
const searchByCategory = async (category) => {
  let input = computed({
    get: () => productsStore.getInput,
    set: (val) => productsStore.updateInput(val)
  })

  let page = computed({
    get: () => productsStore.getPage,
    set: (val) => productsStore.updatePage(val)
  })

  let products = computed({
    get: () => productsStore.getProducts,
    set: (val) => productsStore.updateProducts(val)
  })

  input.value = category // Set the search input to the selected category
  page.value = 1 // Reset the page to 1
  products.value.length = 0 // Clear the products array before adding new data

  const fields = 'id,image_front_small_url,brands,generic_name_fr,nutriscore_grade,nova_group'
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${category}&fields=${fields}&sort_by=popularity_key&page_size=20&page=1&search_simple=1&action=process&json=1`

  try {
    const response = await fetch(url)
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

    router.push({ name: 'search' })
  } catch (error) {
    console.error('Error fetching data:', error.message)
  }
}

// Fetch similar products
const fetchMoreProducts = async () => {
  if (!product.categories?.length) return

  const fields =
    'id,categories,image_front_url,brands,generic_name_fr,nutriscore_grade,nova_group,last_updated_t,quantity,ingredients_text_with_allergens_fr,nutriments,manufacturing_places,link'
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
          categories: p.categories.split(','),
          lastUpdate: new Date(p.last_updated_t * 1000).toLocaleDateString('fr-FR'),
          nutriscore: p.nutriscore_grade || 'unknown',
          novaGroup: p.nova_group || 'unknown',
          quantity: p.quantity,
          ingredients: p.ingredients_text_with_allergens_fr,
          calories100g: p.nutriments?.['energy-kcal_100g'],
          nutrientLevels: p.nutrient_levels,
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
            <div v-if="product.nutrient_levels" id="nutrient-levels" class="flex flex-wrap">
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
                  nutrient === 'fat'
                    ? 'matieres grasses'
                    : nutrient === 'salt'
                      ? 'sel'
                      : nutrient === 'saturated-fat'
                        ? 'graisses saturées'
                        : nutrient === 'sugars'
                          ? 'sucres'
                          : ''
                }}
              </span>
            </div>
            <h3 v-if="product.quantity" class="mt-8 font-semibold">Quantité :</h3>
            <h4 v-if="product.quantity" id="quantity">{{ product.quantity }}</h4>
            <h3 v-if="product.ingredients" class="mt-4 font-semibold">Ingrédients :</h3>
            <h4 v-if="product.ingredients" v-html="product.ingredients" id="ingredients"></h4>
            <h3 v-if="product.calories100g" class="mt-4 font-semibold">
              Calories pour 100 grammes / 100 millilitres :
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
            <div v-if="filteredCategories.length" id="tags" class="mt-4">
              <button
                v-for="category in filteredCategories"
                :key="category"
                class="tag mt-2 mr-2 py-2 px-3 text-sm font-semibold text-white bg-neutral-400 text-white rounded-full"
                @click="searchByCategory(category)"
              >
                #{{ category }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <aside v-if="moreProducts.length" class="mt-16">
    <section
      id="more-products"
      class="w-full flex flex-wrap lg:flex-nowrap items-center justify-between p-8 lg:px-16 bg-neutral-200 rounded-xl"
    >
      <h2 class="title w-full lg:w-1/4 text-center lg:text-left text-3xl lg:text-2xl">
        Alternatives
      </h2>
      <ProductCard
        v-for="p in moreProducts"
        :key="p.id"
        :id="p.id"
        :image="p.image"
        :brand="p.brand"
        :name="p.generic_name"
        :nutriscore="p.nutriscore"
        :nova="p.novaGroup"
        :class="[
          'w-full lg:w-[23%] max-w-[300px] lg:max-w-[250px] mt-8 lg:mt-0 mx-auto lg:ml-[2%]'
        ]"
      />
    </section>
  </aside>
</template>

<style>
.allergen {
  font-weight: bold;
  color: indianred;
}
</style>

<style scoped>
#product-details-container .lds-hourglass:after {
  margin: 8px;
  border: 32px solid #fff;
  border-color: black transparent var(--color-green) transparent;
}

.tag {
  transition: all 0.35s ease-in-out;
}

.tag:hover {
  color: #000;
  background-color: whitesmoke;
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
