# Extremal -- Polynomial Solution (continued)

Our [previous approach](./poly.md) was to solve for a polynomial that satisfied the governing equation:

\\[f\^2\times (L-f)\^2 - C\^2\times(1-{f'}\^2)=0\\]

Using an even-exponent polynomial that intrinsically satisfied 

\\[f'\_{midpoint}=0\\]

and satisfying

\\[f\_{endpoint}=0\\]

----

Instead we will use a modified polynomial that satisfies the endpoint restriction as well:

\\[f(s)=(w\^2-s\^2)\\,g(s)\quad\text{where}\quad g(s)=a\_0+a\_2s\^2+a\_4s\^4+\cdots\\]
\\[\text{midpoint:}\\,s=0\quad\text{endpoint:}\\,s=w\\,(=1/2)\\]
This is an even function of \\(s\\) whith satisfies the same constraints given above.

Our new constraint will now be the slope at the endpoint:
\\[f'(w)=-1\\]
