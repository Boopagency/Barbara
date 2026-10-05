import test from "node:test";
import assert from "node:assert/strict";
import {
  bookingUrl,
  validPhone,
  messages,
  INSTAGRAM_URL,
} from "../src/booking.mjs";

test("an absent or invalid phone never sends the visitor to a fabricated WhatsApp number", () => {
  for (const phone of [
    "",
    "undefined",
    "12345",
    "+55 41 99999-9999",
    "https://evil.example",
  ]) {
    assert.equal(validPhone(phone), false);
    assert.equal(bookingUrl("consulta", phone), INSTAGRAM_URL);
  }
});
test("each service carries the right encoded message to the configured WhatsApp", () => {
  const fixture = "5541999999999"; // Test fixture only; never used in public config.
  for (const service of Object.keys(messages)) {
    const url = new URL(bookingUrl(service, fixture));
    assert.equal(url.origin, "https://wa.me");
    assert.equal(url.pathname, `/${fixture}`);
    assert.equal(url.searchParams.get("text"), messages[service]);
  }
});
test("an unknown service has a safe general message", () => {
  assert.equal(
    new URL(bookingUrl("unknown", "5541999999999")).searchParams.get("text"),
    messages.geral,
  );
});
