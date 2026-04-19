import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, StatusBar, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius } from '../theme/colors';
import { storage } from '../utils/storage';
import { DonationItem } from '../components/DonationItem';
import { formatCurrency, getTotalPaid } from '../utils/calculations';

const FILTERS = ['All', 'Payments', 'Pledges', 'Fulfilled'];

export const DonationsScreen = ({ navigation, route }) => {
  const [donations, setDonations] = useState([]);
  const [promises, setPromises] = useState([]);
  const [activeFilter, setActiveFilter] = useState(route?.params?.filter === 'promises' ? 'Pledges' : 'All');
  const [profile, setProfile] = useState({ currency: 'USD' });

  const load = useCallback(async () => {
    const [d, p, pr] = await Promise.all([
      storage.getDonations(),
      storage.getPromises(),
      storage.getProfile(),
    ]);
    setDonations(d);
    setPromises(p);
    setProfile(pr);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const allItems = [
    ...donations.map(d => ({ ...d, itemType: 'payment' })),
    ...promises.map(p => ({ ...p, itemType: 'promise', isPromise: true })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filtered = allItems.filter(item => {
    if (activeFilter === 'Payments') return item.itemType === 'payment';
    if (activeFilter === 'Pledges') return item.itemType === 'promise' && !item.fulfilled;
    if (activeFilter === 'Fulfilled') return item.itemType === 'promise' && item.fulfilled;
    return true;
  });

  const handleDelete = (item) => {
    Alert.alert(
      'Delete',
      `Remove this ${item.itemType === 'promise' ? 'pledge' : 'payment'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            if (item.itemType === 'promise') {
              await storage.deletePromise(item.id);
            } else {
              await storage.deleteDonation(item.id);
            }
            load();
          },
        },
      ]
    );
  };

  const handleFulfill = async (promise) => {
    const updated = { ...promise, fulfilled: true, fulfilledAt: new Date().toISOString() };
    await storage.savePromise(updated);
    await storage.saveDonation({
      chandaType: promise.chandaType,
      chandaName: promise.chandaName,
      amount: promise.amount,
      currency: promise.currency,
      color: promise.color,
      icon: promise.icon,
      note: `Fulfilled pledge from ${new Date(promise.createdAt).toLocaleDateString()}`,
      paidAt: new Date().toISOString(),
    });
    load();
  };

  const totalThisMonth = getTotalPaid(donations, null, 'month');
  const totalAllTime = donations.reduce((s, d) => s + (parseFloat(d.amount) || 0), 0);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Donations</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddDonation')}
        >
          <Ionicons name="add" size={20} color={colors.background} />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>This Month</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalThisMonth, profile.currency)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>All Time</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalAllTime, profile.currency)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Records</Text>
          <Text style={styles.summaryValue}>{allItems.length}</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setActiveFilter(f)}
            style={[styles.filterBtn, activeFilter === f && styles.filterBtnActive]}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View>
            <DonationItem
              donation={item}
              onPress={() => {
                if (item.itemType === 'promise' && !item.fulfilled) {
                  Alert.alert(
                    'Pledge: ' + item.chandaName,
                    `Amount: ${formatCurrency(item.amount, item.currency)}\n\nWould you like to mark this as paid?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Mark as Paid', onPress: () => handleFulfill(item) },
                      { text: 'Delete', style: 'destructive', onPress: () => handleDelete(item) },
                    ]
                  );
                } else {
                  Alert.alert(item.chandaName, `Amount: ${formatCurrency(item.amount, item.currency)}`, [
                    { text: 'OK' },
                    { text: 'Delete', style: 'destructive', onPress: () => handleDelete(item) },
                  ]);
                }
              }}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="wallet-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No records yet</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('AddDonation')}
            >
              <Text style={styles.emptyBtnText}>Record your first donation</Text>
            </TouchableOpacity>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: { color: colors.text, fontSize: 24, fontWeight: '700' },
  addBtn: {
    backgroundColor: colors.primary,
    width: 38, height: 38,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summary: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  summaryValue: { color: colors.accent, fontSize: 16, fontWeight: '700', marginTop: 4 },
  divider: { width: 1, backgroundColor: colors.border },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  filterBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBtnActive: { backgroundColor: colors.primary, borderColor: colors.primaryLight },
  filterText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: colors.accent },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  empty: { alignItems: 'center', paddingTop: spacing.xxl },
  emptyText: { color: colors.textMuted, fontSize: 16, marginTop: spacing.md },
  emptyBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  emptyBtnText: { color: colors.accent, fontWeight: '600' },
});
