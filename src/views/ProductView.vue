<script setup lang="ts">
import { onBeforeMount, computed, reactive, ref } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import { useProductsStore } from '../stores/products'
import { franc } from 'franc-min'
import ProductCard from '/src/components/ProductCard.vue'

interface Product {
  id: string
  image: string
  brand: string
  generic_name: string
  categories: string[]
  lastUpdate: string
  nutriscore: string
  novaGroup: string
  quantity: string
  ingredients: string
  calories100g: string
  nutrient_levels: string
  manufacturingPlace: string
  link: string
}

interface Products {
  id: string
  image?: string
  brand?: string
  name?: string
  nutriscore?: number | string
  nova?: number | string
}

const router = useRouter()
const route = useRoute()
const productsStore = useProductsStore()

const product = reactive<Product>({
  id: '',
  image: '',
  brand: '',
  generic_name: '',
  categories: [],
  lastUpdate: '',
  nutriscore: '',
  novaGroup: '',
  quantity: '',
  ingredients: '',
  calories100g: '',
  nutrient_levels: '',
  manufacturingPlace: '',
  link: ''
})

const input = computed<string>({
  get: () => productsStore.getInput,
  set: (val) => productsStore.updateInput(val)
})

const page = computed<number>({
  get: () => productsStore.getPage,
  set: (val) => productsStore.updatePage(val)
})

const products = computed<Products[]>({
  get: () => productsStore.getProducts,
  set: (val) => productsStore.updateProducts(val)
})

const moreProducts = reactive<Product[]>([])
const moreProductsIsLoading = ref<boolean>(false)

const fetchData = async (url: string): Promise<any | null> => {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`status : ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la récupération des données : ', error)
    return null
  }
}

const resetProduct = () => {
  Object.assign(product, {
    id: '',
    image: '',
    brand: '',
    generic_name: '',
    categories: [],
    lastUpdate: '',
    nutriscore: 'unknown',
    novaGroup: 'unknown',
    quantity: '',
    ingredients: '',
    calories100g: '',
    nutrient_levels: [],
    manufacturingPlace: '',
    link: ''
  })
}

const fetchProduct: Function = async () => {
  resetProduct() // Reset the product data before fetching new data

  const url: string = `https://world.openfoodfacts.org/api/v3/product/${route.params.id}.json`
  const data: any = await fetchData(url)

  if (!data?.product) {
    router.replace({ name: 'NotFound' })
    return
  }

  const productFound: {
    id: string
    image_front_url: string
    brands: string
    generic_name_fr: string
    categories: string
    last_updated_t: number
    nutriscore_grade: string
    nova_group: string
    quantity: string
    ingredients_text_with_allergens_fr: string
    nutriments: {
      'energy-kcal_100g': string
    }
    nutrient_levels: string
    manufacturing_places: string
    link: string
  } = data.product

  Object.assign(product, {
    id: productFound.id || 'unknown',
    image: productFound.image_front_url || '/logo.png',
    brand: productFound.brands || 'Marque inconnue',
    generic_name: productFound.generic_name_fr || 'Fiche non finalisée',
    categories: productFound.categories?.split(',') || [],
    lastUpdate: new Date((productFound.last_updated_t ?? Date.now()) * 1000).toLocaleDateString(
      'fr-FR'
    ),
    nutriscore: productFound.nutriscore_grade || 'unknown',
    novaGroup: productFound.nova_group || 'unknown',
    quantity: productFound.quantity || '',
    ingredients: productFound.ingredients_text_with_allergens_fr || '',
    calories100g: productFound.nutriments?.['energy-kcal_100g'] || '',
    nutrient_levels: productFound.nutrient_levels || [],
    manufacturingPlace: productFound.manufacturing_places || '',
    link: productFound.link || ''
  })

  if (product.nutriscore !== 'a' || product.novaGroup !== 'a') fetchMoreProducts() // Fetch similar products if Nutriscore isn't A
}

const isFrench = (text: string) => {
  return franc(text) === 'fra'
}

