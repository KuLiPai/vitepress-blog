---
title: Compose学习总结
description: Compose学习总结
date: 2026.01.01
tags: 
  - Compose
  - Android
categories: 
  - Android
---

# Compose学习总结

“compose即将成为安卓开发主流框架”，这是2025谷歌IO开发者大会给我带来的感受，KMP热潮即将来了，腾讯也使用类似的技术实现的kotlin跨平台，直接跨微信/支付宝小程序，安卓，ios，mac，win，网页，鸿蒙。非常的夸张啊，上次这么说的还是uniapp和flutter，由于本人喜欢kotlin语法设计，所以还是先认真学习了一下compose安卓。

‍

先讲讲感受

我是从xml时代过来的开发者，刚接触compose觉得不太适应，具体来说就是各种操作都改变了，代码和布局写一起，不能id绑定设置属性，而是定义一个变量，改变这个变量同时布局跟随改变，非常先进的想法，需要隐藏控件，一个if就搞定，控件`view`也改名叫组合`Compose`了，使用了kotlin的DSL特性，写布局任然保持着简便，层次关系明确的感觉。

举个例子

xml的text

```xml
<Text
	android:text="111"
	android:width="match"
	android:height="match"/>
```

‍

compose一行解决

```kt
Text("111",modifier = Modifier.fillMaxSize())

```

‍

虽然但是，compose也要学习各种kotlin流，viewModel，路由等概念

变量通过一个remember记住，用于实时更新ui，

要共享数据要viewModel加冷流提供

要多页面需要路由

‍

‍

so，初学者一上手非常容易把代码写成石山，

路由怎么管理，哪来需要viewModel，compose怎么组合，context怎么管理等等问题。

‍

这里我分享一种我总结下来的一种我认为比较好的代码架构。

符合MAD架构

> MAD，全称Modern Android Development。融合了MVVM和MVI架构，或者说Compose模糊了MVVM和MVI的界限
>
> MVVM，全称Model-View-ViewModel
>
> MVI，全称Model-View-Intent
>
> 都是是一种将ui和业务逻辑分离的架构

‍

‍

文件目录大概是

```kt
/app
	/App.kt          # Application
/ui
	/components      # 通用的组件
		/TopBar.kt
		...
	/theme           # 主题
		/Color.kt
		/Theme.kt
		...
	/screens         # 页面
		/home
			/HomeScreen.kt
			/HomeViewModel.kt
		...
	
/core                # 核心功能
	/di              # 注入
		/AppModel.kt
	/common          # 通用扩展函数
		/Result.kt
	/network         # 网络
	...

/data                # 负责数据的获取和存储
	/repository
		/UserRepository.kt

```

‍

我在使用这个架构遇到过一些问题

1.我以前可能常用Util类来放这种工具函数，非常方便，为什么现在没有了？

现在非常不推荐Util，而应该尽可能分类实现清晰结构和可复用，Util可以认为是垃圾桶，任何函数都可以放进去，其含义及其不清晰。

‍

2.Screen和ViewMode怎么协调？

Screen基本只包含ui代码

基本所有业务逻辑都写在ViewMode里，

ViewMode定义一些StateFlow类型在内部修改，Screen使用这些StateFlow更新ui

ViewMode的`获取数据`部分来自Repository

> 这里获取数据包括多种：网络数据，文件数据，系统信息，蓝牙等

这里他们三我是通过`依赖注入`完美获取调用的

> 依赖注入：后勤主管，各种需要的东西自动提供，直接用就行
>
> 大致就是原本每次用都要初始化new的类方法，依赖注入帮我们自动找到了他们初始化要用的数据，提取创建好，用的时候直接提供实例。

‍

这里还有个单向数据流的概念，就是**状态（State）向下流动，事件（Event）向上流动**

我第一次听到这个基本完全没懂

其实不难理解

首先这个上下分别是什么：

```c
ViewModel (上)
View （下)
```

StateFlow只能由ViewModel传给View使用

而点击事件等只能由View调用ViewModel的函数通知ViewModel

‍

为了实现这个效果

一般在ViewModel状态声明上多了一步

```kt
private val _uiState = MutableStateFlow(NewsUiState())
val uiState: StateFlow<NewsUiState> = _uiState.asStateFlow()
```

可能第一次看到这个感觉完全是多此一举

一个私有的可变StateFlow，和一个公开的不可变StateFlow

但是就是这样保证了这个StateFlow只会下流，不会上流（View中无法更改）

如果想要更改呢，只能在ViewModel中写给事件（Event）函数，从下游View调用事件函数通知ViewModel修改它

‍
