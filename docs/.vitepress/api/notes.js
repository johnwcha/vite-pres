/**
 * Function to fetch notes from the cloud function endpoint
 * @returns {Promise<any>} The response data from the API
 */
export async function getNotes() {
  try {
    const response = await fetch('https://us-west2-dujing-suibi.cloudfunctions.net/get-notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ all: true })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }
}
