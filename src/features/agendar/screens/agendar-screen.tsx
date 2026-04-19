import React from "react";
import { Button, EmptyState, GravityIcon, Screen } from "@/components/ui";

function AgendarScreen(): React.JSX.Element {
  return (
    <Screen className="flex-1 bg-background">
      <EmptyState>
        <EmptyState.Content
          icon={<GravityIcon name="plus" size={58} />}
          title="Novos horários vão aparecer aqui"
          description="Use esta área para explorar aulas abertas, comparar opções e confirmar uma reserva com menos passos."
          cta={
            <Button variant="link" size="sm">
              <Button.Label className="text-accent">Explorar agenda</Button.Label>
            </Button>
          }
        />
      </EmptyState>
    </Screen>
  );
}

export { AgendarScreen };
