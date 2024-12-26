<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  document.querySelector('#not-found').style.marginTop =
    '-' + document.querySelector('header').offsetHeight / 2 + 'px'

  setTimeout(() => {
    document.querySelector('#not-found h3').style.backgroundSize = '100% 100%'
  }, 1000)
})
</script>

<template>
  <div id="not-found">
    <h1 class="title w-fit mx-auto text-xl md:text-2xl text-center uppercase">Page introuvable</h1>
    <RouterLink :to="'/'">
      <h3 class="w-fit mx-auto text-sm text-center uppercase">Retourner sur la page précédente</h3>
    </RouterLink>
  </div>
</template>

<style scoped>
#not-found {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
}

h3 {
  text-decoration: none;
  background: linear-gradient(
      to top,
      var(--color-green) 100%,
      var(--color-green) 10%,
      transparent 20%
    )
    no-repeat left bottom / 0 100%;
  transition: background-size var(--transition-delay-double);
}
</style>
