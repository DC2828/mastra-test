import { createTool } from '@mastra/core/tools';
import {mastra} from '../index';
import { object, z } from 'zod';


export const MTRArrivalTool = createTool({
    id: "Get MTR Arrival Times",
    inputSchema: z.object({
        station: z.string().describe("The name of the MTR station to get arrival times for."),
        line: z.string().describe("The specific MTR line (e.g., Tsuen Wan Line, East Rail Line) if known."),
    }),
    outputSchema: z.object({
        info: z.object({
            up: z.array(
                z.object({
                    timeUntilNeextTrain: z.string().describe("Time until the next train arrives"),
                    arrivalTime: z.string().describe("The scheduled arrival time of the next train"),
                    destination: z.string().describe("The destination of the train"),
                    sequence: z.number().describe("The sequence number of the train in the schedule"),
                    platform: z.string().describe("The platform number where the train will arrive"),
                })
            ).optional().describe("the train in this array is going up (towards origin station)"),
            down: z.array(
                z.object({
                    timeUntilNeextTrain: z.string().describe("Time until the next train arrives"),
                    arrivalTime: z.string().describe("The scheduled arrival time of the next train"),
                    destination: z.string().describe("The destination of the train"),
                    sequence: z.number().describe("The sequence number of the train in the schedule"),
                    platform: z.string().describe("The platform number where the train will arrive"),
                }),
            ).optional().describe("the train in this array is going down (away from origin station)"),
            delay: z.boolean().describe("Whether there are any known delays for the next train"),
        }).optional(),
        error: z.string().optional().describe("Error message if the request fails"),
    }),
    description: "Provides real-time arrival times for MTR trains at specified stations.",
    execute: async ({context}:{context:{station:string,line:string}}) => {
        return await getMTRArrivalTimes(context.station, context.line);
    }
});

function getLineCode(line: string): string {
    const LineCodes: Record<string, string> = {
        "AIRPORT EXPRESS" : "AEL",
        "TUNG CHUNG LINE": "TCL",
        "TUEN MA LINE": "TML",
        "TSEUNG KWAN O LINE": "TKL",
        "EAST RAIL LINE": "ERL",
        "WEST RAIL LINE": "WRL",
        "SOUTH ISLAND LINE": "SIL",
        "TSUEN WAN LINE": "TWL",
        "ISLAND LINE": "ISL",
        "KWUN TONG LINE": "KTL",
    };

    return LineCodes[line.trim().toUpperCase()];
}

