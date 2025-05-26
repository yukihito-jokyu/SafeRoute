import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import Header from '@/components/Header/Header';

const meta = {
  title: 'components/Header/Header',        // ストーリーのタイトル（表示名）
  component: Header,               // このストーリーに関連するコンポーネント
  parameters: {
    layout: "centered",                       // コンポーネントのレイアウトを「中央」に配置するオプション
  },
  tags: ["autodocs"],                         // 自動生成されるドキュメントに関連するタグ
  argTypes: {
    color: { control: "color" },              // `color` プロパティに対してカラーピッカーを表示
  },
  args: { onClick: fn() },                    // `componentName` の `onClick` 引数に対して action を設定
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Button",
    // propsで受け取る値を設定しない
  }
}

export const Disabled: Story = {
  args: {
    label: "Button",
    disabled: true
  }
}

export const Loading: Story = {
  args: {
    label: "Button",
    loading: true
  }
}