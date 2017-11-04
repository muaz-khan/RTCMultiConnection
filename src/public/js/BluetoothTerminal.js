/**
 * Bluetooth Terminal class.
 */
class BluetoothTerminal {
    /**
   * Create preconfigured Bluetooth Terminal instance.
   *
   * @param {!(number|string)} [serviceUuid=0xFFE0] - Service UUID
   * @param {!(number|string)} [characteristicUuid=0xFFE1] - Characteristic UUID
   * @param {string} [receiveSeparator='\n'] - Receive separator
   * @param {string} [sendSeparator='\n'] - Send separator
   * @param {!number} [sendDelay=100] - Send delay
   */
    constructor(serviceUuid = 0xFFE0, characteristicUuid = 0xFFE1, receiveSeparator = '\n', sendSeparator = '\n', sendDelay = 100) {
        // Used private variables
        this._receiveBuffer = ''; // Buffer containing not separated data
        this._maxCharacteristicValueLength = 20; // Max characteristic value length
        this._device = null; // Device object cache
        this._characteristic = null; // Characteristic object cache

        // Bound functions used to add and remove appropriate event handlers
        this._boundHandleDisconnection = this._handleDisconnection.bind(this);
        this._boundHandleCharacteristicValueChanged = this._handleCharacteristicValueChanged.bind(this);

        // Configure with specified parameters
        this.setServiceUuid(serviceUuid);
        this.setCharacteristicUuid(characteristicUuid);
        this.setReceiveSeparator(receiveSeparator);
        this.setSendSeparator(sendSeparator);
        this.setSendDelay(sendDelay);
    }

    /**
   * Set number or string representing service UUID used.
   *
   * @param {!(number|string)} uuid - Service UUID
   */
    setServiceUuid(uuid) {
        if (!Number.isInteger(uuid) && !(typeof uuid === 'string' || uuid instanceof String)) {
            throw 'UUID type is neither a number nor a string';
        }

        if (!uuid) {
            throw 'UUID cannot be a null';
        }

        this._serviceUuid = uuid;
    }

    /**
   * Set number or string representing characteristic UUID used.
   *
   * @param {!(number|string)} uuid - Characteristic UUID
   */
    setCharacteristicUuid(uuid) {
        if (!Number.isInteger(uuid) && !(typeof uuid === 'string' || uuid instanceof String)) {
            throw 'UUID type is neither a number nor a string';
        }

        if (!uuid) {
            throw 'UUID cannot be a null';
        }

        this._characteristicUuid = uuid;
    }

    /**
   * Set character representing separator for data coming from the connected
   * device, end of line for example.
   *
   * @param {string} separator - Receive separator with length equal to one
   *                             character
   */
    setReceiveSeparator(separator) {
        if (!(typeof separator === 'string' || separator instanceof String)) {
            throw 'Separator type is not a string';
        }

        if (separator.length !== 1) {
            throw 'Separator length must be equal to one character';
        }

        this._receiveSeparator = separator;
    }

    /**
   * Set string representing separator for data coming to the connected
   * device, end of line for example.
   *
   * @param {string} separator - Send separator
   */
    setSendSeparator(separator) {
        if (!(typeof separator === 'string' || separator instanceof String)) {
            throw 'Separator type is not a string';
        }

        if (separator.length !== 1) {
            throw 'Separator length must be equal to one character';
        }

        this._sendSeparator = separator;
    }

    /**
   * Set delay between chunks of long data sending.
   *
   * @param {!number} delay - Delay in milliseconds
   */
    setSendDelay(delay) {
        if (!Number.isInteger(delay)) {
            throw 'Delay type is not a number';
        }

        if (delay <= 0) {
            throw 'Delay must be more than a null';
        }

        this._sendDelay = delay;
    }

    /**
   * Launch Bluetooth device chooser and connect to the selected device.
   *
   * @returns {Promise} Promise which will be fulfilled when notifications will
   *                    be started or rejected if something went wrong
   */
    connect() {
        return this._connectToDevice(this._device);
    }

    /**
   * Disconnect from the connected device.
   */
    disconnect() {
        this._disconnectFromDevice(this._device);

        if (this._characteristic) {
            this._characteristic.removeEventListener('characteristicvaluechanged', this._boundHandleCharacteristicValueChanged);
            this._characteristic = null;
        }

        this._device = null;
    }

    /**
   * Data receiving handler which called whenever the new data comes from
   * the connected device, override it to handle incoming data.
   *
   * @param {string} data - Data
   */
    receive(data) {
        // Handle incoming data
    }

