import AIAnalysis from "./pages/AiAnalysis";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Insights from "./pages/Insights";
import Landing from "./pages/Landing";
import RealTimeMonitoring from "./pages/RealTimeMonitoring";
import Reports from "./pages/Reports";
import Upload from "./pages/Upload";
import UserManagement from "./pages/UserManagement";
import AlertSettings from "./pages/AlertSettings";
import __Layout from "./Layout.jsx";

export const PAGES = {
  AIAnalysis: AIAnalysis,
  Auth: Auth,
  Dashboard: Dashboard,
  Home: Home,
  Insights: Insights,
  Landing: Landing,
  RealTimeMonitoring: RealTimeMonitoring,
  Reports: Reports,
  Upload: Upload,
  UserManagement: UserManagement,
  AlertSettings: AlertSettings,
};

export const pagesConfig = {
  mainPage: "Landing",
  Pages: PAGES,
  Layout: __Layout,
};
