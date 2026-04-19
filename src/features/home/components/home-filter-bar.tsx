import React from "react";
import { ScrollView, Text, Pressable, View } from "react-native";
import { twMerge } from "tailwind-merge";
import type { HomeFeedData, HomeFeedFilter } from "@/features/home/types/home-feed";

interface HomeFilterBarProps {
  readonly filterOptions: HomeFeedData["filterOptions"];
  readonly selectedFilter: HomeFeedFilter;
  readonly onSelect: (value: HomeFeedFilter) => void;
}

function HomeFilterBar({
  filterOptions,
  selectedFilter,
  onSelect,
}: HomeFilterBarProps): React.JSX.Element {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 12, paddingRight: 20 }}
    >
      {filterOptions.map((filter) => {
        const isActive = selectedFilter === filter.key;

        return (
          <Pressable
            key={filter.key}
            accessibilityRole="button"
            onPress={() => onSelect(filter.key)}
            className={twMerge(
              "min-h-11 flex-row items-center gap-2 rounded-full border px-4 py-2.5",
              isActive
                ? "border-foreground bg-foreground"
                : "border-border bg-surface",
            )}
          >
            <Text
              className={twMerge(
                "text-sm font-semibold",
                isActive ? "text-background" : "text-foreground",
              )}
            >
              {filter.label}
            </Text>
            <View
              className={twMerge(
                "min-w-7 rounded-full px-2 py-1",
                isActive ? "bg-background/15" : "bg-background",
              )}
            >
              <Text
                className={twMerge(
                  "text-center text-xs font-semibold",
                  isActive ? "text-background" : "text-muted",
                )}
              >
                {filter.count}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export { HomeFilterBar };
