# panorama-to-cubemap
Tool for converting equirectangular to cubemap

`npm install panorama-to-cubemap` <br/> 
or <br/>
`yarn add panorama-to-cubemap`
<br/><br/>

## Quick Example

```javascript
const {convertImage} = require('panorama-to-cubemap')

const url = 'https://cdn.wallpapersafari.com/67/99/VxRNWT.jpg'

// url should be absolute local path or image link

// This will generate a 6 files in local directory
convertImage(url)

// these are default options
const options = {
    rotation : 180,
    interpolation : 'lanczos',
    outformat : 'jpg',
    outtype : 'file',
    width : Infinity
}

// for custom options 

/* 
rotation should 0 - 360  DEFAULT: 180

interpolation 
    lanczos  DEFAULT
    linear
    cubic
    nearest

outformat
    jpg  DEFAULT
    png

outtype
    file (this will generate a 6 files in local) DEFAULT
    buffer (output type wiil be in buffer) 

width
    orginal file width /4  DEFAULT
    custom value should be less than that

*/

// custom option will give promise response


convertImage(url,options).then(x=>{
    // output will be buffer or file based on input
    console.log(x)
})

```

## TO-DO
Multi Threading

### Thanks

[jaxry](https://github.com/jaxry/) </br>
[Revlity](https://revlity.com/)
