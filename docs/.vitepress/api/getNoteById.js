/**
 * Function to fetch a note by ID from the cloud function endpoint
 * @param {string} id - The ID of the note to fetch
 * @returns {Promise<any>} The response data from the API
 */
export async function getNoteById(id) {
    try {
      const response = await fetch('https://us-west2-dujing-suibi.cloudfunctions.net/get-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id })
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
  