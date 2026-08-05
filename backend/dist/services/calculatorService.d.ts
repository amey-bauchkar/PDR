import { OpticalLinkBudgetInput, OpticalLinkBudgetResult } from '../types/index.js';
export declare class CalculatorService {
    /**
     * Calculate optical link budget
     * Considers: distance, fiber loss, and connector losses
     */
    calculateOpticalLinkBudget(input: OpticalLinkBudgetInput): OpticalLinkBudgetResult;
    /**
     * Validate calculator input
     */
    private validateInput;
    /**
     * Generate detailed report (can be used for PDF generation)
     */
    generateDetailedReport(input: OpticalLinkBudgetInput, result: OpticalLinkBudgetResult): {
        summary: {
            totalLoss: number;
            signalQuality: string;
        };
        breakdown: {
            fiberLoss: {
                distance: number;
                lossPerKm: number;
                total: number;
            };
            connectorLoss: {
                count: number;
                perConnector: number;
                total: number;
            };
        };
        assessment: {
            quality: string;
            recommendation: string;
        };
        metadata: {
            calculatedAt: string;
            version: string;
        };
    };
}
export declare const calculatorService: CalculatorService;
//# sourceMappingURL=calculatorService.d.ts.map