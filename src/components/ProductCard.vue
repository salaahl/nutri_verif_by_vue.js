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
  transition: all 1s linear(0 0%, 0.22 2.1%, 0.86 6.5%, 1.11 8.6%, 1.3 10.7%, 1.35 11.8%, 1.37 12.9%, 1.37 13.7%, 1.36 14.5%, 1.32 16.2%, 1.03 21.8%, 0.94 24%, 0.89 25.9%, 0.88 26.85%, 0.87 27.8%, 0.87 29.25%, 0.88 30.7%, 0.91 32.4%, 0.98 36.4%, 1.01 38.3%, 1.04 40.5%, 1.05 42.7%, 1.05 44.1%, 1.04 45.7%, 1 53.3%, 0.99 55.4%, 0.98 57.5%, 0.99 60.7%, 1 68.1%, 1.01 72.2%, 1 86.7%, 1 100%);
}

.thumbnail:hover {
  transform: translateY(-1%);
  box-shadow: 0px 10px 15px 0px rgb(60 64 67 / 20%), 0 10px 15px 0px rgb(60 64 67 / 10%);
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
