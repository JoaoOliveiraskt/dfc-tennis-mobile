import { Slot } from "expo-router";
import { AppShell } from "@/features/app-shell";

export default function AppShellLayout() {
  return (
    <AppShell>
      <Slot />
    </AppShell>
  );
}
