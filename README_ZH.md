# VSCode 市场协议切换器 (VSCode Marketplace Protocol Switcher)

![版本](https://img.shields.io/badge/version-1.1-blue) ![授权](https://img.shields.io/badge/license-GPLv3-brightgreen)

自定义 **VSCode Marketplace** 安装按钮的协议前缀。在 **VS Code**, **Antigravity**, **Windsurf**, **Cursor**, **VSCodium** 等多种 IDE 之间无缝切换，甚至支持使用你自己的自定义协议。

[English](./README.md)

---

## ✨ 功能特性

### 1. 🚀 一键协议切换
- **全面支持**：适用于 VSCode 市场的所有扩展详情页。
- **内置预设**：快速选择主流 IDE：
  - **VS Code** (`vscode`)
  - **Antigravity** (`antigravity`)
  - **Windsurf** (`windsurf`)
  - **Cursor** (`cursor`)
  - **VSCodium** (`vscodium`)
  - **VS Code Insiders** (`vscode-insiders`)
- **自定义协议**：支持输入任何你需要的自定义协议字符串。

### 2. ⚙️ 简易配置
- **菜单集成**：通过篡改猴管理菜单直接打开设置。
- **持久化保存**：你的选择将被保留，并应用于所有市场页面。

## 🚀 安装方法

你需要在浏览器中先安装脚本管理器，如 **Tampermonkey (篡改猴)**。

1. 安装 Tampermonkey 插件 ([Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) / [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd) / [Firefox](https://addons.mozilla.org/zh-CN/firefox/addon/tampermonkey/))。
2. 点击下方链接直接安装脚本：
   
   👉 **[点击安装 VSCode 市场协议切换器](https://github.com/CookSleep/VSCode-Protocol-Switcher/raw/main/vscode-installer.user.js)**
3. 打开 [VSCode 市场](https://marketplace.visualstudio.com/) 的任何插件页面。
4. 开始享受自定义安装体验！

## 🛠️ 使用说明

1. 点击浏览器工具栏中的篡改猴图标。
2. 选择 **「设置 VSCode 协议」**。
3. 在下拉列表中选择你使用的 IDE，或点击“自定义...”输入特定协议。
4. 点击 **保存**。页面上的安装按钮将立即更新生效。

## 🤝 贡献

欢迎提交 Issue 或 Pull Request 来改进代码！
