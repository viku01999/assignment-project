import { Request, Response } from "express";
import { InsightService } from "../service/insight.service";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";


const insightService = new InsightService();

interface InsightQuery {
    page?: string;
    limit?: string;
    end_year?: string;
    intensity?: string;
    sector?: string;
    topic?: string;
    start_year?: string;
    relevance?: string;
    likelihood?: string;
    country?: string;
    region?: string;
    pestle?: string;
    source?: string;
    title?: string;
    [key: string]: string | undefined;
}

export const getInsights = async (
    req: Request<{}, {}, {}, InsightQuery>,
    res: Response
): Promise<void> => {
    const {
        page: pageStr,
        limit: limitStr,
        ...filters
    } = req.query;

    if ((pageStr && !limitStr) || (!pageStr && limitStr)) {
        throw new ApiError(400, "Both page and limit must be provided together");
    }

    const page = pageStr ? parseInt(pageStr, 10) : undefined;
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;

    if ((page && isNaN(page)) || (limit && isNaN(limit))) {
        throw new ApiError(400, "Page and limit must be valid numbers");
    }

    const numericFields = ["intensity", "relevance", "likelihood"];
    numericFields.forEach((field) => {
        if (filters[field]) {
            const value = Number(filters[field]);
            if (!isNaN(value)) {
                filters[field] = value as any;
            } else {
                delete filters[field];
            }
        }
    });

    const totalItems = await insightService.countInsights(filters as any);

    const totalPages = page && limit ? Math.ceil(totalItems / limit) : 1;
    const currentPage = page || 1;

    const data = await insightService.getAllInsights(
        filters as any,
        page,
        limit
    );

    res.status(200).json(
        new ApiResponse(200, "Insights fetched successfully", {
            totalItems,
            totalPages,
            currentPage,
            data
        })
    );
};



export const getUniqueFilters = async (
    req: Request<{}, {}, {}, { fields?: string }>,
    res: Response
): Promise<void> => {
    let fields: string[] = [];

    if (req.query.fields) {
        fields = req.query.fields.split(",").map(f => f.trim());
    }

    if (fields.length === 0) {
        fields = [
            "start_year",
            "end_year",
            "intensity",
            "sector",
            "topic",
            "region",
            "country",
            "relevance",
            "pestle",
            // "source",
            "likelihood"
        ];
    }

    const uniqueValues = await insightService.getUniqueFieldValues(fields as any);

    res.status(200).json(
        new ApiResponse(200, "Unique filter values fetched successfully", uniqueValues)
    );
};



export const getWidgets = async (req: Request, res: Response): Promise<void> => {
    const totalInsights = await insightService.getTotalInsights();
    const avgIntensity = await insightService.getAvgIntensity();
    const avgLikelihood = await insightService.getAvgLikelihood();
    const avgRelevance = await insightService.getAvgRelevance();

    res.status(200).json(
        new ApiResponse(200, "KPI widgets fetched successfully", {
            totalInsights,
            avgIntensity,
            avgLikelihood,
            avgRelevance,
        })
    );
};


export const getGraphData = async (req: Request, res: Response): Promise<void> => {
    const barChart = await insightService.getAvgIntensityByTopic();
    const lineChart = await insightService.getInsightsOverTime();
    const bubbleChart = await insightService.getBubbleChartData();
    const stackedBar = await insightService.getStackedBarData();

    res.status(200).json(
        new ApiResponse(200, "Graph data fetched successfully", {
            barChart,
            lineChart,
            bubbleChart,
            stackedBar,
        })
    );
};
