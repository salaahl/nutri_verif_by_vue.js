<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import { useProducts } from '../composables/useProducts'
import ProductCard from '/src/components/ProductCard.vue'

const router = useRouter()
const route = useRoute()

const {
  productsIsLoading,
  searchProducts,
  product,
  productIsLoading,
  fetchSuggestedProducts,
  suggestedProductsIsLoading,
  suggestedProducts,
  fetchProduct,
  novaDescription,
  ajrSelected,
  ajrValues
} = useProducts()

const nutrimentsKeys = [
  'energy-kcal-100g',
  'fat-100g',
  'saturated-fat-100g',
  'carbohydrates-100g',
  'sugars-100g',
  'salt-100g',
  'fiber-100g',
  'proteins-100g',
  'energy-kcal_serving',
  'fat_serving',
  'saturated-fat_serving',
  'carbohydrates_serving',
  'sugars_serving',
  'salt_serving',
  'fiber_serving',
  'proteins_serving'
]

interface Product {
  categories?: string[]
}

async function getTranslatedCategories(product: Product): Promise<string[]> {
  if (!product.categories?.length) return []

  const cleanCategory = (cat: string, langPrefix: string) =>
    cat
      .trim()
      .replace(new RegExp(`^${langPrefix}:`), '')
      .replace(/-/g, ' ')
      .trim()

  const frenchCategories: string[] = product.categories
    .filter((c) => c.startsWith('fr:'))
    .map((c) => cleanCategory(c, 'fr'))

  const englishCategories: string[] = product.categories
    .filter((c) => c.startsWith('en:'))
    .map((c) => cleanCategory(c, 'en'))

  // Limite de 6 catégories TTC
  const categoriesToTranslate: string = englishCategories
    .slice(0, 6 - frenchCategories.length)
    .join('<SEP>')

  if (!categoriesToTranslate) return frenchCategories

  let translatedCategories: string[] = []

  try {
    const response = await fetch('https://jokes-api-platform.onrender.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: categoriesToTranslate, target_lang: 'FR' })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    translatedCategories = (data.translations?.[0]?.text.split('<SEP>') ?? []).map((c: string) =>
      c.trim()
    )
  } catch (error) {
    // Je conserve quand même les catégories anglaises
    translatedCategories = englishCategories.slice(0, 6 - frenchCategories.length)
    console.error('Erreur pendant la traduction :', error)
  }

  return [...frenchCategories, ...translatedCategories]
}

const searchProductsByCategory: Function = async (category: string) => {
  productsIsLoading.value = true
  await searchProducts(category, null, 'complete')
  productsIsLoading.value = false

  router.push({ name: 'search' })
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
    serving_size: '',
    ingredients: '',
    nutriments: {},
    nutrient_levels: [],
    manufacturingPlace: '',
    link: ''
  })
}

// Update product when route changes
const updateProduct = async (productId: string) => {
  resetProduct()

  await fetchProduct(productId)
  fetchSuggestedProducts(productId, product.category)
}

