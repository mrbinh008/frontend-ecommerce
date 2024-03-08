import { IAuthState } from '@/interface/admin.auth';
import { login, logout } from '@/services/admin/auth.service'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'


const initialState: IAuthState = {
    isLoggedIn: false,
    loading: false,
    error: null,
    message: null,
    user: {
        id: 0,
        name: '',
        email: '',
        phone_number: '',
        avatar: '',
        is_active: false,
        role: ''
    },
    role: ''
};

export const postLogin = createAsyncThunk(
    'auth/login',
    async (payload: { email: string, password: string }, { rejectWithValue }) => {
        try {
            const response = await login(payload.email, payload.password);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const postLogout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            const response = await logout();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder.addCase(postLogin.fulfilled, (state, action) => {
            state.loading = false;
            state.isLoggedIn = true;
            state.user = {...initialState.user, ...action.payload.data.user};
            state.role = action.payload.data.user.role as typeof state.role;
            localStorage.setItem('access_token', action.payload.data.access_token);
        });
        builder.addCase(postLogin.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload.error as typeof state.error;
            state.message = action.payload.message as typeof state.message;
            console.log(action.payload);
        });

        builder.addCase(postLogout.fulfilled, (state) => {
            state.isLoggedIn = false;
            state.user = {
                id: 0,
                name: '',
                email: '',
                phone_number: '',
                avatar: '',
                is_active: false,
                role: ''
            };
            state.role = '';
            state.loading = false;
            state.error = null;
            state.message = "Logout success";
            localStorage.removeItem('access_token');
        });

    }
})
// export const { loginStart, loginSuccess, loginFailure, logoutSuccess } = authSlice.actions;

export default authSlice.reducer