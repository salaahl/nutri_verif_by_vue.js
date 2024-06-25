<script setup>
import { onBeforeMount, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const route = 'https://world.openfoodfacts.org/api/v3/product/' + router.currentRoute.value.fullPath.split('/').pop() + '.json'

let product = reactive([{
  image: null,
  title: null,
  lastUpdate: null,
  nutriscore: null,
  novaGroup: null,
  barcode: null,
  ingredients: null,
  calories100g: null,
  manufacturingPlace: null,
  productSheet: null
}]);

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
      product.title = data.product.brands + ' - ' + data.product.generic_name_fr
      product.lastUpdate = new Date(
        data.product.last_updated_t * 1000
      ).toLocaleDateString('fr-FR')
      product.nutriscore = data.product.nutriscore_grade
      product.novaGroup = data.product.nova_group
      product.barcode = data.code
      product.ingredients = data.product.ingredients_text_fr
      product.calories100g = data.product.nutriments['energy-kcal_100g']
      product.manufacturingPlace = data.product.manufacturing_places
      product.productSheet = data.product.link
    }).catch((error) => {
      console.log(error.message)
      router.replace({ name: 'NotFound' })
    })
})

</script>

<template>
  <div id="product-container"
    class="md:min-h-[calc(100vh-172px)] flex flex-wrap justify-between md:flex-nowrap flex-col md:flex-row">
    <section id="product-images-container"
      class="w-full md:w-2/4 flex items-center justify-center md:mb-[10px] max-md:rounded-r-lg rounded-l-lg">
      <div class="md:w-full md:min-w-[auto]">
        <img v-if="product.image" id="product-img" :src="product.image" :alt="product.title"
          class="h-auto w-auto m-auto md:object-none" />
      </div>
    </section>
    <section id="product-details-container" class="w-full md:w-2/4 max-md:my-8 md:pl-6">
      <div id="product-detail" class="h-full">
        <div class="h-full flex flex-col justify-evently">
          <div>
            <h2 v-if="product.title" id="title" class="text-xl md:text-2xl uppercase">{{ product.title }}</h2>
            <h3 v-if="product.lastUpdate" class="text-sm">Dernière mise à jour : <span id="last-update">{{
              product.lastUpdate }}</span>
            </h3>
          </div>
          <div>
            <div>
              <img id="nutriscore-img" class="max-w-[100px] md:max-w-[115px] mt-2"
                :src="'https://static.openfoodfacts.org/images/attributes/dist/nutriscore-' + product.nutriscore + '-new-fr.svg'"
                :alt="'Nutriscore : ' + product.nutriscore" />
              <div class="flex items-end">
                <img id="nova-group-img" class="max-h-[50px] md:max-h-[60px] mt-2"
                  :src="'https://static.openfoodfacts.org/images/attributes/dist/nova-group-' + product.novaGroup + '.svg'"
                  :alt="'Groupe Nova : ' + product.novaGroup" />
                <h4 v-if="product.novaGroup" id="nova-group-text" class="ml-2">{{ '(' + novaGroupText[product.novaGroup
                  - 1] + ')' }}
                </h4>
              </div>
            </div>
            <h3 v-if="product.ingredients" class="mt-4 font-semibold">Ingrédients :</h3>
            <h4 v-if="product.ingredients" id="ingredients">{{ product.ingredients }}</h4>
            <h3 v-if="product.calories100g" class="mt-4 font-semibold">Calories pour 100 grammes :</h3>
            <h4 v-if="product.calories100g" id="calories-100g">{{ product.calories100g }}</h4>
            <h3 v-if="product.manufacturingPlace" class="mt-4 font-semibold">Lieu de fabrication :</h3>
            <h4 v-if="product.manufacturingPlace" id="manufacturing-place">{{ product.manufacturingPlace }}</h4>
            <h3 v-if="product.barcode" class="mt-4 font-semibold">Code-barres :</h3>
            <h4 v-if="product.barcode" id="barcode">{{ product.barcode }}</h4>
            <h3 v-if="product.productSheet" class="mt-4 font-semibold">Plus d'infos :</h3>
            <h4 v-if="product.productSheet"><a :href="product.productSheet" id="product-sheet" class="underline">{{
              product.productSheet }}</a>
            </h4>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
#product-images-container {
  backdrop-filter: contrast(0.95);
}
</style>
