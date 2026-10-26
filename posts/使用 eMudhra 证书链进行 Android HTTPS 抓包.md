---
title: 使用 eMudhra 证书链进行 Android HTTPS 抓包
description: 使用 eMudhra 证书链进行 Android HTTPS 抓包
date: 2026.10.26
tags: 
  - Android
  - 抓包
  - eMudhra
categories: 
  - Android
---

> 本文只适用于自己拥有或明确获准测试的设备、应用和网络。

## 测试设备是否仍信任该证书链

先访问：<https://emudhra.we-have-a-problem.com/>

如果中招了那么恭喜你，可以免root抓https包了。没中招也没关系，有可能只是浏览器应用修复了漏洞，也可以继续试试其他应用。

![eMudhra](/使用eMudhra证书链进行AndroidHTTPS抓包/image.png)

> 印度 CA eMudhra 的八个中间证书私钥曾被公开。相关私钥非常简单，公开分析显示其中包括数字 4、56、115、66、155、156、230 和 237。攻击者可以利用这些私钥为任意域名制作证书。Chrome、Apple、Microsoft 和 Mozilla 随后陆续屏蔽了相关证书。发布时请补充对应年份，并为每个日期添加官方公告链接。

## 准备工作

- 一台用于测试的 Android 手机
- 一台电脑
- 一个可让手机和电脑互相访问的 Wi-Fi 网络

手机和电脑需要连接到同一网络。

## 工具获取

[mitmproxy](https://www.mitmproxy.org/) 用于建立代理并动态签发测试证书。

## 步骤

### 1. 获取电脑的局域网 IP

在电脑上执行：

```bash
ip -4 addr show | grep inet
```

示例：

```text
inet 127.0.0.1/8 scope host lo
inet 10.109.88.131/24 brd 10.109.88.255 scope global dynamic noprefixroute wlan0
```

这里应选择实际 Wi-Fi 网卡（例如 `wlan0`）的地址，也就是示例中的 `10.109.88.131`。不要选择 `127.0.0.1`、Docker 网卡或 VPN 网卡地址。

### 2. 设置手机 Wi-Fi 代理

在手机当前 Wi-Fi 的代理设置中选择“手动”：

- 代理主机名：电脑的局域网 IP，例如 `10.109.88.131`
- 代理端口：`8080`

如果改用其他端口，后面的 mitmproxy 命令也要同步修改。

![手机 Wi-Fi 代理设置](/使用eMudhra证书链进行AndroidHTTPS抓包/Screenshot_20261026-050255.png)


### 3. 启动 mitmweb

在电脑上运行：

```bash
.venv/bin/mitmweb \
  --emudhra \
  --listen-port 8080 \
  --set block_global=false \
  --web-port 8081 \
  --set connection_strategy=lazy
```

参数说明：

- `8080` 是手机使用的 HTTP(S) 代理端口。
- `8081` 是本机 mitmweb 管理界面，只绑定到 `127.0.0.1`。
- `connection_strategy=lazy` 会在客户端真正发送请求后再连接上游，调试连接失败时更容易观察行为。
- `block_global=false` 只控制 mitmproxy 的全局地址阻断规则，与客户端是否信任证书无关。

启动后会看到类似输出：

```text
HTTP(S) proxy listening at *:8080.
Web server listening at http://127.0.0.1:8081/?token=...
```

在电脑浏览器中打开：

```text
http://127.0.0.1:8081/#/flows
```

如果只需要保存流量、不需要 Web 界面，也可以使用：

```bash
.venv/bin/mitmdump \
  --emudhra \
  --listen-port 8080 \
  --set block_global=false \
  -w /tmp/cap.mitm
```

## 验证代理实际发送的证书

可以从电脑通过代理访问一个 HTTPS 域名：

```bash
echo | openssl s_client \
  -proxy 127.0.0.1:8080 \
  -connect www.bing.com:443 \
  -servername www.bing.com \
  -showcerts 2>/dev/null | \
  grep -E "^ *[0-9]+ s:|^ *i:"
```

正常情况下，叶子证书的 issuer 应该类似：

```text
i:C=US, O=eMudhra Inc, CN=EM OV TLS CA - G3C
```

这只能证明 mitmproxy 正在发送 eMudhra 链，不能保证所有手机应用都会接受它。


## 常见问题

总结一下作者遇到的一些小问题。

校准手机时间

手机时间必须正确。mitmproxy 会根据电脑当前时间生成证书，如果手机时间落后太多，手机会认为代理证书尚未生效。

本次排查中，电脑时间是 `2026-10-26`，而手机时间是 `2026-09-07`。代理证书的起始时间类似：

```text
notBefore=Oct 24 15:26:20 2026 GMT
```

因此手机会在 TLS 握手阶段拒绝证书，mitmproxy 中可能只看到：

```text
Client TLS handshake failed
certificate unknown
```

修改时间后，强制停止并重新打开目标应用，避免旧的 TLS 连接继续复用。


## 附件

### emudhra-root-aaa.p12

PKCS#12 容器

password: emudhra

[https://drive.google.com/file/d/10hrQLrsVzzj9MhgkE_D-J1QSSbwzRVIn/view?usp=sharing](https://drive.google.com/file/d/10hrQLrsVzzj9MhgkE_D-J1QSSbwzRVIn/view?usp=sharing)


### EM\_OV\_TLS\_CA.zip

签发密钥集合

[https://drive.google.com/file/d/1smCvG5xuO4I-jQYSn76tlM72MInvbZ1V/view?usp=sharing](https://drive.google.com/file/d/1smCvG5xuO4I-jQYSn76tlM72MInvbZ1V/view?usp=sharing)
