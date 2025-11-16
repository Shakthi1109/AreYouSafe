/**
 * Teacher Dashboard - View and manage reports
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getReports, updateReport, type Report } from '@/lib/api';
import { getCurrentUser, logout } from '@/lib/auth';
import { generateRecommendations, getRecommendations, saveRecommendations, type AIRecommendation } from '@/lib/ai';
import { exportReportToPDF } from '@/lib/pdfExport';
import { getAllStudents, type StudentInfo } from '@/lib/students';
import { analyzeStudentReports, type ReportAnalysis } from '@/lib/analysis';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Download, Users, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import './TeacherDashboard.css';

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  reviewed: { label: 'Reviewed', color: 'bg-blue-100 text-blue-800' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800' },
};

const emotionColors: Record<string, string> = {
  green: '#22c55e',
  yellow: '#eab308',
  orange: '#f97316',
  red: '#ef4444',
  'dark-red': '#dc2626',
};

export function TeacherDashboard() {
  const { t } = useTranslation();
  const currentUser = getCurrentUser();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [teacherNotes, setTeacherNotes] = useState('');
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [view, setView] = useState<'reports' | 'students'>('reports');
  const [selectedStudent, setSelectedStudent] = useState<StudentInfo | null>(null);
  const [studentAnalysis, setStudentAnalysis] = useState<ReportAnalysis | null>(null);

  useEffect(() => {
    loadReports();
    // Refresh every 30 seconds
    const interval = setInterval(loadReports, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const data = await getReports();
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    try {
      await updateReport(reportId, newStatus);
      await loadReports();
      if (selectedReport?.id === reportId) {
        const updated = reports.find((r) => r.id === reportId);
        if (updated) setSelectedReport(updated);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert(t('teacherDashboard.errors.updateStatus'));
    }
  };

  const handleSaveNotes = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!selectedReport) return;
    try {
      await updateReport(selectedReport.id, undefined, teacherNotes);
      await loadReports();
      const updated = reports.find((r) => r.id === selectedReport.id);
      if (updated) {
        setSelectedReport(updated);
        setTeacherNotes(updated.teacherNotes || '');
      }
      setNotesSaved(true);
      // Reset saved state after 3 seconds
      setTimeout(() => {
        setNotesSaved(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving notes:', error);
      // Could show error state here if needed
    }
  };

  const handleGenerateAIRecommendations = async () => {
    if (!selectedReport) return;

    setIsGeneratingAI(true);
    try {
      const recommendations = await generateRecommendations(selectedReport);
      setAiRecommendations(recommendations);
      setShowAIRecommendations(true);
      // Save to localStorage
      saveRecommendations(selectedReport.id, recommendations);
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      alert(t('teacherDashboard.errors.generateRecommendations'));
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const filteredReports = filter === 'all'
    ? reports
    : reports.filter((r) => r.status === filter);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="teacher-dashboard">
        <div className="loading">{t('teacherDashboard.loading')}</div>
      </div>
    );
  }

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-header-top">
          <div>
            <h1 className="dashboard-title">{t('teacherDashboard.title')}</h1>
            {currentUser && (
              <p className="teacher-name">{t('teacherDashboard.teacher')}: {currentUser.name}</p>
            )}
          </div>
          <div className="header-actions">
            <Link to="/">
              <Button variant="outline" className="home-button">
                {t('teacherDashboard.home')}
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
              className="logout-button"
            >
              {t('teacherDashboard.logout')}
            </Button>
          </div>
        </div>
        <div className="dashboard-subtitle-row">
          <p className="dashboard-subtitle">
            {reports.length} {t('teacherDashboard.totalReports', { count: reports.length })} • {reports.filter((r) => r.status === 'pending').length} {t('teacherDashboard.pending')}
          </p>
          <div className="view-toggle">
            <Button
              variant={view === 'reports' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setView('reports');
                setSelectedStudent(null);
                setStudentAnalysis(null);
              }}
            >
              {t('teacherDashboard.reports')}
            </Button>
            <Button
              variant={view === 'students' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setView('students');
                setSelectedReport(null);
              }}
            >
              <Users className="users-icon" />
              {t('teacherDashboard.students')}
            </Button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {view === 'reports' ? (
          <>
        <div className="reports-list">
          <div className="filters">
            <button
              onClick={() => setFilter('all')}
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            >
              {t('teacherDashboard.all', { count: reports.length })}
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            >
              {t('teacherDashboard.pending', { count: reports.filter((r) => r.status === 'pending').length })}
            </button>
            <button
              onClick={() => setFilter('reviewed')}
              className={`filter-btn ${filter === 'reviewed' ? 'active' : ''}`}
            >
              {t('teacherDashboard.reviewed', { count: reports.filter((r) => r.status === 'reviewed').length })}
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
            >
              {t('teacherDashboard.resolved', { count: reports.filter((r) => r.status === 'resolved').length })}
            </button>
          </div>

          <div className="reports-grid">
            {filteredReports.length === 0 ? (
              <div className="empty-state">
                <p>{t('teacherDashboard.noReports')}</p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  className={`report-card ${selectedReport?.id === report.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedReport(report);
                    setTeacherNotes(report.teacherNotes || '');
                    setNotesSaved(false);
                    // Load existing AI recommendations if available
                    const existing = getRecommendations(report.id);
                    if (existing) {
                      setAiRecommendations(existing);
                      setShowAIRecommendations(true);
                    } else {
                      setAiRecommendations(null);
                      setShowAIRecommendations(false);
                    }
                  }}
                >
                  <div className="report-card-header">
                    <div className="student-info">
                      <span className="student-name">{report.studentName}</span>
                      <span className="report-date">{formatDate(report.timestamp)}</span>
                    </div>
                    <span className={`status-badge ${statusLabels[report.status].color}`}>
                      {statusLabels[report.status].label}
                    </span>
                  </div>

                  <div className="report-preview">
                    <div className="preview-item">
                      <span className="preview-label">{t('teacherDashboard.symbols')}:</span>
                      <div className="symbols-preview">
                        {report.symbols.slice(0, 3).map((s) => (
                          <span key={s.id} className="symbol-tag">
                            {s.label}
                          </span>
                        ))}
                        {report.symbols.length > 3 && (
                          <span className="symbol-tag">+{report.symbols.length - 3}</span>
                        )}
                      </div>
                    </div>
                    <div className="preview-item">
                      <span className="preview-label">{t('teacherDashboard.location')}:</span>
                      <span>{report.location.icon} {report.location.name}</span>
                    </div>
                    <div className="preview-item">
                      <span className="preview-label">{t('teacherDashboard.emotion')}:</span>
                      <div
                        className="emotion-indicator"
                        style={{ backgroundColor: emotionColors[report.emotion.color] }}
                      >
                        {t('teacherDashboard.level')} {report.emotion.level}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {selectedReport && (
          <div className="report-detail">
            <div className="detail-header">
              <h2>{t('teacherDashboard.reportDetails')}</h2>
              <div className="detail-header-actions">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedReport) {
                      exportReportToPDF(selectedReport, aiRecommendations);
                    }
                  }}
                  className="export-pdf-btn"
                >
                  <Download className="download-icon" />
                  {t('teacherDashboard.exportPDF')}
                </Button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="close-btn"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="detail-content">
              <div className="detail-section">
                <h3>{t('teacherDashboard.student')}</h3>
                <p>{selectedReport.studentName} (ID: {selectedReport.studentId})</p>
                <p className="text-sm text-muted-foreground">
                  {t('teacherDashboard.reportedOn', { date: formatDate(selectedReport.timestamp) })}
                </p>
              </div>

              <div className="detail-section">
                <h3>{t('teacherDashboard.incidentType')}</h3>
                <div className="symbols-list">
                  {selectedReport.symbols.map((symbol) => (
                    <div key={symbol.id} className="symbol-item">
                      <span className="symbol-category">{symbol.category}</span>
                      <span className="symbol-name">{symbol.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedReport.bodyMap && selectedReport.bodyMap.length > 0 && (
                <div className="detail-section">
                  <h3>{t('teacherDashboard.physicalHarassment')}</h3>
                  <div className="body-parts-list">
                    {selectedReport.bodyMap.map((point, index) => (
                      <span key={index} className="body-part-tag">
                        {point.bodyPart}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="detail-section">
                <h3>{t('teacherDashboard.location')}</h3>
                <p>
                  {selectedReport.location.icon} {selectedReport.location.name}
                </p>
              </div>

              <div className="detail-section">
                <h3>{t('teacherDashboard.frequency')}</h3>
                <p>
                  {selectedReport.frequency.value === 'once' && t('teacherDashboard.once')}
                  {selectedReport.frequency.value === 'sometimes' && t('teacherDashboard.sometimes')}
                  {selectedReport.frequency.value === 'often' && t('teacherDashboard.often')}
                  {selectedReport.frequency.value === 'always' && t('teacherDashboard.always')}
                </p>
              </div>

              <div className="detail-section">
                <h3>{t('teacherDashboard.emotionalState')}</h3>
                <div className="emotion-display">
                  <div className="emotion-bar">
                    <div
                      style={{
                        width: `${(selectedReport.emotion.level / 5) * 100}%`,
                        backgroundColor: emotionColors[selectedReport.emotion.color],
                        height: '100%',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                  <span>{t('teacherDashboard.level')} {selectedReport.emotion.level}/5</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>{t('teacherDashboard.safetyLevel')}</h3>
                <div className="safety-display">
                  <div className="safety-bar">
                    <div
                      style={{
                        width: `${(selectedReport.safety.level / 5) * 100}%`,
                        backgroundColor:
                          selectedReport.safety.level <= 2
                            ? '#22c55e'
                            : selectedReport.safety.level <= 3
                            ? '#eab308'
                            : '#ef4444',
                        height: '100%',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                  <span>{t('teacherDashboard.level')} {selectedReport.safety.level}/5</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>{t('teacherDashboard.status')}</h3>
                <div className="status-actions">
                  <Button
                    variant={selectedReport.status === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(selectedReport.id, 'pending')}
                  >
                    {t('teacherDashboard.pending')}
                  </Button>
                  <Button
                    variant={selectedReport.status === 'reviewed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(selectedReport.id, 'reviewed')}
                  >
                    {t('teacherDashboard.reviewed')}
                  </Button>
                  <Button
                    variant={selectedReport.status === 'resolved' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(selectedReport.id, 'resolved')}
                  >
                    {t('teacherDashboard.resolved')}
                  </Button>
                </div>
              </div>

              <div className="detail-section">
                <h3>{t('teacherDashboard.aiRecommendations')}</h3>
                {!showAIRecommendations ? (
                  <div className="ai-generate-section">
                    <p className="ai-description">
                      {t('teacherDashboard.generateRecommendations')}
                    </p>
                    <Button
                      onClick={handleGenerateAIRecommendations}
                      disabled={isGeneratingAI}
                      className="generate-ai-btn"
                      size="sm"
                    >
                      {isGeneratingAI ? (
                        <>
                          <Loader2 className="spinner-icon" />
                          {t('teacherDashboard.generating')}
                        </>
                      ) : (
                        <>
                          <Sparkles className="sparkles-icon" />
                          {t('teacherDashboard.generate')}
                        </>
                      )}
                    </Button>
                  </div>
                ) : aiRecommendations ? (
                  <div className="ai-recommendations">
                    <div className="ai-header">
                      <div className="ai-urgency">
                        <span className={`urgency-badge urgency-${aiRecommendations.urgency}`}>
                          {aiRecommendations.urgency.toUpperCase()} {t('teacherDashboard.urgency')}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowAIRecommendations(false);
                          setAiRecommendations(null);
                        }}
                        className="hide-ai-btn"
                      >
                        {t('teacherDashboard.hide')}
                      </Button>
                    </div>

                    <div className="ai-summary">
                      <h4>{t('teacherDashboard.summary')}</h4>
                      <p>{aiRecommendations.summary}</p>
                    </div>

                    <div className="ai-actions">
                      <div className="action-group">
                        <h4>{t('teacherDashboard.immediateActions')}</h4>
                        <ul>
                          {aiRecommendations.immediateActions.map((action, index) => (
                            <li key={index}>{action}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="action-group">
                        <h4>{t('teacherDashboard.shortTermActions')}</h4>
                        <ul>
                          {aiRecommendations.shortTermActions.map((action, index) => (
                            <li key={index}>{action}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="action-group">
                        <h4>{t('teacherDashboard.longTermActions')}</h4>
                        <ul>
                          {aiRecommendations.longTermActions.map((action, index) => (
                            <li key={index}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="ai-resources">
                      <h4>{t('teacherDashboard.resources')}</h4>
                      <ul>
                        {aiRecommendations.resources.map((resource, index) => (
                          <li key={index}>{resource}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="ai-notes">
                      <h4>{t('teacherDashboard.analysisNotes')}</h4>
                      <p>{aiRecommendations.notes}</p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateAIRecommendations}
                      disabled={isGeneratingAI}
                      className="regenerate-ai-btn"
                    >
                      {isGeneratingAI ? (
                        <>
                          <Loader2 className="spinner-icon" />
                          {t('teacherDashboard.regenerating')}
                        </>
                      ) : (
                        <>
                          <Sparkles className="sparkles-icon" />
                          {t('teacherDashboard.regenerate')}
                        </>
                      )}
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="detail-section">
                <h3>{t('teacherDashboard.teacherNotes')}</h3>
                <textarea
                  value={teacherNotes}
                  onChange={(e) => {
                    setTeacherNotes(e.target.value);
                    setNotesSaved(false);
                  }}
                  placeholder={t('teacherDashboard.addNotes')}
                  className="notes-textarea"
                  rows={4}
                />
                <Button
                  type="button"
                  onClick={handleSaveNotes}
                  className={`mt-2 save-notes-btn ${notesSaved ? 'saved' : ''}`}
                  size="sm"
                  disabled={notesSaved}
                >
                  {notesSaved ? t('teacherDashboard.saved') : t('teacherDashboard.saveNotes')}
                </Button>
              </div>
            </div>
          </div>
        )}
          </>
        ) : (
          <StudentsView
            reports={reports}
            selectedStudent={selectedStudent}
            studentAnalysis={studentAnalysis}
            onSelectStudent={(student) => {
              setSelectedStudent(student);
              const studentReports = reports.filter((r) => r.studentId === student.studentId);
              const analysis = analyzeStudentReports(studentReports);
              setStudentAnalysis(analysis);
            }}
            onBack={() => {
              setSelectedStudent(null);
              setStudentAnalysis(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Students View Component
 */