function getStationCode(station: string): string {
    const stationCodes: Record<string, string> = {
        "HONG KONG": "HOK",
        "KOWLOON": "KOW",
        "TSING YI": "TSY",
        "AIRPORT": "AIR",
        "ASIAWORLD EXPO": "AWE",
        "OLYMPIC": "OLY",
        "NAM CHEONG": "NAC",
        "LAI KING": "LAK",
        "SUNNY BAY": "SUN",
        "TUNG CHUNG": "TUC",
        "WU KAI SHA": "WKS",
        "MA ON SHAN": "MOS",
        "HENG ON": "HEO",
        "TAI SHUI HANG": "TSH",
        "SHEK MUN": "SHM",
        "CITY ONE": "CIO",
        "SHA TIN WAI": "STW",
        "CHE KUNG TEMPLE": "CKT",
        "TAI WAI": "TAW",
        "HIN KENG": "HIK",
        "DIAMOND HILL": "DIH",
        "KAI TAK": "KAT",
        "SUNG WONG TOI": "SUW",
        "TO KWA WAN": "TKW",
        "HO MAN TIN": "HOM",
        "HUNG HOM": "HUH",
        "EAST TSIM SHA TSUI": "ETS",
        "AUSTIN": "AUS",
        "MEI FOO": "MEF",
        "TSUEN WAN WEST": "TWW",
        "KAM SHEUNG ROAD": "KSR",
        "YUEN LONG": "YUL",
        "LONG PING": "LOP",
        "TIN SHUI WAI": "TIS",
        "SIU HONG": "SIH",
        "TUEN MUN": "TUM",
        "NORTH POINT": "NOP",
        "QUARRY BAY": "QUB",
        "YAU TONG": "YAT",
        "TIU KENG LENG": "TIK",
        "TSEUNG KWAN O": "TKO",
        "LOHAS PARK": "LHP",
        "HANG HAU": "HAH",
        "PO LAM": "POA",
        "ADMIRALTY": "ADM",
        "EXHIBITION CENTRE": "EXC",
        "MONG KOK EAST": "MKK",
        "KOWLOON TONG": "KOT",
        "SHA TIN": "SHT",
        "FO TAN": "FOT",
        "RACECOURSE": "RAC",
        "UNIVERSITY": "UNI",
        "TAI PO MARKET": "TAP",
        "TAI WO": "TWO",
        "FANLING": "FAN",
        "SHEUNG SHUI": "SHS",
        "LO WO": "LOW",
        "LOK MA CHAU": "LMC",
        "OCEAN PARK": "OCP",
        "WONG CHUK HANG": "WCH",
        "LEI TUNG": "LET",
        "SOUTH HORIZONS": "SOH",
        "CENTRAL": "CEN",
        "TSIM SHA TSUI": "TST",
        "JORDAN": "JOR",
        "YAU MA TEI": "YMT",
        "MONG KOK": "MOK",
        "PRINCE EDWARD": "PRE",
        "SHAM SHUI PO": "SSP",
        "CHEUNG SHA WAN": "CSW",
        "LAI CHI KOK": "LCK",
        "KWAI FONG": "KWF",
        "KWAI HING": "KWH",
        "TAI WO HAU": "TWH",
        "TSUEN WAN": "TSW",
        "KENNEDY TOWN": "KET",
        "HKU": "HKU",
        "SAI YING PUN": "SYP",
        "SHEUNG WAN": "SHW",
        "WAN CHAI": "WAC",
        "CAUSEWAY BAY": "CAB",
        "TIN HAU": "TIH",
        "FORTRESS HILL": "FOH",
        "TAI KOO": "TAK",
        "SAI WAN HO": "SWH",
        "SHAU KEI WAN": "SKW",
        "HENG FA CHUEN": "HFC",
        "CHAI WAN": "CHW",
        "WHAMPOA": "WHA",
        "SHEK KIP MEI": "SKM",
        "LOK FU": "LOF",
        "WONG TAI SIN": "WTS",
        "CHOI HUNG": "CHH",
        "KOWLOON BAY": "KOB",
        "NGAU TAU KOK": "NTK",
        "KWUN TONG": "KWT",
        "LAM TIN": "LAT"
    };
    return stationCodes[station.trim().toUpperCase()];
}

async function getMTRArrivalTimes(station: string, line: string) {
    const logger = mastra.getLogger();
    const stationCode = getStationCode(station);
    const lineCode = getLineCode(line);

    logger.info(`Fetching MTR arrival times for station: ${station} (${stationCode}), line: ${line} (${lineCode})`);

    // logger.info(`Fetching MTR arrival times for station: ${station} (${stationCode}), line: ${line} (${lineCode})`);
    const url = `https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=${lineCode}&sta=${stationCode}`;
    const response = await fetch(url);
    if (response.status == 200) {
        const res = await response.json();
        logger.info("up",res.data[`${lineCode}-${stationCode}`].UP);
        return {
            content:{
                info: {
                    up: res.data[`${lineCode}-${stationCode}`].UP? (res.data[`${lineCode}-${stationCode}`].UP).map((train: any) => ({   
                        timeUntilNeextTrain: train.ttnt,
                        arrivalTime: train.time,
                        destination: train.dest,
                        sequence: train.seq,
                        platform: train.plat,
                    })) : [],
                    down: res.data[`${lineCode}-${stationCode}`].DOWN? (res.data[`${lineCode}-${stationCode}`].DOWN).map((train: any) => ({
                        timeUntilNeextTrain: train.ttnt,
                        arrivalTime: train.time,
                        destination: train.dest,
                        sequence: train.seq,
                        platform: train.plat,
                    })) : [],
                    delay: res.isdelay, 
                }
            }
        };

    }else if(response.status == 429){
        return {
            error: "Too many requests. Please try again later."
        };
    }else if(response.status == 500){
        return {
            error: "Internal server error. Please try again later."
        };
    }else{
        return {
            error: "Something went wrong. Please try again later."
        }
    }
};