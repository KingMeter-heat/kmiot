import {getMac, getUint8, intToByte} from './BTDataUtils';

function F(x, y, z) {
    return (x & y) | (~x & z);
}

function G(x, y, z) {
    return (x & z) | (y & ~z);
}

function H(x, y, z) {
    return x ^ y ^ z;
}

function I(x, y, z) {
    return y ^ (x | ~z);
}

function ROTATE_LEFT(x, n) {
    return (x << n) | (x >>> (32 - n));
}

function FF(a, b, c, d, s, ac) {
    a += F(b, c, d) + ac;
    a = ROTATE_LEFT(a, s);
    return a + b;
}

function GG(a, b, c, d, s, ac) {
    b += G(a, c, d) + ac;
    b = ROTATE_LEFT(b, s);
    return b + c;
}

function HH(a, b, c, d, s, ac) {
    c += H(a, b, d) + ac;
    c = ROTATE_LEFT(c, s);
    return c + d;
}

function II(a, b, c, d, s, ac) {
    d += I(a, b, c) + ac;
    d = ROTATE_LEFT(d, s);
    return d + a;
}

let SS = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];

export function getEncrypt(customerId, counter, address, flag) {
    const customerID = parseInt(String(customerId), 16);
    let mac = getMac(address);
    let encrypted = [];
    let a, b, c, d, j, k, l, m;

    if (
        mac[0] === 0 &&
        mac[1] === 0 &&
        mac[2] === 0 &&
        mac[3] === 0 &&
        mac[4] === 0 &&
        mac[5] === 0
    ) {
        return null;
    }
    if (counter === 0) {
        return null;
    }
    a = counter * mac[0] + mac[5] * ((customerID >> 12) & 0xf);
    b = counter * mac[1] + mac[4] * ((customerID >> 8) & 0xf);
    c = counter * mac[2] + mac[3] * ((customerID >> 4) & 0xf);
    d = counter * mac[3] + mac[2] * (customerID & 0xf);

    j = getUint8(a % 16);
    k = getUint8(b % 16);
    l = getUint8(c % 16);
    m = getUint8(d % 16);

    a = FF(a, b, c, d, SS[j], 0xd76aa478);
    b = GG(a, b, c, d, SS[k], 0xe8c7b756);
    c = HH(a, b, c, d, SS[l], 0x242070db);
    d = II(a, b, c, d, SS[m], 0xc1bdceee);

    encrypted[0] = getUint8(a);
    encrypted[1] = getUint8(b);
    encrypted[2] = getUint8(c);
    encrypted[3] = getUint8(d);

    return [0xca, ...encrypted, flag];
}

export function getEncryptData(customerId, counter, address, cmd, dataArray) {
    const customerID = parseInt(String(customerId), 16);
    let mac = getMac(address);
    let encrypted = [];
    let a, b, c, d, j, k, l, m;

    if (
        mac[0] === 0 &&
        mac[1] === 0 &&
        mac[2] === 0 &&
        mac[3] === 0 &&
        mac[4] === 0 &&
        mac[5] === 0
    ) {
        return null;
    }
    if (counter === 0) {
        return null;
    }
    a = counter * mac[0] + mac[5] * ((customerID >> 12) & 0xf);
    b = counter * mac[1] + mac[4] * ((customerID >> 8) & 0xf);
    c = counter * mac[2] + mac[3] * ((customerID >> 4) & 0xf);
    d = counter * mac[3] + mac[2] * (customerID & 0xf);

    j = getUint8(a % 16);
    k = getUint8(b % 16);
    l = getUint8(c % 16);
    m = getUint8(d % 16);

    a = FF(a, b, c, d, SS[j], 0xd76aa478);
    b = GG(a, b, c, d, SS[k], 0xe8c7b756);
    c = HH(a, b, c, d, SS[l], 0x242070db);
    d = II(a, b, c, d, SS[m], 0xc1bdceee);

    encrypted[0] = getUint8(a);
    encrypted[1] = getUint8(b);
    encrypted[2] = getUint8(c);
    encrypted[3] = getUint8(d);

    let bytes = new Array();
    bytes.push(intToByte(0xc9));
    bytes.push(intToByte(getUint8(a)));
    bytes.push(intToByte(getUint8(b)));
    bytes.push(intToByte(getUint8(c)));
    bytes.push(intToByte(getUint8(d)));
    bytes.push(intToByte(cmd));


    // log('data', dataArray);
    // log('bytes1', bytes);
    for (let i = 0; i < dataArray.length; i++) {
        // if (data[i].length > 0) {
        //     bytes = bytes.concat(asciiStr2intArray(data[i]));
        // } else {
        //     bytes.push(intToByte(data[i]));
        // }
        bytes.push(intToByte(dataArray[i]));
    }
    // log('bytes2', bytes);
    return bytes;
}
