import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: (value?: any) => void;    // <-- enhanced
  onSecondary?: (value?: any) => void;  // <-- enhanced
  primaryValue?: any;                   // optional value returned on primary press
  secondaryValue?: any;                 // optional value returned on secondary press
}

export default function CustomAlertModal({
  visible,
  title,
  message,
  primaryLabel = 'OK',
  secondaryLabel,
  onPrimary,
  onSecondary,
  primaryValue,
  secondaryValue,
}: Props) {
  const { mode } = useThemeContext();

  // Theme-based colors
  const bgColor = mode === 'dark' ? '#1e1e1e' : '#fff';
  const titleColor = mode === 'dark' ? '#fff' : '#111';
  const messageColor = mode === 'dark' ? '#ccc' : '#444';
  const primaryBg = mode === 'dark' ? '#4da6ff' : '#007bff';
  const primaryText = '#fff';
  const secondaryBg = mode === 'dark' ? '#333' : '#eee';
  const secondaryText = mode === 'dark' ? '#ccc' : '#333';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (onSecondary) onSecondary(secondaryValue);
        else if (onPrimary) onPrimary(primaryValue);
      }}
    >
      <View style={styles.backdrop}>
        <View style={[styles.container, { backgroundColor: bgColor }]}>
          <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
          <Text style={[styles.message, { color: messageColor }]}>{message}</Text>

          <View style={styles.buttonRow}>
            {secondaryLabel && onSecondary && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: secondaryBg }]}
                onPress={() => onSecondary(secondaryValue)}
              >
                <Text style={[styles.secondaryText, { color: secondaryText }]}>
                  {secondaryLabel}
                </Text>
              </TouchableOpacity>
            )}

            {onPrimary && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: primaryBg }]}
                onPress={() => onPrimary(primaryValue)}
              >
                <Text style={[styles.primaryText, { color: primaryText }]}>
                  {primaryLabel}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    marginBottom: 20,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
    marginTop: 5,
  },
  primaryText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryText: {
    fontWeight: '500',
    textAlign: 'center',
  },
});
