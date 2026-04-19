import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme/colors';

export const VerseCard = ({ verse, compact = false }) => {
  if (!verse) return null;
  const isQuran = verse.type === 'quran';

  return (
    <View style={[styles.card, compact && styles.compact]}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{isQuran ? '📖 Quran' : '📜 Hadith'}</Text>
      </View>
      {isQuran && verse.arabic && !compact && (
        <Text style={styles.arabic}>{verse.arabic}</Text>
      )}
      <Text style={styles.text}>{verse.text}</Text>
      <Text style={styles.reference}>— {verse.reference}</Text>
      {!isQuran && verse.narrator && (
        <Text style={styles.narrator}>Narrated by {verse.narrator}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compact: {
    padding: spacing.md,
    borderRadius: radius.md,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight + '30',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
  },
  badgeText: { color: colors.accent, fontSize: 11, fontWeight: '600' },
  arabic: {
    color: colors.accentLight,
    fontSize: 20,
    textAlign: 'right',
    lineHeight: 34,
    marginBottom: spacing.md,
    fontWeight: '400',
  },
  text: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  reference: { color: colors.accent, fontSize: 13, fontWeight: '600' },
  narrator: { color: colors.textSecondary, fontSize: 12, marginTop: 3 },
});
