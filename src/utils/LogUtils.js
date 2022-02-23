import {notify} from "../components/notify/notify";


export const log_info = (mark="", message="") => {
    let date = new Date();
    console.log(date.format("yyyy-MM-dd hh:mm:ss.S --> ")+mark + ' ' + message);
};

export const log_error = (mark="", message="") => {
    console.log(mark + '@' + message);
    // notify(mark+" "+message);
};
