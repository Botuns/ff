import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';
import { formatCurrency } from '../utils/calculations';
import { format } from 'date-fns';

export const DonationItem = ({ donation, onPress, onDelete }) => {
  const date = donation.paidAt ? new Date(donation.paidAt) : new Date(donation.createdAt);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.icon, { backgroundColor: (donation.color || colors.primary) + '25' }]}>
        <Ionicons name={donation.icon || 'cash'} size={20} color={donation.color || colors.accent} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{donation.chandaName}</Text>
        <Text style={styles.date}>{format(date, 'dd MMM yyyy')}</Text>
        {donation.note ? <Text style={styles.note}>{donation.note}</Text> : null}
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>{formatCurrency(parseFloat(donation.amount), donation.currency)}</Text>
        {donation.isPromise && (
          <View style={[styles.tag, { backgroundColor: donation.fulfilled ? colors.success + '20' : colors.warning + '20' }]}>
            <Text style={[styles.tagText, { color: donation.fulfilled ? colors.success : colors.warning }]}>
              {donation.fulfilled ? 'Paid' : 'Promise'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    width: 42, height: 42,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  info: { flex: 1 },
  name: { color: colors.text, fontWeight: '600', fontSize: 15 },
  date: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  note: { color: colors.textSecondary, fontSize: 12, marginTop: 2, fontStyle: 'italic' },
  right: { alignItems: 'flex-end' },
  amount: { color: colors.accent, fontWeight: '700', fontSize: 16 },
  tag: {
    marginTop: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  tagText: { fontSize: 10, fontWeight: '700' },
});
