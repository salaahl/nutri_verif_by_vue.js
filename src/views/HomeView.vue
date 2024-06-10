<script setup>
import { onMounted, reactive, computed } from 'vue'
import { mapStores } from 'pinia'
import { useProductsStore } from '../stores/products.ts'
import ProductCard from '/src/components/ProductCard.vue'

const productsStore = useProductsStore()
let products = reactive([])
let productsReactive = computed({
  get() {
    return productsStore.getProducts
  }
})

onMounted(() => {
  let $ = (id) => {
    return document.querySelector(id)
  }

  let timer, searchTerm
  let hourglass = $('.lds-hourglass')

  function searchProduct() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let y = 0
        let route =
          'https://world.openfoodfacts.org/cgi/search.pl?search_terms=' +
          searchTerm +
          '&page_size=20?&page=' +
          productsStore.getPage +
          '&search_simple=1&action=process&json=1'

        fetch(route)
          .then((response) => response.json())
          .then((data) => {
            data.products.forEach((product) => {
              products.push({
                id: product.id,
                image: product.image_front_small_url || '/src/assets/logo.svg',
                brand: product.brands || 'Fiche non finalisée',
                name: product.generic_name_fr || 'Fiche non finalisée',
                nutriscore: product.nutriscore_grade,
                nova: product.nova_group
              })
            })

            productsStore.updateProducts(products)

            let pages = 1

            for (let i = 20; i < data.count; i += 20) {
              pages++
            }

            productsStore.updatePages(pages)
            $('#new-results').style.height = '100px'
            observer.observe($('#new-results'))

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
    }, 400)
  }

  // Intersection observer
  const options = {
    threshold: 0.5
  }

  const observer = new IntersectionObserver(handleIntersection, options)

  function handleIntersection(entries) {
    entries.map((entry) => {
      if (entry.isIntersecting && productsStore.getPage < productsStore.getPages) {
        // entry.target.classList.add('animate')
        productsStore.incrementPage()
        search()
      }
    })
  }

  $('form').addEventListener('submit', function (e) {
    e.preventDefault()

    products.length = 0
    searchTerm = $('#search-input').value
    search()
    productsStore.updatePage(1)
  })
})
</script>

<script>
export default {
  computed: {
    ...mapStores(useProductsStore)
  }
}
</script>

<template>
  <div>
    <div id="search-results" class="mt-12">
      <ProductCard
        v-for="product in productsReactive"
        :id="product.id"
        :image="product.image"
        :brand="product.brand"
        :name="product.name"
        :nutriscore="product.nutriscore"
        :nova="product.nova"
      />
    </div>
    <div class="lds-hourglass"></div>
    <div id="new-results"></div>
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
