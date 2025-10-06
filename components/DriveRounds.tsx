import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { DEFAULT_ROUND } from "../utils/utils";
import { useThemeContext } from "../context/ThemeContext";

interface Props {
  editableRounds: any[];
  setEditableRounds: (rounds: any[]) => void;
  editingRoundId: number | null;
  setEditingRoundId: (id: number | null) => void;
  newRound: any;
  setNewRound: (round: any) => void;
  handleAddRound: () => void;
  handleSaveNewRound: () => void;
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

  // Theme-aware colors
  const bgColor = mode === "dark" ? "#1e1e1e" : "#fff";
  const inputBg = mode === "dark" ? "#3a3a3a" : "#e0e0e0"; // light gray in light mode
  const textColor = mode === "dark" ? "#fff" : "#222";
  const pickerBg = mode === "dark" ? "#2a2a2a" : "#fafafa";

  const sortedRounds = [...editableRounds].sort((a, b) => (a.round_number || 0) - (b.round_number || 0));

  const startEditing = (round: any) => {
    setEditingRoundCopy({ ...round });
    setEditingRoundId(round.id);
  };

  const cancelEditing = () => {
    setEditingRoundCopy(null);
    setEditingRoundId(null);
  };

  const saveEditing = () => {
    if (!editingRoundCopy) return;
    editingRoundCopy.round_number = Number(editingRoundCopy.round_number) || 0;
    setEditableRounds(prev => prev.map(r => (r.id === editingRoundCopy.id ? { ...editingRoundCopy } : r)));
    handleSaveRound(editingRoundCopy);
    setEditingRoundCopy(null);
    setEditingRoundId(null);
  };

  return (
    <View>
      {!newRound && (
        <TouchableOpacity style={[styles.curvedButton, { backgroundColor: "#6200ee", marginBottom: 12 }]} onPress={handleAddRound}>
          <Text style={styles.curvedButtonText}>Add Round</Text>
        </TouchableOpacity>
      )}

      {newRound && (
        <View style={[styles.roundCard, { backgroundColor: bgColor }]}>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
            value={String(newRound.round_number || sortedRounds.length + 1)}
            placeholder="Round Number"
            keyboardType="numeric"
            onChangeText={t => setNewRound({ ...newRound, round_number: Number(t) || 0 })}
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
          <Picker selectedValue={newRound.status || "upcoming"} style={[styles.picker, { backgroundColor: pickerBg, color: textColor }]} onValueChange={v => setNewRound({ ...newRound, status: v })}>
            <Picker.Item label="Upcoming" value="upcoming" />
            <Picker.Item label="Finished" value="finished" />
          </Picker>
          <Picker selectedValue={newRound.result || "not_conducted"} style={[styles.picker, { backgroundColor: pickerBg, color: textColor }]} onValueChange={v => setNewRound({ ...newRound, result: v })}>
            <Picker.Item label="Not Conducted" value="not_conducted" />
            <Picker.Item label="Shortlisted" value="shortlisted" />
            <Picker.Item label="Rejected" value="rejected" />
          </Picker>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.curvedButton, { backgroundColor: "#6200ee" }]} onPress={handleSaveNewRound}>
              <Text style={styles.curvedButtonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.curvedButton, { backgroundColor: "#888" }]} onPress={handleCancelNewRound}>
              <Text style={styles.curvedButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {sortedRounds.map(round => (
        <View key={round.id} style={[styles.roundCard, { backgroundColor: bgColor }]}>
          {editingRoundId === round.id && editingRoundCopy ? (
            <>
              <TextInput style={[styles.input, { backgroundColor: inputBg, color: textColor }]} value={String(editingRoundCopy.round_number || 0)} keyboardType="numeric" onChangeText={t => setEditingRoundCopy({ ...editingRoundCopy, round_number: Number(t) || 0 })} />
              <TextInput style={[styles.input, { backgroundColor: inputBg, color: textColor }]} value={editingRoundCopy.round_name} onChangeText={t => setEditingRoundCopy({ ...editingRoundCopy, round_name: t })} />
              <TextInput style={[styles.input, { backgroundColor: inputBg, color: textColor }]} value={editingRoundCopy.round_date} onChangeText={t => setEditingRoundCopy({ ...editingRoundCopy, round_date: t })} />

              <Picker selectedValue={editingRoundCopy.status} style={[styles.picker, { backgroundColor: pickerBg, color: textColor }]} onValueChange={v => setEditingRoundCopy({ ...editingRoundCopy, status: v })}>
                <Picker.Item label="Upcoming" value="upcoming" />
                <Picker.Item label="Finished" value="finished" />
              </Picker>
              <Picker selectedValue={editingRoundCopy.result} style={[styles.picker, { backgroundColor: pickerBg, color: textColor }]} onValueChange={v => setEditingRoundCopy({ ...editingRoundCopy, result: v })}>
                <Picker.Item label="Not Conducted" value="not_conducted" />
                <Picker.Item label="Shortlisted" value="shortlisted" />
                <Picker.Item label="Rejected" value="rejected" />
              </Picker>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.curvedButton, { backgroundColor: "#6200ee" }]} onPress={saveEditing}>
                  <Text style={styles.curvedButtonText}>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.curvedButton, { backgroundColor: "#888" }]} onPress={cancelEditing}>
                  <Text style={styles.curvedButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <TextInput style={[styles.input, { backgroundColor: inputBg, color: textColor }]} value={String(round.round_number || DEFAULT_ROUND.round_number)} editable keyboardType="numeric" onChangeText={t => setEditableRounds(prev => prev.map(r => (r.id === round.id ? { ...r, round_number: Number(t) || 0 } : r)))} />
              <TextInput style={[styles.input, { backgroundColor: inputBg, color: textColor }]} value={round.round_name || DEFAULT_ROUND.round_name} editable={false} />
              <TextInput style={[styles.input, { backgroundColor: inputBg, color: textColor }]} value={round.round_date || DEFAULT_ROUND.round_date} editable={false} />
              <TextInput style={[styles.input, { backgroundColor: inputBg, color: textColor }]} value={round.status || DEFAULT_ROUND.status} editable={false} />
              <TextInput style={[styles.input, { backgroundColor: inputBg, color: textColor }]} value={round.result || "Not Conducted"} editable={false} />

              <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.curvedButton, { backgroundColor: "#6200ee" }]} onPress={() => startEditing(round)}>
                  <Text style={styles.curvedButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.curvedButton, { backgroundColor: "red" }]} onPress={() => handleDeleteRound(round.id)}>
                  <Text style={styles.curvedButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      ))}
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
