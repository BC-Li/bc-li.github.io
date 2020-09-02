---
title: Git Commands
layout: single
category: cn
header:
  overlay_image: /assets/images/git.jpg
author_profile: true
toc: true
---
常用的一点 Git 操作

<!-- more -->

1.创建仓库及push操作  
创建操作在github desktop/github网页上执行

在本地上用git bash cd到指定的文件夹，  

`git clone https://.... . ...git`

创建文件夹之后第一次提交需要进行的操作：  

* 把自己要push的文件放进文件夹

* 依次执行命令
  `git add .`
  `git commit -m "first commit"`
  `git push u origin master`
  会提示输入ssh密码/github用户名，密码，输入即可  

第二次及以后的操作只需修改本地仓库的文件之后

`git push`

即可。

3.2.其他的git命令：

` git init                    #把当前目录变成git可以管理的仓库`

` git add readme.txt          #添加一个文件，也可以添加文件夹`

` git add -A                  #添加全部文件`

` git commit -m "some commit" #提交修改`

` git status                  #查看是否还有未提交`

` git log                     #查看最近日志`

` git reset --hard HEAD^      #版本回退一个版本`

` git reset --hard HEAD^^     #版本回退两个版本`

` git reset --hard HEAD~100   #版本回退多个版本`

` git remote add origin +地址  #远程仓库的提交（第一次链接）`

` git push -u origin master   #仓库关联`

` git push                    #远程仓库的提交（第二次及之后）`