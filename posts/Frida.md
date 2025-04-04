---
title: Frida安卓Java层学习
description: Frida安卓Java层学习
date: 2025.02.28
tags: 
  - CTF
  - Re
  - Android
  - Frida
categories: 
  - CTF
---

# Frida安卓Java层

先把frida server放在手机/data/local/tmp下面

777权限执行

​`frida-ps -U`​查看所有进程

​`frida -U -f 包名 -l .\脚本.js`​

‍

## 方法替换

```javascript
Java.perform(function() {

  var <class_reference> = Java.use("<package_name>.<class>");
  <class_reference>.<method_to_hook>.implementation = function(<args>) {

    /*
      OUR OWN IMPLEMENTATION OF THE METHOD
    */

  }

})
```

ps

```javascript

Java.perform(function() {
    let MainActivity = Java.use("com.ad2001.frida0x1.MainActivity");
    MainActivity["check"].overload("int","int").implementation = function (i, i2) {
        console.log(`MainActivity.check is called: i=${i}, i2=${i2}`);
        this["check"](i, i*2+4);
    };
});
```

‍

## 参数替换

```javascript
a.check.overload(int, int).implementation = function(a, b) {

  ...

}
```

ps

```javascript

Java.perform(function() {
    let MainActivity = Java.use("com.ad2001.frida0x1.MainActivity");
    MainActivity["check"].overload("int","int").implementation = function (i, i2) {
        console.log(`MainActivity.check is called: i=${i}, i2=${i2}`);
        this["check"](i, i*2+4);
    };
});
```

‍

## 在运行时调用静态函数

在`frida -U -f com.ad2001.frida0x2`​进入页面后

```javascript

Java.perform(function() {
    var a = Java.use("com.ad2001.frida0x2.MainActivity");
    a.get_flag(4919);  // method name

})
```

‍

## 改变值

```javascript
Java.perform(function (){

    var <class_reference> = Java.use("<package_name>.<class>");
    <class_reference>.<variable>.value = <value>;

})
```

ps

```javascript
Java.perform(function (){

    var a = Java.use("com.ad2001.frida0x3.Checker");  // class reference
    a.code.value = 512;

})
```

‍

## 调用非静态方法/未加载的库

多了一步`class.$new()`​

‍

```javascript
Java.perform(function() {

  var <class_reference> = Java.use("<package_name>.<class>");
  var <class_instance> = <class_reference>.$new(); // Class Object
  <class_instance>.<method>(); // Calling the method

})
```

ps

```javascript
Java.perform(function() {

  var check = Java.use("com.ad2001.frida0x4.Check");
  var check_obj = check.$new(); // Class Object
  var res = check_obj.get_flag(1337); // Calling the method
  console.log("FLAG " + res);

})
```

‍

## 提供上下文主线程上并且 处于活动状态`Looper`​

```javascript
Java.performNow(function() {
  Java.choose('<Package>.<class_Name>', {
    onMatch: function(instance) {
      // TODO
    },
    onComplete: function() {}
  });
});
```

ps

```javascript
Java.performNow(function() {
  Java.choose('com.ad2001.frida0x5.MainActivity', {
      onMatch: function(instance) { // "instance" is the instance for the MainActivity
        console.log("Instance found");
        instance.flag(1337); // Calling the function
    },
    onComplete: function() {}
  });
});
```

‍

## 传入一个类

```javascript
Java.performNow(function(){
    Java.choose("com.ad2001.frida0x7.MainActivity", {
        onMatch: function(instance) {
            let Checker = Java.use("com.ad2001.frida0x7.Checker");
            var checks = Checker.$new(999,999)//如果有初始化函数
            // checks.num1.value = 1234;
            // checks.num2.value = 4321;
            instance.flag(checks);//传类

        
        },
        onComplete: function() {

        }
    })
  

})

```

‍

## 动态加载dex

```javascript

    Java.perform(function(){
        Java.enumerateClassLoaders({
           onMatch:function(loader){
                try{
                    if(loader.loadClass("com.alexw.app")){
                        Java.classFactory.loader=loader;
                        var app=Java.use("com.alexw.app");
                        console.log(app);
                        app.sayHello.implementation=function(){
                            return "bye";
                        }
                    }catch(error){

                    }
                },
                onComplete:function(){

                }
           }
        });
    });
```



## 在主线程上运行

```javascript
Java.perform(function() {
    Java.choose("com.ad2001.frida0x1.MainActivity", {
        onMatch: function(instance) {
            console.log("[+] 找到MainActivity实例");
            
            // 重要：确保在主线程上调用check方法
            Java.scheduleOnMainThread(function() {
                try {
                    console.log("[+] 尝试在主线程调用check方法");
                    instance.check(0, 4);
                    console.log("[+] 调用成功");
                } catch (e) {
                    console.log("[-] 调用check失败: " + e);
                }
            });
        },
        onComplete: function() {
            console.log("[+] 实例搜索完成");
        }
    });
})
```


