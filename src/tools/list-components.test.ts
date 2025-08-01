import { describe, it, expect, spyOn } from "bun:test";
import { listComponents } from "./list-components.js";
import * as storybookApi from "../storybook-api.js";
import type { Component } from "../storybook-api.js";
import { McpError } from "@modelcontextprotocol/sdk/types.js";

describe("list-components", () => {
  const mockConfig = {
    storybookStaticDir:
      "/Users/amanjot.singh/experiments/storybook-mcp/storybook-sample/storybook-static",
  };
  const mockComponents: Component[] = [
    { id: "Component-1", name: "Component 1", props: [], variants: {} },
    { id: "Component-2", name: "Component 2", props: [], variants: {} },
  ];

  it("should return a list of components when successful", async () => {
    // Mock getComponents to return our test components
    spyOn(storybookApi, "getComponents").mockResolvedValue(mockComponents);

    const result = await listComponents("__fixtures__/storybook-static");

    // Check result structure
    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: JSON.stringify(mockComponents, null, 2),
        },
      ],
    });
  });

  it("should throw McpError when getComponents fails", async () => {
    // Mock getComponents to throw an error
    const testError = new Error("Test error");
    spyOn(storybookApi, "getComponents").mockRejectedValue(testError);
    spyOn(console, "error").mockImplementation(() => {});

    // Expect function to throw McpError
    await expect(listComponents("./storybook-static")).rejects.toThrow(
      McpError
    );

    // Verify console error was called
    expect(console.error).toHaveBeenCalledWith(
      "Error listing components:",
      testError
    );
  });
});
