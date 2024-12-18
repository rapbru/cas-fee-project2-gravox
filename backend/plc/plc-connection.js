import { ControllerManager } from 'st-ethernet-ip';
import logger from '../utils/logger.js';

class PLCConnection {
    constructor(ipAddress, slot = 0) {
        this.ipAddress = ipAddress;
        this.slot = slot;
        this.controllerManager = new ControllerManager();
        this.controller = this.controllerManager.addController(
            this.ipAddress, 
            this.slot,
            1000,   // RPI auf 1 Sekunde setzen
            false,  // Connected Messaging deaktivieren
            5000    // Retry-Timeout auf 5 Sekunden setzen
        );
        this.connected = false;
    }

    async connect() {
        try {
            this.setupEventHandlers();
            await this.controller.connect();
            this.connected = true;
        } catch (error) {
            this.connected = false;
            throw error;
        }
    }

    setupEventHandlers() {  
        this.controller.on('Connected', () => {
            this.connected = true;
            logger.info('PLC connection established');
        });
    
        this.controller.on('Disconnected', () => {
            this.connected = false;
            logger.info('PLC connection lost - automatic reconnection will be attempted');
        });
    
        this.controller.on('Error', (error) => {
            logger.error('PLC error:', error);
        });
    }

    async disconnect() {
        try {
            await this.controller.disconnect();
            this.connected = false;
            logger.info(`Disconnected from PLC at ${this.ipAddress}`);
        } catch (error) {
            logger.error('Error disconnecting from PLC:', error);
        }
    }

    isConnected() {   
        return this.connected;
    }
}

export default PLCConnection;
