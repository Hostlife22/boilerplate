import colors = require("./colors");
export const content: any[];
export namespace theme {
    namespace extend {
        export namespace spacing {
            const full: string;
        }
        export namespace borderRadius {
            const xs: string;
        }
        export { colors };
    }
}
export const plugins: {
    handler: import("tailwindcss/types/config").PluginCreator;
    config?: Partial<import("tailwindcss/types/config").Config>;
}[];
//# sourceMappingURL=index.d.ts.map