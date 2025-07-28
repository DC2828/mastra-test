import { MCPServer } from "@mastra/mcp";
import { MTRTrainAgent } from "../agents/MTR-train-agent";

export const transportServer = new MCPServer({
    name:"Transport Server",
    version: "1.0.0",
    description:"A server for handling users transport requests about arrival times, delays, and other transport-related information.",
    tools: {},
    agents: {MTRTrainAgent},
});