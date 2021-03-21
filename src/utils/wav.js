// reference geometry to wave from
// https://neil.fraser.name/news/2018/01/25/

function numToShort(num) {
    // num is 0 - 65536
    const b0 = num % 256; // low
    const b1 = (num - b0) / 256; // high
    return String.fromCharCode(b0) + String.fromCharCode(b1);
}

function numToLong(n) {
    // num is 0 - 4.2billion
    let num = n;
    const b0 = num % 256;
    num = (num - b0) / 256;
    const b1 = num % 256;
    num = (num - b1) / 256;
    const b2 = num % 256;
    num = (num - b2) / 256;
    const b3 = num;
    return String.fromCharCode(b0) + String.fromCharCode(b1) +
        String.fromCharCode(b2) + String.fromCharCode(b3);
}

function numToChar(num) {
    // num is 0 - 255
    return String.fromCharCode(num);
}

function makeWav(left, right) {
    // Return a stereo WAV file built from the provided data arrays.
    const min = Math.min(left.length, right.length);
    const SubChunk2Size = min * 2;
    // RIFF chunk descriptor.
    let file = 'RIFF';
    file += numToLong(36 + SubChunk2Size);  // ChunkSize
    file += 'WAVE';
    // The 'fmt ' sub-chunk.
    file += 'fmt ';
    file += numToLong(16);  // Subchunk1Size
    file += numToShort(1);  // AudioFormat
    file += numToShort(2);  // NumChannels
    file += numToLong(22050);  // SampleRate
    file += numToLong(22050 * 2);  // ByteRate
    file += numToShort(2);  // BlockAlign
    file += numToShort(8);  // BitsPerSample

    // The 'data' sub-chunk.
    file += 'data';
    file += numToLong(SubChunk2Size);
    for (let i = 0; i < min; i++) {
        file += numToChar(left[i]) + numToChar(right[i]);
    }
    return file;
}

function coordinatesToWav(coordinates) {
    const left = coordinates.map(coords => coords[0]);
    const right = coordinates.map(coords => coords[1]);

    const wav = makeWav(left, right);
    return 'data:audio/x-wav;base64,' + btoa(wav);
}

export default {
    coordinatesToWav
};
