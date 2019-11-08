# panorama-to-cubemap

Node.js implementation of [panorama-to-cubemap](https://github.com/jaxry/panorama-to-cubemap) by [jaxry](https://github.com/jaxry/)

The original program was developed for web browsers and used
Canvas to manipulate images. For this implementation, we use node-canvas a Canvas implementation for Node.js.

`npm install panorama-to-cubemap` <br/>
or <br/>
`yarn add panorama-to-cubemap`
<br/><br/>

## Quick Example

```javascript
const { convertImage } = require("panorama-to-cubemap");

const url = "https://img.pixexid.com/n5f0lia-360-photo-panorama-.jpeg";

// url should be absolute local or remote path

// Calling this function will generate 6 sides of cubemap in local directory
convertImage(url);

// These are the default options
const options = {
  rotation: 180,
  interpolation: "lanczos",
  outformat: "jpg",
  outtype: "file",
  width: Infinity
};

convertImage(url, options).then(x => {
  // output will be buffer or file based on input
  console.log(x);
});
```

## Options

rotation: (DEFAULT: 180)
Could be any number from 0 - 360

interpolation:
lanczos (DEFAULT)
linear
cubic
nearest

outformat:
jpg (DEFAULT)
png

outtype:
file (this will generate a 6 files in local) DEFAULT
buffer (output type wiil be in buffer)

width:
Orginal file width /4 (DEFAULT)
Custom value should be less than that

\*/

## TO-DO

Multi Threading

### Thanks

[jaxry](https://github.com/jaxry/) </br>
[Revlity VR](https://revlity.com/)
