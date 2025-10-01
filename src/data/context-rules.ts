// The markdown content for context rules
export const contextRulesMarkdown = `# Context Rules for JSON Data

## General Guidelines

- All data structures must follow the established schema
- Keys should use camelCase naming convention
- String values should use proper capitalization and punctuation
- Numeric values should use appropriate decimal precision

## Campaign Data

### Required Fields
- \`campaignName\`: Title of the email campaign
- \`sender\`: Object containing sender information
- \`content\`: Object containing email content

### Email Content Guidelines
- Subject lines should be concise and compelling
- Include a preheader that summarizes the email content
- All CTAs should have descriptive button text and valid URLs

## Customer Data

### Personal Information
- All customer records must include name, email, and at least one contact method
- Addresses should follow the standard format with proper capitalization
- Phone numbers should use international format with country code

### Purchase History
- Order IDs must follow the format \`ORD-XXXX\`
- All prices should be in EUR with 2 decimal places
- Product IDs should reference existing catalog items

## API Response Format

- All API responses must include \`status\`, \`code\`, and \`data\` fields
- Success responses should use HTTP 200 status code
- Error responses should include descriptive error messages
- Include pagination metadata for list endpoints

## System Configuration

- Environment variables should be properly documented
- Security credentials should never be exposed in plain text
- Feature flags should use boolean values
- Connection parameters should follow provider recommendations

---

## Data Validation Rules

| Data Type | Validation Rule | Example |
|-----------|----------------|---------|
| Email | Valid format with @ and domain | user@example.com |
| Price | Numeric with 2 decimal places | 299.99 |
| Date | ISO 8601 format | 2025-09-15T10:00:00Z |
| Phone | International format with country code | +34 612 345 678 |

---

> **Note**: These rules ensure data consistency across all systems and applications. Always validate data against these rules before submitting.`;
