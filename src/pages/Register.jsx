import React, { useState } from "react";
import instance from "../config/base";
import { useNavigate } from "react-router-dom";
import { Button, Form, Input, Label, FormGroup, } from 'reactstrap'
import { Link } from "react-router-dom";


export function Register() {
    const [username, setUsername] = useState('')
    const [codename, setCodename] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate();


    function handleSubmit(e) {
        e.preventDefault()
        instance.post(`/user/`, {
            username: username,
            codename: codename,
            password: password
        })
            .then(res => {
                instance.post(`/ws/createRoom`, {
                    use_codename_owner: "true",
                    codename_owner: codename,
                    participant: codename
                })
                    .then(res => {

                    })
                    .catch(err => console.log(err))
                    alert("Conta criada com sucesso!")
                    navigate(`/`)
            })
            .catch(err => console.log(err))
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
                                required
                                value={username}
                                style={{backgroundColor:'black',color:'white',border:'solid',borderWidth:'1px',borderColor:'#212529'}}
                                onChange={e => setUsername(e.target.value)}
                                id="exampleEmail"
                                placeholder="username"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Input
                                type="text"
                                name="password"
                                required
                                className="rounded-pill"
                                value={codename}
                                style={{backgroundColor:'black',color:'white',border:'solid',borderWidth:'1px',borderColor:'#212529'}}
                                onChange={e => setCodename(e.target.value)}
                                id="examplePassword"
                                placeholder="codename"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Input
                                type="password"
                                name="password"
                                required
                                className="rounded-pill"
                                value={password}
                                style={{backgroundColor:'black',color:'white',border:'solid',borderWidth:'1px',borderColor:'#212529'}}
                                onChange={e => setPassword(e.target.value)}
                                id="examplePassword"
                                placeholder="password"
                            />
                        </FormGroup>
                        <Button style={{backgroundColor:'#212529',borderColor:'#212529'}} className="d-flex w-100 justify-content-center rounded-pill" type="submit">Cadastrar</Button>
                    </Form>
                    <br />
                    <Link to={`/`}>Já possui uma conta?</Link>
                </div>
            </div>
        </>
    )
}