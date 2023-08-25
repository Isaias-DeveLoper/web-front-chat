import React, { useEffect, useState } from "react";
import instance from "../config/base";
import { Input } from "reactstrap";
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { Chat } from "../components/Chat";
import { Lateral } from "../components/Lateral";
import debounce from "lodash.debounce"
import './Feed.css'
import { Main } from "../components/Main";


export function Feed() {
    const id = localStorage.getItem("codename")
    const password = localStorage.getItem("password")
    const [rooms, setRoom] = useState([])
    const [chat, setChat] = useState('')
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [sala, setSala] = useState('')
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [socket, setSocket] = useState(null)


    useEffect(() => {
        const socket = new WebSocket(`wss://api-go-web.onrender.com/ws/joinRoom/${id}/${id}/${id}`)
        setSocket(socket)
        instance.get(`/room/${id}`)
            .then(res => {
                setRoom(res.data)
            })
            .catch(err => {
                console.log(err)
            })

        socket.onopen = () => {
            console.log('WebSocket connection opened');
            instance.put(`/user/update_status`, {
                codename: id,
                password: password,
                status: "online"
            })
                .then(res => console.log(res))
                .catch(err => console.log(err))
        };

        socket.onmessage = (event) => {
            const receivedMessage = event.data;
            setRoom((prevMessages) => [...prevMessages || [], JSON.parse(receivedMessage)]);
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed');
            instance.put(`/user/update_status`, {
                codename: id,
                password: password,
                status: "offline"
            })
                .then(res => console.log(res))
                .catch(err => console.log(err))
        };

    }, [])



    function Search(val) {
        instance.get(`/user/${val}`)
            .then(res => {
                setResults(res.data)
                // console.log(res.data)
            })
            .catch(err => console.log(err))
    }

    const debouncedSearch = debounce(Search, 500)

    const handleInputChange = (event) => {
        setRoom([])
        setResults([])
        const { value } = event.target;
        setSearchTerm(value)
        if (value == "") {
            // debouncedSearch("a")
            setResults([])
        }
        else {
            setRoom([])
            debouncedSearch(value)
        }
    };

    function IngressChat(val) {

        if (isButtonDisabled) {
            return;
        }
        setIsButtonDisabled(true);
        setTimeout(() => {
            setIsButtonDisabled(false);
        }, 1000);

        instance.get(`/room/verify/${id}/${val}`)
            .then(res => {
                console.log(res.data)
                if (res.data.ID === 0) {
                    instance.post(`/ws/createRoom`, {
                        use_codename_owner: "",
                        codename_owner: id,
                        participant: val
                    })
                        .then(res => {
                            const socket = new WebSocket(`wss://api-go-web.onrender.com/ws/joinRoom/${val}/2/${id}`)
                            socket.onopen = () => {
                                console.log('WebSocket connection opened');
                                socket.send(res.data.id)
                            }
                            socket.onclose = () => {
                                console.log('WebSocket connection closed');
                            };
                            setChat(res.data.id)
                        })
                        .catch(err => console.log(err))
                } else {
                    instance.get(`/room/verify/${id}/${val}`)
                        .then(res => {
                            setChat(res.data.roomId)
                        })
                        .catch(err => console.log(err))
                }
            })
            .catch(err => console.log(err))
        // const socket = new WebSocket(`ws://localhost:8080/ws/joinRoom/${val}/2/${val}`)
    }

    function LoadChats() {
        instance.get(`/room/${id}`)
            .then(res => {
                setRoom(res.data)
            })
            .catch(err => console.log(err))
    }

    useEffect(() => {
        const interval = setInterval(LoadChats,50000)
        return () => clearInterval(interval)
    })

    function ExcluirChat(sala) {
        instance.delete(`/room/d/${sala}`)
            .then(res => {
                console.log(res)
                setSala('')
                setModalExcluirSala(false)
                setChat('')
            })
            .then(err => console.log(err))
    }

    function UpChat(room) {
        instance.get(`/room/u/${room}`)
            .then(res => console.log(res))
            .catch(err => console.log(err))

        setChat(room)
    }

    return (
        <div>
            <div className="d-flex flex-row">
                <Lateral socket={socket} id={id} password={password} />
                <ul className="menu nav flex-column min-vh-100 p-1" style={{ width: '600px' }}>
                    <div className="p-4 d-flex flex-column w-100 justify-content-start gap-3" style={{ color: 'white' }}>
                        <div className="fs-5">
                            <b>
                                Conversas
                            </b>
                        </div>

                        <div className="input-container" style={{ position: 'relative' }}>
                            <svg fill="#212529" style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)' }} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                                <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
                            </svg>
                            <Input value={searchTerm} onChange={handleInputChange} className="search" type="text" placeholder="Busque uma nova conversa" />
                        </div>

                    </div>
                    <div className="h-75 overflow-scroll" style={{ maxHeight: '610px', height: '610px' }}>
                        <div class="d-flex flex-column gap-1">
                            {
                                rooms &&
                                rooms.map((el) => (
                                    el.content === "" ? (<></>) :
                                        el.username == id && el.roomId == id ?
                                            (<></>) :
                                            (<>
                                                <div className="box-message btn d-flex shadow-sm p-2 rounded w-100 align-items-center gap-1" style={{ height: '60px' }} onClick={() => UpChat(el.content)}>
                                                    <h6 className="text-white">
                                                        {el.username == id ? (<>{el.roomId}</>) : (<>
                                                            {el.roomId == id ? (<>{el.username}</>) : (<></>)}
                                                        </>)}
                                                    </h6>
                                                    <div className="d-flex flex-row">
                                                        ...
                                                    </div>

                                                    <div className="btn d-flex justify-content-end position-relative w-100">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16" onClick={e => ExcluirChat(el.content)}>
                                                            <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        {
                                                            el.new_message === "" ? (<></>) :
                                                                (<>
                                                                    {
                                                                        el.new_message === "1" ? (<>
                                                                            <div className="d-flex text-success w-100 position-relative justify-content-end">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-text-fill" viewBox="0 0 16 16">
                                                                                    <path d="M16 8c0 3.866-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.5 5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7zm0 2.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7zm0 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4z" />
                                                                                </svg>
                                                                            </div>
                                                                        </>) :
                                                                            (<></>)
                                                                    }
                                                                </>)
                                                        }
                                                    </div>
                                                </div>
                                            </>)
                                ))
                            }
                            {
                                results &&
                                results.map((el) => (
                                    el.codename == "" ? (<></>) :
                                        (<>
                                            {
                                                el.codename == id ? (<></>) :
                                                    (<>
                                                        <div className="box-message btn d-flex shadow-sm p-2 rounded w-100 align-items-center gap-1" style={{ height: '60px' }} onClick={() => IngressChat(el.codename)}>
                                                            {el.status === "online" ? (
                                                                <>
                                                                    <div className="d-inline-flex rounded-pill p-1" style={{ backgroundColor: 'green' }}>
                                                                    </div>
                                                                </>
                                                            ) :
                                                                (<>
                                                                    <div className="d-inline-flex rounded-pill p-1" style={{ backgroundColor: 'red' }}>
                                                                    </div>
                                                                </>)}
                                                            <h6 className="text-white">
                                                                {el.codename}
                                                            </h6>
                                                            <div className="d-flex flex-row">
                                                                ...
                                                            </div>
                                                        </div>
                                                    </>)
                                            }
                                        </>)
                                ))
                            }
                        </div>
                    </div>
                </ul>
                {
                    chat === "" ? (<>
                        <Main />
                    </>) :
                        <Chat roomId={chat} codename={id} password={password} />
                }
            </div>
        </div>
    )
}
