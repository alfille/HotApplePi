# Maximum Volume -- Long Length

By "long length" we mean the case where \\(L\gg f(s)\\)

## Curve

Our *Euler-Legrange* equation:

\\[f\times (L-f) = C\sqrt{1-{f'}\^2}\\]

Becomes:

\\[f\times L = C\sqrt{1-{f'}\^2}\\]

(Because \\((L-f)\approx L\\))

This is a directly solvable differential equation as a generalized \\(\sin()\\) function.

Boundary conditions:

\\[f(0)=f(1)=0\\]

A trial solution of the form:

\\[f(s)=a \sin(c (s+b))\\]

Gives:

\\[a L \sin(c (s+b)) = C \sqrt{ 1- a\^2 c\^2 {\cos(c (s+b))}\^2}\\]

If \\(c=1/a\\)

\\[a L \sin(\frac{s+b}{a}) = C \sin(\frac{s+b}{a})\\]

\\[f(0)=0\rightarrow b=0\\]
\\[f(1)=0\rightarrow a=1/\pi\\]
and 
\\[C=a L= L/\pi\\]
So
\\[f(s)=\frac{\sin(\pi s)}{\pi}\\]

Note that

\\[f(.5)=1/\pi\lt L/2\quad\text{implies}\quad L\gt 2/\pi\approx 0.64 \\]

So "Large \\(L\\)" is at least \\(L>.64\\).

## Folded

We know the flat profile:
![](images/longflat.png)

\\[f(s)=\frac{\sin(\pi s)}{\pi}\\]

But the [folded profile](./folded.md) is a parametric function where 

\\[dx=\sqrt{1-f'(s)\^2} ds\\]

So

\\[x=\int\_0\^s \sqrt{1-f'(\sigma)\^2} d\sigma\\]
![](images/longfolded.png)
\\[x=\frac{1-\cos(\pi s)}{\pi}\\]

## Volume

From [earlier](./volume.md):

\\[Volume=4\times\int\_0\^1 f\times (L-f)\sqrt{1-f'\^2}\\,ds\\]

For large L:

\\[Volume=4\times\int\_0\^1 f\times L\sqrt{1-f'\^2}\\,ds\\]

Using our equation for \\(f(s)=\sin(\pi s)/\pi\\):

\\[Volume=\frac{4 L}{\pi}\int\_0\^1 sin\^2(\pi s)\\,ds=\frac{2 L}{\pi}\\]

Our *Long Length* volume limit is thus:

\\[Volume=\frac{2 L}{\pi}\\]

## Conclusion

For large length, __there is \\(\pi\\) inside *Hot Apple Pie*__

## Addendum

What happens if we calculate volume using our long profile 

\\[f(s)=\frac{\sin(\pi s)}{\pi}\\]

with the original volume equation:

\\[Volume=4\times\int\_0\^1 f\times (L-f)\sqrt{1-f'\^2}\\,ds\\]

Giving

\\[Volume=\frac{2 L}{\pi}-\frac{16}{3 \pi\^3}\\]

Note the constant from the \\(f\^2\\) term.

![](images/vees2.png)

The black line is the adjusted Long Volume, and as expected:

* The constant term is insignificant for large \\(L\\)
* The constant term pushes the volume negative (clearly unphysical) for small \\(L\\)

![](images/vees3.png)

Even in the range where the constant term is relevant, it adds nothing to accuracy.

