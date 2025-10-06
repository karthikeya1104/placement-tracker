import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform, Animated } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useThemeContext } from "../context/ThemeContext";

interface Props {
  rawMessages?: string[] | string;
}

export default function DriveMessages({ rawMessages }: Props) {
  const { mode } = useThemeContext();
  const [copiedMsg, setCopiedMsg] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const bgColor = mode === "dark" ? "#1e1e1e" : "#eee";
  const textColor = mode === "dark" ? "#fff" : "#000";
  const linkColor = mode === "dark" ? "#4eaaff" : "blue";
  const toastBg = mode === "dark" ? "#222" : "#333";
  const toastTextColor = "#fff";

  let messages: string[] = [];

  if (rawMessages) {
    try {
      messages = Array.isArray(rawMessages) ? rawMessages : JSON.parse(rawMessages);
    } catch {
      messages = [];
    }
  }

  const showCopiedMessage = (msg: string) => {
    setCopiedMsg(msg);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => setCopiedMsg(null));
      }, 1500);
    });
  };

  const copyToClipboard = async (msg: string) => {
    if (Platform.OS === "web" && navigator.clipboard) {
      await navigator.clipboard.writeText(msg);
    } else {
      await Clipboard.setStringAsync(msg);
    }
    showCopiedMessage("Copied to clipboard");
  };

  const renderMessageText = (msg: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = msg.split(urlRegex);

    return parts.map((part, idx) =>
      urlRegex.test(part) ? (
        <Text key={idx} style={[styles.link, { color: linkColor }]} onPress={() => Linking.openURL(part)}>
          {part}
        </Text>
      ) : (
        <Text key={idx} style={{ color: textColor }}>{part}</Text>
      )
    );
  };

  return (
    <View style={{ flex: 1, padding: 8 }}>
      {messages.length > 0 ? (
        messages.map((msg, idx) => (
          <View key={idx} style={[styles.rawMessage, { backgroundColor: bgColor }]}>
            <View style={styles.headerRow}>
              <View style={styles.spacer} />
              <TouchableOpacity onPress={() => copyToClipboard(msg)}>
                <MaterialIcons name="content-copy" size={20} color={textColor} />
              </TouchableOpacity>
            </View>
            <Text style={styles.messageText}>{renderMessageText(msg)}</Text>
          </View>
        ))
      ) : (
        <Text style={{ color: textColor }}>No raw messages available.</Text>
      )}

      {copiedMsg && (
        <Animated.View style={[styles.toast, { opacity: fadeAnim, backgroundColor: toastBg }]}>
          <Text style={[styles.toastText, { color: toastTextColor }]}>{copiedMsg}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rawMessage: {
    padding: 10,
    marginBottom: 8,
    borderRadius: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 4,
  },
  spacer: {
    flex: 1,
  },
  messageText: {
    flexWrap: "wrap",
  },
  link: {
    textDecorationLine: "underline",
  },
  toast: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toastText: {
    fontWeight: "600",
  },
});
