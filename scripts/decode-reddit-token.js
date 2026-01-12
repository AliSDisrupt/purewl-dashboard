/**
 * Decode Reddit JWT token to see what it contains
 */

const token = "eyJhbGciOiJSUzI1NiIsImtpZCI6IlNIQTI1NjpzS3dsMnlsV0VtMjVmcXhwTU40cWY4MXE2OWFFdWFyMnpLMUdhVGxjdWNZIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyIiwiZXhwIjo0OTIzNjk5NjU0LjAwOTMyOSwiaWF0IjoxNzY3OTM5NjU0LjAwOTMyOSwianRpIjoiN1dUYzFCZE8xRDhLb2d0T25DODBMOHNKeEdxdWN3IiwiY2lkIjoiMVExRU96VFBXbll2ZXJocHR2Z1dzUSIsImxpZCI6InQyXzI1cnlqamY2c2UiLCJhaWQiOiJ0Ml8yNXJ5ampmNnNlIiwiYXQiOjUsImxjYSI6MTc2NzkzOTY1MjM2NCwic2NwIjoiZUp5S1ZrcE1LVTdPenl0TExTck96TThyVm9vRkJBQUFfXzlCRmdidSIsImZsbyI6MTAsImxsIjp0cnVlfQ.HcaxVZBO_XgkLUwQoORuLE3Cxfy5JSCYPYw3Kbv6w1dSPEzJgkUqZX2-NiBuLioQ2Nm2e9B3uwcw4qMMLqXuq2NqGlHYfncpMsXgOoFb-uDatUZioHklP9Ql2cxZ7qP6TSQB87irSTPRduG2aDhllyVatwRpncYehTvcGvi9pJW0kPHcNj3HmPO7OX575_p68hPP_xiPmp7BtwX3OI9QeHrUEC-h1hLZKP0luC93hg0LGcGqvWSyazJcEQk_f8nKYqDbLNB6JX5ioUf-ep2zdFqj12YKfplNtKXawUkebbR0TnSkpbB17bLCouU6Kdhjps12r8T_IntNmiQw7Vrn9Q";

// Decode JWT payload (base64)
const parts = token.split('.');
if (parts.length === 3) {
  const payload = parts[1];
  // Add padding if needed
  const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
  const decoded = Buffer.from(paddedPayload, 'base64').toString('utf-8');
  const parsed = JSON.parse(decoded);
  
  console.log("JWT Token Payload:");
  console.log(JSON.stringify(parsed, null, 2));
  console.log("\nToken Info:");
  console.log("- Subject (sub):", parsed.sub);
  console.log("- Expires (exp):", new Date(parsed.exp * 1000).toISOString());
  console.log("- Issued At (iat):", new Date(parsed.iat * 1000).toISOString());
  console.log("- Account ID (aid):", parsed.aid);
  console.log("- License ID (lid):", parsed.lid);
  console.log("- Client ID (cid):", parsed.cid);
  console.log("- Scopes (scp):", parsed.scp);
} else {
  console.log("Invalid JWT token format");
}
