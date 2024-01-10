import axios from 'axios'

export const getUserByEmail = async (data: string) => {
  const result = await axios.get(`${process.env.BACKEND_URL}/api/user?email=${data}`, {
    headers: {
      'Content-Type': "application/json"
    }
  })

  return result.data
}
