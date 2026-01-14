import mongoose, { Schema, Document, Model } from "mongoose";

// Visitor interface
export interface IVisitor extends Document {
  // Person Info
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  jobTitle?: string;
  linkedInUrl?: string;

  // Company Info
  company?: string;
  companyDomain?: string;
  industry?: string;
  companySize?: string;
  companyRevenue?: string;

  // Location
  country?: string;
  city?: string;
  region?: string;

  // Visit Info
  pageUrl?: string;
  pageTitle?: string;
  referrer?: string;
  visitedAt: Date;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Visitor Schema
const VisitorSchema = new Schema<IVisitor>(
  {
    // Person Info
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    fullName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true, index: true },
    jobTitle: { type: String, trim: true },
    linkedInUrl: { type: String, trim: true },

    // Company Info
    company: { type: String, trim: true, index: true },
    companyDomain: { type: String, trim: true },
    industry: { type: String, trim: true },
    companySize: { type: String, trim: true },
    companyRevenue: { type: String, trim: true },

    // Location
    country: { type: String, trim: true, index: true },
    city: { type: String, trim: true },
    region: { type: String, trim: true },

    // Visit Info
    pageUrl: { type: String, trim: true },
    pageTitle: { type: String, trim: true },
    referrer: { type: String, trim: true },
    visitedAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Create compound index for efficient queries
VisitorSchema.index({ email: 1, visitedAt: -1 });
VisitorSchema.index({ company: 1, visitedAt: -1 });

// Prevent model recompilation in development
const Visitor: Model<IVisitor> =
  mongoose.models.Visitor || mongoose.model<IVisitor>("Visitor", VisitorSchema);

export default Visitor;
