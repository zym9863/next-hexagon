[English Version](./README-EN.md) | [中文版本](./README.md)

# Next Hexagon - Hexagon Bouncing Ball

An interactive hexagon bouncing ball physics simulation game based on Next.js. Uses HTML5 Canvas and custom physics engine to achieve realistic bouncing effects.

## ✨ Features

- 🎯 **Physics Simulation**: Real physics engine including gravity, air resistance, elastic collisions
- 🔷 **Hexagon Geometry**: Precise hexagon boundary detection and collision calculations
- 🎮 **Interactive Controls**: Real-time adjustment of physics parameters and rotation speed
- 🎨 **Visual Effects**: Ball motion trajectory display, support for pause/resume
- 📱 **Responsive Design**: Adapts to different screen sizes
- ⚡ **High Performance**: Uses Turbopack to accelerate development builds

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Code Quality**: Biome (linting and formatting)
- **Package Manager**: pnpm
- **Build Tool**: Turbopack

## 🚀 Quick Start

### Environment Requirements

- Node.js 18+
- pnpm

### Install Dependencies

```bash
pnpm install
```

### Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build Production Version

```bash
pnpm build
pnpm start
```

## 📁 Project Structure

```
next-hexagon/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Homepage
│   └── globals.css       # Global styles
├── components/            # React components
│   └── HexagonBounce.tsx # Hexagon bounce component
├── lib/                   # Utility libraries
│   ├── geometry.ts       # Geometry calculation functions
│   └── physics.ts        # Physics engine
├── public/               # Static assets
└── package.json         # Project configuration
```

## 🎮 Usage Instructions

1. **Adjust Parameters**: Use the sliders on the interface to adjust physics parameters like gravity, friction, elasticity
2. **Control Rotation**: Modify the hexagon's rotation speed
3. **Observe Trajectory**: Turn on/off ball motion trajectory display
4. **Pause Game**: Click the pause button to stop the animation

## 🛠️ Development Commands

```bash
# Development server
pnpm dev

# Build production version
pnpm build

# Start production server
pnpm start

# Code linting
pnpm lint

# Code formatting
pnpm format
```

## 📦 Core Dependencies

- `react`: ^19.1.0 - React framework
- `react-dom`: ^19.1.0 - React DOM
- `next`: ^15.5.3 - Next.js framework
- `tailwindcss`: ^4 - CSS framework

## 🤝 Contributing

Welcome to submit Issues and Pull Requests!

## 📄 License

This project is private.