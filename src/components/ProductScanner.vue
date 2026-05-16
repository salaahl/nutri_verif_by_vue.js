<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Html5Qrcode } from 'html5-qrcode'
import { useProducts } from '../composables/useProducts'

const router = useRouter()
const route = useRoute()

const scannedCode = ref<string | null>(null)
let html5QrcodeScanner: Html5Qrcode | null = null
const cameraPermissionDenied = ref(false)

const { productIsLoading } = useProducts()

onMounted(async () => {
  html5QrcodeScanner = new Html5Qrcode('scanner')

  const config = {
    fps: 10, // Images par seconde à analyser
    qrbox: (width: number, height: number) => {
      const size = Math.min(width, height) * 0.8
      return { width: size, height: size / 2 } // Format rectangulaire adapté aux codes-barres
    }
  }

  try {
    await html5QrcodeScanner.start(
      { facingMode: 'environment' }, // Caméra arrière du smartphone
      config,
      onScanSuccess,
      onScanFailure
    )
  } catch (err: any) {
    console.error("Impossible d'accéder à la caméra :", err)
    // Détection si l'erreur vient d'un refus de l'utilisateur
    if (err.toString().includes('NotAllowedError') || err.toString().includes('Permission')) {
      cameraPermissionDenied.value = true
    }
  }
})

async function onScanSuccess(decodedText: string, decodedResult: any) {
  scannedCode.value = decodedText

  try {
    // 1. On éteint d'abord proprement la caméra et on attend que ce soit fait
    await stopScanner()

    // 2. Une fois la caméra coupée, on redirige vers la page du produit
    router.push(`/product/${decodedText}`)
  } catch (err) {
    console.error("Erreur lors de l'arrêt du scanner ou de la redirection :", err)
    // Sécurité : on pousse quand même la route si le stop crash
    router.push(`/product/${decodedText}`)
  }
}

function onScanFailure(error: any) {
  // S'exécute à chaque frame où aucun code n'est détecté.
}

async function stopScanner() {
  if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
    try {
      await html5QrcodeScanner.stop()
    } catch (err) {
      console.error('Erreur lors du stop de Html5Qrcode:', err)
    }
  }
}

// Nettoyage de sécurité si l'utilisateur quitte la page sans avoir scanné
onBeforeUnmount(async () => {
  await stopScanner()
})
</script>

<template>
  <div class="flex flex-col items-center">
    <h2 class="title mb-12 text-2xl lg:text-3xl">
      Scanner un <span class="text-[indianred]">code-barres</span>
    </h2>
    <div
      v-if="cameraPermissionDenied"
      class="w-full mb-12 aspect-square border-4 border-red-500 rounded-lg bg-black flex flex-col justify-center items-center p-6 text-center"
    >
      <p class="text-red-400 font-bold mb-2">Accès à la caméra refusé</p>
      <p class="text-sm text-gray-300">
        Pour scanner un produit, veuillez cliquer sur l'icône de cadenas dans la barre d'adresse de
        votre navigateur et autoriser la caméra, puis actualisez la page.
      </p>
    </div>
    <div
      v-else
      id="scanner"
      class="h-auto w-full mb-12 aspect-square border-4 border-white rounded-lg overflow-hidden bg-black relative"
    >
      <!-- Le flux vidéo de la caméra s'affichera ici -->
    </div>
    <div
      v-if="productIsLoading"
      class="loader-container w-fit flex justify-center items-center m-auto"
    >
      <div class="lds-hourglass"></div>
    </div>
  </div>
</template>

<style scoped>
/* Force la caméra à respecter les bords arrondis de la div */
:deep(#scanner video) {
  object-fit: cover;
  width: 100% !important;
  height: 100% !important;
}
</style>
