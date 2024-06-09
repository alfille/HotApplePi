# Arc Scaled

## Arc Curve

Recall the [normalized equations](./arc.md) for the arc:

\\[\hat{f}(\hat{s})=\frac{\cos(\theta)}{2 \sin({\theta}\_0)}-\frac{\cos({\theta}\_0)}{2 \sin({\theta}\_0)}=\frac{\cos(\theta)-\cos({\theta}\_0)}{2 \sin({\theta}\_0)}\\]
\\[\hat{f}'(\hat{s})=\frac{d \hat{f}}{d \hat{s}}=- \frac{\sin(\theta)}{\cos(\theta)}\\]
where
\\[\hat{s}=\frac{\sin(\theta)}{2 \sin({\theta}\_0)},\quad d\hat{s}=\frac{\cos(\theta)}{2 \sin({\theta}\_0)}d\theta\\]

We have 2 constraints

\\[\lvert\theta\rvert\leq{\\theta}\_0\\]
\\[\lvert\hat{f}'(\hat{s})\rvert\leq1\\]
This implies:
\\[\max{\hat{f}'(\hat{s})}=\hat{f}'({\theta}\_0)\quad\text{and}\quad{\theta}\_0\leq\pi/4\\]

## Scaled arc

If we define a curve

\\[g(\hat{s})=\frac{\cos({\theta}\_0)}{\sin({\theta}\_0)}\hat{f}(\hat{s})=\frac{\cos({\theta}\_0)}{2\\, {\sin}\^2({\theta}\_0)}\lbrace\cos(\theta)-\cos({\theta}\_0)\rbrace\\]
\\[g'(\hat{s})=-\frac{\cos({\theta}\_0)}{\sin({\theta}\_0)}\frac{\sin(\theta)}{\cos(\theta)}\\]

\\[dx=\sqrt{1-{g'(\hat{s})}\^2}\\,d\hat{s}=\frac{\sqrt{{\cos}\^2(\theta)-{\cos}\^2({\theta}\_0)}}{2 {\sin}\^2({\theta}\_0)}d\theta\\]

## Scaled Graphs

### Unscaled Flat
![](images/UnscaledUnfolded.png)

### Scaled Flat
![](images/ScaledFlat.png)

### Unscaled Folded
![](images/UnscaledFolded.png)

### Scaled Folded
![](images/ScaledFolded.png)

### Height
![](images/MaxHeight.png)

* Scaled is fairly constant over arc angle
* The curves cross at \\(45\^{\circ}\\), where scaling factor is 1.0
* This also shows minumum length since
\\[\hat{L}\geq\max{f}\\]

### Volume
![](images/Volume_All.png)

* Volume increases with length (of course)
* Scaled boxes have a minimum length of .25
* Scaled volume has little arc angle dependence
* Scaled boxes are larger that unscaled