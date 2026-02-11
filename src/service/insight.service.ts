import { IInsight } from "../interface/insight.interface";
import { InsightRepository } from "../repository/insight.repository";

export class InsightService {
  private readonly repository = new InsightRepository();

  async getAllInsights(filters: Partial<IInsight> = {}, page?: number, limit?: number): Promise<IInsight[]> {
    return this.repository.findAll(filters, page, limit);
  }

  async countInsights(filters: Partial<IInsight> = {}): Promise<number> {
    return this.repository.count(filters);
  }

  async getUniqueFieldValues(fields: (keyof IInsight)[]): Promise<Record<string, any[]>> {
    return this.repository.getUniqueValues(fields);
  }

  async getTotalInsights(): Promise<number> {
    return this.repository.count();
  }

  async getAvgIntensity(): Promise<number> {
    return this.repository.avg("intensity");
  }

  async getAvgLikelihood(): Promise<number> {
    return this.repository.avg("likelihood");
  }

  async getAvgRelevance(): Promise<number> {
    return this.repository.avg("relevance");
  }

  async getAvgIntensityByTopic(): Promise<{ topic: string; avgIntensity: number }[]> {
    return this.repository.avgIntensityByTopic();
  }

  async getInsightsOverTime(): Promise<{ date: string; count: number }[]> {
    return this.repository.insightsOverTime();
  }

  async getBubbleChartData(): Promise<{ relevance: number; likelihood: number; intensity: number; topic: string; sector: string }[]> {
    return this.repository.bubbleChartData();
  }

  async getStackedBarData(): Promise<{ sector: string; topic: string; count: number }[]> {
    return this.repository.stackedBarData();
  }

  async createInsight(data: IInsight): Promise<IInsight> {
    return this.repository.create(data);
  }

  async updateInsight(id: string, data: Partial<IInsight>): Promise<IInsight | null> {
    return this.repository.update(id, data);
  }

  async deleteInsight(id: string): Promise<IInsight | null> {
    return this.repository.delete(id);
  }

  async getInsightById(id: string): Promise<IInsight | null> {
    return this.repository.findById(id);
  }

}
