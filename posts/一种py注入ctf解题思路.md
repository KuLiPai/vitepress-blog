---
title: 一种py注入的ctf解题思路
description: 一种py注入的ctf解题思路
date: 2026.02.05
tags: 
  - Python
  - CTF
categories: 
  - CTF
---

# 一种py注入的ctf解题思路

目前常见的python题都会使用PyInstaller，Nuitka等工具进行打包

![Frame 2147238197](/Frame%202147238197-20260131134535-h6ttp05.png)

常用的解题思路也是先解包反编译pyc等进行分析

然而这里有一种不同于逆向解包的方式来解题

**Python注入!!!**

‍

## PyInjector使用

**[pyInjector](https://github.com/Stanislav-Povolotsky/PyInjector)**  **- 将 Python 代码注入到任何 Python 进程中，或在目标进程内生成交互式 Python shell。**

‍

如何使用呢？

0. 下载PyInjector到本地，解压出其中的dll

1. 将`目标exe`和`code.py`两个文件放在同一目录下。

    ![9e691a0154f6706e](/9e691a0154f6706e-20260131140100-07s7sva.png)
2. 在`code.py`中编写脚本  
    如

    ```js
    print("Hello from injected code.py")
    ```

3. 运行目标程序
4. 使用[Process Hacker 2](https://github.com/bigrayhicks/processhacker2) (一个魔改的[systeminformer](https://github.com/winsiderss/systeminformer))进行dll注入

    确保目标程序在运行中，右键目标进程选择`Miscellaneous`/`Inject DLL..`​

    ![image](/image-20260131140256-53ah7js.png)

    找到刚刚解压的pyInjector的dll，根据系统选择注入的dll

    ![be648b8f22acff2a](/be648b8f22acff2a-20260131140359-tgu79nb.png)

‍

可以看到注入的瞬间执行了`code.py`​

![e8b5a054098301dd](/e8b5a054098301dd-20260131140517-gz0sqnc.png)

每次执行代码只需注入一次dll

不仅如此，注入的环境就是该程序当前运行环境

因此我们可以做到

1. 打印`全局变量`​

    ```js
    print(dir())
    #     ^ dir() 函数不带参数时，返回当前范围内的变量、方法和定义的类型列表
    ```

    ![88719a3512658a9a](/88719a3512658a9a-20260131140829-plgyk0q.png)

    如果是`PyInstaller`可以看到`main`函数了`_pyi_main_co`​

    由此我们就可以直接dis出字节码了

    ```js
    import dis
    #       ^ 字节码反汇编器
    dis.dis(_pyi_main_co)
    ```

    ![cc8530e0d684e729](/cc8530e0d684e729-20260131141046-egh0pyv.png)

2. 如果是`Nuitka`，我们不能dis出代码

    > Nuitka 将 Python 代码转换为本地代码，而 Python 的反汇编器无法反汇编这种本地代码。
    >

    因此我们只能获取到本地的变量

    比如这个题我们打印`dir()`,发现了enc_flag和key，同时题名叫`XOR`​

    于是就猜测简单异或，可以得出flag

    ![9167b9d0fd8ad9a9](/9167b9d0fd8ad9a9-20260131141651-h3lb6q4.png)

‍

## 附件

这次记得了要上传附件

### XOR.exe `Nuitka`​

这个是来自FurryCTF2025的POFP战队AA师傅出的题

[https://bluestars.lanzouu.com/iAf2C3hfoa4j](https://bluestars.lanzouu.com/iAf2C3hfoa4j)

### NotNormalExe.exe `PyInstaller`​

这个是来自NewStar的好像是PangBai师傅出的题

[https://bluestars.lanzouu.com/ivwkv3hfoauf](https://bluestars.lanzouu.com/ivwkv3hfoauf)

*封面的图片使用figma随便画的()
