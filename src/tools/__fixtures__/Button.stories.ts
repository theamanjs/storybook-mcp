import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button.jsx";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<typeof Button> = {
  title: "Example/Button",
  component: Button,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Button>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    primary: true,
    label: "Primary Button",
  },
};

export const Secondary: Story = {
  args: {
    primary: false,
    label: "Secondary Button",
  },
};

export const Large: Story = {
  args: {
    size: "large",
    label: "Large Button",
  },
};

export const Small: Story = {
  args: {
    size: "small",
    label: "Small Button",
  },
};
