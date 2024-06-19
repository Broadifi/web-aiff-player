export async function decodeAIFF(arrayBuffer: ArrayBuffer): Promise<{ sampleRate: number; channelData: Float32Array[] }> {
    const dataView = new DataView(arrayBuffer);
    const header = parseHeader(dataView);
    const samples = parseSamples(dataView, header);
    return {
        sampleRate: header.sampleRate,
        channelData: samples
    };
}

interface Header {
    numChannels: number;
    numSampleFrames: number;
    sampleSize: number;
    sampleRate: number;
}

function parseHeader(dataView: DataView): Header {
    const formType = getString(dataView, 8, 4);
    console.log('Form Type:', formType);
    if (formType !== 'AIFF' && formType !== 'AIFC') {
        throw new Error('Not a valid AIFF file.');
    }

    let offset = 12;
    let foundCOMM = false;
    while (offset < dataView.byteLength) {
        const chunkID = getString(dataView, offset, 4);
        const chunkSize = dataView.getUint32(offset + 4, false);

        if (chunkID === 'COMM') {
            foundCOMM = true;
            const numChannels = dataView.getUint16(offset + 8, false);
            const numSampleFrames = dataView.getUint32(offset + 10, false);
            const sampleSize = dataView.getUint16(offset + 14, false);
            const sampleRate = readFloat80(dataView, offset + 16);

            console.log('Channels:', numChannels, 'Frames:', numSampleFrames, 'Sample Size:', sampleSize, 'Sample Rate:', sampleRate);

            return { numChannels, numSampleFrames, sampleSize, sampleRate };
        }

        offset += 8 + chunkSize;
        if (chunkSize % 2 !== 0) offset++;
    }

    if (!foundCOMM) {
        throw new Error('COMM chunk not found in AIFF file.');
    }

    return { numChannels: 0, numSampleFrames: 0, sampleSize: 0, sampleRate: 0 };
}

function parseSamples(dataView: DataView, header: Header): Float32Array[] {
    let offset = 12;
    let foundSSND = false;
    while (offset < dataView.byteLength) {
        const chunkID = getString(dataView, offset, 4);
        const chunkSize = dataView.getUint32(offset + 4, false);

        if (chunkID === 'SSND') {
            foundSSND = true;
            const dataOffset = dataView.getUint32(offset + 8, false);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            // const blockSize = dataView.getUint32(offset + 12, false);
            const sampleDataOffset = offset + 16 + dataOffset;

            const samples: Float32Array[] = [];
            const sampleSizeBytes = header.sampleSize / 8;
            console.log('Sample Size Bytes:', sampleSizeBytes);
            for (let i = 0; i < header.numChannels; i++) {
                samples[i] = new Float32Array(header.numSampleFrames);
            }

            for (let frame = 0; frame < header.numSampleFrames; frame++) {
                for (let channel = 0; channel < header.numChannels; channel++) {
                    samples[channel][frame] = readSample(dataView, sampleDataOffset + frame * header.numChannels * sampleSizeBytes + channel * sampleSizeBytes, sampleSizeBytes);
                }
            }

            return samples;
        }

        offset += 8 + chunkSize;
        if (chunkSize % 2 !== 0) offset++;
    }

    if (!foundSSND) {
        throw new Error('SSND chunk not found in AIFF file.');
    }
    return [];
}

function readSample(dataView: DataView, offset: number, size: number): number {
    switch (size) {
        case 1:
            return dataView.getInt8(offset) / 128;
        case 2:
            return dataView.getInt16(offset, false) / 32768;
        default:
            throw new Error('Unsupported sample size.');
    }
}

function getString(dataView: DataView, offset: number, length: number): string {
    let str = '';
    for (let i = 0; i < length; i++) {
        str += String.fromCharCode(dataView.getUint8(offset + i));
    }
    return str;
}

function readFloat80(dataView: DataView, offset: number): number {
    const expon = dataView.getUint16(offset, false);
    const hiMant = dataView.getUint32(offset + 2, false);
    const loMant = dataView.getUint32(offset + 6, false);
    const negative = (expon & 0x8000) !== 0;
    let exp = expon & 0x7FFF;

    if (exp === 0 && hiMant === 0 && loMant === 0) {
        return 0;
    }

    if (exp === 0x7FFF) {
        return Infinity;
    }

    exp -= 16383;
    const mant = hiMant * 0x100000000 + loMant;

    let value = mant * Math.pow(2, exp - 63);
    if (negative) {
        value = -value;
    }
    return value;
}
