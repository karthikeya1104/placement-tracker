import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, TouchableWithoutFeedback, Linking } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: (value?: any) => void;
  onSecondary?: (value?: any) => void;
  primaryValue?: any;
  secondaryValue?: any;
  onClose?: () => void;
  linkUrl?: string; // Optional URL to make part of the message clickable
  linkText?: string; // Optional clickable text
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
  onClose,
  linkUrl,
  linkText,
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
  const linkColor = '#1e90ff';

  const handleLinkPress = () => {
    if (linkUrl) {
      Linking.openURL(linkUrl).catch(err => console.error('Failed to open URL:', err));
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          {/* Prevent inner touches from triggering backdrop press */}
          <TouchableWithoutFeedback>
            <View style={[styles.container, { backgroundColor: bgColor }]}>
              <Text style={[styles.title, { color: titleColor }]}>{title}</Text>

              <Text style={[styles.message, { color: messageColor }]}>
                {message}
                {linkUrl && linkText && (
                  <Text style={{ color: linkColor, textDecorationLine: 'underline' }} onPress={handleLinkPress}>
                    {` ${linkText}`}
                  </Text>
                )}
              </Text>

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
                    <Text style={[styles.primaryText, { color: primaryText }]}>{primaryLabel}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
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
  primaryText: { fontWeight: '600', textAlign: 'center' },
  secondaryText: { fontWeight: '500', textAlign: 'center' },
});
