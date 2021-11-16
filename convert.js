const { createImageData } = require('canvas');
const { mod, interpolations, orientations } = require('./utils')

const renderFace = ({ data: readData, face, rotation, interpolation, maxWidth = Infinity }) => {
    return new Promise(resolve => {

        const faceWidth = Math.min(maxWidth, readData.width / 4);
        const faceHeight = faceWidth;

        const cube = {};
        const orientation = orientations[face];

        const writeData = createImageData(faceWidth, faceHeight);

        const copyPixel = interpolations[interpolation](readData, writeData)

        for (let x = 0; x < faceWidth; x++) {
            for (let y = 0; y < faceHeight; y++) {
                const to = 4 * (y * faceWidth + x);

                // fill alpha channel
                writeData.data[to + 3] = 255;

                // get position on cube face
                // cube is centered at the origin with a side length of 2
                orientation(cube, (2 * (x + 0.5) / faceWidth - 1), (2 * (y + 0.5) / faceHeight - 1));

                // project cube face onto unit sphere by converting cartesian to spherical coordinates
                const r = Math.sqrt(cube.x * cube.x + cube.y * cube.y + cube.z * cube.z);
                const lon = mod(Math.atan2(cube.y, cube.x) + rotation, 2 * Math.PI);
                const lat = Math.acos(cube.z / r);

                copyPixel(readData.width * lon / Math.PI / 2 - 0.5, readData.height * lat / Math.PI - 0.5, to);
            }
        }

        resolve(writeData)
    });
}

module.exports = {
    renderFace
}