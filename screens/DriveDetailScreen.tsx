import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { useDrives } from "../context/DrivesContext";
import DriveTabs from "../components/DriveTabs";
import DriveDetails from "../components/DriveDetails";
import DriveRounds from "../components/DriveRounds";
import DriveMessages from "../components/DriveMessages";
import { DEFAULT_DRIVE_FIELD, DEFAULT_ROUND } from "../utils/utils";
import { useThemeContext } from "../context/ThemeContext";

export default function DriveDetailScreen({ route, navigation }: any) {
  const { drive } = route.params;
  const { drives, updateDriveInState, addRoundToDrive, updateRoundInDrive, removeRoundFromDrive, deleteDriveInState } = useDrives();
  const { mode } = useThemeContext();

  const [activeTab, setActiveTab] = useState<"details" | "rounds" | "messages">("details");
  const [isEditing, setIsEditing] = useState(false);
  const [originalDrive, setOriginalDrive] = useState({ ...drive });
  const [editableDrive, setEditableDrive] = useState({ ...drive });
  const [editableRounds, setEditableRounds] = useState<any[]>([]);
  const [editingRoundId, setEditingRoundId] = useState<number | null>(null);
  const [newRound, setNewRound] = useState<any>(null);

  useEffect(() => {
    const currentDrive = drives.find((d) => d.id === drive.id);
    if (currentDrive) {
      setOriginalDrive({ ...currentDrive });
      setEditableDrive({ ...currentDrive });
      setEditableRounds(currentDrive.rounds || []);
    }
  }, [drives, drive.id]);

  // ---------------- Handlers ----------------
  const handleSaveDrive = async () => {
    try {
      const { rounds, raw_messages, queued_for_retry, parse_status, ...dbFields } = editableDrive;

      const updated = {
        ...dbFields,
        company_name: dbFields.company_name?.trim() || DEFAULT_DRIVE_FIELD,
        role: dbFields.role?.trim() || DEFAULT_DRIVE_FIELD,
        location: dbFields.location?.trim() || DEFAULT_DRIVE_FIELD,
        ctc_stipend: dbFields.ctc_stipend?.trim() || DEFAULT_DRIVE_FIELD,
        skills_notes: dbFields.skills_notes?.trim() || DEFAULT_DRIVE_FIELD,
        status: dbFields.status || "upcoming",
        registration_status: dbFields.registration_status || "not_registered",
        selected: dbFields.selected === "Yes" || dbFields.selected === 1 ? 1 : 0,
      };

      const success = await updateDriveInState(drive.id, updated);

      if (success) {
        Alert.alert("Success", "Drive details saved!");
        setEditableDrive({ ...editableDrive, ...updated });
        setOriginalDrive({ ...editableDrive, ...updated });
        setIsEditing(false);
      } else {
        Alert.alert("Error", "Failed to save drive.");
      }
    } catch (error) {
      console.error("Update drive error:", error);
      Alert.alert("Error", "Failed to save drive.");
    }
  };

  const handleCancelDrive = () => {
    setEditableDrive({ ...originalDrive });
    setIsEditing(false);
  };

  const handleDeleteDrive = async () => {
    Alert.alert("Delete Drive", "Are you sure you want to delete this drive?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const success = await deleteDriveInState(drive.id);
          if (success) {
            Alert.alert("Deleted", "Drive deleted successfully!");
            navigation.goBack();
          } else {
            Alert.alert("Error", "Failed to delete drive.");
          }
        },
      },
    ]);
  };

  // Rounds handlers remain same
  const handleAddNewRound = () => setNewRound({ round_name: "", round_date: "", status: "upcoming", result: "not_conducted" });
  const handleCancelNewRound = () => setNewRound(null);

  const handleSaveNewRound = async () => {
    if (!newRound) return;
    if (!newRound.round_name?.trim()) newRound.round_name = DEFAULT_ROUND.round_name;
    if (!newRound.round_date?.trim()) newRound.round_date = DEFAULT_ROUND.round_date;
    const success = await addRoundToDrive(drive.id, newRound);
    if (success) {
      Alert.alert("Success", "Round added successfully!");
      setNewRound(null);
    } else Alert.alert("Error", "Failed to add round.");
  };

  const handleSaveRound = async (updatedRound: any) => {
    if (!updatedRound) return;

    const updates = {
      round_name: updatedRound.round_name?.trim() || DEFAULT_ROUND.round_name,
      round_date: updatedRound.round_date?.trim() || DEFAULT_ROUND.round_date,
      status: updatedRound.status || DEFAULT_ROUND.status,
      result: updatedRound.result || DEFAULT_ROUND.result,
    };

    const success = await updateRoundInDrive(drive.id, updatedRound.id, updates);

    if (success) {
      Alert.alert("Success", "Round updated successfully!");

      // Update local state to reflect backend changes
      setEditableRounds(prev =>
        prev.map(r => (r.id === updatedRound.id ? { ...r, ...updates } : r))
      );
    } else {
      Alert.alert("Error", "Failed to update round.");
    }

    setEditingRoundId(null);
  };

  const handleDeleteRound = async (roundId: number) => {
    Alert.alert("Delete Round", "Are you sure you want to delete this round?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const success = await removeRoundFromDrive(drive.id, roundId);
          if (success) Alert.alert("Deleted", "Round deleted successfully!");
          setEditingRoundId(null);
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: mode === "dark" ? "#121212" : "#f5f5f5" }]}>
      <DriveTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <ScrollView contentContainerStyle={[styles.scroll, { backgroundColor: mode === "dark" ? "#121212" : "#f5f5f5" }]}>
        {activeTab === "details" && (
          <DriveDetails
            editableDrive={editableDrive}
            originalDrive={originalDrive}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            setEditableDrive={setEditableDrive}
            handleSaveDrive={handleSaveDrive}
            handleCancelDrive={handleCancelDrive}
            handleDeleteDrive={handleDeleteDrive}
            darkMode={mode === "dark"} // optionally pass to child components
          />
        )}

        {activeTab === "rounds" && (
          <DriveRounds
            editableRounds={editableRounds}
            setEditableRounds={setEditableRounds}
            editingRoundId={editingRoundId}
            setEditingRoundId={setEditingRoundId}
            newRound={newRound}
            setNewRound={setNewRound}
            handleAddRound={handleAddNewRound}
            handleSaveNewRound={handleSaveNewRound}
            handleCancelNewRound={handleCancelNewRound}
            handleSaveRound={handleSaveRound}
            handleDeleteRound={handleDeleteRound}
            darkMode={mode === "dark"}
          />
        )}

        {activeTab === "messages" && <DriveMessages rawMessages={drive.raw_messages} darkMode={mode === "dark"} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16 },
});
