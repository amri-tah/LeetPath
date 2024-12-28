async function getRecommendations(userId, numRecommendations, modelName) {
    try {
      const response = await fetch(`/recommend/${userId}?model=${modelName}&n=${numRecommendations}`); 
      if (!response.ok) {
        throw new Error('Network response not  ok');
      }
      const data = await response.json();
  
      if (data.error) {
        throw new Error(data.error);
      }
  
      return data.recommendations;
  
    } catch (error) {
      console.error('Error fetching the recommendations:', error);
      return []; 
    }
  }
  
  export default getRecommendations;