# Self Preview

This is a simple Electron app to display self webcam preview.

The webcam preview appears as a small circle on the bottom-left by default, 
and can be dragged to reposition, or resized by dragging the border.

This can be used for creating demo videos with screen recording using native video
recorders such as Quick Time, so that your self webcam preview also appears at a corner
in the recorded demo.

Those familiar with Electron build process, should be able to use the code
```
npm install
npm start
```
There are other build targets in package.json that you can use.

Once the built package is installed, it also handles the protocol "camera",
so you should be able to enter "camera:start" or similar to launch the app.
If the string after ":" is start of a camera name, then that camera is used,
otherwise the default camera is used, e.g., launching as "camera:Logi" 
will look for camera name starting with "Logi" such as "Logitech", if you have
multiple cameras.

I have only used and tested this on OS X.
