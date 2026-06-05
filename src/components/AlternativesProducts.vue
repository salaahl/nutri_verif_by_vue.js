<script setup lang="ts">
import { ref } from 'vue'
import ProductCard from './ProductCard.vue'

interface Products {
  id: string
  image: string
  brand: string
  name: string
  nutriscore: string
  nova: number | string
  category: string
}

const props = withDefaults(
  defineProps<{
    from?: string
    hasProduct?: boolean
    isLoading?: boolean
    products?: Products[]
  }>(),
  {
    from: 'product',
    hasProduct: false,
    isLoading: false,
    products: () => []
  }
)

const emit = defineEmits<{
  (e: 'trigger-search'): void
}>()

const showAlternatives = ref(false)

function searchAlternatives() {
  showAlternatives.value = true
  emit('trigger-search')
}
</script>

<template>
  <aside v-if="hasProduct" class="mb-16">
    <section
      id="more-products"
      :class="`relative min-h-[125px] w-full flex flex-wrap lg:flex-nowrap items-stretch lg:items-center justify-between px-4 md:px-6 py-4 ${from === 'home' ? 'bg-[#ffffff80]' : 'bg-white'} rounded-xl`"
    >
      <h2
        class="title w-full lg:w-1/4 mt-4 mb-8 lg:ml-[-0.75rem] lg:m-0 text-center text-3xl lg:text-2xl"
      >
        Alternatives
      </h2>
      <!-- Cas 1 : affichage initial -->
      <div
        v-if="!showAlternatives"
        class="relative w-full lg:w-3/4 flex flex-wrap md:flex-nowrap lg:justify-end"
      >
        <ProductCard v-for="i in [0, 1, 2, 3]" :key="i" @click="searchAlternatives()" />
        <article class="md:hidden w-full flex items-center justify-center mt-[2.5%]">
          <button
            id="alternatives-products-button"
            class="h-full w-full flex items-center justify-center p-3 text-center text-white font-semibold bg-[#00bd7e] rounded-lg"
            @click="searchAlternatives()"
          >
            Afficher les alternatives
          </button>
        </article>
      </div>
      <!-- clic sur le bouton afficher les produits, chargement en cours -->
      <div
        v-else-if="showAlternatives && isLoading"
        class="loader-container md:absolute h-full w-full flex justify-center items-center"
      >
        <div class="lds-hourglass"></div>
      </div>
      <!-- Cas 2 : recherche concluante. Affichage des resultats -->
      <div
        v-if="showAlternatives && props.products.length > 0"
        class="relative w-full lg:w-3/4 flex flex-wrap md:flex-nowrap lg:justify-end"
      >
        <ProductCard
          v-for="product in props.products"
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
      <!-- Cas 3 : aucun resultat trouvé -->
      <div v-else-if="showAlternatives && !isLoading && props.products.length === 0" class="w-full">
        <h3 v-if="from === 'home'" class="text-center text-2xl font-semibold">
          Erreur lors de la recherche, veuillez reessayer plus tard
        </h3>
        <h3 v-else class="text-center text-2xl font-semibold">Aucun produit trouvé</h3>
      </div>
    </section>
  </aside>
</template>

<style scoped>
.title {
  font-family: 'Grand Hotel', cursive;
  font-size: xx-large;
}

.title::first-letter {
  color: indianred;
}

.product {
  width: 48%;
  margin-bottom: 5%;
}

.product:nth-of-type(odd) {
  margin-right: 4%;
}

@media (min-width: 768px) {
  .title {
    font-size: xxx-large;
  }

  .product {
    width: 23.75%;
    aspect-ratio: auto;
    margin-bottom: 0;
  }

  .product:nth-child(1),
  .product:nth-child(4) {
    margin-left: unset;
    margin-right: unset;
  }

  .product:nth-child(2) {
    margin-left: 1.75%;
  }

  .product:nth-child(3) {
    margin-left: 1.75%;
    margin-right: 1.75%;
  }

  .product.placeholder::after {
    content: 'Afficher les alternatives';
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    padding: 1rem;
    opacity: 0;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.5) 50%, rgba(0, 0, 0, 0) 100%);
    text-align: center;
    font-weight: 600;
    color: black;
    transition: opacity 0.15s ease-in-out;
  }

  .product.placeholder:hover::after {
    opacity: 1;
  }
}

@media (min-width: 1280px) {
  .product {
    aspect-ratio: auto;
  }
}
</style>
