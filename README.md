# Daji

<p align="center">
  <img src="./app-icon.png" alt="Daji Icon" width="120" height="120">
</p>

<p align="center">
  <strong>AI-Powered Code Generation Tool</strong>
</p>

<p align="center">
  <a href="./README.zh-CN.md">中文文档</a>
</p>

## Screenshot

![Daji Screenshot](./doc/Shot.png)

## Overview

Daji is an AI-powered desktop application that helps you create programs effortlessly. Simply describe what you want to build, and let AI generate the code for you. Run your programs in a secure, isolated sandbox environment without affecting your computer.

## ✨ Key Features

### 🤖 AI-Driven Development
- **Natural Language to Code**: Just describe your needs, AI automatically generates code
- **Interactive Refinement**: Chat with AI to iterate and improve your program
- **Smart Error Fixing**: AI helps debug and fix errors automatically
- **Multiple AI Providers**: Support for OpenAI, DeepSeek, Alibaba Qwen, and more

### 🛡️ Sandbox Environment
- **Safe Execution**: Programs run in an isolated environment
- **No System Impact**: Protected from malicious code
- **Real-time Logs**: Monitor program output and errors
- **Process Management**: Easy start, stop, and restart controls

### 🎨 Simple & Intuitive
- **Live Preview**: See your code running in real-time
- **Code & Preview Tabs**: Switch between viewing code and execution results
- **Drag & Drop**: Freely reorder your program list
- **Dark Mode**: Modern UI with light/dark theme support

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Radix UI + Tailwind CSS
- **Desktop**: Tauri 2.0
- **State Management**: Zustand
- **Database**: SQLite (via Tauri)
- **Build Tool**: Vite

## Prerequisites

- Node.js 18+ 
- Rust 1.70+
- pnpm (recommended)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd daji-app
```

2. Install dependencies:
```bash
pnpm install
```

3. Run in development mode:
```bash
pnpm dev:pc
```

## Build

Create a production build:

```bash
pnpm pack
```

The built application will be available in `src-tauri/target/release`.

## Development Scripts

- `pnpm dev` - Start Vite dev server
- `pnpm dev:pc` - Start Tauri development mode
- `pnpm build` - Build frontend
- `pnpm pack` - Build desktop application
- `pnpm publish` - Publish release

## 🎯 How It Works

1. **Create**: Click "New Program" and describe what you want to build
2. **Generate**: AI understands your requirements and generates complete code
3. **Preview**: See your program running in real-time in the preview pane
4. **Refine**: Chat with AI to modify and improve your program
5. **Save**: Save your program to the local database for future use

## � Usage Examples

You can ask AI to create various programs, such as:

- **"Create a Pomodoro timer"** → AI generates a visual countdown application
- **"Create a random password generator"** → AI builds a password generation tool
- **"Create a simple calculator"** → AI creates an interactive calculator
- **"Create a todo list"** → AI develops a task management application
- **"Create a color picker"** → AI makes a color selection tool

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
