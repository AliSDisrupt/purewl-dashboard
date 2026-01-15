import mongoose, { Schema, Document, Model } from "mongoose";

// Visitor interface with all RB2B fields
export interface IVisitor extends Document {
  // Person Info
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  jobTitle?: string;
  linkedInUrl?: string;
  phone?: string;
  twitterUrl?: string;
  githubUrl?: string;
  bio?: string;
  profilePicture?: string;
  seniority?: string;
  department?: string;

  // Company Info
  company?: string;
  companyDomain?: string;
  industry?: string;
  companySize?: string;
  companyRevenue?: string;
  companyWebsite?: string;
  companyLinkedIn?: string;
  companyTwitter?: string;
  companyType?: string;
  companyFounded?: number;
  companyDescription?: string;
  companyTechnologies?: string[];
  companyFunding?: string;

  // Location
  country?: string;
  city?: string;
  region?: string;

  // Visit Info
  pageUrl?: string;
  pageTitle?: string;
  referrer?: string;
  visitedAt: Date;
  sessionId?: string;
  visitCount?: number;
  timeOnSite?: number;
  deviceType?: string;
  browser?: string;
  operatingSystem?: string;
  ipAddress?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  formSubmissions?: string[];

  // Behavioral Data
  engagementScore?: number;
  intentSignals?: string[];
  technologiesDetected?: string[];
  contentInterests?: string[];

  // Visit History
  firstVisitDate?: Date;
  lastVisitDate?: Date;
  pagesViewed?: string[];
  isRepeatVisit?: boolean; // RB2B: indicates if this is a repeat visitor

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
    phone: { type: String, trim: true },
    twitterUrl: { type: String, trim: true },
    githubUrl: { type: String, trim: true },
    bio: { type: String, trim: true },
    profilePicture: { type: String, trim: true },
    seniority: { type: String, trim: true },
    department: { type: String, trim: true },

    // Company Info
    company: { type: String, trim: true, index: true },
    companyDomain: { type: String, trim: true },
    industry: { type: String, trim: true },
    companySize: { type: String, trim: true },
    companyRevenue: { type: String, trim: true },
    companyWebsite: { type: String, trim: true },
    companyLinkedIn: { type: String, trim: true },
    companyTwitter: { type: String, trim: true },
    companyType: { type: String, trim: true },
    companyFounded: { type: Number },
    companyDescription: { type: String, trim: true },
    companyTechnologies: [{ type: String, trim: true }],
    companyFunding: { type: String, trim: true },

    // Location
    country: { type: String, trim: true, index: true },
    city: { type: String, trim: true },
    region: { type: String, trim: true },

    // Visit Info
    pageUrl: { type: String, trim: true },
    pageTitle: { type: String, trim: true },
    referrer: { type: String, trim: true },
    visitedAt: { type: Date, default: Date.now, index: true },
    sessionId: { type: String, trim: true, index: true },
    visitCount: { type: Number, default: 1 },
    timeOnSite: { type: Number }, // in seconds
    deviceType: { type: String, trim: true },
    browser: { type: String, trim: true },
    operatingSystem: { type: String, trim: true },
    ipAddress: { type: String, trim: true },
    utmSource: { type: String, trim: true },
    utmMedium: { type: String, trim: true },
    utmCampaign: { type: String, trim: true },
    formSubmissions: [{ type: String, trim: true }],

    // Behavioral Data
    engagementScore: { type: Number },
    intentSignals: [{ type: String, trim: true }],
    technologiesDetected: [{ type: String, trim: true }],
    contentInterests: [{ type: String, trim: true }],

    // Visit History
    firstVisitDate: { type: Date },
    lastVisitDate: { type: Date },
    pagesViewed: [{ type: String, trim: true }],
    isRepeatVisit: { type: Boolean }, // RB2B: indicates if this is a repeat visitor
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Create compound indexes for efficient queries
VisitorSchema.index({ email: 1, visitedAt: -1 });
VisitorSchema.index({ company: 1, visitedAt: -1 });
VisitorSchema.index({ sessionId: 1, visitedAt: -1 });
VisitorSchema.index({ country: 1, visitedAt: -1 });
VisitorSchema.index({ utmSource: 1, utmMedium: 1 });

// Prevent model recompilation in development
const Visitor: Model<IVisitor> =
  mongoose.models.Visitor || mongoose.model<IVisitor>("Visitor", VisitorSchema);

export default Visitor;
