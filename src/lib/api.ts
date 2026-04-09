const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth_token');
      // Clear legacy mock tokens
      if (stored && (stored === 'mock_admin_token' || !stored.startsWith('ey'))) {
        localStorage.removeItem('auth_token');
        this.token = null;
      } else {
        this.token = stored;
      }
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };
    if (this.token && this.token !== 'mock_admin_token' && this.token.startsWith('ey')) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

    // If token expired (401)
    if (res.status === 401 && this.token) {
      this.token = null;
      if (typeof window !== 'undefined') localStorage.removeItem('auth_token');
      const method = (options.method || 'GET').toUpperCase();
      if (method === 'GET') {
        // Retry GET without auth for public endpoints
        const retryHeaders = { ...headers };
        delete retryHeaders['Authorization'];
        const retryRes = await fetch(`${API_BASE}${endpoint}`, { ...options, headers: retryHeaders });
        if (!retryRes.ok) {
          const error = await retryRes.json().catch(() => ({ detail: 'Request failed' }));
          throw new Error(error.detail || JSON.stringify(error));
        }
        return retryRes.json();
      } else {
        // For write operations, session expired — redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }
        throw new Error('Session expired. Please log in again.');
      }
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || JSON.stringify(error));
    }
    return res.json();
  }

  // Generic methods
  async get(endpoint: string) {
    return this.request(endpoint);
  }
  async post(endpoint: string, data?: Record<string, unknown>) {
    return this.request(endpoint, { method: 'POST', body: data ? JSON.stringify(data) : undefined });
  }
  async put(endpoint: string, data?: Record<string, unknown>) {
    return this.request(endpoint, { method: 'PUT', body: data ? JSON.stringify(data) : undefined });
  }
  async patch(endpoint: string, data?: Record<string, unknown>) {
    return this.request(endpoint, { method: 'PATCH', body: data ? JSON.stringify(data) : undefined });
  }
  async delete(endpoint: string, data?: Record<string, unknown>) {
    return this.request(endpoint, { method: 'DELETE', body: data ? JSON.stringify(data) : undefined });
  }

  // Auth
  async register(data: { username: string; email: string; password: string }) {
    return this.request('/auth/register/', { method: 'POST', body: JSON.stringify(data) });
  }
  async login(data: { username: string; password: string }) {
    const res = await this.request('/auth/login/', { method: 'POST', body: JSON.stringify(data) });
    if (res.access) this.setToken(res.access);
    if (res.refresh && typeof window !== 'undefined') localStorage.setItem('refresh_token', res.refresh);
    return res;
  }
  async getMe() {
    return this.request('/auth/me/');
  }
  async githubAuth(data: { email: string; name: string; avatar: string }) {
    const res = await this.request('/users/auth/github/', { method: 'POST', body: JSON.stringify(data) });
    if (res.access) this.setToken(res.access);
    if (res.refresh && typeof window !== 'undefined') localStorage.setItem('refresh_token', res.refresh);
    return res;
  }

  // Admin Users
  async getUsers(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/users/${query}`);
  }
  async getUser(id: number) {
    return this.request(`/users/${id}/`);
  }
  async createUser(data: Record<string, unknown>) {
    return this.request('/users/', { method: 'POST', body: JSON.stringify(data) });
  }
  async updateUser(id: number, data: Record<string, unknown>) {
    return this.request(`/users/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
  }
  async deleteUser(id: number) {
    return this.request(`/users/${id}/`, { method: 'DELETE' });
  }
  async getUserStats() {
    return this.request('/users/stats/');
  }

  // Courses (CRUD)
  async getCourses(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/courses/${query}`);
  }
  async getCourse(slug: string) {
    return this.request(`/courses/${slug}/`);
  }
  async createCourse(data: Record<string, unknown>) {
    return this.request('/courses/', { method: 'POST', body: JSON.stringify(data) });
  }
  async updateCourse(slug: string, data: Record<string, unknown>) {
    return this.request(`/courses/${slug}/`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async deleteCourse(slug: string) {
    return this.request(`/courses/${slug}/`, { method: 'DELETE' });
  }
  async enrollCourse(slug: string) {
    return this.request(`/courses/${slug}/enroll/`, { method: 'POST' });
  }
  async getCourseProgress(slug: string) {
    return this.request(`/courses/${slug}/progress/`);
  }

  // Bundles (CRUD)
  async getBundles(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/bundles/${query}`);
  }
  async getBundle(slug: string) {
    return this.request(`/bundles/${slug}/`);
  }
  async createBundle(data: Record<string, unknown>) {
    return this.request('/bundles/', { method: 'POST', body: JSON.stringify(data) });
  }
  async updateBundle(slug: string, data: Record<string, unknown>) {
    return this.request(`/bundles/${slug}/`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async deleteBundle(slug: string) {
    return this.request(`/bundles/${slug}/`, { method: 'DELETE' });
  }

  // Certificates
  async getCertificates() {
    return this.request('/certificates/');
  }
  async verifyCertificate(id: string) {
    return this.request(`/certificates/verify/${id}/`);
  }

  // Coupons (CRUD)
  async getCoupons(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/coupons/coupons/${query}`);
  }
  async createCoupon(data: Record<string, unknown>) {
    return this.request('/coupons/coupons/', { method: 'POST', body: JSON.stringify(data) });
  }
  async updateCoupon(pk: number | string, data: Record<string, unknown>) {
    return this.request(`/coupons/coupons/${pk}/`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async deleteCoupon(pk: number | string) {
    return this.request(`/coupons/coupons/${pk}/`, { method: 'DELETE' });
  }
  async validateCoupon(data: Record<string, unknown>) {
    return this.request('/coupons/coupons/validate/', { method: 'POST', body: JSON.stringify(data) });
  }
  async getSmartCoupons() {
    return this.request('/coupons/smart-coupons/');
  }
  async updateSmartCoupons(data: Record<string, unknown>) {
    return this.request('/coupons/smart-coupons/', { method: 'POST', body: JSON.stringify(data) });
  }

  // Payments
  async getOrders(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/payments/orders/${query}`);
  }
  async getRevenueStats() {
    return this.request('/payments/orders/revenue_stats/');
  }
  async refundOrder(pk: number | string) {
    return this.request(`/payments/orders/${pk}/refund/`, { method: 'POST' });
  }
  async getPricingPlans() {
    return this.request('/payments/pricing-plans/');
  }
  async getMembershipPlans() {
    return this.request('/payments/membership-plans/');
  }
  async createCheckout(courseSlug: string) {
    return this.request('/payments/create-checkout/', {
      method: 'POST', body: JSON.stringify({ course_slug: courseSlug })
    });
  }

  // Roles & Permissions
  async getRoles() {
    return this.request('/roles/roles/');
  }
  async createRole(data: Record<string, unknown>) {
    return this.request('/roles/roles/', { method: 'POST', body: JSON.stringify(data) });
  }
  async getPermissions() {
    return this.request('/roles/permissions/');
  }
  async getUserRoles() {
    return this.request('/roles/user-roles/');
  }
  async assignUserRole(data: Record<string, unknown>) {
    return this.request('/roles/user-roles/', { method: 'POST', body: JSON.stringify(data) });
  }

  // Emails
  async getEmailTemplates() {
    return this.request('/emails/templates/');
  }
  async createEmailTemplate(data: Record<string, unknown>) {
    return this.request('/emails/templates/', { method: 'POST', body: JSON.stringify(data) });
  }
  async updateEmailTemplate(pk: number | string, data: Record<string, unknown>) {
    return this.request(`/emails/templates/${pk}/`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async sendTestEmail(data: Record<string, unknown>) {
    return this.request('/emails/templates/send-test/', { method: 'POST', body: JSON.stringify(data) });
  }
  async getEmailLogs() {
    return this.request('/emails/logs/');
  }
  async getBulkEmails() {
    return this.request('/emails/bulk/');
  }
  async bulkGenerateCoupons(data: { prefix: string; count: number; discount_type?: string; discount_value?: number }) {
    return this.request('/coupons/coupons/bulk-generate/', { method: 'POST', body: JSON.stringify(data) });
  }
  async sendBulkEmail(data: Record<string, unknown>) {
    return this.request('/emails/bulk/', { method: 'POST', body: JSON.stringify(data) });
  }

  // Platform Settings
  async getPlatformSettings() {
    return this.request('/platform/settings/');
  }
  async updatePlatformSettings(data: Record<string, unknown>) {
    return this.request('/platform/settings/', { method: 'PUT', body: JSON.stringify(data) });
  }

  // Content Library
  async getLessons(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/content-library/lessons/${query}`);
  }
  async createContentLesson(data: Record<string, unknown>) {
    return this.request('/content-library/lessons/', { method: 'POST', body: JSON.stringify(data) });
  }
  async getQuizzes(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/content-library/quizzes/${query}`);
  }
  async createQuiz(data: Record<string, unknown>) {
    return this.request('/content-library/quizzes/', { method: 'POST', body: JSON.stringify(data) });
  }
  async getAssignmentsList(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/content-library/assignments/${query}`);
  }
  async createAssignment(data: Record<string, unknown>) {
    return this.request('/content-library/assignments/', { method: 'POST', body: JSON.stringify(data) });
  }

  // Analytics
  async getInstructorAnalytics() {
    return this.request('/analytics/instructor/');
  }
  async getInstructorRevenue() {
    return this.request('/analytics/instructor/revenue/');
  }
  async getCourseAnalytics(courseId: number | string) {
    return this.request(`/analytics/course/${courseId}/`);
  }
  async getAdminChartData() {
    return this.request('/analytics/charts/');
  }

  // Tracks & Exercises
  async getTracks(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/tracks/${query}`);
  }
  async getTrack(slug: string) {
    return this.request(`/tracks/${slug}/`);
  }
  async getExercises(trackSlug: string) {
    return this.request(`/tracks/${trackSlug}/exercises/`);
  }
  async submitCode(trackSlug: string, exerciseSlug: string, code: string) {
    return this.request(`/tracks/${trackSlug}/exercises/${exerciseSlug}/submit/`, {
      method: 'POST', body: JSON.stringify({ code })
    });
  }

  // Code Execution
  async executeCode(code: string, language: string, testCode?: string) {
    return this.request('/execute/', {
      method: 'POST',
      body: JSON.stringify({ code, language, test_code: testCode || '' }),
    });
  }

  // Learning
  async getCourseLearning(slug: string) {
    return this.request(`/courses/${slug}/learn/`);
  }
  async getLesson(id: number) {
    return this.request(`/courses/lessons/${id}/`);
  }
  async completeLesson(id: number) {
    return this.request(`/courses/lessons/${id}/complete/`, { method: 'POST' });
  }
  async getQuiz(id: number) {
    return this.request(`/courses/quizzes/${id}/`);
  }
  async submitQuiz(id: number, answers: Record<string, number>) {
    return this.request(`/courses/quizzes/${id}/submit/`, {
      method: 'POST', body: JSON.stringify({ answers })
    });
  }
  async getQuizResults(id: number) {
    return this.request(`/courses/quizzes/${id}/results/`);
  }
  async getLessonComments(id: number) {
    return this.request(`/courses/lessons/${id}/comments/`);
  }
  async addLessonComment(id: number, content: string, parentId?: number) {
    return this.request(`/courses/lessons/${id}/comments/`, {
      method: 'POST', body: JSON.stringify({ content, parent: parentId })
    });
  }
  async toggleWishlist(courseSlug: string) {
    return this.request('/courses/wishlist/toggle/', {
      method: 'POST', body: JSON.stringify({ course_slug: courseSlug })
    });
  }
  async getWishlist() {
    return this.request('/courses/wishlist/');
  }

  // Assignments
  async getAssignments() { return this.request('/assignments/'); }
  async getAssignment(id: number) { return this.request(`/assignments/${id}/`); }
  async submitAssignment(id: number, data: Record<string, unknown>) {
    return this.request(`/assignments/${id}/submit/`, { method: 'POST', body: JSON.stringify(data) });
  }
  async getAssignmentAttempts(id: number) { return this.request(`/assignments/${id}/attempts/`); }
  async getAssignmentSubmissions(id: number) { return this.request(`/assignments/${id}/submissions/`); }
  async gradeSubmission(assignmentId: number, subId: number, data: Record<string, unknown>) {
    return this.request(`/assignments/${assignmentId}/submissions/${subId}/grade/`, { method: 'POST', body: JSON.stringify(data) });
  }

  // Badges
  async getBadges() { return this.request('/points/badges/'); }
  async getMyBadges() { return this.request('/points/badges/my/'); }
  async getEnrolledCourses() { return this.request("/courses/enrolled/"); }

  // Gradebook
  async getStudentGrades() { return this.request('/gradebook/student/'); }
  async getCourseGradebook(courseId: number) { return this.request(`/gradebook/course/${courseId}/`); }

  // Notifications
  async getNotificationLog() { return this.request('/notifications/log/'); }

  // Public Quiz
  async getPublicQuiz(slug: string) { return this.request(`/courses/quizzes/public/${slug}/`); }
  async submitPublicQuiz(slug: string, answers: Record<string, number>) {
    return this.request(`/courses/quizzes/public/${slug}/`, { method: 'POST', body: JSON.stringify({ answers }) });
  }

  // Forms
  async getForms() { return this.request('/forms/'); }
  async getFormByType(type: string) { return this.request(`/forms/${type}/`); }
  async updateForm(id: number, data: Record<string, unknown>) {
    return this.request(`/forms/${id}/update/`, { method: 'PUT', body: JSON.stringify(data) });
  }

  // Media
  async getMediaFiles(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/media/${query}`);
  }
  async deleteMediaFile(id: number) {
    return this.request(`/media/${id}/`, { method: 'DELETE' });
  }
  async uploadMedia(file: File, folder?: string): Promise<{ id: number; file: string; filename: string; file_type: string; mime_type: string; size_bytes: number }> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || localStorage.getItem('access_token')) : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/media/upload/`, { method: 'POST', headers, body: formData });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return res.json();
  }

  // Categories
  async getCategories() { return this.request('/courses/categories/'); }
  async createCategory(data: Record<string, unknown>) { return this.request('/courses/categories/', { method: 'POST', body: JSON.stringify(data) }); }

  // Admin Curriculum (modules + lessons)
  async getModules(courseSlug: string) {
    const res = await this.request(`/courses/${courseSlug}/modules/`);
    return Array.isArray(res) ? res : (res.results || res);
  }
  async createModule(courseSlug: string, data: Record<string, unknown>) { return this.request(`/courses/${courseSlug}/modules/`, { method: 'POST', body: JSON.stringify(data) }); }
  async updateModule(courseSlug: string, moduleId: number, data: Record<string, unknown>) { return this.request(`/courses/${courseSlug}/modules/${moduleId}/`, { method: 'PATCH', body: JSON.stringify(data) }); }
  async deleteModule(courseSlug: string, moduleId: number) { return this.request(`/courses/${courseSlug}/modules/${moduleId}/`, { method: 'DELETE' }); }
  async createLesson(courseSlug: string, moduleId: number, data: Record<string, unknown>) { return this.request(`/courses/${courseSlug}/modules/${moduleId}/lessons/`, { method: 'POST', body: JSON.stringify(data) }); }
  async updateLesson(courseSlug: string, moduleId: number, lessonId: number, data: Record<string, unknown>) { return this.request(`/courses/${courseSlug}/modules/${moduleId}/lessons/${lessonId}/`, { method: 'PATCH', body: JSON.stringify(data) }); }
  async deleteLesson(courseSlug: string, moduleId: number, lessonId: number) { return this.request(`/courses/${courseSlug}/modules/${moduleId}/lessons/${lessonId}/`, { method: 'DELETE' }); }

  // Prerequisites
  async getCoursePrerequisites(slug: string) { return this.request(`/courses/${slug}/prerequisites/`); }

  // Live Classes
  async getLiveClasses(courseSlug?: string) { return this.request(`/live-classes/${courseSlug ? `?course=${courseSlug}` : ''}`); }
  async getLiveClass(id: number) { return this.request(`/live-classes/${id}/`); }
  async createLiveClass(data: Record<string, unknown>) { return this.request('/live-classes/', { method: 'POST', body: JSON.stringify(data) }); }
  async updateLiveClass(id: number, data: Record<string, unknown>) { return this.request(`/live-classes/${id}/`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteLiveClass(id: number) { return this.request(`/live-classes/${id}/`, { method: 'DELETE' }); }
  async getUpcomingLiveClasses(courseSlug?: string) { return this.request(`/live-classes/upcoming/${courseSlug ? `?course=${courseSlug}` : ''}`); }
  async startLiveClass(id: number) { return this.request(`/live-classes/${id}/start/`, { method: 'POST' }); }
  async endLiveClass(id: number) { return this.request(`/live-classes/${id}/end/`, { method: 'POST' }); }
  async cancelLiveClass(id: number) { return this.request(`/live-classes/${id}/cancel/`, { method: 'POST' }); }
  async joinLiveClass(id: number) { return this.request(`/live-classes/${id}/join/`, { method: 'POST' }); }

  // AI Tutor
  async getAITutorSettings() { return this.request('/ai-tutor/settings/'); }
  async updateAITutorSettings(data: Record<string, unknown>) { return this.request('/ai-tutor/settings/', { method: 'PUT', body: JSON.stringify(data) }); }
  async sendAITutorMessage(data: { course_id: number; lesson_id: number; lesson_type: string; lesson_title: string; lesson_content: string; message: string }) {
    return this.request('/ai-tutor/chat/', { method: 'POST', body: JSON.stringify(data) });
  }
  async getAITutorConversation(lessonId: number) { return this.request(`/ai-tutor/conversations/?lesson_id=${lessonId}`); }
  async getAITutorSuggestedPrompts(lessonType: string) { return this.request(`/ai-tutor/suggested-prompts/?lesson_type=${lessonType}`); }
}

export const api = new ApiClient();
export default api;
