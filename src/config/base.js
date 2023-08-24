import axios from "axios";

const instance = axios.create({
    baseURL:'https://api-go-web.onrender.com'
})

export default instance;

