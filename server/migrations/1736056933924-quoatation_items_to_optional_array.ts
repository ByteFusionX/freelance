import quotationModel from "../src/models/quotation.model";
import { connectToDatabase } from '../src/db/connect';


export async function up(): Promise<void> {
  await connectToDatabase();

  const result = await quotationModel.updateMany(
    { items: { $exists: true } },
    [
      {
        $set: {
          optionalItems: {
            $cond: {
              if: { $isArray: "$items" },
              then: ["$items"], 
              else: []
            }
          }
        }
      },
      {
        $unset: 'items'
      }
    ]
  );

  console.log(`Documents matched: ${result.matchedCount}`);
  console.log(`Documents modified: ${result.modifiedCount}`);
  console.log('Update process completed.');
}

export async function down (): Promise<void> {
  // Write migration here
}
