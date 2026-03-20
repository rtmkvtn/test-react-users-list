export interface IUser {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  age: number
  image: string
  address: {
    city: string
  }
}

export interface IUsersResponse {
  users: IUser[]
  total: number
  skip: number
  limit: number
}