interface StudentsViewProps {
  reports: Report[];
  selectedStudent: StudentInfo | null;
  studentAnalysis: ReportAnalysis | null;
  onSelectStudent: (student: StudentInfo) => void;
  onBack: () => void;
}

function StudentsView({ reports, selectedStudent, studentAnalysis, onSelectStudent, onBack }: StudentsViewProps) {
  const students = getAllStudents();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedStudent) {
    const studentReports = reports.filter((r) => r.studentId === selectedStudent.studentId);
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    return (
      <div className="students-view">
        <div className="student-detail-container">
          <div className="student-detail-header">
            <Button variant="outline" size="sm" onClick={onBack} className="back-btn">
              {t('teacherDashboard.backToStudents')}
            </Button>
            <div className="student-header-info">
              <h2 className="student-detail-title">{selectedStudent.name}</h2>
              <p className="student-id">ID: {selectedStudent.studentId}</p>
            </div>
          </div>

          {studentAnalysis && (
            <div className="analysis-section">
              <h3 className="analysis-title">{t('teacherDashboard.longTermAnalysis')}</h3>

              <div className={`trend-alert ${studentAnalysis.trendAnalysis.hasRecurringProblems ? 'critical' : studentAnalysis.trendAnalysis.isWorsening ? 'warning' : 'info'}`}>
                <div className="trend-icon">
                  {studentAnalysis.trendAnalysis.hasRecurringProblems ? (
                    <AlertTriangle />
                  ) : studentAnalysis.trendAnalysis.isWorsening ? (
                    <TrendingDown />
                  ) : (
                    <TrendingUp />
                  )}
                </div>
                <div className="trend-content">
                  <p className="trend-recommendation">{studentAnalysis.trendAnalysis.recommendation}</p>
                </div>
              </div>

              <div className="analysis-grid">
                <div className="analysis-card">
                  <h4>{t('teacherDashboard.overview')}</h4>
                  <div className="analysis-stats">
                    <div className="stat-item">
                      <span className="stat-label">{t('teacherDashboard.totalReports')}:</span>
                      <span className="stat-value">{studentAnalysis.totalReports}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">{t('teacherDashboard.firstReport')}:</span>
                      <span className="stat-value">{formatDate(studentAnalysis.firstReportDate)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">{t('teacherDashboard.lastReport')}:</span>
                      <span className="stat-value">{formatDate(studentAnalysis.lastReportDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="analysis-card">
                  <h4>{t('teacherDashboard.averageLevels')}</h4>
                  <div className="analysis-stats">
                    <div className="stat-item">
                      <span className="stat-label">{t('teacherDashboard.emotion')}:</span>
                      <span className="stat-value">{studentAnalysis.averageEmotionLevel}/5</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">{t('teacherDashboard.safety')}:</span>
                      <span className="stat-value">{studentAnalysis.averageSafetyLevel}/5</span>
                    </div>
                  </div>
                </div>

                <div className="analysis-card">
                  <h4>{t('teacherDashboard.mostCommonCategories')}</h4>
                  <div className="category-list">
                    {studentAnalysis.mostCommonCategories.slice(0, 3).map((cat, index) => (
                      <div key={index} className="category-item">
                        <span className="category-name">{cat.category}</span>
                        <span className="category-count">{cat.count}x</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="analysis-card">
                  <h4>{t('teacherDashboard.frequencyPattern')}</h4>
                  <div className="frequency-stats">
                    <div className="frequency-item">
                      <span>{t('teacherDashboard.once')}: {studentAnalysis.frequencyPattern.once}</span>
                    </div>
                    <div className="frequency-item">
                      <span>{t('teacherDashboard.sometimes')}: {studentAnalysis.frequencyPattern.sometimes}</span>
                    </div>
                    <div className="frequency-item">
                      <span>{t('teacherDashboard.often')}: {studentAnalysis.frequencyPattern.often}</span>
                    </div>
                    <div className="frequency-item">
                      <span>{t('teacherDashboard.always')}: {studentAnalysis.frequencyPattern.always}</span>
                    </div>
                  </div>
                </div>
              </div>

              {studentAnalysis.recurringIssues.length > 0 && (
                <div className="recurring-issues">
                  <h4>{t('teacherDashboard.recurringIssues')}</h4>
                  <ul>
                    {studentAnalysis.recurringIssues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="student-reports-section">
            <h3 className="reports-section-title">{t('teacherDashboard.allReports', { count: studentReports.length })}</h3>
            <div className="student-reports-list">
              {studentReports.length === 0 ? (
                <div className="empty-state">
                  <p>{t('teacherDashboard.noReportsFound')}</p>
                </div>
              ) : (
                studentReports
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((report) => (
                    <div key={report.id} className="student-report-card">
                      <div className="student-report-header">
                        <span className="report-date">{formatDate(report.timestamp)}</span>
                        <span className={`status-badge ${statusLabels[report.status].color}`}>
                          {statusLabels[report.status].label}
                        </span>
                      </div>
                      <div className="student-report-content">
                        <div className="report-info-row">
                          <span className="info-label">{t('teacherDashboard.categories')}:</span>
                          <div className="report-categories">
                            {report.symbols.map((s) => (
                              <span key={s.id} className="category-badge-small">
                                {s.category}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="report-info-row">
                          <span className="info-label">{t('teacherDashboard.location')}:</span>
                          <span>{report.location.icon} {report.location.name}</span>
                        </div>
                        <div className="report-info-row">
                          <span className="info-label">{t('teacherDashboard.emotion')}:</span>
                          <span>{t('teacherDashboard.level')} {report.emotion.level}/5</span>
                        </div>
                        <div className="report-info-row">
                          <span className="info-label">{t('teacherDashboard.safety')}:</span>
                          <span>{t('teacherDashboard.level')} {report.safety.level}/5</span>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="students-list-view">
      <div className="students-header">
        <h2 className="students-title">{t('teacherDashboard.allStudents')}</h2>
        <div className="students-search">
          <input
            type="text"
            placeholder={t('teacherDashboard.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="students-grid">
        {filteredStudents.length === 0 ? (
          <div className="empty-state">
            <p>{t('teacherDashboard.noStudents')}</p>
          </div>
        ) : (
          filteredStudents.map((student) => {
            const studentReports = reports.filter((r) => r.studentId === student.studentId);
            const pendingCount = studentReports.filter((r) => r.status === 'pending').length;
            const resolvedCount = studentReports.filter((r) => r.status === 'resolved').length;

            return (
              <div
                key={student.studentId}
                className="student-card"
                onClick={() => onSelectStudent(student)}
              >
                <div className="student-card-header">
                  <div className="student-info">
                    <span className="student-card-name">{student.name}</span>
                    <span className="student-card-id">ID: {student.studentId}</span>
                  </div>
                </div>
                <div className="student-card-preview">
                  <div className="preview-item">
                    <span className="preview-label">{t('teacherDashboard.reportsLabel')}:</span>
                    <span className="preview-value">{studentReports.length}</span>
                  </div>
                  {pendingCount > 0 && (
                    <div className="preview-item">
                      <span className="preview-label">{t('teacherDashboard.pendingLabel')}:</span>
                      <span className={`status-badge ${statusLabels.pending.color}`}>
                        {pendingCount}
                      </span>
                    </div>
                  )}
                  {resolvedCount > 0 && (
                    <div className="preview-item">
                      <span className="preview-label">{t('teacherDashboard.resolvedLabel')}:</span>
                      <span className={`status-badge ${statusLabels.resolved.color}`}>
                        {resolvedCount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
