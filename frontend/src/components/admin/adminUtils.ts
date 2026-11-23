/**
 * Admin utility functions for downloads, formatting, and badges
 */

export const downloadExamCsv = async (examId: string, examTitle: string = 'exam'): Promise<void> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/admin/exams/${examId}/export`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (!response.ok) {
    let errorMsg = 'Failed to export candidate results to CSV.';
    try {
      const err = await response.json();
      if (err.error) errorMsg = err.error;
    } catch {
      // response might be text or empty
    }
    throw new Error(errorMsg);
  }

  const csvText = await response.text();
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeTitle = examTitle.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  a.download = `${safeTitle}_results_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const formatDateTime = (dateString?: string | null): string => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '—';
  }
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} mins`;
  }
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `${hours}h ${rem}m` : `${hours}h`;
};
