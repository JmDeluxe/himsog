const BASE_URL = 'https://world.openfoodfacts.org/api/v2';

export interface NutrientInfo {
  label: string;
  value: number | null;
  unit: string;
}

export interface Product {
  name: string;
  brand: string;
  imageFrontUrl: string | null;
  calories: NutrientInfo;
  fat: NutrientInfo;
  saturatedFat: NutrientInfo;
  carbohydrates: NutrientInfo;
  sugars: NutrientInfo;
  protein: NutrientInfo;
  salt: NutrientInfo;
  sodium: NutrientInfo;
  fiber: NutrientInfo;
  servingSize: string | null;
  ingredientsText: string | null;
  nutriscoreGrade: string | null;
  novaGroup: number | null;
}

export async function fetchProduct(barcode: string): Promise<Product | null> {
  try {
    const response = await fetch(`${BASE_URL}/product/${barcode}.json`);
    const data = await response.json();

    if (data.status === 0 || !data.product) {
      return null;
    }

    const p = data.product;
    const nutriments = p.nutriments || {};

    return {
      name: p.product_name || 'Unknown Product',
      brand: p.brands || '',
      imageFrontUrl: p.image_front_url || null,
      calories: {
        label: 'Calories',
        value: nutriments['energy-kcal_serving'] ?? nutriments['energy-kcal_100g'] ?? null,
        unit: 'kcal',
      },
      fat: {
        label: 'Fat',
        value: nutriments.fat_100g ?? null,
        unit: 'g',
      },
      saturatedFat: {
        label: 'Saturated Fat',
        value: nutriments['saturated-fat_100g'] ?? null,
        unit: 'g',
      },
      carbohydrates: {
        label: 'Carbohydrates',
        value: nutriments.carbohydrates_100g ?? null,
        unit: 'g',
      },
      sugars: {
        label: 'Sugars',
        value: nutriments.sugars_100g ?? null,
        unit: 'g',
      },
      protein: {
        label: 'Protein',
        value: nutriments.proteins_100g ?? null,
        unit: 'g',
      },
      salt: {
        label: 'Salt',
        value: nutriments.salt_100g ?? null,
        unit: 'g',
      },
      sodium: {
        label: 'Sodium',
        value: nutriments.sodium_100g ?? null,
        unit: 'g',
      },
      fiber: {
        label: 'Fiber',
        value: nutriments.fiber_100g ?? null,
        unit: 'g',
      },
      servingSize: p.serving_size || null,
      ingredientsText: p.ingredients_text || null,
      nutriscoreGrade: p.nutriscore_grade || null,
      novaGroup: p.nova_group ?? null,
    };
  } catch {
    return null;
  }
}