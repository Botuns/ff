import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  SafeAreaView, StatusBar, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';
import { storage } from '../utils/storage';
import {
  calculateChandaAam, calculateWasiyyat,
  calculateZakat, formatCurrency,
} from '../utils/calculations';

const ResultRow = ({ label, value, sub, color = colors.accent, onUse }) => (
  <View style={styles.resultRow}>
    <View style={{ flex: 1 }}>
      <Text style={styles.resultLabel}>{label}</Text>
      {sub && <Text style={styles.resultSub}>{sub}</Text>}
    </View>
    <View style={styles.resultRight}>
      <Text style={[styles.resultValue, { color }]}>{value}</Text>
      {onUse && (
        <TouchableOpacity style={styles.useBtn} onPress={onUse}>
          <Text style={styles.useBtnText}>Use</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

export const CalculatorScreen = ({ navigation }) => {
  const [income, setIncome] = useState('');
  const [savings, setSavings] = useState('');
  const [wasiyyatRate, setWasiyyatRate] = useState('10');
  const [isWasiyyat, setIsWasiyyat] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [nisab, setNisab] = useState('4500');

  useEffect(() => {
    storage.getProfile().then(p => {
      if (p.income) setIncome(p.income.toString());
      if (p.currency) setCurrency(p.currency);
      if (p.isWasiyyat) setIsWasiyyat(p.isWasiyyat);
    });
  }, []);

  const monthlyIncome = parseFloat(income) || 0;
  const totalSavings = parseFloat(savings) || 0;
  const wRate = parseFloat(wasiyyatRate) / 100 || 0.1;
  const nisabVal = parseFloat(nisab) || 4500;

  const chandaAam = calculateChandaAam(monthlyIncome);
  const chandaAamAnnual = chandaAam * 12;
  const wasiyyat = calculateWasiyyat(monthlyIncome, wRate);
  const zakat = calculateZakat(totalSavings, nisabVal);
  const zakatDue = totalSavings >= nisabVal;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Chanda Calculator</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Enter your income and we'll calculate the suggested Chanda amounts based on Jama'at guidelines.
        </Text>

        {/* Inputs */}
        <Text style={styles.label}>Monthly Net Income ({currency})</Text>
        <TextInput
          style={styles.input}
          value={income}
          onChangeText={setIncome}
          placeholder="e.g. 3000"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Total Savings ({currency})</Text>
        <TextInput
          style={styles.input}
          value={savings}
          onChangeText={setSavings}
          placeholder="For Zakat calculation"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
        />

        {isWasiyyat && (
          <>
            <Text style={styles.label}>Wasiyyat Rate (%)</Text>
            <View style={styles.rateRow}>
              {['10', '12.5', '15', '20', '25', '33'].map(r => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setWasiyyatRate(r)}
                  style={[styles.rateBtn, wasiyyatRate === r && styles.rateBtnActive]}
                >
                  <Text style={[styles.rateText, wasiyyatRate === r && styles.rateTextActive]}>{r}%</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Results */}
        {monthlyIncome > 0 && (
          <View style={styles.results}>
            <Text style={styles.resultsTitle}>Your Suggested Payments</Text>

            <ResultRow
              label="Chanda Aam (Monthly)"
              sub="1/16th of net income"
              value={formatCurrency(chandaAam, currency)}
              onUse={() => navigation.navigate('AddDonation', { amount: chandaAam.toFixed(2) })}
            />
            <View style={styles.divider} />
            <ResultRow
              label="Chanda Aam (Annual)"
              sub="Monthly × 12"
              value={formatCurrency(chandaAamAnnual, currency)}
              color={colors.primaryLight}
            />

            {isWasiyyat && (
              <>
                <View style={styles.divider} />
                <ResultRow
                  label={`Wasiyyat (${wasiyyatRate}%) Monthly`}
                  sub="For Mausoomeen members"
                  value={formatCurrency(wasiyyat, currency)}
                  color={colors.warning}
                  onUse={() => navigation.navigate('AddDonation', { amount: wasiyyat.toFixed(2) })}
                />
              </>
            )}

            {totalSavings > 0 && (
              <>
                <View style={styles.divider} />
                <ResultRow
                  label="Zakat (Annual)"
                  sub={zakatDue
                    ? `2.5% of savings above Nisab (${formatCurrency(nisabVal, currency)})`
                    : `Savings below Nisab threshold (${formatCurrency(nisabVal, currency)})`}
                  value={zakatDue ? formatCurrency(zakat, currency) : 'Not due'}
                  color={zakatDue ? colors.success : colors.textMuted}
                  onUse={zakatDue ? () => navigation.navigate('AddDonation', { amount: zakat.toFixed(2) }) : undefined}
                />
              </>
            )}
          </View>
        )}

        {/* Nisab setting */}
        <View style={styles.nisabCard}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={styles.nisabLabel}>Nisab Threshold ({currency})</Text>
            <TextInput
              style={styles.nisabInput}
              value={nisab}
              onChangeText={setNisab}
              keyboardType="numeric"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        {/* Guide */}
        <View style={styles.guide}>
          <Text style={styles.guideTitle}>Chanda Guidelines</Text>
          {[
            { name: 'Chanda Aam', rule: '1/16th (6.25%) of monthly net income' },
            { name: 'Wasiyyat', rule: '1/10 to 1/3 (10–33%) of income + property' },
            { name: 'Tahrik-e-Jadid', rule: 'Annual pledge — any amount' },
            { name: 'Waqf-e-Jadid', rule: 'Annual pledge — any amount' },
            { name: 'Zakat', rule: '2.5% of savings above Nisab (held 1 year)' },
          ].map((g, i) => (
            <View key={i} style={styles.guideRow}>
              <Text style={styles.guideName}>{g.name}</Text>
              <Text style={styles.guideRule}>{g.rule}</Text>
            </View>
          ))}
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
  topTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  scroll: { flex: 1 },
  content: { padding: spacing.md },
  intro: { color: colors.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: spacing.lg },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: spacing.sm, marginTop: spacing.md },
  input: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, color: colors.text, fontSize: 16,
    borderWidth: 1, borderColor: colors.border,
  },
  rateRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  rateBtn: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.full, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  rateBtnActive: { backgroundColor: colors.primary, borderColor: colors.primaryLight },
  rateText: { color: colors.textSecondary, fontWeight: '600' },
  rateTextActive: { color: colors.accent },
  results: {
    backgroundColor: colors.card, borderRadius: radius.lg,
    padding: spacing.lg, marginTop: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  resultsTitle: { color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: spacing.lg },
  resultRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  resultLabel: { color: colors.text, fontWeight: '600', fontSize: 14 },
  resultSub: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  resultRight: { alignItems: 'flex-end' },
  resultValue: { fontSize: 18, fontWeight: '700' },
  useBtn: {
    marginTop: 4, backgroundColor: colors.primary + '30',
    paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full,
  },
  useBtnText: { color: colors.accent, fontSize: 11, fontWeight: '700' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  nisabCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, marginTop: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  nisabLabel: { color: colors.textMuted, fontSize: 12, marginBottom: 4 },
  nisabInput: { color: colors.text, fontSize: 15, fontWeight: '600' },
  guide: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, marginTop: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  guideTitle: { color: colors.text, fontWeight: '700', fontSize: 15, marginBottom: spacing.md },
  guideRow: { marginBottom: spacing.sm },
  guideName: { color: colors.accent, fontWeight: '600', fontSize: 13 },
  guideRule: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
});
