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


export const createInsights = async (
    req: Request,
    res: Response
): Promise<void> => {
    const payload = req.body;

    if (!payload || !payload.intensity) {
        throw new ApiError(400, "Intensity is required");
    }

    const createdInsight = await insightService.createInsight(payload);

    res.status(201).json(
        new ApiResponse(201, "Insight created successfully", createdInsight)
    );
};


export const getInsightsById = async (
    req: Request<{ id: string }>,
    res: Response
): Promise<void> => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, "Insight ID is required");
    }

    const insight = await insightService.getInsightById(id);

    if (!insight) {
        throw new ApiError(404, "Insight not found");
    }

    res.status(200).json(
        new ApiResponse(200, "Insight fetched successfully", insight)
    );
};


export const updateInsights = async (
    req: Request<{ id: string }>,
    res: Response
): Promise<void> => {
    const { id } = req.params;
    const payload = req.body;

    if (!id) {
        throw new ApiError(400, "Insight ID is required");
    }

    if (!payload || Object.keys(payload).length === 0) {
        throw new ApiError(400, "Update data is required");
    }

    const updatedInsight = await insightService.updateInsight(id, payload);

    if (!updatedInsight) {
        throw new ApiError(404, "Insight not found");
    }

    res.status(200).json(
        new ApiResponse(200, "Insight updated successfully", updatedInsight)
    );
};


export const deleteInsights = async (
    req: Request<{ id: string }>,
    res: Response
): Promise<void> => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, "Insight ID is required");
    }

    const deletedInsight = await insightService.deleteInsight(id);

    if (!deletedInsight) {
        throw new ApiError(404, "Insight not found");
    }

    res.status(200).json(
        new ApiResponse(200, "Insight deleted successfully", deletedInsight)
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
