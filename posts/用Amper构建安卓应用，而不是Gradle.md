---
title: 用Amper构建安卓应用，而不是Gradle
description: 用Amper构建安卓应用，而不是Gradle 
date: 2026.04.14
tags: 
  - Android
  - Amper
categories: 
  - Android
---

# 用Amper构建安卓应用，而不是Gradle

![icon](/用Amper构建安卓应用而不是Gradle/icon-20260414225903-fexzpe7.svg)

Amper 是一个用于 Kotlin 和 Java 语言的实验性构建工具，专注于用户体验和工具功能。

JetBrains推出的轻量构建工具

官网  
​[`https://github.com/JetBrains/amper`](http://amper.org/latest/user-guide/dependencies/#adding-repositories)​

​[`http://amper.org/`](http://amper.org/latest/user-guide/dependencies/#adding-repositories)​

‍

对比gradle可以说及其简洁高效

并且我们使用`IntelliJ IDEA`进行编写构建，而不是`Android Studio`​

​

## IDE配置

下载并启用Amper插件

![b9ba16335ea953e9](/用Amper构建安卓应用而不是Gradle/b9ba16335ea953e9-20260414225940-80p1t23.png)

‍

## 创建项目

创建一个`空项目`​

![f69646930f959166](/用Amper构建安卓应用而不是Gradle/f69646930f959166-20260414230046-weheg75.png)

新建`Amper模块文件`​

![image](/用Amper构建安卓应用而不是Gradle/image-20260414230219-jtqlbmd.png)

选择`Android应用`​

![image](/用Amper构建安卓应用而不是Gradle/image-20260414230247-hu7tad2.png)

打开`module.yaml`文件，光标来到黄色波浪线的位置悬停，可以看到ide提示`创建源文件夹和测试文件夹`，我们单击它

![image](/用Amper构建安卓应用而不是Gradle/image-20260414230335-379n9yh.png)

ide帮我们创建了两个文件夹

![aac87a71ec9a5a48](/用Amper构建安卓应用而不是Gradle/aac87a71ec9a5a48-20260414230551-yq08uen.png)

在src中创建一个kotlin文件`MainActivity.kt`​

![image](/用Amper构建安卓应用而不是Gradle/image-20260414230647-7wobji9.png)

写入如下代码

```kt
package hello.world

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.safeContentPadding
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.ui.Modifier

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Button(modifier = Modifier.safeContentPadding(), onClick = {}) {
                Text("Hello")
            }
        }
    }
}
```

‍

同时也要在src中创建`AndroidManifest.xml`来声明Android的入口类，包名等信息

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application>
        <activity
                android:name="hello.world.MainActivity"
                android:theme="@android:style/Theme.Material.Light.NoActionBar"
                android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
    </application>
</manifest>
```

这样我们就完成了完整的项目编写。

‍

## 构建

为了能够使用amper构建

我们来到module.yaml

点击下载Amper包装器

![f5d9aadfdf724dd1](/用Amper构建安卓应用而不是Gradle/f5d9aadfdf724dd1-20260414231002-t6kxkee.png)

会在项目中添加amper的构建脚本

![69ea956bc713c990](/用Amper构建安卓应用而不是Gradle/69ea956bc713c990-20260414231044-1y009ro.png)

然后点击**​`Runzo`​**​

> ​**​`Runzo`​**是IntelliJ IDEA's 25周年的吉祥物，是Run按钮
>
> ![d2d54a1210b2275f](/用Amper构建安卓应用而不是Gradle/d2d54a1210b2275f-20260414232935-6bnxxyy.png)​

![fc8bfae6d0b4f393](/用Amper构建安卓应用而不是Gradle/fc8bfae6d0b4f393-20260414232257-uvpebsp.png)

第一次运行要下载一些依赖，需要耐心等待(注意网络环境)

‍

运行成功后可以看到效果

![2c24daf3897df0a6e9a811f7dd687cbf](/用Amper构建安卓应用而不是Gradle/2c24daf3897df0a6e9a811f7dd687cbf-20260414233115-mv481g4.jpg)​

‍

## 项目结构

我们也可以直接创建各种安卓会用到的项目目录

​`assets`，`res`等等，直接放在根目录即可

![e4bc0089f4718b3d](/用Amper构建安卓应用而不是Gradle/e4bc0089f4718b3d-20260414233314-g3oudre.png)

‍

## 项目配置

项目配置非常的清晰

![f9efc06363b0b086](/用Amper构建安卓应用而不是Gradle/f9efc06363b0b086-20260414233952-x2tmbi1.png)

第一行`product: android/app`表明这是安卓项目

​`dependencies:`依赖项

$开头是名称映射（可以理解成别名）

可以在根目录创建`libs.versions.toml`来定义这些别名

> 例子：
>
> ​`libs.versions.toml`​
>
> ```
> [versions]
> ktor = "3.3.2"
>
> [libraries]
> ktor-client-auth = { module = "io.ktor:ktor-client-auth", version.ref = "ktor" }
> ktor-client-cio = { module = "io.ktor:ktor-client-cio", version.ref = "ktor" }
> ktor-client-contentNegotiation = { module = "io.ktor:ktor-client-content-negotiation", version.ref = "ktor" }
> ```
>
> ​`module.yaml`​
>
> ```
> dependencies:
>   - $libs.ktor.client.auth
>   - $libs.ktor.client.cio
>   - $libs.ktor.client.contentNegotiation
> ```

最后的`settings`就是配置信息

可以指定安卓编译sdk版本，命名空间，kotlin版本，jvm版本，compose支持等

具体更多配置可以去官网教程[`http://amper.org/latest/user-guide/dependencies/#adding-repositories`](http://amper.org/latest/user-guide/dependencies/#adding-repositories%E2%80%8B)​

‍

## 小结

截至2026/4/14，Amper还有很多问题没有解决，不过Amper的开发者们目前在非常积极的解决各种问题，大家也可以在YouTrack上提交你的问题（注意不是Github Issue），`https://youtrack.jetbrains.com/issues?q=%7BAmper%7D`​

‍

作为一个新的构建框架，目前还是非常好用轻量的，在开始写新的Kotlin/Java项目时，可以优先考虑Amper

让开发者更专注于重要的代码部分，更少的在配置上花费时间。

‍

‍
