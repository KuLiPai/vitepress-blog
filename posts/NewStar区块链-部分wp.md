---
title: NewStar区块链-部分wp
description: NewStar区块链-部分wp
date: 2025.10.31
tags: 
  - CTF
  - Web3
  - BlockChain
categories: 
  - CTF
---

# NewStar区块链-部分wp

## 区块链-以太坊的约定

> 题目内容：  
> 城邦附近开了一家存储链子的工坊，快来看看吧！
>
> 本题由多个小问题组成，得到各个小问题答案后用下划线"_"拼接即可
>
> 1.注册小狐狸钱包，并提交小狐狸钱包助记词个数
>
> 2.1145141919810 Gwei等于多少ETH （只保留整数）
>
> 3.查询此下列账号第一次交易记录的时间，提交年月日拼接，如20230820
>
> 0x949F8fc083006CC5fb51Da693a57D63eEc90C675
>
> 4.使用remix编译运行附件中的合约，将输出进行提交
>
> ```sol
> // SPDX-License-Identifier: MIT
> pragma solidity ^0.8.0;
>
> contract SimpleOperation {
>     function getResult() public pure returns (string memory) {
>         uint a = 10;
>         uint b = 5;
>         uint sum = a + b;
>         uint product = a * b;
>         if (sum > product) {
>         }
>         return "solidity";
>     }
> }
> ```

1.`12`​

2. 1ETH=10^9 Gwei = 10 ^ 18 wei

​`1145`​

3.搜了一下发现是测试链交易链sepolia.etherscan.io![image](/image-20251027202850-kosyht0.png)

​`20240614`​

4.`solidity`​

‍

‍

## 区块链-智能合约

审计合约调用unlock传入0x0721然后调用getFlag即可

> 理论直接读取0槽位也行，但是这里给的代码和部署的合约不一致

```sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleVault {
    string private flag = "flag{fake_flag}";
    uint256 private password = 0x0721;

    // 使用映射来记录每个地址的解锁状态
    mapping(address => bool) public unlocked;

    function unlock(uint256 _password) external {
        // 检查当前调用者是否已经解锁，如果已经解锁，则无需再次操作
        require(!unlocked[msg.sender], "Already unlocked!");
        if (_password == password) {
            // 只修改当前调用者（msg.sender）的解锁状态
            unlocked[msg.sender] = true;
        }
    }

    function getFlag() external view returns (string memory) {
        // 检查当前调用者是否已解锁
        require(unlocked[msg.sender], "Vault is locked. Unlock it first!");
        return flag;
    }
}
```

先调用unlock

![image](/image-20251027205112-ed859zc.png)然后调用getFlag

![image](/image-20251027205254-w8wb155.png)

‍

## 区块链-INTbug

```sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleOverflowVault {
    string private flag = "flag{fake_fake_fake}";
    
    mapping(address => bool) public unlocked;
    mapping(address => uint256) public userPoints;
    uint256 public totalPoints;
    mapping(address => uint256) private userSpentPoints;
    
    event PointsAdded(address indexed user, uint256 points);
    event PointsUsed(address indexed user, uint256 points);
    
    constructor() {
        totalPoints = 0;
        userSpentPoints[msg.sender] = 1000;
    }
    
    function addPoints(uint256 points) external {
        require(points > 0, "Points must be greater than 0");
        
        if (userSpentPoints[msg.sender] == 0) {
            userSpentPoints[msg.sender] = 1000;
        }
        
        userPoints[msg.sender] += points;
        totalPoints += points;
        
        emit PointsAdded(msg.sender, points);
    }
    
    function usePoints(uint256 points) external {
        require(points > 0, "Points must be greater than 0");
        require(userPoints[msg.sender] >= points, "Insufficient points");
        
        if (userSpentPoints[msg.sender] == 0) {
            userSpentPoints[msg.sender] = 1000;
        }
        
        userPoints[msg.sender] -= points;
        
        unchecked {
            totalPoints -= points;
            userSpentPoints[msg.sender] -= points;
        }
        
        if (userSpentPoints[msg.sender] > 1000) {
            unlocked[msg.sender] = true;
        }
        
        emit PointsUsed(msg.sender, points);
    }
    
    function getFlag() external view returns (string memory) {
        require(unlocked[msg.sender], "Vault is locked. Trigger integer underflow first!");
        return flag;
    }
    
    function getSpentPoints() external view returns (uint256) {
        return userSpentPoints[msg.sender] == 0 ? 1000 : userSpentPoints[msg.sender];
    }
    
    function resetUser() external {
        uint256 userCurrentPoints = userPoints[msg.sender];
        
        if (userCurrentPoints > 0) {
            unchecked {
                totalPoints -= userCurrentPoints;
            }
            userPoints[msg.sender] = 0;
        }
        
        userSpentPoints[msg.sender] = 1000;
        unlocked[msg.sender] = false;
    }
}
```

这个区块链有点搞笑了，和上题不是一个人出的感觉

### 这里直接非预期了

直接读取0槽位，因为private是假私有，一切常量都在区块链上能看到

‍

​`cast storage 0xB6748b3B308b382E28438cc72872e2D70369D90b 0 --rpc-url $rpc`​

‍

​`cast to-ascii 0x666c61677b476f6f645f4e657753746172323032355f42796565656565217d3e `​

‍

![image](/image-20251027205930-karnjlm.png)

‍

### 用正常方法做一下

这个也是非常非常简单的审计

首先需要让unlocked[msg.sender]为true，只有在usePoints函数中有需要userSpentPoints[msg.sender] > 1000才行

其中这里还专门用unchecked ，

```sol
unchecked {
	totalPoints -= points;
	userSpentPoints[msg.sender] -= points;
}
```

因为^0.8.0有安全的类型，unchecked不检查溢出，userSpentPoints又是uint256类型直接无符号整数溢出

最终逻辑是`addPoints`传入大于10000的数

​`usePoints`传入大于10000小于刚刚传入的数的数

调用`getFlag`​

‍

![image](/image-20251027210611-x42y29p.png)

![image](/image-20251027210629-lnbdkcs.png)

![image](/image-20251027210643-f7c3v2x.png)
