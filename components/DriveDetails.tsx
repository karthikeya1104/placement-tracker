import React from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { formatDate, DEFAULT_DRIVE_FIELD } from "../utils/utils";
import { useThemeContext } from "../context/ThemeContext";

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
  const { mode } = useThemeContext();

  // Dynamic colors based on theme
  const cardBg = mode === "dark" ? "#2c2c2c" : "#fff";
  const textColor = mode === "dark" ? "#fff" : "#222";
  const subTextColor = mode === "dark" ? "#ccc" : "#555";
  const inputBg = mode === "dark" ? "#3a3a3a" : "#e0e0e0"; // light gray in light mode
  const inputBorder = mode === "dark" ? "#555" : "#ccc";
  const pickerBg = mode === "dark" ? "#3a3a3a" : "#fafafa";

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
            <Text style={[styles.fieldLabel, { color: subTextColor }]}>{label}:</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor: inputBorder }]}
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

        const selectedValue =
          key === "selected"
            ? value === 1 || value === "1" || value === "Yes"
              ? "Yes"
              : "No"
            : value ?? options[0].value;

        return (
          <View key={key} style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: subTextColor }]}>{label}:</Text>
            <Picker
              selectedValue={selectedValue}
              onValueChange={(v) => setEditableDrive({ ...editableDrive, [key]: v })}
              style={[styles.picker, { backgroundColor: pickerBg, color: textColor }]}
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
          <Text style={[styles.fieldLabel, { color: subTextColor }]}>{label}:</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor: inputBorder }]}
            value={editableDrive[key] ? String(editableDrive[key]) : ""}
            onChangeText={(text) => setEditableDrive({ ...editableDrive, [key]: text })}
            multiline
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
        <Text style={[styles.fieldLabel, { color: subTextColor }]}>{label}:</Text>
        <TextInput
          style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor: inputBorder }]}
          editable={false}
          value={displayValue}
          multiline
          textAlignVertical="top"
        />
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 0 }}>
      <Text style={[styles.title, { color: textColor }]}>{editableDrive.company_name || DEFAULT_DRIVE_FIELD}</Text>
      <Text style={[styles.subTitle, { color: subTextColor }]}>{editableDrive.role || DEFAULT_DRIVE_FIELD}</Text>

      <View style={[styles.card, { backgroundColor: cardBg }]}>
        {Object.entries(editableDrive)
          .filter(([key]) => !["id", "rounds", "raw_messages", "queued_for_retry", "parse_status"].includes(key))
          .map(([key, value]) => renderField(key, value))}
      </View>

      <View style={styles.buttonRow}>
        {isEditing ? (
          <>
            <TouchableOpacity style={[styles.curvedButton, { backgroundColor: "#6200ee" }]} onPress={handleSaveDrive}>
              <Text style={styles.curvedButtonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.curvedButton, { backgroundColor: "#888" }]} onPress={restoreOriginal}>
              <Text style={styles.curvedButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={[styles.curvedButton, { backgroundColor: "#6200ee" }]} onPress={() => setIsEditing(true)}>
            <Text style={styles.curvedButtonText}>Edit Details</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={[styles.curvedButton, { backgroundColor: "red", marginTop: 16 }]} onPress={handleDeleteDrive}>
        <Text style={styles.curvedButtonText}>Delete Drive</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  subTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  card: { padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2 },
  fieldRow: { marginBottom: 12 },
  fieldLabel: { fontWeight: "600", fontSize: 16, marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 8, fontSize: 16, minHeight: 40 },
  picker: { borderRadius: 8, marginBottom: 8 },
  buttonRow: { flexDirection: "row", justifyContent: "space-evenly", marginVertical: 8 },
  curvedButton: { flex: 1, paddingVertical: 12, marginHorizontal: 5, borderRadius: 25, alignItems: "center" },
  curvedButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
