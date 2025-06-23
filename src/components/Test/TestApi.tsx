import axios from 'axios';

const TestApi = () => {

  const fetchData = async () => {
    const response = await axios.get('http://localhost:8080/');
    console.log(response.data);
  };

  return (
    <div>
      <button onClick={fetchData}>click</button>
    </div>
  )
}

export default TestApi
