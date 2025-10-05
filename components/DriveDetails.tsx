import React from "react";
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { formatDate, DEFAULT_DRIVE_FIELD } from "../utils/utils";

interface Props {
  editableDrive: any;
  originalDrive: any;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  setEditableDrive: (drive: any) => void;
  handleSaveDrive: () => void;
  handleCancelDrive: () => void;
  handleDeleteDrive: () => void;
}

const FIELD_LABELS: { [key: string]: string } = {
  company_name: "Company Name",
  role: "Role",
  location: "Location",
  ctc_stipend: "CTC / Stipend",
  status: "Status",
  registration_status: "Registration Status",
  selected: "Selected",
  skills_notes: "Skills / Notes",
  created_at: "Created At",
  updated_at: "Updated At",
};

export default function DriveDetails({
  editableDrive,
  originalDrive,
  isEditing,
  setIsEditing,
  setEditableDrive,
  handleSaveDrive,
  handleCancelDrive,
  handleDeleteDrive,
}: Props) {
  const restoreOriginal = () => {
    setEditableDrive({ ...originalDrive });
    setIsEditing(false);
  };

  const renderField = (key: string, value: any) => {
    const label = FIELD_LABELS[key] || key;

    if (isEditing) {
      if (key === "created_at" || key === "updated_at") {
        return (
          <View key={key} style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>{label}:</Text>
            <TextInput
              style={[styles.input, { backgroundColor: "#f0f0f0" }]}
              editable={false}
              value={formatDate(value)}
            />
          </View>
        );
      }

      if (["status", "registration_status", "selected"].includes(key)) {
        let options: any[] = [];
        if (key === "status")
          options = [
            { label: "Upcoming", value: "upcoming" },
            { label: "Ongoing", value: "ongoing" },
            { label: "Finished", value: "finished" },
          ];
        if (key === "registration_status")
          options = [
            { label: "Registered", value: "registered" },
            { label: "Not Registered", value: "not_registered" },
          ];
        if (key === "selected")
          options = [
            { label: "Yes", value: "Yes" },
            { label: "No", value: "No" },
          ];

        // normalize backend value for dropdowns
        const selectedValue = key === "selected"
          ? value === 1 || value === "1" || value === "Yes" ? "Yes" : "No"
          : value ?? options[0].value;

        return (
          <View key={key} style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>{label}:</Text>
            <Picker
              selectedValue={selectedValue}
              onValueChange={(v) => setEditableDrive({ ...editableDrive, [key]: v })}
              style={styles.picker}
            >
              {options.map((o) => (
                <Picker.Item key={o.value} label={o.label} value={o.value} />
              ))}
            </Picker>
          </View>
        );
      }

      return (
        <View key={key} style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>{label}:</Text>
          <TextInput
            style={styles.input}
            value={editableDrive[key] ? String(editableDrive[key]) : ""}
            onChangeText={(text) => setEditableDrive({ ...editableDrive, [key]: text })}
            multiline={true}
            textAlignVertical="top"
          />
        </View>
      );
    }

    // Display mode
    let displayValue: string;
    if (key === "selected") displayValue = value === 1 || value === "1" || value === "Yes" ? "Yes" : "No";
    else if (["created_at", "updated_at"].includes(key)) displayValue = formatDate(value);
    else displayValue = value?.toString()?.trim() || DEFAULT_DRIVE_FIELD;

    return (
      <View key={key} style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>{label}:</Text>
        <TextInput
          style={[styles.input, { backgroundColor: "#f0f0f0" }]}
          editable={false}
          value={displayValue}
          multiline={true}
          textAlignVertical="top"
        />
      </View>
    );
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <Text style={styles.title}>{editableDrive.company_name || DEFAULT_DRIVE_FIELD}</Text>
      <Text style={styles.subTitle}>{editableDrive.role || DEFAULT_DRIVE_FIELD}</Text>

      <View style={styles.card}>
        {Object.entries(editableDrive)
          .filter(([, value]) => true)
          .map(([key, value]) => {
            if (["id", "rounds", "raw_messages", "queued_for_retry", "parse_status"].includes(key))
              return null;
            return renderField(key, value);
          })}
      </View>

      <View style={styles.buttonRow}>
        {isEditing ? (
          <>
            <Button title="Save" onPress={handleSaveDrive} />
            <Button title="Cancel" color="gray" onPress={restoreOriginal} />
          </>
        ) : (
          <Button title="Edit Details" onPress={() => setIsEditing(true)} />
        )}
      </View>

      <View style={{ marginTop: 16 }}>
        <Button title="Delete Drive" color="red" onPress={handleDeleteDrive} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 4, color: "#222" },
  subTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12, color: "#555" },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 8, marginBottom: 16, elevation: 2 },
  fieldRow: { marginBottom: 12 },
  fieldLabel: { fontWeight: "600", fontSize: 16, color: "#333", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 8,
    fontSize: 16,
    color: "#222",
    minHeight: 40, // ensures single-line fields still have some height
  },
  picker: { backgroundColor: "#fafafa", borderRadius: 6, marginBottom: 8 },
  buttonRow: { flexDirection: "row", justifyContent: "space-evenly", marginVertical: 8 },
});
