import api from './api';

// Kids API client - extends the main API client
export const kidsApi = {
  // Profiles
  getMyProfile: () => api.get('/kids/profiles/me/'),
  updateProfile: (data: Record<string, unknown>) => api.patch('/kids/profiles/me/', data),
  createProfile: (data: Record<string, unknown>) => api.post('/kids/profiles/', data),

  // Parent
  getParentDashboard: () => api.get('/kids/parents/dashboard/'),

  // Curriculum
  getCourses: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/kids/curriculum/courses/${query}`);
  },
  getCourse: (slug: string) => api.get(`/kids/curriculum/courses/${slug}/`),
  getChallenges: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/kids/curriculum/challenges/${query}`);
  },
  getChallenge: (id: number) => api.get(`/kids/curriculum/challenges/${id}/`),

  // Progress
  getDashboard: () => api.get('/kids/progress/dashboard/'),
  getProgress: () => api.get('/kids/progress/'),
  submitProgress: (data: { challenge_id: number; workspace_json?: object; completed?: boolean; time_spent_seconds?: number }) =>
    api.post('/kids/progress/submit/', data as Record<string, unknown>),

  // Classrooms
  getClassrooms: () => api.get('/kids/classrooms/'),
  getClassroom: (id: number) => api.get(`/kids/classrooms/${id}/`),
  createClassroom: (data: Record<string, unknown>) => api.post('/kids/classrooms/', data),
  joinClassroom: (joinCode: string) => api.post('/kids/classrooms/join/', { join_code: joinCode }),
  assignChallenge: (classroomId: number, challengeId: number, dueDate?: string) =>
    api.post(`/kids/classrooms/${classroomId}/assign/`, { challenge_id: challengeId, due_date: dueDate }),
  getStudentProgress: (classroomId: number) => api.get(`/kids/classrooms/${classroomId}/progress/`),
  getTeacherDashboard: () => api.get('/kids/classrooms/teacher-dashboard/'),
};

export default kidsApi;
