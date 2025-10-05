import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

interface Props {
  activeTab: "details" | "rounds" | "messages";
  setActiveTab: (tab: "details" | "rounds" | "messages") => void;
}

export default function DriveTabs({ activeTab, setActiveTab }: Props) {
  return (
    <View style={styles.tabContainer}>
      {["details", "rounds", "messages"].map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => setActiveTab(tab as any)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {tab === "details" ? "Drive Details" : tab === "rounds" ? "Rounds" : "Messages"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: { flexDirection: "row", backgroundColor: "#ddd", borderRadius: 8, margin: 10, overflow: "hidden" },
  tab: { flex: 1, padding: 12, alignItems: "center" },
  activeTab: { backgroundColor: "#6200ee" },
  tabText: { fontSize: 14, color: "#444" },
  activeTabText: { color: "#fff", fontWeight: "bold" },
});
