import { reactive, ref, computed } from 'vue'
import { useProductsStore } from '../stores/products'

interface Products {
  id: string
  image: string
  brand: string
  name: string
  nutriscore: string
  nova: number | string
  category: string
}

interface Product {
  id: string
  image: string
  brand: string
  name: string
  categories: string[]
  lastUpdate: string
  nutriscore: string
  novaGroup: number | string
  quantity: string
  serving_size: string
  ingredients: string
  nutriments: { [key: string]: string }
  nutrient_levels: string
  manufacturingPlace: string
  link: string
}

interface APIProducts {
  id?: string
  image_front_small_url?: string
  brands?: string
  generic_name_fr?: string
  nutriscore_grade?: string
  nova_group?: number | string
  categories_hierarchy?: string[]
}

interface APIProduct {
  id?: string
  image_front_url?: string
  brands?: string
  generic_name_fr?: string
  categories_hierarchy?: string[]
  last_updated_t?: number
  nutriscore_grade?: string
  nova_group?: number | string
  quantity?: string
  serving_size?: string
  ingredients_text_with_allergens_fr?: string
  nutriments?: { [key: string]: string }
  nutrient_levels?: string
  manufacturing_places?: string
  link?: string
}

interface FetchSuggestionsOptions {
  id?: string
  brand?: string
  name?: string
  nutriscore?: string
  novaGroup?: string | number
  categories?: string[]
  isFrom?: null | string
}

type SearchMethod = 'complete' | 'more'

const API_BASE_URL = 'https://world.openfoodfacts.org/cgi/search.pl'
const API_BASE_URL_V2 = 'https://world.openfoodfacts.org/api/v2'
const API_BASE_URL_V3 = 'https://world.openfoodfacts.org/api/v3'

// Détection du mode localhost / développement
const isLocalhost =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

async function fetchFromApi(
  resource: string,
  options: { timeout?: number; method?: string; headers?: HeadersInit; body?: string } = {}
) {
  const { timeout = 15000 } = options

  const mergedHeaders = {
    'User-Agent': 'NutriVérif/1.0 (sokhona.salaha@gmail.com)',
    ...options.headers
  }

  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  const response = await fetch(resource, {
    ...options,
    headers: mergedHeaders,
    signal: controller.signal
  })

  clearTimeout(id)
  return response
}

async function fetchFromProxy(
  resource: string,
  options: { timeout?: number; method?: string; headers?: HeadersInit; body?: string } = {}
) {
  // Timeout par défaut de 2 minutes pour laisser le temps au serveur de se réveiller lors de la 1ère requête
  const { timeout = 120000, method = 'GET' } = options

  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  if (resource.startsWith('/') || (resource.includes('localhost') && !resource.includes(':8000'))) {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(id)
    return response
  }

  const proxyUrl = 'https://jokes-api-platform.onrender.com/search-products'

  const proxyBody = JSON.stringify({
    url: resource,
    method: method
  })

  const response = await fetch(proxyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    body: proxyBody,
    signal: controller.signal
  })

  clearTimeout(id)
  return response
}

