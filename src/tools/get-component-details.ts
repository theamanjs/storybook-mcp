import { getComponents, type Component } from "../storybook-api.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { promises as fs } from "node:fs";
import path from "path";

export const GetComponentDetailsParamsSchema = z.object({
  name: z.string().describe("Component name to get details for"),
  path: z
    .string()
    .optional()
    .describe(
      "Path to the index.json or stories.json file (optional if default path is provided)"
    ),
});

// Helper functions for creating enhanced component data structure

const createEnhancedComponentData = (component: Component) => {
  const variantCount = Object.keys(component.variants).length;
  const propsCount = component.props.length;
  const propsWithDefaults = component.props.filter(
    (p) => p.defaultValue !== null && p.defaultValue !== undefined
  ).length;
  const variantsWithDocs = Object.values(component.variants).filter(
    (v) => !v.parameters?.docsOnly
  ).length;

  let complexity = "Low";
  if (propsCount > 5 || variantCount > 5) complexity = "High";
  else if (propsCount > 2 || variantCount > 2) complexity = "Medium";

  const docsCoverage =
    variantCount > 0 ? Math.round((variantsWithDocs / variantCount) * 100) : 0;

  const variants = Object.values(component.variants);
  const storyFiles = [
    ...new Set(variants.map((v) => v.parameters?.fileName).filter(Boolean)),
  ];
  const componentFiles = [
    ...new Set(variants.map((v) => v.componentPath).filter(Boolean)),
  ];

  const usageExamples = variants
    .filter((v) => v.parameters?.jsx)
    .slice(0, 5) // Show max 5 examples
    .map((v) => ({
      variantName: v.name,
      jsx: v.parameters.jsx,
      fileName: v.parameters?.fileName,
    }));

  return {
    component: {
      name: component.name,
      id: component.id,
      description: component.description || null,
      overview: {
        totalVariants: variantCount,
        propsCount: propsCount,
        warnings: [
          ...(variantCount === 0 ? ["No variants found"] : []),
          ...(propsCount === 0 ? ["No props defined"] : []),
        ],
      },
    },
    props: component.props.map((prop) => ({
      name: prop.name,
      type: prop.type,
      defaultValue: prop.defaultValue,
      description: prop.description || null,
      hasDefault: prop.defaultValue !== null && prop.defaultValue !== undefined,
    })),
    variants: Object.entries(component.variants).map(([key, variant]) => ({
      key: key,
      name: variant.name,
      title: variant.title,
      file: variant.parameters?.fileName || null,
      jsx: variant.parameters?.jsx || null,
      docsOnly: variant.parameters?.docsOnly || false,
      id: variant.id,
      importPath: variant.importPath || null,
      componentPath: variant.componentPath || null,
      storyFileFullPath: variant.storyFileFullPath || null,
      componentFullPath: variant.componentFullPath || null,
    })),
    fileInformation: {
      storyFiles: storyFiles,
      componentFiles: componentFiles,
      importPaths: variants.map((v) => v.importPath).filter(Boolean),
      primaryImportPath: variants.length > 0 ? variants[0].importPath : null,
    },
    usageExamples: usageExamples,
    metrics: {
      complexity: {
        score: complexity,
        propsCount: propsCount,
        variantsCount: variantCount,
      },
      documentation: {
        coverage: docsCoverage,
        variantsWithDocs: variantsWithDocs,
        totalVariants: variantCount,
      },
      props: {
        total: propsCount,
        withDefaults: propsWithDefaults,
        withoutDefaults: propsCount - propsWithDefaults,
      },
      healthScore:
        docsCoverage > 50 && propsWithDefaults > 0
          ? "Good"
          : "Needs Improvement",
    },
  };
};

/* 
  This tool is used to get detailed information about a component in structured JSON format.
  Perfect for AI tools and agents to easily parse and extract specific component information.
*/
export const getComponentDetails = async (
  args: z.infer<typeof GetComponentDetailsParamsSchema> & {
    storybookStaticDir: string;
  }
) => {
  try {
    const components = await getComponents(args.storybookStaticDir);
    const componentName = args.name;

    // Try exact match first, then case-insensitive match for better UX
    let component = components.find((c: Component) => c.name === componentName);

    if (!component) {
      component = components.find(
        (c: Component) => c.name.toLowerCase() === componentName.toLowerCase()
      );
    }

    if (!component) {
      // Enhanced error with suggestions
      const similarComponents = components
        .filter((c) =>
          c.name.toLowerCase().includes(componentName.toLowerCase())
        )
        .slice(0, 3)
        .map((c) => c.name);

      let errorMessage = `Component "${componentName}" not found`;
      if (similarComponents.length > 0) {
        errorMessage += `\n\nDid you mean one of these?\n${similarComponents
          .map((name) => `  - ${name}`)
          .join("\n")}`;
      }

      throw new McpError(ErrorCode.MethodNotFound, errorMessage);
    }

    // Generate enhanced JSON output
    const enhancedData = createEnhancedComponentData(component);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(enhancedData, null, 2),
        },
      ],
    };
  } catch (error) {
    console.error("Error getting component details:", error);
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(
      ErrorCode.InternalError,
      "Failed to get component details"
    );
  }
};
