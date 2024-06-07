<script setup lang="ts">
import { reactive } from 'vue'
import ProductCard from '../components/ProductCard.vue'

let results = reactive([])

window.addEventListener('load', function () {
  let $ = (id) => {
    return document.querySelector(id)
  }
  let timer
  let pages
  let page = 1
  let searchTerm
  let counter = 20
  let hourglass = $('.lds-hourglass')

  function searchProduct() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let y = 0
        let route =
          'https://world.openfoodfacts.org/cgi/search.pl?search_terms=' +
          searchTerm +
          '&page_size=20?&page=' +
          page +
          '&search_simple=1&action=process&json=1'

        results.length = 0

        fetch(route)
          .then((response) => response.json())
          .then((data) => {
            data.products.forEach((product) => {
              results.push({
                id: product.id,
                image: product.image_front_small_url || '/src/assets/logo.svg',
                brand: product.brands || 'Fiche non finalisée',
                name: product.generic_name_fr || 'Fiche non finalisée',
                nutriscore: product.nutriscore_grade,
                nova: product.nova_group
              })
            })

            counter = data.count
            pages = 1

            for (let i = 20; i < counter; i += 20) {
              pages++
            }

            $('#pagination').innerHTML = ''

            for (let i = 1; i < pages; i++) {
              $('#pagination').innerHTML += '<button>' + i + '</button>'
            }

            document.querySelectorAll('#pagination button').forEach((button) => {
              button.addEventListener('click', function () {
                page = parseInt(button.textContent)
                search()
              })
            })
            y++
          })
          .catch((error) => {
            console.log(error.message)
          })
        resolve(y)
      }, 300)
    })
  }

  async function search() {
    $('#search-results').style.filter = 'blur(8px)'
    hourglass.style.display = 'flex'

    const result = await searchProduct()

    setTimeout(() => {
      $('#search-results').style.filter = 'blur(0px)'
      hourglass.style.display = 'none'
    }, 2000)
  }

  $('#search-input').addEventListener('input', function () {
    clearTimeout(timer)
    timer = setTimeout(function () {
      if ($('#search-input').value.length > 1) {
        searchTerm = $('#search-input').value
        page = 1

        search()
      } else {
        results.length = 0
        $('#pagination').innerHTML = ''
      }
    }, 600)
  })
})
</script>

<template>
  <div>
    <div class="relative">
      <div class="absolute inset-y-0 start-0 flex items-center z-20 ps-3 pointer-events-none">
        <svg
          class="w-4 h-4 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
          />
        </svg>
      </div>
      <input
        type="search"
        id="search-input"
        class="block w-full mt-5 p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder="Rechercher selon le nom du produit, la marque, une catégorie, une origine ou un code-barres"
      />
    </div>
    <div id="search-results" class="mt-12">
      <ProductCard
        v-for="result in results"
        :id="result.id"
        :image="result.image"
        :brand="result.brand"
        :name="result.name"
        :nutriscore="result.nutriscore"
        :nova="result.nova"
        onclick="document.getElementById('search-input').value = ''"
      />
    </div>
    <div class="lds-hourglass"></div>
    <div id="pagination"></div>
  </div>
</template>

<style scoped>
.lds-hourglass {
  display: none;
  position: fixed;
  right: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  mask-image: linear-gradient(to top, rgb(255, 255, 255, 0) 0%, rgb(255, 255, 255, 1) 15%),
    linear-gradient(to bottom, rgb(255, 255, 255, 0) 0%, rgb(255, 255, 255, 1) 25%);
  mask-composite: intersect;
  z-index: 99;
}

.lds-hourglass:after {
  content: ' ';
  display: block;
  border-radius: 50%;
  width: 0;
  height: 0;
  margin: 8px;
  box-sizing: border-box;
  border: 32px solid #fff;
  border-color: black transparent black transparent;
  animation: lds-hourglass 1.2s infinite;
}

#search-results {
  display: flex;
  flex-wrap: wrap;
}

@keyframes lds-hourglass {
  0% {
    transform: rotate(0);
    animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
  }
  50% {
    transform: rotate(900deg);
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  100% {
    transform: rotate(1800deg);
  }
}
</style>
