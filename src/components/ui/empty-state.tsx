import React from "react";
import { Text, View, type ViewProps } from "react-native";
import { twMerge } from "tailwind-merge";

interface EmptyStateRootProps extends ViewProps {
  readonly cta?: React.ReactNode;
  readonly className?: string;
  readonly description?: string;
  readonly icon?: React.ReactNode;
  readonly title?: string;
}

interface EmptyStateContentProps extends ViewProps {
  readonly cta?: React.ReactNode;
  readonly className?: string;
  readonly description?: string;
  readonly icon?: React.ReactNode;
  readonly title?: string;
}

const EmptyStateRoot = React.forwardRef<View, EmptyStateRootProps>(
  function EmptyStateRoot(
    {
      children,
      className,
      cta,
      description,
      icon,
      title,
      ...props
    }: EmptyStateRootProps,
    ref,
  ): React.JSX.Element {
    const shouldRenderConvenienceContent =
      Boolean(icon) || Boolean(title) || Boolean(description) || Boolean(cta);

    return (
      <View
        ref={ref}
        {...props}
        className={twMerge(
          "flex-1 items-center justify-center px-8 py-10",
          className,
        )}
      >
        {shouldRenderConvenienceContent ? (
          <EmptyStateContent
            icon={icon}
            title={title}
            description={description}
            cta={cta}
          />
        ) : null}
        {children}
      </View>
    );
  },
);

const EmptyStateContent = React.forwardRef<View, EmptyStateContentProps>(
  function EmptyStateContent(
    {
      className,
      cta,
      description,
      icon,
      title,
      ...props
    }: EmptyStateContentProps,
    ref,
  ): React.JSX.Element {
    return (
      <View
        ref={ref}
        {...props}
        className={twMerge(
          "w-full max-w-[320px] items-center justify-center gap-4",
          className,
        )}
      >
        {icon ? <View className="mb-1">{icon}</View> : null}
        {title ? (
          <Text className="text-center text-[30px] font-semibold leading-[36px] tracking-[-1px] text-foreground">
            {title}
          </Text>
        ) : null}
        {description ? (
          <Text className="text-center text-sm leading-6 text-muted">
            {description}
          </Text>
        ) : null}
        {cta ? <View className="mt-2 w-full max-w-[220px]">{cta}</View> : null}
      </View>
    );
  },
);

EmptyStateRoot.displayName = "EmptyState";
EmptyStateContent.displayName = "EmptyState.Content";

const EmptyState = Object.assign(EmptyStateRoot, {
  Content: EmptyStateContent,
});

export default EmptyState;
export type { EmptyStateContentProps, EmptyStateRootProps };
