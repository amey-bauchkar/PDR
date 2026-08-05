/**
 * POST /api/rfq/submit
 * Submit an RFQ
 */
export declare const submitRfq: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * GET /api/rfq/:id
 * Get RFQ by ID
 */
export declare const getRfq: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * GET /api/rfq
 * Get all RFQs (admin only)
 */
export declare const getAllRfqs: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * GET /api/rfq/list
 * Get all RFQs for the Vite admin panel
 */
export declare const listRfqsForAdminPanel: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=rfqController.d.ts.map