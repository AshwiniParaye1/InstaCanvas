import { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  ScrollView,
  Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue
} from "react-native-reanimated";
import ViewShot, { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import * as Linking from "expo-linking";
import * as IntentLauncher from "expo-intent-launcher";
import { X, Save, Instagram, Pencil, Sticker } from "lucide-react-native";

// Sticker data
const STICKERS = [
  {
    id: "1",
    uri: "https://images.unsplash.com/photo-1600077106724-946750eeaf3c?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: "2",
    uri: "https://images.unsplash.com/photo-1600077107226-a67b309cd0f4?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: "3",
    uri: "https://images.unsplash.com/photo-1600077107654-c60b23d6d966?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: "4",
    uri: "https://images.unsplash.com/photo-1600077107906-14a6a58aa4e2?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: "5",
    uri: "https://images.unsplash.com/photo-1600077108345-8a4de80b1128?q=80&w=200&auto=format&fit=crop"
  }
];

// Drawing path type
type DrawingPath = {
  path: { x: number; y: number }[];
  color: string;
  width: number;
};

// Sticker type
type Sticker = {
  id: string;
  uri: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

export default function EditorScreen() {
  const { uri } = useLocalSearchParams<{
    uri: string;
  }>();
  const router = useRouter();
  const viewShotRef = useRef<ViewShot>(null);
  const [caption, setCaption] = useState("");
  const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<DrawingPath>({
    path: [],
    color: "#FF3B30",
    width: 5
  });
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [activeSticker, setActiveSticker] = useState<string | null>(null);
  const [drawingColor, setDrawingColor] = useState("#FF3B30");
  const [drawingMode, setDrawingMode] = useState(false);
  const [stickerMode, setStickerMode] = useState(false);

  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;

  // Function to add a sticker to the canvas
  const addSticker = (stickerUri: string) => {
    const newSticker: Sticker = {
      id: Date.now().toString(),
      uri: stickerUri,
      x: windowWidth / 2 - 50,
      y: windowHeight / 2 - 50,
      scale: 1,
      rotation: 0
    };
    setStickers([...stickers, newSticker]);
    setActiveSticker(newSticker.id);
  };

  // Function to handle drawing on the canvas
  const handleDrawingGesture = Gesture.Pan()
    .onStart((event) => {
      if (drawingMode) {
        setCurrentPath({
          path: [{ x: event.x, y: event.y }],
          color: drawingColor,
          width: 5
        });
      }
    })
    .onUpdate((event) => {
      if (drawingMode) {
        setCurrentPath((prev) => ({
          ...prev,
          path: [...prev.path, { x: event.x, y: event.y }]
        }));
      }
    })
    .onEnd(() => {
      if (drawingMode && currentPath.path.length > 0) {
        setDrawingPaths([...drawingPaths, currentPath]);
        setCurrentPath({ path: [], color: drawingColor, width: 5 });
      }
    });

  // Function to save the edited photo
  const savePhoto = async () => {
    if (viewShotRef.current) {
      try {
        const capturedUri = await captureRef(viewShotRef, {
          format: "png",
          quality: 1
        });

        // Save to media library
        const asset = await MediaLibrary.createAssetAsync(capturedUri);

        // Ensure we have an album for our app
        const album = await MediaLibrary.getAlbumAsync("PhotoCanvas");
        if (album === null) {
          await MediaLibrary.createAlbumAsync("PhotoCanvas", asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }

        Alert.alert("Success", "Photo saved to gallery");
      } catch (error) {
        console.error("Error saving photo:", error);
        Alert.alert("Error", "Failed to save photo");
      }
    }
  };

  // Function to share to Instagram Stories
  const shareToInstagram = async () => {
    if (viewShotRef.current) {
      try {
        const capturedUri = await captureRef(viewShotRef, {
          format: "png",
          quality: 1
        });

        // Check if Instagram is installed
        const instagramURL = "instagram://story";
        const canOpenInstagram = await Linking.canOpenURL(instagramURL);

        if (canOpenInstagram) {
          // For iOS, we can use the URL scheme
          if (Platform.OS === "ios") {
            // First save the image to the media library to get a proper URI
            const asset = await MediaLibrary.createAssetAsync(capturedUri);

            // Prepare Instagram Stories URL
            const instagramStoriesUrl = `instagram-stories://share?source_application=photocanvas`;

            // Share to Instagram Stories
            await Linking.openURL(instagramStoriesUrl);
          }
          // For Android, we need to use Intent Launcher
          else if (Platform.OS === "android") {
            // Save the image to the media library
            const asset = await MediaLibrary.createAssetAsync(capturedUri);

            // Launch Instagram with intent
            await IntentLauncher.startActivityAsync(
              "com.instagram.share.ADD_TO_STORY",
              {
                data: asset.uri,
                type: "image/*",
                extra: {
                  source_application: "photocanvas",
                  content_url: "",
                  top_background_color: "#33FF33",
                  bottom_background_color: "#FF00FF"
                }
              }
            );
          }
        } else {
          // Instagram is not installed
          Alert.alert(
            "Instagram Not Found",
            "Please install Instagram to share your photo to Stories.",
            [{ text: "OK" }]
          );
        }
      } catch (error) {
        console.error("Error sharing to Instagram:", error);
        Alert.alert("Error", "Failed to share to Instagram Stories");
      }
    }
  };

  // Function to discard changes and go back
  const discardChanges = () => {
    Alert.alert(
      "Discard Changes",
      "Are you sure you want to discard all changes?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => router.back()
        }
      ]
    );
  };

  // Render sticker with gesture handlers
  const renderSticker = (sticker: Sticker) => {
    const scale = useSharedValue(sticker.scale);
    const rotation = useSharedValue(sticker.rotation);
    const translateX = useSharedValue(sticker.x);
    const translateY = useSharedValue(sticker.y);
    const isActive = activeSticker === sticker.id;

    // Pan gesture for moving the sticker
    const panGesture = Gesture.Pan().onUpdate((event) => {
      translateX.value += event.translationX;
      translateY.value += event.translationY;
    });

    // Pinch gesture for scaling the sticker
    const pinchGesture = Gesture.Pinch()
      .onUpdate((event) => {
        scale.value = Math.max(0.5, Math.min(3, sticker.scale * event.scale));
      })
      .onEnd(() => {
        sticker.scale = scale.value;
      });

    // Rotation gesture
    const rotationGesture = Gesture.Rotation()
      .onUpdate((event) => {
        rotation.value = sticker.rotation + event.rotation;
      })
      .onEnd(() => {
        sticker.rotation = rotation.value;
      });

    // Combine gestures
    const composedGestures = Gesture.Simultaneous(
      panGesture,
      Gesture.Simultaneous(pinchGesture, rotationGesture)
    );

    // Animated style for the sticker
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { scale: scale.value },
          { rotate: `${rotation.value}rad` }
        ]
      };
    });

    // Update sticker position when it moves
    useEffect(() => {
      sticker.x = translateX.value;
      sticker.y = translateY.value;
    }, [translateX.value, translateY.value, sticker]);

    return (
      <GestureDetector gesture={composedGestures} key={sticker.id}>
        <Animated.View
          style={[
            styles.sticker,
            animatedStyle,
            isActive && styles.activeSticker
          ]}
        >
          <Image source={{ uri: sticker.uri }} style={styles.stickerImage} />

          {isActive && (
            <TouchableOpacity
              style={styles.deleteStickerButton}
              onPress={() => {
                setStickers(stickers.filter((s) => s.id !== sticker.id));
                setActiveSticker(null);
              }}
            >
              <X size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </Animated.View>
      </GestureDetector>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={discardChanges}>
          <X size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.headerTitle}>
          <Text style={styles.headerText}>Edit Photo</Text>
        </View>

        <TouchableOpacity style={styles.headerButton} onPress={savePhoto}>
          <Save size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <GestureHandlerRootView style={styles.canvasContainer}>
        <GestureDetector gesture={handleDrawingGesture}>
          <ViewShot ref={viewShotRef} style={styles.canvas}>
            <Image source={{ uri: uri }} style={styles.backgroundImage} />

            {/* Render drawing paths */}
            <View style={StyleSheet.absoluteFill}>
              {drawingPaths.map((path, index) => (
                <View key={index}>
                  {path.path.map((point, pointIndex) => {
                    if (pointIndex === 0) return null;
                    const prevPoint = path.path[pointIndex - 1];
                    return (
                      <View
                        key={pointIndex}
                        style={{
                          position: "absolute",
                          left: prevPoint.x,
                          top: prevPoint.y,
                          width: path.width,
                          height: path.width,
                          borderRadius: path.width / 2,
                          backgroundColor: path.color,
                          transform: [
                            {
                              translateX: (point.x - prevPoint.x) / 2
                            },
                            {
                              translateY: (point.y - prevPoint.y) / 2
                            },
                            {
                              rotate: `${Math.atan2(
                                point.y - prevPoint.y,
                                point.x - prevPoint.x
                              )}rad`
                            },
                            {
                              scaleX:
                                Math.hypot(
                                  point.x - prevPoint.x,
                                  point.y - prevPoint.y
                                ) / path.width
                            }
                          ]
                        }}
                      />
                    );
                  })}
                </View>
              ))}

              {/* Render current drawing path */}
              {currentPath.path.map((point, pointIndex) => {
                if (pointIndex === 0) return null;
                const prevPoint = currentPath.path[pointIndex - 1];
                return (
                  <View
                    key={pointIndex}
                    style={{
                      position: "absolute",
                      left: prevPoint.x,
                      top: prevPoint.y,
                      width: currentPath.width,
                      height: currentPath.width,
                      borderRadius: currentPath.width / 2,
                      backgroundColor: currentPath.color,
                      transform: [
                        {
                          translateX: (point.x - prevPoint.x) / 2
                        },
                        {
                          translateY: (point.y - prevPoint.y) / 2
                        },
                        {
                          rotate: `${Math.atan2(
                            point.y - prevPoint.y,
                            point.x - prevPoint.x
                          )}rad`
                        },
                        {
                          scaleX:
                            Math.hypot(
                              point.x - prevPoint.x,
                              point.y - prevPoint.y
                            ) / currentPath.width
                        }
                      ]
                    }}
                  />
                );
              })}
            </View>

            {/* Render stickers */}
            {stickers.map(renderSticker)}
          </ViewShot>
        </GestureDetector>
      </GestureHandlerRootView>

      {/* Caption input */}
      <View style={styles.captionContainer}>
        <TextInput
          style={styles.captionInput}
          placeholder="Add a caption..."
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={150}
        />
      </View>

      {/* Drawing color picker (shown only in drawing mode) */}
      {drawingMode && (
        <View style={styles.colorPicker}>
          <TouchableOpacity
            style={[
              styles.colorOption,
              { backgroundColor: "#FF3B30" },
              drawingColor === "#FF3B30" && styles.selectedColor
            ]}
            onPress={() => setDrawingColor("#FF3B30")}
          />
          <TouchableOpacity
            style={[
              styles.colorOption,
              { backgroundColor: "#FF9500" },
              drawingColor === "#FF9500" && styles.selectedColor
            ]}
            onPress={() => setDrawingColor("#FF9500")}
          />
          <TouchableOpacity
            style={[
              styles.colorOption,
              { backgroundColor: "#FFCC00" },
              drawingColor === "#FFCC00" && styles.selectedColor
            ]}
            onPress={() => setDrawingColor("#FFCC00")}
          />
          <TouchableOpacity
            style={[
              styles.colorOption,
              { backgroundColor: "#4CD964" },
              drawingColor === "#4CD964" && styles.selectedColor
            ]}
            onPress={() => setDrawingColor("#4CD964")}
          />
          <TouchableOpacity
            style={[
              styles.colorOption,
              { backgroundColor: "#5AC8FA" },
              drawingColor === "#5AC8FA" && styles.selectedColor
            ]}
            onPress={() => setDrawingColor("#5AC8FA")}
          />
          <TouchableOpacity
            style={[
              styles.colorOption,
              { backgroundColor: "#007AFF" },
              drawingColor === "#007AFF" && styles.selectedColor
            ]}
            onPress={() => setDrawingColor("#007AFF")}
          />
          <TouchableOpacity
            style={[
              styles.colorOption,
              { backgroundColor: "#5856D6" },
              drawingColor === "#5856D6" && styles.selectedColor
            ]}
            onPress={() => setDrawingColor("#5856D6")}
          />
          <TouchableOpacity
            style={[
              styles.colorOption,
              { backgroundColor: "#FF2D55" },
              drawingColor === "#FF2D55" && styles.selectedColor
            ]}
            onPress={() => setDrawingColor("#FF2D55")}
          />
        </View>
      )}

      {/* Sticker picker (shown only in sticker mode) */}
      {stickerMode && (
        <View style={styles.stickerPicker}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {STICKERS.map((sticker) => (
              <TouchableOpacity
                key={sticker.id}
                style={styles.stickerOption}
                onPress={() => addSticker(sticker.uri)}
              >
                <Image
                  source={{ uri: sticker.uri }}
                  style={styles.stickerPreview}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Bottom toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={[
            styles.toolbarButton,
            drawingMode && styles.activeToolbarButton
          ]}
          onPress={() => {
            setDrawingMode(!drawingMode);
            setStickerMode(false);
          }}
        >
          <Pencil size={24} color={drawingMode ? "#6366f1" : "#000"} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toolbarButton,
            stickerMode && styles.activeToolbarButton
          ]}
          onPress={() => {
            setStickerMode(!stickerMode);
            setDrawingMode(false);
          }}
        >
          <Sticker size={24} color={stickerMode ? "#6366f1" : "#000"} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton} onPress={shareToInstagram}>
          <Instagram size={24} color="#fff" />
          <Text style={styles.shareButtonText}>Share to Instagram</Text>
        </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb"
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20
  },
  headerTitle: {
    flex: 1,
    alignItems: "center"
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937"
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: "#000"
  },
  canvas: {
    flex: 1,
    backgroundColor: "#000"
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain"
  },
  captionContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb"
  },
  captionInput: {
    height: 60,
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1f2937"
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb"
  },
  toolbarButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    backgroundColor: "#f3f4f6"
  },
  activeToolbarButton: {
    backgroundColor: "#e0e7ff"
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6366f1",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10
  },
  shareButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8
  },
  colorPicker: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb"
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 5
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: "#000"
  },
  stickerPicker: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb"
  },
  stickerOption: {
    width: 70,
    height: 70,
    marginHorizontal: 5,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f3f4f6"
  },
  stickerPreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover"
  },
  sticker: {
    position: "absolute",
    width: 100,
    height: 100
  },
  activeSticker: {
    borderWidth: 2,
    borderColor: "#6366f1",
    borderRadius: 10
  },
  stickerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain"
  },
  deleteStickerButton: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center"
  }
});
