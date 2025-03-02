//app/(tabs)/index.tsx

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Camera, Image } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  const router = useRouter();

  const openCamera = () => {
    router.push("/camera");
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.header}>
        <Text style={styles.title}>Photo Canvas</Text>
        <Text style={styles.subtitle}>Capture, Edit, Share</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create Your Story</Text>
          <Text style={styles.cardDescription}>
            Capture a moment, add stickers, draw on it, and share directly to
            Instagram Stories.
          </Text>

          <TouchableOpacity style={styles.button} onPress={openCamera}>
            <Camera size={24} color="#fff" />
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Camera size={24} color="#6366f1" />
            </View>
            <Text style={styles.featureTitle}>Capture</Text>
            <Text style={styles.featureDescription}>
              Take photos with your camera
            </Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Image size={24} color="#6366f1" />
            </View>
            <Text style={styles.featureTitle}>Edit</Text>
            <Text style={styles.featureDescription}>
              Add stickers and drawings
            </Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Image size={24} color="#6366f1" />
            </View>
            <Text style={styles.featureTitle}>Share</Text>
            <Text style={styles.featureDescription}>
              Post directly to Instagram
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb"
  },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff"
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 5
  },
  content: {
    flex: 1,
    padding: 20
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 10
  },
  cardDescription: {
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 20,
    lineHeight: 24
  },
  button: {
    backgroundColor: "#6366f1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  featureItem: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 5
  },
  featureDescription: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center"
  }
});
