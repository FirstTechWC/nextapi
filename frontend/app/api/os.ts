import { AppRoutes }    from './routes'
import { API_HEALTH, USER_DETAILS }   from '@/types/os'

export const GetAPIStatus = async (accessToken?: string): Promise<API_HEALTH> => {
    const url = AppRoutes.GetHealth()
    try {
        const headers: HeadersInit = {}
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`
        }
        const response = await fetch(url, {
            method: 'GET',
            headers
        })
        if(!response.ok){
            console.log(`Failed to fetch server health status: ${response.statusText}`)
            return {status : "not okay"}
        }
        const data = await response.json()
        return data
    }catch{
        console.log("Error: Not Able to check server health")
        return {status : "not okay"}
    }
}

export const GetUserInfo = async (accessToken?: string): Promise<USER_DETAILS> => {
    const url = AppRoutes.GetUserDetails()
    try {
        const headers: HeadersInit = {}
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`
        }
        const response = await fetch(url, {
            method: 'GET',
            headers
        })
        if(!response.ok){
            console.log(`Failed to fetch user details: ${response.statusText}`)
            return {id: "", username: "no user information", email: "", auth_type: ""}
        }
        const data = await response.json()
        return data
    }catch{
        console.log("Error: Not Able to fetch user details")
        return {id: "", username: "no user information", email: "", auth_type: ""}
    }
}