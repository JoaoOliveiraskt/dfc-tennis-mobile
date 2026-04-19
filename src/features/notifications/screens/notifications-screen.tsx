import React from "react";
import { Button, EmptyState, GravityIcon, Screen } from "@/components/ui";

function NotificationsScreen(): React.JSX.Element {
  return (
    <Screen className="flex-1 bg-background">
      <EmptyState>
        <EmptyState.Content
          icon={<GravityIcon name="bell" size={56} />}
          title="As notificações chegam aqui"
          description="Confirmações, lembretes e avisos importantes da sua rotina de treinos vão ficar concentrados nesta inbox."
          cta={
            <Button variant="link" size="sm">
              <Button.Label className="text-accent">Atualizar status</Button.Label>
            </Button>
          }
        />
      </EmptyState>
    </Screen>
  );
}

export { NotificationsScreen };
