import type React from "react";
import { AuthenticatedHomeScreen } from "@/features/home";

export default function AppHomeRoute(): React.JSX.Element {
  return <AuthenticatedHomeScreen />;
}
