<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import { useProducts } from '../composables/useProducts'
import AlternativesProducts from '@/components/AlternativesProducts.vue'

import { additivesDatabase } from '../utils/ingredientParser/additives.ts'

const router = useRouter()
const route = useRoute()

const {
  error,
  searchProducts,
  product,
  suggestedProducts,
  productIsLoading,
  productsIsLoading,
  suggestedProductsIsLoading,
  fetchSuggestedProducts,
  fetchProduct,
  novaDescription,
  ajrSelected,
  ajrValues,
  getTranslatedCategories
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

const activeAdditive = ref<string | null>(null)
const categoriesIsLoading = ref(false)
const showSuggestedProducts = ref(false)

const searchProductsByCategory: Function = async (category: string) => {
  productsIsLoading.value = true
  await searchProducts(category, null, 'complete')
  productsIsLoading.value = false

  router.push({ name: 'search' })
}

const searchAlternatives = () => {
  showSuggestedProducts.value = true
  fetchSuggestedProducts({
    id: product.id
      ? product.id
      : Array.isArray(route.params.id)
        ? route.params.id[0]
        : route.params.id,
    name: product.name,
    nutriscore: product.nutriscore,
    novaGroup: product.novaGroup,
    categories: product.categories
  })
}

const resetProduct = () => {
  Object.assign(product, {
    id: '',
    image: '',
    brand: '',
    name: '',
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

// Chargement du produit et des suggestions
const updateProduct = async (productId: string) => {
  resetProduct()
  showSuggestedProducts.value = false
  suggestedProducts.value = []

  await fetchProduct(productId)
  categoriesIsLoading.value = true
  product.categories = await getTranslatedCategories(product.categories)
  categoriesIsLoading.value = false
}

const formatAdditiveCode = (additiveStr: string): string => {
  if (!additiveStr || !additiveStr.includes(':')) return ''
  return additiveStr.split(':')[1].toUpperCase()
}

const getAdditiveName = (additiveStr: string): string => {
  return additivesDatabase[formatAdditiveCode(additiveStr)]?.name || 'Additif inconnu'
}

const getAdditiveDescription = (additiveStr: string): string => {
  return (
    additivesDatabase[formatAdditiveCode(additiveStr)]?.description ||
    'Aucune description disponible pour cet additif.'
  )
}

const getAdditiveTextColor = (additiveStr: string): string => {
  const code = formatAdditiveCode(additiveStr)
  return (
    {
      1: 'text-[#00bd7e]',
      2: 'text-yellow-600',
      3: 'text-orange-600',
      4: 'text-red-600'
    }[additivesDatabase[code]?.score] || 'text-gray-500'
  )
}

const getAdditiveColor = (additiveStr: string): string => {
  const code = formatAdditiveCode(additiveStr)
  const score = additivesDatabase[code]?.score

  switch (score) {
    case 1:
      return 'underline decoration-4 decoration-[#00bd7e]'
    case 2:
      return 'underline decoration-4 decoration-yellow-500'
    case 3:
      return 'underline decoration-4 decoration-orange-500'
    case 4:
      return 'underline decoration-4 decoration-red-500'
    default:
      return 'underline decoration-4 decoration-gray-400'
  }
}

watch(
  () => product.additives,
  (newAdditives) => {
    if (newAdditives && newAdditives.length > 0) {
      activeAdditive.value = newAdditives[0]
    } else {
      activeAdditive.value = null
    }
  },
  { immediate: true }
)

onBeforeMount(async () => {
  await fetchProduct(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)
  if (error.value) {
    alert("Le produit n'existe pas dans la base de données.")
    router.back()
    return
  }
  categoriesIsLoading.value = true
  product.categories = await getTranslatedCategories(product.categories)
  categoriesIsLoading.value = false
})

onBeforeRouteUpdate((to) => {
  updateProduct(Array.isArray(to.params.id) ? to.params.id[0] : to.params.id) // Mise à jour du produit avec le nouvel ID
})
</script>

<template>
  <div
    :key="Array.isArray(route.params.id) ? route.params.id[0] : route.params.id"
    id="product-container"
    class="md:min-h-[calc(100vh-204px)] flex flex-wrap justify-between md:flex-nowrap flex-col md:flex-row mb-16"
  >
    <section
      id="product-images-container"
      class="md:sticky top-[102px] md:max-h-[calc(100vh-204px)] w-full md:w-2/4 flex items-center justify-center mb-4 md:mb-0 md:mr-4 aspect-square md:aspect-auto bg-white rounded-[32px]"
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

    <section id="product-details-container" class="relative w-full md:w-2/4 max-md:my-8 md:pl-4">
      <div
        v-if="productIsLoading"
        class="loader-container md:absolute h-full w-full flex justify-center items-center"
      >
        <div class="lds-hourglass"></div>
      </div>
      <div id="product-detail" class="h-full">
        <div class="h-full flex flex-col justify-evently">
          <div>
            <h1 v-if="product.brand" class="title text-xl md:text-2xl font-bold text-[#00bd7e]">
              {{ product.brand }}
            </h1>
            <h2 v-if="product.name" class="title text-xl md:text-2xl font-bold">
              {{ product.name }}
            </h2>
            <h3 v-if="product.lastUpdate" class="mt-2 text-xs">
              Dernière mise à jour : <span id="last-update">{{ product.lastUpdate }}</span>
            </h3>
          </div>
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
            <img
              id="nova-group-img"
              class="max-w-[25px] mt-2"
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
          <div
            v-if="product.additives && product.additives.length > 0"
            id="additives"
            class="flex flex-col mt-6"
          >
            <div
              class="w-fit inline-flex flex-wrap items-center px-2 pt-2 pb-1 bg-[#343e40] border-3 border-b-0 border-[#343e40] translate-y-[3px] rounded-t-xl gap-2"
            >
              <button
                v-for="additive in product.additives"
                :key="additive"
                type="button"
                @click="activeAdditive = additive"
                @mouseenter="activeAdditive = additive"
                :class="[
                  'additive relative pb-2 px-2 transition-all duration-200',
                  getAdditiveColor(additive),
                  activeAdditive === additive ? 'z-10' : 'opacity-50 hover:opacity-100'
                ]"
              >
                <span class="text-sm font-bold text-white">
                  {{ formatAdditiveCode(additive) }}
                </span>
              </button>
            </div>

            <div
              v-if="activeAdditive"
              class="description w-full md:w-fit px-4 py-3 bg-white border-3 border-[#343e40] rounded-b-xl rounded-r-xl transition-all duration-300"
            >
              <p class="font-bold text-sm mb-1" :class="getAdditiveTextColor(activeAdditive)">
                {{ formatAdditiveCode(activeAdditive) }} — {{ getAdditiveName(activeAdditive) }}
              </p>
              <div
                class="text-xs text-gray-600 leading-relaxed"
                v-html="getAdditiveDescription(activeAdditive)"
              ></div>
            </div>
          </div>
          <div v-if="product.quantity" class="mt-6 w-full max-w-2xl">
            <details class="group bg-white rounded-xl">
              <summary
                class="flex justify-between items-center p-4 font-semibold text-gray-800 cursor-pointer list-none select-none outline-none"
              >
                <h3 class="text-base font-semibold flex items-center gap-2">
                  <span class="h-auto w-[20px]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                      <path
                        d="M118.2 126.4C101.5 120.8 92.4 102.6 98 85.9C103.6 69.2 121.7 60.1 138.5 65.6L251.5 103.3C265.4 79.8 291.1 64 320.4 64C364.6 64 400.4 99.8 400.4 144C400.4 147 400.2 149.9 399.9 152.8L522.5 193.7C539.3 199.3 548.3 217.4 542.7 234.2C537.1 251 519 260 502.2 254.4L366.7 209.2C362.2 212.4 357.4 215.1 352.3 217.4L352.3 544.1C352.3 561.8 338 576.1 320.3 576.1L128.3 576.1C110.6 576.1 96.3 561.8 96.3 544.1C96.3 526.4 110.6 512.1 128.3 512.1L288.3 512.1L288.3 217.4C267.3 208.2 251.1 190.4 244.1 168.4L118.2 126.4zM200.8 352L128.3 227.8L55.9 352L200.8 352zM128.4 448C65.5 448 13.2 414 2.4 369.1C-.2 358.1 3.4 346.8 9.1 337L104.3 173.8C109.3 165.2 118.5 160 128.4 160C138.3 160 147.5 165.3 152.5 173.8L247.7 337C253.4 346.8 257 358.1 254.4 369.1C243.6 413.9 191.3 448 128.4 448zM511.2 355.8L438.8 480L583.7 480L511.3 355.8zM637.2 497.1C626.4 542 574.1 576 511.2 576C448.3 576 396 542 385.2 497.1C382.6 486.1 386.2 474.8 391.9 465L487.1 301.8C492.1 293.2 501.3 288 511.2 288C521.1 288 530.3 293.3 535.3 301.8L630.5 465C636.2 474.8 639.8 486.1 637.2 497.1z"
                      />
                    </svg>
                  </span>
                  Quantité
                </h3>
                <span class="text-gray-400 transition-transform duration-300 group-open:rotate-180">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2.5"
                    stroke="currentColor"
                    class="w-4 h-4"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </span>
              </summary>
              <div class="border-t-3 border-gray-100 p-4 bg-gray-50/50 rounded-b-xl">
                <h4 id="quantity" class="text-sm text-gray-600 leading-relaxed font-semibold">
                  {{ product.quantity }}
                </h4>
              </div>
            </details>
          </div>
          <div v-if="product.ingredients" class="mt-2 w-full max-w-2xl">
            <details class="group bg-white rounded-xl">
              <summary
                class="flex justify-between items-center p-4 font-semibold text-gray-800 cursor-pointer list-none select-none outline-none"
              >
                <h3 class="text-base font-semibold flex items-center gap-2">
                  <span class="h-auto w-[20px]"
                    ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                      <path
                        d="M453.1 27.3L440.9 39.4C409.7 70.6 409.7 121.3 440.9 152.5C456.5 168.1 472.1 183.7 487.8 199.4C519 230.6 569.7 230.6 600.9 199.4L613 187.3C619.2 181.1 619.2 170.9 613 164.7L600.9 152.6C569.7 121.4 519 121.4 487.8 152.6C519 121.4 519 70.7 487.8 39.5L475.7 27.3C469.5 21.1 459.3 21.1 453.1 27.3zM331.6 160C286.4 160 244.5 180.4 216.6 214.3L273.3 271C282.7 280.4 282.7 295.6 273.3 304.9C263.9 314.2 248.7 314.3 239.4 304.9L191.6 257.2L67.2 530.8C61.7 542.9 64.3 557.2 73.7 566.7C83.1 576.2 97.4 578.7 109.6 573.2L251.2 508.8L207.4 465C198 455.6 198 440.4 207.4 431.1C216.8 421.8 232 421.7 241.3 431.1L297.8 487.6L393.1 444.3C446.2 420.2 480.3 367.2 480.3 308.8C480.3 226.6 413.7 160 331.5 160z"
                      /></svg></span
                  >Ingrédients
                </h3>
                <span class="text-gray-400 transition-transform duration-300 group-open:rotate-180">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2.5"
                    stroke="currentColor"
                    class="w-4 h-4"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </span>
              </summary>
              <div class="border-t-3 border-gray-100 p-4 bg-gray-50/50 rounded-b-xl">
                <h4
                  v-html="product.ingredients"
                  id="ingredients"
                  class="text-sm text-gray-600 leading-relaxed font-normal"
                ></h4>
              </div>
            </details>
          </div>
          <div
            v-if="product.manufacturingPlace || product.id || product.link"
            class="mt-2 w-full max-w-2xl"
          >
            <details class="group bg-white rounded-xl">
              <summary
                class="flex justify-between items-center p-4 font-semibold text-gray-800 cursor-pointer list-none select-none outline-none"
              >
                <h3 class="text-base font-semibold flex items-center gap-2">
                  <span class="h-auto w-[20px]"
                    ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                      <path
                        d="M511.6 239C480 164.4 406.1 112 320 112C297.9 112 276.6 115.5 256.6 121.8C256.2 123.8 256 125.9 256 128L256 201.4C256 213.9 266.1 224 278.6 224C284.6 224 290.4 221.6 294.6 217.4L310.6 201.4C316.6 195.4 324.7 192 333.2 192L338.7 192C367.2 192 381.5 226.5 361.3 246.6C355.3 252.6 347.2 256 338.7 256L277.2 256C268.7 256 260.6 259.4 254.6 265.4L233.3 286.7C227.3 292.7 223.9 300.8 223.9 309.3L223.9 352C223.9 369.7 238.2 384 255.9 384L287.9 384C305.6 384 319.9 398.3 319.9 416L319.9 448C319.9 465.7 334.2 480 351.9 480L354.6 480C363.1 480 371.2 476.6 377.2 470.6L406.5 441.3C412.5 435.3 415.9 427.2 415.9 418.7L415.9 400C415.9 391.2 423.1 384 431.9 384C440.7 384 447.9 376.8 447.9 368L447.9 333.3C447.9 324.8 444.5 316.7 438.5 310.7L422.5 294.7C418.3 290.5 415.9 284.7 415.9 278.7C415.9 266.2 426 256.1 438.5 256.1L483.5 256.1C495.9 256.1 506.2 249 511.5 239.1zM64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320z"
                      />
                    </svg>
                  </span>
                  Informations complémentaires
                </h3>
                <span class="text-gray-400 transition-transform duration-300 group-open:rotate-180">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2.5"
                    stroke="currentColor"
                    class="w-4 h-4"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </span>
              </summary>
              <div class="border-t-3 border-gray-100 p-4 bg-gray-50/50 rounded-b-xl space-y-4">
                <div v-if="product.manufacturingPlace">
                  <h4 class="text-xs font-bold text-gray-400 uppercase">Lieu de fabrication</h4>
                  <p id="manufacturing-place" class="text-sm font-semibold text-gray-700 mt-0.5">
                    {{ product.manufacturingPlace }}
                  </p>
                </div>
                <div v-if="product.id">
                  <h4 class="text-xs font-bold text-gray-400 uppercase">Code-barres</h4>
                  <p id="barcode" class="text-sm font-mono text-gray-700 mt-0.5">
                    {{ product.id }}
                  </p>
                </div>
                <div v-if="product.link">
                  <h4 class="text-xs font-bold text-gray-400 uppercase">Fiche produit</h4>
                  <p class="mt-0.5">
                    <a
                      :href="product.link"
                      target="_blank"
                      id="link"
                      class="text-sm font-semibold text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1 window-link break-all"
                    >
                      Voir la fiche officielle
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640"
                        class="w-3.5 h-3.5 inline"
                      >
                        <path
                          fill="currentColor"
                          d="M354.4 83.8C359.4 71.8 371.1 64 384 64L544 64C561.7 64 576 78.3 576 96L576 256C576 268.9 568.2 280.6 556.2 285.6C544.2 290.6 530.5 287.8 521.3 278.7L464 221.3L310.6 374.6C298.1 387.1 277.8 387.1 265.3 374.6C252.8 362.1 252.8 341.8 265.3 329.3L418.7 176L361.4 118.6C352.2 109.4 349.5 95.7 354.5 83.7zM64 240C64 195.8 99.8 160 144 160L224 160C241.7 160 256 174.3 256 192C256 209.7 241.7 224 224 224L144 224C135.2 224 128 231.2 128 240L128 496C128 504.8 135.2 512 144 512L400 512C408.8 512 416 504.8 416 496L416 416C416 398.3 430.3 384 448 384C465.7 384 480 398.3 480 416L480 496C480 540.2 444.2 576 400 576L144 576C99.8 576 64 540.2 64 496L64 240z"
                        />
                      </svg>
                    </a>
                  </p>
                </div>
              </div>
            </details>
          </div>
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
                class="radio_label mt-2 md:mt-0 mr-4 text-sm font-semibold bg-gray-300 rounded-full"
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
                class="radio_label mt-2 md:mt-0 mr-4 text-sm font-semibold bg-gray-300 rounded-full"
                for="ajr-men"
                >Homme</label
              >
            </div>
            <div class="relative mt-4 overflow-x-auto shadow-md rounded-xl">
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
          <div v-if="product.categories.length" id="tags" class="relative mt-4">
            <div
              v-if="categoriesIsLoading || productsIsLoading"
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
              #{{ category.trim().split(':')[1].replace(/-/g, ' ').trim() }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
  <AlternativesProducts
    v-if="
      (product.nutriscore && product.nutriscore !== 'a') ||
      (product.novaGroup && product.novaGroup !== '1')
    "
    :showAlternatives="showSuggestedProducts"
    :from="'product'"
    :hasProduct="!!product.id"
    :isLoading="suggestedProductsIsLoading"
    :products="suggestedProducts"
    @trigger-search="searchAlternatives()"
  />
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

table > thead > tr > th:nth-of-type(even),
table > tbody > tr > td:nth-of-type(odd) {
  background-color: whitesmoke;
}
</style>