    /**
   * Send data to the connected device.
   *
   * @param {string} data - Data
   *
   * @returns {Promise} Promise which will be fulfilled when data will be sent
   *                    or rejected if something went wrong
   */
    send(data) {
        // Convert data to the string using global object
        data = String(data);

        // Return rejected promise immediately if data is empty
        if (!data) {
            return Promise.reject('Data must be not empty');
        }

        data += this._sendSeparator;

        // Split data to chunks by max characteristic value length
        let chunks = this.constructor._splitByLength(data, this._maxCharacteristicValueLength);

        // Return rejected promise immediately if there is no connected device
        if (!this._characteristic) {
            return Promise.reject('There is no connected device');
        }

        // Write first chunk to the characteristic immediately
        this._writeToCharacteristic(this._characteristic, chunks[0]);

        let promise = Promise.resolve();

        // Iterate over chunks if there are more than one of it
        for (let i = 1; i < chunks.length; i++) {
            // Chain new promise
            promise = promise.then(() => new Promise((resolve, reject) => {
                // Set timeout to send next chunk
                setTimeout(() => {
                    // Reject promise if the device has been disconnected
                    if (!this._characteristic) {
                        reject('Device has been disconnected');
                    }

                    // Write chunk to the characteristic and resolve the promise
                    this._writeToCharacteristic(this._characteristic, chunks[i]);
                    resolve();
                }, this._sendDelay);
            }));
        }

        return promise;
    }

    /**
   * Get the connected device name.
   *
   * @returns {string} Device name or empty string if not connected
   */
    getDeviceName() {
        if (!this._device) {
            return '';
        }

        return this._device.name;
    }

    _connectToDevice(device) {
        return (
            device
            ? Promise.resolve(device)
            : this._requestBluetoothDevice()).then(device => this._connectDeviceAndCacheCharacteristic(device)).then(characteristic => this._startNotifications(characteristic)).catch(error => this._log(error));
    }

    _disconnectFromDevice(device) {
        if (!device) {
            return;
        }

        this._log('Disconnecting from "' + device.name + '" bluetooth device...');

        device.removeEventListener('gattserverdisconnected', this._boundHandleDisconnection);

        if (!device.gatt.connected) {
            this._log('"' + device.name + '" bluetooth device is already disconnected');
            return;
        }

        device.gatt.disconnect();

        this._log('"' + device.name + '" bluetooth device disconnected');
    }

    _requestBluetoothDevice() {
        this._log('Requesting bluetooth device...');

        return navigator.bluetooth.requestDevice({
            filters: [
                {
                    services: [this._serviceUuid]
                }
            ]
        }).then(device => {
            this._log('"' + device.name + '" bluetooth device selected');

            this._device = device; // remember device
            this._device.addEventListener('gattserverdisconnected', this._boundHandleDisconnection);

            return this._device;
        });
    }

    _connectDeviceAndCacheCharacteristic(device) {
        if (device.gatt.connected && this._characteristic) { // check remembered characteristic
            return Promise.resolve(this._characteristic);
        }

        this._log('Connecting to GATT server...');

        return device.gatt.connect().then(server => {
            this._log('GATT server connected', 'Getting service...');

            return server.getPrimaryService(this._serviceUuid);
        }).then(service => {
            this._log('Service found', 'Getting characteristic...');

            return service.getCharacteristic(this._characteristicUuid);
        }).then(characteristic => {
            this._log('Characteristic found');

            this._characteristic = characteristic; // remember characteristic

            return this._characteristic;
        });
    }

    _startNotifications(characteristic) {
        this._log('Starting notifications...');

        return characteristic.startNotifications().then(() => {
            this._log('Notifications started');

            characteristic.addEventListener('characteristicvaluechanged', this._boundHandleCharacteristicValueChanged);
        });
    }

    _stopNotifications(characteristic) {
        this._log('Stopping notifications...');

        return characteristic.stopNotifications().then(() => {
            this._log('Notifications stopped');

            characteristic.removeEventListener('characteristicvaluechanged', this._boundHandleCharacteristicValueChanged);
        });
    }

    _handleDisconnection(event) {
        let device = event.target;

        this._log('"' + device.name + '" bluetooth device disconnected, trying to reconnect...');

        this._connectDeviceAndCacheCharacteristic(device).then(characteristic => this._startNotifications(characteristic)).catch(error => this._log(error));
    }

    _handleCharacteristicValueChanged(event) {
        let value = new TextDecoder().decode(event.target.value);

        for (let c of value) {
            if (c === this._receiveSeparator) {
                let data = this._receiveBuffer.trim();
                this._receiveBuffer = '';

                if (data) {
                    this.receive(data);
                }
            } else {
                this._receiveBuffer += c;
            }
        }
    }

    _writeToCharacteristic(characteristic, data) {
        characteristic.writeValue(new TextEncoder().encode(data));
    }

    _log(...messages) {
        console.log(...messages);
    }

    static _splitByLength(string, length) {
        return string.match(new RegExp('(.|[\r\n]){1,' + length + '}', 'g'));
    }
}
