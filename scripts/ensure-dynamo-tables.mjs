#!/usr/bin/env node
/**
 * Ensure Voltron website DynamoDB tables exist (idempotent).
 * Usage: node scripts/ensure-dynamo-tables.mjs
 */
import {
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
  waitUntilTableExists
} from "@aws-sdk/client-dynamodb";

const region = process.env.VOLTRON_AWS_REGION || process.env.AWS_REGION || "ap-south-1";
const tables = [
  process.env.INQUIRIES_TABLE_NAME || "VoltronWebsiteInquiries",
  process.env.PROJECTS_TABLE_NAME || "VoltronWebsiteProjects",
  process.env.REVIEWS_TABLE_NAME || "VoltronWebsiteReviews"
];

const client = new DynamoDBClient({ region });

async function ensureTable(tableName) {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    console.log(`exists  ${tableName}`);
    return;
  } catch (error) {
    if (error?.name !== "ResourceNotFoundException") throw error;
  }

  console.log(`create  ${tableName}`);
  await client.send(
    new CreateTableCommand({
      TableName: tableName,
      BillingMode: "PAY_PER_REQUEST",
      AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
      KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
      Tags: [
        { Key: "Project", Value: "VoltronWebsite" },
        { Key: "ManagedBy", Value: "ensure-dynamo-tables" }
      ]
    })
  );
  await waitUntilTableExists({ client, maxWaitTime: 120 }, { TableName: tableName });
  console.log(`ready   ${tableName}`);
}

for (const name of tables) {
  await ensureTable(name);
}

console.log("");
console.log("Set Amplify / .env.production:");
console.log(`VOLTRON_AWS_REGION=${region}`);
console.log(`INQUIRIES_TABLE_NAME=${tables[0]}`);
console.log(`PROJECTS_TABLE_NAME=${tables[1]}`);
console.log(`REVIEWS_TABLE_NAME=${tables[2]}`);
