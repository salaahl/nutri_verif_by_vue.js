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

interface APIProductsV2 {
  code?: string
  image_front_small_url?: string
  brands?: string[]
  product_name?: string
  nutriscore_grade?: string
  nova_group?: number | string
  categories_tags?: string[]
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
const API_BASE_URL_V4 = 'https://search.openfoodfacts.org/search'

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
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  // Timeout par défaut de 2 minutes pour laisser le temps au serveur de se réveiller lors de la 1ère requête
  const { timeout = 120000, method = 'GET', headers, body } = options

  const controller = new AbortController()
  const timerId = setTimeout(() => controller.abort(), timeout)

  if (resource.startsWith('/') || (resource.includes('localhost') && !resource.includes(':8000'))) {
    try {
      const response = await fetch(resource, {
        ...options,
        signal: controller.signal
      })
      return response
    } finally {
      clearTimeout(timerId)
    }
  }

  const proxyUrl = 'https://jokes-api-platform.onrender.com/search-products'

  // pour éviter que JSON.stringify() ne le transforme en "{}"
  const serializedBody = body instanceof URLSearchParams ? body.toString() : body

  const proxyBody = JSON.stringify({
    url: resource,
    method: method,
    body: serializedBody
  })

  try {
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: proxyBody,
      signal: controller.signal
    })

    if (!response.ok) {
      throw new Error(`Erreur locale HTTP ${response.status}`)
    }

    return response
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error(`Le proxy a mis trop de temps à répondre (${timeout}ms)`)
    }
    throw err
  } finally {
    clearTimeout(timerId)
  }
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

  function transformProductsV2(product: APIProductsV2): Products {
    return {
      id: product.code ?? '',
      image: product.image_front_small_url ?? '/logo.png',
      brand: product.brands ? product.brands.join(', ') : '',
      name: product.product_name ?? '',
      nutriscore: product.nutriscore_grade ?? 'unknown',
      nova: product.nova_group ?? 'unknown',
      category:
        product.categories_tags?.find((category: string) => category.startsWith('fr:')) ?? ''
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

    // Gestion de la pagination
    if (method === 'complete') {
      products.value = []
      page.value = 1
    } else if (method === 'more') {
      page.value++
    }

    const fields =
      'id,image_front_small_url,brands,generic_name_fr,nutriscore_grade,nova_group,categories_hierarchy'

    let route = isLocalhost ? '/data/mock-products.json' : API_BASE_URL
    let fetchMethod = isLocalhost ? 'GET' : 'POST'

    let fetchOptions: RequestInit & { timeout?: number } = {
      method: fetchMethod,
      timeout: 15000
    }

    if (!isLocalhost) {
      fetchOptions.body = new URLSearchParams({
        search_terms: input.value,
        fields: fields,
        purchase_places_tags: 'france',
        sort_by: filter.value || 'popularity_key',
        page_size: '20',
        page: page.value.toString(),
        search_simple: '1',
        action: 'process',
        json: '1'
      })
    }

    try {
      productsIsLoading.value = true
      error.value = null

      const response = await fetchFromProxy(route, fetchOptions)
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
    let route = isLocalhost ? '/data/mock-products.json' : `${API_BASE_URL_V2}/search`
    let fetchMethod = isLocalhost ? 'GET' : 'POST'

    let fetchOptions: RequestInit & { timeout?: number } = {
      method: fetchMethod,
      timeout: 15000
    }

    if (!isLocalhost) {
      fetchOptions.body = new URLSearchParams({
        fields: fields,
        purchase_places_tags: 'france',
        states_tags: 'en:brands-completed,en:product-name-completed,en:photos-uploaded',
        sort_by: 'created_t',
        page_size: '5',
        action: 'process',
        json: '1'
      })
    }

    try {
      error.value = null
      lastProductsIsLoading.value = true

      const response = await fetchFromProxy(route, fetchOptions)
      const data = await response.json()

      /*
      const filteredProducts = data.products
        .filter((product: { completeness: number }) => product.completeness >= 0.35)
        .sort((a: { created_t: number }, b: { created_t: number }) => b.created_t - a.created_t)
        .slice(0, 5)
      */

      lastProducts.value.push(...data.products.map(transformProducts))
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

    function cleanProductTitle(name: string): string {
      if (!name) return ''

      let cleaned = name.trim()

      const startRegex = /^(le|la|les|un|une|des|du|de|a|à|au|aux|en)\b\s*|^(l|d)['’]\s*/i
      const endRegex = /\s*\b(le|la|les|un|une|des|du|de|a|à|au|aux|en)$|\s*['’](l|d)$/i

      let previous
      do {
        previous = cleaned
        cleaned = cleaned.replace(startRegex, '').replace(endRegex, '').trim()
      } while (cleaned !== previous)

      return cleaned
    }

    let response, data, fields, route, method

    suggestedProducts.value = []
    suggestedProductsIsLoading.value = true
    error.value = null

    try {
      fields =
        'id,image_front_small_url,brands,generic_name_fr,nutriscore_grade,nova_group,categories_hierarchy,popularity_key'
      route = isLocalhost ? '/data/mock-products.json' : API_BASE_URL
      method = isLocalhost ? 'GET' : 'POST'

      let fetchOptions: RequestInit & { timeout?: number } = { method, timeout: 25000 }

      if (!isLocalhost) {
        fetchOptions.body = new URLSearchParams({
          search_terms: (name ?? brand.split(',')[0]).trim(),
          fields: fields,
          purchase_places_tags: 'france',
          states_tags: 'en:brands-completed,en:product-name-completed,en:photos-uploaded',
          sort_by: 'popularity_key',
          page_size: '500',
          action: 'process',
          json: '1'
        })
      }

      response = await fetchFromProxy(route, fetchOptions)
      data = await response.json()

      if (data.products.length > 0) {
        throw new Error("Aucun produit n'a pu être trouvé. Tentative avec le fallback...")
      }
    } catch (err: any) {
      console.warn('Première tentative non concluate. Lancement du fallback...')

      route = isLocalhost ? '/data/mock-productsV2.json' : API_BASE_URL_V4
      fields =
        'code,image_front_small_url,brands,product_name,nutriscore_grade,nova_group,categories_tags,popularity_key'

      let fetchOptions: RequestInit & { timeout?: number } = { method, timeout: 25000 }
      const cleanedName = cleanProductTitle(
        name.trim().split(/\s+/).slice(0, 3).join(' ') ?? brand.split(',')[0]
      )

      if (!isLocalhost) {
        fetchOptions.body = new URLSearchParams({
          q: cleanedName,
          langs: 'fr',
          fields: fields,
          purchase_places_tags: 'france',
          states_tags: 'en:brands-completed,en:product-name-completed,en:photos-uploaded',
          sort_by: 'popularity_key',
          page_size: '500',
          action: 'process',
          json: '1'
        })
      }

      try {
        response = await fetchFromProxy(route, fetchOptions)
        data = await response.json()
      } catch (fallbackErr: any) {
        error.value = fallbackErr.message || 'Impossible de joindre Open Food Facts.'
        suggestedProductsIsLoading.value = false
        return
      }
    }

    // Normalisation et filtrage des données
    const score = ['a', 'b', 'c', 'd', 'e']
    const specificCategories = categories ? categories.slice(-2) : []

    const rawProducts = data?.hits ?? data?.products ?? []
    const isV4 = !!data?.hits

    const selectedProducts = rawProducts
      .filter((e: any) => {
        const productCode = e.code ?? e.id
        const itemNutriscore = e.nutriscore_grade
        const itemNova = e.nova_group
        const itemTags = e.categories_tags ?? e.categories_hierarchy ?? []

        return (
          productCode !== id &&
          itemNutriscore !== 'not-applicable' &&
          itemNutriscore !== 'unknown' &&
          (score.indexOf(itemNutriscore) < score.indexOf(nutriscore) ||
            (score.indexOf(itemNutriscore) === score.indexOf(nutriscore) &&
              typeof itemNova === 'number' &&
              itemNova < Number(novaGroup))) &&
          // Filtrage par sous-catégories uniquement si v4
          (isV4 && specificCategories.length > 0
            ? itemTags.some((tag: string) => specificCategories.includes(tag))
            : true)
        )
      })
      // Nutriscore > nova > popularité
      .sort((a: any, b: any) => {
        const nutriscoreComparison =
          score.indexOf(a.nutriscore_grade) - score.indexOf(b.nutriscore_grade)
        if (nutriscoreComparison !== 0) return nutriscoreComparison

        const novaGroupComparison = (a.nova_group ?? 4) - (b.nova_group ?? 4)
        if (novaGroupComparison !== 0) return novaGroupComparison

        return (b.popularity_key ?? 0) - (a.popularity_key ?? 0)
      })
      .slice(0, 4)

    const targetArray = isFrom === 'home' ? homeSuggestedProducts : suggestedProducts
    targetArray.value.push(...selectedProducts.map(isV4 ? transformProductsV2 : transformProducts))

    suggestedProductsIsLoading.value = false
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
