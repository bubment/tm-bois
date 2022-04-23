let numHeaderChunks;
let buffer;
let pointer;
let lookbackVersion;

let lookbackStrings = [];
let collectionIDs = {
    6: 'Stadium',
    11: 'Valley',
    12: 'Canyon',
    13: 'Lagoon',
    25: 'Stadium256',
    26: 'Stadium®',
    10003: 'Common',
};

function parseGBX(array) {
    let metadata = [];
    let headerChunks = [];

    pointer = 0;
    lookbackVersion = null;
    buffer = array;

    readString(3);

    let version = readInt16();

    if (version >= 3) {
        format = readChar();
        refTableCompression = readChar();
        bodyCompression = readChar();
        if (version >= 4) unknown = readChar();
        let classID = readInt32();

        if (version >= 6) {
            let userDataSize = readInt32();
            if (userDataSize > 0) {
                numHeaderChunks = readInt32();

                for (a = 0; a < numHeaderChunks; a++) {
                    var chunkId = readInt32() & 0xfff;
                    var chunkSize = readInt32();
                    var isHeavy = (chunkSize & (1 << 31)) != 0;

                    headerChunks[chunkId] = {
                        size: chunkSize & ~0x80000000,
                        isHeavy: isHeavy,
                    };
                }

                for (var key in headerChunks) {
                    headerChunks[key].data = readBytes(headerChunks[key].size);
                    delete headerChunks[key].size;
                }

                if (classID == 0x03093000 || classID == 0x2407e000 || classID == 0x2403f000) {
                    metadata.type = 'Replay';

                    changeBuffer(headerChunks[0x000].data);

                    chunk000Version = readInt32();
                    if (chunk000Version >= 2) {
                        metadata.mapInfo = readMeta();
                        metadata.time = readInt32();
                        metadata.driverNickname = readString();

                        if (chunk000Version >= 6) {
                            metadata.driverLogin = readString();

                            if (chunk000Version >= 8) {
                                readByte();
                                metadata.titleUID = readLookbackString();
                            }
                        }
                    }

                    changeBuffer(headerChunks[0x001].data);

                    metadata.xml = readString();

                    changeBuffer(headerChunks[0x002].data);

                    metadata.authorVersion = readInt32();
                    metadata.authorLogin = readString();
                    metadata.authorNickname = readString();
                    metadata.authorZone = readString();
                    metadata.authorExtraInfo = readString();
                }
            }
        }
    }

    return metadata;
};

function changeBuffer(newBuffer) {
    buffer = newBuffer;
    pointer = 0;
}

function readByte() {
    let byte = buffer[pointer];
    pointer += 1;
    return byte;
}

function readBytes(count) {
    let bytes = new Uint8Array(count);

    for (i = 0; i < count; i++) {
        bytes[i] = readByte();
    };

    return bytes;
}

function readInt16() {
    let bytes = readBytes(2);
    return bytes[0] | (bytes[1] << 8);
}

function readInt32() {
    let bytes = readBytes(4);
    return bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24);
}

function readString(count) {
    if (count == undefined) {
        count = readInt32()
    }
    return new TextDecoder().decode(readBytes(count));
}

function readChar() {
    return readString(1);
}

function readLookbackString() {
    if (lookbackVersion == null) {
        lookbackVersion = readInt32();
    };

    var index = new Uint32Array([readInt32()])[0];

    if ((index & 0x3fff) == 0 && (index >> 30 == 1 || index >> 30 == -2)) {
        var str = readString();
        lookbackStrings.push(str);
        return str;
    } else if ((index & 0x3fff) == 0x3fff) {
        switch (index >> 30) {
            case 2:
                return 'Unassigned';
            case 3:
                return '';
        }
    } else if (index >> 30 == 0) {
        if (collectionIDs[index] == undefined) {
            return index;
        } else return collectionIDs[index];
    } else if (lookbackStrings.Count > (index & 0x3fff) - 1)
        return lookbackStrings[(index & 0x3fff) - 1];
    else return '';
}

function readMeta() {
    return {
        id: readLookbackString(),
        collection: readLookbackString(),
        author: readLookbackString(),
    };
}