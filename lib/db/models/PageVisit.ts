import mongoose, { Schema, Document, Model } from "mongoose";

// Page Visit interface
export interface IPageVisit extends Document {
  // Visitor identification
  sessionId: string;
  visitorId?: string; // Optional persistent visitor ID
  
  // Page information
  pageUrl: string;
  pageTitle?: string;
  pagePath: string;
  
  // Click tracking
  clickType?: "link" | "button" | "form" | "other";
  clickedElement?: string; // Element ID, class, or text
  clickedUrl?: string; // If clicking a link
  
  // Visitor information
  ipAddress: string;
  userAgent?: string;
  referrer?: string;
  
  // Device/Browser info
  deviceType?: "desktop" | "mobile" | "tablet";
  browser?: string;
  operatingSystem?: string;
  screenResolution?: string;
  
  // Location (if available)
  country?: string;
  city?: string;
  region?: string;
  
  // UTM parameters
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  
  // Timestamp
  visitedAt: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Page Visit Schema
const PageVisitSchema = new Schema<IPageVisit>(
  {
    sessionId: { type: String, required: true, index: true },
    visitorId: { type: String, index: true },
    
    pageUrl: { type: String, required: true },
    pageTitle: { type: String },
    pagePath: { type: String, required: true, index: true },
    
    clickType: { type: String, enum: ["link", "button", "form", "other"] },
    clickedElement: { type: String },
    clickedUrl: { type: String },
    
    ipAddress: { type: String, required: true, index: true },
    userAgent: { type: String },
    referrer: { type: String },
    
    deviceType: { type: String, enum: ["desktop", "mobile", "tablet"] },
    browser: { type: String },
    operatingSystem: { type: String },
    screenResolution: { type: String },
    
    country: { type: String, index: true },
    city: { type: String },
    region: { type: String },
    
    utmSource: { type: String },
    utmMedium: { type: String },
    utmCampaign: { type: String },
    utmTerm: { type: String },
    utmContent: { type: String },
    
    visitedAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient queries
PageVisitSchema.index({ sessionId: 1, visitedAt: -1 });
PageVisitSchema.index({ ipAddress: 1, visitedAt: -1 });
PageVisitSchema.index({ pagePath: 1, visitedAt: -1 });
PageVisitSchema.index({ visitorId: 1, visitedAt: -1 });
PageVisitSchema.index({ createdAt: -1 });

// Prevent model recompilation in development
const PageVisit: Model<IPageVisit> =
  mongoose.models.PageVisit || mongoose.model<IPageVisit>("PageVisit", PageVisitSchema);

export default PageVisit;
