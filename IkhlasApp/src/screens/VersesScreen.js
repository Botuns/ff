import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';
import { verses, getDailyVerse } from '../data/verses';
import { VerseCard } from '../components/VerseCard';

const CATEGORIES = ['All', 'Quran', 'Hadith', 'Giving', 'Reward', 'Urgency'];

export const VersesScreen = ({ navigation }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const dailyVerse = getDailyVerse();

  const filtered = verses.filter(v => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Quran') return v.type === 'quran';
    if (activeCategory === 'Hadith') return v.type === 'hadith';
    return v.category === activeCategory.toLowerCase();
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Verses & Hadith</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Daily Verse Banner */}
      <View style={styles.dailyWrap}>
        <View style={styles.dailyBadge}>
          <Ionicons name="sunny" size={14} color={colors.accent} />
          <Text style={styles.dailyLabel}>Today's Reminder</Text>
        </View>
        <VerseCard verse={dailyVerse} />
      </View>

      {/* Category filters */}
      <View>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={i => i}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveCategory(item)}
              style={[styles.filterBtn, activeCategory === item && styles.filterBtnActive]}
            >
              <Text style={[styles.filterText, activeCategory === item && styles.filterTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <Text style={styles.count}>{filtered.length} references</Text>

      <FlatList
        data={filtered}
        keyExtractor={v => v.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.verseWrap}>
            <VerseCard verse={item} />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
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
  dailyWrap: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  dailyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    marginBottom: spacing.sm,
  },
  dailyLabel: { color: colors.accent, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  filterList: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm, gap: spacing.sm },
  filterBtn: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm - 2,
    borderRadius: radius.full, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  filterBtnActive: { backgroundColor: colors.primary, borderColor: colors.primaryLight },
  filterText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: colors.accent },
  count: { color: colors.textMuted, fontSize: 12, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  verseWrap: { marginBottom: spacing.md },
});
