/**
 * Analysis Service - Long-term tracking and analysis of student reports
 */
import type { Report } from './api';

export interface ReportAnalysis {
  totalReports: number;
  firstReportDate: string;
  lastReportDate: string;
  averageEmotionLevel: number;
  averageSafetyLevel: number;
  mostCommonCategories: Array<{ category: string; count: number }>;
  mostCommonLocations: Array<{ location: string; count: number }>;
  frequencyPattern: {
    once: number;
    sometimes: number;
    often: number;
    always: number;
  };
  statusHistory: Array<{ status: string; date: string }>;
  recurringIssues: string[];
  trendAnalysis: {
    isImproving: boolean;
    isWorsening: boolean;
    hasRecurringProblems: boolean;
    recommendation: string;
  };
}

/**
 * Analyze all reports for a specific student
 */
export function analyzeStudentReports(reports: Report[]): ReportAnalysis {
  if (reports.length === 0) {
    return {
      totalReports: 0,
      firstReportDate: '',
      lastReportDate: '',
      averageEmotionLevel: 0,
      averageSafetyLevel: 0,
      mostCommonCategories: [],
      mostCommonLocations: [],
      frequencyPattern: { once: 0, sometimes: 0, often: 0, always: 0 },
      statusHistory: [],
      recurringIssues: [],
      trendAnalysis: {
        isImproving: false,
        isWorsening: false,
        hasRecurringProblems: false,
        recommendation: 'No reports available for analysis.',
      },
    };
  }

  // Sort reports by date
  const sortedReports = [...reports].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const firstReportDate = sortedReports[0].timestamp;
  const lastReportDate = sortedReports[sortedReports.length - 1].timestamp;

  // Calculate averages
  const totalEmotion = reports.reduce((sum, r) => sum + r.emotion.level, 0);
  const totalSafety = reports.reduce((sum, r) => sum + r.safety.level, 0);
  const averageEmotionLevel = totalEmotion / reports.length;
  const averageSafetyLevel = totalSafety / reports.length;

  // Count categories
  const categoryCount: Record<string, number> = {};
  reports.forEach((report) => {
    report.symbols.forEach((symbol) => {
      categoryCount[symbol.category] = (categoryCount[symbol.category] || 0) + 1;
    });
  });
  const mostCommonCategories = Object.entries(categoryCount)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  // Count locations
  const locationCount: Record<string, number> = {};
  reports.forEach((report) => {
    const locName = report.location.name;
    locationCount[locName] = (locationCount[locName] || 0) + 1;
  });
  const mostCommonLocations = Object.entries(locationCount)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);

  // Frequency pattern
  const frequencyPattern = {
    once: reports.filter((r) => r.frequency.value === 'once').length,
    sometimes: reports.filter((r) => r.frequency.value === 'sometimes').length,
    often: reports.filter((r) => r.frequency.value === 'often').length,
    always: reports.filter((r) => r.frequency.value === 'always').length,
  };

  // Status history
  const statusHistory = sortedReports.map((report) => ({
    status: report.status,
    date: report.timestamp,
  }));

  // Detect recurring issues
  const recurringIssues: string[] = [];
  
  // Check if resolved reports are followed by new reports (indicates incomplete resolution)
  const resolvedReports = sortedReports.filter((r) => r.status === 'resolved');
  resolvedReports.forEach((resolvedReport, index) => {
    const resolvedDate = new Date(resolvedReport.timestamp);
    // Check if there are reports after this resolved one
    const reportsAfter = sortedReports.filter(
      (r) => new Date(r.timestamp) > resolvedDate
    );
    
    if (reportsAfter.length > 0) {
      // Check if subsequent reports have similar categories
      const resolvedCategories = resolvedReport.symbols.map((s) => s.category).sort();
      const hasSimilarCategories = reportsAfter.some((r) => {
        const reportCategories = r.symbols.map((s) => s.category).sort();
        return JSON.stringify(resolvedCategories) === JSON.stringify(reportCategories) ||
               resolvedCategories.some(cat => reportCategories.includes(cat));
      });
      
      if (hasSimilarCategories) {
        const daysAfter = Math.floor(
          (new Date(reportsAfter[0].timestamp).getTime() - resolvedDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        recurringIssues.push(
          `Report resolved on ${new Date(resolvedReport.timestamp).toLocaleDateString()} ` +
          `but similar issues reported ${daysAfter} days later - may indicate incomplete resolution`
        );
      }
    }
  });

  // Trend analysis
  const recentReports = sortedReports.slice(-3); // Last 3 reports
  const olderReports = sortedReports.slice(0, Math.max(0, sortedReports.length - 3));
  
  const recentAvgEmotion = recentReports.length > 0
    ? recentReports.reduce((sum, r) => sum + r.emotion.level, 0) / recentReports.length
    : 0;
  const olderAvgEmotion = olderReports.length > 0
    ? olderReports.reduce((sum, r) => sum + r.emotion.level, 0) / olderReports.length
    : recentAvgEmotion;

  const recentAvgSafety = recentReports.length > 0
    ? recentReports.reduce((sum, r) => sum + r.safety.level, 0) / recentReports.length
    : 0;
  const olderAvgSafety = olderReports.length > 0
    ? olderReports.reduce((sum, r) => sum + r.safety.level, 0) / olderReports.length
    : recentAvgSafety;

  const isImproving = recentAvgEmotion < olderAvgEmotion && recentAvgSafety < olderAvgSafety;
  const isWorsening = recentAvgEmotion > olderAvgEmotion || recentAvgSafety > olderAvgSafety;
  const hasRecurringProblems = recurringIssues.length > 0;

  // Generate recommendation
  let recommendation = '';
  if (hasRecurringProblems) {
    recommendation = '⚠️ CRITICAL: Previous interventions appear incomplete. Similar issues have recurred after resolution. Review and strengthen intervention strategies.';
  } else if (isWorsening) {
    recommendation = '⚠️ Situation appears to be worsening. Immediate intervention and support needed.';
  } else if (isImproving) {
    recommendation = '✓ Positive trend observed. Continue current support strategies.';
  } else if (reports.length > 1) {
    recommendation = 'Monitor closely. Multiple reports indicate ongoing concerns.';
  } else {
    recommendation = 'Single report. Monitor for any recurrence.';
  }

  return {
    totalReports: reports.length,
    firstReportDate,
    lastReportDate,
    averageEmotionLevel: Math.round(averageEmotionLevel * 10) / 10,
    averageSafetyLevel: Math.round(averageSafetyLevel * 10) / 10,
    mostCommonCategories,
    mostCommonLocations,
    frequencyPattern,
    statusHistory,
    recurringIssues,
    trendAnalysis: {
      isImproving,
      isWorsening,
      hasRecurringProblems,
      recommendation,
    },
  };
}

