import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AppError } from "../server/utils/AppError";
import { signAccessToken, verifyAccessToken } from "../server/utils/jwt";
import {
  generateTicketQRPayload,
  TICKET_QR_TTL_MS,
  verifyTicketQRPayload,
} from "../server/utils/qr";

describe("Unit Tests: Server Utilities", () => {
  it("issues distinct ticket QR payloads that expire after five minutes", () => {
    const ticket = {
      id: "ticket-id",
      ticketNumber: "TKT-GOLD-123",
      bookingRef: "BK-123",
      concertId: "concert-id",
      concertTitle: "Live Concert",
      categoryName: "Gold",
      seat: "A-1",
      userId: "user-id",
    };
    const issuedAt = new Date("2026-10-08T00:00:00.000Z");
    const firstPayload = JSON.parse(generateTicketQRPayload(ticket, issuedAt));
    const secondPayload = JSON.parse(generateTicketQRPayload(ticket, issuedAt));

    assert.equal(Date.parse(firstPayload.expiresAt) - Date.parse(firstPayload.issuedAt), TICKET_QR_TTL_MS);
    assert.notEqual(firstPayload.nonce, secondPayload.nonce);
    assert.notEqual(firstPayload.signature, secondPayload.signature);
    assert.equal(firstPayload.ticketId, ticket.id);
    assert.equal(verifyTicketQRPayload(JSON.stringify(firstPayload), issuedAt)?.ticketId, ticket.id);
    assert.equal(
      verifyTicketQRPayload(JSON.stringify(firstPayload), new Date(issuedAt.getTime() + TICKET_QR_TTL_MS)),
      null
    );

    firstPayload.ticketNumber = "TKT-FAKE";
    assert.equal(verifyTicketQRPayload(JSON.stringify(firstPayload), issuedAt), null);
  });

  it("AppError creates operational error with correct status codes", () => {
    const error404 = new AppError("Resource not found", 404);
    assert.equal(error404.message, "Resource not found");
    assert.equal(error404.statusCode, 404);
    assert.equal(error404.status, "fail");
    assert.equal(error404.isOperational, true);

    const error500 = new AppError("Server explosion", 500);
    assert.equal(error500.statusCode, 500);
    assert.equal(error500.status, "error");
  });

  it("JWT sign and verify works correctly", () => {
    const payload = {
      userId: "test-user-id-123",
      email: "test@camtech.edu.kh",
      role: "USER",
    };

    const token = signAccessToken(payload);
    assert.ok(typeof token === "string" && token.length > 0);

    const decoded = verifyAccessToken(token);
    assert.equal(decoded.userId, payload.userId);
    assert.equal(decoded.email, payload.email);
    assert.equal(decoded.role, payload.role);
  });
});

describe("Unit Tests: Authentication Validation", () => {
  it("Validates OAuth schema with Google and Facebook", async () => {
    const { oauthSchema } = await import("../server/validations");
    const validGoogle = oauthSchema.safeParse({
      body: {
        provider: "GOOGLE",
        email: "fan@gmail.com",
        name: "Google Fan",
        providerId: "google_123456",
      },
    });
    assert.equal(validGoogle.success, true);

    const validFb = oauthSchema.safeParse({
      body: {
        provider: "FACEBOOK",
        name: "Facebook Fan",
        providerId: "fb_789012",
      },
    });
    assert.equal(validFb.success, true);

    const invalidProvider = oauthSchema.safeParse({
      body: {
        provider: "TWITTER",
        name: "Invalid",
        providerId: "tw_123",
      },
    });
    assert.equal(invalidProvider.success, false);
  });

  it("Validates Phone OTP sending and verification schemas", async () => {
    const { sendPhoneOtpSchema, verifyPhoneOtpSchema } = await import("../server/validations");

    const validSend = sendPhoneOtpSchema.safeParse({
      body: { phone: "+85512345678" },
    });
    assert.equal(validSend.success, true);

    const invalidSend = sendPhoneOtpSchema.safeParse({
      body: { phone: "123" },
    });
    assert.equal(invalidSend.success, false);

    const validVerify = verifyPhoneOtpSchema.safeParse({
      body: { phone: "+85512345678", code: "123456", name: "Sokha" },
    });
    assert.equal(validVerify.success, true);

    const invalidVerify = verifyPhoneOtpSchema.safeParse({
      body: { phone: "+85512345678", code: "12" },
    });
    assert.equal(invalidVerify.success, false);
  });
});

describe("Unit Tests: Cambodian Phone Utilities (+855)", () => {
  it("Normalizes various Cambodian phone formats to +855XXXXXXXX", async () => {
    const { normalizeCambodianPhone, isValidCambodianPhone, formatCambodianPhone } = await import(
      "../server/utils/phone"
    );

    // Local Cambodian with 0
    assert.equal(normalizeCambodianPhone("012 345 678"), "+85512345678");
    assert.equal(isValidCambodianPhone("012 345 678"), true);

    // Local Cambodian with 9 digits
    assert.equal(normalizeCambodianPhone("097 123 4567"), "+855971234567");
    assert.equal(isValidCambodianPhone("097 123 4567"), true);

    // With 00855
    assert.equal(normalizeCambodianPhone("0085512345678"), "+85512345678");

    // With 855 without plus
    assert.equal(normalizeCambodianPhone("85512345678"), "+85512345678");

    // Redundant 0 after +855 (+855012345678)
    assert.equal(normalizeCambodianPhone("+855012345678"), "+85512345678");

    // Pure 8 digits
    assert.equal(normalizeCambodianPhone("12345678"), "+85512345678");

    // Formatted presentation
    assert.equal(formatCambodianPhone("+85512345678"), "+855 12 345 678");
  });
});

describe("Unit Tests: Facebook OAuth Configuration & URLs", () => {
  it("Generates valid Facebook OAuth Authorization URL", async () => {
    const { AuthService } = await import("../server/services/auth.service");
    const fbUrl = AuthService.getFacebookAuthUrl();
    assert.ok(fbUrl.startsWith("https://www.facebook.com/v19.0/dialog/oauth"));
    assert.ok(fbUrl.includes("client_id="));
    assert.ok(fbUrl.includes("redirect_uri="));
    assert.ok(fbUrl.includes("scope=email"));
  });
});
