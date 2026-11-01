import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const About = lazy(() => import("./pages/About"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Pets = lazy(() => import("./pages/Pets"));
const PetDetails = lazy(() => import("./pages/PetDetails"));
const Rescue = lazy(() => import("./pages/Rescue"));
const MyApplications = lazy(() => import("./pages/MyApplications"));
const MyRescues = lazy(() => import("./pages/MyRescues"));
const ShelterDashboard = lazy(() => import("./pages/ShelterDashboard"));
const AddPet = lazy(() => import("./pages/AddPet"));
const ManagePets = lazy(() => import("./pages/ManagePets"));
const ManageApplications = lazy(() => import("./pages/ManageApplications"));
const RescuerDashboard = lazy(() => import("./pages/RescuerDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const EditPet = lazy(() => import("./pages/EditPet"));
const AdminRescues = lazy(() => import("./pages/AdminRescues"));
const ApplicationDetails = lazy(() => import("./pages/ApplicationDetails"));

function PageLoader() {
  return (
    <main className="container paw-section text-center" role="status">
      <div className="spinner-border text-success" />
      <p className="paw-muted mt-3">Loading PawBridge...</p>
    </main>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Navbar />
          <div className="app-content">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/pets" element={<Pets />} />
                <Route path="/pets/:id" element={<PetDetails />} />

                <Route path="/rescue" element={<ProtectedRoute><Rescue /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
                <Route path="/my-applications" element={<ProtectedRoute roles={["adopter"]}><MyApplications /></ProtectedRoute>} />
                <Route path="/applications/:id" element={<ProtectedRoute><ApplicationDetails /></ProtectedRoute>} />
                <Route path="/my-rescues" element={<ProtectedRoute><MyRescues /></ProtectedRoute>} />

                <Route path="/shelter" element={<ProtectedRoute roles={["shelter", "admin"]}><ShelterDashboard /></ProtectedRoute>} />
                <Route path="/shelter/add-pet" element={<ProtectedRoute roles={["shelter", "admin"]}><AddPet /></ProtectedRoute>} />
                <Route path="/shelter/pets" element={<ProtectedRoute roles={["shelter", "admin"]}><ManagePets /></ProtectedRoute>} />
                <Route path="/shelter/pets/:id/edit" element={<ProtectedRoute roles={["shelter", "admin"]}><EditPet /></ProtectedRoute>} />
                <Route path="/shelter/applications" element={<ProtectedRoute roles={["shelter", "admin"]}><ManageApplications /></ProtectedRoute>} />

                <Route path="/rescuer" element={<ProtectedRoute roles={["rescuer", "admin"]}><RescuerDashboard /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute roles={["admin"]}><AdminUsers /></ProtectedRoute>} />
                <Route path="/admin/rescues" element={<ProtectedRoute roles={["admin"]}><AdminRescues /></ProtectedRoute>} />
                <Route path="*" element={<main className="container paw-section"><h2>Page not found</h2></main>} />
              </Routes>
            </Suspense>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
