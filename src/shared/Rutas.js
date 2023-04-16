import {BrowserRouter, Route, Routes, useNavigate} from "react-router-dom";
import {Login} from "./components/docente/Login";
import {NotFount} from "./components/NotFount";
import {NavbarDocente} from "./components/docente/NavbarDocente";
import {NavbarAdmin} from "./components/Admin/Nav-Bar/NavbarAdmin";
import {useEffect} from "react";

export const Rutas = () => {
    return(
        <BrowserRouter>
            <Routes>
                <Route path="auth" element={<Login/>}/>
                <Route path="loginAdm/*" element={<NavbarAdmin/>}/>
                <Route path="loginDte/*" element={<NavbarDocente/>}/>
                <Route index element={<Login/>}/>
                <Route path="*" element={<NotFount/>}/>
            </Routes>
        </BrowserRouter>
    )
}