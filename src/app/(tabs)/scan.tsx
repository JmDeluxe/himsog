import {
  BarcodeScanningResult,
  CameraView,
  scanFromURLAsync,
  useCameraPermissions,
} from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NutritionDisplay } from "@/components/nutrition-display";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useFoodLog } from "@/hooks/use-food-log";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";
import { fetchProduct, Product } from "@/services/open-food-facts";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [logged, setLogged] = useState(false);
  const theme = useTheme();
  const router = useRouter();
  const { addEntry } = useFoodLog();
  const toast = useToast();

  useEffect(() => {
    if (permission && !permission.granted && !permission.canAskAgain) {
      return;
    }
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const lookupBarcode = async (barcode: string) => {
    if (loading) return;
    Keyboard.dismiss();
    setLoading(true);
    setProduct(null);

    const result = await fetchProduct(barcode);
    if (result) {
      setProduct(result);
    } else {
      Alert.alert(
        "Product Not Found",
        "This barcode was not found in the Open Food Facts database.",
      );
      setScanned(false);
    }
    setLoading(false);
  };

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    if (scanned || loading) return;
    setScanned(true);
    lookupBarcode(result.data);
  };

  const handleManualSearch = () => {
    if (!manualCode.trim()) return;
    setScanned(true);
    lookupBarcode(manualCode.trim());
  };

  const handleRescan = () => {
    setScanned(false);
    setProduct(null);
    setManualCode("");
    setLogged(false);
  };

  const handlePickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (result.canceled) return;

    setLoading(true);
    setProduct(null);

    try {
      const barcodes = await scanFromURLAsync(result.assets[0].uri, [
        "ean13",
        "ean8",
        "upc_a",
        "upc_e",
        "qr",
      ]);

      if (barcodes.length > 0) {
        lookupBarcode(barcodes[0].data);
      } else {
        Alert.alert(
          "No Barcode Found",
          "No barcode was detected in the selected image.",
        );
        setLoading(false);
        setScanned(false);
      }
    } catch {
      Alert.alert(
        "Scan Failed",
        "Could not read barcodes from the selected image.",
      );
      setLoading(false);
      setScanned(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={theme.text} />
        <ThemedText style={styles.loadingText}>
          Looking up product...
        </ThemedText>
      </ThemedView>
    );
  }

  const handleLogFood = () => {
    if (!product || logged) return;
    const cal = product.calories.value ?? 0;
    addEntry({
      name: product.name,
      calories: cal,
      protein: product.protein.value ?? 0,
      carbs: product.carbohydrates.value ?? 0,
      fat: product.fat.value ?? 0,
      servingSize: product.servingSize ?? "per 100g",
      source: "barcode",
    });
    setLogged(true);
    toast.show({ message: `Logged ${cal} kcal`, type: "success" });
    setTimeout(() => {
      router.push("/food-log");
    }, 600);
  };

  if (product) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.resultSafeArea}>
          <NutritionDisplay product={product} />
          <View style={styles.resultActions}>
            {product.calories.value !== null && (
              <TouchableOpacity
                style={[
                  styles.logButton,
                  {
                    backgroundColor: logged
                      ? theme.success || "#00B894"
                      : theme.accent,
                  },
                ]}
                onPress={handleLogFood}
                disabled={logged}
              >
                <ThemedText
                  type="smallBold"
                  style={{ color: theme.background }}
                >
                  {logged
                    ? "Logged ✓"
                    : `Log ${product.calories.value ?? 0} kcal`}
                </ThemedText>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.rescanButton,
                { backgroundColor: theme.backgroundElement },
              ]}
              onPress={handleRescan}
            >
              <ThemedText type="smallBold">Scan Another</ThemedText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const cameraReady = permission?.granted;

  return (
    <ThemedView style={styles.container}>
      {cameraReady ? (
        <ThemedView style={styles.scannerContainer}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "qr"],
            }}
          />
          <SafeAreaView style={styles.scannerOverlay} pointerEvents="none">
            <ThemedView style={styles.scanFrame} />
            <ThemedText type="small" style={styles.scanHint}>
              Point the camera at a barcode
            </ThemedText>
          </SafeAreaView>
        </ThemedView>
      ) : (
        <ThemedView style={styles.centered}>
          <ThemedText type="subtitle" style={styles.errorTitle}>
            No Camera Access
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.errorText}>
            Grant camera permission or enter the barcode manually below.
          </ThemedText>
        </ThemedView>
      )}

      <ThemedView style={styles.manualSection}>
        <ThemedText type="smallBold" style={styles.manualLabel}>
          Enter barcode manually
        </ThemedText>
        <ThemedView style={styles.manualRow}>
          <TextInput
            style={[
              styles.manualInput,
              { borderColor: theme.backgroundSelected, color: theme.text },
            ]}
            value={manualCode}
            onChangeText={setManualCode}
            placeholder="e.g. 3017620422003"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
            onSubmitEditing={handleManualSearch}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={[
              styles.searchButton,
              { backgroundColor: theme.backgroundElement },
            ]}
            onPress={handleManualSearch}
          >
            <ThemedText type="smallBold">Search</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        <TouchableOpacity
          style={[
            styles.galleryButton,
            { backgroundColor: theme.backgroundElement },
          ]}
          onPress={handlePickFromGallery}
        >
          <ThemedText type="smallBold">Pick from Gallery</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  scannerContainer: {
    flex: 1,
    position: "relative",
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: Spacing.two,
    backgroundColor: "transparent",
  },
  scanHint: {
    color: "#ffffff",
    marginTop: Spacing.three,
  },
  errorTitle: {
    textAlign: "center",
  },
  errorText: {
    textAlign: "center",
  },
  loadingText: {
    marginTop: Spacing.two,
  },
  resultSafeArea: {
    flex: 1,
  },
  resultActions: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.three,
  },
  logButton: {
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
  },
  rescanButton: {
    alignSelf: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
  manualSection: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  manualLabel: {
    fontSize: 14,
  },
  manualRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  manualInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
  },
  searchButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    justifyContent: "center",
  },
  galleryButton: {
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: "center",
  },
});
