---
title: Citespace 使用教程
layout: single
category: cn
header:
  overlay_image: /assets/images/citespace.jpg
author_profile: true
toc: true
---

Citespace: 一款文献可视化分析软件

## CiteSpace的安装

### 需要准备
* JDK(Java Development Kit)
#### JDK 的下载，安装与配置

点这里：[JDK 14 Windows 64位 下载](https://download.oracle.com/otn-pub/java/jdk/14.0.1+7/664493ef4a6946b186ff29eb326336a2/jdk-14.0.1_windows-x64_bin.exe?AuthParam=1592660646_787c6ea7e3b6a901c5315db3eaeeb8fa)
下载好之后点击下载好的安装包![image-20200620214548889](/assets/images/citespace/image-20200620214548889.png)
下一步：
![image-20200620214632131](/assets/images/citespace/image-20200620214632131.png)
记住 JDK 的安装路径，再进行下一步等待安装好即可。
#### JDK 环境变量的配置
如果是第一次安装 JDK ，是无法使用 Citespace 的。在使用之前需要进行环境变量的配置。
具体参考可以参考[这篇博文](https://www.cnblogs.com/cnwutianhao/p/5487758.html)，或[这篇博文](https://blog.csdn.net/qq_39720249/article/details/80721719)

当按快捷键 Win + R，输入“cmd”后输入"java"等命令输出正确之后证明环境变量已经配置好。
### Citespace 的安装

[Citespace 下载链接](http://cluster.ischool.drexel.edu/~cchen/citespace/download/)
在 SourceForge 平台上下载即可。
下载好之后解压到**英文目录**当中，如：

![image-20200620215824023](/assets/images/citespace/image-20200620215824023.png)

Windows 平台使用点击 StartCiteSpace_Windows.bat 。

![image-20200620220124997](/assets/images/citespace/image-20200620220124997.png)

输入所在地区（似乎1/2均可）并回车进入 Citespace 主页面。

![image-20200620220326241](/assets/images/citespace/image-20200620220326241.png)
点下方的 Agree 进入页面。

![image-20200620220416355](/assets/images/citespace/image-20200620220416355.png)


## CiteSpace的初步使用
### 前期准备
需要在一个**英文目录**下新建一个文件夹（例如：citespace_project )用于存储要处理的数据以及项目文件。
在这个文件夹里再创建四个空文件夹。如图所示：

![image-20200620220624634](/assets/images/citespace/image-20200620220624634.png)

### 数据收集
目前我操作过的平台有： WOS、知网。
#### 知网平台
进入知网搜索所需的关键词：![image-20200620221648158](/assets/images/citespace/image-20200620221648158.png)![image-20200620221825110](/assets/images/citespace/image-20200620221825110.png)
下载好以 TXT 格式结尾的文件将其放进上面4个文件夹中的“input”文件夹。并将文件更名为“download_**n**.txt”格式。其中**n**=1,2,3....

#### WOS 平台

![image-20200620222636511](/assets/images/citespace/image-20200620222636511.png)
在精炼检索结果之后进行导出。
![image-20200620222758025](/assets/images/citespace/image-20200620222758025.png)![image-20200620222902674](/assets/images/citespace/image-20200620222902674.png)
按照图中填写格式导出得到 TXT 文件。后续处理方式和知网数据一致。

> 注：如果文件名字错误可能造成无法识别。

### 数据导入

现在 input 文件夹中应该有类似于“download_n.txt"的文件了。
所以现在对其进行一下处理和导入。

在 Citespace 中选择 Data -> import/export ,如图所示

![image-20200620223438737](/assets/images/citespace/image-20200620223438737.png)
上图是知网的转换（选中上方的CNKI），指定好Input文件夹和output文件夹（刚开始建好的文件夹），点击 Convertion 即可得到转换好的文件。在output文件夹中把转换好的文件移动到 data 文件夹中即可。

WOS 的转换类似。

![image-20200620223957687](/assets/images/citespace/image-20200620223957687.png)
要把页面最大化！选中那个 remove duplicates 去除重复数据。

然后剩余的操作和知网相同。

### 数据分析

![image-20200620224134135](/assets/images/citespace/image-20200620224134135.png)

![image-20200620224331787](/assets/images/citespace/image-20200620224331787.png)

![image-20200620224532559](/assets/images/citespace/image-20200620224532559.png)
然后点 GO 就开始跑起来啦
之后可以点 Visualize，等待图形加载完成就可以了。

![image-20200620224852022](/assets/images/citespace/image-20200620224852022.png)
