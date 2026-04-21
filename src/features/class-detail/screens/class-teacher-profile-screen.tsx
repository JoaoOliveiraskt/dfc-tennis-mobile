import React, { useCallback } from "react";
import { Text, View } from "react-native";
import ChevronLeftIcon from "@gravity-ui/icons/svgs/chevron-left.svg";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  Button,
  EmptyState,
  Screen,
  Spinner,
  UserAvatar,
  useAppThemeColor,
} from "@/components/ui";
import { HOME_ROUTE } from "@/features/auth/services/auth-entry-routes";
import { useClassDetail } from "@/features/class-detail/hooks/use-class-detail";
import type { HomeFeedItemKind } from "@/features/home/types/home-feed";

interface ClassTeacherProfileScreenProps {
  readonly classId: string;
  readonly kind?: HomeFeedItemKind;
}

function ClassTeacherProfileScreen({
  classId,
  kind,
}: ClassTeacherProfileScreenProps): React.JSX.Element {
  const router = useRouter();
  const foregroundColor = useAppThemeColor("foreground");
  const { data, errorMessage, isLoading } = useClassDetail(classId, kind);
  const teacher = data?.coach;
  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(HOME_ROUTE);
  }, [router]);

  if (!data && isLoading) {
    return (
      <Screen className="flex-1 items-center justify-center bg-background">
        <StatusBar style="light" />
        <Spinner />
      </Screen>
    );
  }

  if (!data || !teacher) {
    return (
      <Screen className="flex-1 bg-background">
        <StatusBar style="light" />
        <EmptyState
          title="Professor indisponível"
          description={errorMessage ?? "Não encontramos os dados desse professor agora."}
        />
      </Screen>
    );
  }

  return (
    <Screen className="flex-1 bg-background px-5 pt-4">
      <StatusBar style="light" />
      <View className="h-12 flex-row items-center">
        <Button
          variant="tertiary"
          size="icon-xs"
          className="bg-[#30343d]/92"
          onPress={handleBack}
          accessibilityLabel="Voltar"
        >
          <ChevronLeftIcon width={18} height={18} color={foregroundColor} />
        </Button>
      </View>

      <View className="items-center gap-4 pt-8">
        <UserAvatar
          className="size-28 rounded-full"
          email={teacher.email}
          image={teacher.image}
          name={teacher.name}
          userId={teacher.id}
        />
        <View className="items-center gap-2">
          <Text className="text-center text-[34px] font-semibold leading-[40px] text-foreground">
            {teacher.name ?? "Professor DFC"}
          </Text>
          <Text className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-muted">
            {teacher.specialization ?? "Professor"}
          </Text>
        </View>
      </View>

      <View className="mt-8 rounded-[28px] bg-surface px-5 py-5">
        <Text className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Aula vinculada
        </Text>
        <Text className="mt-2 text-xl font-semibold text-foreground">
          {data.title}
        </Text>
        <Text className="mt-2 text-sm leading-6 text-muted">
          {data.dateLabel} • {data.timeLabel}
        </Text>
        <Text className="text-sm leading-6 text-muted">{data.locationLabel}</Text>
      </View>

      <View className="mt-4 rounded-[28px] bg-surface px-5 py-5">
        <Text className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Sobre o professor
        </Text>
        <Text className="mt-3 text-sm leading-6 text-muted">
          {teacher.bio ??
            "Bio e especialidade aparecem aqui assim que estiverem disponiveis na API mobile."}
        </Text>
      </View>
    </Screen>
  );
}

export { ClassTeacherProfileScreen };
export type { ClassTeacherProfileScreenProps };
