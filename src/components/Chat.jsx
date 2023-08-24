import React, { useEffect, useState } from "react";
import { Input, Form, Button } from "reactstrap";
import instance from "../config/base";
import EmojiPicker from 'emoji-picker-react';
import './Chat.css'
export function Chat({ roomId, codename, password }) {

    const [message, setMessage] = useState([])
    const [roomName, setRoomName] = useState('')
    const [socket, setSocket] = useState(null)
    const [mensagem, setMensagem] = useState('')
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [messageResponse, setMessageResponse] = useState('')
    const [status, setStatus] = useState('')
    const [fileBase64, setFileBase64] = useState([])

    const toggleEmojiPicker = () => {
        setShowEmojiPicker((prevState) => !prevState);
    };

    // Função para inserir o emoji selecionado no campo de texto
    const handleEmojiSelect = (emoji) => {
        setMensagem((prevText) => prevText + emoji.emoji);
    };


    useEffect(() => {
        const socket = new WebSocket(`wss://api-go-web.onrender.com/ws/joinRoom/${roomId}/200/${codename}`)
        setSocket(socket)
        instance.get(`/messages/message/${roomId}/${codename}/${password}`)
            .then(res => {
                setMessage(res.data)
            })
            .catch(err => console.log(err))

        instance.get(`/room/p/${roomId}`)
            .then(res => {
                if (res.data.owner === codename) {
                    setRoomName(res.data.participant)
                    instance.get(`/user/get_status/${res.data.participant}`)
                        .then(res => setStatus(res.data.status))
                        .catch(err => console.error(err))
                }
                else if (res.data.participant == codename) {
                    setRoomName(res.data.owner)
                    instance.get(`/user/get_status/${res.data.owner}`)
                        .then(res => setStatus(res.data.status))
                        .catch(err => console.error(err))
                }
            })
            .catch(err => {
                console.log(err)
            })

        socket.onopen = () => {
            console.log('WebSocket connection opened');
        };

        socket.onmessage = (event) => {
            const receivedMessage = event.data;
            setMessage((prevMessages) => [...prevMessages || [], JSON.parse(receivedMessage)]);
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed');
        };
    }, [roomId])

    const handleImageChange = (e) => {
        const files = e.target.files;
        const fileArray = Array.from(files);
        Promise.all(
            fileArray.map((file) => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);

                    reader.onload = () => {
                        const base64String = reader.result;
                        resolve(base64String);
                    };

                    reader.onerror = (error) => {
                        reject(error);
                    };
                });
            })
        ).then((results) => {
            setFileBase64(results);
        });
    };

    const enviarMensagem = (e) => {
        e.preventDefault()
        
        if(messageResponse){
            instance.post(`/messages/message`, {
                content: mensagem,
                roomId: roomId,
                username: codename,
                new_message: "",
                response: messageResponse
            })
            .then(res => {
                console.log(res)
            })
            .catch(err => console.log(err))
        }
        else {
            socket.send(mensagem)
        }

        // else if (fileBase64) {
        //     fileBase64.map(x => socket.send(x))
        // }

        setFileBase64([])
        setMensagem('')
        setMessageResponse('')
        setShowEmojiPicker(false);
    }
    function LoadMessages() {
        instance.get(`/messages/message/${roomId}/${codename}/${password}`)
            .then(res => {
                setMessage(res.data)
            })
            .catch(err => console.log(err))
    }

    useEffect(() => {
        const interval = setInterval(LoadMessages,30000)
        return () => clearInterval(interval)
    },[roomId])

    const handleOutsideClick = (event) => {
        if (event.target.closest(".emoji-picker")) return;
        setShowEmojiPicker(false);
    };

    function RefreshStatus() {
        instance.get(`/room/p/${roomId}`)
            .then(res => {
                if (res.data.owner === codename) {
                    setRoomName(res.data.participant)
                    instance.get(`/user/get_status/${res.data.participant}`)
                        .then(res => setStatus(res.data.status))
                        .catch(err => console.error(err))
                }
                else if (res.data.participant == codename) {
                    setRoomName(res.data.owner)
                    instance.get(`/user/get_status/${res.data.owner}`)
                        .then(res => setStatus(res.data.status))
                        .catch(err => console.error(err))
                }
            })
            .catch(err => {
                console.log(err)
            })
    }

    useEffect(() => {
        const interval = setInterval(RefreshStatus, 20000);
        return () => clearInterval(interval)
    }, [roomId])

    const ExcluirElemento = (el) => {
        const novoArray = fileBase64.filter(item => item !== el);
        setFileBase64(novoArray);
    };

    const VerificarBase64 = (string) => {
        const pref = string.slice(0, 10)
        let type;
        if (pref == "data:image") {
            type = "image"
        }
        else if (pref == "data:audio") {
            type = "audio"
        }
        return type
    }
    return (
        <>
            {
                roomId === "" ? (<></>) :
                    <>
                        <div className="d-flex flex-column w-100" style={{ position: 'relative', minHeight: '400px' }}>
                            <div className="header-user opacity-100 d-flex flex-column w-100">
                                <div className="d-flex w-100 p-2 align-items-center gap-1" style={{ height: '66px' }}>
                                    {status &&
                                        status == "online" ? (<>
                                            <div className="d-inline-flex rounded-pill p-1" style={{ backgroundColor: 'green' }}>
                                            </div>
                                        </>) :
                                        (<>
                                            <div className="d-inline-flex rounded-pill p-1" style={{ backgroundColor: 'red' }}>
                                            </div>
                                        </>)}
                                    <strong className="text-white fs-6">
                                        {roomName}
                                    </strong>
                                </div>
                            </div>
                            <div onClick={handleOutsideClick} className="overflow-scroll flex-column gap-2" style={{ height: '100%', maxHeight: '620px' }}>
                                {
                                    message &&
                                    message.map((element) => (
                                        element.content === "" || element.content === "_" ? (<></>) :
                                            element.username === codename ?
                                                (<>
                                                    {element.response != "_" ?
                                                        (<>
                                                            <div className="d-flex justify-content-end p-2 gap-4 align-items-center">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-reply" viewBox="0 0 16 16" onClick={e => setMessageResponse(element.content)}>
                                                                    <path d="M6.598 5.013a.144.144 0 0 1 .202.134V6.3a.5.5 0 0 0 .5.5c.667 0 2.013.005 3.3.822.984.624 1.99 1.76 2.595 3.876-1.02-.983-2.185-1.516-3.205-1.799a8.74 8.74 0 0 0-1.921-.306 7.404 7.404 0 0 0-.798.008h-.013l-.005.001h-.001L7.3 9.9l-.05-.498a.5.5 0 0 0-.45.498v1.153c0 .108-.11.176-.202.134L2.614 8.254a.503.503 0 0 0-.042-.028.147.147 0 0 1 0-.252.499.499 0 0 0 .042-.028l3.984-2.933zM7.8 10.386c.068 0 .143.003.223.006.434.02 1.034.086 1.7.271 1.326.368 2.896 1.202 3.94 3.08a.5.5 0 0 0 .933-.305c-.464-3.71-1.886-5.662-3.46-6.66-1.245-.79-2.527-.942-3.336-.971v-.66a1.144 1.144 0 0 0-1.767-.96l-3.994 2.94a1.147 1.147 0 0 0 0 1.946l3.994 2.94a1.144 1.144 0 0 0 1.767-.96v-.667z" />
                                                                </svg>
                                                                <div className="msg-res d-flex flex-column gap-3 p-2">
                                                                    <div className="text-white">
                                                                        res: {VerificarBase64(element.response) == "image" ? (<>
                                                                            <img src={element.response} className="rounded" alt="" width={50} height={50} />
                                                                        </>) :
                                                                            (<>
                                                                                {element.response}
                                                                            </>)}
                                                                    </div>
                                                                    <div className="text-break bg-dark d-inline-flex rounded text-white p-2" style={{ maxWidth: '400px' }}>
                                                                        {VerificarBase64(element.content) == "image" ? (<>
                                                                            <img src={element.content} alt="" width={300} height={300} />
                                                                        </>) :
                                                                            (<>
                                                                                {element.content}
                                                                            </>)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>) : (<>
                                                            <div className="d-flex justify-content-end p-2 gap-2 align-items-center">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-reply" viewBox="0 0 16 16" onClick={e => setMessageResponse(element.content)}>
                                                                    <path d="M6.598 5.013a.144.144 0 0 1 .202.134V6.3a.5.5 0 0 0 .5.5c.667 0 2.013.005 3.3.822.984.624 1.99 1.76 2.595 3.876-1.02-.983-2.185-1.516-3.205-1.799a8.74 8.74 0 0 0-1.921-.306 7.404 7.404 0 0 0-.798.008h-.013l-.005.001h-.001L7.3 9.9l-.05-.498a.5.5 0 0 0-.45.498v1.153c0 .108-.11.176-.202.134L2.614 8.254a.503.503 0 0 0-.042-.028.147.147 0 0 1 0-.252.499.499 0 0 0 .042-.028l3.984-2.933zM7.8 10.386c.068 0 .143.003.223.006.434.02 1.034.086 1.7.271 1.326.368 2.896 1.202 3.94 3.08a.5.5 0 0 0 .933-.305c-.464-3.71-1.886-5.662-3.46-6.66-1.245-.79-2.527-.942-3.336-.971v-.66a1.144 1.144 0 0 0-1.767-.96l-3.994 2.94a1.147 1.147 0 0 0 0 1.946l3.994 2.94a1.144 1.144 0 0 0 1.767-.96v-.667z" />
                                                                </svg>

                                                                <div className="text-break bg-dark d-inline-flex rounded text-white p-2" style={{ maxWidth: '400px' }}>
                                                                    {VerificarBase64(element.content) == "image" ? (<>
                                                                        <img src={element.content} alt="" width={250} height={250} />
                                                                    </>) :
                                                                        (<>
                                                                            {element.content}
                                                                        </>)}
                                                                </div>
                                                            </div>
                                                        </>)
                                                    }

                                                </>) :
                                                (<>
                                                    {element.response != "_" ? (<>
                                                        <div className="d-flex justify-content-start p-2 gap-2 align-items-center">
                                                            <div className="d-flex flex-row gap-3">
                                                                <div className="msg-res d-flex flex-column gap-3 p-2">
                                                                    <div className="text-white">
                                                                        res: {VerificarBase64(element.response) == "image" ? (<>
                                                                            <img src={element.response} className="rounded" alt="" width={50} height={50} />
                                                                        </>) :
                                                                            (<>
                                                                                {element.response}
                                                                            </>)}
                                                                    </div>
                                                                    <div className="text-break mw-25 bg-danger text-white d-inline-flex rounded text-white p-2" style={{ maxWidth: '400px' }}>
                                                                        {element.content}
                                                                    </div>
                                                                </div>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16" onClick={e => setMessageResponse(element.content)}>
                                                                    <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </>) :
                                                        (<>
                                                            <div className="d-flex justify-content-start p-2 gap-2 align-items-center">
                                                                <div className="text-wrap mw-25 bg-danger text-white d-inline-flex rounded p-2" style={{ maxWidth: '400px' }}>
                                                                    {VerificarBase64(element.content) == "image" ? (<>
                                                                        <img src={element.content} alt="" width={250} height={250} />
                                                                    </>) :
                                                                        (<>
                                                                            {element.content}
                                                                        </>)}
                                                                </div>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16" onClick={e => setMessageResponse(element.content)}>
                                                                    <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
                                                                </svg>
                                                            </div>
                                                        </>)}

                                                </>)
                                    ))
                                }
                            </div>
                            <div className="emoji-picker d-flex flex-column" style={{ position: 'absolute', top: '20%' }}>
                                {showEmojiPicker && (
                                    <EmojiPicker onEmojiClick={handleEmojiSelect} searchDisabled />
                                )}
                            </div>
                            <div className="position-absolute bottom-0 w-100">
                                {messageResponse && (
                                    <div className="p-1 align-items-center">
                                        <div className="p-2 response text-break d-flex justify-content-center align-items-center gap-2 rounded">
                                            {VerificarBase64(messageResponse) == "image" ? (<>
                                                <img className="rounded" src={messageResponse} alt="" width={100} height={100} />
                                            </>) :
                                                (<>
                                                    {messageResponse}
                                                </>)}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16" onClick={e => setMessageResponse('')}>
                                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z" />
                                            </svg>
                                        </div>
                                        <div>
                                        </div>
                                    </div>
                                )}
                                {fileBase64 && (
                                    <div className="d-flex response-img">
                                        {fileBase64.map((base64, index) => (
                                            <div className="d-flex p-1 align-items-center gap-2">
                                                <div key={index} className="d-flex justify-content-center align-items-center gap-2 rounded p-2">
                                                    {VerificarBase64(base64) == "image" ? (<>
                                                        <img className="img-send rounded" src={base64} alt="" width={100} height={100} onClick={e => ExcluirElemento(base64)} />
                                                    </>) :
                                                        (<>
                                                            {VerificarBase64(base64) == "audio" ? (<>
                                                                <div className="img-send d-flex flex-row gap-2rounded align-items-center" onClick={e => ExcluirElemento(base64)}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" fill="currentColor" class="bi bi-file-earmark-music-fill" viewBox="0 0 16 16">
                                                                        <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM11 6.64v1.75l-2 .5v3.61c0 .495-.301.883-.662 1.123C7.974 13.866 7.499 14 7 14c-.5 0-.974-.134-1.338-.377-.36-.24-.662-.628-.662-1.123s.301-.883.662-1.123C6.026 11.134 6.501 11 7 11c.356 0 .7.068 1 .196V6.89a1 1 0 0 1 .757-.97l1-.25A1 1 0 0 1 11 6.64z" />
                                                                    </svg>
                                                                    audio
                                                                </div>
                                                            </>) : (<>
                                                            <video className="img-send rounded" src={base64} width={100} height={100} onClick={e => ExcluirElemento(base64)} ></video>
                                                            </>)}
                                                        </>)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                                }
                                <div className="barra-enviar d-flex flex-column p-1">
                                    <Form onSubmit={enviarMensagem}>
                                        <div className="d-flex flex-row w-100 p-2 gap-1">
                                            <div className="">
                                                {/* <label htmlFor="file-input" className="label-file btn">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" class="bi bi-files" viewBox="0 0 16 16">
                                                        <path d="M13 0H6a2 2 0 0 0-2 2 2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 13V4a2 2 0 0 0-2-2H5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1zM3 4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4z" />
                                                    </svg>
                                                </label> */}
                                                <input multiple accept="*/*" onChange={handleImageChange} id="file-input" type="file" style={{ display: 'none' }} />
                                            </div>
                                            <div className="label-file btn rounded-pill" type="button" onClick={toggleEmojiPicker}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" class="bi bi-emoji-smile" viewBox="0 0 16 16">
                                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                                    <path d="M4.285 9.567a.5.5 0 0 1 .683.183A3.498 3.498 0 0 0 8 11.5a3.498 3.498 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.498 4.498 0 0 1 8 12.5a4.498 4.498 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zm4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5z" />
                                                </svg>
                                            </div>
                                            <Input className="msg input-group-lg" placeholder="Escreva uma mensagem..." value={mensagem} onChange={e => setMensagem(e.target.value)} type="text"></Input>
                                            <Button type="submit" className="b-send text-dark d-flex rounded-pill align-items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16">
                                                    <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
                                                </svg>
                                            </Button>
                                        </div>
                                    </Form>
                                </div>

                            </div>
                        </div>
                    </>
            }
        </>
    )
}