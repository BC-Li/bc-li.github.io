---
title: Openpose 配置小记
layout: single
category: cn
header:
  overlay_image: /assets/images/openpose.jpg
author_profile: true
toc: true
---
记录了一点 Openpose 的配置过程及踩过的坑

Ubuntu 对于 NVIDIA 显卡驱动的支持程度差得超乎我的想象，所以下次掉驱动我可能不会像现在这样挣扎了好几周才选择重装 Ubuntu，而是直接插上我的启动盘（可以，不和他多 BB ---某主播）

[这是具体的安装教程](https://blog.csdn.net/qq_35468937/article/details/81514198#t27)，照着走就可以，十分详细，不过里面的一些坑还是很闹心的。

* CMake 版本不要按这个来，否则会出现报错：NOTFOUNDCUDA_cublas_device_LIBRARY。
   [解决方案]( https://blog.csdn.net/DumpDoctorWang/article/details/89644762)
  如果你安装了旧版的 CMake，那就直接删掉旧的重装一下就可以了，软连接之后 CMake - gui就能进入 gui 界面，不要安装 CMake-QT-gui ，那个是旧版的。

* CUDA9 最多支持到 Ubuntu 16 ，没有 Ubuntu 1804 的 deb 包 / Run File
 解决方案：实测 CUDA 10 也可以正常跑，不过，跑别的项目可能会崩，照我来讲，我可能会选择再次重装系统。  （我的配置是 i7 - 9750H + GTX 1650 )

* 如果你选择了 BUILD-PYTHON, 不事先 clone 一个 Pybind 肯定出错。因为 git clone 下来的仓库： 3rdparty 文件夹是**空的**。（我怎么知道为什么

* 不要用 Ubuntu 的自动更新
    **别问我是怎么知道的。**  Update: **因为内核会自动更新，导致 gcc 版本出错，后续降级相当麻烦。**

* 更多的稀奇古怪的 BUG，建议学会看错误信息而不是复制粘贴一堆没用的 log 在百度上，能搜到才见鬼。

* 复制粘贴类似环境变量 EXPORT 的时候，看准了里面要填写你自己的路径，复制别人的路径没用...

* 多 **Google** ，百度 / CSDN 能用，但挺差劲的。

  

  其实我是还能写更多的，但是现在太忙了，下周还会有代数结构的小测，需要复习。 
  这次用 4.5h 把整个过程又重走了一遍，比刚开始花 10 天只搞一个这种没什么技术含量的东西强多了。 
  可能带给我的唯一收获是少到可怜的 Linux 基本操作技巧和 **好脾气** 。
  不过有了好脾气很多东西不就很好解决了嘛 2333 
  哦，还有我打字的速度明显增快了（刚开始都不知道 Shift + Ctrl + C / V 是 Linux 下的复制粘贴，手打了不知道多少命令）。有时间考虑搞个机械键盘（搞不好会被室友打哦...）

  2020.6 Update: 机械键盘安排上了，不过是号称**最没声音**的静音红轴... 其实相比薄膜键盘，用力打字声音还是相当大的。