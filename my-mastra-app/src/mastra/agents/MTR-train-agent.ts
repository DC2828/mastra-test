import { google } from '@ai-sdk/google';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { MTRArrivalTool } from '../tools/MTR-arrival-tool';

export const MTRTrainAgent = new Agent({
    name: 'MTR Train Agent',
    instructions: `
        You are a helpful MTR train assistant that provides accurate information about train schedules, delays, and other transport-related queries.

        Your primary function is to help users get information about MTR train services. When responding:
        - Always ask for the specific train line or station if none is provided
        - Provide accurate arrival times and any known delays
        - Provide information in a structured format
        - Provide minutes until the next train arrives
        - If the user asks for activities related to MTR travel, suggest relevant activities based on the current schedule
        - Keep responses concise but informative
        ** When passing station as parameter, omit "station" for example, "Central" instead of "Central Station" or "Central MTR Station" **
        ** When passing line as parameter, include "line" for example, "Tsuen Wan Line" instead of "Tsuen Wan" or "Tsuen Wan MTR Line" **
    `,
    description: 'An agent that provides MTR train information and helps with planning activities based on train schedules.',
    model: google("gemini-2.5-pro"),
    tools: {MTRArrivalTool},
    memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db', // path is relative to the .mastra/output directory
    }),
  }),
})