<script setup>
import { onMounted } from 'vue'

onMounted(() => {
    setTimeout(() => {
        document.querySelector('h2').style.backgroundSize = '100% 100%';
    }, 1000)
})
</script>

<template>
    <div>
        <h2 class="flex flex-col items-center text-xl md:text-2xl text-center uppercase">Page introuvable</h2>
    </div>
</template>

<style scoped>
h2 {
    text-decoration: none;
    background: linear-gradient(to top, var(--color-green) 0%, var(--color-green) 10%, transparent 20%) no-repeat left bottom / 0 100%;
    transition: background-size .5s;
}
</style>
