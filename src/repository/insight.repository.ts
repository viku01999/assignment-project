import { IInsight } from "../interface/insight.interface";
import { InsightModel } from "../models/insight.schema";

export class InsightRepository {
    // Fetch all insights with optional filters and pagination
    findAll(filters: Partial<IInsight> = {}, page?: number, limit?: number): Promise<IInsight[]> {
        const query = { ...filters };
        let dbQuery = InsightModel.find(query);

        if (page && limit) {
            dbQuery = dbQuery.skip((page - 1) * limit).limit(limit);
        }

        return dbQuery.lean();
    }

    // Count documents matching filters
    count(filters: Partial<IInsight> = {}): Promise<number> {
        return InsightModel.countDocuments(filters);
    }

    // Get unique values for multiple fields
    async getUniqueValues(fields: (keyof IInsight)[]): Promise<Record<string, any[]>> {
        const result: Record<string, any[]> = {};

        for (const field of fields) {
            const values = await InsightModel.distinct(field as string);
            result[field as string] = values.filter(v => v !== null && v !== undefined && v !== "");
        }

        return result;
    }

    // Safe average of numeric field
    async avg(field: keyof IInsight, filters: Partial<IInsight> = {}): Promise<number> {
        const result = await InsightModel.aggregate([
            { $match: filters },
            {
                $group: {
                    _id: null,
                    avgValue: {
                        $avg: {
                            $convert: { input: `$${field}`, to: "double", onError: 0, onNull: 0 },
                        },
                    },
                },
            },
        ]);
        return result[0]?.avgValue || 0;
    }

    // Avg intensity by topic for bar chart
    async avgIntensityByTopic(filters: Partial<IInsight> = {}): Promise<{ topic: string; avgIntensity: number }[]> {
        return InsightModel.aggregate([
            { $match: filters },
            {
                $group: {
                    _id: "$topic",
                    avgIntensity: { $avg: { $convert: { input: "$intensity", to: "double", onError: 0, onNull: 0 } } },
                },
            },
            { $project: { _id: 0, topic: "$_id", avgIntensity: 1 } },
            { $sort: { avgIntensity: -1 } },
        ]);
    }

    // Insights over time for line chart
    async insightsOverTime(filters: Partial<IInsight> = {}): Promise<{ date: string; count: number }[]> {
        return InsightModel.aggregate([
            { $match: filters },
            { $group: { _id: "$published", count: { $sum: 1 } } },
            { $project: { _id: 0, date: "$_id", count: 1 } },
            { $sort: { date: 1 } },
        ]);
    }

    // Bubble chart data (relevance vs likelihood, intensity as size)
    async bubbleChartData(filters: Partial<IInsight> = {}): Promise<{ relevance: number; likelihood: number; intensity: number; topic: string; sector: string }[]> {
        return InsightModel.aggregate([
            { $match: filters },
            {
                $project: {
                    relevance: { $convert: { input: "$relevance", to: "double", onError: 0, onNull: 0 } },
                    likelihood: { $convert: { input: "$likelihood", to: "double", onError: 0, onNull: 0 } },
                    intensity: { $convert: { input: "$intensity", to: "double", onError: 0, onNull: 0 } },
                    topic: 1,
                    sector: 1,
                },
            },
        ]);
    }

    // Stacked bar chart data: topic by sector
    async stackedBarData(filters: Partial<IInsight> = {}): Promise<{ sector: string; topic: string; count: number }[]> {
        return InsightModel.aggregate([
            { $match: filters },
            { $group: { _id: { sector: "$sector", topic: "$topic" }, count: { $sum: 1 } } },
            { $project: { _id: 0, sector: "$_id.sector", topic: "$_id.topic", count: 1 } },
        ]);
    }
}
