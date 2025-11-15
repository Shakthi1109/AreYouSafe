/**
 * PDF Export Service - Export reports and AI recommendations to PDF
 */
import jsPDF from 'jspdf';
import type { Report } from './api';
import type { AIRecommendation } from './ai';

const emotionColors: Record<string, string> = {
  green: '#22c55e',
  yellow: '#eab308',
  orange: '#f97316',
  red: '#ef4444',
  'dark-red': '#dc2626',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  reviewed: 'Reviewed',
  resolved: 'Resolved',
};

const frequencyLabels: Record<string, string> = {
  once: 'Once',
  sometimes: 'Sometimes',
  often: 'Often',
  always: 'Always',
};

/**
 * Format date for PDF
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Add text with word wrap
 */
function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number = 5
): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + (lines.length * lineHeight);
}

/**
 * Export report to PDF
 */
export function exportReportToPDF(report: Report, aiRecommendations?: AIRecommendation | null): void {
  const doc = new jsPDF();
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Are You Safe - Bullying Report', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition);
  yPosition += 15;

  // Student Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Student Information', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, `Name: ${report.studentName}`, margin, yPosition, contentWidth);
  yPosition = addWrappedText(doc, `Student ID: ${report.studentId}`, margin, yPosition, contentWidth);
  yPosition = addWrappedText(doc, `Report Date: ${formatDate(report.timestamp)}`, margin, yPosition, contentWidth);
  yPosition = addWrappedText(doc, `Status: ${statusLabels[report.status] || report.status}`, margin, yPosition, contentWidth);
  yPosition += 10;

  // Check if we need a new page
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }

  // Incident Details
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Incident Details', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  // Incident Types
  doc.setFont('helvetica', 'bold');
  doc.text('Types of Harassment:', margin, yPosition);
  yPosition += 6;
  doc.setFont('helvetica', 'normal');
  report.symbols.forEach((symbol) => {
    yPosition = addWrappedText(doc, `• ${symbol.category}: ${symbol.label}`, margin + 5, yPosition, contentWidth - 5);
  });
  yPosition += 5;

  // Physical Harassment
  if (report.bodyMap && report.bodyMap.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Physical Harassment - Affected Body Parts:', margin, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    const bodyParts = report.bodyMap.map(bp => bp.bodyPart).join(', ');
    yPosition = addWrappedText(doc, bodyParts, margin + 5, yPosition, contentWidth - 5);
    yPosition += 5;
  }

  // Location
  doc.setFont('helvetica', 'bold');
  doc.text('Location:', margin, yPosition);
  yPosition += 6;
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, `${report.location.icon} ${report.location.name}`, margin + 5, yPosition, contentWidth - 5);
  yPosition += 5;

  // Frequency
  doc.setFont('helvetica', 'bold');
  doc.text('Frequency:', margin, yPosition);
  yPosition += 6;
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, frequencyLabels[report.frequency.value] || report.frequency.value, margin + 5, yPosition, contentWidth - 5);
  yPosition += 5;

  // Emotional State
  doc.setFont('helvetica', 'bold');
  doc.text('Emotional State:', margin, yPosition);
  yPosition += 6;
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, `Level ${report.emotion.level}/5 (${report.emotion.color})`, margin + 5, yPosition, contentWidth - 5);
  yPosition += 5;

  // Safety Level
  doc.setFont('helvetica', 'bold');
  doc.text('Safety Level:', margin, yPosition);
  yPosition += 6;
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, `Level ${report.safety.level}/5`, margin + 5, yPosition, contentWidth - 5);
  yPosition += 10;

  // Teacher Notes
  if (report.teacherNotes) {
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Teacher Notes', margin, yPosition);
    yPosition += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    yPosition = addWrappedText(doc, report.teacherNotes, margin, yPosition, contentWidth);
    yPosition += 10;
  }

  // AI Recommendations
  if (aiRecommendations) {
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('AI-Generated Recommendations', margin, yPosition);
    yPosition += 8;

    // Urgency Badge
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const urgencyColor = 
      aiRecommendations.urgency === 'critical' ? [153, 27, 27] :
      aiRecommendations.urgency === 'high' ? [146, 64, 14] :
      aiRecommendations.urgency === 'medium' ? [30, 64, 175] :
      [6, 95, 70];
    doc.setTextColor(urgencyColor[0], urgencyColor[1], urgencyColor[2]);
    doc.text(`URGENCY: ${aiRecommendations.urgency.toUpperCase()}`, margin, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 10;

    // Summary
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', margin, yPosition);
    yPosition += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPosition = addWrappedText(doc, aiRecommendations.summary, margin, yPosition, contentWidth);
    yPosition += 10;

    // Immediate Actions
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Immediate Actions', margin, yPosition);
    yPosition += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    aiRecommendations.immediateActions.forEach((action) => {
      yPosition = addWrappedText(doc, `• ${action}`, margin + 5, yPosition, contentWidth - 5);
    });
    yPosition += 8;

    // Short-term Actions
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Short-term Actions', margin, yPosition);
    yPosition += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    aiRecommendations.shortTermActions.forEach((action) => {
      yPosition = addWrappedText(doc, `• ${action}`, margin + 5, yPosition, contentWidth - 5);
    });
    yPosition += 8;

    // Long-term Actions
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Long-term Actions', margin, yPosition);
    yPosition += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    aiRecommendations.longTermActions.forEach((action) => {
      yPosition = addWrappedText(doc, `• ${action}`, margin + 5, yPosition, contentWidth - 5);
    });
    yPosition += 8;

    // Resources
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resources', margin, yPosition);
    yPosition += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    aiRecommendations.resources.forEach((resource) => {
      yPosition = addWrappedText(doc, `• ${resource}`, margin + 5, yPosition, contentWidth - 5);
    });
    yPosition += 8;

    // Analysis Notes
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Analysis Notes', margin, yPosition);
    yPosition += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPosition = addWrappedText(doc, aiRecommendations.notes, margin, yPosition, contentWidth);
  }

  // Footer on last page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Generate filename
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `Bullying_Report_${report.studentName}_${dateStr}.pdf`;

  // Save PDF
  doc.save(filename);
}

