<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

onMounted(() => {
  const $ = (id) => {
    return document.querySelector(id)
  }
  const router = useRoute()
  const route = 'https://world.openfoodfacts.net/api/v2/product/' + router.fullPath.split('/').pop()

  $('#back-link').style.marginLeft = $('main').offsetLeft + 'px'

  const novaGroup = [
    'Aliments non transformés ou transformés minimalement',
    'Ingrédients culinaires transformés',
    'Aliments transformés',
    'Produits alimentaires et boissons ultra-transformés'
  ]

  fetch(route)
    .then((response) => response.json())
    .then((data) => {
      $('#product-img').src = data.product.image_front_url
      $('#title').textContent = data.product.brands + ' - ' + data.product.generic_name_fr
      $('#last-update').textContent = new Date(
        data.product.last_updated_t * 1000
      ).toLocaleDateString('fr-FR')
      $('#nutriscore-img').src =
        'https://static.openfoodfacts.org/images/attributes/dist/nutriscore-' +
        data.product.nutriscore_grade +
        '-new-fr.svg'
      $('#nutriscore-img').setAttribute('alt', 'Nutriscore : ' + data.product.nutriscore_grade)
      $('#nova-group-img').src =
        'https://static.openfoodfacts.org/images/attributes/dist/nova-group-' +
        data.product.nova_group +
        '.svg'
      $('#nova-group-img').setAttribute('alt', 'Groupe Nova : ' + data.product.nutriscore_grade)
      $('#nova-group-text').textContent = '(' + novaGroup[data.product.nova_group - 1] + ')'
      $('#code').textContent = data.code
      $('#ingredients').textContent += data.product.ingredients_text_fr
      $('#calories-100g').textContent += data.product.nutriments['energy-kcal_100g']
      $('#manufacturing-place').textContent += data.product.manufacturing_places
      $('#product-sheet').href = data.product.link
      $('#product-sheet').textContent = data.product.link
    })
})
</script>

<template>
  <div
    class="md:h-[calc(100vh-190px)] flex flex-wrap justify-between md:flex-nowrap flex-col md:flex-row"
  >
    <section
      id="product-images-container"
      class="w-full md:w-2/4 flex items-center justify-center bg-stone-200"
    >
      <div class="md:w-full md:min-w-[auto]">
        <img id="product-img" src="#" alt="..." class="h-auto w-auto m-auto md:object-none" />
      </div>
    </section>
    <section id="product-details-container" class="w-full md:w-2/4 max-md:mt-[15px] md:pl-6">
      <div id="product-detail" class="h-full">
        <div class="h-full flex flex-col justify-evently">
          <div>
            <h2 id="title" class="text-xl md:text-3xl uppercase"></h2>
            <h3 class="text-sm">Dernière mise à jour : <span id="last-update"></span></h3>
          </div>
          <div>
            <div>
              <img
                id="nutriscore-img"
                class="max-w-[100px] md:max-w-[115px] mt-2"
                src="#"
                alt="Nutriscore :"
              />
              <div class="flex items-end">
                <img
                  id="nova-group-img"
                  class="max-h-[50px] md:max-h-[60px] mt-2"
                  src="#"
                  alt="Groupe Nova :"
                />
                <h4 id="nova-group-text" class="ml-2"></h4>
              </div>
            </div>
            <h3 class="mt-4 font-semibold">Ingrédients :</h3>
            <h4 id="ingredients" class=""></h4>
            <h3 class="mt-4 font-semibold">Calories pour 100g :</h3>
            <h4 id="calories-100g" class=""></h4>
            <h3 class="mt-4 font-semibold">Lieu de fabrication :</h3>
            <h4 id="manufacturing-place" class=""></h4>
            <h3 class="mt-4 font-semibold">Code-barres :</h3>
            <h4 id="code" class=""></h4>
            <h3 class="mt-4 font-semibold">Lien vers la fiche produit du fabricant :</h3>
            <h4><a href="#" id="product-sheet" class=""></a></h4>
          </div>
        </div>
      </div>
      <div id="delivery-and-return-details">
        <!-- Mettre les nutriscores ici ? -->
      </div>
    </section>
  </div>
</template>

<style scoped></style>
