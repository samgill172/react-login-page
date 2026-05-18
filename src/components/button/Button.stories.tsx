import type { Meta, StoryObj } from '@storybook/react-vite'
import Button from "./Button";

const meta = {
  title: "Form/Button",
  component: Button,
  args: {
    label: "Login to Northstar",
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "outline"],
    },
    fullWidth: {
      control: "boolean",
    },
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    variant: "primary",
  },
}

export const Secondary: Story = {
  args: {
    label: "Use SSO",
    variant: "secondary",
  },
}

export const Outline: Story = {
  args: {
    label: "Continue with Google",
    variant: "outline",
  },
}