'use client'
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
export const NotifyContext = createContext();
import { toast , ToastContainer } from "react-toastify";
import { MessageContext } from "./MessageContext";
const NotifyContextProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([])
    const {selectedUser} = useContext(MessageContext)
    useEffect(() => { 
        axios.get(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/notify/user` , {headers : {authorization : `Bearer ${localStorage.getItem("userToken")}`}})
        .then((res) => {
            setNotifications(res.data)
        }).catch((err) => {
            console.log(err)
        })
    }, [notifications])
    const AddNotify = async (content) => {
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/notify/send/${selectedUser._id}`, { content },
                {
                    headers:
                        { Authorization: `Bearer ${localStorage.getItem("userToken")}` }
                })
            toast.success(res.data.message);
        } catch (err) { 
            console.log(err)
        }
    }
    const deleteNotify = async (id) => {
        try {
            const res = await axios.delete(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/notify/${id}` , {headers : {authorization : `Bearer ${localStorage.getItem("userToken")}`}})
            toast.success(res.data.message);
        } catch (err) {
            console.log(err)
        }
    }
    return (
        <>
        <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            className="custom-toast-container"
            toastClassName="custom-toast"
        />
        <NotifyContext.Provider value={{
            notifications,
            setNotifications,
            AddNotify,
            deleteNotify
        }}>
        {children}
        </NotifyContext.Provider>
        </>
    );
};

export default NotifyContextProvider;