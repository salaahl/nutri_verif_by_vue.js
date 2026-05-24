<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useProducts } from '../composables/useProducts'
import SearchBar from '@/components/SearchBar.vue'
import ProductCard from '@/components/ProductCard.vue'

const { products, productsIsLoading, page, pages, searchProducts } = useProducts()

let prevScrollpos = 0
let refresh: boolean = true

const onScroll = async () => {
  const h = document.documentElement,
    b = document.body,
    st = 'scrollTop',
    sh = 'scrollHeight'

  let currentScrollPos = ((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight)) * 100

  const searchBar = document.querySelector('#search-bar') as HTMLElement
  const searchBarHeight = searchBar.offsetHeight

  if (prevScrollpos > currentScrollPos) {
    window.innerWidth > 768 ? (searchBar.style.top = '25px') : (searchBar.style.top = '0')
  } else {
    searchBar.style.top = '-' + (searchBarHeight + 4) + 'px'
  }

  if (
    currentScrollPos > prevScrollpos &&
    currentScrollPos > 70 &&
    page.value < pages.value &&
    refresh
  ) {
    refresh = false
    await searchProducts(null, null, 'more')

    // Permet de temporiser le rafraîchissement
    setTimeout(() => {
      refresh = true
    }, 1000)
  }

  prevScrollpos = currentScrollPos
}

onMounted(() => {
  const fill = document.querySelectorAll(
    'svg .bg-base, svg #background-blobs > g'
  ) as NodeListOf<SVGElement>

  if (fill && fill.length > 0) {
    fill.forEach((f) => f.classList.add('products-screen'))
  }
  window.addEventListener('scroll', onScroll)
})

onUnmounted(() => {
  const fill = document.querySelectorAll(
    'svg .bg-base, svg #background-blobs > g'
  ) as NodeListOf<SVGElement>

  if (fill && fill.length > 0) {
    fill.forEach((f) => f.classList.remove('products-screen'))
  }
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <SearchBar :toolbarIsVisible="true" />
  <section
    id="search-results"
    :class="
      'xs:bg-gray-200 xs:rounded-[10px] transition-[transform,opacity] duration-[1500ms] ease-in-out' +
      (products.length === 0 ? '' : ' show')
    "
  >
    <ProductCard
      v-for="product in products"
      :key="product.id"
      :id="product.id"
      :image="product.image"
      :brand="product.brand"
      :name="product.name"
      :nutriscore="product.nutriscore"
      :nova="product.nova"
      :category="product.category"
    />
  </section>
  <div id="new-results" class="mb-8">
    <div v-if="productsIsLoading" class="lds-hourglass"></div>
  </div>
</template>

<style scoped>
#search-results {
  display: flex;
  flex-wrap: wrap;
  opacity: 0;
  padding: 0;
  transform: translateY(-100px);
  transition:
    opacity 0.25s ease-out,
    transform 0.25s ease-out,
    padding 0s 0.25s;
}

#search-results.show {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity 0.25s ease-in,
    transform 0.25s ease-in,
    padding 0s;
}

#new-results .lds-hourglass:after {
  margin: 8px;
  border: 32px solid #fff;
  border-color: black transparent var(--color-green) transparent;
}

.product {
  width: 48%;
  margin-right: 4%;
  margin-bottom: 2rem;
}

.product:nth-of-type(2n) {
  margin-right: unset;
}

@media (min-width: 375px) {
  #search-results.show {
    padding: 1rem;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .product {
    width: 32%;
  }

  .product:nth-of-type(3n + 2) {
    margin-left: 2%;
    margin-right: 2%;
  }
}

@media (min-width: 768px) {
  .product {
    margin-left: unset;
    margin-right: unset;
  }
}

@media (min-width: 1024px) {
  .product {
    width: 18.8%;
  }

  .product:nth-of-type(5n + 2) {
    margin-left: 1.5%;
    margin-right: 1.5%;
  }

  .product:nth-of-type(5n + 4) {
    margin-left: 1.5%;
    margin-right: 1.5%;
  }
}
</style>
