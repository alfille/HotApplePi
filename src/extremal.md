# Extremal

## What end curve gives us the maximum volume?

[We know that](volume.html)

\\[Volume=4\times\int\_0\^1 \hat{f}(\sigma)\\,\lbrace\hat{L}-\hat{f}(\sigma)\rbrace\\,\sqrt{1-{\hat{f'}(\sigma)}\^2}\\,d\sigma\\]

To find an optimal function is a classic problem in [calculus of variations](https://en.wikipedia.org/wiki/Calculus_of_variations)

Call our function \\(F(f,f')\\), We'll simplify \\(\hat{f}\rightarrow f\\) for this analysis.

\\[F(f,f')=f(s)\\,\lbrace L-f(s)\rbrace\\,\sqrt{1-{f'(s)}\^2}\\]

This is solved by the *Euler-Lagrange Equation*:

\\[\frac{\partial F}{\partial f}-\frac{d}{ds}\frac{\partial F}{\partial f'}=0\\]

Because \\(F\\) is not a function of \\(s\\) we can use the *Beltrami identity*:

\\[F-f' \frac{\partial F}{\partial f'}=C, \quad C \text { is a constant}\\] 

Using our formula for \\(F\\):

\\[f\times (L-f) = C\sqrt{1-{f'}\^2}\\]
\\[1-\frac{f\^2{(L-f)}\^2}{C\^2}={\frac{df}{ds}}\^2\\]
\\[\frac{df}{ds}=\sqrt{1-\frac{f\^2{(L-f)}\^2}{C\^2}}\\]

Not that easy to solve, but since \\(f'<1\\), \\(0 \leq \frac{f\^2{(L-f)}\^2}{C\^2}<1\\) or \\(f\times(L-f)<C\\)
