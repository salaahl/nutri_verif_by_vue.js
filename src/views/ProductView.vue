<script setup>
import { onBeforeMount, onMounted, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const route =
  'https://world.openfoodfacts.org/api/v3/product/' +
  router.currentRoute.value.fullPath.split('/').pop() +
  '.json'

let product = reactive([
  {
    image: null,
    brand: null,
    generic_name: null,
    lastUpdate: null,
    nutriscore: null,
    novaGroup: null,
    barcode: null,
    ingredients: null,
    calories100g: null,
    manufacturingPlace: null,
    productSheet: null
  }
])

const novaGroupText = [
  'Aliments non transformés ou transformés minimalement',
  'Ingrédients culinaires transformés',
  'Aliments transformés',
  'Produits alimentaires et boissons ultra-transformés'
]

onBeforeMount(() => {
  fetch(route)
    .then((response) => response.json())
    .then((data) => {
      product.image = data.product.image_front_url || '/logo.png'
      product.brand = data.product.brands
      product.generic_name = data.product.generic_name_fr
      product.lastUpdate = new Date(data.product.last_updated_t * 1000).toLocaleDateString('fr-FR')
      product.nutriscore = data.product.nutriscore_grade
      product.novaGroup = data.product.nova_group
      product.barcode = data.code
      product.ingredients = data.product.ingredients_text_fr
      product.calories100g = data.product.nutriments['energy-kcal_100g']
      product.manufacturingPlace = data.product.manufacturing_places
      product.productSheet = data.product.link

      document
        .querySelectorAll('.loader-container')
        .forEach((loader) => (loader.style.display = 'none'))
    })
    .catch((error) => {
      console.log(error.message)
      router.replace({ name: 'NotFound' })
    })
})

onMounted(() => {
  document.querySelector('body').style.backgroundColor = 'rgb(243, 244, 246, 1)'
})

onUnmounted(() => {
  document.querySelector('body').style.backgroundColor = 'rgb(255, 255, 255, 1)'
})
</script>

<template>
  <div
    id="product-container"
    class="md:min-h-[calc(100vh-344px)] flex flex-wrap justify-between md:flex-nowrap flex-col md:flex-row"
  >
    <section
      id="product-images-container"
      class="w-full md:w-2/4 flex items-center justify-center bg-white rounded-xl"
    >
      <div class="md:w-full md:min-w-[auto] my-[50px] md:m-0">
        <div class="loader-container h-full flex justify-center items-center">
          <img src="/logo.png" class="h-auto w-auto m-auto opacity-50 md:object-none" />
        </div>
        <img
          v-if="product.image"
          id="product-img"
          :src="product.image"
          :alt="product.generic_name"
          class="h-auto w-auto m-auto md:object-none"
        />
      </div>
    </section>
    <section id="product-details-container" class="relative w-full md:w-2/4 max-md:my-8 md:pl-6">
      <div class="loader-container md:absolute h-full w-full flex justify-center items-center">
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
                <h4 v-if="product.novaGroup" id="nova-group-text" class="ml-2">
                  {{ '(' + novaGroupText[product.novaGroup - 1] + ')' }}
                </h4>
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
            <h3 v-if="product.barcode" class="mt-4 font-semibold">Code-barres :</h3>
            <h4 v-if="product.barcode" id="barcode">{{ product.barcode }}</h4>
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
</template>

<style>
#product-details-container .lds-hourglass:after {
  margin: 8px;
  border: 32px solid #fff;
  border-color: black transparent var(--color-green) transparent;
}
</style>
