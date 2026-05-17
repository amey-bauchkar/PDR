import { OpticalLinkBudgetInput, OpticalLinkBudgetResult } from '../types/index.js';
import { AppError } from '../types/index.js';

export class CalculatorService {
  /**
   * Calculate optical link budget
   * Considers: distance, fiber loss, and connector losses
   */
  calculateOpticalLinkBudget(input: OpticalLinkBudgetInput): OpticalLinkBudgetResult {
    try {
      this.validateInput(input);

      // Fiber loss calculation (typically in dB/km)
      const fiberLossTotal = input.distance * input.fiberLoss;

      // Connector loss calculation (typically 0.3-0.5 dB per connector)
      const connectorLossPerConnector = 0.35; // dB
      const connectorLossTotal = input.connectorCount * connectorLossPerConnector;

      // Total loss
      const totalLoss = fiberLossTotal + connectorLossTotal;

      // Signal quality assessment
      let signalQuality = 'EXCELLENT';
      let recommendation = 'System is optimized for maximum performance.';

      if (totalLoss > 20) {
        signalQuality = 'POOR';
        recommendation = 'Total loss exceeds safe limits. Consider shorter distance or better fiber.';
      } else if (totalLoss > 15) {
        signalQuality = 'FAIR';
        recommendation = 'Signal quality is acceptable. Monitor performance regularly.';
      } else if (totalLoss > 10) {
        signalQuality = 'GOOD';
        recommendation = 'Good signal quality with acceptable performance margins.';
      }

      return {
        totalLoss: Math.round(totalLoss * 100) / 100, // Round to 2 decimals
        signalQuality,
        recommendation,
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(400, 'CALCULATION_ERROR', 'Failed to calculate optical link budget', error.message);
    }
  }

  /**
   * Validate calculator input
   */
  private validateInput(input: OpticalLinkBudgetInput): void {
    if (input.distance <= 0) {
      throw new AppError(400, 'INVALID_DISTANCE', 'Distance must be greater than 0 km');
    }

    if (input.fiberLoss <= 0) {
      throw new AppError(400, 'INVALID_FIBER_LOSS', 'Fiber loss must be greater than 0 dB/km');
    }

    if (input.connectorCount < 0) {
      throw new AppError(400, 'INVALID_CONNECTOR_COUNT', 'Connector count cannot be negative');
    }

    if (input.distance > 100) {
      throw new AppError(400, 'INVALID_DISTANCE', 'Distance exceeds maximum supported range (100 km)');
    }

    if (input.connectorCount > 20) {
      throw new AppError(400, 'INVALID_CONNECTOR_COUNT', 'Connector count exceeds maximum (20)');
    }
  }

  /**
   * Generate detailed report (can be used for PDF generation)
   */
  generateDetailedReport(input: OpticalLinkBudgetInput, result: OpticalLinkBudgetResult) {
    const fiberLossTotal = input.distance * input.fiberLoss;
    const connectorLossPerConnector = 0.35;
    const connectorLossTotal = input.connectorCount * connectorLossPerConnector;

    return {
      summary: {
        totalLoss: result.totalLoss,
        signalQuality: result.signalQuality,
      },
      breakdown: {
        fiberLoss: {
          distance: input.distance,
          lossPerKm: input.fiberLoss,
          total: Math.round(fiberLossTotal * 100) / 100,
        },
        connectorLoss: {
          count: input.connectorCount,
          perConnector: connectorLossPerConnector,
          total: Math.round(connectorLossTotal * 100) / 100,
        },
      },
      assessment: {
        quality: result.signalQuality,
        recommendation: result.recommendation,
      },
      metadata: {
        calculatedAt: new Date().toISOString(),
        version: '1.0',
      },
    };
  }
}

export const calculatorService = new CalculatorService();
