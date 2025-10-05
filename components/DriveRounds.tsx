import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { DEFAULT_ROUND } from "../utils/utils";

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

export default function DriveRounds({
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
}: Props) {
  const [editingRoundCopy, setEditingRoundCopy] = useState<any>(null);

  // Sort rounds by round_number ascending
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

    // Ensure round_number is a number
    editingRoundCopy.round_number = Number(editingRoundCopy.round_number) || 0;

    setEditableRounds(prev =>
      prev.map(r => (r.id === editingRoundCopy.id ? { ...editingRoundCopy } : r))
    );

    handleSaveRound(editingRoundCopy);

    setEditingRoundCopy(null);
    setEditingRoundId(null);
  };

  return (
    <View>
      {!newRound && (
        <View style={styles.buttonRow}>
          <Button title="Add Round" onPress={handleAddRound} />
        </View>
      )}

      {newRound && (
        <View style={styles.roundCard}>
          <TextInput
            style={styles.input}
            value={String(newRound.round_number || sortedRounds.length + 1)}
            placeholder="Round Number"
            keyboardType="numeric"
            onChangeText={(t) => setNewRound({ ...newRound, round_number: Number(t) || 0 })}
          />
          <TextInput
            style={styles.input}
            value={newRound.round_name || ""}
            placeholder="Round Name"
            onChangeText={(t) => setNewRound({ ...newRound, round_name: t })}
          />
          <TextInput
            style={styles.input}
            value={newRound.round_date || ""}
            placeholder="DD-MM-YYYY HH:MM"
            onChangeText={(t) => setNewRound({ ...newRound, round_date: t })}
          />
          <Picker
            selectedValue={newRound.status || "upcoming"}
            style={styles.picker}
            onValueChange={(v) => setNewRound({ ...newRound, status: v })}
          >
            <Picker.Item label="Upcoming" value="upcoming" />
            <Picker.Item label="Finished" value="finished" />
          </Picker>
          <Picker
            selectedValue={newRound.result || "not_conducted"}
            style={styles.picker}
            onValueChange={(v) => setNewRound({ ...newRound, result: v })}
          >
            <Picker.Item label="Not Conducted" value="not_conducted" />
            <Picker.Item label="Shortlisted" value="shortlisted" />
            <Picker.Item label="Rejected" value="rejected" />
          </Picker>
          <View style={styles.buttonRow}>
            <Button title="Save" onPress={handleSaveNewRound} />
            <Button title="Cancel" color="gray" onPress={handleCancelNewRound} />
          </View>
        </View>
      )}

      {sortedRounds.map((round) => (
        <View key={round.id} style={styles.roundCard}>
          {editingRoundId === round.id && editingRoundCopy ? (
            <>
              <TextInput
                style={styles.input}
                value={String(editingRoundCopy.round_number || 0)}
                placeholder="Round Number"
                keyboardType="numeric"
                onChangeText={(t) => setEditingRoundCopy({ ...editingRoundCopy, round_number: Number(t) || 0 })}
              />
              <TextInput
                style={styles.input}
                value={editingRoundCopy.round_name}
                onChangeText={(t) => setEditingRoundCopy({ ...editingRoundCopy, round_name: t })}
              />
              <TextInput
                style={styles.input}
                value={editingRoundCopy.round_date}
                onChangeText={(t) => setEditingRoundCopy({ ...editingRoundCopy, round_date: t })}
              />
              <Picker
                selectedValue={editingRoundCopy.status}
                style={styles.picker}
                onValueChange={(v) => setEditingRoundCopy({ ...editingRoundCopy, status: v })}
              >
                <Picker.Item label="Upcoming" value="upcoming" />
                <Picker.Item label="Finished" value="finished" />
              </Picker>
              <Picker
                selectedValue={editingRoundCopy.result}
                style={styles.picker}
                onValueChange={(v) => setEditingRoundCopy({ ...editingRoundCopy, result: v })}
              >
                <Picker.Item label="Not Conducted" value="not_conducted" />
                <Picker.Item label="Shortlisted" value="shortlisted" />
                <Picker.Item label="Rejected" value="rejected" />
              </Picker>
              <View style={styles.buttonRow}>
                <Button title="Save" onPress={saveEditing} />
                <Button title="Cancel" color="gray" onPress={cancelEditing} />
              </View>
            </>
          ) : (
            <>
              <TextInput
                style={[styles.input, { backgroundColor: "#f0f0f0" }]}
                value={String(round.round_number || DEFAULT_ROUND.round_number)}
                editable={true}
                keyboardType="numeric"
                onChangeText={(t) =>
                  setEditableRounds(prev =>
                    prev.map(r => (r.id === round.id ? { ...r, round_number: Number(t) || 0 } : r))
                  )
                }
              />
              <TextInput
                style={[styles.input, { backgroundColor: "#f0f0f0" }]}
                value={round.round_name || DEFAULT_ROUND.round_name}
                editable={false}
              />
              <TextInput
                style={[styles.input, { backgroundColor: "#f0f0f0" }]}
                value={round.round_date || DEFAULT_ROUND.round_date}
                editable={false}
              />
              <TextInput
                style={[styles.input, { backgroundColor: "#f0f0f0" }]}
                value={round.status || DEFAULT_ROUND.status}
                editable={false}
              />
              <TextInput
                style={[styles.input, { backgroundColor: "#f0f0f0" }]}
                value={round.result || "Not Conducted"}
                editable={false}
              />
              <View style={styles.buttonRow}>
                <Button title="Edit" onPress={() => startEditing(round)} />
                <Button title="Delete" color="red" onPress={() => handleDeleteRound(round.id)} />
              </View>
            </>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  roundCard: { backgroundColor: "#fff", padding: 12, marginBottom: 8, borderRadius: 8, elevation: 2 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 12, backgroundColor: "#fff", marginBottom: 8, fontSize: 16, color: "#222" },
  picker: { backgroundColor: "#fafafa", borderRadius: 6, marginBottom: 8 },
  buttonRow: { flexDirection: "row", justifyContent: "space-evenly", marginVertical: 8 },
});
