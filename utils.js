const clamp = (x, min, max) => Math.min(max, Math.max(x, min));

const mod = (x, n) => ((x % n) + n) % n;

const mimeType = {
    'jpg': 'image/jpeg',
    'png': 'image/png'
};

const copyPixelNearest = (read, write) => {
    const { width, height, data } = read;
    const readIndex = (x, y) => 4 * (y * width + x);

    return (xFrom, yFrom, to) => {

        const nearest = readIndex(
            clamp(Math.round(xFrom), 0, width - 1),
            clamp(Math.round(yFrom), 0, height - 1)
        );

        for (let channel = 0; channel < 3; channel++) {
            write.data[to + channel] = data[nearest + channel];
        }
    };
}

const copyPixelBilinear = (read, write) => {
    const { width, height, data } = read;
    const readIndex = (x, y) => 4 * (y * width + x);

    return (xFrom, yFrom, to) => {
        const xl = clamp(Math.floor(xFrom), 0, width - 1);
        const xr = clamp(Math.ceil(xFrom), 0, width - 1);
        const xf = xFrom - xl;

        const yl = clamp(Math.floor(yFrom), 0, height - 1);
        const yr = clamp(Math.ceil(yFrom), 0, height - 1);
        const yf = yFrom - yl;

        const p00 = readIndex(xl, yl);
        const p10 = readIndex(xr, yl);
        const p01 = readIndex(xl, yr);
        const p11 = readIndex(xr, yr);

        for (let channel = 0; channel < 3; channel++) {
            const p0 = data[p00 + channel] * (1 - xf) + data[p10 + channel] * xf;
            const p1 = data[p01 + channel] * (1 - xf) + data[p11 + channel] * xf;
            write.data[to + channel] = Math.ceil(p0 * (1 - yf) + p1 * yf);
        }
    };
}


// performs a discrete convolution with a provided kernel
const kernelResample = (read, write, filterSize, kernel) => {
    const { width, height, data } = read;
    const readIndex = (x, y) => 4 * (y * width + x);

    const twoFilterSize = 2 * filterSize;
    const xMax = width - 1;
    const yMax = height - 1;
    const xKernel = new Array(4);
    const yKernel = new Array(4);

    return (xFrom, yFrom, to) => {
        const xl = Math.floor(xFrom);
        const yl = Math.floor(yFrom);
        const xStart = xl - filterSize + 1;
        const yStart = yl - filterSize + 1;

        for (let i = 0; i < twoFilterSize; i++) {
            xKernel[i] = kernel(xFrom - (xStart + i));
            yKernel[i] = kernel(yFrom - (yStart + i));
        }

        for (let channel = 0; channel < 3; channel++) {
            let q = 0;

            for (let i = 0; i < twoFilterSize; i++) {
                const y = yStart + i;
                const yClamped = clamp(y, 0, yMax);
                let p = 0;
                for (let j = 0; j < twoFilterSize; j++) {
                    const x = xStart + j;
                    const index = readIndex(clamp(x, 0, xMax), yClamped);
                    p += data[index + channel] * xKernel[j];

                }
                q += p * yKernel[i];
            }

            write.data[to + channel] = Math.round(q);
        }
    };
}

const copyPixelBicubic = (read, write) => {
    const b = -0.5;
    const kernel = x => {
        x = Math.abs(x);
        const x2 = x * x;
        const x3 = x * x * x;
        return x <= 1 ?
            (b + 2) * x3 - (b + 3) * x2 + 1 :
            b * x3 - 5 * b * x2 + 8 * b * x - 4 * b;
    };

    return kernelResample(read, write, 2, kernel);
}

const copyPixelLanczos = (read, write) => {
    const filterSize = 5;
    const kernel = x => {
        if (x === 0) {
            return 1;
        }
        else {
            const xp = Math.PI * x;
            return filterSize * Math.sin(xp) * Math.sin(xp / filterSize) / (xp * xp);
        }
    };

    return kernelResample(read, write, filterSize, kernel);
}

const orientations = {
    pz: (out, x, y) => {
        out.x = -1;
        out.y = -x;
        out.z = -y;
    },
    nz: (out, x, y) => {
        out.x = 1;
        out.y = x;
        out.z = -y;
    },
    px: (out, x, y) => {
        out.x = x;
        out.y = -1;
        out.z = -y;
    },
    nx: (out, x, y) => {
        out.x = -x;
        out.y = 1;
        out.z = -y;
    },
    py: (out, x, y) => {
        out.x = -y;
        out.y = -x;
        out.z = 1;
    },
    ny: (out, x, y) => {
        out.x = y;
        out.y = -x;
        out.z = -1;
    }
};


const interpolations = {
    linear: copyPixelBilinear,
    cubic: copyPixelBicubic,
    lanczos: copyPixelLanczos,
    nearest: copyPixelNearest
}

module.exports = {
    mod,
    interpolations,
    orientations,
    mimeType
}