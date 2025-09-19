[English Version](./README-EN.md) | [中文版本](./README.md)

# Next Hexagon - 六边形弹跳小球

一个基于 Next.js 的交互式六边形弹跳小球物理模拟游戏。使用 HTML5 Canvas 和自定义物理引擎实现逼真的弹跳效果。

## ✨ 功能特性

- 🎯 **物理模拟**: 真实的物理引擎，包括重力、空气阻力、弹性碰撞
- 🔷 **六边形几何**: 精确的六边形边界检测和碰撞计算
- 🎮 **交互控制**: 实时调整物理参数和旋转速度
- 🎨 **视觉效果**: 小球运动轨迹显示，支持暂停/继续
- 📱 **响应式设计**: 适配不同屏幕尺寸
- ⚡ **高性能**: 使用 Turbopack 加速开发构建

## 🛠️ 技术栈

- **框架**: Next.js 15.5.3 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS v4
- **代码质量**: Biome (检查和格式化)
- **包管理**: pnpm
- **构建工具**: Turbopack

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
pnpm build
pnpm start
```

## 📁 项目结构

```
next-hexagon/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 根布局
│   ├── page.tsx          # 主页
│   └── globals.css       # 全局样式
├── components/            # React 组件
│   └── HexagonBounce.tsx # 六边形弹跳组件
├── lib/                   # 工具库
│   ├── geometry.ts       # 几何计算函数
│   └── physics.ts        # 物理引擎
├── public/               # 静态资源
└── package.json         # 项目配置
```

## 🎮 使用说明

1. **调整参数**: 使用界面上的滑块调整重力、摩擦力、弹性等物理参数
2. **控制旋转**: 修改六边形的旋转速度
3. **观察轨迹**: 开启/关闭小球运动轨迹显示
4. **暂停游戏**: 点击暂停按钮停止动画

## 🛠️ 开发命令

```bash
# 开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 代码检查
pnpm lint

# 代码格式化
pnpm format
```

## 📦 核心依赖

- `react`: ^19.1.0 - React 框架
- `react-dom`: ^19.1.0 - React DOM
- `next`: ^15.5.3 - Next.js 框架
- `tailwindcss`: ^4 - CSS 框架

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

This project is private.
