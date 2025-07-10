import apiUsers from '@/api/users';

const TestApi = () => {
  const {
    fetchData
  } = apiUsers()

  const clickIvents = async () => {
    const response = await fetchData()
    console.log(response)
  };

  return (
    <div>
      <button onClick={clickIvents}>click</button>
    </div>
  )
}

export default TestApi
