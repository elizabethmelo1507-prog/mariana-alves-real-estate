
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Public/Home';
import Catalog from './pages/Public/Catalog';
import PropertyDetail from './pages/Public/PropertyDetail';
import Launches from './pages/Public/Launches';
import Simulation from './pages/Public/Simulation';
import Evaluation from './pages/Public/Evaluation';
import Contact from './pages/Public/Contact';
import ScheduleVisit from './pages/Public/ScheduleVisit';
import Login from './pages/Admin/Login';
import Dashboard from './pages/Admin/Dashboard';
import ManageCatalog from './pages/Admin/ManageCatalog';
import AddProperty from './pages/Admin/AddProperty';
import Leads from './pages/Admin/Leads';
import Calendar from './pages/Admin/Calendar';
import Priorities from './pages/Admin/Priorities';
import Proposals from './pages/Admin/Proposals';
import Documents from './pages/Admin/Documents';
import Finance from './pages/Admin/Finance';
import Automation from './pages/Admin/Automation';
import Profile from './pages/Admin/Profile';
import Settings from './pages/Admin/Settings';
import Reactivation from './pages/Admin/Reactivation';
import SignUp from './pages/Auth/SignUp';
import OnboardingWizard from './pages/Admin/Onboarding/Wizard';
import SiteEditor from './pages/Admin/SiteEditor';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Public Client Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog title="Catálogo Completo" />} />
        <Route path="/launches" element={<Launches />} />
        <Route path="/rent" element={<Catalog title="Aluguel em Manaus" showPriceSuffix="/mês" />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/simulation" element={<Simulation />} />
        <Route path="/evaluation" element={<Evaluation />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/schedule-visit" element={<ScheduleVisit />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/manage" element={<ManageCatalog />} />
        <Route path="/admin/add" element={<AddProperty />} />
        <Route path="/admin/edit/:id" element={<AddProperty />} />
        <Route path="/admin/leads" element={<Leads />} />
        <Route path="/admin/calendar" element={<Calendar />} />
        <Route path="/admin/priorities" element={<Priorities />} />
        <Route path="/admin/proposals" element={<Proposals />} />
        <Route path="/admin/documents" element={<Documents />} />
        <Route path="/admin/documents" element={<Documents />} />
        <Route path="/admin/finance" element={<Finance />} />
        <Route path="/admin/automation" element={<Automation />} />
        <Route path="/admin/profile" element={<Profile />} />
        <Route path="/admin/settings" element={<Settings />} />
        <Route path="/admin/reactivation" element={<Reactivation />} />
        <Route path="/admin/site-editor" element={<SiteEditor />} />

        {/* SaaS / Onboarding Routes */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/onboarding" element={<OnboardingWizard />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
