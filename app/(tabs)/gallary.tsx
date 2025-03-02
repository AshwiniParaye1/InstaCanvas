//app/(tabs)/gallary.tsx

import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import { Trash2, Share2 } from "lucide-react-native";

export default function GalleryScreen() {
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === "granted");

      if (status === "granted") {
        loadPhotos();
      }
    })();
  }, []);

  const loadPhotos = async () => {
    try {
      // Get only photos from the app's album
      const album = await MediaLibrary.getAlbumAsync("PhotoCanvas");

      if (album) {
        const { assets } = await MediaLibrary.getAssetsAsync({
          album: album,
          sortBy: ["creationTime"],
          mediaType: ["photo"]
        });
        setPhotos(assets);
      } else {
        setPhotos([]);
      }
    } catch (error) {
      console.error("Error loading photos:", error);
    }
  };

  const handlePhotoPress = (photo: MediaLibrary.Asset) => {
    router.push({
      pathname: "/editor",
      params: { uri: photo.uri, fromGallery: "true" }
    });
  };

  const handleDeletePhoto = async (photo: MediaLibrary.Asset) => {
    try {
      Alert.alert(
        "Delete Photo",
        "Are you sure you want to delete this photo?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              await MediaLibrary.deleteAssetsAsync([photo]);
              loadPhotos(); // Refresh the gallery
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error deleting photo:", error);
      Alert.alert("Error", "Failed to delete photo");
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting media library permissions...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>
          No access to media library. Please enable permissions in settings.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Gallery</Text>
      </View>

      {photos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No photos yet</Text>
          <Text style={styles.emptySubtext}>
            Photos you capture and edit will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.photoGrid}
          renderItem={({ item }) => (
            <View style={styles.photoContainer}>
              <TouchableOpacity onPress={() => handlePhotoPress(item)}>
                <Image source={{ uri: item.uri }} style={styles.photo} />
              </TouchableOpacity>
              <View style={styles.photoActions}>
                <TouchableOpacity
                  style={styles.photoAction}
                  onPress={() => handleDeletePhoto(item)}
                >
                  <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
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
  photoGrid: {
    padding: 10
  },
  photoContainer: {
    flex: 1,
    margin: 5,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  photo: {
    width: "100%",
    height: 180,
    borderRadius: 12
  },
  photoActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 8
  },
  photoAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6b7280",
    marginBottom: 10
  },
  emptySubtext: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center"
  }
});
