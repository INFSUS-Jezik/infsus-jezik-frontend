import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import MainLayout from "./components/layout/MainLayout";
import CourseListPage from "./pages/CourseListPage";
import ClassroomListPage from "./pages/ClassroomListPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Redirect root to courses */}
                <Route path="/" element={<Navigate to="/courses" replace />} />

                {/* Main routes with layout */}
                <Route
                    path="/courses"
                    element={
                        <MainLayout>
                            <CourseListPage />
                        </MainLayout>
                    }
                />

                <Route
                    path="/classrooms"
                    element={
                        <MainLayout>
                            <ClassroomListPage />
                        </MainLayout>
                    }
                />

                {/* Fallback for any other routes */}
                <Route
                    path="*"
                    element={
                        <MainLayout>
                            <div className="p-8 text-center">
                                <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
                                <p>The page you are looking for doesn't exist.</p>
                            </div>
                        </MainLayout>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
