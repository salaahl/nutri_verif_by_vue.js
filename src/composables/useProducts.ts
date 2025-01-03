import { reactive, ref, computed } from 'vue'
import { useProductsStore } from '../stores/products'

interface Products {
  id: string
  image: string
  brand: string
  name: string
  nutriscore: string
  nova: string
}

interface Product {
  id: string
  image: string
  brand: string
  generic_name: string
  categories: string[]
  lastUpdate: string
  nutriscore: string
  novaGroup: string
  quantity: string
  ingredients: string
  calories100g: string
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
  nova_group?: string
}

interface APIProduct {
  id?: string
  image_front_url?: string
  brands?: string
  generic_name_fr?: string
  categories?: string
  last_updated_t?: number
  nutriscore_grade?: string
  nova_group?: string
  quantity?: string
  ingredients_text_with_allergens_fr?: string
  nutriments?: { [key: string]: string }
  nutrient_levels?: string
  manufacturing_places?: string
  link?: string
}

type SearchMethod = 'complete' | 'more'

const API_BASE_URL = 'https://world.openfoodfacts.org/cgi/search.pl'

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
  const input = computed({
    get: () => productsStore.getInput,
    set: (val) => productsStore.updateInput(val)
  })
  const filter = ref('')
  const page = ref(1)
  const pages = ref(1)
  const error = ref<string | null>(null)

  function transformProducts(product: APIProducts): Products {
    return {
      id: product.id ?? '',
      image: product.image_front_small_url ?? './logo.png',
      brand: product.brands ?? 'Marque inconnue',
      name: product.generic_name_fr ?? 'Fiche incomplète',
      nutriscore: product.nutriscore_grade ?? 'unknown',
      nova: product.nova_group ?? 'unknown'
    }
  }

  function transformProduct(product: APIProduct): Product {
    return {
      id: product.id ?? '',
      image: product.image_front_url ?? '/logo.png',
      brand: product.brands ?? 'Marque inconnue',
      generic_name: product.generic_name_fr ?? 'Fiche incomplète',
      categories: product.categories?.split(',') ?? [],
      lastUpdate: product.last_updated_t
        ? new Date(product.last_updated_t * 1000).toLocaleDateString('fr-FR')
        : '',
      nutriscore: product.nutriscore_grade ?? 'unknown',
      novaGroup: product.nova_group ?? 'unknown',
      quantity: product.quantity ?? '',
      ingredients: product.ingredients_text_with_allergens_fr ?? '',
      calories100g: product.nutriments?.['energy-kcal_100g'] ?? '',
      nutrient_levels: product.nutrient_levels ?? '',
      manufacturingPlace: product.manufacturing_places ?? '',
      link: product.link ?? ''
    }
  }

  async function searchProducts(userInput: string | null, sortBy: string | null, method: SearchMethod) {
    if (userInput !== null) input.value = userInput
    if (sortBy !== null) filter.value = sortBy
    if (method === 'complete') {
      products.value = [] // Réinitialiser les produits en cas de nouvelle recherche
      page.value = 1
    } else if (method === 'more') {
      page.value++
    }

    const fields = 'id,image_front_small_url,brands,generic_name_fr,nutriscore_grade,nova_group'
    const route = `${API_BASE_URL}?search_terms=${input.value}&fields=${fields}&sort_by=${filter.value}&page_size=20&page=${page.value}&search_simple=1&action=process&json=1`

    try {
      productsIsLoading.value = true
      error.value = null
      const response = await fetch(route)
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

    try {
      const route = `https://world.openfoodfacts.org/api/v3/product/${id}.json`
      const response = await fetch(route)
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
      'id,image_front_small_url,brands,generic_name_fr,nutriscore_grade,nova_group,created_t,completeness'
    const route = `${API_BASE_URL}?&fields=${fields}&sort_by=created_t&page_size=300&action=process&json=1`
    error.value = null

    try {
      lastProductsIsLoading.value = true
      const response = await fetch(route)
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
    categories: string[] = product.categories
  ) {
    const fields =
      'id,categories,image_front_url,brands,generic_name_fr,nutriscore_grade,nova_group,last_updated_t,quantity,ingredients_text_with_allergens_fr,nutriments,manufacturing_places,link,completeness,popularity_key'
    const route = `${API_BASE_URL}?search_terms=${categories.slice(0, 5).join(',')}&fields=${fields}&sort_by=nutriscore_score,nova_group,popularity_key&page_size=300&action=process&json=1`

    try {
      suggestedProducts.value = []
      productsIsLoading.value = true
      error.value = null

      const response = await fetch(route)
      const data = await response.json()

      /*
       * Les produits suggérés doivent remplir les critères suivants :
       * - Ne pas être le produit actuel
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
            e.nutriscore_grade !== 'unknown' &&
            (score.indexOf(e.nutriscore_grade) < score.indexOf(product.nutriscore) ||
              (score.indexOf(e.nutriscore_grade) === score.indexOf(product.nutriscore) &&
                e.nova_group < parseInt(product.novaGroup))) &&
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

      suggestedProducts.value.push(...selectedProducts.map(transformProduct))
    } catch (err: any) {
      error.value = err.message || 'Une erreur est survenue'
    } finally {
      productsIsLoading.value = false
    }
  }

  return {
    products,
    productsIsLoading,
    product,
    productIsLoading,
    lastProducts,
    lastProductsIsLoading,
    suggestedProducts,
    input,
    page,
    pages,
    error,
    searchProducts,
    fetchProduct,
    fetchLastProduct,
    fetchSuggestedProducts
  }
}
