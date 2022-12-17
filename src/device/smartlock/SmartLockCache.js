/**
 * storage counter, used for encrypting
 * @Key mac
 * @Value counter
 * @type {Map<any, DeviceInfo>}
 */

export default class SmartLockInfo {
    mac; //device mac address
    name; //device idO
    ble_version;
    software_version;
    hardware_version;
    customerId;
    battery_capacity;

    constructor(
        mac: string,
        name: string,
        ble_version: string,
        software_version: number,
        hardware_version: number,
        customerId: string,
        battery_capacity: number,
    ) {
        if (mac == null || mac == '') {
            this.mac = '';
            this.name = '';
            this.ble_version = 0;
            this.software_version = 0;
            this.hardware_version = 0;
            this.customerId = '';
            this.battery_capacity = 0;
            return;
        }
        this.mac = mac;
        this.name = name;
        this.ble_version = ble_version;
        this.software_version = software_version;
        this.hardware_version = hardware_version;
        this.customerId = customerId;
        this.battery_capacity = battery_capacity;
    }

    toString = () => {
        return "{'mac':'" + this.mac + "','name':'" + this.name + "','customerId':" + this.customerId + ",'software':'" + this.software_version + "'," +
            "'hardware':'" + this.hardware_version + "','ble_version':" + this.ble_version + "," +
            "'battery_capacity':" + this.battery_capacity + "}";
    }

    setName = name => {
        this.name = name;
    };
    getMac = () => {
        return this.mac;
    };
    getName = () => {
        return this.name;
    };
    getSoftwareVersion = () => {
        return this.software_version;
    };
    getBatteryCapacity = () => {
        return this.battery_capacity;
    };
    setCustomerId = customerId => {
        this.customerId = customerId;
    }

}
