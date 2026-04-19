import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius } from '../theme/colors';
import { storage } from '../utils/storage';
import { VerseCard } from '../components/VerseCard';
import { ProgressRing } from '../components/ProgressRing';
import {
  formatCurrency, getTotalPaid, getTotalPromised,
  getPendingPromises, getMonthProgress, getDaysLeftInMonth,
} from '../utils/calculations';
import { getDailyVerse } from '../data/verses';
import { chandaTypes } from '../data/chandaTypes';
import { format } from 'date-fns';

export const DashboardScreen = ({ navigation }) => {
  const [profile, setProfile] = useState({ name: '', income: 0, currency: 'USD' });
  const [donations, setDonations] = useState([]);
  const [promises, setPromises] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const verse = getDailyVerse();

  const load = useCallback(async () => {
    const [p, d, pr] = await Promise.all([
      storage.getProfile(),
      storage.getDonations(),
      storage.getPromises(),
    ]);
    setProfile(p);
    setDonations(d);
    setPromises(pr);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const monthlyPaid = getTotalPaid(donations, null, 'month');
  const yearlyPaid = getTotalPaid(donations, null, 'year');
  const chandaAamTarget = profile.income * (1 / 16);
  const chandaAamPaid = getTotalPaid(
    donations.filter(d => d.chandaType === 'chanda_aam'), null, 'month'
  );
  const monthProgress = getMonthProgress();
  const daysLeft = getDaysLeftInMonth();
  const pendingPromises = getPendingPromises(promises);
  const totalPromised = getTotalPromised(promises);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Assalamu Alaikum';
    if (h < 18) return 'Wa Alaikum Assalam';
    return 'JazakAllah Khair';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.name}>{profile.name || 'Brother / Sister'}</Text>
            <Text style={styles.date}>{format(new Date(), 'EEEE, d MMMM yyyy')}</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddDonation')}
          >
            <Ionicons name="add" size={24} color={colors.background} />
          </TouchableOpacity>
        </View>

        {/* Daily Verse */}
        <TouchableOpacity onPress={() => navigation.navigate('Verses')}>
          <VerseCard verse={verse} compact />
        </TouchableOpacity>

        {/* Month Overview */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>This Month</Text>
          <Text style={styles.sectionSub}>{daysLeft} days left</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <ProgressRing
              progress={chandaAamTarget > 0 ? chandaAamPaid / chandaAamTarget : 0}
              size={70}
              color={colors.primary}
              label={`${Math.round((chandaAamTarget > 0 ? chandaAamPaid / chandaAamTarget : 0) * 100)}%`}
              sublabel="Chanda Aam"
            />
            <Text style={styles.statLabel}>Chanda Aam</Text>
            <Text style={styles.statValue}>{formatCurrency(chandaAamPaid, profile.currency)}</Text>
            <Text style={styles.statTarget}>of {formatCurrency(chandaAamTarget, profile.currency)}</Text>
          </View>

          <View style={styles.statCard}>
            <ProgressRing
              progress={monthProgress}
              size={70}
              color={colors.accent}
              label={`${Math.round(monthProgress * 100)}%`}
              sublabel="Month"
            />
            <Text style={styles.statLabel}>Total Given</Text>
            <Text style={styles.statValue}>{formatCurrency(monthlyPaid, profile.currency)}</Text>
            <Text style={styles.statTarget}>this month</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.promiseBadge}>
              <Text style={styles.promiseCount}>{pendingPromises.length}</Text>
            </View>
            <Text style={styles.statLabel}>Pledges</Text>
            <Text style={styles.statValue}>{formatCurrency(totalPromised, profile.currency)}</Text>
            <Text style={styles.statTarget}>pending</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.actionsGrid}>
          {[
            { icon: 'cash', label: 'Record Payment', color: colors.primary, screen: 'AddDonation', params: {} },
            { icon: 'document-text', label: 'New Pledge', color: colors.accent, screen: 'AddDonation', params: { isPromise: true } },
            { icon: 'calculator', label: 'Calculator', color: colors.primaryLight, screen: 'Calculator', params: {} },
            { icon: 'book', label: 'Verses', color: '#7B68EE', screen: 'Verses', params: {} },
          ].map((a, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.actionBtn, { borderColor: a.color + '40' }]}
              onPress={() => navigation.navigate(a.screen, a.params)}
            >
              <View style={[styles.actionIcon, { backgroundColor: a.color + '20' }]}>
                <Ionicons name={a.icon} size={22} color={a.color} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Yearly Summary */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Year {new Date().getFullYear()}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Donations')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.yearCard}>
          <View style={styles.yearRow}>
            <Text style={styles.yearLabel}>Total Donated</Text>
            <Text style={styles.yearValue}>{formatCurrency(yearlyPaid, profile.currency)}</Text>
          </View>
          <View style={[styles.yearRow, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md }]}>
            <Text style={styles.yearLabel}>Pending Promises</Text>
            <Text style={[styles.yearValue, { color: colors.warning }]}>
              {formatCurrency(totalPromised, profile.currency)}
            </Text>
          </View>
        </View>

        {/* Pending Promises Alert */}
        {pendingPromises.length > 0 && (
          <TouchableOpacity
            style={styles.alertCard}
            onPress={() => navigation.navigate('Donations', { filter: 'promises' })}
          >
            <Ionicons name="alert-circle" size={20} color={colors.warning} />
            <Text style={styles.alertText}>
              You have {pendingPromises.length} unfulfilled pledge{pendingPromises.length > 1 ? 's' : ''}.
              Tap to review.
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    paddingTop: spacing.md,
  },
  greeting: { color: colors.textSecondary, fontSize: 13, fontWeight: '500' },
  name: { color: colors.text, fontSize: 22, fontWeight: '700', marginTop: 2 },
  date: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  addBtn: {
    backgroundColor: colors.primary,
    width: 44, height: 44,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  sectionSub: { color: colors.textMuted, fontSize: 12 },
  viewAll: { color: colors.accent, fontSize: 13, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '600', marginTop: spacing.sm, textAlign: 'center' },
  statValue: { color: colors.text, fontSize: 13, fontWeight: '700', marginTop: 2 },
  statTarget: { color: colors.textMuted, fontSize: 10, marginTop: 1 },
  promiseBadge: {
    width: 70, height: 70,
    backgroundColor: colors.warning + '20',
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.warning + '60',
  },
  promiseCount: { color: colors.warning, fontSize: 26, fontWeight: '700' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionBtn: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionIcon: {
    width: 46, height: 46,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionLabel: { color: colors.text, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  yearCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  yearRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: spacing.sm },
  yearLabel: { color: colors.textSecondary, fontSize: 14 },
  yearValue: { color: colors.accent, fontSize: 18, fontWeight: '700' },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '15',
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning + '30',
    gap: spacing.sm,
  },
  alertText: { flex: 1, color: colors.text, fontSize: 13 },
});
