import {log_info} from './LogUtils';
import RNFS from 'react-native-fs';

export const uuid = () => {
    var s = [];
    var hexDigits = '0123456789abcdef';
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = '-';

    return s.join('');
};

export const downUpgradeFile = (fileUrl, succeed) => {
    const downloadDest = RNFS.DocumentDirectoryPath + `/s8215_stable.zip`;
    fileExist(downloadDest,(exist)=>{
        if(exist){
            log_info('file exist');
            succeed(downloadDest);
        }else{
            const options = {
                fromUrl: fileUrl,
                toFile: downloadDest,
                background: true,
                begin: res => {
                    // console.log('begin', res);
                    // console.log('contentLength:', res.contentLength / 1024 / 1024, 'M');
                },
                progress: res => {
                    let pro = res.bytesWritten / res.contentLength;
                },
            };
            try {
                const ret = RNFS.downloadFile(options);
                ret.promise
                    .then(res => {
                        console.log('success', res);
                        console.log('file://' + downloadDest);
                        if (res.statusCode === 200) {
                            succeed(downloadDest);
                        }
                    })
                    .catch(err => {
                        console.log('err', err);
                    });
            } catch (e) {
                console.log(error);
            }
        }
    });

};

const fileExist = (filepath,callback) => {
    RNFS.exists(filepath)
        .then(exist => {
            callback(exist);
        })
        .catch(err => {
            callback(false);
            console.log(err.message);
        });
};

// export const downUpgradeFile = (fileUrl, succeed) => {
//     const FB = RNFetchBlob.config({
//         fileCache: true,
//         appendExt: 'zip',
//     });
//     FB.fetch('GET', fileUrl)
//         .progress((received, total) => {
//             log_info('download progress', received / total);
//         })
//         .then(res => {
//             log_info('download succeed'+res.path());
//             succeed(res.path());
//         })
//         .catch(error => {
//             // 下载失败
//             log_info('download ', error);
//         });
// };
