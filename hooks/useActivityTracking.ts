import { useEffect, useRef, useState } from 'react';

interface ActivityData {
  date: string; // YYYY-MM-DD
  totalSeconds: number;
  sessions: Array<{
    startTime: number;
    endTime: number;
    duration: number;
  }>;
  emoji?: 'happy' | 'neutral' | 'sad';
}

const STORAGE_KEY = 'aether-study-activity';

export function useActivityTracking(userId: string | undefined) {
  const [isActive, setIsActive] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<number | null>(null);

  // Load activity data from localStorage
  const getActivityData = (): Map<string, ActivityData> => {
    if (!userId) return new Map();
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}:${userId}`);
      if (!stored) return new Map();
      const data = JSON.parse(stored);
      return new Map(Object.entries(data));
    } catch {
      return new Map();
    }
  };

  // Save activity data to localStorage
  const saveActivityData = (data: Map<string, ActivityData>) => {
    if (!userId) return;
    try {
      const obj = Object.fromEntries(data);
      localStorage.setItem(`${STORAGE_KEY}:${userId}`, JSON.stringify(obj));
    } catch (error) {
      console.error('Error saving activity data:', error);
    }
  };

  // Start tracking
  const startTracking = () => {
    if (isActive || intervalRef.current) return;

    setIsActive(true);
    sessionStartRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - (sessionStartRef.current || now)) / 1000);
      setTotalTime(elapsed);
    }, 1000);
  };

  // Stop tracking and save session
  const stopTracking = () => {
    if (!isActive || !intervalRef.current) return;

    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsActive(false);

    if (sessionStartRef.current) {
      const endTime = Date.now();
      const duration = Math.floor((endTime - sessionStartRef.current) / 1000);

      if (duration > 0 && userId) {
        const today = new Date().toISOString().split('T')[0];
        const data = getActivityData();

        const todayData = data.get(today) || {
          date: today,
          totalSeconds: 0,
          sessions: [],
        };

        todayData.totalSeconds += duration;
        todayData.sessions.push({
          startTime: sessionStartRef.current,
          endTime,
          duration,
        });

        data.set(today, todayData);
        saveActivityData(data);
      }

      sessionStartRef.current = null;
    }
  };

  // Get activity data for a date range
  const getActivityForDate = (date: string): ActivityData | undefined => {
    const data = getActivityData();
    return data.get(date);
  };

  // Get activity data for the last N days
  const getActivityForLastDays = (days: number): ActivityData[] => {
    const data = getActivityData();
    const result: ActivityData[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const activity = data.get(dateStr);
      if (activity) {
        result.push(activity);
      } else {
        result.push({
          date: dateStr,
          totalSeconds: 0,
          sessions: [],
        });
      }
    }

    return result.reverse();
  };

  // Get activity data for the entire year (for GitHub-like graph)
  const getYearlyActivity = (): ActivityData[] => {
    const data = getActivityData();
    const result: ActivityData[] = [];
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const activity = data.get(dateStr);
      result.push(
        activity || {
          date: dateStr,
          totalSeconds: 0,
          sessions: [],
        }
      );
    }

    return result;
  };

  // Get total study time for today
  const getTodayTotal = (): number => {
    const today = new Date().toISOString().split('T')[0];
    const data = getActivityData();
    return data.get(today)?.totalSeconds || 0;
  };

  // Save emoji response for today
  const saveEmojiResponse = (emoji: 'happy' | 'neutral' | 'sad') => {
    if (!userId) return;
    const today = new Date().toISOString().split('T')[0];
    const data = getActivityData();

    const todayData = data.get(today) || {
      date: today,
      totalSeconds: 0,
      sessions: [],
    };

    todayData.emoji = emoji;
    data.set(today, todayData);
    saveActivityData(data);
  };

  // Get emoji response for a specific date
  const getEmojiForDate = (date: string): 'happy' | 'neutral' | 'sad' | undefined => {
    const data = getActivityData();
    return data.get(date)?.emoji;
  };

  // Auto-start tracking when component mounts and tab is visible
  useEffect(() => {
    if (!userId) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startTracking();
      } else {
        stopTracking();
      }
    };

    const handleBeforeUnload = () => {
      stopTracking();
    };

    // Start tracking if page is visible
    if (document.visibilityState === 'visible') {
      startTracking();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      stopTracking();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userId]);

  return {
    isActive,
    totalTime,
    getActivityForDate,
    getActivityForLastDays,
    getYearlyActivity,
    getTodayTotal,
    saveEmojiResponse,
    getEmojiForDate,
  };
}
