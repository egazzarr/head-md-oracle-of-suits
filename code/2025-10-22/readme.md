# Goals
Today's class will be focused on using everything we learned to (finally!) start playing with body tracking. For now, we only have a one or two hand finger-tracking helper. By Thursday we should be able to have other helpers ready for you to explore (face, body). Or you can try any one of the other [Media Pipe Solutions](https://ai.google.dev/edge/mediapipe/solutions/guide) on your own, using our helper and/or the bots as your guide.

## Helper
There is a new “helper” script that simplifies using the Google [Media Pipe Hands Landmark API](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker).

![Hand Demo](./Hands/images/hand-demo.png)

### Demos
There are two demos using this helper:
- [Hands](./Hands/)
- [Pinch](./Pinch/)

### Release
You can download the `Hands` demo as a complete folder here:
- [MediaPipe Hands + P5.js Demo](https://github.com/abstractmachine/head-md-oracle-of-suits/releases/latest)

### Quick & Dirty method
Download the [Hands demo release](https://github.com/abstractmachine/head-md-oracle-of-suits/releases/latest) as a downloadable folder, rename this folder to whatever name you want, and place it in your daily folder.

### Create P5.js method
- As before, use the standard `View` → `Command Palette` → `Create P5.js Project` method
- Copy/paste [the code from the hands demo index.html](./Hands/index.html) your new `index.html`
- Create a new file named `MediaPipeHands.js` and copy/paste [the code from the hands demo](./Hands/MediaPipeHands.js) into this new file
- Start working with your new `sketch.js`