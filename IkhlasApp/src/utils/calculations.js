export const calculateChandaAam = (monthlyIncome) => {
  return monthlyIncome * (1 / 16);
};

export const calculateWasiyyat = (monthlyIncome, rate = 0.1) => {
  return monthlyIncome * rate;
};

export const calculateZakat = (totalSavings, nisab = 4500) => {
  if (totalSavings < nisab) return 0;
  return totalSavings * 0.025;
};

export const formatCurrency = (amount, currency = 'USD') => {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const getMonthProgress = () => {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return now.getDate() / daysInMonth;
};

export const getDaysLeftInMonth = () => {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return daysInMonth - now.getDate();
};

export const getYearProgress = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear() + 1, 0, 1);
  return (now - start) / (end - start);
};

export const getTotalPaid = (donations, type = null, period = 'month') => {
  const now = new Date();
  return donations
    .filter(d => {
      if (type && d.chandaType !== type) return false;
      const date = new Date(d.paidAt || d.createdAt);
      if (period === 'month') {
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }
      if (period === 'year') {
        return date.getFullYear() === now.getFullYear();
      }
      return true;
    })
    .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
};

export const getPendingPromises = (promises) => {
  return promises.filter(p => !p.fulfilled);
};

export const getTotalPromised = (promises) => {
  return getPendingPromises(promises).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
};
