// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '3zfvis9y8j'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-d3o8djfldm8kxrnz.us.auth0.com',            // Auth0 domain
  clientId: 'aVvuAwEzk4fDdKuZKZh5JHELAHhYKASG',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
