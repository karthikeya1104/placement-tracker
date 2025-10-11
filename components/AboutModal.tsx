import React from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, Linking, ScrollView } from "react-native";
import { useThemeContext } from "../context/ThemeContext";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function AboutModal({ visible, onClose }: Props) {
  const { mode } = useThemeContext();
  const isDark = mode === "dark";

  // Define theme-dependent variables at the top
  const overlayColor = isDark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.6)";
  const containerBg = isDark ? "#1e1e1e" : "#fff";
  const titleColor = isDark ? "#fff" : "#000";
  const textColor = isDark ? "#ccc" : "#333";
  const linkColor = isDark ? "#90caf9" : "#6200ee";
  const buttonBg = isDark ? "#90caf9" : "#6200ee";
  const buttonTextColor = isDark ? "#000" : "#fff";

  const handleLinkPress = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={[styles.overlay, { backgroundColor: overlayColor }]}>
        <View style={[styles.container, { backgroundColor: containerBg }]}>
          <ScrollView>
            <Text style={[styles.title, { color: titleColor }]}>Placement Tracker v1.1.5</Text>
            <Text style={[styles.text, { color: textColor }]}>
              Developed by{"\n"}Nagelli Karthikeya Goud 💙
            </Text>
            <Text style={[styles.text, { color: textColor }]}>
              A smart, easy-to-use app to organize, monitor, and streamline campus recruitment drives.
            </Text>
            <Text style={[styles.text, { color: textColor, marginTop: 15 }]}>Contact & Links:</Text>

            <Text style={[styles.link, { color: linkColor }]} onPress={() => handleLinkPress("mailto:temp@gmail.com")}>
              📧 nagellikarthikeya@gmail.com
            </Text>
            <Text style={[styles.link, { color: linkColor }]} onPress={() => handleLinkPress("https://nagellikarthikeya.vercel.app/")}>
              🌐 Portfolio
            </Text>
            <Text style={[styles.link, { color: linkColor }]} onPress={() => handleLinkPress("https://www.linkedin.com/in/nagellikarthikeya/")}>
              🔗 LinkedIn
            </Text>

            <Text style={[styles.text, { color: textColor, marginTop: 15 }]}>© 2025 All rights reserved.</Text>
          </ScrollView>

          <TouchableOpacity style={[styles.button, { backgroundColor: buttonBg }]} onPress={onClose}>
            <Text style={[styles.buttonText, { color: buttonTextColor }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    borderRadius: 12,
    padding: 20,
    maxHeight: "80%",
  },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 15 },
  text: { fontSize: 16, lineHeight: 24, marginBottom: 8 },
  link: { fontSize: 16, lineHeight: 24, marginBottom: 5 },
  button: {
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: { fontWeight: "600", fontSize: 16 },
});
