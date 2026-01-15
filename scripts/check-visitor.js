/**
 * Script to check visitor data in MongoDB
 * Usage: node scripts/check-visitor.js <visitorId>
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Try to load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

const visitorId = process.argv[2];

if (!visitorId) {
  console.error('❌ Please provide a visitor ID');
  console.log('Usage: node scripts/check-visitor.js <visitorId>');
  process.exit(1);
}

// Visitor Schema (simplified)
const VisitorSchema = new mongoose.Schema({}, { strict: false, timestamps: true });

async function checkVisitor() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Visitor = mongoose.models.Visitor || mongoose.model('Visitor', VisitorSchema);

    const visitor = await Visitor.findById(visitorId).lean();

    if (!visitor) {
      console.log(`❌ Visitor with ID ${visitorId} not found`);
      process.exit(1);
    }

    console.log('\n📊 VISITOR DATA SAVED TO MONGODB:\n');
    console.log('='.repeat(60));
    
    // Group fields by category
    const categories = {
      '👤 Person Info': {
        firstName: visitor.firstName,
        lastName: visitor.lastName,
        fullName: visitor.fullName,
        email: visitor.email,
        jobTitle: visitor.jobTitle,
        linkedInUrl: visitor.linkedInUrl,
        phone: visitor.phone,
        twitterUrl: visitor.twitterUrl,
        githubUrl: visitor.githubUrl,
        bio: visitor.bio,
        profilePicture: visitor.profilePicture,
        seniority: visitor.seniority,
        department: visitor.department,
      },
      '🏢 Company Info': {
        company: visitor.company,
        companyDomain: visitor.companyDomain,
        industry: visitor.industry,
        companySize: visitor.companySize,
        companyRevenue: visitor.companyRevenue,
        companyWebsite: visitor.companyWebsite,
        companyLinkedIn: visitor.companyLinkedIn,
        companyTwitter: visitor.companyTwitter,
        companyType: visitor.companyType,
        companyFounded: visitor.companyFounded,
        companyDescription: visitor.companyDescription,
        companyTechnologies: visitor.companyTechnologies,
        companyFunding: visitor.companyFunding,
      },
      '📍 Location': {
        country: visitor.country,
        city: visitor.city,
        region: visitor.region,
      },
      '🌐 Visit Info': {
        pageUrl: visitor.pageUrl,
        pageTitle: visitor.pageTitle,
        referrer: visitor.referrer,
        visitedAt: visitor.visitedAt,
        sessionId: visitor.sessionId,
        visitCount: visitor.visitCount,
        timeOnSite: visitor.timeOnSite,
        deviceType: visitor.deviceType,
        browser: visitor.browser,
        operatingSystem: visitor.operatingSystem,
        ipAddress: visitor.ipAddress,
        utmSource: visitor.utmSource,
        utmMedium: visitor.utmMedium,
        utmCampaign: visitor.utmCampaign,
        formSubmissions: visitor.formSubmissions,
      },
      '📈 Behavioral Data': {
        engagementScore: visitor.engagementScore,
        intentSignals: visitor.intentSignals,
        technologiesDetected: visitor.technologiesDetected,
        contentInterests: visitor.contentInterests,
      },
      '📚 Visit History': {
        firstVisitDate: visitor.firstVisitDate,
        lastVisitDate: visitor.lastVisitDate,
        pagesViewed: visitor.pagesViewed,
      },
      '🕐 Metadata': {
        createdAt: visitor.createdAt,
        updatedAt: visitor.updatedAt,
        _id: visitor._id,
      },
    };

    // Print each category
    Object.entries(categories).forEach(([category, fields]) => {
      const hasData = Object.values(fields).some(v => v !== undefined && v !== null && v !== '');
      if (hasData) {
        console.log(`\n${category}:`);
        console.log('-'.repeat(60));
        Object.entries(fields).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              console.log(`  ${key}: [${value.length} items]`, value.length > 0 ? value.slice(0, 3) : '[]');
            } else if (value instanceof Date) {
              console.log(`  ${key}: ${value.toISOString()}`);
            } else {
              const displayValue = String(value).length > 100 
                ? String(value).substring(0, 100) + '...' 
                : value;
              console.log(`  ${key}: ${displayValue}`);
            }
          }
        });
      }
    });

    // Summary
    console.log('\n' + '='.repeat(60));
    const totalFields = Object.keys(visitor).length;
    const populatedFields = Object.values(visitor).filter(v => 
      v !== undefined && v !== null && v !== '' && 
      !(Array.isArray(v) && v.length === 0)
    ).length;
    console.log(`\n📊 Summary:`);
    console.log(`  Total fields: ${totalFields}`);
    console.log(`  Populated fields: ${populatedFields}`);
    console.log(`  Empty fields: ${totalFields - populatedFields}`);

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkVisitor();
