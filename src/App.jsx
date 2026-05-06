import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { EngagementsProvider } from './contexts/EngagementsContext.jsx';
import { useAuth } from './contexts/AuthContext.jsx';
import { Layout } from './components/Layout.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { NewEngagement } from './pages/NewEngagement.jsx';
import { EngagementDetail } from './pages/EngagementDetail.jsx';
import { FormPage } from './pages/FormPage.jsx';
import { PreviewPage } from './pages/PreviewPage.jsx';
import { Templates } from './pages/Templates.jsx';
import { NotFound } from './pages/NotFound.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { OutputCenter } from './pages/OutputCenter.jsx';
import { DigestPage } from './pages/DigestPage.jsx';
import { UseCaseLibrary } from './pages/UseCaseLibrary.jsx';

function AppShell() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <EngagementsProvider>
      <Layout>
        <Routes>
          <Route path="/"                                      element={<Dashboard />} />
          <Route path="/engagements/new"                       element={<NewEngagement />} />
          <Route path="/engagements/:id"                       element={<EngagementDetail />} />
          <Route path="/engagements/:id/outputs"               element={<OutputCenter />} />
          <Route path="/engagements/:id/forms/:formKey"        element={<FormPage />} />
          <Route path="/engagements/:id/preview/:formKey"      element={<PreviewPage />} />
          <Route path="/templates"                             element={<Templates />} />
          <Route path="/digest"                                element={<DigestPage />} />
          <Route path="/library"                               element={<UseCaseLibrary />} />
          <Route path="*"                                      element={<NotFound />} />
        </Routes>
      </Layout>
    </EngagementsProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*"    element={<AppShell />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
