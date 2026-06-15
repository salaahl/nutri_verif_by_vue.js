<script setup lang="ts">
import { onMounted, onUnmounted, nextTick, ref, watch } from 'vue'
import { useProducts } from '../composables/useProducts'
import SearchBar from '@/components/SearchBar.vue'
import ProductCard from '@/components/ProductCard.vue'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const { products, productsIsLoading, page, pages, searchProducts } = useProducts()
const searchCompleted = ref(false)

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
    searchBar.classList.add('blur-bg')
  } else {
    searchBar.style.top = '-' + (searchBarHeight + 4) + 'px'
    searchBar.classList.remove('blur-bg')
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
    }, 1500)
  }

  prevScrollpos = currentScrollPos
}

const animateNewProducts = () => {
  // Nettoyage des anciens triggers pour éviter l'empilement
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill())

  const newProducts = document.querySelectorAll('.product:not(.is-visible)')
  if (newProducts.length === 0) return

  newProducts.forEach((product, index) => {
    const isMobile = window.innerWidth < 768
    const gridColumns = isMobile ? 2 : 5

    // On calcule le délai en JS et on l'injecte en variable CSS personnalisée (--delay)
    const localIndex = index % gridColumns
    const delay = localIndex * 0.08
    ;(product as HTMLElement).style.setProperty('--delay', `${delay}s`)

    ScrollTrigger.create({
      trigger: product,
      start: 'top bottom+=50', // Déclenche 50px avant d'entrer dans l'écran
      once: true,
      onEnter: () => {
        product.classList.add('is-visible')
      }
    })
  })

  ScrollTrigger.clearScrollMemory()
  ScrollTrigger.refresh(true)
}

watch(
  products,
  async (newProductsList) => {
    if (!newProductsList || newProductsList.length === 0) return

    await nextTick()
    // Laisser le browser peindre avant de mesurer les positions
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        animateNewProducts()
      })
    })
  },
  { deep: true, immediate: true }
)

onMounted(() => {
  window.addEventListener('scroll', onScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
})
</script>

<template>
  <SearchBar :toolbarIsVisible="true" @search-status="searchCompleted = $event" />
  <section
    id="search-results"
    :class="
      'mb-8 xs:bg-gray-200/50 xs:rounded-[10px] transition-[transform,opacity] duration-[1500ms] ease-in-out' +
      (products.length === 0 ? '' : ' show')
    "
  >
    <div v-if="searchCompleted && products.length === 0" class="w-full">
      <h3
        class="w-fit m-auto px-4 py-2 text-white text-center font-semibold bg-[indianred] rounded-full"
      >
        Aucun produit trouvé
      </h3>
    </div>
    <ProductCard
      v-else
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
#search-bar {
  padding: var(--app-padding-x);
}

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
  opacity: 0;
  transform: translateY(30%);
  transition:
    opacity 0.4s ease-in,
    transform 0.4s ease-in;
  transition-delay: var(--delay, 0s);
  will-change: transform, opacity;
}

.product:nth-of-type(2n) {
  margin-right: unset;
}

.product.is-visible {
  opacity: 1;
  transform: translateY(0);
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
