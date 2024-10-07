import { Controller } from 'st-ethernet-ip';

class PLCConnection {
    constructor(ipAddress, slot = 0) {
        this.ipAddress = ipAddress;
        this.slot = slot;
        this.controller = new Controller();
        this.connected = false;
    }

    async connect() {
        try {
            await this.controller.connect(this.ipAddress, this.slot);
            this.connected = true;
            console.log(`Connected to PLC at ${this.ipAddress}`);
        } catch (error) {
            this.connected = false;
            console.error('Error connecting to PLC:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            await this.controller.disconnect();
            this.connected = false;
            console.log(`Disconnected from PLC at ${this.ipAddress}`);
        } catch (error) {
            console.error('Error disconnecting from PLC:', error);
        }
    }

    isConnected() {
        try {
            console.log(`Connection established: ${this.controller.established}`);
            this.connected = this.controller.established;
        } catch (error) {
            console.log('Error connection to PLC disrupted:', error)
            this.connected = false;
        }
        
        return this.connected;
    }
}

export default PLCConnection;
