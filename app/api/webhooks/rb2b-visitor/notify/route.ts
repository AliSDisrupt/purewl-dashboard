import { NextResponse } from "next/server";
import { alertsStore } from "../route";

// In production, this would send a Slack notification
// You can integrate with Slack API here

export async function POST(request: Request) {
  try {
    const { alertId } = await request.json();

    if (!alertId) {
      return NextResponse.json(
        { error: "alertId is required" },
        { status: 400 }
      );
    }

    // Find the alert in the store
    const alert = alertsStore.find((a) => a.id === alertId);

    if (!alert) {
      return NextResponse.json(
        { error: "Alert not found" },
        { status: 404 }
      );
    }

    // Mark as notified
    alert.notified = true;

    // In production, you would:
    // 1. Fetch the alert from your database
    // 2. Get the deal owner from HubSpot
    // 3. Send Slack notification to that owner
    // 4. Mark alert as notified in database

    // Example Slack integration (commented out):
    /*
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (slackWebhookUrl) {
      await fetch(slackWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `🚨 High-Intent Alert: ${alert.visitorName} from ${alert.companyName} is viewing ${alert.pageUrl}. Deal: ${alert.dealName} (${alert.dealStage}) - $${alert.dealValue}`,
        }),
      });
    }
    */

    return NextResponse.json({
      success: true,
      message: "Notification sent (Slack integration pending)",
      alertId,
      alert,
    });
  } catch (error: any) {
    console.error("Notify Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send notification" },
      { status: 500 }
    );
  }
}
