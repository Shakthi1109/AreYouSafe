import { createBrowserRouter, Navigate } from "react-router-dom";
import { Home } from "@/pages/Home/index";
import { StudentDashboard } from "@/pages/StudentDashboard/index";
import { TeacherDashboard } from "@/pages/TeacherDashboard/index";
import { HelpOthers } from "@/pages/HelpOthers/index";
import { FindOut } from "@/pages/FindOut/index";
import { Login } from "@/pages/Login/index";
import { Register } from "@/pages/Register/index";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const routes = [
    {
        path: "/",
        element: <Home />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/student",
        element: (
            <ProtectedRoute requiredRole="student">
                <StudentDashboard />
            </ProtectedRoute>
        )
    },
    {
        path: "/teacher",
        element: (
            <ProtectedRoute requiredRole="teacher">
                <TeacherDashboard />
            </ProtectedRoute>
        )
    },
    {
        path: "/help-others",
        element: (
            <ProtectedRoute requiredRole="student">
                <HelpOthers />
            </ProtectedRoute>
        )
    },
    {
        path: "/find-out",
        element: <FindOut />
    },
]

export const router = createBrowserRouter(routes);

