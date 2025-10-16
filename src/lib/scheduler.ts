import { apiClient } from './api';

export class DailyReportScheduler {
  private static instance: DailyReportScheduler;
  private intervalId: NodeJS.Timeout | null = null;

  static getInstance(): DailyReportScheduler {
    if (!DailyReportScheduler.instance) {
      DailyReportScheduler.instance = new DailyReportScheduler();
    }
    return DailyReportScheduler.instance;
  }

  start() {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        this.generateDailyReports();
      }
    }, 60000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async generateDailyReports() {
    try {
      const shops = await apiClient.getCoffeeShops();
      
      for (const shop of shops) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateStr = yesterday.toISOString().split('T')[0];
        
        const response = await fetch(`/api/reports/daily?shopId=${shop._id}&date=${dateStr}`);
        const reportData = await response.json();
        
        console.log(`Daily report for ${shop.name}:`, reportData);
      }
    } catch (error) {
      console.error('Failed to generate daily reports:', error);
    }
  }
}
