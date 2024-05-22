# Maximum Volume -- Long Length

By "long length" we mean the case where \\(L\gg f(s)\\)

## Curve

Our *Euler-Legrange* equation:

\\[f\times (L-f) = C\sqrt{1-{f'}\^2}\\]

Becomes:

\\[f\times L = C\sqrt{1-{f'}\^2}\\]

(Because \\((L-f)\approx L\\))

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

\\[f(.5)=1/\pi\lt L/2\quad\text{implies}\quad L\gt 2/\pi \\]

## Volume

\\[Volume=4\times\int\_0\^1 f\times (L-f)\sqrt{1-f'\^2}\\,ds\\]

For large L:

\\[Volume=4\times\int\_0\^1 f\times L\sqrt{1-f'\^2}\\,ds\\]

Using our equation for \\(f(s)=\sin(\pi s)/\pi\\):

\\[Volume=\frac{4 L}{\pi}\int\_0\^1 sin\^2(\pi s)\\,ds=\frac{2 L}{\pi}\\]

So for large length, __there is \\(\pi\\) inside *Hot Apple Pie*__

