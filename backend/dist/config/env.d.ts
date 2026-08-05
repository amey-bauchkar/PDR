export declare const config: {
    nodeEnv: string;
    port: number;
    host: string;
    supabase: {
        url: string;
        anonKey: string;
        serviceRoleKey: string;
    };
    cors: {
        origin: string;
    };
    jwt: {
        secret: string;
        expiry: string;
    };
    crm: {
        webhookUrl: string;
        apiKey: string;
    };
    googleSheets: {
        sheetsId: string;
        sheetName: string;
        url: string;
        serviceAccountEmail: string;
        serviceAccountPrivateKey: string;
    };
    email: {
        sendgridApiKey: string;
        fromEmail: string;
    };
    logging: {
        level: string;
    };
    isDevelopment: () => boolean;
    isProduction: () => boolean;
};
export declare function validateConfig(): boolean;
//# sourceMappingURL=env.d.ts.map