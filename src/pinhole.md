# Pinhole
![](images/687474703a2f2f692e696d6775722e636f6d2f664b65314e33452e6a7067.gif)

[Pinhole-js](https://github.com/tidwall/pinhole-js/tree/master) is a pure Javascript program by Josh Baker that rotates a line drawing on the HTML Canvas.

It is apparently based on his Go program [Pinhole](https://github.com/tidwall/pinhole)

The code is MIT licensed, simple and reviewd (by me) for safety.

## Modifications

We use a [fork of Pinhole](https://github.com/alfille/pinhole-js) with the following modifications:

* Added tthtic's [ellipse](https://github.com/tthtlc/pinhole-js/tree/master)
* changed to Javascript classes
* removed most global "vars"
* Moved the rotating event loop out of the main code body
* Added control buttons
* Added Web worker function to offload computation and display.

## Front end

The non-web worker part performs:

* Launch web worker (back end).
* Send graphics construction
* manage controls (buttons)

## Back end

Uses an offscreen canvas sent by front-end to display and rotate image

Stores construction and rotation parametes

## Communication

Web-worker standard: PostMessage front->back
Communication is all one-way.

### Messages

Post from Front-end to web worker back-end:

* type:"new"
* type:"ops"
  * oplist:list
    * list elements are list pairs
    * \[command \[args\]\]
  * "center" \[\]
  * "colorize" \[ "red" \]
  * "drawCircle" \[ x y, z, radius \]
  * "drawCube" \[ x0, y0, z0, x1, y1, z1 \]
  * "drawDot" \[ x, y, z, radius \]
  * "drawEllipse" \[ x, y, z, rad	iusA, radiusB \]
  * "drawLine" \[ x0, y0, z0, x1, y1, z1 \]
  * "rotate" \[ x, y, z \] *(static rotation)*
  * "scale" \[ x, y, z \]
  * "translate" \[ x, y, z \]
* type:"control"
*   * "X"
*   * "Y"
*   * "Z"
*   * "stop"