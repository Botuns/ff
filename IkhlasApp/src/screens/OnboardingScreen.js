import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, ScrollView, Switch, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';
import { storage } from '../utils/storage';
import { requestPermissions, scheduleDailyVerse, scheduleMonthlyReminder } from '../utils/notifications';

export const OnboardingScreen = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [income, setIncome] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [isWasiyyat, setIsWasiyyat] = useState(false);

  const currencies = ['USD', 'GBP', 'EUR', 'CAD', 'PKR', 'GHS', 'NGN', 'KES'];

  const handleFinish = async () => {
    await storage.saveProfile({ name, income: parseFloat(income) || 0, currency, isWasiyyat });
    await storage.setOnboarded();
    const granted = await requestPermissions();
    if (granted) {
      await scheduleDailyVerse(7, 0);
      await scheduleMonthlyReminder(25);
    }
    onComplete();
  };

  const steps = [
    {
      icon: 'heart',
      title: 'Assalamu Alaikum',
      subtitle: 'Welcome to Ikhlas — your sincere companion for managing Chanda and financial pledges in the Jama\'at.',
      content: null,
    },
    {
      icon: 'person',
      title: 'Your Profile',
      subtitle: 'Help us personalise your experience.',
      content: (
        <View>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Ahmad Abdullah"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.label}>Monthly Net Income</Text>
          <TextInput
            style={styles.input}
            value={income}
            onChangeText={setIncome}
            placeholder="e.g. 3000"
            keyboardType="numeric"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.label}>Currency</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
            {currencies.map(c => (
              <TouchableOpacity
                key={c}
                onPress={() => setCurrency(c)}
                style={[styles.currencyBtn, currency === c && styles.currencyBtnActive]}
              >
                <Text style={[styles.currencyText, currency === c && styles.currencyTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>I am in the Wasiyyat Scheme</Text>
              <Text style={styles.switchSub}>This adjusts your Chanda calculation</Text>
            </View>
            <Switch
              value={isWasiyyat}
              onValueChange={setIsWasiyyat}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isWasiyyat ? colors.accent : colors.textMuted}
            />
          </View>
        </View>
      ),
    },
    {
      icon: 'notifications',
      title: 'Stay Mindful',
      subtitle: 'Ikhlas will send you daily Quranic reminders and timely Chanda notifications so you never forget.',
      content: (
        <View style={styles.features}>
          {[
            { icon: 'book', text: 'Daily verse or Hadith on giving' },
            { icon: 'alarm', text: 'Month-end Chanda reminder' },
            { icon: 'checkmark-circle', text: 'Promise & pledge tracking' },
            { icon: 'calculator', text: 'Suggestive Chanda calculations' },
          ].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon} size={18} color={colors.accent} />
              </View>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>
      ),
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.iconWrap}>
          <Ionicons name={current.icon} size={48} color={colors.accent} />
        </View>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.subtitle}>{current.subtitle}</Text>
        {current.content}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {steps.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>
        <TouchableOpacity
          style={styles.btn}
          onPress={isLast ? handleFinish : () => setStep(s => s + 1)}
        >
          <Text style={styles.btnText}>{isLast ? 'Get Started' : 'Continue'}</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.background} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: spacing.xl, paddingTop: spacing.xxl },
  iconWrap: {
    width: 90, height: 90,
    backgroundColor: colors.primaryLight + '25',
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    alignSelf: 'center',
  },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: spacing.md },
  subtitle: { color: colors.textSecondary, fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: spacing.xl },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: spacing.xs, marginTop: spacing.md },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencyBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  currencyBtnActive: { backgroundColor: colors.primary, borderColor: colors.primaryLight },
  currencyText: { color: colors.textSecondary, fontWeight: '600' },
  currencyTextActive: { color: colors.accent },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  switchLabel: { color: colors.text, fontWeight: '600' },
  switchSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  features: { gap: spacing.md },
  featureRow: { flexDirection: 'row', alignItems: 'center' },
  featureIcon: {
    width: 38, height: 38,
    backgroundColor: colors.primaryLight + '25',
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  featureText: { color: colors.text, fontSize: 15, flex: 1 },
  footer: { padding: spacing.xl, paddingTop: spacing.md },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: spacing.lg, gap: spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive: { width: 20, backgroundColor: colors.accent },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  btnText: { color: colors.background, fontWeight: '700', fontSize: 16 },
});
