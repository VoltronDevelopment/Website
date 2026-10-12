import { describe, expect, it } from "vitest";
import { ValidationError } from "@/lib/errors";
import { validateInquiry } from "@/lib/inquiries";

const validInquiry = {
  inquiryType: "Production — CED Coating",
  name: "  Ada Lovelace  ",
  company: "  Analytical Engines Ltd  ",
  email: "  ADA@EXAMPLE.COM  ",
  requirement: "  Discuss a coating program  ",
  phone: "  +1 555 0100  "
};

describe("validateInquiry", () => {
  it("accepts an optional company without inventing an organization", () => {
    expect(validateInquiry({ ...validInquiry, company: undefined }).company).toBe("");
  });
  it("accepts a people culture inquiry", () => {
    expect(validateInquiry({ ...validInquiry, inquiryType: "Building with Voltron" }).inquiryType).toBe("Building with Voltron");
  });
  it("trims user fields and normalizes email casing", () => {
    expect(validateInquiry(validInquiry)).toEqual({
      inquiryType: "Production — CED Coating",
      name: "Ada Lovelace",
      company: "Analytical Engines Ltd",
      email: "ada@example.com",
      requirement: "Discuss a coating program",
      phone: "+1 555 0100",
      componentType: undefined,
      material: undefined,
      monthlyVolume: undefined,
      coatingThickness: undefined,
      saltSprayRequirement: undefined
    });
  });

  it.each([
    [null, "Invalid request body."],
    [{ ...validInquiry, inquiryType: "Unrecognized intent" }, "Select a valid inquiry intent."],
    [{ ...validInquiry, email: "not-an-email" }, "Enter a valid email address."],
    [{ ...validInquiry, name: "  " }, "Name is required."],
    [{ ...validInquiry, requirement: "x".repeat(801) }, "Requirement is too long."],
    [{ ...validInquiry, material: "x".repeat(801) }, "One or more fields is too long."]
  ])("rejects invalid input with a validation error", (input, message) => {
    expect(() => validateInquiry(input)).toThrowError(
      expect.objectContaining<Partial<ValidationError>>({
        name: "ValidationError",
        message
      })
    );
  });
});
