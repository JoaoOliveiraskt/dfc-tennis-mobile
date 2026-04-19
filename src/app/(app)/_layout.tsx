import { Slot } from "expo-router";
import { AppShell } from "@/features/app-shell";

export default function AppLayout() {
  return (
    <AppShell>
      <Slot />
    </AppShell>
  );
}
