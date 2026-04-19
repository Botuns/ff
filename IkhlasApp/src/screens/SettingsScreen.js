import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, ScrollView, StatusBar, Alert, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius } from '../theme/colors';
import { storage } from '../utils/storage';
import { scheduleDailyVerse, scheduleMonthlyReminder, cancelAllReminders, requestPermissions } from '../utils/notifications';

const SettingRow = ({ icon, iconColor, title, subtitle, right, onPress, danger }) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
    <View style={[styles.rowIcon, { backgroundColor: (iconColor || colors.primary) + '20' }]}>
      <Ionicons name={icon} size={18} color={iconColor || colors.primary} />
    </View>
    <View style={styles.rowInfo}>
      <Text style={[styles.rowTitle, danger && { color: colors.danger }]}>{title}</Text>
      {subtitle && <Text style={styles.rowSub}>{subtitle}</Text>}
    </View>
    {right}
  </TouchableOpacity>
);

export const SettingsScreen = ({ navigation }) => {
  const [profile, setProfile] = useState({ name: '', income: 0, currency: 'USD', isWasiyyat: false });
  const [settings, setSettings] = useState({
    dailyVerseEnabled: true,
    dailyVerseTime: '07:00',
    reminderDay: 25,
    notificationsEnabled: true,
  });
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    const [p, s] = await Promise.all([storage.getProfile(), storage.getSettings()]);
    setProfile(p);
    setSettings(s);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const saveProfile = async () => {
    await storage.saveProfile(profile);
    setEditing(false);
    Alert.alert('Saved', 'Profile updated successfully.');
  };

  const toggleNotifications = async (val) => {
    const updated = { ...settings, notificationsEnabled: val };
    setSettings(updated);
    await storage.saveSettings(updated);
    if (val) {
      const granted = await requestPermissions();
      if (granted) {
        await scheduleDailyVerse(7, 0);
        await scheduleMonthlyReminder(updated.reminderDay);
      }
    } else {
      await cancelAllReminders();
    }
  };

  const toggleDailyVerse = async (val) => {
    const updated = { ...settings, dailyVerseEnabled: val };
    setSettings(updated);
    await storage.saveSettings(updated);
    if (val && settings.notificationsEnabled) {
      await scheduleDailyVerse(7, 0);
    }
  };

  const currencies = ['USD', 'GBP', 'EUR', 'CAD', 'PKR', 'GHS', 'NGN', 'KES'];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Settings</Text>
        {editing ? (
          <TouchableOpacity onPress={saveProfile}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setEditing(true)}>
            <Ionicons name="pencil" size={20} color={colors.accent} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Profile */}
        <Text style={styles.section}>Profile</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Name</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={profile.name}
              onChangeText={v => setProfile(p => ({ ...p, name: v }))}
              placeholderTextColor={colors.textMuted}
            />
          ) : (
            <Text style={styles.fieldValue}>{profile.name || '—'}</Text>
          )}

          <View style={styles.divider} />

          <Text style={styles.fieldLabel}>Monthly Net Income</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={profile.income?.toString()}
              onChangeText={v => setProfile(p => ({ ...p, income: parseFloat(v) || 0 }))}
              keyboardType="numeric"
              placeholderTextColor={colors.textMuted}
            />
          ) : (
            <Text style={styles.fieldValue}>{profile.currency} {profile.income?.toLocaleString() || '0'}</Text>
          )}

          <View style={styles.divider} />

          <Text style={styles.fieldLabel}>Currency</Text>
          {editing ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {currencies.map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setProfile(p => ({ ...p, currency: c }))}
                  style={[styles.currBtn, profile.currency === c && styles.currBtnActive]}
                >
                  <Text style={[styles.currText, profile.currency === c && styles.currTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.fieldValue}>{profile.currency}</Text>
          )}

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.fieldLabel}>Wasiyyat Member</Text>
              <Text style={styles.fieldSub}>Adjusts Chanda calculations</Text>
            </View>
            <Switch
              value={profile.isWasiyyat}
              onValueChange={v => {
                setProfile(p => ({ ...p, isWasiyyat: v }));
                if (!editing) storage.saveProfile({ ...profile, isWasiyyat: v });
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={profile.isWasiyyat ? colors.accent : colors.textMuted}
            />
          </View>
        </View>

        {/* Notifications */}
        <Text style={styles.section}>Notifications</Text>
        <View style={styles.card}>
          <SettingRow
            icon="notifications"
            iconColor={colors.primaryLight}
            title="Enable Reminders"
            subtitle="Monthly Chanda & pledge alerts"
            right={
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={settings.notificationsEnabled ? colors.accent : colors.textMuted}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="book"
            iconColor={colors.accent}
            title="Daily Verse"
            subtitle="Morning reminder at 7:00 AM"
            right={
              <Switch
                value={settings.dailyVerseEnabled}
                onValueChange={toggleDailyVerse}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={settings.dailyVerseEnabled ? colors.accent : colors.textMuted}
              />
            }
          />
        </View>

        {/* About */}
        <Text style={styles.section}>About</Text>
        <View style={styles.card}>
          <SettingRow
            icon="heart"
            iconColor={colors.danger}
            title="Ikhlas"
            subtitle="Donation tracker for the Jama'at"
          />
          <View style={styles.divider} />
          <SettingRow icon="shield-checkmark" iconColor={colors.success} title="Privacy" subtitle="All data stored locally on your device" />
          <View style={styles.divider} />
          <SettingRow icon="code-slash" iconColor={colors.textMuted} title="Version" subtitle="1.0.0" />
        </View>

        {/* Danger zone */}
        <View style={[styles.card, { marginTop: spacing.md, borderColor: colors.danger + '30' }]}>
          <SettingRow
            icon="trash"
            iconColor={colors.danger}
            title="Clear All Data"
            danger
            onPress={() => Alert.alert(
              'Clear All Data?',
              'This will permanently delete all your donations and pledges.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete All', style: 'destructive',
                  onPress: async () => {
                    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
                    await AsyncStorage.clear();
                    Alert.alert('Done', 'All data cleared. Restart the app.');
                  },
                },
              ]
            )}
          />
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
  },
  topTitle: { color: colors.text, fontSize: 24, fontWeight: '700' },
  saveText: { color: colors.accent, fontWeight: '700', fontSize: 16 },
  scroll: { flex: 1 },
  content: { padding: spacing.md },
  section: {
    color: colors.textMuted, fontSize: 12, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1,
    marginTop: spacing.lg, marginBottom: spacing.sm, marginLeft: spacing.sm,
  },
  card: {
    backgroundColor: colors.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.md, gap: spacing.md,
  },
  rowIcon: {
    width: 36, height: 36, borderRadius: radius.sm,
    justifyContent: 'center', alignItems: 'center',
  },
  rowInfo: { flex: 1 },
  rowTitle: { color: colors.text, fontWeight: '600', fontSize: 15 },
  rowSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: spacing.md + 36 + spacing.md },
  fieldLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '600', paddingHorizontal: spacing.md, paddingTop: spacing.md },
  fieldValue: { color: colors.text, fontSize: 15, fontWeight: '500', paddingHorizontal: spacing.md, paddingBottom: spacing.md, marginTop: 4 },
  fieldSub: { color: colors.textMuted, fontSize: 12, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surface, borderRadius: radius.sm,
    marginHorizontal: spacing.md, marginVertical: spacing.sm,
    padding: spacing.sm + 2, color: colors.text, fontSize: 15,
    borderWidth: 1, borderColor: colors.border,
  },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.md,
  },
  currBtn: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm - 2,
    borderRadius: radius.full, backgroundColor: colors.surface,
    marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border,
    marginVertical: spacing.sm,
  },
  currBtnActive: { backgroundColor: colors.primary, borderColor: colors.primaryLight },
  currText: { color: colors.textSecondary, fontWeight: '600' },
  currTextActive: { color: colors.accent },
});
