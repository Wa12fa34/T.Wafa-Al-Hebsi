import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Navbar from "./components/Navbar.jsx";
import ProtectedTeacherRoute from "./components/ProtectedTeacherRoute.jsx";
import ProtectedRoleRoute from "./components/ProtectedRoleRoute.jsx";

import Home from "./pages/Home.jsx";
import Reading from "./pages/Reading.jsx";
import ReadingLevel from "./pages/ReadingLevel.jsx";
import Writing from "./pages/Writing.jsx";
import WritingLevel from "./pages/WritingLevel.jsx";
import WritingAssessment from "./pages/WritingAssessment.jsx";
import Vocabulary from "./pages/Vocabulary.jsx";
import VocabularyLevel from "./pages/VocabularyLevel.jsx";
import Grammar from "./pages/Grammar.jsx";
import GrammarLevel from "./pages/GrammarLevel.jsx";
import Login from "./pages/Login.jsx";
import TeacherLogin from "./pages/TeacherLogin.jsx";
import Progress from "./pages/Progress.jsx";
import TeacherDashboard from "./pages/TeacherDashboard.jsx";
import OwnerDashboard from "./pages/OwnerDashboard.jsx";
import ClassDetails from "./pages/ClassDetails.jsx";
import StudentReport from "./pages/StudentReport.jsx";
import StudentManagement from "./pages/StudentManagement.jsx";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reading" element={<Reading />} />
        <Route path="/reading/:level" element={<ReadingLevel />} />
        <Route path="/writing" element={<Writing />} />
        <Route path="/writing/:level" element={<WritingLevel />} />
        <Route path="/vocabulary" element={<Vocabulary />} />
        <Route path="/vocabulary/:level" element={<VocabularyLevel />} />
        <Route path="/grammar" element={<Grammar />} />
        <Route path="/grammar/:level" element={<GrammarLevel />} />
        <Route path="/login" element={<Login />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/progress" element={<Progress />} />

        <Route path="/owner" element={<ProtectedRoleRoute roles={["owner"]} redirectTo="/teacher-login"><OwnerDashboard /></ProtectedRoleRoute>} />
        <Route path="/teacher" element={<ProtectedTeacherRoute><TeacherDashboard /></ProtectedTeacherRoute>} />
        <Route path="/teacher/class/:classId" element={<ProtectedTeacherRoute><ClassDetails /></ProtectedTeacherRoute>} />
        <Route path="/teacher/student/:studentId" element={<ProtectedTeacherRoute><StudentReport /></ProtectedTeacherRoute>} />
        <Route path="/teacher/writing/:submissionId" element={<ProtectedTeacherRoute><WritingAssessment /></ProtectedTeacherRoute>} />
        <Route path="/teacher/students" element={<ProtectedTeacherRoute><StudentManagement /></ProtectedTeacherRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
