<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  const websiteName = document.querySelector('#website-name > span') as HTMLElement
  if (!document.querySelector('h2')) return
  websiteName.style.color = 'red'

  const body = document.querySelector('body') as HTMLElement
  if (!body) return
  body.style.backgroundColor = 'hsla(160, 100%, 37%, 0.6)'

  setTimeout(() => {
    const title = document.querySelector('h2') as HTMLElement
    if (!title) return
    title.style.backgroundSize = '100% 100%'
  }, 1000)
})

onUnmounted(() => {
  const websiteName = document.querySelector('#website-name > span') as HTMLElement
  if (!websiteName) return
  websiteName.style.color = 'hsla(160, 100%, 37%, 1)'

  const body = document.querySelector('body') as HTMLElement
  if (!body) return
  body.style.backgroundColor = 'whitesmoke'
})
</script>

<template>
  <h1
    class="title flex flex-col items-center md:translate-y-[-100px] text-xl md:text-2xl text-center uppercase"
  >
    A propos de nous
  </h1>
  <h2 class="w-fit mx-auto text-xs">(et un peu d'Open Food Facts)</h2>
  <p class="text-center">
    NutriVérif est une application web de food checking alimentée par la base de données d'Open Food
    Facts et developpée par
    <a
      href="https://www.linkedin.com/in/salaha-sokhona/"
      class="underline"
      target="_blank"
      rel="noopener noreferrer"
      >Salaha Sokhona</a
    >. Elle résulte d'une volonté de pouvoir vérifier la composition de ses aliments par le biais
    d'une application simple, ne requiérant pas d'inscription et fournissant le strict minimum de
    fonctionnalités. Elle liste les produits alimentaires avec leurs ingrédients, valeurs
    nutritionnelles et autres juteuses informations que l'on peut trouver sur les labels de ces
    produits.
  </p>
  <p class="text-center">
    Open Food Facts est une association à but non-lucratif composée de volontaires. Plus de 100.000
    contributeurs comme vous ont ajouté plus de 3 000 000 produits de 150 pays. Les données sur la
    nourriture sont d'intérêt public et doivent être libres et ouvertes. La base de données complète
    est publiée en open data et peut être réutilisée par quiconque et pour n'importe quel usage.
  </p>
</template>

<style scoped>
.title::first-letter {
  font-weight: bold;
}

h2 {
  text-decoration: none;
  background: linear-gradient(to top, red 0%, red 10%, transparent 20%) no-repeat left bottom / 0
    100%;
  transition: background-size 0.5s;
}

p {
  margin: 20px auto;
}
</style>
