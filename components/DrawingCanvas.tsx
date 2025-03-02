//components/DrawingCanvas.tsx

import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

type DrawingPath = {
  path: { x: number; y: number }[];
  color: string;
  width: number;
};

type DrawingCanvasProps = {
  color: string;
  strokeWidth: number;
  onPathsChange: (paths: DrawingPath[]) => void;
};

export default function DrawingCanvas({
  color,
  strokeWidth,
  onPathsChange
}: DrawingCanvasProps) {
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<DrawingPath>({
    path: [],
    color,
    width: strokeWidth
  });

  const panGesture = Gesture.Pan()
    .onStart((event) => {
      setCurrentPath({
        path: [{ x: event.x, y: event.y }],
        color,
        width: strokeWidth
      });
    })
    .onUpdate((event) => {
      setCurrentPath((prev) => ({
        ...prev,
        path: [...prev.path, { x: event.x, y: event.y }]
      }));
    })
    .onEnd(() => {
      if (currentPath.path.length > 0) {
        const newPaths = [...paths, currentPath];
        setPaths(newPaths);
        onPathsChange(newPaths);
        setCurrentPath({ path: [], color, width: strokeWidth });
      }
    });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={StyleSheet.absoluteFill}>
        {/* Render existing paths */}
        {paths.map((path, index) => (
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

        {/* Render current path */}
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
                      Math.hypot(point.x - prevPoint.x, point.y - prevPoint.y) /
                      currentPath.width
                  }
                ]
              }}
            />
          );
        })}
      </View>
    </GestureDetector>
  );
}
