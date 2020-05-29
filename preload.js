const Modbus = require('jsmodbus')
const SerialPort = require('serialport')

const options = {
    baudRate: 115200
}
const socket = new SerialPort("/dev/ttyUSB0", options)
const client = new Modbus.client.RTU(socket, 1)

let state = 0;
let cho = 0;
let registerArr;
let socketOpen = false;

let inputArr = ['displaySetVoltage', 'displaySetCurrent', 'displayOVP', 'displayOCP', 'enter', 'switch'];
addEventListeners = (elementIdArr) => {
    for (let i = 0; i < elementIdArr.length; i++) {

    }
}
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('switch').addEventListener('click', () => {
        let regs = client.readHoldingRegisters(0, 120).then(function (obj) {
            if (obj.response._body._valuesAsArray[18] == 0) {
                client.writeSingleRegister(18, 1);
            }
            else {
                client.writeSingleRegister(18, 0);
            }
        })

    })
    document.getElementById('enter').addEventListener('click', () => {
        setVoltage(displaySetVoltage.value);
        setCurrent(displaySetCurrent.value);
        setOverVoltageProtection(displayOVP.value);
        setOverCurrentProtection(displayOCP.value);
        state = 0;
    })
    document.getElementById('displaySetVoltage').addEventListener('click', () => {
        state = 1;
    })
    document.getElementById('displaySetCurrent').addEventListener('click', () => {
        state = 1;
    })
    document.getElementById('displayOVP').addEventListener('click', () => {
        state = 1;
    })
    document.getElementById('displayOCP').addEventListener('click', () => {
        state = 1;
    })
    document.getElementById('energyMeter').addEventListener('click', () => {
        if (cho == 4) {
            cho = 0;
        }
        else {
            cho++;
        }
    })
})

socket.on('open', function () {
    socketOpen = true;
});
setInterval(updateRegisters, 1000);
setInterval(showData, 1000);
function showData() {
    displayVoltage.textContent = getDisplayVoltage() + "V";
    displayCurrent.textContent = getDisplayCurrent() + "A";
    displayPower.textContent = getDisplayPower() + "W";
    cvcc.textContent = (getConstantVoltageConstantCurrentStatus() == 0) ? "CV" : "CC";
    displayVoltageCurrent();
    displayIPVoltage.textContent = getInputVoltage() + "V";
    batStat.textContent = (getBatteryMode() == 0) ? "BAT OFF" : "BAT ON";
    ovpocp.textContent = (getOverCurrentVoltageProtectionStatus() == 1) ? "OVP" : "OCP";


    function displayVoltageCurrent() {
        if (state == 0) {
            displaySetVoltage.value = getSetVoltage() + "V"
            displaySetCurrent.value = getSetCurrent() + "A"
            displayOVP.value = getVoltageProtection() + "V"
            displayOCP.value = getCurrentProtection() + "A"
        }
        if (cho == 0) {
            energyMeter.textContent = getEnergymAh() + "mAh"
        }
        else if (cho == 1) {
            energyMeter.textContent = getEnergyWh() + "Wh"
        }
        else if (cho == 2) {
            energyMeter.textContent = getInternalTemperature_c() + "Ci"
        }
        else if (cho = 3) {
            energyMeter.textContent = getExternalTemperature_c() + "Cx"
        }
    }
}
function updateRegisters() {
    return client.readHoldingRegisters(0, 120).then((obj) => {
        registerUpdated = new Date();
        registerArr = obj.response._body._valuesAsArray;
        return Promise.resolve(registerArr);
    });
}
writeRegister = (register, value) => {
    return client.writeSingleRegister(register, value);
}
getDisplayVoltage = () => {
    return (registerArr[10] === 0) ? 0 : registerArr[10] / 100;
}
getSetVoltage = () => {
    return (registerArr[8] === 0) ? 0 : registerArr[8] / 100;
}
getInputVoltage = () => {
    return (registerArr[14] == 0) ? 0 : registerArr[14] / 100;
}
getDisplayCurrent = () => {
    return (registerArr[11] == 0) ? 0 : registerArr[11] / 1000;
}
getSetCurrent = () => {
    return (registerArr[9] == 0) ? 0 : registerArr[9] / 1000;
}
getDisplayPower = () => {
    return (registerArr[13] == 0) ? 0 : registerArr[13] / 100;
}
getEnergymAh = () => {
    return (registerArr[38] << 16 | registerArr[39]) / 1000;
}
getEnergyWh = () => {
    return (registerArr[40] << 16 | registerArr[41]) / 1000;
}
getInternalTemperature_f = () => {
    if (registerArr[6] == 1) {
        return -1 * registerArr[7];
    }
    return registerArr[7];
}
getInternalTemperature_c = () => {
    if (registerArr[4] == 1) {
        return -1 * registerArr[5];
    }
    return registerArr[5];
}
getExternalTemperature_f = () => {
    if (registerArr[36] == 1) {
        return -1 * registerArr[37];
    }
    return registerArr[37];
}
getExternalTemperature_c = () => {
    if (registerArr[34] == 1) {
        return -1 * registerArr[35];
    }
    return registerArr[35];
}
getBatteryMode = () => {
    return registerArr[32];
}
getBatteryVoltage = () => {
    return registerArr[33] / 100;
}
getVoltageProtection = () => {
    return registerArr[82] / 100;
}
getCurrentProtection = () => {
    return registerArr[83] / 1000;
}
getOverCurrentVoltageProtectionStatus = () => {
    return registerArr[16]; //Protection status (1=OVP, 2=OCP)
}
getConstantVoltageConstantCurrentStatus = () => {
    return registerArr[17]; //CV/CC (0=CV, 1=CC)
}
getPowerSupplyStatus = () => {
    return registerArr[18];
}
getBacklight = () => {
    return registerArr[72];
}
getDate = () => {
    return `${registerArr[50]}/${registerArr[49]}/${registerArr[48]}`;
}
getTime = () => {
    return `${registerArr[51]}:${registerArr[52]}:${registerArr[53]}`;
}
setVoltage = (value) => {
    writeRegister(8, value * 100);
}
setCurrent = (value) => {
    writeRegister(9, value * 1000);
}
setOverVoltageProtection = (value) => {
    writeRegister(82, value * 100);
}
setOverCurrentProtection = (value) => {
    writeRegister(83, value * 1000);
}
