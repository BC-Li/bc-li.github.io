---
title: Customize your site built on jekyll theme "Minimal Mistakes" 
layout: single
category: coding
header:
  overlay_image: /assets/images/2.jpg
author_profile: true
toc: true
---
Use your own CSS files to customize the site.

## Importing the CSS files

Read the documents and you'll find it's rather easy to use your own CSS. Go straight to `/assets/css/main.scss` . You can import them here.

For instance:

```scss
---
# Only the main Sass file needs front matter (the dashes are enough)
---

@charset "utf-8";

@import "minimal-mistakes/skins/{{ site.minimal_mistakes_skin | default: 'default' }}"; // skin
@import "minimal-mistakes"; // main partials

@import "minimal-mistakes/_custom"; // Your personal config on your site goes here and below
@import "minimal-mistakes/_landing";
```

And that's it. It's separate from the origin SCSS files and that means you **needn't** make any changes to core files of mmistakes.

## Making your own CSS files

## Use your customized files on a specific page

`Pending...`