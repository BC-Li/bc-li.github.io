---
title: CMakeList Usage and some must-handle Syntax
layout: single
category: blog
header:
  overlay_image: /assets/images/2.jpg
author_profile: true
toc: true
---
One good tutorial about CMake is [here](https://www.jetbrains.com/help/clion/quick-cmake-tutorial.html?gclid=CjwKCAjw5p_8BRBUEiwAPpJO6wA0sNaogIYJOqkuAeE_u6b45Oi8F6Vjgpk8AMOX9Qyby3xcK1pKDxoCrZYQAvD_BwE&gclsrc=aw.ds). You can also take the [official document](https://cmake.org/cmake/help/latest/) as a reference.

## What is CMake?

>[CMake](https://cmake.org/) is a meta build system that uses scripts called **CMakeLists** to generate build files for a specific environment (for example, makefiles on Unix machines). When you create a new CMake project in CLion, a **CMakeLists.txt** file is automatically generated under the project root.

So when you want to get CMake running you are required to handle some basic CMakeList syntax, which I'll show below.

## An example CMakeList.txt provided by JetBrains

```c
cmake_minimum_required(VERSION 3.13)  # CMake version check
project(simple_example)               # Create project "simple_example"
set(CMAKE_CXX_STANDARD 14)            # Enable c++14 standard

# Add main.cpp file of project root directory as source file
set(SOURCE_FILES main.cpp)

# Add executable target with source files listed in SOURCE_FILES variable
add_executable(simple_example ${SOURCE_FILES})
```
## Getting Started
We should know how to write a CMakeList before we can use CMake.
### Some CMakeList Syntax

| Command                                                      | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| cmake_minimum_required(VERSION 3.13)                         | Set the minimum version of CMake.                            |
| project(cmake_testcpp)                                       | Your project name, depending on the name you set at the very beginning. |
| set(CMAKE_CXX_STANDARD 14)                                   | Set the C standard to 14                                     |
| add_executable(cmake_testapp main.cpp test.cpp note.cpp .....) | Add your testcases executable target which will be built from main.cpp |
| aux_source_directory(. DIR_SRCS)                             | If you have too many source files, you can use this command to store all your files in one variable 'DIR_SRCS', and you can use it in `add_executable` command like this: `add_executable(cmake_testapp ${DIR_SRCS})`. |

### Compile

* Run `cmake .`in your project directory, and get your Makefile.
* Run `make`, and CMake will compile automatically.
* In Linux Terminal you can run command `./yourfile` to run your project.

