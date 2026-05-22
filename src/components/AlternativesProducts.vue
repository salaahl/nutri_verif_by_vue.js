<script setup lang="ts">
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
    isLoading?: boolean
    products?: Products[]
  }>(),
  {
    isLoading: false,
    products: () => []
  }
)
</script>

<template>
  <aside v-if="props.products.length || isLoading" class="mb-16">
    <section
      id="more-products"
      class="relative min-h-[125px] w-full flex flex-wrap lg:flex-nowrap items-stretch lg:items-center justify-between px-4 md:px-6 py-4 bg-neutral-200 rounded-xl"
    >
      <h2
        class="title w-full lg:w-1/4 mt-4 mb-8 lg:ml-[-0.75rem] lg:m-0 text-center text-3xl lg:text-2xl"
      >
        Alternatives
      </h2>
      <div
        v-if="isLoading"
        class="loader-container md:absolute h-full w-full flex justify-center items-center"
      >
        <div class="lds-hourglass"></div>
      </div>
      <div class="relative w-full lg:w-3/4 flex flex-wrap md:flex-nowrap lg:justify-end">
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
}

@media (min-width: 1280px) {
  .product {
    aspect-ratio: auto;
  }
}
</style>
