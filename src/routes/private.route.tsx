import { useAppSelector } from "@/redux/hook";
import {Navigate} from "react-router-dom";
const PrivateRoutes = (props:any) => {
    const isAuthenticated = useAppSelector(state => state.auth.isLoggedIn);
    if (!isAuthenticated) {
        return <Navigate to="login"/>
    }
    return (
        <>
            {props.children}
        </>
    )
}
export default PrivateRoutes;