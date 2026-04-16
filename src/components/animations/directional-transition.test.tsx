import React from "react";
import { Text } from "react-native";
import { render } from "@testing-library/react-native";
import {
  DEFAULT_ENTER_DURATION_MS,
  DEFAULT_EXIT_DURATION_MS,
  DirectionalTransition,
} from "@/components/animations";

describe("DirectionalTransition", () => {
  it("renders children with forward direction", () => {
    const { getByText } = render(
      <DirectionalTransition direction="forward" transitionKey="step-a">
        <Text>Etapa A</Text>
      </DirectionalTransition>,
    );

    expect(getByText("Etapa A")).toBeTruthy();
  });

  it("renders children with back direction", () => {
    const { getByText } = render(
      <DirectionalTransition direction="back" transitionKey="step-b">
        <Text>Etapa B</Text>
      </DirectionalTransition>,
    );

    expect(getByText("Etapa B")).toBeTruthy();
  });

  it("keeps transition duration defaults stable", () => {
    expect(DEFAULT_ENTER_DURATION_MS).toBe(240);
    expect(DEFAULT_EXIT_DURATION_MS).toBe(200);
  });
});

