import React, { useEffect, useState } from "react";
import instance from "../config/base";
import { Navigate } from "react-router-dom";


export const RouteRestrict = ({ children }) => {
    let codename = localStorage.getItem("codename")
    let password = localStorage.getItem("password")
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const authenticateUser = async () => {
        try {
            const response = await instance.get(`/user/verify/${codename}/${password}`)
            setIsAuthenticated(response.data.isAuthenticated)
        } catch (error) {
            console.error('Erro na autenticação:', error);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        authenticateUser();
    }, [])

    if (isLoading) {
        return <div>Carregando...</div>;
    }

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return <Navigate to={`/register`}/>
}
