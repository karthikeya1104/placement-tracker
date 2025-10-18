import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useDrives } from "../context/DrivesContext";
import DriveTabs from "../components/DriveTabs";
import DriveDetails from "../components/DriveDetails";
import DriveRounds from "../components/DriveRounds";
import DriveMessages from "../components/DriveMessages";
import { DEFAULT_DRIVE_FIELD, DEFAULT_ROUND } from "../utils/utils";
import { useThemeContext } from "../context/ThemeContext";
import CustomAlertModal from "../components/CustomAlertModal";

export default function DriveDetailScreen({ route, navigation }: any) {
  const { drive } = route.params;
  const {
    drives,
    updateDriveInState,
    addRoundToDrive,
    updateRoundInDrive,
    removeRoundFromDrive,
    deleteDriveInState,
  } = useDrives();

  const { mode } = useThemeContext();

  const [activeTab, setActiveTab] = useState<"details" | "rounds" | "messages">("details");
  const [isEditing, setIsEditing] = useState(false);
  const [originalDrive, setOriginalDrive] = useState({ ...drive });
  const [editableDrive, setEditableDrive] = useState({ ...drive });
  const [editableRounds, setEditableRounds] = useState<any[]>([]);
  const [editingRoundId, setEditingRoundId] = useState<number | null>(null);
  const [newRound, setNewRound] = useState<any>(null);

  // Custom Alert Modal State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertPrimaryLabel, setAlertPrimaryLabel] = useState("OK");
  const [alertSecondaryLabel, setAlertSecondaryLabel] = useState<string | undefined>();
  const [onAlertPrimary, setOnAlertPrimary] = useState<() => void>(() => {});
  const [onAlertSecondary, setOnAlertSecondary] = useState<() => void>(() => {});

  useEffect(() => {
    const currentDrive = drives.find((d) => d.id === drive.id);
    if (currentDrive) {
      setOriginalDrive({ ...currentDrive });
      setEditableDrive({ ...currentDrive });
      setEditableRounds(currentDrive.rounds || []);
    }
  }, [drives, drive.id]);

  // ----------------- Helper Functions -----------------
  const showModal = (
    title: string,
    message: string,
    primaryLabel = "OK",
    onPrimaryAction: () => void,
    secondaryLabel?: string,
    onSecondaryAction?: () => void
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertPrimaryLabel(primaryLabel);
    setAlertSecondaryLabel(secondaryLabel);
    setOnAlertPrimary(() => onPrimaryAction);
    setOnAlertSecondary(() => onSecondaryAction || (() => setAlertVisible(false)));
    setAlertVisible(true);
  };

  const showErrorModal = (message: string) => {
    showModal("Error", message, "OK", () => setAlertVisible(false));
  };

  // ----------------- Drive Handlers -----------------
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
        setEditableDrive({ ...editableDrive, ...updated });
        setOriginalDrive({ ...editableDrive, ...updated });
        setIsEditing(false);
        showModal("Success", "Drive details saved!", "OK", () => setAlertVisible(false));
      } else {
        showErrorModal("Failed to save drive.");
      }
    } catch (error) {
      console.error("Update drive error:", error);
      showErrorModal("Failed to save drive.");
    }
  };

  const handleCancelDrive = () => {
    setEditableDrive({ ...originalDrive });
    setIsEditing(false);
  };

  const handleDeleteDrive = () => {
    showModal(
      "Delete Drive",
      "Are you sure you want to delete this drive?",
      "Delete",
      async () => {
        setAlertVisible(false);
        const success = await deleteDriveInState(drive.id);
        if (success) {
          showModal("Deleted", "Drive deleted successfully!", "OK", () => {
            setAlertVisible(false);
            navigation.goBack();
          });
        } else {
          showErrorModal("Failed to delete drive.");
        }
      },
      "Cancel",
      () => setAlertVisible(false)
    );
  };

  // ----------------- Round Handlers -----------------
  const handleAddNewRound = () => setNewRound({ round_name: "", round_date: "", status: "upcoming", result: "not_conducted" });
  const handleCancelNewRound = () => setNewRound(null);

  const handleSaveNewRound = async (round: any) => {
    if (!round) return null;

    if (!round.round_name?.trim()) round.round_name = DEFAULT_ROUND.round_name;
    if (!round.round_date?.trim()) round.round_date = DEFAULT_ROUND.round_date;

    const id = await addRoundToDrive(drive.id, round);

    if (id !== -1) {
      const savedRound = { ...round, id };
      setEditableRounds((prev) => [...prev.filter((r) => r !== round), savedRound]);
      setNewRound(null);
      return savedRound;
    }

    showErrorModal("Failed to save round.");
    return null;
  };

  const handleSaveRound = async (updatedRound: any) => {
    if (!updatedRound) return false;

    const updates = {
      round_name: updatedRound.round_name?.trim() || DEFAULT_ROUND.round_name,
      round_date: updatedRound.round_date?.trim() || DEFAULT_ROUND.round_date,
      status: updatedRound.status || DEFAULT_ROUND.status,
      result: updatedRound.result || DEFAULT_ROUND.result,
      round_number: updatedRound.round_number,
    };

    const success = await updateRoundInDrive(drive.id, updatedRound.id, updates);

    if (success) {
      setEditableRounds((prev) => prev.map((r) => (r.id === updatedRound.id ? { ...r, ...updates } : r)));
      setEditingRoundId(null);
      return true;
    }

    showErrorModal("Failed to save round.");
    return false;
  };

  const handleDeleteRound = async (roundId: number) => {
    try {
      const success = await removeRoundFromDrive(drive.id, roundId);
      return success;
    } catch (err) {
      console.error("Delete round error:", err);
      return false;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: mode === "dark" ? "#121212" : "#f5f5f5" }]}>
      <DriveTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <ScrollView contentContainerStyle={[styles.scroll, { backgroundColor: mode === "dark" ? "#121212" : "#f5f5f5" }]} showsVerticalScrollIndicator={false}>
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
          />
        )}

        {activeTab === "messages" && <DriveMessages rawMessages={drive.raw_messages} darkMode={mode === "dark"} />}
      </ScrollView>

      <CustomAlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        primaryLabel={alertPrimaryLabel}
        secondaryLabel={alertSecondaryLabel}
        onPrimary={onAlertPrimary}
        onSecondary={onAlertSecondary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16 },
});
