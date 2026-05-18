import type { Meta, StoryObj } from '@storybook/react-vite'
import Input from "./Input";

const meta = {
  title: "Form/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-[24rem] bg-[#fffaf3] p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>

export default meta

type Story = StoryObj<typeof meta>

export const Email: Story = {
  args: {
    label: "Email address",
    placeholder: "you@northstar.co",
    type: "email",
    hint: "Use the address attached to your workspace.",
  },
}

export const Password: Story = {
  args: {
    label: "Password",
    placeholder: "Enter your password",
    type: "password",
  },
}

export const Prefilled: Story = {
  args: {
    label: "Workspace email",
    type: "email",
    defaultValue: "sam@northstar.co",
    hint: "This can be edited before submission.",
  },
}