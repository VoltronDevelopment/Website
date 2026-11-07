import {createHash} from "node:crypto";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient,UpdateCommand} from "@aws-sdk/lib-dynamodb";

/** A shared counter for hosted instances. The middleware also limits bursts before the route runs. */
export async function withinRequestWindow(request:Request, category:"inquiry"|"founder", limit:number){
  const table=process.env.INQUIRIES_TABLE_NAME;
  if(!table || process.env.VOLTRON_SHARED_LIMITS!=="1")return true;
  const ip=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const visitor=createHash("sha256").update(ip).digest("hex");
  const minute=Math.floor(Date.now()/60000);
  const client=DynamoDBDocumentClient.from(new DynamoDBClient({region:process.env.VOLTRON_AWS_REGION || process.env.AWS_REGION || "ap-south-1"}));
  try {
    await client.send(new UpdateCommand({
      TableName:table, Key:{id:`rate/${category}/${minute}/${visitor}`},
      UpdateExpression:"SET ttlEpoch = :ttl ADD requests :one",
      ConditionExpression:"attribute_not_exists(requests) OR requests < :limit",
      ExpressionAttributeValues:{":ttl":(minute+2)*60,":one":1,":limit":limit}
    }));
    return true;
  }catch(error){
    if(error instanceof Error && error.name==="ConditionalCheckFailedException")return false;
    throw error;
  }
}
