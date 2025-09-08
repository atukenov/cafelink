export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatTime = (timeString: string) => {
  return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const formatDuration = (startTime: string | Date, endTime?: string | Date) => {
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  const diff = end.getTime() - start.getTime();
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const formatCurrency = (amount: number, currency: string = '₸') => {
  return `${amount} ${currency}`;
};

export const getStatusColor = (status: string) => {
  const statusColors: Record<string, string> = {
    received: 'bg-blue-100 text-blue-800',
    viewed: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    ready: 'bg-purple-100 text-purple-800',
    pending: 'bg-gray-100 text-gray-800',
    done: 'bg-green-100 text-green-800'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const classNames = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};
