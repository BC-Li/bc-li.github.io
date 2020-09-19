---
title: Build your repo with Tarvis CI. 
layout: single
category: blog
header:
  overlay_image: /assets/images/coding.jpg
author_profile: true
toc: true
---
Build your repo automatically with Tarvis CI. 

## What is Tarvis CI?

> **Travis CI** is a hosted[[2\]](https://en.wikipedia.org/wiki/Travis_CI#cite_note-2) [continuous integration](https://en.wikipedia.org/wiki/Continuous_integration) service used to build and test software projects hosted at [GitHub](https://en.wikipedia.org/wiki/GitHub)[[3\]](https://en.wikipedia.org/wiki/Travis_CI#cite_note-3) and [Bitbucket](https://en.wikipedia.org/wiki/Bitbucket).[[4\]](https://en.wikipedia.org/wiki/Travis_CI#cite_note-4)
>
> Travis CI provides various paid plan for private projects, and a free plan for open source. TravisPro provides custom deployments of a proprietary version on the customer's own hardware.
>
> The source is technically [free software](https://en.wikipedia.org/wiki/Free_software) and available piecemeal on GitHub under permissive licenses. The company notes, however, that the large number of tasks that a user needs to monitor and perform can make it difficult for some users to successfully integrate the Enterprise version with their own infrastructure.

## Getting Started

1. Register in Tarvis CI with your GitHub account and migrate your repos in GitHub with Tarvis CI.
2. Push an **runnable** .tarvis.yml to your repo
3. Find your repo in Dashboard and trigger a build.
4. Wait until it finish building and it's done! you'll get something like this: [![Build Status](https://travis-ci.com/BC-Li/bc-li.github.io.svg?token=Yyg3baLESvJZxgyG1jBY&branch=master)](https://travis-ci.com/BC-Li/bc-li.github.io)
5. Further usage for Tarvis CI, I may update them in near future as soon as I get enough time for it.

## My .tarvis.yml for This Site

```yaml
language: ruby
cache: bundler
sudo: false

script: bundle exec jekyll build
```

The .tarvis.yml is like something you need the remote Ubuntu server to do. Write your commands which you basically wrote in Bash or Terminal or something else in **script** above, and the server will automatically run your commands.

`inspired by an iBug's post.Thanks! ` 