onBeforeMount(async () => {
  await fetchProduct(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)
  product.categories = await getTranslatedCategories(product)

  if (product.nutriscore !== 'a' || product.novaGroup !== 'a')
    fetchSuggestedProducts(product.id, product.category)
})

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
      class="md:sticky top-[5vh] md:h-[90vh] w-full md:w-2/4 flex items-center justify-center aspect-square md:aspect-auto bg-white rounded-[32px]"
    >
      <div class="flex md:w-full">
        <div
          v-if="productIsLoading"
          class="loader-container h-full flex justify-center items-center"
        ></div>
        <img
          id="product-img"
          :src="product.image"
          :alt="product.generic_name"
          class="h-auto max-h-72 lg:max-h-full w-auto max-w-[70%] m-auto"
        />
      </div>
    </section>

    <section id="product-details-container" class="relative w-full md:w-2/4 max-md:my-8 md:pl-6">
      <div
        v-if="productIsLoading"
        class="loader-container md:absolute h-full w-full flex justify-center items-center"
      >
        <div class="lds-hourglass"></div>
      </div>
      <div id="product-detail" class="h-full">
        <div class="h-full flex flex-col justify-evently">
          <div>
            <h1 class="title text-xl md:text-2xl">
              <span v-if="product.brand" id="brand" class="font-semibold text-[#00bd7e]"
                >{{ product.brand }} -
              </span>
              <span v-if="product.generic_name" id="generic-name" class="font-semibold">{{
                product.generic_name
              }}</span>
            </h1>
            <h3 v-if="product.lastUpdate" class="mt-2 text-sm">
              Dernière mise à jour : <span id="last-update">{{ product.lastUpdate }}</span>
            </h3>
          </div>
          <div class="scores mt-8">
            <img
              id="nutriscore-img"
              class="max-w-[100px] md:max-w-[115px]"
              :src="
                'https://static.openfoodfacts.org/images/attributes/dist/nutriscore-' +
                product.nutriscore +
                '-new-fr.svg'
              "
              :alt="'Nutriscore : ' + product.nutriscore"
            />
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
            <div
              v-if="novaDescription[product.novaGroup as '1' | '2' | '3' | '4']"
              class="text-xs mt-2"
            >
              ({{ novaDescription[product.novaGroup as '1' | '2' | '3' | '4'] }})
            </div>
          </div>
          <div v-if="product.nutrient_levels" id="nutrient-levels" class="flex flex-wrap mt-2">
            <div
              v-for="(level, nutrient) in product.nutrient_levels"
              :key="nutrient"
              :class="[
                'nutrient mt-4 mr-2 py-2 px-3 rounded-full',
                level === 'low' ? 'bg-[#00bd7e]' : '',
                level === 'moderate' ? 'bg-yellow-500' : '',
                level === 'high' ? 'bg-red-500' : ''
              ]"
            >
              <span class="text-sm font-semibold text-white">
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
              <span class="text-sm font-semibold text-white">{{
                level === 'low'
                  ? 'valeur faible'
                  : level === 'moderate'
                    ? 'valeur modérée'
                    : 'valeur élevée'
              }}</span>
            </div>
          </div>
          <h3 v-if="product.quantity" class="mt-6 font-semibold">Quantité :</h3>
          <h4 id="quantity">{{ product.quantity }}</h4>
          <div
            v-if="nutrimentsKeys.some((nutriment) => nutriment in product.nutriments)"
            id="nutriments"
            class="mt-6"
          >
            <div class="radio-toolbar w-full flex flex-wrap items-center text-sm text-gray-700">
              <input
                type="radio"
                name="ajr_selected"
                id="ajr-women"
                value="women"
                :checked="ajrSelected === 'women' || !ajrSelected"
              />
              <label
                @click="ajrSelected = 'women'"
                class="radio_label mt-2 md:mt-0 mr-4 text-sm font-semibold bg-gray-400 rounded-full"
                for="ajr-women"
                >Femme</label
              >

              <input
                type="radio"
                name="ajr_selected"
                id="ajr-men"
                value="men"
                :checked="ajrSelected === 'men'"
              />
              <label
                @click="ajrSelected = 'men'"
                class="radio_label mt-2 md:mt-0 mr-4 text-sm font-semibold bg-gray-400 rounded-full"
                for="ajr-men"
                >Homme</label
              >
            </div>
            <div class="relative mt-4 overflow-x-auto shadow-md rounded-lg">
              <table class="w-full text-sm text-left rtl:text-right text-pretty text-gray-500">
                <thead class="text-xs text-gray-700 uppercase">
                  <tr>
                    <th scope="col" class="px-6 py-3 bg-gray-50">Valeurs nutritionnelles</th>
                    <th scope="col" class="hidden lg:table-cell px-6 py-3">Pour 100g / 100ml</th>
                    <th scope="col" class="px-6 py-3 bg-gray-50">
                      Par portion ({{ product.serving_size }})
                    </th>
                    <th scope="col" class="px-6 py-3">Ajr*</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-if="product.nutriments['energy-kcal_serving']"
                    class="border-b border-gray-200"
                  >
                    <th
                      scope="row"
                      class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50"
                    >
                      Energie
                    </th>
                    <td class="hidden lg:table-cell px-6 py-4">
                      {{ product.nutriments['energy-kcal_100g'] + ' kcal' }}
                    </td>
                    <td class="px-6 py-4 bg-gray-50">
                      {{ product.nutriments['energy-kcal_serving'] + ' kcal' }}
                    </td>
                    <td class="px-6 py-4">
                      {{
                        (
                          (Number(product.nutriments['energy-kcal_serving']) / ajrValues.energy) *
                          100
                        ).toFixed(0) + '%'
                      }}
                    </td>
                  </tr>
                  <tr v-if="product.nutriments['fat_serving']" class="border-b border-gray-200">
                    <th
                      scope="row"
                      class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50"
                    >
                      Matieres grasses
                    </th>
                    <td class="hidden lg:table-cell px-6 py-4">
                      {{ product.nutriments['fat_100g'] + ' g' }}
                    </td>
                    <td class="px-6 py-4 bg-gray-50">
                      {{ product.nutriments['fat_serving'] + ' g' }}
                    </td>
                    <td class="px-6 py-4">
                      {{
                        ((Number(product.nutriments['fat_serving']) / ajrValues.fat) * 100).toFixed(
                          0
                        ) + '%'
                      }}
                    </td>
                  </tr>
                  <tr
                    v-if="product.nutriments['saturated-fat_serving']"
                    class="border-b border-gray-200"
                  >
                    <th
                      scope="row"
                      class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50"
                    >
                      Graisses saturées
                    </th>
                    <td class="hidden lg:table-cell px-6 py-4">
                      {{ product.nutriments['saturated-fat_100g'] + ' g' }}
                    </td>
                    <td class="px-6 py-4 bg-gray-50">
                      {{ product.nutriments['saturated-fat_serving'] + ' g' }}
                    </td>
                    <td class="px-6 py-4">
                      {{
                        (
                          (Number(product.nutriments['saturated-fat_serving']) /
                            ajrValues.saturatedFat) *
                          100
                        ).toFixed(0) + '%'
                      }}
                    </td>
                  </tr>
                  <tr
                    v-if="product.nutriments['carbohydrates_serving']"
                    class="border-b border-gray-200"
                  >
                    <th
                      scope="row"
                      class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50"
                    >
                      Glucides
                    </th>
                    <td class="hidden lg:table-cell px-6 py-4">
                      {{ product.nutriments['carbohydrates_100g'] + ' g' }}
                    </td>
                    <td class="px-6 py-4 bg-gray-50">
                      {{ product.nutriments['carbohydrates_serving'] + ' g' }}
                    </td>
                    <td class="px-6 py-4">
                      {{
                        (
                          (Number(product.nutriments['carbohydrates_serving']) /
                            ajrValues.carbohydrates) *
                          100
                        ).toFixed(0) + '%'
                      }}
                    </td>
                  </tr>
                  <tr v-if="product.nutriments['sugars_serving']" class="border-b border-gray-200">
                    <th
                      scope="row"
                      class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50"
                    >
                      Sucres
                    </th>
                    <td class="hidden lg:table-cell px-6 py-4">
                      {{ product.nutriments['sugars_100g'] + ' g' }}
                    </td>
                    <td class="px-6 py-4 bg-gray-50">
                      {{ product.nutriments['sugars_serving'] + ' g' }}
                    </td>
                    <td class="px-6 py-4">
                      {{
                        (
                          (Number(product.nutriments['sugars_serving']) / ajrValues.sugars) *
                          100
                        ).toFixed(0) + '%'
                      }}
                    </td>
                  </tr>
                  <tr v-if="product.nutriments['salt_serving']" class="border-b border-gray-200">
                    <th
                      scope="row"
                      class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50"
                    >
                      Sel
                    </th>
                    <td class="hidden lg:table-cell px-6 py-4">
                      {{ product.nutriments['salt_100g'] + ' g' }}
                    </td>
                    <td class="px-6 py-4 bg-gray-50">
                      {{ product.nutriments['salt_serving'] + ' g' }}
                    </td>
                    <td class="px-6 py-4">
                      {{
                        (
                          (Number(product.nutriments['salt_serving']) / ajrValues.salt) *
                          100
                        ).toFixed(0) + '%'
                      }}
                    </td>
                  </tr>
                  <tr v-if="product.nutriments['fiber_serving']" class="border-b border-gray-200">
                    <th
                      scope="row"
                      class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50"
                    >
                      Fibres
                    </th>
                    <td class="hidden lg:table-cell px-6 py-4">
                      {{ product.nutriments['fiber_100g'] + ' g' }}
                    </td>
                    <td class="px-6 py-4 bg-gray-50">
                      {{ product.nutriments['fiber_serving'] + ' g' }}
                    </td>
                    <td class="px-6 py-4">
                      {{
                        (
                          (Number(product.nutriments['fiber_serving']) / ajrValues.fiber) *
                          100
                        ).toFixed(0) + '%'
                      }}
                    </td>
                  </tr>
                  <tr
                    v-if="product.nutriments['proteins_serving']"
                    class="border-b border-gray-200"
                  >
                    <th
                      scope="row"
                      class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50"
                    >
                      Proteines
                    </th>
                    <td class="hidden lg:table-cell px-6 py-4">
                      {{ product.nutriments['proteins_100g'] + ' g' }}
                    </td>
                    <td class="px-6 py-4 bg-gray-50">
                      {{ product.nutriments['proteins_serving'] + ' g' }}
                    </td>
                    <td class="px-6 py-4">
                      {{
                        (
                          (Number(product.nutriments['proteins_serving']) / ajrValues.proteins) *
                          100
                        ).toFixed(0) + '%'
                      }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <span class="text-xs text-gray-700 mt-2"> * Apports Journaliers Recommandés </span>
          </div>
          <h3 v-if="product.ingredients" class="mt-6 font-semibold">Ingrédients :</h3>
          <h4 v-html="product.ingredients" id="ingredients"></h4>
          <h3 v-if="product.manufacturingPlace" class="mt-4 font-semibold">
            Lieu de fabrication :
          </h3>
          <h4 id="manufacturing-place">
            {{ product.manufacturingPlace }}
          </h4>
          <h3 v-if="product.id" class="mt-4 font-semibold">Code-barres :</h3>
          <h4 id="barcode">{{ product.id }}</h4>
          <h3 v-if="product.link" class="mt-4 font-semibold">Plus d'infos :</h3>
          <h4>
            <a :href="product.link" target="_blank" id="link" class="underline">{{
              product.link
            }}</a>
          </h4>
          <div v-if="product.categories.length" id="tags" class="relative mt-4">
            <div
              v-if="productsIsLoading"
              class="loader-container absolute h-full w-full flex justify-center items-center bg-[whitesmoke]"
            >
              <div class="lds-hourglass"></div>
            </div>
            <button
              v-for="category in product.categories"
              :key="category"
              class="tag mt-2 mr-2 py-2 px-3 text-sm font-semibold text-white bg-neutral-400 text-white rounded-full"
              @click="searchProductsByCategory(category)"
            >
              #{{ category }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>

  <aside v-if="suggestedProducts.length || suggestedProductsIsLoading" class="my-16">
    <section
      id="more-products"
      class="relative min-h-[125px] w-full flex flex-wrap lg:flex-nowrap items-stretch lg:items-center justify-between px-6 py-4 bg-neutral-200 rounded-xl"
    >
      <h2
        class="title w-full lg:w-1/4 mt-4 mb-8 lg:ml-[-0.75rem] lg:m-0 text-center text-3xl lg:text-2xl"
      >
        Alternatives
      </h2>
      <div
        v-if="suggestedProductsIsLoading"
        class="loader-container md:absolute h-full w-full flex justify-center items-center"
      >
        <div class="lds-hourglass"></div>
      </div>
      <div class="relative w-full lg:w-3/4 flex flex-wrap md:flex-nowrap lg:justify-end">
        <ProductCard
          v-for="product in suggestedProducts"
          :key="product.id"
          :id="product.id"
          :image="product.image"
          :brand="product.brand"
          :name="product.name"
          :nutriscore="product.nutriscore"
          :nova="product.nova"
          :category="product.category"
        />
      </div>
    </section>
  </aside>
</template>

<style>
.allergen {
  text-transform: lowercase;
  font-weight: 500;
  color: indianred;
}
</style>

<style scoped>
.nutrient:hover span:nth-of-type(1),
.nutrient span:nth-of-type(2) {
  display: none;
}

.nutrient:hover span:nth-of-type(2) {
  display: inline;
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

#more-products .product {
  width: 48%;
  margin-bottom: 5%;
}

#more-products .product:nth-of-type(odd) {
  margin-right: 4%;
}

@media (min-width: 768px) {
  #more-products > .title {
    font-size: xxx-large;
  }

  #more-products .product {
    width: 23.75%;
    margin-bottom: 0;
  }

  #more-products .product:nth-child(1),
  #more-products .product:nth-child(4) {
    margin-left: unset;
    margin-right: unset;
  }

  #more-products .product:nth-child(2) {
    margin-left: 1.75%;
  }

  #more-products .product:nth-child(3) {
    margin-left: 1.75%;
    margin-right: 1.75%;
  }
}
</style>
