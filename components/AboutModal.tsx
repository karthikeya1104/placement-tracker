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

  // Theme-dependent variables
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
            <Text style={[styles.title, { color: titleColor }]}>
              🎓 Placement Tracker <Text style={{ fontSize: 14, color: linkColor }}>v1.1.6</Text>
            </Text>
            <Text style={[styles.text, { color: textColor }]}>
              👨‍💻 Developed by{"\n"}<Text style={{ fontWeight: "bold" }}>Nagelli Karthikeya Goud</Text>
            </Text>
            <Text style={[styles.text, { color: textColor }]}>
              Placement Tracker is a comprehensive and user-friendly mobile application designed to help students efficiently manage and monitor their campus recruitment journey.
              {"\n\n"}
              The app enables you to:
            </Text>
            <Text style={[styles.text, { color: textColor }]}>
              <Text>📅 </Text>Organize placement drives{"\n"}
              <Text>📝 </Text>Track registration status{"\n"}
              <Text>🏆 </Text>Manage interview rounds{"\n"}
              <Text>💬 </Text>Store and parse important messages{"\n"}
              <Text>📊 </Text>Visualize your progress with analytics
            </Text>
            <Text style={[styles.text, { color: textColor, marginTop: 10 }]}>
              <Text style={{ fontWeight: "bold" }}>Key Features:</Text>
              {"\n"}• 📂 Centralized tracking of all placement drives
              {"\n"}• 🤖 Intelligent parsing of placement messages
              {"\n"}• 📈 Detailed analytics and progress visualization
              {"\n"}• 🔒 Secure, offline-first data storage
              {"\n"}• ⚙️ Customizable settings and export/import options
            </Text>
            <Text style={[styles.text, { color: textColor, marginTop: 15 }]}>📬 <Text style={{ fontWeight: "bold" }}>Contact & Links:</Text></Text>

            <Text style={[styles.link, { color: linkColor }]} onPress={() => handleLinkPress("mailto:nagellikarthikeya@gmail.com")}>
              📧 nagellikarthikeya@gmail.com
            </Text>
            <Text style={[styles.link, { color: linkColor }]} onPress={() => handleLinkPress("https://nagellikarthikeya.vercel.app/")}>
              🌐 Portfolio
            </Text>
            <Text style={[styles.link, { color: linkColor }]} onPress={() => handleLinkPress("https://www.linkedin.com/in/nagellikarthikeya/")}>
              🔗 LinkedIn
            </Text>

            <Text style={[styles.text, { color: textColor, marginTop: 15, textAlign: "center" }]}>
              © 2025 Nagelli Karthikeya Goud. All rights reserved.
            </Text>
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
  title: { fontSize: 22, fontWeight: "700", marginBottom: 15, textAlign: "center" },
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
