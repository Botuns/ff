import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, ScrollView, StatusBar, Alert, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';
import { storage } from '../utils/storage';
import { chandaTypes } from '../data/chandaTypes';
import { formatCurrency, calculateChandaAam, calculateWasiyyat } from '../utils/calculations';
import { schedulePromiseReminder } from '../utils/notifications';

export const AddDonationScreen = ({ navigation, route }) => {
  const isPromise = route?.params?.isPromise || false;
  const [selectedType, setSelectedType] = useState(chandaTypes[0]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [recordAsPromise, setRecordAsPromise] = useState(isPromise);
  const [dueDate, setDueDate] = useState('');
  const [profile, setProfile] = useState({ income: 0, currency: 'USD', isWasiyyat: false });
  const [suggestion, setSuggestion] = useState(null);

  useEffect(() => {
    storage.getProfile().then(p => {
      setProfile(p);
      updateSuggestion(selectedType, p);
    });
  }, []);

  const updateSuggestion = (type, p = profile) => {
    if (!p.income) return;
    if (type.id === 'chanda_aam') {
      setSuggestion(calculateChandaAam(p.income));
    } else if (type.id === 'chanda_wasiyyat' && p.isWasiyyat) {
      setSuggestion(calculateWasiyyat(p.income));
    } else if (type.id === 'zakat') {
      setSuggestion(null);
    } else {
      setSuggestion(null);
    }
  };

  const selectType = (type) => {
    setSelectedType(type);
    updateSuggestion(type);
    setAmount('');
  };

  const handleSave = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    const record = {
      chandaType: selectedType.id,
      chandaName: selectedType.name,
      amount: parseFloat(amount),
      currency: profile.currency,
      color: selectedType.color,
      icon: selectedType.icon,
      note,
      paidAt: new Date().toISOString(),
    };

    if (recordAsPromise) {
      const promise = { ...record, fulfilled: false, dueDate };
      await storage.savePromise(promise);
      if (dueDate) await schedulePromiseReminder({ ...promise, chandaName: selectedType.name });
      Alert.alert('Pledge Saved', 'InshAllah you will fulfil this pledge!');
    } else {
      await storage.saveDonation(record);
      Alert.alert('JazakAllah Khair!', 'Your donation has been recorded. May Allah accept it.');
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>{recordAsPromise ? 'New Pledge' : 'Record Payment'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Record as promise toggle */}
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleLabel}>{recordAsPromise ? 'I am making a pledge' : 'I have paid this'}</Text>
            <Text style={styles.toggleSub}>{recordAsPromise ? 'Promise to pay later (Wada)' : 'Payment already made'}</Text>
          </View>
          <Switch
            value={recordAsPromise}
            onValueChange={setRecordAsPromise}
            trackColor={{ false: colors.primary, true: colors.warning + '80' }}
            thumbColor={recordAsPromise ? colors.warning : colors.accent}
          />
        </View>

        {/* Chanda Type */}
        <Text style={styles.label}>Donation Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
          {chandaTypes.map(type => (
            <TouchableOpacity
              key={type.id}
              onPress={() => selectType(type)}
              style={[
                styles.typeBtn,
                selectedType.id === type.id && styles.typeBtnActive,
                { borderColor: type.color + '60' },
                selectedType.id === type.id && { borderColor: type.color },
              ]}
            >
              <Ionicons name={type.icon} size={16} color={selectedType.id === type.id ? type.color : colors.textMuted} />
              <Text style={[styles.typeName, selectedType.id === type.id && { color: type.color }]}>
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.typeDesc}>
          <Ionicons name="information-circle" size={16} color={colors.textMuted} />
          <Text style={styles.typeDescText}>{selectedType.description}</Text>
        </View>

        {/* Suggestion */}
        {suggestion !== null && (
          <TouchableOpacity
            style={styles.suggestion}
            onPress={() => setAmount(suggestion.toFixed(2))}
          >
            <Ionicons name="sparkles" size={16} color={colors.accent} />
            <Text style={styles.suggestionText}>
              Suggested: {formatCurrency(suggestion, profile.currency)} — Tap to use
            </Text>
          </TouchableOpacity>
        )}

        {/* Amount */}
        <Text style={styles.label}>Amount ({profile.currency})</Text>
        <View style={styles.amountRow}>
          <Text style={styles.currencySymbol}>{profile.currency}</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
          />
        </View>

        {/* Due date (only for promises) */}
        {recordAsPromise && (
          <>
            <Text style={styles.label}>Due By (optional)</Text>
            <TextInput
              style={styles.input}
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
            />
          </>
        )}

        {/* Note */}
        <Text style={styles.label}>Note (optional)</Text>
        <TextInput
          style={[styles.input, styles.noteInput]}
          value={note}
          onChangeText={setNote}
          placeholder="e.g. Chanda Aam for April"
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={3}
        />

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name={recordAsPromise ? 'document-text' : 'checkmark-circle'} size={20} color={colors.background} />
          <Text style={styles.saveBtnText}>{recordAsPromise ? 'Save Pledge' : 'Record Payment'}</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  topTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  scroll: { flex: 1 },
  content: { padding: spacing.md },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleLabel: { color: colors.text, fontWeight: '600', fontSize: 15 },
  toggleSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: spacing.sm, marginTop: spacing.md },
  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  typeBtnActive: { backgroundColor: colors.card },
  typeName: { color: colors.textSecondary, fontWeight: '600', fontSize: 13 },
  typeDesc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  typeDescText: { color: colors.textMuted, fontSize: 12, flex: 1 },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent + '15',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
  suggestionText: { color: colors.accentLight, fontSize: 13, fontWeight: '600' },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  currencySymbol: { color: colors.textMuted, fontSize: 14, fontWeight: '600', marginRight: spacing.sm },
  amountInput: {
    flex: 1,
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    padding: spacing.md,
    paddingLeft: 0,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteInput: { height: 80, textAlignVertical: 'top' },
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  saveBtnText: { color: colors.background, fontWeight: '700', fontSize: 16 },
});
