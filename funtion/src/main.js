import { Client, Users } from 'node-appwrite';

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }) => {
  // You can use the Appwrite SDK to interact with other services
  // For this example, we're using the Users service
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(
      req.headers['x-appwrite-key'] ??
        'standard_6c561ebb631cc7217e78905352cb1deb1e9279eb71678973ae0f1aff1cd1331fadcd650b6ad827adf01a2926d05c153db447f9926cd4da448ab129086ca45b836f90f8bacc3e1097c689b07971c05ed0fb9e697c3e58c21196edfad50e25f2644d26824d832e608bc8e69bfbd1df5918fe70a5f480abf4ca255ade07f2600703'
    );
  const users = new Users(client);

  try {
    const response = await users.list();
    // Log messages and errors to the Appwrite Console
    // These logs won't be seen by your end users
    log(`Total users: ${response.total}`);
  } catch (err) {
    error('Could not list users: ' + err.message);
  }

  // The req object contains the request data
  if (req.path === '/ping') {
    // Use res object to respond with text(), json(), or binary()
    // Don't forget to return a response!
    return res.text('Pong');
  }

  const response = await users.list();
  console.log(response);

  return res.json({
    users: response,
  });
  // return res.json({
  //   users: response
  // });
};
