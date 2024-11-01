// import PositionService from '../services/position-service.js';
// import { plcService } from '../plc/plc-service.js';

// export class PositionController {
//     constructor() {
//         this.positionService = new PositionService(plcService);
//     }

//     getAllPositions = async (req, res) => {
//         try {
//             const positions = await this.positionService.mapPositionData();
//             res.json(positions);
//         } catch (err) {
//             console.error('Error retrieving positions:', err);
//             res.status(500).json({ error: 'Internal Server Error' });
//         }
//     }
// }

// export const positionController = new PositionController();
