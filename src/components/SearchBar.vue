<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProducts } from '../composables/useProducts'

interface AutocompleteItem {
  text: string
}

const props = withDefaults(
  defineProps<{
    toolbarIsVisible?: boolean
  }>(),
  {
    toolbarIsVisible: false
  }
)

const emit = defineEmits<{
  (e: 'search-status', status: boolean): void
}>()

const router = useRouter()
const {
  filter,
  input,
  autocompletionIsLoading,
  searchAutocompletion,
  productsIsLoading,
  searchProducts
} = useProducts()

const autocompletion = ref<AutocompleteItem[]>([])
const selectedFilter = ref<string>(filter.value || '-popularity_key')

let timer: ReturnType<typeof setTimeout> | undefined

const onInput = () => {
  clearTimeout(timer)
  timer = setTimeout(async () => {
    const query = input.value.trim()
    if (!query) {
      autocompletion.value = []
      return
    }
    autocompletion.value = await searchAutocompletion(query)
  }, 350)
}

const triggerSearch = async (searchTerm: string) => {
  const query = searchTerm.trim()
  if (!query) return

  autocompletion.value = []
  emit('search-status', false)

  // Redirection directe s'il s'agit d'un code-barres
  if (/^[0-9]{8,13}$/.test(query)) {
    router.push({ name: 'product', params: { id: query } })
    return
  }

  const activeSort = props.toolbarIsVisible ? selectedFilter.value : null
  window.scrollTo({ top: 0, behavior: 'smooth' })
  await searchProducts(query, activeSort, 'complete')
  emit('search-status', true)
}

const onSubmit = (event: Event) => {
  event.preventDefault()
  triggerSearch(input.value)
}

const selectSuggestion = (text: string) => {
  input.value = text
  triggerSearch(text)
}
</script>

