import mongoose, { Schema, Document, Model } from "mongoose";
import type { InsightsClaudeInput } from "@/lib/insights/types";
import type { InsightsClaudeOutput } from "@/lib/insights/output-types";

export interface IInsight extends Document {
  date: string; // YYYY-MM-DD format (PKT date)
  generatedAt: string; // ISO timestamp
  input: InsightsClaudeInput;
  output: InsightsClaudeOutput;
  status: "success" | "partial" | "failed";
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InsightSchema = new Schema<IInsight>(
  {
    date: { type: String, required: true, unique: true, index: true },
    generatedAt: { type: String, required: true },
    input: { type: Schema.Types.Mixed, required: true },
    output: { type: Schema.Types.Mixed, required: true },
    status: { type: String, enum: ["success", "partial", "failed"], default: "success" },
    error: { type: String },
  },
  { timestamps: true }
);

InsightSchema.index({ date: -1 });
InsightSchema.index({ generatedAt: -1 });

const Insight: Model<IInsight> =
  mongoose.models.Insight || mongoose.model<IInsight>("Insight", InsightSchema);

export default Insight;
