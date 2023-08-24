import React, { useState } from "react";
import { Button, Form, Input, Label, FormGroup, } from 'reactstrap'
import instance from "../config/base";
import { useNavigate,Link } from 'react-router-dom'


export function Login() {

    const [codename, setCodename] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate();

    function handleSubmit(e) {
        localStorage.setItem("codename",codename)
        localStorage.setItem("password",password)
        e.preventDefault()
        navigate(`/feed`)
    }
    return (
        <>
            <div className="d-flex justify-content-center  w-100 " style={{ position: 'relative', top: '130px' }}>
                <div className="shadow p-5 rounded">
                    <Form className="form" onSubmit={handleSubmit}>
                        <FormGroup>
                            <Input
                                type="text"
                                name="email"
                                className="rounded-pill"
                                style={{backgroundColor:'black',color:'white',border:'solid',borderWidth:'1px',borderColor:'#212529'}}
                                required
                                value={codename}
                                onChange={e => setCodename(e.target.value)}
                                id="exampleEmail"
                                placeholder="codename"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Input
                                type="password"
                                name="password"
                                required
                                className="rounded-pill"
                                style={{backgroundColor:'black',color:'white',border:'solid',borderWidth:'1px',borderColor:'#212529'}}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                id="examplePassword"
                                placeholder="senha"
                            />
                        </FormGroup>
                        <Button style={{backgroundColor:'#212529',borderColor:'#212529'}} className="d-flex w-100 justify-content-center rounded-pill" type="submit">Entrar</Button>
                    </Form>
                    <br />
                    <Link to={`/register`}>Ainda não possui uma conta?</Link>
                </div>
            </div>
        </>
    )
}