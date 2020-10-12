---
title: Centre of trees
layout: single
category: blog
header:
  overlay_image: /assets/images/2.jpg
author_profile: true
---
This is the proof by [**Namita Tiwari**](https://namitatiwari.org/author/scholornamita/). Thanks!!!

**Theorem: Prove that every tree T has either one or two centers.**

**Proof:** We will use one observation that the maximum distance max d(v,w) from a given vertex v to any other vertex w occurs only when w is pendant vertex.

Now, let T is a tree with n vertices (n>=2)

⇒T must have atleast two pendant vertices.

delete all pendant vertices from T, then resulting graph T’ is still a tree.

⇒ eccentricity E(v) in T’ is just one less than E(v) in T ∀ v in T’

again delete pendant vertices from T’ so that resulting T” is still a tree with same centers.

Note that all vertices that T had as centers will still remain centers in T’–>T”–>T”’–>..

continue this process untill remaining tree has either one vertex or one edge.

So at the end, if one vertex is there this implies tree T has one center.

If one edge is there then tree T has two centers.

end of proof.

Result: If a tree has two centers then these two centers must be adjacent.