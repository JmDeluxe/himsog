import React from 'react';
import { Image, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { NutrientInfo, Product } from '@/services/open-food-facts';

const NUTRISCORE_COLORS: Record<string, string> = {
  a: '#03823B',
  b: '#73B847',
  c: '#F9CB30',
  d: '#EE7E1E',
  e: '#DB1B26',
};

function NutrientRow({ nutrient }: { nutrient: NutrientInfo }) {
  return (
    <ThemedView style={styles.nutrientRow}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.nutrientLabel}>
        {nutrient.label}
      </ThemedText>
      <ThemedText type="smallBold" style={styles.nutrientValue}>
        {nutrient.value !== null ? `${nutrient.value} ${nutrient.unit}` : '—'}
      </ThemedText>
    </ThemedView>
  );
}

export function NutritionDisplay({ product }: { product: Product }) {
  const nutriscoreColor = product.nutriscoreGrade
    ? NUTRISCORE_COLORS[product.nutriscoreGrade.toLowerCase()] ?? '#888888'
    : '#888888';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {product.imageFrontUrl && (
        <Image source={{ uri: product.imageFrontUrl }} style={styles.productImage} resizeMode="contain" />
      )}

      <ThemedView style={styles.headerSection}>
        <ThemedText type="title" style={styles.productName}>{product.name}</ThemedText>
        {product.brand ? (
          <ThemedText themeColor="textSecondary" style={styles.brand}>{product.brand}</ThemedText>
        ) : null}
        {product.servingSize && (
          <ThemedText themeColor="textSecondary" type="small">Per {product.servingSize}</ThemedText>
        )}
        <ThemedText themeColor="textSecondary" type="small">Values per 100g</ThemedText>
      </ThemedView>

      <ThemedView style={styles.badgeRow}>
        {product.nutriscoreGrade && (
          <ThemedView style={[styles.badge, { backgroundColor: nutriscoreColor }]}>
            <ThemedText type="smallBold" style={styles.badgeText}>
              Nutri-Score {product.nutriscoreGrade.toUpperCase()}
            </ThemedText>
          </ThemedView>
        )}
        {product.novaGroup && (
          <ThemedView type="backgroundElement" style={styles.badge}>
            <ThemedText type="smallBold">NOVA {product.novaGroup}</ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      <ThemedView style={styles.nutrientsCard}>
        <NutrientRow nutrient={product.calories} />
        <NutrientRow nutrient={product.fat} />
        <NutrientRow nutrient={product.saturatedFat} />
        <NutrientRow nutrient={product.carbohydrates} />
        <NutrientRow nutrient={product.sugars} />
        <NutrientRow nutrient={product.protein} />
        <NutrientRow nutrient={product.fiber} />
        <NutrientRow nutrient={product.salt} />
        <NutrientRow nutrient={product.sodium} />
      </ThemedView>

      {product.ingredientsText && (
        <ThemedView style={styles.ingredientsSection}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>Ingredients</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">{product.ingredientsText}</ThemedText>
        </ThemedView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: Spacing.three,
  },
  headerSection: {
    gap: Spacing.one,
  },
  productName: {
    fontSize: 28,
    lineHeight: 34,
  },
  brand: {
    fontSize: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  badge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
  },
  badgeText: {
    color: '#ffffff',
  },
  nutrientsCard: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nutrientLabel: {
    flex: 1,
  },
  nutrientValue: {
    flex: 0,
  },
  ingredientsSection: {
    gap: Spacing.one,
  },
  sectionTitle: {
    fontSize: 16,
  },
});