
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Pets from "./pages/Pets";
import PetDetails from "./pages/PetDetails";
import Rescue from "./pages/Rescue";
import MyApplications from "./pages/MyApplications";
import MyRescues from "./pages/MyRescues";
import ShelterDashboard from "./pages/ShelterDashboard";
import AddPet from "./pages/AddPet";
import ManagePets from "./pages/ManagePets";
import ManageApplications from "./pages/ManageApplications";
import RescuerDashboard from "./pages/RescuerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import ChangePassword from "./pages/ChangePassword";
import EditPet from "./pages/EditPet";
import AdminRescues from "./pages/AdminRescues";
import ApplicationDetails from "./pages/ApplicationDetails";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/pets" element={<Pets />} />
          <Route path="/pets/:id" element={<PetDetails />} />

          <Route
            path="/rescue"
            element={
              <ProtectedRoute>
                <Rescue />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-applications"
            element={
              <ProtectedRoute roles={["adopter"]}>
                <MyApplications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/applications/:id"
            element={
              <ProtectedRoute>
                <ApplicationDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-rescues"
            element={
              <ProtectedRoute>
                <MyRescues />
              </ProtectedRoute>
            }
          />

          <Route
            path="/shelter"
            element={
              <ProtectedRoute roles={["shelter", "admin"]}>
                <ShelterDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/shelter/add-pet"
            element={
              <ProtectedRoute roles={["shelter", "admin"]}>
                <AddPet />
              </ProtectedRoute>
            }
          />

          <Route
            path="/shelter/pets"
            element={
              <ProtectedRoute roles={["shelter", "admin"]}>
                <ManagePets />
              </ProtectedRoute>
            }
          />

          <Route
            path="/shelter/pets/:id/edit"
            element={
              <ProtectedRoute roles={["shelter", "admin"]}>
                <EditPet />
              </ProtectedRoute>
            }
          />

          <Route
            path="/shelter/applications"
            element={
              <ProtectedRoute roles={["shelter", "admin"]}>
                <ManageApplications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/rescuer"
            element={
              <ProtectedRoute roles={["rescuer", "admin"]}>
                <RescuerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/rescues"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminRescues />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <main className="container paw-section">
                <h2>Page not found</h2>
              </main>
            }
          />
        </Routes>

        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
