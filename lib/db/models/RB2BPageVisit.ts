import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * RB2B Page Visit - Raw event data
 * Stores each individual page visit event from RB2B webhooks
 */
export interface IRB2BPageVisit extends Document {
  identity_key: string; // Indexed - unique identifier for the visitor
  seen_at: Date; // Indexed - when the visit occurred
  captured_url: string; // The page URL that was visited
  referrer?: string; // Referrer URL
  tags?: string; // Tags from RB2B
  first_name?: string;
  last_name?: string;
  title?: string;
  company_name?: string;
  business_email?: string;
  website?: string;
  industry?: string;
  employee_count?: string;
  estimate_revenue?: string;
  city: string; // Always present
  state: string; // Always present
  zipcode?: string;
  linkedin_url?: string;
  is_repeat_visit?: boolean; // If repeat visitor data is enabled
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

const RB2BPageVisitSchema = new Schema<IRB2BPageVisit>(
  {
    identity_key: { type: String, required: true, index: true },
    seen_at: { type: Date, required: true, index: true },
    captured_url: { type: String, required: true },
    referrer: { type: String },
    tags: { type: String },
    first_name: { type: String, trim: true },
    last_name: { type: String, trim: true },
    title: { type: String, trim: true },
    company_name: { type: String, trim: true, index: true },
    business_email: { type: String, trim: true, lowercase: true, index: true },
    website: { type: String, trim: true },
    industry: { type: String, trim: true },
    employee_count: { type: String, trim: true },
    estimate_revenue: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipcode: { type: String, trim: true },
    linkedin_url: { type: String, trim: true },
    is_repeat_visit: { type: Boolean },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common query patterns
RB2BPageVisitSchema.index({ company_name: 1, seen_at: -1 });
RB2BPageVisitSchema.index({ identity_key: 1, seen_at: -1 });
RB2BPageVisitSchema.index({ business_email: 1, seen_at: -1 });

// TTL index example (uncomment if you want automatic expiration after 1 year)
// RB2BPageVisitSchema.index({ seen_at: 1 }, { expireAfterSeconds: 31536000 });

const RB2BPageVisit: Model<IRB2BPageVisit> =
  mongoose.models.RB2BPageVisit || mongoose.model<IRB2BPageVisit>("RB2BPageVisit", RB2BPageVisitSchema);

export default RB2BPageVisit;
