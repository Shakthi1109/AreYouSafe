import { createBrowserRouter, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "@/pages/Home/index";
import { StudentDashboard } from "@/pages/StudentDashboard/index";
import { TeacherDashboard } from "@/pages/TeacherDashboard/index";
import { HelpOthers } from "@/pages/HelpOthers/index";
import { FindOut } from "@/pages/FindOut/index";
import { Login } from "@/pages/Login/index";
import { Register } from "@/pages/Register/index";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Splash } from "@/pages/Splash/index";

function SplashThenHome() {
    const navigate = useNavigate();
    useEffect(() => {
        const timer = setTimeout(() => {
            navigate("/home", { replace: true });
        }, 4100); // show splash for ~4 seconds before going to /home
        return () => clearTimeout(timer);
    }, [navigate]);
    return <Splash />;
}

const routes = [
    {
        path: "/splash",
        element: <Splash />
    },
    {
        path: "/home",
        element: <Home />
    },
    {
        path: "/",
        element: <SplashThenHome />
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

