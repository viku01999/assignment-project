import { Schema, model } from "mongoose";
import { IInsight } from "../interface/insight.interface";

const InsightSchema = new Schema<IInsight>(
    {
        end_year: String,
        intensity: { type: Number, required: true },
        sector: String,
        topic: String,
        insight: String,
        url: String,
        region: String,
        start_year: String,
        impact: String,
        added: String,
        published: String,
        country: String,
        relevance: Number,
        pestle: String,
        source: String,
        title: String,
        likelihood: Number
    },
    { timestamps: true }
);

export const InsightModel = model<IInsight>("Insight", InsightSchema);
