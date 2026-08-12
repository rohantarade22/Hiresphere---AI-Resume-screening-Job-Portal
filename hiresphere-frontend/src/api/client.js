import axios from "axios";
import { store } from "../store";
import { logout, setTokens } from "../store/authSlice";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue = [];

const processQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = store.getState().auth.refreshToken;
      if (!refreshToken) {
        store.dispatch(logout());
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${baseURL}/auth/refresh/`, { refresh: refreshToken });
        store.dispatch(setTokens({ accessToken: data.access, refreshToken }));
        processQueue(null, data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        store.dispatch(logout());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  loginCandidate: (payload) => apiClient.post("/auth/login/", payload),
  registerCandidate: (payload) => apiClient.post("/auth/register/candidate/", payload),
  registerRecruiter: (payload) => apiClient.post("/auth/register/recruiter/", payload),
  forgotPassword: (payload) => apiClient.post("/auth/forgot-password/", payload),
  resetPassword: (payload) => apiClient.post("/auth/reset-password/", payload),
  verifyEmail: (payload) => apiClient.post("/auth/verify-email/", payload),
  me: () => apiClient.get("/auth/me/"),
};

export const jobsApi = {
  list: (params) => apiClient.get("/jobs/", { params }),
  detail: (slug) => apiClient.get(`/jobs/${slug}/`),
  recommended: () => apiClient.get("/jobs/recommended/"),
  saved: () => apiClient.get("/jobs/saved/"),
  save: (jobId) => apiClient.post("/jobs/saved/", { job: jobId }),
  unsave: (jobId) => apiClient.delete(`/jobs/saved/${jobId}/`),
};

export const companiesApi = {
  list: (params) => apiClient.get("/companies/", { params }),
  detail: (slug) => apiClient.get(`/companies/${slug}/`),
};

export const applicationsApi = {
  apply: (payload) => apiClient.post("/applications/apply/", payload),
  mine: (params) => apiClient.get("/applications/mine/", { params }),
  withdraw: (id) => apiClient.post(`/applications/${id}/withdraw/`),
};

export const resumesApi = {
  list: () => apiClient.get("/resumes/"),
  upload: (formData) =>
    apiClient.post("/resumes/", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  remove: (id) => apiClient.delete(`/resumes/${id}/`),
};

export const candidateApi = {
  profile: () => apiClient.get("/auth/candidate-profile/"),
  updateProfile: (payload) => apiClient.patch("/auth/candidate-profile/", payload),
  skills: (search) => apiClient.get("/auth/skills/", { params: { search } }),
};

export const notificationsApi = {
  list: () => apiClient.get("/notifications/"),
  markRead: (id) => apiClient.post(`/notifications/${id}/read/`),
  markAllRead: () => apiClient.post("/notifications/read-all/"),
};

async function downloadFile(path, filename) {
  const response = await apiClient.get(path, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export const exportApi = {
  jobApplicantsCsv: (jobId, jobTitle = "job") =>
    downloadFile(`/applications/job/${jobId}/export/`, `applicants_${jobTitle}.csv`),
  adminUsersCsv: () => downloadFile("/admin/users/export/", "hiresphere_users.csv"),
  adminJobsCsv: () => downloadFile("/admin/jobs/export/", "hiresphere_jobs.csv"),
};

export const recruiterAnalyticsApi = {
  stats: () => apiClient.get("/jobs/analytics/"),
};

export const skillsApi = {
  list: (search) => apiClient.get("/auth/skills/", { params: { search } }),
};

export const recruiterJobsApi = {
  mine: () => apiClient.get("/jobs/mine/"),
  create: (payload) => apiClient.post("/jobs/", payload),
  update: (slug, payload) => apiClient.patch(`/jobs/${slug}/`, payload),
  remove: (slug) => apiClient.delete(`/jobs/${slug}/`),
  publish: (slug) => apiClient.post(`/jobs/${slug}/publish/`),
  detail: (slug) => apiClient.get(`/jobs/${slug}/`),
};

export const recruiterApplicantsApi = {
  forJob: (jobId, params) => apiClient.get(`/applications/job/${jobId}/`, { params }),
  updateStatus: (applicationId, payload) => apiClient.patch(`/applications/${applicationId}/status/`, payload),
};

export const companyApi = {
  mine: () => apiClient.get("/companies/me/"),
  update: (payload) => apiClient.patch("/companies/me/", payload),
};

export const interviewsApi = {
  schedule: (payload) => apiClient.post("/interviews/", payload),
  asRecruiter: () => apiClient.get("/interviews/mine-as-recruiter/"),
  asCandidate: () => apiClient.get("/interviews/mine-as-candidate/"),
  update: (id, payload) => apiClient.patch(`/interviews/${id}/`, payload),
};

export const adminApi = {
  stats: () => apiClient.get("/admin/stats/"),
  users: (params) => apiClient.get("/admin/users/", { params }),
  updateUser: (id, payload) => apiClient.patch(`/admin/users/${id}/`, payload),
  pendingRecruiters: () => apiClient.get("/admin/recruiters/pending/"),
  approveRecruiter: (id) => apiClient.post(`/admin/recruiters/${id}/approve/`),
  rejectRecruiter: (id) => apiClient.post(`/admin/recruiters/${id}/reject/`),
  jobs: (params) => apiClient.get("/admin/jobs/", { params }),
  unpublishJob: (id) => apiClient.post(`/admin/jobs/${id}/unpublish/`),
  logs: (params) => apiClient.get("/admin/logs/", { params }),
};
