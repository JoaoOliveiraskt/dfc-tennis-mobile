import React from "react";
import { Button, EmptyState, GravityIcon, Screen } from "@/components/ui";

function AgendaScreen(): React.JSX.Element {
  return (
    <Screen className="flex-1 bg-background">
      <EmptyState>
        <EmptyState.Content
          icon={<GravityIcon name="agenda" size={56} />}
          title="Sua agenda entra aqui"
          description="Assim que o fluxo de aulas estiver sincronizado, você acompanha reservas, horários e próximos compromissos nesta tela."
          cta={
            <Button variant="link" size="sm">
              <Button.Label className="text-accent">Ver próximas aulas</Button.Label>
            </Button>
          }
        />
      </EmptyState>
    </Screen>
  );
}

export { AgendaScreen };
