export const Bytes2Int = value => {
    return parseInt(value, 10);
};

export const Bytes2HexString = arrBytes => {
    let str = '';
    for (let i = 0; i < arrBytes.length; i++) {
        let tmp;
        let num = arrBytes[i];
        if (num < 0) {
            tmp = (255 + num + 1).toString(16);
            // tmp = parseInt(255 + num + 1, 2).toString(16);
        } else {
            tmp = num.toString(16);
            // tmp = parseInt(num, 2).toString(16);
        }
        if (tmp.length === 1) {
            tmp = '0' + tmp;
        }
        str += tmp;
    }
    return str;
};

export const Bytes2Str = arr => {
    let str = '';
    for (let i = 0; i < arr.length; i++) {
        let tmp = arr[i].toString(16);
        if (tmp.length == 1) {
            tmp = '0' + tmp;
        }
        str += tmp;
    }
    return str;
};

export const Byte2Mac = arr =>{
    let str = '';
    for (let i = 0; i < arr.length; i++) {
        let tmp = arr[i].toString(16);
        if (tmp.length == 1) {
            tmp = '0' + tmp;
        }
        str += tmp;
        if(i!=arr.length-1){
            str += ":";
        }
    }
    if(str==="30:30:30:30:30:30"){
        return "";
    }
    return str;
}

export const intToByte = i => {
    let b = i & 0xff;
    let c = 0;
    if (b >= 128) {
        c = b % 128;
        c = -1 * (128 - c);
    } else {
        c = b;
    }
    return c;
};

export const Str2BytesPer2 = str => {
    let len = str.length;
    let bytes = new Array();
    for (let i = 0; i < len; i += 2) {
        let size = 2;
        if (len - i < 2) {
            size = len - i;
        }
        let sub = str.substring(i, i + size);
        let tmp = parseInt(sub, 16);
        bytes.push(intToByte(tmp));
    }
    return bytes;
};

export const Str2Bytes = str => {
    let len = str.length;
    let bytes = new Array();
    for (let i = 0; i < len; i++) {
        let sub = str.substring(i, i + 1);
        let tmp = parseInt(sub, 16);
        bytes.push(intToByte(tmp));
    }
    return bytes;
};

/**
 * Converts UUID to full 128bit.
 *
 * @param {UUID} uuid 16bit, 32bit or 128bit UUID.
 * @returns {UUID} 128bit UUID.
 */
export const fullUUID = uuid => {
    if (uuid.length === 4) {
        return '0000' + uuid.toUpperCase() + '-0000-1000-8000-00805F9B34FB';
    }
    if (uuid.length === 8) {
        return uuid.toUpperCase() + '-0000-1000-8000-00805F9B34FB';
    }
    return uuid.toUpperCase();
};

export function getUint8(s) {
    return s & 0x00ff;
}

export function getMac(address) {
    let result = {};
    let array = address.split(':');
    for (let i = 0; i < array.length; i++) {
        result[array.length - i - 1] = hex2int(array[i]);
    }
    return result;
}

export function hex2int(hex) {
    let len = hex.length,
        a = new Array(len),
        code;
    for (let i = 0; i < len; i++) {
        code = hex.charCodeAt(i);
        if (code >= 48 && code < 58) {
            code -= 48;
        } else {
            code = (code & 0xdf) - 65 + 10;
        }
        a[i] = code;
    }

    return a.reduce(function (acc, c) {
        acc = 16 * acc + c;
        return acc;
    }, 0);
}

// export function ascii2int(number) {
//     return number.charCodeAt();
// }
// export const Str2Bytes = str => {
//     let len = str.length;
//     let bytes = new Array();
//     for (let i = 0; i < len; i++) {
//         let sub = str.substring(i, i + 1);
//         let tmp = parseInt(sub, 16);
//         bytes.push(intToByte(tmp));
//     }
//     return bytes;
// };

export function asciiStr2intArray(str) {
    let bytes = new Array();
    for (let i = 0; i < str.length; i++) {
        let sub = str.substring(i, i + 1);
        bytes.push(sub.charCodeAt());
    }
    return bytes;
}
