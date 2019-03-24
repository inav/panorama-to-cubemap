const {
    createCanvas,
    loadImage
} = require('canvas');
const canvas = createCanvas();
const ctx = canvas.getContext('2d');
const fs = require('fs');

const {
    renderFace
} = require('./convert');


const mimeType = {
    'jpg': 'image/jpeg',
    'png': 'image/png'
};

function getDataURL(imgData, extension) {
    canvas.width = imgData.width;
    canvas.height = imgData.height;
    ctx.putImageData(imgData, 0, 0);
    return new Promise(resolve => {
        resolve(canvas.toBuffer(mimeType[extension], { quality: 0.92 }))
        // resolve(canvas.toDataURL('image/jpeg',0.92))
        // canvas.toBlob(blob => resolve(URL.createObjectURL(blob)), mimeType[extension], 0.92);
    });
}


function convertImage( src, options){
    if(!options){
        options = {
            rotation : 180,
            interpolation : 'lanczos',
            outformat : 'jpg',
            outtype : 'file',
            width : Infinity
        }
    }
    if(!options.rotation){
        options.rotation = 180
    }
    if(!options.interpolation){
        options.interpolation = 'lanczos'
    }
    if(!options.outformat){
        options.outformat = 'jpg'
    }
    if(!options.outtype){
        options.outtype = 'file'
    }
    if(!options.width){
        options.width = Infinity
    }
    return new Promise(resolve => {
        loadImage(src).then((img) => {
            const { width, height } = img;
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0);
            const data = ctx.getImageData(0, 0, width, height);
            processImage(data,options).then(x=>{
                resolve(x)
            });
        })
    });
}


function processFace(data,options,facename){
    return new Promise(resolve => {
        const optons = {
            data: data,
            face: facename,
            rotation: Math.PI * options.rotation / 180,
            interpolation: options.interpolation,
            maxWidth: options.width
        };

        renderFace(optons).then(data=>{
            getDataURL(data, options.outformat).then(file =>{
                if(options.outtype==='file'){
                    fs.writeFile(`${facename}.${options.outformat}`, file,  "binary",function(err) {
                        if(err) {
                            console.log(err);
                        } else {
                            console.log("The file was saved!");
                            resolve(`${facename}.${options.outformat} was saved` )
                        }
                    });
                } else {
                    resolve({
                        buffer:file,
                        filename:`${facename}.${options.outformat}`
                    });
                }
            })
        })
    });
}

function processImage(data, options) {
    return new Promise(resolve => {
        Promise.all([
            processFace(data, options, "pz"),
            processFace(data, options, "nz"),
            processFace(data, options, "px"),
            processFace(data, options, "nx"),
            processFace(data, options, "py"),
            processFace(data, options, "ny")
        ]).then(x=>{
            resolve(x);
        });
    });
}


module.exports = {
    convertImage
}