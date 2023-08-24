import React from "react";

export const Main = () => {
    return (
        <>
            <div className="d-flex flex-column justify-content-center w-100 align-items-center gap-2">
                <h4>Seja bem vindo ao <strong>./SECRET</strong></h4>
                <h5><strong> Envie mensagens instantâneas gratuitamente para quem quiser sem restrição de acesso.</strong></h5>
                <h5> <strong>Converse com quem quiser utilizando seu 'codename' 😁😇</strong></h5>
                <h5><strong>Todas as conversas são criptografadas.
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-lock-fill" viewBox="0 0 16 16">
                        <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                    </svg>
                </strong></h5>
            </div>
        </>
    )
}