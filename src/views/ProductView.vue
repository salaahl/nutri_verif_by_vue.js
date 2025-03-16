<script setup lang="ts">
import { onBeforeMount, computed, ref } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import { franc } from 'franc-min'
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
  ajrSelected,
  ajrValues
} = useProducts()

const isFrench = (text: string) => {
  return franc(text) === 'fra'
}

const filteredCategories = computed<string[]>(() => {
  if (!product.categories?.length) return []

  return product.categories
    .filter((category: string) => {
      // Si la catégorie commence par 'fr:', elle est incluse
      // Si elle ne commence pas par 'fr:', on vérifie si c'est du français
      return category.trim().startsWith('fr:') || isFrench(category)
    })
    .map((category: string) => {
      // Si la catégorie commence par 'fr:', on enlève le préfixe 'fr:'
      return category.trim().startsWith('fr:')
        ? category.trim().replace(/fr:/, '').trim()
        : category
    })
})

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
      class="md:sticky top-[5vh] md:h-[90vh] w-full md:w-2/4 flex items-center justify-center bg-white rounded-xl"
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
            <h3 v-if="product.quantity" class="mt-8 font-semibold">Quantité :</h3>
            <h4 id="quantity">{{ product.quantity }}</h4>
            <div v-if="product.nutriments" id="nutriments" class="mt-8">
              <div
                class="radio-toolbar w-full flex flex-wrap items-center mt-4 md:mt-6 text-sm text-gray-700"
              >
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
              <div class="relative mt-4 overflow-x-auto shadow-md sm:rounded-lg">
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
                          (
                            (Number(product.nutriments['fat_serving']) / ajrValues.fat) *
                            100
                          ).toFixed(0) + '%'
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
                    <tr
                      v-if="product.nutriments['sugars_serving']"
                      class="border-b border-gray-200"
                    >
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
            <h3 v-if="product.ingredients" class="mt-8 font-semibold">Ingrédients :</h3>
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
            <div v-if="filteredCategories.length" id="tags" class="relative mt-4">
              <div
                v-if="productsIsLoading"
                class="loader-container absolute h-full w-full flex justify-center items-center bg-[whitesmoke]"
              >
                <div class="lds-hourglass"></div>
              </div>
              <button
                v-for="category in filteredCategories"
                :key="category"
                class="tag mt-2 mr-2 py-2 px-3 text-sm font-semibold text-white bg-neutral-400 text-white rounded-full"
                @click="searchProductsByCategory(category)"
              >
                #{{ category }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <aside v-if="suggestedProducts.length || suggestedProductsIsLoading" class="my-16">
    <section
      id="more-products"
      class="relative min-h-[125px] w-full flex flex-wrap lg:flex-nowrap items-stretch lg:items-center justify-between p-4 md:p-8 lg:px-16 bg-neutral-200 rounded-xl"
    >
      <h2 class="title w-full lg:w-1/4 mb-8 lg:mb-0 text-center lg:text-left text-3xl lg:text-2xl">
        Alternatives
      </h2>
      <div
        v-if="suggestedProductsIsLoading"
        class="loader-container md:absolute h-full w-full flex justify-center items-center"
      >
        <div class="lds-hourglass"></div>
      </div>
      <div
        class="relative w-full lg:w-3/4 flex flex-wrap md:flex-nowrap md:justify-center lg:justify-end"
      >
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

  #more-products .product:nth-of-type(odd) {
    margin-left: 1.25%;
    margin-right: 1.25%;
  }
}
</style>
