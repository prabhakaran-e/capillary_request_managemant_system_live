import {
    Send,
    UserCircle2,
    Paperclip,
    FileText,
    Image,
    File,
    Download,
    Loader2,
    Menu,
    X,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import {
    fetcAllChats,
    fetchEmployeesByTopic,
    sendMessageComments,
    showFileUrl,
} from "../../../api/service/adminServices";
import uploadFiles from "../../../utils/s3BucketConfig";

const ChatComments = ({ reqId, reqid }) => {
    const userId = localStorage.getItem("capEmpId");
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [activeChatTopic, setActiveChatTopic] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileBase64, setFileBase64] = useState(null); // New state for base64 data
    const [isUploading, setIsUploading] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    // New state for employee tagging
    const [topicEmployees, setTopicEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const chatTopics = [
        "Head of Dept",
        "Business Finance",
        "Vendor Management",
        "Legal Team",
        "Info Security",
        "Head of Finance",
        "Requestor",
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const response = await fetcAllChats(reqId);
                if (response.status === 200) {
                    setChatMessages(response.data.chatData.commentLogs);
                    setTimeout(scrollToBottom, 100);
                }
            } catch (error) {
                console.error("Error fetching chats:", error);
            }
        };
        fetchChats();
    }, [reqId]);

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    // Fetch employees when a topic is selected
    useEffect(() => {
        const fetchEmployees = async () => {
            if (activeChatTopic) {
                console.log(activeChatTopic);
                try {
                    const response = await fetchEmployeesByTopic(
                        activeChatTopic,
                        reqId
                    );
                    if (response.status === 200) {
                        setTopicEmployees(response.data.empData || []);
                        // Reset selected employee when topic changes
                        setSelectedEmployee(null);
                    }
                } catch (error) {
                    console.error("Error fetching employees for topic:", error);
                    setTopicEmployees([]);
                }
            } else {
                // Reset employees when no topic is selected
                setTopicEmployees([]);
                setSelectedEmployee(null);
            }
        };

        fetchEmployees();
    }, [activeChatTopic]);

    // Close sidebar on mobile when a topic is selected
    useEffect(() => {
        const handleWindowResize = () => {
            if (window.innerWidth < 768) {
                setShowSidebar(false);
            } else {
                setShowSidebar(true);
            }
        };

        // Set initial state based on screen size
        handleWindowResize();

        // Add event listener
        window.addEventListener("resize", handleWindowResize);

        // Cleanup
        return () => {
            window.removeEventListener("resize", handleWindowResize);
        };
    }, []);

    // Convert file to base64 function
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);

            // Convert selected file to base64
            try {
                const base64Data = await fileToBase64(file);
                setFileBase64(base64Data);
            } catch (error) {
                console.error("Error converting file to base64:", error);
            }
        }
    };

    const convertUrlToBase64 = async (url) => {
        try {
            // Check if the URL is already a base64 string
            if (url.startsWith("data:")) {
                return url;
            }

            const response = await fetch(url);
            const blob = await response.blob();

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error("Error converting to base64:", error);
            throw error;
        }
    };

    const downloadFile = async (url, filename) => {
        try {
            const base64Data = await convertUrlToBase64(url);
            const link = document.createElement("a");
            link.href = base64Data;
            link.download = filename || "download";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error downloading file:", error);
            window.open(url, "_blank");
        }
    };

    const handleSendMessage = async () => {
        if (
            (!newMessage.trim() && !selectedFile) ||
            isUploading ||
            isSendingMessage
        )
            return;

        try {
            setIsUploading(true);
            setIsSendingMessage(true);
            let attachmentUrl = null;
            let attachmentType = null;
            let attachmentName = null;
            let attachmentBase64 = null; // Add base64 data

            if (selectedFile) {
                try {
                    // Store the base64 data before uploading
                    attachmentBase64 = fileBase64;
                    attachmentType = selectedFile.type;
                    attachmentName = selectedFile.name;

                    // Upload to S3 as before
                    const uploadResponse = await uploadFiles(
                        selectedFile,
                        "chat",
                        reqid
                    );
                    if (uploadResponse && uploadResponse.data.fileUrls[0]) {
                        attachmentUrl = uploadResponse.data.fileUrls[0];
                    } else {
                        throw new Error("Upload response is invalid");
                    }
                } catch (error) {
                    console.error("Error uploading file:", error);
                    setIsUploading(false);
                    setIsSendingMessage(false);
                    return;
                }
            }

            const newMsg = {
                reqId: reqId,
                senderId: userId,
                senderName: "You",
                userImage: null,
                message: newMessage.trim(),
                attachmentUrl,
                attachmentType,
                attachmentName,
                attachmentBase64, // Add base64 data to the message
                timestamp: new Date().toISOString(),
                topic: activeChatTopic || "General Discussion",
                // Add tagged employee information
                taggedEmployeeId: selectedEmployee?._id || null,
                taggedEmployeeName:
                    selectedEmployee?.full_name ||
                    selectedEmployee?.hodName ||
                    null,
                taggedEmployeeEmail:
                    selectedEmployee?.company_email_id ||
                    selectedEmployee?.hodEmail,
            };

            const response = await sendMessageComments(newMsg);
            if (response.status === 200) {
                setChatMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        ...newMsg,
                        timestamp: new Date(newMsg.timestamp),
                    },
                ]);

                setNewMessage("");
                setSelectedFile(null);
                setFileBase64(null); // Reset the base64 data
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsUploading(false);
            setIsSendingMessage(false);
        }
    };

    const getFileIcon = (fileType) => {
        if (!fileType) return File;
        if (fileType.startsWith("image/")) return Image;
        if (fileType.includes("pdf")) return FileText;
        return File;
    };

    const renderAttachment = (url, fileType, fileName, base64Data) => {
        // Determine which source to use - base64 data has priority if available
        const fileSource = base64Data || url;
        const isImage = fileType?.startsWith("image/");
        const isPDF = fileType?.includes("pdf");
        const FileIcon = getFileIcon(fileType);
        const displayName = fileName || "Attachment";

        const handleDownload = async (e) => {
            e.preventDefault();
            await downloadFile(fileSource, fileName);
        };

        const handleShowFile = async (fileSource) => {
            try {
                // If it's already base64, just open it in a new window
                if (fileSource.startsWith("data:")) {
                    const newWindow = window.open();
                    if (newWindow) {
                        if (isImage) {
                            newWindow.document.write(
                                `<img src="${fileSource}" alt="${displayName}" style="max-width:100%; max-height:100%;">`
                            );
                        } else if (
                            isPDF &&
                            fileSource.startsWith("data:application/pdf")
                        ) {
                            newWindow.document.write(
                                `<iframe src="${fileSource}" width="100%" height="100%" style="border:none;"></iframe>`
                            );
                        } else {
                            newWindow.document.write(
                                `<a href="${fileSource}" download="${displayName}">Download ${displayName}</a>`
                            );
                        }
                    }
                } else {
                    // For URL, get a presigned URL
                    const response = await showFileUrl(fileSource);
                    if (response.status === 200) {
                        window.open(response.data.presignedUrl, "_blank");
                    } else {
                        console.error("No presigned URL received");
                    }
                }
            } catch (error) {
                console.error("Error displaying file:", error);
            }
        };

        const downloadButton = (
            <button
                onClick={handleDownload}
                className="flex items-center space-x-2 text-primary hover:text-primary/80 mt-2"
            >
                <Download size={16} />
                <span className="text-sm">
                    Download {isImage ? "Image" : isPDF ? "PDF" : "File"}
                </span>
            </button>
        );

        if (isImage) {
            return (
                <div className="max-w-xs bg-gray-50 p-2 rounded-lg">
                    <div className="overflow-hidden rounded-lg">
                        <button onClick={() => handleShowFile(fileSource)}>
                            <img
                                src={fileSource}
                                alt={displayName}
                                className="max-w-full max-h-48 rounded-lg object-contain bg-white"
                                onError={(e) => {
                                    console.error(
                                        "Image failed to load:",
                                        fileSource
                                    );
                                    e.target.src =
                                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
                                    e.target.className =
                                        "w-12 h-12 mx-auto text-gray-400";
                                }}
                            />
                        </button>
                    </div>
                    <div className="mt-2">
                        <div className="text-sm text-gray-600 truncate">
                            {displayName}
                        </div>
                        {downloadButton}
                    </div>
                </div>
            );
        }

        if (isPDF) {
            return (
                <div className="max-w-xs bg-gray-50 p-2 rounded-lg">
                    <div className="border rounded-lg p-2 bg-white">
                        <div className="flex items-center space-x-2 mb-2">
                            <FileText size={20} className="text-primary" />
                            <span className="text-sm font-medium truncate">
                                {displayName}
                            </span>
                        </div>
                        <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center">
                            <button
                                onClick={() => handleShowFile(fileSource)}
                                className="text-primary hover:underline flex items-center"
                            >
                                <FileText className="mr-1" size={20} />
                                View PDF
                            </button>
                        </div>
                    </div>
                    {downloadButton}
                </div>
            );
        }

        return (
            <div className="max-w-xs bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                    <FileIcon size={24} className="text-primary" />
                    <span className="text-sm font-medium truncate">
                        {displayName}
                    </span>
                </div>
                <button
                    onClick={() => handleShowFile(fileSource)}
                    className="flex items-center space-x-2 text-primary hover:text-primary/80 mt-2 mr-4"
                >
                    <FileText size={16} />
                    <span className="text-sm">View File</span>
                </button>
                {downloadButton}
            </div>
        );
    };

    const filteredMessages = activeChatTopic
        ? chatMessages.filter((msg) => msg.topic === activeChatTopic)
        : chatMessages;

    const handleTopicClick = (topic) => {
        setActiveChatTopic(topic);
        // On mobile, close the sidebar after selecting a topic
        if (window.innerWidth < 768) {
            setShowSidebar(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-screen relative">
            {/* Mobile header with menu button */}
            <div className="md:hidden bg-primary text-white p-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                    {activeChatTopic || "All Discussions"}
                </h3>
                <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="p-1 rounded-lg"
                >
                    {showSidebar ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <div
                className={`${
                    showSidebar ? "block" : "hidden"
                } md:block bg-gray-100 border-r p-4 overflow-y-auto w-full md:w-1/4 lg:w-1/5 absolute md:relative z-10 h-[calc(100%-4rem)] md:h-full`}
            >
                <h3 className="text-xl font-semibold text-primary mb-4 hidden md:block">
                    Chat Topics
                </h3>
                <div className="space-y-2">
                    <div
                        onClick={() => handleTopicClick(null)}
                        className={`p-3 rounded-lg cursor-pointer ${
                            activeChatTopic === null
                                ? "bg-primary text-white"
                                : "hover:bg-gray-200"
                        }`}
                    >
                        All Discussions
                    </div>
                    {chatTopics.map((topic, index) => (
                        <div
                            key={index}
                            onClick={() => handleTopicClick(topic)}
                            className={`p-3 rounded-lg cursor-pointer ${
                                activeChatTopic === topic
                                    ? "bg-primary text-white"
                                    : "hover:bg-gray-200"
                            }`}
                        >
                            {topic}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main chat area */}
            <div
                className={`${
                    showSidebar ? "hidden md:flex" : "flex"
                } flex-col flex-1 h-[calc(100%-4rem)] md:h-full`}
            >
                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {filteredMessages.map((msg, index) => (
                        <div key={index} className="flex items-start space-x-3">
                            {msg.userImage ? (
                                <img
                                    src={msg.userImage}
                                    alt={msg.senderName}
                                    className="w-10 h-10 rounded-full"
                                />
                            ) : (
                                <UserCircle2 className="w-10 h-10 text-gray-400" />
                            )}
                            <div className="flex-1">
                                <div className="flex justify-between items-center flex-wrap">
                                    <span className="font-semibold">
                                        {msg.senderName}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(
                                            msg.timestamp
                                        ).toLocaleString()}
                                    </span>
                                </div>
                                <div className="bg-gray-100 p-3 rounded-lg mt-1">
                                    <p className="break-words">{msg.message}</p>
                                    {(msg.attachmentUrl ||
                                        msg.attachmentBase64) && (
                                        <div className="mt-2">
                                            {renderAttachment(
                                                msg.attachmentUrl,
                                                msg.attachmentType,
                                                msg.attachmentName,
                                                msg.attachmentBase64
                                            )}
                                        </div>
                                    )}
                                    {msg.topic && (
                                        <span className="text-xs text-primary mt-1 block">
                                            Tag to: {msg.topic}
                                        </span>
                                    )}
                                    {msg.taggedEmployeeName && (
                                        <span className="text-xs text-green-600 mt-1 block">
                                            Tagged: {msg.taggedEmployeeName}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <div className="border-t p-2 md:p-4 bg-white">
                    <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center">
                        {/* Message input and attachment */}
                        <div className="flex flex-1 items-center space-x-2">
                            <input
                                id="message"
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 p-2 border rounded-lg"
                                autoComplete="off"
                            />

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className="hidden"
                                id="file-upload"
                            />
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <Paperclip
                                    size={20}
                                    className={`${
                                        selectedFile
                                            ? "text-primary"
                                            : "text-gray-500"
                                    } ${isUploading ? "animate-pulse" : ""}`}
                                />
                            </label>
                        </div>

                        {/* File name display */}
                        {selectedFile && (
                            <div className="md:hidden px-2">
                                <span className="text-xs text-gray-500 truncate block">
                                    {selectedFile.name}
                                </span>
                            </div>
                        )}

                        {/* Bottom row with tag and send */}
                        <div className="flex items-center space-x-2">
                            {/* Tag employee dropdown - moved before send button */}
                            {activeChatTopic && topicEmployees.length > 0 && (
                                <select
                                    value={selectedEmployee?._id || ""}
                                    onChange={(e) => {
                                        const selectedEmp = topicEmployees.find(
                                            (emp) =>
                                                emp._id === e.target.value ||
                                                emp.company_email_id ===
                                                    e.target.value
                                        );
                                        setSelectedEmployee(
                                            selectedEmp || null
                                        );
                                    }}
                                    className="p-2 border rounded-lg text-sm w-full md:w-auto"
                                >
                                    <option value="">Tag Employee</option>
                                    {topicEmployees.map((employee) => (
                                        <option
                                            key={
                                                employee._id ||
                                                employee.company_email_id
                                            }
                                            value={
                                                employee._id ||
                                                employee.company_email_id
                                            }
                                        >
                                            {employee.full_name}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {/* Selected file name (desktop only) */}
                            {selectedFile && (
                                <span className="hidden md:inline text-xs text-gray-500 truncate max-w-[150px]">
                                    {selectedFile.name}
                                </span>
                            )}

                            {/* Send button */}
                            <button
                                onClick={handleSendMessage}
                                disabled={
                                    isUploading ||
                                    isSendingMessage ||
                                    (!newMessage.trim() && !selectedFile)
                                }
                                className={`${
                                    isUploading ||
                                    isSendingMessage ||
                                    (!newMessage.trim() && !selectedFile)
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-primary hover:bg-primary/90"
                                } text-white p-2 rounded-lg flex items-center justify-center`}
                            >
                                {isSendingMessage ? (
                                    <Loader2
                                        size={20}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Send size={20} />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatComments;
