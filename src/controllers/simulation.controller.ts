import { NextFunction, Request, Response } from "express";
import simulationService from "../services/simulation.service";
import { TemplateMessagePayload } from "../types/whatsapp.types";
import logger from "../utils/logger";

export class SimulationController {
  /**
   * Mock endpoint for POST /v{VERSION}/{phoneNumberId}/messages
   */
  async sendTemplateMessage(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Extract phone number ID from params (part of the URL)
      // e.g. /v21.0/100020003000/messages
      const phoneNumberId = req.params["phoneNumberId"];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = req.body as TemplateMessagePayload;

      logger.info("Simulation Controller: Received template message request", {
        phoneNumberId,
        to: payload.to,
        template: payload.template.name,
      });

      const whatsappResponse = await simulationService.sendTemplateMessage(
        phoneNumberId || "unknown",
        payload,
      );

      // Return exact WhatsApp API response format (Status 200 OK)
      res.status(200).json(whatsappResponse);
    } catch (error) {
      logger.error("Simulation Controller context error", error);
      next(error);
    }
  }
}

export default new SimulationController();
