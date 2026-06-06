<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProducts } from '../composables/useProducts'

const route = useRoute()
const router = useRouter()
const { searchProducts } = useProducts()

interface ProductProps {
  id?: string
  image?: string
  brand?: string
  name?: string
  nutriscore?: string
  nova?: number | string
  category?: string
}

defineProps<ProductProps>()

const searchProductsByCategoryIsLoading = ref(false)

const searchProductsByCategory: Function = async (category: string) => {
  searchProductsByCategoryIsLoading.value = true
  await searchProducts(category, null, 'complete')
  searchProductsByCategoryIsLoading.value = false

  router.push({ name: 'search' })
}
</script>

<template>
  <article v-if="id" class="product">
    <RouterLink
      :replace="route.path.startsWith('/product/') ? true : false"
      :to="'/product/' + id"
      class="h-full w-full flex flex-col justify-between"
    >
      <div class="thumbnail h-2/5 flex items-center justify-center m-auto aspect-square">
        <div
          v-if="searchProductsByCategoryIsLoading"
          class="loader-container w-fit flex justify-center items-center m-auto"
        >
          <div class="lds-hourglass"></div>
        </div>
        <img
          v-if="!searchProductsByCategoryIsLoading"
          :src="image"
          :alt="brand + ' : ' + name"
          class="h-3/4 w-3/4 object-contain object-center"
        />
      </div>
      <div class="details h-3/5 flex flex-col justify-between">
        <div class="mt-3">
          <h4 class="title text-sm lg:text-base font-bold text-ellipsis overflow-hidden">
            {{ brand }}
          </h4>
          <h4 class="mt-[4px] text-xs lg:text-sm font-bold">{{ name }}</h4>
        </div>
        <div class="scores">
          <img
            :src="
              'https://static.openfoodfacts.org/images/attributes/dist/nutriscore-' +
              nutriscore +
              '.svg'
            "
            :alt="'Nutriscore : ' + nutriscore"
            class="h-[40px]"
          />
          <div class="flex justify-between items-end mt-1">
            <img
              :src="
                'https://static.openfoodfacts.org/images/attributes/dist/nova-group-' +
                nova +
                '.svg'
              "
              :alt="'Groupe Nova : ' + nova"
              class="h-[35px]"
            />
            <!-- ".prevent" permet d'éviter la remontée du clic au RouterLink -->
            <button
              v-if="category !== '' && category?.startsWith('fr:')"
              class="product-card-tag max-h-[30px] ml-2 md:ml-6 py-1 lg:py-1.5 px-2 truncate text-[10px] lg:text-xs font-semibold bg-white rounded-full"
              @click.prevent="
                searchProductsByCategory(category.split(':')[1].replace(/-/g, ' ').trim())
              "
            >
              #{{ category.trim().split(':')[1].replace(/-/g, ' ').trim() }}
            </button>
          </div>
        </div>
      </div>
    </RouterLink>
  </article>
  <article v-else class="product placeholder">
    <div class="h-full w-full flex flex-col justify-between">
      <div class="thumbnail h-2/5 flex items-center justify-center m-auto aspect-square">
        <img
          src="/logo.png"
          alt="product card placeholder"
          class="placeholder h-3/4 w-3/4 object-contain object-center"
        />
      </div>
      <div class="details h-3/5 flex flex-col justify-between">
        <div class="mt-3">
          <h4
            class="brand placeholder text-sm lg:text-base font-bold text-ellipsis overflow-hidden"
          ></h4>
          <h4 class="name placeholder mt-[4px] text-xs lg:text-sm font-bold"></h4>
        </div>
        <div class="scores">
          <div class="nutriscore placeholder h-[40px]"></div>
          <div class="flex justify-between items-end mt-1">
            <div class="nova placeholder h-[35px]"></div>
            <div
              class="product-card-tag placeholder h-[35px] max-h-[30px] ml-2 md:ml-6 py-1 lg:py-1.5 px-2 bg-white rounded-full"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
@property --gradient-pos {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 100%;
}

.product {
  --gradient-pos: 50%;
  position: relative;
  height: 280px;
  padding: 15px;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.5) var(--gradient-pos),
    rgba(0, 0, 0, 0) 100%
  );
  border-radius: 10px;
  box-shadow:
    rgba(255, 255, 255, 0.01) 0px 1px 1px 0px inset,
    rgba(50, 50, 93, 0.025) 0px 50px 100px -20px,
    rgba(0, 0, 0, 0.03) 0px 30px 60px -30px;
  transition:
    --gradient-pos 0.15s ease-in-out,
    transform 1s
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
      ),
    box-shadow 1s
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
  --gradient-pos: 100%;
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

.title {
  color: var(--color-green);
}

.product-card-tag {
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

/* Product card placeholder */
.placeholder {
  background: linear-gradient(45deg, rgb(0 0 0 / 0.05) 50%, white 100%);
  border-radius: 15px;
}

img.placeholder {
  background: unset;
  filter: opacity(0.75);
}

.brand.placeholder,
.name.placeholder {
  height: 25px;
}

.brand.placeholder {
  width: 55%;
}
.name.placeholder {
  width: 80%;
}

.nutriscore.placeholder,
.nova.placeholder {
  height: 30px;
}

.nutriscore.placeholder {
  width: 40%;
}

.nova.placeholder {
  aspect-ratio: 1 / 1;
}

.product-card-tag.placeholder {
  width: 50%;
}

@media (min-width: 768px) {
  .product {
    height: auto;
    aspect-ratio: 2 / 3;
  }
}
</style>
