/**
 * Test script per verificare la query GraphQL degli advertisements
 */

const query = `
  query GetAdvertisements($limit: Int = 5) {
    advertisements(pagination: { limit: $limit }) {
      data {
        id
        attributes {
          title
          description
          shortDescription
          url
          buttonText
          brandColor
          position
          type
          priority
          isActive
          publishedAt
        }
      }
    }
  }
`;

const variables = {
  limit: 5
};

const testGraphQL = async () => {
  try {
    const response = await fetch('http://localhost:1337/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    const result = await response.json();
    
    if (result.errors) {
      console.error('❌ GraphQL Errors:', result.errors);
    } else {
      console.log('✅ GraphQL Success!');
      console.log('📊 Data:', JSON.stringify(result.data, null, 2));
      
      const ads = result.data?.advertisements?.data || [];
      console.log(`🎯 Found ${ads.length} advertisements`);
      
      ads.forEach((ad, index) => {
        console.log(`${index + 1}. ${ad.attributes.title} (${ad.attributes.position}) - Active: ${ad.attributes.isActive}`);
      });
    }
  } catch (error) {
    console.error('💥 Network Error:', error.message);
  }
};

console.log('🚀 Testing GraphQL Advertisement Query...');
console.log('📝 Query:', query);
console.log('📊 Variables:', variables);
console.log('---');

testGraphQL();
