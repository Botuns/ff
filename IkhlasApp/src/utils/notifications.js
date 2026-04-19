import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const requestPermissions = async () => {
  if (!Device.isDevice) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
};

export const scheduleDailyVerse = async (hour = 7, minute = 0) => {
  await Notifications.cancelScheduledNotificationAsync('daily-verse').catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: 'daily-verse',
    content: {
      title: '✨ Reflection for Today',
      body: 'Open Ikhlas for your daily Quranic reminder on giving.',
      data: { screen: 'Verses' },
    },
    trigger: { hour, minute, repeats: true },
  });
};

export const scheduleMonthlyReminder = async (dayOfMonth = 25) => {
  await Notifications.cancelScheduledNotificationAsync('monthly-chanda').catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: 'monthly-chanda',
    content: {
      title: '🕌 Chanda Reminder',
      body: 'Month-end approaching — have you fulfilled your Chanda Aam for this month?',
      data: { screen: 'Donations' },
    },
    trigger: { day: dayOfMonth, hour: 9, minute: 0, repeats: true },
  });
};

export const schedulePromiseReminder = async (promise) => {
  if (!promise.dueDate) return;
  const dueDate = new Date(promise.dueDate);
  const reminderDate = new Date(dueDate);
  reminderDate.setDate(reminderDate.getDate() - 2);
  if (reminderDate <= new Date()) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Promise Due Soon',
      body: `Your pledge of ${promise.amount} for ${promise.chandaName} is due in 2 days.`,
      data: { screen: 'Donations', promiseId: promise.id },
    },
    trigger: { date: reminderDate },
  });
};

export const cancelAllReminders = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const sendImmediateNotification = async (title, body) => {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
};
