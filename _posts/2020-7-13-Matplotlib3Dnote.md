---
title: Matplotlib 3D Toolkit Note
layout: single
category: Coding
header:
  image: /assets/images/mat.jpg
author_profile: true
toc: true
---
This note is for the mini project named "n-body simulation" in Computer Programming II in 2020 Spring.

## Getting Started

We need 2 apis for the project:

* matplotlib.animation
* matplotlib.mplot3d

## Matplotlib.animation tutorial

We may need matplotlib.animation.FuncAnimation to start.

`*class* `matplotlib.animation.FuncAnimation`(*fig*, *func*, *frames=None*, *init_func=None*, *fargs=None*, *save_count=None*, ***, *cache_frame_data=True*, ***kwargs*)`

This function mainly makes an animation by repeatedly calling a function func.

For the parameters I decide to just use the official document here.

* fig: Figure

  this "figure object" should be the one that we need to use.

* func: callable

  The function to call at each frame. The first argument will be the next value in *frames*. Any additional positional arguments can be supplied via the *fargs* parameter.

* frames: the total length in your animation. For example: 100 (it means the whole procedure runs 100 times and it puts out 100 pics.)

* init_func: the initial pic of your animation.

* interval: input how long you want the time between 2 frames be. For example: 20 (ms).

* blit: True / False : choose if you want to update the whole page every frame. There may be a bug in mac platform so you need to set it to **False**. (It doesn't work in my Windows 10 laptop either. so I set it to False too.)

To be continued...