import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useThemeContext } from "../context/ThemeContext";

interface Props {
  activeTab: "details" | "rounds" | "messages";
  setActiveTab: (tab: "details" | "rounds" | "messages") => void;
}

export default function DriveTabs({ activeTab, setActiveTab }: Props) {
  const { mode } = useThemeContext();

  const bgColor = mode === "dark" ? "#2a2a2a" : "#ddd";
  const activeBgColor = mode === "dark" ? "#6200ee" : "#6200ee";
  const textColor = mode === "dark" ? "#ccc" : "#444";
  const activeTextColor = "#fff";

  return (
    <View style={[styles.tabContainer, { backgroundColor: bgColor }]}>
      {["details", "rounds", "messages"].map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && { backgroundColor: activeBgColor }]}
          onPress={() => setActiveTab(tab as any)}
        >
          <Text style={[styles.tabText, { color: textColor }, activeTab === tab && { color: activeTextColor, fontWeight: "bold" }]}>
            {tab === "details" ? "Drive Details" : tab === "rounds" ? "Rounds" : "Messages"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: { flexDirection: "row", borderRadius: 8, margin: 10, overflow: "hidden" },
  tab: { flex: 1, padding: 12, alignItems: "center" },
  tabText: { fontSize: 14 },
});