<template>
  <section id="search-bar" class="relative mb-8 lg:mb-12">
    <form @submit="onSubmit" id="search-form" class="relative">
      <div class="w-full flex items-center justify-between">
        <label for="search-input" class="sr-only">Rechercher</label>

        <div class="relative w-full">
          <!-- Scanner de plat -->
          <RouterLink
            to="/dish-scanner"
            class="open-scanner lg:hidden absolute inset-y-0 start-0 flex items-center ps-6"
          >
            <svg id="search-bar-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path
                d="M416 0C400 0 288 32 288 176V288c0 35.3 28.7 64 64 64h32V480c0 17.7 14.3 32 32 32s32-14.3 32-32V352 240 32c0-17.7-14.3-32-32-32zM64 16C64 7.8 57.9 1 49.7 .1S34.2 4.6 32.4 12.5L2.1 148.8C.7 155.1 0 161.5 0 167.9c0 45.9 35.1 83.6 80 87.7V480c0 17.7 14.3 32 32 32s32-14.3 32-32V255.6c44.9-4.1 80-41.8 80-87.7c0-6.4-.7-12.8-2.1-19.1L191.6 12.5c-1.8-8-9.3-13.3-17.4-12.4S160 7.8 160 16V150.2c0 5.4-4.4 9.8-9.8 9.8c-5.1 0-9.3-3.9-9.8-9L127.9 14.6C127.2 6.3 120.3 0 112 0s-15.2 6.3-15.9 14.6L83.7 151c-.5 5.1-4.7 9-9.8 9c-5.4 0-9.8-4.4-9.8-9.8V16zm48.3 152l-.3 0-.3 0 .3-.7 .3 .7z"
              />
            </svg>
          </RouterLink>

          <!-- Scanner code-barres. Bouton désactivé sur les ordinateurs (> 1024px) -->
          <RouterLink
            to="/barcode-scanner"
            class="open-scanner lg:hidden absolute inset-y-0 end-0 flex items-center pe-6"
          >
            <svg class="search-bar-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path
                d="M160 224L224 224L224 160L160 160L160 224zM96 144C96 117.5 117.5 96 144 96L240 96C266.5 96 288 117.5 288 144L288 240C288 266.5 266.5 288 240 288L144 288C117.5 288 96 266.5 96 240L96 144zM160 480L224 480L224 416L160 416L160 480zM96 400C96 373.5 117.5 352 144 352L240 352C266.5 352 288 373.5 288 400L288 496C288 522.5 266.5 544 240 544L144 544C117.5 544 96 522.5 96 496L96 400zM416 160L416 224L480 224L480 160L416 160zM400 96L496 96C522.5 96 544 117.5 544 144L544 240C544 266.5 522.5 288 496 288L400 288C373.5 288 352 266.5 352 240L352 144C352 117.5 373.5 96 400 96zM384 416C366.3 416 352 401.7 352 384C352 366.3 366.3 352 384 352C401.7 352 416 366.3 416 384C416 401.7 401.7 416 384 416zM384 480C401.7 480 416 494.3 416 512C416 529.7 401.7 544 384 544C366.3 544 352 529.7 352 512C352 494.3 366.3 480 384 480zM480 512C480 494.3 494.3 480 512 480C529.7 480 544 494.3 544 512C544 529.7 529.7 544 512 544C494.3 544 480 529.7 480 512zM512 416C494.3 416 480 401.7 480 384C480 366.3 494.3 352 512 352C529.7 352 544 366.3 544 384C544 401.7 529.7 416 512 416zM480 448C480 465.7 465.7 480 448 480C430.3 480 416 465.7 416 448C416 430.3 430.3 416 448 416C465.7 416 480 430.3 480 448z"
              />
            </svg>
          </RouterLink>

          <input
            v-model="input"
            @input="onInput"
            type="text"
            :autocomplete="toolbarIsVisible ? 'on' : 'off'"
            id="search-input"
            class="block w-full px-12 p-2.5 text-ellipsis bg-gray-50 border-4 border-[#e5e7eb] text-gray-900 text-sm rounded-full outline-0 focus:ring-gray-400 focus:border-gray-400"
            placeholder="Entrez un nom de produit, un code-barres, une marque ou un type d'aliment"
            required
          />
        </div>

        <button
          type="submit"
          class="p-2.5 ms-2 text-sm font-medium text-white bg-blue-700 rounded-full border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300"
        >
          <svg
            class="w-4 h-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
          <span class="sr-only">Rechercher</span>
        </button>
      </div>

      <!-- Barre de filtres -->
      <div
        v-if="toolbarIsVisible"
        class="radio-toolbar w-full flex flex-wrap items-center mt-2 md:mt-6 text-sm text-gray-700"
      >
        <template
          v-for="option in [
            { id: 'popularity_key', value: '-popularity_key', label: 'Popularité' },
            { id: 'completeness', value: '-completeness', label: 'Complétude' },
            { id: 'created_t', value: '-created_t', label: 'Date d\'ajout' },
            { id: 'nutriscore_score', value: 'nutriscore_score', label: 'Nutriscore' },
            { id: 'nova_group', value: 'nova_group', label: 'Groupe Nova' }
          ]"
          :key="option.id"
        >
          <input
            type="radio"
            name="sort_by"
            :id="option.id"
            :value="option.value"
            v-model="selectedFilter"
          />
          <label
            :for="option.id"
            class="radio_label mt-2 md:mt-0 mr-4 text-sm font-semibold bg-gray-300 rounded-full cursor-pointer"
          >
            {{ option.label }}
          </label>
        </template>
      </div>

      <!-- Suggestions d'autocomplétion cliquables. Visible uniquement sur la page d'accueil -->
      <div
        v-if="!toolbarIsVisible && !autocompletionIsLoading && autocompletion.length > 0"
        class="autocompletion absolute w-full flex"
      >
        <div
          class="w-full bg-white border border-4 border-dashed border-gray-300 rounded-xl mt-1 z-20"
        >
          <ul>
            <li
              v-for="(item, index) in autocompletion"
              :key="index"
              @click="selectSuggestion(item.text)"
              class="w-fit m-2 px-4 py-2 bg-gray-300 hover:bg-[var(--color-green)] rounded-xl text-black hover:text-white text-sm font-semibold transition-colors duration-300 ease-in-out"
            >
              {{ item.text }}
            </li>
          </ul>
        </div>
        <!-- Placeholder ayant pour but d'aligner les suggestions sur la barre de recherche -->
        <div class="opacity-0 pointer-events-none p-2.5 ms-2">
          <svg
            class="w-4 h-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
      </div>
    </form>
  </section>
</template>

<style scoped>
#search-bar {
  position: sticky;
  width: 100%;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  border-radius: 10px;
  z-index: 99;
  transition: top 0.25s;
}

#search-bar.blur-bg {
  backdrop-filter: blur(5px);
  mask-image:
    linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%),
    linear-gradient(transparent 0%, black 6%, black 94%, transparent 100%);
  mask-composite: intersect;
}

#search-bar-icon {
  height: auto;
  width: 0.875rem;
  filter: contrast(0.5);
}

.open-scanner .search-bar-icon {
  width: 1.4rem;
}

#search-bar .lds-hourglass:after {
  margin: 0;
  border: 0.5rem solid #fff;
  border-color: hsla(160, 100%, 37%, 0.6) transparent var(--color-green) transparent;
}

.autocompletion {
  box-shadow:
    rgba(255, 255, 255, 0.01) 0px 1px 1px 0px inset,
    rgba(50, 50, 93, 0.025) 0px 50px 100px -20px,
    rgba(0, 0, 0, 0.03) 0px 30px 60px -30px;
}

@media (min-width: 1024px) {
  #search-bar.blur-bg {
    mask-image:
      linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%),
      linear-gradient(transparent 0%, black 15%, black 85%, transparent 100%);
  }
}
</style>
