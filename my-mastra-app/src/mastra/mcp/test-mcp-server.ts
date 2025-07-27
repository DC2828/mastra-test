import { MCPServer } from "@mastra/mcp";
import { weatherAgent } from "../agents/weather-agent";


export const server = new MCPServer({
    name: "Test MCP Server",
    version: "1.0.0",
    description: "A test server for Mastra MCP",
    tools:{},
    agents:{ weatherAgent },
});