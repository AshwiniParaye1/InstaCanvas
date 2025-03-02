// components/Sticker.js
import React from "react";
import { Animated, PanResponder, Image, StyleSheet } from "react-native";

class Sticker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pan: new Animated.ValueXY({ x: props.x, y: props.y }),
      scale: new Animated.Value(props.scale),
      rotation: new Animated.Value(props.rotation),
      lastGesture: null
    };

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt, gestureState) => {
        this.state.pan.setOffset({
          x: this.state.pan.x._value,
          y: this.state.pan.y._value
        });
        this.state.pan.setValue({ x: 0, y: 0 });
        this.setState({ lastGesture: null });
      },

      onPanResponderMove: (evt, gestureState) => {
        // Detect if this is a multi-touch gesture (pinch/rotate)
        if (evt.nativeEvent.touches.length > 1) {
          const touch1 = evt.nativeEvent.touches[0];
          const touch2 = evt.nativeEvent.touches[1];

          // Calculate distance and angle for pinch/rotate
          const dx = touch2.pageX - touch1.pageX;
          const dy = touch2.pageY - touch1.pageY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

          if (this.state.lastGesture) {
            // Calculate scale change
            const scaleChange = distance / this.state.lastGesture.distance;
            this.state.scale.setValue(
              this.state.lastGesture.scale * scaleChange
            );

            // Calculate rotation change
            const rotationChange = angle - this.state.lastGesture.angle;
            this.state.rotation.setValue(
              this.state.lastGesture.rotation + rotationChange
            );
          }

          this.setState({
            lastGesture: {
              distance,
              angle,
              scale: this.state.scale._value,
              rotation: this.state.rotation._value
            }
          });
        } else {
          // Regular movement
          Animated.event(
            [null, { dx: this.state.pan.x, dy: this.state.pan.y }],
            { useNativeDriver: false }
          )(evt, gestureState);
        }
      },

      onPanResponderRelease: () => {
        this.state.pan.flattenOffset();
        this.props.onUpdate(this.props.id, {
          x: this.state.pan.x._value,
          y: this.state.pan.y._value,
          scale: this.state.scale._value,
          rotation: this.state.rotation._value
        });
        this.setState({ lastGesture: null });
      }
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.x !== this.props.x || prevProps.y !== this.props.y) {
      this.state.pan.setValue({ x: this.props.x, y: this.props.y });
    }
    if (prevProps.scale !== this.props.scale) {
      this.state.scale.setValue(this.props.scale);
    }
    if (prevProps.rotation !== this.props.rotation) {
      this.state.rotation.setValue(this.props.rotation);
    }
  }

  render() {
    const { uri } = this.props;
    const { pan, scale, rotation } = this.state;

    // Calculate transform style
    const imageStyle = {
      transform: [
        { translateX: pan.x },
        { translateY: pan.y },
        { scale },
        {
          rotate: rotation.interpolate({
            inputRange: [0, 360],
            outputRange: ["0deg", "360deg"]
          })
        }
      ]
    };

    return (
      <Animated.View
        style={[styles.container, imageStyle]}
        {...this.panResponder.panHandlers}
      >
        <Image source={{ uri }} style={styles.image} resizeMode="contain" />
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: 100,
    height: 100,
    zIndex: 10
  },
  image: {
    width: "100%",
    height: "100%"
  }
});

export default Sticker;
