import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  rawMessages?: string[] | string; // can be string (from DB) or array
}

export default function DriveMessages({ rawMessages }: Props) {
  let messages: string[] = [];

  if (rawMessages) {
    try {
      // If it's already an array, use it; if string, parse JSON
      messages = Array.isArray(rawMessages) ? rawMessages : JSON.parse(rawMessages);
    } catch (err) {
      console.error("Failed to parse raw messages:", err);
      messages = [];
    }
  }

  return (
    <View>
      {messages.length > 0 ? (
        messages.map((msg, idx) => (
          <View key={idx} style={styles.rawMessage}>
            <Text>{msg}</Text>
          </View>
        ))
      ) : (
        <Text>No raw messages available.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rawMessage: { backgroundColor: "#eee", padding: 10, marginBottom: 8, borderRadius: 8 },
});
