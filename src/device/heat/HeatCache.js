/**
 * storage counter, used for encrypting
 * @Key mac
 * @Value counter
 * @type {Map<any, HeatDeviceInfo>}
 */
// export const deviceInfoMap = new Map();

export default class HeatDeviceInfo {
    mac; //device mac address
    name; //device id
    software_version;
    hardware_version;
    heat_state; // whether this device is on or off
    heat_gear;
    charging_state;
    customerId;
    phoneMacFromDevice;
    battery_capacity;

    constructor(
        mac: string,
        name: string,
        software_version: number,
        hardware_version: number,
        heat_state: number,
        heat_gear: number,
        charging_state: number,
        customerId: string,
        phoneMacFromDevice: string,
        battery_capacity: number,
    ) {
        if (mac == null || mac == '') {
            this.mac = '';
            this.name = '';
            this.software_version = 0;
            this.hardware_version = 0;
            this.heat_state = 0;
            this.heat_gear = 0;
            this.charging_state = 0;
            this.customerId = '';
            this.phoneMacFromDevice = '';
            this.battery_capacity = 0;
            return;
        }
        this.mac = mac;
        this.name = name;
        this.software_version = software_version;
        this.hardware_version = hardware_version;
        this.heat_state = heat_state;
        this.heat_gear = heat_gear;
        this.charging_state = charging_state;
        this.customerId = customerId;
        this.phoneMacFromDevice = phoneMacFromDevice;
        this.battery_capacity = battery_capacity;
    }

    toString = () => {
        return "{'mac':'"+this.mac+"','name':'"+this.name+"','customerId':"+this.customerId+",'software':'"+this.software_version+"'," +
            "'hardware':'"+this.hardware_version+"','heat_state':"+this.heat_state+"," +
            "'heat_gear':"+this.heat_gear+",'charging_state':"+this.charging_state+"," +
            "'phoneMacFromDevice':'"+this.phoneMacFromDevice+"','battery_capacity':"+this.battery_capacity+"}";
    }

    setName = name => {
        this.name = name;
    };
    setHeatState = heat_state => {
        this.heat_state = heat_state;
    };
    setHeatGear = heatGear => {
        this.heat_gear = heatGear;
    };

    getMac = () => {
        return this.mac;
    };
    getName = () => {
        return this.name;
    };
    getHeatState = () => {
        return this.heat_state;
    };
    getHeatGear = () => {
        return this.heat_gear;
    };
    getSoftwareVersion = () => {
        return this.software_version;
    };
    getBatteryCapacity = () => {
        return this.battery_capacity;
    };
    getChargingState = () => {
        return this.charging_state;
    };


    setCustomerId = customerId => {
        this.customerId = customerId;
    }

    setPhoneMacFromDevice = phoneMacFromDevice => {
        this.phoneMacFromDevice = phoneMacFromDevice;
    }



}