const filteredCategories = computed<string[]>(() => {
  if (!product.categories?.length) return []
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
const searchByCategory: Function = async (category: string) => {
  input.value = category // Set the search input to the selected category
  page.value = 1 // Reset the page to 1
  products.value.length = 0 // Clear the products array before adding new data

  const fields: string =
    'id,image_front_small_url,brands,generic_name_fr,nutriscore_grade,nova_group'
  const url: string = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${category}&fields=${fields}&sort_by=popularity_key&page_size=20&page=1&search_simple=1&action=process&json=1`

  try {
    const response: any = await fetch(url)
    const data: any = await response.json()
    data.products.forEach(
      (product: {
        id: string
        image_front_small_url: string
        brands: string
        generic_name_fr: string
        nutriscore_grade: string
        nova_group: string
      }) => {
        products.value.push({
          id: product.id,
          image: product.image_front_small_url,
          brand: product.brands,
          name: product.generic_name_fr,
          nutriscore: product.nutriscore_grade,
          nova: product.nova_group
        })
      }
    )

    router.push({ name: 'search' })
  } catch (error: any) {
    console.error('Error fetching data:', error.message)
  }
}

// Fetch similar products
const fetchMoreProducts: Function = async () => {
  if (!product.categories?.length) return

  moreProductsIsLoading.value = true
  const fields: string =
    'id,categories,image_front_url,brands,generic_name_fr,nutriscore_grade,nova_group,last_updated_t,quantity,ingredients_text_with_allergens_fr,nutriments,manufacturing_places,link,completeness'
  const url: string = `https://world.openfoodfacts.org/api/v2/search?categories_tags=${product.categories.slice(0, 5).join(',')}&fields=${fields}&sort_by=nutriscore_score,nova_group,popularity_key&page_size=100&action=process&json=1`

  const data = await fetchData(url)

  if (data?.products) {
    moreProducts.length = 0 // Reset the moreProducts array before adding new data
    data.products
      .filter(
        (p: { id: string; completeness?: number }) =>
          p.id !== product.id && (p.completeness ?? 0) >= 0.35
      )
      .sort((a: { nutriscore_grade?: string }, b: { nutriscore_grade?: string }) =>
        a.nutriscore_grade?.localeCompare(b.nutriscore_grade ?? 'unknown')
      )
      .slice(0, 3)
      .forEach(
        (product: {
          id: string
          image_front_url: string
          brands: string
          generic_name_fr: string
          categories: string
          last_updated_t: number
          nutriscore_grade: string
          nova_group: string
          quantity: string
          ingredients_text_with_allergens_fr: string
          nutriments: {
            'energy-kcal_100g': string
          }
          nutrient_levels: string
          manufacturing_places: string
          link: string
        }) => {
          moreProducts.push({
            id: product.id || 'unknown',
            image: product.image_front_url || '/logo.png',
            brand: product.brands || 'Marque inconnue',
            generic_name: product.generic_name_fr || 'Fiche non finalisée',
            categories: product.categories?.split(',') || [],
            lastUpdate: new Date((product.last_updated_t ?? Date.now()) * 1000).toLocaleDateString(
              'fr-FR'
            ),
            nutriscore: product.nutriscore_grade || 'unknown',
            novaGroup: product.nova_group || 'unknown',
            quantity: product.quantity || '',
            ingredients: product.ingredients_text_with_allergens_fr || '',
            calories100g: product.nutriments?.['energy-kcal_100g'] || '',
            nutrient_levels: product.nutrient_levels || '',
            manufacturingPlace: product.manufacturing_places || '',
            link: product.link || ''
          })
        }
      )
  }

  moreProductsIsLoading.value = false
}

// Update product when route changes
const updateProduct = async (productId: string) => {
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
  updateProduct(Array.isArray(to.params.id) ? to.params.id[0] : to.params.id) // Update product when route changes
})
</script>

<template>
  <div
    :key="Array.isArray(route.params.id) ? route.params.id[0] : route.params.id"
    id="product-container"
    class="md:min-h-[calc(100vh-344px)] flex flex-wrap justify-between md:flex-nowrap flex-col md:flex-row md:mb-8"
  >
    <section
      id="product-images-container"
      class="w-full md:w-2/4 flex items-center justify-center bg-white rounded-xl"
    >
      <div class="md:w-full my-[50px]">
        <div v-if="!product.image" class="loader-container h-full flex justify-center items-center">
          <img
            src="/logo.png"
            class="h-auto w-auto m-auto opacity-50"
            alt="Image du produit indisponible"
          />
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
        v-if="!product.id"
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
            <h3 v-if="product.link" class="mt-4 font-semibold">Plus d'infos :</h3>
            <h4 v-if="product.link">
              <a :href="product.link" id="link" class="underline">{{ product.link }}</a>
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

  <aside v-if="moreProducts.length || moreProductsIsLoading" class="my-16">
    <section
      id="more-products"
      class="relative w-full flex flex-wrap lg:flex-nowrap items-stretch lg:items-center justify-between p-4 md:p-8 lg:px-16 bg-neutral-200 rounded-xl"
    >
      <h2 class="title w-full lg:w-1/4 mb-8 lg:mb-0 text-center lg:text-left text-3xl lg:text-2xl">
        Alternatives
      </h2>
      <div
        v-if="moreProductsIsLoading"
        class="loader-container md:absolute h-full w-full flex justify-center items-center"
      >
        <div class="lds-hourglass"></div>
      </div>
      <ProductCard
        v-for="product in moreProducts"
        :key="product.id"
        :id="product.id"
        :image="product.image"
        :brand="product.brand"
        :name="product.generic_name"
        :nutriscore="product.nutriscore"
        :nova="product.novaGroup"
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

#more-products .product {
  width: 48%;
  margin-bottom: 5%;
}

@media (min-width: 768px) {
  #more-products .product {
    margin-left: unset;
    margin-right: unset;
    margin-bottom: 0;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  #more-products .product {
    width: 32%;
  }

  #more-products .product:nth-of-type(3n + 2) {
    margin-left: 2%;
    margin-right: 2%;
  }
}

@media (min-width: 1024px) {
  #more-products > .title {
    font-size: xxx-large;
  }

  #more-products .product {
    width: 18.6%;
  }

  #more-products .product:nth-of-type(2n + 1) {
    margin-right: unset;
  }

  #more-products .product:nth-of-type(5n + 2) {
    margin-left: 1.5%;
    margin-right: 1.5%;
  }

  #more-products .product:nth-of-type(5n + 4) {
    margin-left: 1.5%;
    margin-right: 1.5%;
  }
}
</style>
