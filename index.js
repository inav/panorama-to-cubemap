const { createCanvas, loadImage } = require('canvas');
const canvas = createCanvas();
const ctx = canvas.getContext('2d');
const fs = require('fs');

const { renderFace } = require('./convert');
const { mimeType } = require('./utils')


const getDataURL = (imgData, extension) => {
    canvas.width = imgData.width;
    canvas.height = imgData.height;
    ctx.putImageData(imgData, 0, 0);
    return new Promise(resolve => resolve(canvas.toBuffer(mimeType[extension], { quality: 0.92 })));
}


const convertImage = (src, usrOptions) => {
    const options = {
        rotation: 180,
        interpolation: 'lanczos',
        outformat: 'jpg',
        outtype: 'file',
        width: Infinity,
        ...usrOptions
    }
    return new Promise(resolve => {
        loadImage(src).then((img) => {
            const { width, height } = img;
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0);
            const data = ctx.getImageData(0, 0, width, height);
            processImage(data, options).then(x => resolve(x));
        })
    });
}


const processFace = (data, options, facename) => {
    return new Promise(resolve => {
        const optons = {
            data,
            face: facename,
            rotation: Math.PI * options.rotation / 180,
            interpolation: options.interpolation,
            maxWidth: options.width
        };

        renderFace(optons).then(data => {
            getDataURL(data, options.outformat).then(file => {
                if (options.outtype === 'file') {
                    fs.writeFile(`${facename}.${options.outformat}`, file, "binary", (err) => {
                        if (err) console.log(err);
                        else {
                            console.log("The file was saved!");
                            resolve(`${facename}.${options.outformat} was saved`)
                        }
                    });
                } else {
                    resolve({
                        buffer: file,
                        filename: `${facename}.${options.outformat}`
                    });
                }
            })
        })
    });
}


const processImage = (data, options) => {
    const faces = ["pz", "nz", "px", "nx", "py", "ny"].map(face => processFace(data, options, face))

    return new Promise(resolve => Promise.all(faces).then(x => resolve(x)));
}


module.exports = {
    convertImage
}