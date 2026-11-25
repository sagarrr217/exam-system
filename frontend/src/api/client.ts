const BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
  } catch (err: any) {
    console.error(`Network error calling ${endpoint}:`, err);
    throw new ApiError(
      `Unable to reach API server at ${BASE_URL}${endpoint}. Please verify the backend is running on http://localhost:5000.`,
      0,
      { originalError: err?.message }
    );
  }

  const contentType = response.headers.get('content-type');
  let data: any = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else if (contentType && (contentType.includes('text/csv') || contentType.includes('text/plain'))) {
    data = await response.text();
    return data as T;
  }

  if (response.status === 401 && !endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/register')) {
    // If token is invalid, expired, or belongs to a removed account, clear it and notify AuthContext
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('examsecure:unauthorized'));
  }

  if (!response.ok) {
    const errorMsg = data?.error || `Request failed with status ${response.status}`;
    throw new ApiError(errorMsg, response.status, data);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string; role?: string }) =>
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
  register: (payload: { email: string; password: string; name: string; studentId?: string; department?: string; role?: string }) =>
    request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getMe: () => request<{ user: any }>('/auth/me'),

  // Admin
  getDashboardStats: () => request<{ stats: any; recentSubmissions: any[] }>('/admin/dashboard-stats'),
  getAdminExams: () => request<{ exams: any[] }>('/admin/exams'),
  getAdminExamById: (id: string) => request<{ exam: any }>(`/admin/exams/${id}`),
  createExam: (payload: any) =>
    request<{ message: string; exam: any }>('/admin/exams', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateExam: (id: string, payload: any) =>
    request<{ message: string; exam: any }>(`/admin/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  deleteExam: (id: string) =>
    request<{ message: string }>(`/admin/exams/${id}`, {
      method: 'DELETE'
    }),
  togglePublish: (id: string) =>
    request<{ message: string; isPublished: boolean }>(`/admin/exams/${id}/publish`, {
      method: 'PATCH'
    }),
  duplicateExam: (id: string) =>
    request<{ message: string; exam: any }>(`/admin/exams/${id}/duplicate`, {
      method: 'POST'
    }),
  getSubmissions: (examId?: string) =>
    request<{ submissions: any[] }>(`/admin/submissions${examId ? `?examId=${examId}` : ''}`),
  getSubmissionDetails: (id: string) =>
    request<{ attempt: any }>(`/admin/submissions/${id}`),
  exportExamResultsUrl: (examId: string) => `/api/admin/exams/${examId}/export`,
  getFocusLossLogs: (examId?: string) =>
    request<{ logs: any[] }>(`/admin/focus-loss-logs${examId ? `?examId=${examId}` : ''}`),
  getStudents: () => request<{ students: any[] }>('/admin/students'),
  uploadImage: (image: string, folder?: string) =>
    request<{ url: string }>('/admin/upload-image', {
      method: 'POST',
      body: JSON.stringify({ image, folder })
    }),
  generateAIQuestions: (topic: string, count = 3, difficulty = 'medium') =>
    request<{ message: string; questions: any[] }>('/admin/generate-questions', {
      method: 'POST',
      body: JSON.stringify({ topic, count, difficulty })
    }),
  chatAIQuestions: (payload: {
    prompt: string;
    history?: { role: 'user' | 'model'; text: string }[];
    file?: { filename: string; mimeType: string; base64Data: string };
    examContext?: { title?: string; subject?: string; existingQuestionCount?: number };
  }) =>
    request<{ message: string; reply: string; questions: any[] }>('/admin/ai/chat', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Student
  getStudentExams: () => request<{ exams: any[] }>('/student/exams'),
  startExam: (examId: string) =>
    request<{ message: string; attemptId: string; isResumed: boolean }>('/student/exams/start', {
      method: 'POST',
      body: JSON.stringify({ examId })
    }),
  getAttemptData: (attemptId: string) =>
    request<any>(`/student/attempts/${attemptId}`),
  saveAnswer: (attemptId: string, payload: { questionId: string; selectedOptionId?: string | null; textAnswer?: string | null; isMarkedForReview?: boolean }) =>
    request<{ success: boolean; answeredCount: number; unansweredCount: number }>(`/student/attempts/${attemptId}/save-answer`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  logFocusLoss: (attemptId: string, payload: { eventType: string; details?: string; durationSeconds?: number }) =>
    request<{ success: boolean; focusLossCount: number; threshold: number; warningLimitExceeded: boolean }>(`/student/attempts/${attemptId}/focus-loss`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  submitExam: (attemptId: string, finalAnswers?: any[]) =>
    request<{ message: string; result: any }>(`/student/attempts/${attemptId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ finalAnswers })
    }),
  getExamResult: (attemptId: string) =>
    request<any>(`/student/attempts/${attemptId}/result`)
};
