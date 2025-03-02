import {
  StyleSheet,
  View,
  Text,
  Switch,
  TouchableOpacity,
  Linking,
  Alert,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Instagram, Info, ExternalLink, Github } from "lucide-react-native";

export default function SettingsScreen() {
  const [saveToGallery, setSaveToGallery] = useState(true);
  const [highQuality, setHighQuality] = useState(true);

  const openInstagram = async () => {
    const instagramUrl = "instagram://";
    const webUrl = "https://www.instagram.com/";

    try {
      const canOpen = await Linking.canOpenURL(instagramUrl);
      if (canOpen) {
        await Linking.openURL(instagramUrl);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      Alert.alert("Error", "Could not open Instagram");
    }
  };

  const openAbout = () => {
    Alert.alert(
      "About Photo Canvas",
      "Version 1.0.0\n\nPhoto Canvas is an interactive photo editing app that lets you capture, edit, and share photos directly to Instagram Stories.",
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingTitle}>Save to Gallery</Text>
            <Text style={styles.settingDescription}>
              Automatically save edited photos to your gallery
            </Text>
          </View>
          <Switch
            value={saveToGallery}
            onValueChange={setSaveToGallery}
            trackColor={{ false: "#d1d5db", true: "#818cf8" }}
            thumbColor={saveToGallery ? "#6366f1" : "#f3f4f6"}
          />
        </View>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingTitle}>High Quality Export</Text>
            <Text style={styles.settingDescription}>
              Export photos in high resolution
            </Text>
          </View>
          <Switch
            value={highQuality}
            onValueChange={setHighQuality}
            trackColor={{ false: "#d1d5db", true: "#818cf8" }}
            thumbColor={highQuality ? "#6366f1" : "#f3f4f6"}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Social</Text>

        <TouchableOpacity style={styles.linkItem} onPress={openInstagram}>
          <View style={styles.linkContent}>
            <Instagram size={24} color="#6366f1" />
            <Text style={styles.linkText}>Open Instagram</Text>
          </View>
          <ExternalLink size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <TouchableOpacity style={styles.linkItem} onPress={openAbout}>
          <View style={styles.linkContent}>
            <Info size={24} color="#6366f1" />
            <Text style={styles.linkText}>About Photo Canvas</Text>
          </View>
          <ExternalLink size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Photo Canvas v1.0.0</Text>
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
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937"
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb"
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 10,
    marginTop: 5
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6"
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 4
  },
  settingDescription: {
    fontSize: 14,
    color: "#6b7280"
  },
  linkItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6"
  },
  linkContent: {
    flexDirection: "row",
    alignItems: "center"
  },
  linkText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    marginLeft: 12
  },
  footer: {
    padding: 20,
    alignItems: "center"
  },
  footerText: {
    fontSize: 14,
    color: "#9ca3af"
  }
});
