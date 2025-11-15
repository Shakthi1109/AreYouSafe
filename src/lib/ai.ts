/**
 * AI Service - Generate actionable recommendations based on bullying reports
 */
import type { Report } from './api';

export interface AIRecommendation {
  summary: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  immediateActions: string[];
  shortTermActions: string[];
  longTermActions: string[];
  resources: string[];
  notes: string;
}

/**
 * Generate AI recommendations based on report data
 * For demo purposes, this uses a rule-based system
 * In production, this would call an actual AI API (OpenAI, Anthropic, etc.)
 */
export async function generateRecommendations(report: Report): Promise<AIRecommendation> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Analyze report data
  const hasPhysicalHarassment = report.bodyMap && report.bodyMap.length > 0;
  const emotionLevel = report.emotion.level;
  const safetyLevel = report.safety.level;
  const frequency = report.frequency.value;
  const categories = report.symbols.map(s => s.category);
  const hasPhysical = categories.includes('physical');
  const hasVerbal = categories.includes('verbal');
  const hasSocial = categories.includes('social');
  const hasCyber = categories.includes('cyber');

  // Determine urgency
  let urgency: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  if (hasPhysicalHarassment || safetyLevel >= 4 || emotionLevel >= 4) {
    urgency = 'critical';
  } else if (safetyLevel >= 3 || emotionLevel >= 3 || frequency === 'often' || frequency === 'always') {
    urgency = 'high';
  } else if (emotionLevel >= 2 || frequency === 'sometimes') {
    urgency = 'medium';
  } else {
    urgency = 'low';
  }

  // Generate recommendations based on report
  const immediateActions: string[] = [];
  const shortTermActions: string[] = [];
  const longTermActions: string[] = [];
  const resources: string[] = [];

  // Immediate actions
  if (urgency === 'critical') {
    immediateActions.push('Contact school administration immediately');
    immediateActions.push('Ensure student safety - consider temporary separation if needed');
    immediateActions.push('Notify parents/guardians of both parties');
  } else if (urgency === 'high') {
    immediateActions.push('Schedule meeting with student within 24 hours');
    immediateActions.push('Document incident thoroughly');
    immediateActions.push('Assess immediate safety concerns');
  } else {
    immediateActions.push('Review report details carefully');
    immediateActions.push('Plan follow-up conversation with student');
  }

  if (hasPhysicalHarassment) {
    immediateActions.push('Document physical evidence if applicable');
    immediateActions.push('Consider medical attention if injuries present');
  }

  // Short-term actions
  if (hasPhysical) {
    shortTermActions.push('Implement increased supervision in identified location');
    shortTermActions.push('Review and enforce school anti-bullying policies');
    shortTermActions.push('Conduct mediation session if appropriate');
  }

  if (hasVerbal) {
    shortTermActions.push('Provide conflict resolution training');
    shortTermActions.push('Monitor interactions between involved parties');
    shortTermActions.push('Implement positive behavior reinforcement');
  }

  if (hasSocial) {
    shortTermActions.push('Facilitate social skills development');
    shortTermActions.push('Create inclusive group activities');
    shortTermActions.push('Address social exclusion patterns');
  }

  if (hasCyber) {
    shortTermActions.push('Review digital communication policies');
    shortTermActions.push('Educate on responsible online behavior');
    shortTermActions.push('Monitor online interactions if possible');
  }

  if (frequency === 'often' || frequency === 'always') {
    shortTermActions.push('Develop intervention plan with school counselor');
    shortTermActions.push('Establish regular check-ins with student');
    shortTermActions.push('Create safety plan for student');
  }

  // Long-term actions
  longTermActions.push('Develop comprehensive anti-bullying program');
  longTermActions.push('Provide ongoing support and counseling');
  longTermActions.push('Monitor progress and adjust interventions as needed');
  longTermActions.push('Foster positive school climate and culture');
  
  if (emotionLevel >= 3) {
    longTermActions.push('Connect student with mental health resources');
    longTermActions.push('Implement emotional support strategies');
  }

  // Resources
  resources.push('School counseling services');
  resources.push('Anti-bullying policy documentation');
  
  if (hasPhysical) {
    resources.push('Physical safety protocols');
  }
  
  if (hasCyber) {
    resources.push('Digital citizenship resources');
  }
  
  if (emotionLevel >= 3) {
    resources.push('Mental health support services');
  }

  // Generate summary
  const summary = `This report indicates ${urgency} urgency level. The student has reported ${categories.join(', ')} harassment. ` +
    `Emotional state is at level ${emotionLevel}/5 and safety level is ${safetyLevel}/5. ` +
    `The incident frequency is ${frequency}. ` +
    `${hasPhysicalHarassment ? 'Physical harassment has been reported with specific body parts affected. ' : ''}` +
    `Location: ${report.location.name}. ` +
    `Immediate attention and appropriate intervention are recommended.`;

  // Generate notes
  const notes = `Based on the report analysis:
- ${report.symbols.length} type(s) of harassment identified
- Student emotional distress level: ${emotionLevel}/5
- Safety concern level: ${safetyLevel}/5
- Frequency pattern suggests ${frequency === 'once' ? 'isolated incident' : frequency === 'sometimes' ? 'occasional pattern' : 'recurring pattern'}
- Location context: ${report.location.name}
${hasPhysicalHarassment ? `- Physical harm reported: ${report.bodyMap?.map(bp => bp.bodyPart).join(', ')}` : ''}

Recommendation: ${urgency === 'critical' ? 'Immediate intervention required' : urgency === 'high' ? 'Prompt action needed' : 'Monitor and support'}`;

  return {
    summary,
    urgency,
    immediateActions,
    shortTermActions,
    longTermActions,
    resources,
    notes,
  };
}

/**
 * Save AI recommendations to localStorage
 */
export function saveRecommendations(reportId: string, recommendations: AIRecommendation): void {
  const key = `ai_recommendations_${reportId}`;
  localStorage.setItem(key, JSON.stringify(recommendations));
}

/**
 * Get AI recommendations from localStorage
 */
export function getRecommendations(reportId: string): AIRecommendation | null {
  const key = `ai_recommendations_${reportId}`;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