export function useProducts() {
  const productsStore = useProductsStore()
  const products = computed<Products[]>({
    get: () => productsStore.getProducts,
    set: (val) => productsStore.updateProducts(val)
  })
  const productsIsLoading = computed<boolean>({
    get: () => productsStore.getProductsLoadingState,
    set: (val) => productsStore.updateProductsLoadingState(val)
  })
  const product = reactive<Product>(transformProduct({}))
  const productIsLoading = ref(false)
  const lastProducts = ref<Products[]>([])
  const lastProductsIsLoading = ref(false)
  const suggestedProducts = ref<Products[]>([])
  const homeSuggestedProducts = ref<Products[]>([])
  const suggestedProductsIsLoading = ref(false)
  const ajrSelected = computed<string>({
    get: () => productsStore.getAjrSelected,
    set: (val) => productsStore.updateAjrSelected(val)
  })
  const novaDescription = {
    '1': 'Aliments non transformés / minimalement',
    '2': 'Ingrédients culinaires transformés',
    '3': 'Aliments transformés',
    '4': 'Produits ultra-transformés'
  }
  const ajrValues = computed<{ [key: string]: number }>(() => {
    if (ajrSelected.value === 'women') {
      return {
        energy: 2000,
        fat: 70,
        saturatedFat: 20,
        carbohydrates: 260,
        sugars: 90,
        salt: 6,
        fiber: 25,
        proteins: 50
      }
    } else {
      return {
        energy: 2500,
        fat: 95,
        saturatedFat: 30,
        carbohydrates: 300,
        sugars: 120,
        salt: 6,
        fiber: 30,
        proteins: 50
      }
    }
  })
  const input = computed<string>({
    get: () => productsStore.getInput,
    set: (val) => productsStore.updateInput(val)
  })
  const filter = computed<string>({
    get: () => productsStore.getFilter,
    set: (val) => productsStore.updateFilter(val)
  })
  const page = computed<number>({
    get: () => productsStore.getPage,
    set: (val) => productsStore.updatePage(val)
  })
  const pages = computed<number>({
    get: () => productsStore.getPages,
    set: (val) => productsStore.updatePages(val)
  })
  const error = ref<string | null>(null)

  function transformProducts(product: APIProducts): Products {
    return {
      id: product.id ?? '',
      image: product.image_front_small_url ?? '/logo.png',
      brand: product.brands ?? '',
      name: product.generic_name_fr ?? '',
      nutriscore: product.nutriscore_grade ?? 'unknown',
      nova: product.nova_group ?? 'unknown',
      category:
        product.categories_hierarchy?.find((category: string) => category.startsWith('fr:')) ?? ''
    }
  }

  function transformProduct(product: APIProduct): Product {
    return {
      id: product.id ?? '',
      image: product.image_front_url ?? '/logo.png',
      brand: product.brands ?? '',
      name: product.generic_name_fr ?? '',
      categories: product.categories_hierarchy ?? [],
      lastUpdate: product.last_updated_t
        ? new Date(product.last_updated_t * 1000).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : '',
      nutriscore: product.nutriscore_grade ?? 'unknown',
      novaGroup: product.nova_group ?? 'unknown',
      quantity: product.quantity ?? '',
      serving_size: product.serving_size ?? '',
      ingredients: product.ingredients_text_with_allergens_fr ?? '',
      nutriments: product.nutriments ?? {},
      nutrient_levels: product.nutrient_levels ?? '',
      manufacturingPlace: product.manufacturing_places ?? '',
      link: product.link ?? ''
    }
  }

  async function searchProducts(
    userInput: string | null,
    sortBy: string | null | undefined,
    method: SearchMethod
  ) {
    if (userInput) input.value = userInput
    if (sortBy) filter.value = sortBy
    if (method === 'complete') {
      products.value = [] // Réinitialiser les produits en cas de nouvelle recherche
      page.value = 1
    } else if (method === 'more') {
      page.value++
    }

    const fields =
      'id,image_front_small_url,brands,generic_name_fr,nutriscore_grade,nova_group,categories_hierarchy'
    let route = '/data/mock-products.json'

    if (!isLocalhost) {
      const params = new URLSearchParams({
        search_terms: input.value,
        fields: fields,
        purchase_places_tags: 'france',
        sort_by: filter.value,
        page_size: '20',
        page: page.value.toString(),
        search_simple: '1',
        action: 'process',
        json: '1'
      })

      route = `${API_BASE_URL}?${params.toString()}`
    }

    try {
      productsIsLoading.value = true
      error.value = null
      const response = await fetchFromProxy(route)
      const data = await response.json()

      if (isLocalhost && data.products) {
        const multiplicationFactor = 5 // 4 produits issus de mock-products x 5 = 20 produits
        const multipliedProducts: any[] = []

        for (let i = 0; i < multiplicationFactor; i++) {
          const clone = data.products.map((product: any, index: number) => ({
            ...product,
            id: Math.random().toString(36).substring(2, 9) + index.toString(),
            generic_name: `${product.product_name} ${i + 1}`
          }))
          multipliedProducts.push(...clone)
        }

        data.products = multipliedProducts
        data.count = multipliedProducts.length * 2 // On multiplie le nombre de produits par 2 pour simuler la pagination
      }

      if (method === 'complete') pages.value = Math.ceil(data.count / 20)

      products.value.push(...data.products.map(transformProducts))
    } catch (err: any) {
      error.value = err.message || 'Une erreur est survenue'
    } finally {
      productsIsLoading.value = false
    }
  }

  async function fetchProduct(id: string) {
    productIsLoading.value = true
    error.value = null
    const fields =
      'id,image_front_url,brands,generic_name_fr,categories_hierarchy,last_updated_t,nutriscore_grade,nova_group,quantity,serving_size,ingredients_text_with_allergens_fr,nutriments,nutrient_levels,manufacturing_places,link'
    const route = isLocalhost
      ? '/data/mock-product.json'
      : `${API_BASE_URL_V3}/product/${id}?fields=${fields}&json=1`

    let data

    try {
      const response = await fetchFromApi(route)
      if (!response.ok) throw new Error('Échec de la requête')
      data = await response.json()
    } catch (apiErr) {
      try {
        const response = await fetchFromProxy(route)
        if (!response.ok) throw new Error(`Le proxy a répondu avec un statut ${response.status}`)
        data = await response.json()
      } catch (proxyErr: any) {
        error.value = 'Impossible de récupérer le produit, même via le serveur de secours.'
        productIsLoading.value = false
        return
      }
    }

    if (data && data.product) {
      Object.assign(product, transformProduct(data.product))
    } else {
      error.value = "Le produit n'existe pas dans la base de données."
    }

    productIsLoading.value = false
  }

  async function fetchLastProducts() {
    const fields =
      'id,image_front_small_url,brands,generic_name_fr,nutriscore_grade,nova_group,categories_hierarchy,created_t'
    const route = isLocalhost
      ? '/data/mock-products.json'
      : `${API_BASE_URL_V2}/search?fields=${fields}&purchase_places_tags=france&states_tags=en:brands-completed,en:product-name-completed,en:photos-uploaded&sort_by=created_t&page_size=15&action=process&json=1`

    error.value = null

    try {
      lastProductsIsLoading.value = true
      const response = await fetchFromProxy(route)
      const data = await response.json()

      const filteredProducts = data.products
        // .filter((product: { completeness: number }) => product.completeness >= 0.35)
        .sort((a: { created_t: number }, b: { created_t: number }) => b.created_t - a.created_t)
        .slice(0, 5)

      lastProducts.value.push(...filteredProducts.map(transformProducts))
    } catch (err: any) {
      error.value = err.message || 'Une erreur est survenue'
    } finally {
      lastProductsIsLoading.value = false
    }
  }

  async function fetchSuggestedProducts({
    id = product.id,
    brand = product.brand,
    name = product.name,
    nutriscore = product.nutriscore,
    novaGroup = product.novaGroup,
    categories = product.categories,
    isFrom = null
  }: FetchSuggestionsOptions = {}) {
    if (isFrom === 'home' && homeSuggestedProducts.value.length > 0) return

    let fields = 'id,nutriscore_grade,nova_group,popularity_key'
    const cleanName = name.trim().replace(/\s+/g, ' ').split(' ').slice(0, 1).join(' ')
    let route = isLocalhost
      ? '/data/mock-products.json'
      : `${API_BASE_URL}?search_terms=${encodeURIComponent(cleanName || brand.split(',')[0])}${
          categories && categories.length
            ? `&categories_tags=${categories.slice(0, 2).join(',')}`
            : ''
        }&purchase_places_tags=france&page_size=100&action=process&json=1`

    try {
      suggestedProducts.value = []
      suggestedProductsIsLoading.value = true
      error.value = null

      let response = await fetchFromProxy(route)
      let data = await response.json()

      /*
       * Les produits suggérés doivent remplir les critères suivants :
       * - Ne pas être le produit actuel
       * - Avoir un nutriscore
       * - Avoir un nutriscore meilleur OU
       * - Avoir un nutriscore meilleur ET avoir un nova group meilleur
       * - Avoir un taux de complétude décent - retiré et remplacé par le filtre states_tags
       * Ils sont ensuite triés par nutriscore, nova group puis popularité
       */
      const score = ['a', 'b', 'c', 'd', 'e']
      const selectedProducts = data.products
        .filter(
          (e: {
            id: string
            nutriscore_grade: string
            nova_group: number /* completeness: number */
          }) =>
            e.id !== id &&
            e.nutriscore_grade !== 'not-applicable' &&
            e.nutriscore_grade !== 'unknown' &&
            (score.indexOf(e.nutriscore_grade) < score.indexOf(nutriscore) ||
              (score.indexOf(e.nutriscore_grade) === score.indexOf(nutriscore) &&
                typeof e.nova_group === 'number' &&
                e.nova_group < Number(novaGroup)))
          /* && e.completeness >= 0.35 */
        )
        .sort(
          (
            a: { nutriscore_grade: string; nova_group: number; popularity_key: number },
            b: { nutriscore_grade: string; nova_group: number; popularity_key: number }
          ) => {
            const nutriscoreComparison =
              score.indexOf(a.nutriscore_grade) - score.indexOf(b.nutriscore_grade)
            if (nutriscoreComparison !== 0) return nutriscoreComparison

            const novaGroupComparison = a.nova_group - b.nova_group
            if (novaGroupComparison !== 0) return novaGroupComparison

            return b.popularity_key - a.popularity_key
          }
        )
        .slice(0, 4)

      if (selectedProducts.length) {
        // Je récupère les informations complètes des produits selectionnés
        fields =
          'id,image_front_small_url,brands,generic_name_fr,nutriscore_grade,nova_group,categories_hierarchy,popularity_key'

        const codesParam = selectedProducts.map((e: { id: string }) => e.id).join('|')

        route = isLocalhost
          ? '/data/mock-products.json'
          : `${API_BASE_URL}?code=${codesParam}&fields=${fields}&page_size=4&action=process&json=1`

        response = await fetchFromProxy(route)
        data = await response.json()

        isFrom === 'home'
          ? homeSuggestedProducts.value.push(...data.products.reverse().map(transformProducts))
          : suggestedProducts.value.push(...data.products.reverse().map(transformProducts))
      }
    } catch (err: any) {
      error.value = err.message || 'Une erreur est survenue'
    } finally {
      suggestedProductsIsLoading.value = false
    }
  }

  async function getTranslatedCategories(categories: string[]): Promise<string[]> {
    if (!categories?.length) return []

    const cleanCategory = (cat: string, langPrefix: string) =>
      cat
        .trim()
        .replace(new RegExp(`^${langPrefix}:`), '')
        .replace(/-/g, ' ')
        .trim()

    const frenchCategories: string[] = categories
      .filter((c) => c.startsWith('fr:'))
      .map((c) => cleanCategory(c, 'fr'))

    const englishCategories: string[] = categories
      .filter((c) => c.startsWith('en:'))
      .map((c) => cleanCategory(c, 'en'))

    // Limite de 4 catégories TTC
    const categoriesToTranslate: string = englishCategories
      .slice(0, 4 - frenchCategories.length)
      .join('<SEP>')

    if (!categoriesToTranslate) return frenchCategories

    let translatedCategories: string[] = []

    try {
      const response = await fetchFromProxy('https://jokes-api-platform.onrender.com/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: categoriesToTranslate, target_lang: 'FR' })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      translatedCategories = (data.translations?.[0]?.text.split('<SEP>') ?? []).map((c: string) =>
        c.trim()
      )
    } catch (error) {
      // Je conserve quand même les catégories anglaises
      translatedCategories = englishCategories.slice(0, 4 - frenchCategories.length)
      console.error('Erreur pendant la traduction :', error)
    }

    return [...frenchCategories, ...translatedCategories]
  }

  return {
    products,
    productsIsLoading,
    product,
    productIsLoading,
    lastProducts,
    lastProductsIsLoading,
    suggestedProducts,
    homeSuggestedProducts,
    suggestedProductsIsLoading,
    ajrSelected,
    novaDescription,
    ajrValues,
    filter,
    input,
    page,
    pages,
    error,
    searchProducts,
    fetchProduct,
    fetchLastProducts,
    fetchSuggestedProducts,
    getTranslatedCategories
  }
}
