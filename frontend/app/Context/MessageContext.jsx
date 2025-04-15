'use client'
import { createContext, useContext, useEffect, useState } from "react";
export const MessageContext = createContext();
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import api from "../lib/axios";
import { AuthContext } from "./AuthContext";
import swal from "sweetalert";
import { NotifyContext } from "./NotifyContext";
const MessageContextProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [isUserLoading, setIsUserLoading] = useState(true);
    const [selectedUser , setSelectedUser] = useState(null)
    const [messages, setMessages] = useState([])
    const [isMessagesLoading, setIsMessagesLoading] = useState(true)   
    // const { AddNotify } = useContext(NotifyContext)
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("userToken");
                if (!token) {
                    throw new Error("No token provided");
                }

                const res = await axios.get(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/message/users`, {
                    headers: {
                        authorization: `Bearer ${token}`,
                    },
                });

                setUsers(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsUserLoading(false);
            }
        };

        fetchUsers();
    }, []);
    useEffect(() => {
    const getMessagesBetweenTwins = async () => {
        try {   
            const token = localStorage.getItem("userToken");
            if (!token) {
                throw new Error("No token provided");
            }
            const res = await axios.get(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/message/${selectedUser?._id}` , {
                headers : {
                    authorization : `Bearer ${token}`
                }
            })
            setMessages(res.data)
        }   
        catch (err){
            console.log(err)
        }
        finally {
            setIsMessagesLoading(false);
        }
    };
    if (selectedUser) {
        getMessagesBetweenTwins()
    }
},[selectedUser , messages])
    const AddNewMessage = async (message, images) => {
    const formData = new FormData();

    // Append images if any
    if (images.length > 0) {
        images.forEach((img) => {
            formData.append('image', img); // Name this field as your backend expects
        });
    }

    // Append message
    formData.append('text', message);

    try {
        const res = await axios.post(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/message/send/${selectedUser._id}`,
        formData,
        {
            headers: {
            authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
        }
        );
        toast.success(res.data.message);
        // AddNotify(message)
    } catch (err) {
        console.log(err);
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
            <MessageContext.Provider
                value={{
                    users, 
                    isUserLoading,
                    setSelectedUser,
                    selectedUser,
                    messages,
                    isMessagesLoading
                    ,AddNewMessage
                }}
            >
                {children}
            </MessageContext.Provider>
        </>
    );
};    

export default MessageContextProvider;