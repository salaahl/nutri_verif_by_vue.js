<script setup lang="ts">
defineProps({
  id: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  nutriscore: {
    type: String,
    required: false
  },
  nova: {
    type: Number,
    required: false
  }
})
</script>

<template>
  <article class="product">
    <RouterLink :to="'/product/' + id" class="h-full w-full flex flex-col justify-between">
      <div>
        <div class="thumbnail flex justify-center items-center aspect-square border-4">
          <img :src="image" :alt="brand + ' : ' + name" class="object-contain" />
        </div>
        <div class="mt-2">
          <h4 class="title lg:max-w-[75%] text-ellipsis overflow-hidden">{{ brand }}</h4>
          <h4 class="message text-sm font-thin">{{ name }}</h4>
        </div>
      </div>
      <div class="details md:flex justify-between items-center mt-4 md:mt-0">
        <img
          :src="
            'https://static.openfoodfacts.org/images/attributes/dist/nutriscore-' +
            nutriscore +
            '-new-fr.svg'
          "
          :alt="'Nutriscore : ' + nutriscore"
          class="max-h-[50px]"
        />
        <img
          :src="
            'https://static.openfoodfacts.org/images/attributes/dist/nova-group-' + nova + '.svg'
          "
          :alt="'Groupe Nova : ' + nova"
          class="max-h-[40px]"
        />
      </div>
    </RouterLink>
  </article>
</template>

<style scoped>
.product {
  margin-bottom: 2rem;
}

.product h4 {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.thumbnail {
  border-radius: 2px;
  overflow: hidden;
}

.thumbnail img {
  margin: auto;
}

@media (max-width: 767px) {
  .product {
    margin-left: 2.5%;
    margin-right: 2.5%;
    width: 45%;
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
