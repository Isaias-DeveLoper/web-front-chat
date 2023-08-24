import React, { useEffect, useRef, useState } from "react";
import { Peer } from 'peerjs'

export const Call = () => {
    const [peerId, setPeerId] = useState(null)
    const [remotePeerIdValue, setRemotePeerIdValue] = useState('')
    const remoteVideoRef = useRef(null)
    const peerInstance = useRef(null)

    useEffect(() => {
        const peer = new Peer()
        peer.on('open', (id) => {
            setPeerId(id)
        })

        peer.on('call', (call) => {
           navigator.mediaDevices.getUserMedia(
                { video: true, audio: true },
                (mediaStream) => {
                    call.answer(mediaStream)
                })
        })

        console.log(peerId)
        peerInstance.current = peer
    }, [])

    const call = (remotePeerId) => {
        navigator.mediaDevices.getUserMedia(
            { video: true, audio: true },
            (stream) => {
                const call = peerInstance.current.call(remotePeerId, stream)
                call.on("stream", (remoteStream) => {
                    remoteVideoRef.current.srcObject = remoteStream
                    remoteVideoRef.current.play();
                })
            },
            (err) => {
                console.error(err)
            }
        )
    }

    console.log(peerId)
    return (
        <>
            <input type="text" value={remotePeerIdValue} onChange={e => setRemotePeerIdValue(e.target.value)} />
            <button onClick={() => call(remotePeerIdValue)}>Call</button>
            <div>
                <video width={100} height={100}>
                </video>
            </div>
            <div>
                <video ref={remoteVideoRef}></video>
            </div>
        </>
    )
}