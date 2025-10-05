import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform, Animated } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

interface Props {
  rawMessages?: string[] | string;
}

export default function DriveMessages({ rawMessages }: Props) {
  const [copiedMsg, setCopiedMsg] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

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
        <Text key={idx} style={styles.link} onPress={() => Linking.openURL(part)}>
          {part}
        </Text>
      ) : (
        <Text key={idx}>{part}</Text>
      )
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {messages.length > 0 ? (
        messages.map((msg, idx) => (
          <View key={idx} style={styles.rawMessage}>
            <View style={styles.headerRow}>
              <View style={styles.spacer} />
              <TouchableOpacity onPress={() => copyToClipboard(msg)}>
                <MaterialIcons name="content-copy" size={20} color="#555" />
              </TouchableOpacity>
            </View>
            <Text style={styles.messageText}>{renderMessageText(msg)}</Text>
          </View>
        ))
      ) : (
        <Text>No raw messages available.</Text>
      )}

      {copiedMsg && (
        <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
          <Text style={styles.toastText}>{copiedMsg}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rawMessage: {
    backgroundColor: "#eee",
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
    color: "blue",
    textDecorationLine: "underline",
  },
  toast: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#333",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toastText: {
    color: "#fff",
  },
});
