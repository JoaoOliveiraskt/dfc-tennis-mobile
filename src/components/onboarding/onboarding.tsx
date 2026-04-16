import React from "react";
import { Text, View, type TextProps, type ViewProps } from "react-native";
import { Button, type ButtonRootProps } from "@/components/ui";
import { twMerge } from "tailwind-merge";

interface OnboardingRootProps extends ViewProps {
  readonly className?: string;
}

interface OnboardingHeaderProps extends ViewProps {
  readonly className?: string;
}

interface OnboardingHeaderTitleProps extends TextProps {
  readonly className?: string;
}

interface OnboardingContentProps extends ViewProps {
  readonly className?: string;
}

interface OnboardingHeroProps extends ViewProps {
  readonly className?: string;
}

interface OnboardingCopyProps extends TextProps {
  readonly className?: string;
  readonly uppercase?: boolean;
}

interface OnboardingFooterProps extends ViewProps {
  readonly className?: string;
}

interface OnboardingFooterCtaProps extends Omit<ButtonRootProps, "children"> {
  readonly className?: string;
  readonly label: string;
}

function Root({
  className,
  ...props
}: OnboardingRootProps): React.JSX.Element {
  return <View {...props} className={twMerge("flex-1 bg-background", className)} />;
}

function Header({
  className,
  ...props
}: OnboardingHeaderProps): React.JSX.Element {
  return (
    <View
      {...props}
      className={twMerge("w-full flex-row items-center justify-between px-6 pb-2", className)}
    />
  );
}

function HeaderTitle({
  className,
  ...props
}: OnboardingHeaderTitleProps): React.JSX.Element {
  return (
    <Text
      {...props}
      className={twMerge("flex-1 px-4 text-center text-base font-semibold text-foreground", className)}
      numberOfLines={props.numberOfLines ?? 1}
    />
  );
}

function Content({
  className,
  ...props
}: OnboardingContentProps): React.JSX.Element {
  return <View {...props} className={twMerge("w-full", className)} />;
}

function Hero({
  className,
  ...props
}: OnboardingHeroProps): React.JSX.Element {
  return <View {...props} className={twMerge("w-full", className)} />;
}

function Copy({
  className,
  uppercase = false,
  ...props
}: OnboardingCopyProps): React.JSX.Element {
  return (
    <Text
      {...props}
      className={twMerge(uppercase ? "uppercase" : "", className)}
    />
  );
}

function Footer({
  className,
  ...props
}: OnboardingFooterProps): React.JSX.Element {
  return (
    <View
      {...props}
      className={twMerge("w-full bg-background px-6 pt-4", className)}
    />
  );
}

function FooterCta({
  className,
  label,
  variant = "primary",
  ...props
}: OnboardingFooterCtaProps): React.JSX.Element {
  return (
    <Button {...props} className={className} variant={variant}>
      {label}
    </Button>
  );
}

const Onboarding = Object.assign(Root, {
  Root,
  Header,
  HeaderTitle,
  Content,
  Hero,
  Copy,
  Footer,
  FooterCta,
});

export default Onboarding;
export { Content, Copy, Footer, FooterCta, Header, HeaderTitle, Hero, Root };
export type {
  OnboardingContentProps,
  OnboardingCopyProps,
  OnboardingFooterCtaProps,
  OnboardingFooterProps,
  OnboardingHeaderProps,
  OnboardingHeaderTitleProps,
  OnboardingHeroProps,
  OnboardingRootProps,
};

