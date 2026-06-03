const SUPABASE_URL = 'https://rwphopolciuwrmmzztpm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cGhvcG9sY2l1d3JtbXp6dHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwODYxNDcsImV4cCI6MjA3ODY2MjE0N30._O7Q0NsrEXNDcUbc_xBJwpt_FDBIkiiwErxXFWyJCro';

async function test() {
  const url = new URL('/rest/v1/tools', SUPABASE_URL);
  url.searchParams.set('select', '*');
  url.searchParams.set('limit', '5');

  console.log('Fetching:', url.toString());
  try {
    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    const data = await response.json();
    console.log('Data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error fetching from Supabase:', error);
  }
}

test();
