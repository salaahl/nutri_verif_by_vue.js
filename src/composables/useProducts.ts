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

type SearchMethod = 'complete' | 'more'

const API_BASE_URL = 'https://world.openfoodfacts.org/cgi/search.pl'

async function fetchWithTimeout(
  resource: string,
  options: { timeout?: number; method?: string; headers?: HeadersInit; body?: string } = {}
) {
  const { timeout = 10000 } = options

  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  const response = await fetch(resource, {
    ...options,
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
  const productsIsLoading = ref(false)
  const product = reactive<Product>(transformProduct({}))
  const productIsLoading = ref(false)
  const lastProducts = ref<Products[]>([])
  const lastProductsIsLoading = ref(false)
  const suggestedProducts = ref<Products[]>([])
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
  const page = ref<number>(1)
  const pages = ref<number>(1)
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
        ? new Date(product.last_updated_t * 1000).toLocaleDateString('fr-FR')
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
    sortBy: string | null,
    method: SearchMethod
  ) {
    if (userInput !== null) input.value = userInput
    if (sortBy !== null) filter.value = sortBy
    if (method === 'complete') {
      products.value = [] // Réinitialiser les produits en cas de nouvelle recherche
      page.value = 1
    } else if (method === 'more') {
      page.value++
    }

    const fields =
      'id,image_front_small_url,brands,generic_name_fr,nutriscore_grade,nova_group,categories_hierarchy'
    const route = `${API_BASE_URL}?search_terms=${encodeURIComponent(input.value)}&fields=${encodeURIComponent(fields)}&purchase_places_tags=france&sort_by=${encodeURIComponent(filter.value)}&page_size=20&page=${page.value}&search_simple=1&action=process&json=1`

    try {
      productsIsLoading.value = true
      error.value = null
      const response = await fetchWithTimeout(route)
      const data = await response.json()

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

    try {
      const route = `https://world.openfoodfacts.org/api/v3/product/${id}&fields=${encodeURIComponent(fields)}&json=1`
      const response = await fetchWithTimeout(route)
      const data = await response.json()

      Object.assign(product, transformProduct(data.product))
    } catch (err: any) {
      error.value = err.message || 'Une erreur est survenue'
    } finally {
      productIsLoading.value = false
    }
  }

  async function fetchLastProduct() {
    const fields =
      'id,image_front_small_url,brands,generic_name_fr,nutriscore_grade,nova_group,categories_hierarchy,created_t,completeness'
    const route = `${API_BASE_URL}?&fields=${encodeURIComponent(fields)}&purchase_places_tags=france&sort_by=created_t&page_size=300&action=process&json=1`
    error.value = null

    try {
      lastProductsIsLoading.value = true
      const response = await fetchWithTimeout(route)
      const data = await response.json()

      const filteredProducts = data.products
        .filter((product: { completeness: number }) => product.completeness >= 0.35)
        .sort((a: { created_t: number }, b: { created_t: number }) => b.created_t - a.created_t)
        .slice(0, 5)

      lastProducts.value.push(...filteredProducts.map(transformProducts))
    } catch (err: any) {
      error.value = err.message || 'Une erreur est survenue'
    } finally {
      lastProductsIsLoading.value = false
    }
  }

  async function fetchSuggestedProducts(
    id: string = product.id,
    brand: string = product.brand,
    name: string = product.name,
    nutriscore: string = product.nutriscore,
    novaGroup: string | number = product.novaGroup,
    categories: string[] = product.categories
  ) {
    let fields = 'id,nutriscore_grade,nova_group,completeness,popularity_key'
    let route = `${API_BASE_URL}?search_terms=${encodeURIComponent(name ?? brand.split(',')[0])}&categories_tags=${encodeURIComponent(categories.join('|'))}&fields=${encodeURIComponent(fields)}&purchase_places_tags=france&sort_by=nutriscore_score,nova_group,popularity_key&page_size=300&action=process&json=1`

    try {
      suggestedProducts.value = []
      suggestedProductsIsLoading.value = true
      error.value = null

      let response = await fetchWithTimeout(route, { timeout: 15000 })
      let data = await response.json()

      /*
       * Les produits suggérés doivent remplir les critères suivants :
       * - Ne pas être le produit actuel
       * - Avoir un nutriscore
       * - Avoir un nutriscore meilleur OU
       * - Avoir un nutriscore meilleur ET avoir un nova group meilleur
       * - Avoir un taux de complétude décent
       * Ils sont ensuite triés par nutriscore, nova group puis popularité
       */
      const score = ['a', 'b', 'c', 'd', 'e']
      const selectedProducts = data.products
        .filter(
          (e: { id: string; nutriscore_grade: string; nova_group: number; completeness: number }) =>
            e.id !== id &&
            e.nutriscore_grade !== 'not-applicable' &&
            e.nutriscore_grade !== 'unknown' &&
            (score.indexOf(e.nutriscore_grade) < score.indexOf(nutriscore) ||
              (score.indexOf(e.nutriscore_grade) === score.indexOf(nutriscore) &&
                typeof e.nova_group === 'number' &&
                e.nova_group < Number(novaGroup))) &&
            e.completeness >= 0.35
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
          'id,image_front_small_url,brands,generic_name_fr,nutriscore_grade,nova_group,categories_hierarchy,completeness,popularity_key'
        route = `${API_BASE_URL}?code=${encodeURIComponent(
          selectedProducts.map((e: { id: string }) => e['id']).join('|')
        )}
          &fields=${encodeURIComponent(fields)}
          &sort_by=nutriscore_score,nova_group,popularity_key&page_size=4&action=process&json=1`

        response = await fetchWithTimeout(route)
        data = await response.json()

        suggestedProducts.value.push(...data.products.reverse().map(transformProducts))
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
      const response = await fetchWithTimeout('https://jokes-api-platform.onrender.com/translate', {
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
    fetchLastProduct,
    fetchSuggestedProducts,
    getTranslatedCategories
  }
}
