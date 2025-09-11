'use client';

import { useEffect } from 'react';
import { DailyReportScheduler } from '@/lib/scheduler';

export function SchedulerProvider() {
  useEffect(() => {
    const scheduler = DailyReportScheduler.getInstance();
    scheduler.start();

    return () => {
      scheduler.stop();
    };
  }, []);

  return null;
}
