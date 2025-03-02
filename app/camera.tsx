//app/camera.tsx

import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState, useRef } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image
} from "react-native";

export default function Index() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef(null);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  if (!showCamera) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.openCameraButton}
          onPress={() => setShowCamera(true)}
        >
          <Text style={styles.openCameraText}>Open Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await (cameraRef.current as any).takePictureAsync();
      setPhoto(photo.uri);
    }
  };

  if (photo) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photo }} style={styles.previewImage} />
        <View style={styles.previewControls}>
          <TouchableOpacity
            style={styles.previewButton}
            onPress={() => {
              setPhoto(null);
            }}
          >
            <Text style={styles.previewButtonText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.previewButton}
            onPress={() => {
              setPhoto(null);
              setShowCamera(false);
            }}
          >
            <Text style={styles.previewButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowCamera(false)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={toggleCameraFacing}
          >
            <Text style={styles.flipButtonText}>Flip Camera</Text>
          </TouchableOpacity>

          {/* Improved Capture Button */}
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
            activeOpacity={0.7}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          {/* Added a text label below the capture button */}
          <View style={styles.captureTextContainer}>
            <Text style={styles.captureText}>Capture</Text>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  previewImage: {
    flex: 1,
    width: "100%",
    height: "100%"
  },
  previewControls: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20
  },
  previewButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 10,
    width: 120,
    alignItems: "center"
  },
  previewButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold"
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    borderWidth: 4,
    borderColor: "white",
    marginBottom: 10
  },
  captureButtonInner: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "white"
  },
  captureTextContainer: {
    alignItems: "center",
    marginBottom: 20
  },
  captureText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  container: {
    flex: 1,
    justifyContent: "center"
  },
  message: {
    textAlign: "center",
    paddingBottom: 10
  },
  camera: {
    flex: 1
  },
  controlsContainer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center"
  },
  flipButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 20,
    marginBottom: 20
  },
  flipButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white"
  },
  topBar: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    height: 50,
    flexDirection: "row",
    paddingHorizontal: 20,
    zIndex: 1
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center"
  },
  closeButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold"
  },
  openCameraButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 50
  },
  openCameraText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold"
  }
});
