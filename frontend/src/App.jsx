import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/global.css';
import Landing from './pages/Landing';
import Login from './pages/Login';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DisruptionFlow from './pages/DisruptionFlow';
import PolicyExclusions from './pages/PolicyExclusions';
import Forecast7Day from './pages/Forecast7Day';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<WorkerDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/disruption" element={<DisruptionFlow />} />
        <Route path="/policy" element={<PolicyExclusions />} />
        <Route path="/forecast" element={<Forecast7Day />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
