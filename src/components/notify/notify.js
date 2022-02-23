import {Toast} from '@ant-design/react-native';


export const notify = (message,duration=1) =>{
    Toast.info({
        duration:duration,
        content: message,
    });
}
