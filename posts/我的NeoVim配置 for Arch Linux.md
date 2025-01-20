---
title: 我的NeoVim配置 for Arch Linux
description: Arch Linux下NeoVim的配置和使用
date: 2024.12.28
tags: 
  - Arch Linux
  - Neovim
categories: 
  - 教程
---

Theme:[Catppuccin](https://github.com/catppuccin/nvim)

OS:Arch Linux

Inspire:[wochap](https://github.com/wochap/nvim)

## 0.NVIM

![image2](https://www.helloimg.com/i/2024/12/28/676fcbe73de8d.png)
![image1](https://www.helloimg.com/i/2024/12/28/676fcac83efbe.png)

## 1.基本准备

### 1.1换源

`sudo vim /etc/pacman.d/mirrorlist`

添加

```
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinux/$repo/os/$arch
Server = https://mirrors.aliyun.com/archlinux/$repo/os/$arch
Server = https://mirror.sjtu.edu.cn/archlinux/$repo/os/$arch
Server = https://mirrors.ustc.edu.cn/archlinux/$repo/os/$arch
```

### 1.2清理和同步本地软件包缓存

`sudo pacman -Syy`

`sudo pacman -Scc`

### 1.3安装依赖

```bash
sudo pacman -S --needed neovim python python-pip nodejs npm ripgrep fd deno tree-sitter nix go ruby fzf
pip install neovim-remote
npm install -g pyright
sudo npm install -g tree-sitter-cli
gem install solargraph
pip install ruff-lsp
go install golang.org/x/tools/gopls@latest
export PATH=$PATH:$HOME/go/bin
gem install solargraph rubocop standardrb
```

- **`neovim`**: 安装 Neovim（确保版本 `v0.10.0` 或更高）。
- **`ripgrep` 和 `fd`**: Telescope 需要它们用于文件搜索。
- **`deno`**: Peek 插件依赖它。
- **`nixfmt`** 和 **`statix`**: 分别用于格式化和 lint（由 `conform.nvim` 和 `nvim-lint` 依赖）。
- **`ts-node`** 和 **`typescript`**: 用于调试（`nvim-dap`）和 LSP 支持。
- **`marksman`**: LSP 配置需要它。

## 2.主题配置

### 2.0删除原配置(没有主题可以跳过）

```bash
rm -rf ~/.cache/nvim
rm -rf ~/.local/share/nvim
rm -rf ~/.local/state/nvim
```

### 2.1安装主题

**HTTPS方式（推荐）**

`git clone https://github.com/wochap/nvim.git ~/.config/nvim`

**SSH方式**

`git clone git@github.com:wochap/nvim.git ~/.config/nvim`

然后输入

`nvim` 启动Lazy面板等待安装完成

### 2.2fzf问题

如果你每次启动nvim时，fzf都会报错，可以通过以下方式解决

```bash
export XDG_RUNTIME_DIR="$HOME/.cache/"
```

来源( https://github.com/ibhagwan/fzf-lua/issues/1243 )

*至此主题就安装完成了*

## 3.自动补全&键位

### 3.1 Tree

文件树

使用方式

- `<leader>+e` 光标聚焦于文件树
- `<leader>+b` 打开/关闭文件树

`<leader>`一般是`空格`(在normal模式下)

### 3.2 语法补全

**安装**

在NORMAL输入`:Mason` 进入语法管理

在里面可以下载到各种语言的补全插件，纠错等lsp插件

比如下载c语言支持

找到`clangd` 输入`i`进行安装

**使用**

安装好后输入代码会有自动补全提示，那么如何接受提示呢？

在INSERT（插入）模式，显示了语法提示时输入`<Ctrl>+y` 接受建议，

`<Ctrl>+n` 下一条建议，`<Ctrl>+p` 上一条建议
