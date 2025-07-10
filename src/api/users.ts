import axios from 'axios';

const apiUsers = () => {
  const fetchData = async () => {
    const response = await axios.get('http://localhost:8080/');
    return response.data;
  };

  return {
    fetchData
  }
}



export default apiUsers