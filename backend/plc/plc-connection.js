import { ControllerManager } from 'st-ethernet-ip';

class PLCConnection {
    constructor(ipAddress, slot = 0) {
        this.ipAddress = ipAddress;
        this.slot = slot;
        this.controllerManager = new ControllerManager();
        this.controller = this.controllerManager.addController(this.ipAddress, this.slot);
        // this.controller.setMaxListeners(1000);
        this.connected = false;
    }

    async connect() {
        try {
            this.setupEventHandlers();
            await this.controller.connect();
            this.connected = true;
            console.log(`Connected to PLC at ${this.ipAddress}`);
        } catch (error) {
            this.connected = false;
            console.error('Error connecting to PLC:', error);
            throw error;
        }
    }

    setupEventHandlers() {
        // this.controller.on('TagChanged', (tag, prevValue) => {
        //   console.log(`${tag.name} changed from ${prevValue} to ${tag.value}`);
        // });
    
        this.controller.on('Connected', () => {
            this.connected = true;
            console.log('PLC connection established');
        });
    
        this.controller.on('Disconnected', () => {
            this.connected = false;
            console.log('PLC connection lost - automatic reconnection will be attempted');
        });
    
        this.controller.on('Error', (error) => {
            console.error('PLC error:', error);
        });
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
        return this.connected;
    }
}

export default PLCConnection;
