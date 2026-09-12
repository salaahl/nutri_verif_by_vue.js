<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Html5Qrcode } from 'html5-qrcode'
import { useProductsStore } from '../stores/products'
import { useProducts } from '../composables/useProducts'

const router = useRouter()
const route = useRoute()

const productsStore = useProductsStore()
const cameraPermission = computed<boolean>({
  get: () => productsStore.getCameraPermission,
  set: (val) => productsStore.setCameraPermission(val)
})
const geminiPermission = computed<boolean>({
  get: () => productsStore.getGeminiPermission,
  set: (val) => productsStore.setGeminiPermission(val)
})

const isBarcodeMode = route.path === '/barcode-scanner' ? ref(true) : ref(false)
const scannedCode = ref<string | null>(null)
let html5QrcodeScanner: Html5Qrcode | null = null
const dishNotes = ref<string>('')

const { fetchDish, productIsLoading } = useProducts()

const barcodeConfig = {
  fps: 10,
  qrbox: (width: number, height: number) => {
    const size = Math.min(width, height) * 0.8
    return { width: size, height: size / 2 }
  }
}

const dishesConfig = {
  fps: 2,
  aspectRatio: 1.0
}

async function startScanner() {
  if (!html5QrcodeScanner) {
    html5QrcodeScanner = new Html5Qrcode('scanner')
  }

  if (html5QrcodeScanner && !html5QrcodeScanner.isScanning) {
    try {
      await html5QrcodeScanner.start(
        { facingMode: 'environment' },
        isBarcodeMode.value ? barcodeConfig : dishesConfig,
        isBarcodeMode.value ? onScanSuccess : () => {},
        isBarcodeMode.value ? onScanFailure : () => {}
      )

      if (isBarcodeMode.value) {
        cameraPermission.value = true
      } else {
        cameraPermission.value = true
        geminiPermission.value = true
      }
    } catch (err: any) {
      console.error("Impossible d'accéder à la caméra :", err)
      // Détection si l'erreur vient d'un refus de l'utilisateur
      if (err.toString().includes('NotAllowedError') || err.toString().includes('Permission')) {
        cameraPermission.value = false
        geminiPermission.value = false
      }
    }
  }
}

async function stopScanner() {
  if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
    try {
      await html5QrcodeScanner.stop()
    } catch (err) {
      console.error('Erreur lors du stop de Html5Qrcode :', err)
    }
  }
}

async function onScanSuccess(decodedText: string, decodedResult: any) {
  scannedCode.value = decodedText

  try {
    await stopScanner()
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

// Extraction de la frame courante
function captureVideoFrame(maxDimension = 1024): Promise<Blob | null> {
  const container = document.getElementById('scanner')
  const video = container?.querySelector('video') as HTMLVideoElement | null

  if (!video || video.videoWidth === 0) {
    console.error('Flux vidéo introuvable')
    return Promise.resolve(null)
  }

  let width = video.videoWidth
  let height = video.videoHeight

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width)
      width = maxDimension
    } else {
      width = Math.round((width * maxDimension) / height)
      height = maxDimension
    }
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.resolve(null)

  ctx.drawImage(video, 0, 0, width, height)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8)
  })
}

async function searchDish() {
  try {
    const photoBlob = await captureVideoFrame()

    if (!photoBlob) {
      console.error('Échec de la capture photo')
      return
    }

    await stopScanner()
    await fetchDish(photoBlob, dishNotes.value)

    router.push('/dish')
  } catch (err) {
    console.error("Erreur lors de l'analyse ou de la redirection :", err)
    router.push('/dish')
  }
}

onMounted(async () => {
  if (
    (isBarcodeMode.value && cameraPermission.value) ||
    (!isBarcodeMode.value && cameraPermission.value && geminiPermission.value)
  ) {
    await startScanner()
  }
})

// Nettoyage de sécurité si l'utilisateur quitte la page sans avoir scanné
onBeforeUnmount(async () => {
  await stopScanner()
})
</script>

<template>
  <div class="w-full flex flex-col items-center">
    <!-- Titre -->
    <h2 class="title mb-8 text-2xl lg:text-3xl">
      Scanner un
      <span :class="isBarcodeMode ? 'text-[indianred]' : 'text-[#00bd7e]'">
        {{ isBarcodeMode ? 'code-barres' : 'plat' }}
      </span>
    </h2>

    <!-- Cadre Caméra -->
    <div
      id="scanner"
      class="h-auto w-full mb-6 aspect-square border-4 border-white rounded-lg overflow-hidden bg-black relative"
    >
      <!-- Le flux vidéo de la caméra s'affichera ici -->

      <!-- Fenêtres de consentement -->
      <div
        v-if="isBarcodeMode && !cameraPermission"
        class="w-full mb-12 p-4 aspect-square rounded-lg bg-black flex flex-col justify-center items-center p-6 text-center"
      >
        <p class="text-red-400 font-bold mb-2">Accès caméra</p>
        <p class="text-sm text-gray-300">
          Pour scanner un produit, veuillez autoriser l'accès à la caméra.
        </p>
        <button
          class="mt-6 text-white bg-red-500 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center inline-flex items-center"
          @click="startScanner()"
        >
          Autoriser l'accès à la caméra
        </button>
      </div>

      <div
        v-else-if="!isBarcodeMode && !geminiPermission"
        class="w-full p-4 aspect-square rounded-lg bg-black flex flex-col justify-center items-center p-6 text-center"
      >
        <p class="text-red-400 font-bold mb-2">Accès caméra</p>
        <p class="text-xs text-gray-300">
          L'analyse de vos plats est réalisée par l'IA de Google (Gemini). Pour protéger votre vie
          privée, cadrez uniquement vos aliments : veillez à ne laisser apparaître aucun visage,
          document ni élément personnel.
        </p>
        <button
          class="mt-6 text-white bg-red-500 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center inline-flex items-center"
          @click="startScanner()"
        >
          Autoriser l'accès à la caméra
        </button>
      </div>
    </div>

    <!-- Spinner de chargement -->
    <div
      v-if="productIsLoading"
      class="loader-container w-fit flex justify-center items-center my-6"
    >
      <div class="lds-hourglass"></div>
    </div>

    <!-- Contrôles sous la caméra -->
    <div v-if="!isBarcodeMode && !productIsLoading" class="w-full">
      <!-- Bloc Plat -->
      <div class="w-full flex flex-col items-center gap-4">
        <input
          v-model="dishNotes"
          type="text"
          placeholder="Précisions sur le plat (ex: 1 c.à.s d'huile, 150g de riz...)"
          maxlength="300"
          class="w-full p-3 text-sm rounded-lg border-4 border-gray-100 bg-white placeholder-gray-400 focus:outline-none focus:border-gray-200 transition-colors duration-300 ease-in-out"
        />

        <button
          type="button"
          class="my-6 p-6 bg-[indianred] rounded-full hover:scale-105 transition-transform cursor-pointer border-0"
          @click="searchDish"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="w-8">
            <path
              fill="rgba(255, 255, 255, 1.00)"
              d="M213.1 128.8L202.7 160L128 160C92.7 160 64 188.7 64 224L64 480C64 515.3 92.7 544 128 544L512 544C547.3 544 576 515.3 576 480L576 224C576 188.7 547.3 160 512 160L437.3 160L426.9 128.8C420.4 109.2 402.1 96 381.4 96L258.6 96C237.9 96 219.6 109.2 213.1 128.8zM320 256C373 256 416 299 416 352C416 405 373 448 320 448C267 448 224 405 224 352C224 299 267 256 320 256z"
            />
          </svg>
        </button>
      </div>
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
