import { Client, Databases, Users } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  const client = new Client();
  const databases = new Databases(client);

  client
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(
      req.headers["x-appwrite-key"] ??
        "standard_a3f97cc2ff9a273cef1940cce2ca0086115a03c46a3cea19de2eebf83ada4186125b71125e10ce8ac853e2834bce01ff380124f3b380ba8bf4e7d070e04a1889e855dc50e45fe5e2d02a18b4140fffbf2574ba4a27b9450e83d4306495570d5a17bfdeb646f7d4100255e08837ac12b744f0ac439b5a2b9111d51b6bba56ac41"
    );

  const { startDate, endDate } = req.payload || {};
  const now = new Date();

  // Define ranges for week, month, and year
  const ranges = {
    week: {
      start: new Date(),
      end: now,
    },
    month: {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    },
    year: {
      start: new Date(now.getFullYear(), 0, 1),
      end: new Date(now.getFullYear(), 11, 31),
    },
    custom: null,
  };

  ranges.week.start.setDate(now.getDate() - 7);

  // Set custom range if dates are provided
  if (startDate && endDate) {
    ranges.custom = {
      start: new Date(startDate),
      end: new Date(endDate),
    };
  }

  // Mapping jobCardStatus to their titles
  const statusTitles = {
    0: "Job Created",
    1: "Parts Added",
    2: "Labour Added",
    3: "Quote Generated",
    4: "Pro Forma Generated",
    5: "Gate Pass Generated",
    6: "Tax Generated",
  };

  try {
    const results = {};

    // Fetch and aggregate data for each range
    for (const [key, range] of Object.entries(ranges)) {
      if (key === "custom" && !range) continue; // Skip custom if not provided

      const documents = await databases.listDocuments(
        "66b10c670021dc021477", // Replace with your Database ID
        "66e80a830013e7a81f31", // Replace with your Collection ID
        [
          sdk.Query.greaterThan("updatedAt", range.start.toISOString()),
          sdk.Query.lessThan("updatedAt", range.end.toISOString()),
        ]
      );

      // Aggregate data by jobCardStatus and map to titles
      const aggregatedData = Object.entries(
        documents.documents.reduce((acc, doc) => {
          const status = doc.jobCardStatus || 0;
          if (!acc[status]) acc[status] = 0;
          acc[status]++;
          return acc;
        }, {})
      ).map(([status, count]) => ({
        status: parseInt(status), // Numeric status
        title: statusTitles[status], // Title mapping
        count, // Aggregated count
      }));
      //.sort((a, b) => a.status - b.status); // Ensure sorting by status

      results[key] = aggregatedData;
    }

    res.json({ data: results });
  } catch (error) {
    res.json({ error: error.message }, 500);
  }
};
