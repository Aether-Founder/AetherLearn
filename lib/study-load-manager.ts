interface StudySession {
  date: string;
  minutes: number;
  itemsCompleted: number;
  mode: string;
}

interface StudyLoadStats {
  todayMinutes: number;
  todayItems: number;
  weeklyAverage: number;
  streakDays: number;
  burnoutRisk: 'low' | 'medium' | 'high';
  overloadWarning: boolean;
}

interface PriorityItem {
  id: string;
  type: 'homework' | 'test' | 'quiz' | 'note';
  subject: string;
  dueDate?: string;
  priority: 'urgent' | 'important' | 'normal';
  score?: number;
}

export class StudyLoadManager {
  private sessions: StudySession[] = [];

  constructor() {
    this.loadSessions();
  }

  private loadSessions() {
    try {
      const stored = localStorage.getItem('aether_study_sessions');
      if (stored) {
        this.sessions = JSON.parse(stored);
      }
    } catch {
      this.sessions = [];
    }
  }

  private saveSessions() {
    try {
      localStorage.setItem('aether_study_sessions', JSON.stringify(this.sessions));
    } catch {
      console.error('Failed to save study sessions');
    }
  }

  recordSession(minutes: number, itemsCompleted: number, mode: string) {
    const today = new Date().toISOString().split('T')[0];
    const existingIndex = this.sessions.findIndex((s) => s.date === today);

    if (existingIndex >= 0) {
      this.sessions[existingIndex].minutes += minutes;
      this.sessions[existingIndex].itemsCompleted += itemsCompleted;
      this.sessions[existingIndex].mode = mode;
    } else {
      this.sessions.push({
        date: today,
        minutes,
        itemsCompleted,
        mode,
      });
    }

    this.saveSessions();
  }

  getStats(dailyLimit: number): StudyLoadStats {
    const today = new Date().toISOString().split('T')[0];
    const todaySession = this.sessions.find((s) => s.date === today);

    const todayMinutes = todaySession?.minutes || 0;
    const todayItems = todaySession?.itemsCompleted || 0;

    // Calculate weekly average
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentSessions = this.sessions.filter((s) => new Date(s.date) >= oneWeekAgo);
    const weeklyAverage = recentSessions.length > 0
      ? recentSessions.reduce((sum, s) => sum + s.minutes, 0) / recentSessions.length
      : 0;

    // Calculate streak
    let streakDays = 0;
    const checkDate = new Date();
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const session = this.sessions.find((s) => s.date === dateStr);
      if (session && session.minutes > 0) {
        streakDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate burnout risk
    const burnoutRisk = this.calculateBurnoutRisk(todayMinutes, weeklyAverage, streakDays);

    // Check for overload
    const overloadWarning = todayMinutes >= dailyLimit * 0.9;

    return {
      todayMinutes,
      todayItems,
      weeklyAverage,
      streakDays,
      burnoutRisk,
      overloadWarning,
    };
  }

  private calculateBurnoutRisk(
    todayMinutes: number,
    weeklyAverage: number,
    streakDays: number
  ): 'low' | 'medium' | 'high' {
    // High risk if studying significantly more than average
    if (weeklyAverage > 0 && todayMinutes > weeklyAverage * 1.5) {
      return 'high';
    }

    // High risk if streak is very long (> 14 days)
    if (streakDays > 14) {
      return 'high';
    }

    // Medium risk if streak is long (> 7 days)
    if (streakDays > 7) {
      return 'medium';
    }

    // Medium risk if studying more than 2 hours daily
    if (todayMinutes > 120) {
      return 'medium';
    }

    return 'low';
  }

  prioritizeItems(items: PriorityItem[], filter: 'all' | 'urgent' | 'important' | 'normal'): PriorityItem[] {
    const today = new Date();
    const prioritized = items.map((item) => {
      let score = 0;

      // Base priority score
      switch (item.priority) {
        case 'urgent':
          score += 100;
          break;
        case 'important':
          score += 50;
          break;
        case 'normal':
          score += 10;
          break;
      }

      // Adjust based on due date
      if (item.dueDate) {
        const dueDate = new Date(item.dueDate);
        const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntil <= 1) score += 50;
        else if (daysUntil <= 3) score += 30;
        else if (daysUntil <= 7) score += 20;
      }

      return { ...item, score };
    });

    // Sort by score (descending)
    prioritized.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Filter based on requested priority level
    if (filter === 'all') return prioritized;
    return prioritized.filter((item) => item.priority === filter);
  }

  getLoadReductionSuggestions(stats: StudyLoadStats): string[] {
    const suggestions: string[] = [];

    if (stats.burnoutRisk === 'high') {
      suggestions.push('Neem minimaal één rustdag deze week');
      suggestions.push('Verlaag je dagelijkse studeertijd met 30-50%');
      suggestions.push('Schakel over naar Ziekte Modus of Vakantie Modus');
    }

    if (stats.overloadWarning) {
      suggestions.push('Je bent bijna op je daglimiet. Stop met studeren voor vandaag.');
      suggestions.push('Prioriteer alleen de meest dringende taken');
    }

    if (stats.weeklyAverage > 90) {
      suggestions.push('Je wekelijkse gemiddelde is hoog. Overweeg om meer rust in te plannen.');
    }

    if (stats.streakDays > 10) {
      suggestions.push(`Je hebt ${stats.streakDays} dagen achter elkaar gestudeerd. Overweeg een pauze.`);
    }

    return suggestions;
  }
}
