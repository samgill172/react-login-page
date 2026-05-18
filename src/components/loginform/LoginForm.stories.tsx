import type { Meta, StoryObj } from '@storybook/react-vite'
import LoginForm from "./LoginForm";

const meta = {
  title: "Pages/LoginForm",
  component: LoginForm,
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "warm",
      values: [{ name: "warm", value: "#f4efe7" }],
    },
  },
} satisfies Meta<typeof LoginForm>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <LoginForm />
    </div>
  ),
}