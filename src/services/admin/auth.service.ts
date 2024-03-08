import axios from "@/utils/axoisCustom"

const login = (email: string, password: string) => {
    return axios.post('/auth/login', { email, password })
}
const logout = () => {
    return axios.post('/user/logout')
}
const forgotPassword = (email: string) => {
    return axios.post('/auth/forgot-password', { email })
}
const resetPassword = (token: string,email:string,password: string,password_confirmation:string) => {
    return axios.post('/auth/reset-password', { token,email,password, password_confirmation })
}
const refreshToken = (refreshToken: string) => {
    return axios.post('/auth/refresh-token', { refreshToken })
}
export {
    login,
    logout,
    forgotPassword,
    resetPassword,
    refreshToken
}