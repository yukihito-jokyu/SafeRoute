import { createBrowserRouter } from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard";
import EvacuationDrillInfo from "./components/EvacuationDrillInfo/EvacuationDrillInfo";
import MyRoutes from "./components/MyRoutes/MyRoutes";
import Points from "./components/Points/Points";
import Settings from "./components/Settings/Settings";
import TrainingMap from "./components/TrainingMap/TrainingMap";
import TestApi from "./components/Test/TestApi";
import ViewMyRoute from "./components/ViewMyRoute/ViewMyRoute";
import Login from "./components/Login/Login";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/evacuation",
    element: (
      <ProtectedRoute>
        <EvacuationDrillInfo />
      </ProtectedRoute>
    ),
  },
  {
    path: "/myroutes",
    element: (
      <ProtectedRoute>
        <MyRoutes />
      </ProtectedRoute>
    ),
  },
  {
    path: "/points",
    element: (
      <ProtectedRoute>
        <Points />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/training",
    element: (
      <ProtectedRoute>
        <TrainingMap />
      </ProtectedRoute>
    ),
  },
  {
    path: "/test",
    element: (
      <ProtectedRoute>
        <TestApi />
      </ProtectedRoute>
    ),
  },
  {
    path: "/viewroute",
    element: (
      <ProtectedRoute>
        <ViewMyRoute />
      </ProtectedRoute>
    ),
  }
]);
