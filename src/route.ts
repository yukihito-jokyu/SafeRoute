import { createBrowserRouter } from "react-router";
import Dashboard from "./components/Dashboard/Dashboard";
import EvacuationDrillInfo from "./components/EvacuationDrillInfo/EvacuationDrillInfo";
import MyRoutes from "./components/MyRoutes/MyRoutes";
import Points from "./components/Points/Points";
import Settings from "./components/Settings/Settings";
import TrainingMap from "./components/TrainingMap/TrainingMap";
import TestApi from "./components/Test/TestApi";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Dashboard,
  },
  {
    path: "/evacuation",
    Component: EvacuationDrillInfo,
  },
  {
    path: "/myroutes",
    Component: MyRoutes,
  },
  {
    path: "/points",
    Component: Points,
  },
  {
    path: "/settings",
    Component: Settings,
  },
  {
    path: "/training",
    Component: TrainingMap,
  },
  {
    path: "/test",
    Component: TestApi,
  }
])