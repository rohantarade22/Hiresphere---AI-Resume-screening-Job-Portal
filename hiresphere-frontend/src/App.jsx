import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";

import LandingPage from "./pages/landing/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterCandidatePage from "./pages/auth/RegisterCandidatePage";
import RegisterRecruiterPage from "./pages/auth/RegisterRecruiterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import NotFoundPage from "./pages/NotFoundPage";

import CandidateDashboardPage from "./pages/candidate/CandidateDashboardPage";
import JobSearchPage from "./pages/candidate/JobSearchPage";
import JobDetailPage from "./pages/candidate/JobDetailPage";
import SavedJobsPage from "./pages/candidate/SavedJobsPage";
import ApplicationsPage from "./pages/candidate/ApplicationsPage";
import ProfilePage from "./pages/candidate/ProfilePage";

import RecruiterDashboardPage from "./pages/recruiter/RecruiterDashboardPage";
import MyJobsPage from "./pages/recruiter/MyJobsPage";
import JobFormPage from "./pages/recruiter/JobFormPage";
import ApplicantsPipelinePage from "./pages/recruiter/ApplicantsPipelinePage";
import CompanyProfilePage from "./pages/recruiter/CompanyProfilePage";
import InterviewsPage from "./pages/recruiter/InterviewsPage";
import AnalyticsPage from "./pages/recruiter/AnalyticsPage";

import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import ManageUsersPage from "./pages/admin/ManageUsersPage";
import ApprovalsPage from "./pages/admin/ApprovalsPage";
import ManageJobsPage from "./pages/admin/ManageJobsPage";
import SystemLogsPage from "./pages/admin/SystemLogsPage";
import NotificationsPage from "./pages/NotificationsPage";

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public marketing + auth routes keep the marketing chrome (navbar/footer) */}
      <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
      <Route path="/register/candidate" element={<PublicLayout><RegisterCandidatePage /></PublicLayout>} />
      <Route path="/register/recruiter" element={<PublicLayout><RegisterRecruiterPage /></PublicLayout>} />
      <Route path="/forgot-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />

      {/* Candidate dashboard — protected, uses the app-shell sidebar layout */}
      <Route element={<ProtectedRoute allowedRoles={["candidate"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/candidate/dashboard" element={<CandidateDashboardPage />} />
          <Route path="/candidate/jobs" element={<JobSearchPage />} />
          <Route path="/candidate/jobs/:slug" element={<JobDetailPage />} />
          <Route path="/candidate/saved" element={<SavedJobsPage />} />
          <Route path="/candidate/applications" element={<ApplicationsPage />} />
          <Route path="/candidate/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Recruiter dashboard — protected, same app shell, different nav */}
      <Route element={<ProtectedRoute allowedRoles={["recruiter"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/recruiter/dashboard" element={<RecruiterDashboardPage />} />
          <Route path="/recruiter/jobs" element={<MyJobsPage />} />
          <Route path="/recruiter/jobs/new" element={<JobFormPage />} />
          <Route path="/recruiter/jobs/:slug/edit" element={<JobFormPage />} />
          <Route path="/recruiter/jobs/:slug/applicants" element={<ApplicantsPipelinePage />} />
          <Route path="/recruiter/interviews" element={<InterviewsPage />} />
          <Route path="/recruiter/analytics" element={<AnalyticsPage />} />
          <Route path="/recruiter/company" element={<CompanyProfilePage />} />
        </Route>
      </Route>

      {/* Admin dashboard — protected, same app shell, admin nav */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<ManageUsersPage />} />
          <Route path="/admin/approvals" element={<ApprovalsPage />} />
          <Route path="/admin/jobs" element={<ManageJobsPage />} />
          <Route path="/admin/logs" element={<SystemLogsPage />} />
        </Route>
      </Route>

      {/* Shared notifications page — any authenticated role, same app shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
    </Routes>
  );
}
