import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * RB2B Person Visit - Aggregated visitor data
 * Stores aggregated visitor information, one document per unique visitor
 */
export interface IRB2BPersonVisit extends Document {
  identity_key: string; // Unique index - unique identifier for the visitor
  first_seen: Date; // First time this visitor was seen
  last_seen: Date; // Indexed - most recent visit
  page_views: number; // Total number of page views
  last_page: string; // Most recent page visited
  visitor_data: {
    first_name?: string;
    last_name?: string;
    title?: string;
    company_name?: string;
    business_email?: string;
    website?: string;
    industry?: string;
    employee_count?: string;
    estimate_revenue?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    linkedin_url?: string;
  };
  all_pages: string[]; // Array of all pages visited (page visit history)
  unique_days: Date[]; // Array of unique days this visitor was seen
  unique_days_count: number; // Count of unique days
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

const RB2BPersonVisitSchema = new Schema<IRB2BPersonVisit>(
  {
    identity_key: { type: String, required: true, unique: true, index: true },
    first_seen: { type: Date, required: true },
    last_seen: { type: Date, required: true, index: true },
    page_views: { type: Number, default: 1 },
    last_page: { type: String, required: true },
    visitor_data: {
      first_name: { type: String, trim: true },
      last_name: { type: String, trim: true },
      title: { type: String, trim: true },
      company_name: { type: String, trim: true, index: true },
      business_email: { type: String, trim: true, lowercase: true, index: true },
      website: { type: String, trim: true },
      industry: { type: String, trim: true },
      employee_count: { type: String, trim: true },
      estimate_revenue: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipcode: { type: String, trim: true },
      linkedin_url: { type: String, trim: true },
    },
    all_pages: [{ type: String, trim: true }],
    unique_days: [{ type: Date }],
    unique_days_count: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common query patterns
RB2BPersonVisitSchema.index({ "visitor_data.company_name": 1, last_seen: -1 });
RB2BPersonVisitSchema.index({ "visitor_data.business_email": 1, last_seen: -1 });
RB2BPersonVisitSchema.index({ last_seen: -1 });

// TTL index example (uncomment if you want automatic expiration after 2 years)
// RB2BPersonVisitSchema.index({ last_seen: 1 }, { expireAfterSeconds: 63072000 });

const RB2BPersonVisit: Model<IRB2BPersonVisit> =
  mongoose.models.RB2BPersonVisit || mongoose.model<IRB2BPersonVisit>("RB2BPersonVisit", RB2BPersonVisitSchema);

export default RB2BPersonVisit;
