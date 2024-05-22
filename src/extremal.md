# Extremal

## What end curve gives us the maximum volume?

It's not obvious. Adding more height causes the ends to squeeze in.

[We know that](volume.html)

\\[Volume=4\times\int\_0\^1 \hat{f}(\sigma)\\,\lbrace\hat{L}-\hat{f}(\sigma)\rbrace\\,\sqrt{1-{\hat{f'}(\sigma)}\^2}\\,d\sigma\\]

To find an optimal function is a classic problem in [calculus of variations](https://en.wikipedia.org/wiki/Calculus_of_variations)

Call our function \\(F(f,f')\\), We'll simplify \\(\hat{f}\rightarrow f\\) for this analysis. (I.e. assume that we are using normalized variables throughout.)

\\[F(f,f')=f(s)\\,\lbrace L-f(s)\rbrace\\,\sqrt{1-{f'(s)}\^2}\\]

This is solved by the *Euler-Lagrange Equation*:

\\[\frac{\partial F}{\partial f}-\frac{d}{ds}\frac{\partial F}{\partial f'}=0\\]

Because \\(F\\) is not an *explicit* function of \\(s\\) we can use the *[Beltrami identity](https://en.wikipedia.org/wiki/Beltrami_identity)*:

\\[F-f' \frac{\partial F}{\partial f'}=C, \quad C \text { is a constant}\\] 

Using our formula for \\(F\\):

\\[f\times (L-f) = C\sqrt{1-{f'}\^2}\\]
\\[1-\frac{f\^2{(L-f)}\^2}{C\^2}={\frac{df}{ds}}\^2\\]
\\[\frac{df}{ds}=\sqrt{1-\frac{f\^2{(L-f)}\^2}{C\^2}}\\]

Not that easy to solve.

## The Constant \\(C\\)

Since we know that

\\[f\times (L-f) = C\sqrt{1-{f'}\^2}\\]

if \\(C=0\\) then

\\[f(s)=0\quad\text{volume minimum}\\]

or

\\[f(s)=L\quad\text{which fails the endpoint constraint}\\]

Therefore:

\\[C\neq0\\]

## The Endpoints

Consider our equation

\\[f\times (L-f) = C\sqrt{1-{f'}\^2}\\]

We know that \\(f(0)=0\\) so:

\\[f(0)\times (L-f(0)) = 0 = C\sqrt{1-{f'(0)}\^2}\\]

Since (from above) \\(C\neq 0\\)

\\[\sqrt{1-{f'(0)}\^2}=0\\quad\rightarrow\quad f'(0)=1\\]

And (by similar argument) and the requirement that \\(f(1)=0,\\,f(s)\geq0\\)

\\[f'(1)=-1\\]

So at least we know at the endpoints \\(f(s)=\pm45\^\circ\\) when flat and \\(90\^\circ\\) folded.

## The Midpoint

It seems pretty evident that the problem description and constraints are identical at \\(s=0\\) and \\(s=1\\) so we expect the solution to be symmetric at \\(s=.5\\), implying \\(f'(.5)=0\\)

\\[f(.5)\times(L-f(.5))=C\\]  
\\[f'(s)=\sqrt{1-\frac{f(s)(L-f(s))}{f(.5)(L-f(.5))}}\\]

The other thing to note is that since \\(C \neq 0 \\)

\\[f(.5) \lt L\\]

## Second Derivative

Using:

\\[\frac{df}{ds}=\sqrt{1-\frac{f\^2{(L-f)}\^2}{C\^2}}\\]

We can computer the second derivative:

\\[\frac{{df}\^2}{d{s}\^2}=\frac{f\times(L-f)\times(2f-L)}{C\^2}\\]

At the midpoint \\(s=.5\\)

\\[\frac{{df}\^2}{d{s}\^2}\bigg\rvert\_{.5}=\frac{f(.5)\times(L-f(.5))\times(2f(.5)-L)}{{f(.5)}\^2\times(L-f(.5))\^2}\\]

\\[\frac{{df}\^2}{d{s}\^2}\bigg\rvert\_{.5}=\frac{2f(.5)-L}{{f(.5)}\times(L-f(.5))}\\]

For \\(f(.5)\\) to be a maximum, \\(\frac{{df}\^2}{d{s}\^2}\leq0\\), so

\\[2 f(.5) - L \leq0\\]

\\[f(.5) \leq L/2\\]

Thus

\\[f(s) \leq L/2 \\]

which is a more restrictive bound for \\(f(s)\\).

## Full Constraints

After this analysis, we have a more complete set of constraints for the optimal volume curve:

* \\(f(0)=0\\)
* \\(f'(0)=1\\)
* \\(f'(.5)=0\\)
* \\(f(s)\leq L/2 \\) for all \\(s\\)
* \\(f'(1)=-1\\)
* \\(f(1)=0\\)

## Exploring Length \\(L\\)

Our governing equation

\\[f\times (L-f) = C\sqrt{1-{f'}\^2}\\]

and our constraints have only one given parameter: \\(L\\) the length

We next explore the behavior for [long](./long.md) and [short](./short.md) lengths.