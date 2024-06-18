<script setup>
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
    document.querySelector('h1 > span').style.color = 'red';
    document.querySelector('body').style.backgroundColor = 'hsla(160, 100%, 37%, 0.6)';

    setTimeout(() => {
        document.querySelector('h2 span').style.backgroundSize = '100% 100%';
    }, 1000)
})

onUnmounted(() => {
    document.querySelector('h1 > span').style.color = 'hsla(160, 100%, 37%, 1)';
    document.querySelector('body').style.backgroundColor = 'rgb(255, 255, 255, 1)';
})
</script>

<template>
    <h2 class="flex flex-col items-center text-xl md:text-2xl text-center uppercase">A propos de nous <span
            class="text-xs">(et un
            peu d'Open Food Facts)</span></h2>
    <p>NutriVérif est une application web de food checking alimentée par la base de données d'Open Food Facts et
        developpée par <a href="https://www.linkedin.com/in/salaha-sokhona/" class="underline" target="_blank"
            rel="noopener noreferrer">Salaha Sokhona</a>. Elle résulte d'une volonté de pouvoir vérifier la
        composition de ses aliments
        par le biais d'une application simple, ne requiérant pas d'inscription et fournissant le strict minimum de
        fonctionnalités. Elle
        liste les produits alimentaires avec leurs ingrédients, valeurs nutritionnelles et autres
        juteuses informations que l'on peut trouver sur les labels de ces produits.
    </p>
    <p>Open Food Facts est une association à but non-lucratif composée de volontaires. Plus de 100.000 contributeurs
        comme vous ont ajouté 3 000 000+ produits de 150 pays. Les données sur la nourriture sont d'intérêt public
        et doivent être libres et ouvertes. La base de données
        complète est publiée en open data et peut être réutilisée par quiconque et pour n'importe quel usage.
    </p>
</template>

<style scoped>
p {
    margin: 20px auto;
}

h2 span {
    text-decoration: none;
    background: linear-gradient(to top, red 0%, red 10%, transparent 20%) no-repeat left bottom / 0 100%;
    transition: background-size .5s;
}
</style>
