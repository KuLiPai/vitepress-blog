---
title: Hello, Syntax!
description: Hello, Syntax!
date: 2025.4.27
tags: 
  - Syntax
categories: 
  - Syntax 
---

## Lua

### 1省略()
Lua中如果函数调用只有一个实参且为表或字符串时，传参可以省略()
```Lua
print "Hello, World"

f {1,2,3}
```


### 2标签
大部分语言的标签Label都是`Label:`这种语法
lua是`::Label::`,使用`goto`跳转

### 3自己调自己
函数的第一个参数是自己可以用:调用
```lua
A = {
    a = "1",
    func = function(self,value)
        return self.a + value
    end
}

-- 下面两种方法等效
A.func(A,1)

A:func(1)
```

### 4注释
众所周知Lua的多行注释是--[[ ... ]],--[=[]=],--[==[]==]，...以此类推
这里有个快速取消注释的方法
```Lua
--一般的注释
--[[
    print"hi"
]]

--便于取消的注释
--[[
    print"hi"
--]]

--只需在注释第一行加--就可以注释掉注释，注释末尾也被自动注释掉了
----[[
    print"hi"
--]]

```

## LuaJ++
一个非常好玩的Androlua编辑器中魔改的lua语法https://github.com/znzsofficial/NeLuaJ

### 省略then
```lua
-- no
if a then
end

-- yes
if a
end
```

### 省略do
```lua
-- no
while true do end
-- yes
while true 
end
```

### 省略in
```lua
-- no
for i in pairs({1,2,3)} do
    print(i)
end

-- yes
for i pairs({1,2,3})

end

```

### 省略function
```lua
-- no
function a()

end
-- yes
a()

end

```

### ?操作符
```lua
a = true
-- no
if a == true then
    print(1)
else
    print(0)
end

-- yes
?a print(1)`print(0)
```

### 三目运算
```lua
b = if a 1 else 2
```

### lambda
```lua
lambda a,b->a+b 

lambda a,b=>print(a+b)

lambda a,b:print(a+b)

lambda () -> print(1)
-- lambda可用\代替
\ () -> print("1")
```

## Python
### 拆包赋值
```python
*a,="abc"
print(a)

# ['a','b','c']
```

## Regular
### `^.?$|^(..+?)\1+$`匹配素数
```python
import re

a = 17

print(not re.match(r'^.?$|^(..+?)\1+$','1'*n))
```


..............................
