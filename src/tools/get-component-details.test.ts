import { beforeEach, describe, expect, it, spyOn } from "bun:test";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import * as storybookApi from "../storybook-api.js";
import type { Component } from "../storybook-api.js";
import { getComponentDetails } from "./get-component-details.js";

describe("get-component-details", () => {
  const mockConfig = { storybookStaticDir: "./test-storybook-static" };
  const mockComponents: Component[] = [
    {
      id: "button",
      name: "Button",
      props: [
        { name: "color", type: "string", defaultValue: null },
        { name: "size", type: "string", defaultValue: null },
      ],
      variants: {
        default: {
          name: "Default",
          title: "Button",

          parameters: {
            __id: "button-default",
            docsOnly: false,
            fileName: "button.stories.js",
            jsx: "<Button>Click me</Button>",
          },
        },
      },
    },
    {
      id: "card",
      name: "Card",
      props: [{ name: "title", type: "string", defaultValue: null }],
      variants: {},
    },
  ];

  beforeEach(() => {
    // Mock getComponents to return our test components
    spyOn(storybookApi, "getComponents").mockResolvedValue(mockComponents);
  });

  it("should return enhanced component details when the component is found", async () => {
    const result = await getComponentDetails({
      name: "Button",
      storybookStaticDir: mockConfig.storybookStaticDir,
    });

    expect(storybookApi.getComponents).toHaveBeenCalledWith(
      mockConfig.storybookStaticDir
    );

    // Check that the result contains rich formatted text instead of raw JSON
    expect(result).toHaveProperty("content");
    expect(result.content).toHaveLength(1);
    expect(result.content[0]).toHaveProperty("type", "text");

    const outputText = result.content[0].text;

    // Parse the JSON output
    const jsonData = JSON.parse(outputText);

    // Verify the JSON structure contains expected sections
    expect(jsonData).toHaveProperty("component");
    expect(jsonData).toHaveProperty("props");
    expect(jsonData).toHaveProperty("variants");
    expect(jsonData).toHaveProperty("fileInformation");
    expect(jsonData).toHaveProperty("usageExamples");
    expect(jsonData).toHaveProperty("metrics");

    // Verify component overview
    expect(jsonData.component.name).toBe("Button");
    expect(jsonData.component.id).toBe("button");
    expect(jsonData.component.overview.propsCount).toBe(2);

    // Verify props data
    expect(jsonData.props).toHaveLength(2);
    expect(jsonData.props[0].name).toBe("color");
    expect(jsonData.props[0].type).toBe("string");
    expect(jsonData.props[1].name).toBe("size");

    // Verify variants data
    expect(jsonData.variants).toHaveLength(1);
    expect(jsonData.variants[0].jsx).toBe("<Button>Click me</Button>");

    // Verify metrics
    expect(jsonData.metrics).toHaveProperty("complexity");
    expect(jsonData.metrics).toHaveProperty("documentation");
    expect(jsonData.metrics).toHaveProperty("healthScore");
  });

  it("should throw enhanced McpError with suggestions when the component is not found", async () => {
    spyOn(console, "error").mockImplementation(() => {});

    try {
      await getComponentDetails({
        name: "NonExistent",
        storybookStaticDir: mockConfig.storybookStaticDir,
      });
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(McpError);
      expect((error as McpError).code).toBe(ErrorCode.MethodNotFound);
      expect((error as McpError).message).toContain(
        'Component "NonExistent" not found'
      );
    }
  });

  it("should provide suggestions for similar component names", async () => {
    spyOn(console, "error").mockImplementation(() => {});

    try {
      await getComponentDetails({
        name: "but",
        storybookStaticDir: mockConfig.storybookStaticDir,
      });
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(McpError);
      expect((error as McpError).message).toContain(
        "Did you mean one of these?"
      );
      expect((error as McpError).message).toContain("Button");
    }
  });

  it("should throw McpError when getComponents fails", async () => {
    // Mock getComponents to throw an error
    const testError = new Error("Test error");
    spyOn(storybookApi, "getComponents").mockRejectedValue(testError);

    // Expect function to throw McpError
    await expect(
      getComponentDetails({
        name: "Button",
        storybookStaticDir: mockConfig.storybookStaticDir,
      })
    ).rejects.toThrow(McpError);

    // Verify console error was called
    expect(console.error).toHaveBeenCalledWith(
      "Error getting component details:",
      testError
    );
  });
});
