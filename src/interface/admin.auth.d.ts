export interface IUser {
    id: number,
    name: string,
    email: string,
    phone_number: string | null,
    avatar: string | null,
    is_active: boolean,
    role: string
}

export interface IAuthState {
    isLoggedIn: boolean;
    loading: boolean;
    error: [] | object | null;
    message: string | null;
    user: IUser;
    role:string;
}
export interface IAuthPayloadAction {
    status: number;
    data: {
        access_token: string;
        user: IUser;
    };
    message: string;
    error: [];
}