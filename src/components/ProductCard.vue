<script setup lang="ts">
import { defineProps } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProducts } from '../composables/useProducts'

const route = useRoute()
const router = useRouter()
const {
  productsIsLoading,
  searchProducts,
} = useProducts()

interface ProductProps {
  id: string
  image?: string
  brand?: string
  name?: string
  nutriscore?: string
  nova?: number | string
  category: string
}

defineProps<ProductProps>()

const searchProductsByCategory: Function = async (category: string) => {
  productsIsLoading.value = true
  await searchProducts(category, null, 'complete')
  productsIsLoading.value = false

  router.push({ name: 'search' })
}
</script>

<template>
  <article class="product">
    <RouterLink
      :replace="route.path.startsWith('/product/') ? true : false"
      :to="'/product/' + id"
      class="h-full w-full flex flex-col justify-between"
    >
      <div class="thumbnail h-2/5 md:h-1/2 flex items-center justify-center m-auto aspect-square">
        <div
          v-if="productsIsLoading"
          class="loader-container w-fit flex justify-center items-center m-auto"
        >
          <div class="lds-hourglass"></div>
        </div>
        <img
          v-if="!productsIsLoading"
          :src="image"
          :alt="brand + ' : ' + name"
          class="h-3/4 w-3/4 object-contain object-center"
        />
      </div>
      <div class="details h-3/5 md:h-1/2 flex flex-col justify-between">
        <div class="mt-2">
          <h4 class="title text-sm text-ellipsis overflow-hidden">{{ brand }}</h4>
          <h4 class="text-xs color-[grey]">{{ name }}</h4>
        </div>
        <div class="scores">
          <img
            :src="
              'https://static.openfoodfacts.org/images/attributes/dist/nutriscore-' +
              nutriscore +
              '-new-fr.svg'
            "
            :alt="'Nutriscore : ' + nutriscore"
            class="max-h-[40px]"
          />
          <div class="flex justify-between items-end mt-1">
            <img
              :src="
                'https://static.openfoodfacts.org/images/attributes/dist/nova-group-' + nova + '.svg'
              "
              :alt="'Groupe Nova : ' + nova"
              class="max-h-[30px]"
            />
            <!-- ".prevent" permet d'éviter la remontée du clic au RouterLink -->
            <button
              v-if="category !== '' && category.startsWith('fr:')"
              class="product-card-tag max-h-[30px] ml-4 md:ml-6 py-1 px-2 truncate text-xs font-semibold bg-white rounded-full"
              @click.prevent="searchProductsByCategory(category.split(':')[1].replace(/-/g, ' ').trim())"
            >
              #{{ category.trim().split(':')[1].replace(/-/g, ' ').trim() }}
            </button>
          </div>
        </div>
      </div>
    </RouterLink>
  </article>
</template>

<style scoped>
.product {
  height: 280px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow:
    rgba(255, 255, 255, 0.01) 0px 1px 1px 0px inset,
    rgba(50, 50, 93, 0.025) 0px 50px 100px -20px,
    rgba(0, 0, 0, 0.03) 0px 30px 60px -30px;
  transition: all 1s
    linear(
      0 0%,
      0.22 2.1%,
      0.86 6.5%,
      1.11 8.6%,
      1.3 10.7%,
      1.35 11.8%,
      1.37 12.9%,
      1.37 13.7%,
      1.36 14.5%,
      1.32 16.2%,
      1.03 21.8%,
      0.94 24%,
      0.89 25.9%,
      0.88 26.85%,
      0.87 27.8%,
      0.87 29.25%,
      0.88 30.7%,
      0.91 32.4%,
      0.98 36.4%,
      1.01 38.3%,
      1.04 40.5%,
      1.05 42.7%,
      1.05 44.1%,
      1.04 45.7%,
      1 53.3%,
      0.99 55.4%,
      0.98 57.5%,
      0.99 60.7%,
      1 68.1%,
      1.01 72.2%,
      1 86.7%,
      1 100%
    );
}

.product:hover {
  transform: translateY(-1%);
  box-shadow:
    rgba(255, 255, 255, 0.02) 0px 1px 1px 0px inset,
    rgba(50, 50, 93, 0.05) 0px 50px 100px -20px,
    rgba(0, 0, 0, 0.06) 0px 30px 60px -30px;
}

.product h4 {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.thumbnail {
  background-color: white;
  border-radius: 15px;
  overflow: hidden;
}

.thumbnail img {
  margin: auto;
}

.product-card-tag {
  font-size: 10px;
  color: black;
  background-color: white;
  box-shadow:
    rgba(255, 255, 255, 0.02) 0px 1px 1px 0px inset,
    rgba(50, 50, 93, 0.05) 0px 50px 100px -20px,
    rgba(0, 0, 0, 0.06) 0px 30px 60px -30px;
  transition: all 0.15s ease-in-out;
}

.product-card-tag:hover {
  color: white;
  background-color: rgb(0, 189, 126);
}

@media (min-width: 768px) {
  .product {
    height: auto;
    aspect-ratio: 2 / 3;
  }
}
</style>
