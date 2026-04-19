import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  DONATIONS: '@ikhlas_donations',
  PROMISES: '@ikhlas_promises',
  PROFILE: '@ikhlas_profile',
  SETTINGS: '@ikhlas_settings',
  ONBOARDED: '@ikhlas_onboarded',
};

export const storage = {
  async getDonations() {
    const data = await AsyncStorage.getItem(KEYS.DONATIONS);
    return data ? JSON.parse(data) : [];
  },

  async saveDonation(donation) {
    const donations = await this.getDonations();
    const existing = donations.findIndex(d => d.id === donation.id);
    if (existing >= 0) {
      donations[existing] = donation;
    } else {
      donations.unshift({ ...donation, id: Date.now().toString(), createdAt: new Date().toISOString() });
    }
    await AsyncStorage.setItem(KEYS.DONATIONS, JSON.stringify(donations));
    return donations;
  },

  async deleteDonation(id) {
    const donations = await this.getDonations();
    const filtered = donations.filter(d => d.id !== id);
    await AsyncStorage.setItem(KEYS.DONATIONS, JSON.stringify(filtered));
    return filtered;
  },

  async getPromises() {
    const data = await AsyncStorage.getItem(KEYS.PROMISES);
    return data ? JSON.parse(data) : [];
  },

  async savePromise(promise) {
    const promises = await this.getPromises();
    const existing = promises.findIndex(p => p.id === promise.id);
    if (existing >= 0) {
      promises[existing] = promise;
    } else {
      promises.unshift({ ...promise, id: Date.now().toString(), createdAt: new Date().toISOString() });
    }
    await AsyncStorage.setItem(KEYS.PROMISES, JSON.stringify(promises));
    return promises;
  },

  async deletePromise(id) {
    const promises = await this.getPromises();
    const filtered = promises.filter(p => p.id !== id);
    await AsyncStorage.setItem(KEYS.PROMISES, JSON.stringify(filtered));
    return filtered;
  },

  async getProfile() {
    const data = await AsyncStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : { name: '', income: 0, currency: 'USD', isWasiyyat: false };
  },

  async saveProfile(profile) {
    await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  async getSettings() {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      dailyVerseEnabled: true,
      dailyVerseTime: '07:00',
      reminderDay: 25,
      notificationsEnabled: true,
    };
  },

  async saveSettings(settings) {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  async isOnboarded() {
    const val = await AsyncStorage.getItem(KEYS.ONBOARDED);
    return val === 'true';
  },

  async setOnboarded() {
    await AsyncStorage.setItem(KEYS.ONBOARDED, 'true');
  },
};
