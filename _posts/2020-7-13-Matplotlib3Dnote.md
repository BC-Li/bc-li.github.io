---
title: Matplotlib 3D Toolkit Note
layout: single
category: coding
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
```python
*class* matplotlib.animation.FuncAnimation (*fig*, *func*, *frames=None*, *init_func=None*, *fargs=None*, *save_count=None*, ***, *cache_frame_data=True*, ***kwargs*)
```

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

The main idea of this is to successfully make the **func**. A sample is given below:

```python
def animate(i):
    line.set_ydata(np.sin(x + i / 50))  # update the data.
    return line,
...

ani = animation.FuncAnimation(
    fig, animate, interval=20, blit=True, save_count=50)

plt.show()
```

Another sample is also here:

```python
def update_lines(num, data_lines, lines):
    for line, data in zip(lines, data_lines):
        # NOTE: there is no .set_data() for 3 dim data...
        line.set_data(data[0:2, :num])
        line.set_3d_properties(data[2, :num])
    return lines
...

line_ani = animation.FuncAnimation(
    fig, update_lines, frames=50, fargs=(data, lines), interval=50)

plt.show()
```

Then you can figure out the difference between them:

* There're differences in the parameters: in the first one `animate(i)` "i" plays the part of being a number in `np.sin( x + i / 50 )`. It's also the `frame`.

* In the second one the parameters `frame` is `num`. and the latter ones are the `*fargs` and you need to add them later in the `FuncAnimation`.

* Note that in the `func` the `line.set_data(data[0:2, :num])`, you need to write something to make the tuple add 1 element in every circulation so that you can get the animation running. Otherwise the animation may be just one frame and it won't move.

The final result may be something like this: [Animated 3D random walk](https://matplotlib.org/gallery/animation/random_walk.html) It's fantastic XD