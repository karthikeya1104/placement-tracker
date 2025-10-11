import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator  } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { DEFAULT_ROUND } from "../utils/utils";
import { useThemeContext } from "../context/ThemeContext";
import CustomAlertModal from "./CustomAlertModal";

interface Props {
  editableRounds: any[];
  setEditableRounds: (rounds: any[]) => void;
  editingRoundId: number | null;
  setEditingRoundId: (id: number | null) => void;
  newRound: any;
  setNewRound: (round: any) => void;
  handleAddRound: () => void;
  handleSaveNewRound: (round: any) => void;
  handleCancelNewRound: () => void;
  handleSaveRound: (updatedRound: any) => void;
  handleDeleteRound: (id: number) => void;
}

export default function DriveRounds(props: Props) {
  const {
    editableRounds,
    setEditableRounds,
    editingRoundId,
    setEditingRoundId,
    newRound,
    setNewRound,
    handleAddRound,
    handleSaveNewRound,
    handleCancelNewRound,
    handleSaveRound,
    handleDeleteRound,
  } = props;

  const { mode } = useThemeContext();
  const [editingRoundCopy, setEditingRoundCopy] = useState<any>(null);

  const bgColor = mode === "dark" ? "#1e1e1e" : "#fff";
  const inputBg = mode === "dark" ? "#3a3a3a" : "#e0e0e0";
  const textColor = mode === "dark" ? "#fff" : "#222";
  const pickerBg = mode === "dark" ? "#2a2a2a" : "#fafafa";

  const [alertVisible, setAlertVisible] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState('');
  const [loading, setLoading] = useState(false);

  /** Start editing a round */
  const startEditing = (round: any) => {
    setEditingRoundCopy({ ...round });
    setEditingRoundId(round.id);
  };

  /** Cancel editing */
  const cancelEditing = () => {
    setEditingRoundCopy(null);
    setEditingRoundId(null);
  };

  /** Sort rounds by round_number and renumber sequentially */
  const normalizeAndPrioritizeRounds = (rounds: any[], prioritizedRound?: any) => {
    // Sort by round_number first
    let sorted = [...rounds].sort((a, b) => (Number(a.round_number) || 0) - (Number(b.round_number) || 0));

    // If we have a round to prioritize (new or edited)
    if (prioritizedRound) {
      // Remove it from array if already exists
      sorted = sorted.filter(r => r !== prioritizedRound);

      // Insert it at the correct position
      const insertIdx = sorted.findIndex(r => (Number(r.round_number) || 0) >= (Number(prioritizedRound.round_number) || 0));
      if (insertIdx === -1) sorted.push(prioritizedRound);
      else sorted.splice(insertIdx, 0, prioritizedRound);
    }

    // Renumber sequentially
    sorted.forEach((r, idx) => (r.round_number = idx + 1));
    return sorted;
  };

  /** Save new round */
  const saveNewRoundWithInsert = async () => {
    if (!newRound) return;

    setLoading(true);
    
    const newRoundObj: Partial<Round> = {
      ...newRound,
      round_number: Number(newRound.round_number) || editableRounds.length + 1,
    };

    // Add and normalize
    let updatedRounds = normalizeAndPrioritizeRounds([...editableRounds, newRoundObj], newRoundObj);

    // Bulk save
    const finalRounds: any[] = [];
    for (const round of updatedRounds) {
      if (round.id) {
        await handleSaveRound(round);
        finalRounds.push(round);
      } else {
        const savedRound = await handleSaveNewRound(round);
        if (savedRound) finalRounds.push(savedRound); // now savedRound has id
      }
    }

    setEditableRounds(finalRounds);
    setNewRound(null);
    setLoading(false);

    // Show alert
    setAlertMessage('New round has been saved successfully!');
    setAlertVisible(true);
  };

  /** Save edited round */
  const saveEditingWithShift = async () => {
    if (!editingRoundCopy) return;

    setLoading(true);
    
    const otherRounds = editableRounds.filter(r => r.id !== editingRoundCopy.id);
    const updatedRounds = normalizeAndPrioritizeRounds([...otherRounds, editingRoundCopy], editingRoundCopy);

    // Bulk save
    for (const round of updatedRounds) {
      if (round.id) {
        await handleSaveRound(round);
      } else {
        await handleSaveNewRound(round);
      }
    }

    setEditableRounds(updatedRounds);
    setEditingRoundCopy(null);
    setEditingRoundId(null);

    // Show alert
    setLoading(false);
    setAlertMessage('Round edits have been saved successfully!');
    setAlertVisible(true);
  };

  const deleteRoundWithReorder = async (id: number) => {
    setLoading(true);

    const success = await handleDeleteRound(id);
    if (success) {
      // Remove the deleted round
      let remainingRounds = editableRounds.filter((r) => r.id !== id);
      remainingRounds = normalizeAndPrioritizeRounds(remainingRounds);
      // Save all rounds sequentially
      for (const round of remainingRounds) {
        await handleSaveRound(round);
      }
      setEditableRounds(remainingRounds);
      setEditingRoundId(null);
      setAlertMessage("Round deleted successfully!");
      setAlertVisible(true);
    } else {
      setAlertMessage("Failed to delete round.");
      setAlertVisible(true);
    }

    setLoading(false);
  };

  return (
    <View>

      {loading && <ActivityIndicator size="large" color="#6200ee" style={{ marginVertical: 10 }} />}

      {/* Add New Round Button */}
      {!newRound && (
        <TouchableOpacity
          style={[styles.curvedButton, { backgroundColor: "#6200ee", marginBottom: 12 }]}
          onPress={handleAddRound}
        >
          <Text style={styles.curvedButtonText}>Add Round</Text>
        </TouchableOpacity>
      )}

      {/* New Round Form */}
      {newRound && (
        <View style={[styles.roundCard, { backgroundColor: bgColor }]}>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
            value={newRound.round_number ? String(newRound.round_number) : ""}
            placeholder="Round Number"
            keyboardType="numeric"
            onChangeText={t => setNewRound({ ...newRound, round_number: t ? Number(t) : undefined })}
            placeholderTextColor={mode === "dark" ? "#aaa" : "#888"}
          />
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
            value={newRound.round_name || ""}
            placeholder="Round Name"
            onChangeText={t => setNewRound({ ...newRound, round_name: t })}
            placeholderTextColor={mode === "dark" ? "#aaa" : "#888"}
          />
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
            value={newRound.round_date || ""}
            placeholder="DD-MM-YYYY HH:MM"
            onChangeText={t => setNewRound({ ...newRound, round_date: t })}
            placeholderTextColor={mode === "dark" ? "#aaa" : "#888"}
          />
          <Picker
            selectedValue={newRound.status || "upcoming"}
            style={[styles.picker, { backgroundColor: pickerBg, color: textColor }]}
            onValueChange={v => setNewRound({ ...newRound, status: v })}
          >
            <Picker.Item label="Upcoming" value="upcoming" />
            <Picker.Item label="Finished" value="finished" />
          </Picker>
          <Picker
            selectedValue={newRound.result || "not_conducted"}
            style={[styles.picker, { backgroundColor: pickerBg, color: textColor }]}
            onValueChange={v => setNewRound({ ...newRound, result: v })}
          >
            <Picker.Item label="Not Conducted" value="not_conducted" />
            <Picker.Item label="Shortlisted" value="shortlisted" />
            <Picker.Item label="Rejected" value="rejected" />
          </Picker>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.curvedButton, { backgroundColor: "#6200ee" }]}
              onPress={saveNewRoundWithInsert}
            >
              <Text style={styles.curvedButtonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.curvedButton, { backgroundColor: "#888" }]}
              onPress={handleCancelNewRound}
            >
              <Text style={styles.curvedButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Existing Rounds */}
      {editableRounds.map(round => (
        <View key={round.id} style={[styles.roundCard, { backgroundColor: bgColor }]}>
          {editingRoundId === round.id && editingRoundCopy ? (
            <>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                value={editingRoundCopy.round_number ? String(editingRoundCopy.round_number) : ""}
                keyboardType="numeric"
                onChangeText={t =>
                  setEditingRoundCopy({ ...editingRoundCopy, round_number: t ? Number(t) : undefined })
                }
              />
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                value={editingRoundCopy.round_name || ""}
                onChangeText={t => setEditingRoundCopy({ ...editingRoundCopy, round_name: t })}
              />
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                value={editingRoundCopy.round_date || ""}
                onChangeText={t => setEditingRoundCopy({ ...editingRoundCopy, round_date: t })}
              />
              <Picker
                selectedValue={editingRoundCopy.status || "upcoming"}
                style={[styles.picker, { backgroundColor: pickerBg, color: textColor }]}
                onValueChange={v => setEditingRoundCopy({ ...editingRoundCopy, status: v })}
              >
                <Picker.Item label="Upcoming" value="upcoming" />
                <Picker.Item label="Finished" value="finished" />
              </Picker>
              <Picker
                selectedValue={editingRoundCopy.result || "not_conducted"}
                style={[styles.picker, { backgroundColor: pickerBg, color: textColor }]}
                onValueChange={v => setEditingRoundCopy({ ...editingRoundCopy, result: v })}
              >
                <Picker.Item label="Not Conducted" value="not_conducted" />
                <Picker.Item label="Shortlisted" value="shortlisted" />
                <Picker.Item label="Rejected" value="rejected" />
              </Picker>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.curvedButton, { backgroundColor: "#6200ee" }]}
                  onPress={saveEditingWithShift}
                >
                  <Text style={styles.curvedButtonText}>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.curvedButton, { backgroundColor: "#888" }]}
                  onPress={cancelEditing}
                >
                  <Text style={styles.curvedButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                value={String(round.round_number || DEFAULT_ROUND.round_number)}
                editable={false}
              />
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                value={round.round_name || DEFAULT_ROUND.round_name}
                editable={false}
              />
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                value={round.round_date || DEFAULT_ROUND.round_date}
                editable={false}
              />
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                value={round.status || DEFAULT_ROUND.status}
                editable={false}
              />
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                value={round.result || "Not Conducted"}
                editable={false}
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.curvedButton, { backgroundColor: "#6200ee" }]}
                  onPress={() => startEditing(round)}
                >
                  <Text style={styles.curvedButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.curvedButton, { backgroundColor: "red" }]}
                  onPress={() => deleteRoundWithReorder(round.id)}
                >
                  <Text style={styles.curvedButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      ))}
      <CustomAlertModal
        visible={alertVisible}
        title="Success"
        message={alertMessage}
        onPrimary={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  roundCard: { padding: 12, marginBottom: 8, borderRadius: 12, elevation: 2 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 8, fontSize: 16, minHeight: 40 },
  picker: { borderRadius: 8, marginBottom: 8 },
  buttonRow: { flexDirection: "row", justifyContent: "space-evenly", marginVertical: 8 },
  curvedButton: { flex: 1, paddingVertical: 12, marginHorizontal: 5, borderRadius: 25, alignItems: "center" },
  curvedButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
