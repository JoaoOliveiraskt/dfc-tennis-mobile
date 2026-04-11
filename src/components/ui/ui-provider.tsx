import type { PropsWithChildren } from "react";
import { HeroUINativeProvider } from "heroui-native";

function UiProvider({ children }: PropsWithChildren): React.JSX.Element {
  return <HeroUINativeProvider>{children}</HeroUINativeProvider>;
}

export default UiProvider;
