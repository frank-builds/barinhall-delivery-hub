import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { AuthzProvider } from './contexts/AuthzContext.jsx';
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
import { AdminLayout } from './pages/admin/AdminLayout.jsx';
import { AdminAccessOverview } from './pages/admin/AdminAccessOverview.jsx';
import { AdminUsers } from './pages/admin/AdminUsers.jsx';
import { AdminRoles } from './pages/admin/AdminRoles.jsx';
import { CRMProvider } from './contexts/CRMContext.jsx';
import { CRMLayout } from './pages/crm/CRMLayout.jsx';
import { CRMOverview } from './pages/crm/CRMOverview.jsx';
import { AccountsList } from './pages/crm/AccountsList.jsx';
import { AccountDetail } from './pages/crm/AccountDetail.jsx';
import { ContactsList } from './pages/crm/ContactsList.jsx';
import { ContactDetail } from './pages/crm/ContactDetail.jsx';
import { OpportunitiesList } from './pages/crm/OpportunitiesList.jsx';
import { OpportunityDetail } from './pages/crm/OpportunityDetail.jsx';
import { Pipeline } from './pages/crm/Pipeline.jsx';

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
    <AuthzProvider>
      <EngagementsProvider>
        <CRMProvider>
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

              {/* ── CRM-lite routes (guarded inside CRMLayout) ── */}
              <Route path="/crm" element={<CRMLayout />}>
                <Route index                       element={<CRMOverview />} />
                <Route path="pipeline"             element={<Pipeline />} />
                <Route path="accounts"             element={<AccountsList />} />
                <Route path="accounts/:id"         element={<AccountDetail />} />
                <Route path="contacts"             element={<ContactsList />} />
                <Route path="contacts/:id"         element={<ContactDetail />} />
                <Route path="opportunities"        element={<OpportunitiesList />} />
                <Route path="opportunities/:id"    element={<OpportunityDetail />} />
              </Route>

              {/* ── Admin routes (guarded inside AdminLayout) ── */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index                element={<AdminAccessOverview />} />
                <Route path="users"         element={<AdminUsers />} />
                <Route path="roles"         element={<AdminRoles />} />
              </Route>

              <Route path="*"                                      element={<NotFound />} />
            </Routes>
          </Layout>
        </CRMProvider>
      </EngagementsProvider>
    </AuthzProvider>
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
