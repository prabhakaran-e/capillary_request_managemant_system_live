import { useState } from "react";
import { Search, Send, Filter, Plus, Clock, X } from "lucide-react";
import avatar from "../../../assets/images/capilary_logo.png";

const DemoTickets = [
  {
    id: "T-1001",
    topic: "Login Issue",
    description: "Unable to access account",
    status: "open",
    lastUpdate: "2024-11-15",
    priority: "high",
  },
  {
    id: "T-1002",
    topic: "Payment Failed",
    description: "Transaction error on checkout",
    status: "in-progress",
    lastUpdate: "2024-11-14",
    priority: "medium",
  },
  {
    id: "T-1003",
    topic: "Feature Request",
    description: "Dark mode suggestion",
    status: "resolved",
    lastUpdate: "2024-11-13",
    priority: "low",
  },
  {
    id: "T-1004",
    topic: "Mobile App Crash",
    description: "App crashes on startup",
    status: "open",
    lastUpdate: "2024-11-15",
    priority: "high",
  },
];

const DemoMessages = {
  "T-1001": [
    {
      sender: "user",
      message: "I can't log into my account since yesterday",
      time: "09:00",
      avatar: avatar,
    },
    {
      sender: "agent",
      message:
        "I'm sorry to hear that. Can you tell me what error message you're seeing?",
      time: "09:05",
      avatar: avatar,
    },
    {
      sender: "user",
      message:
        "It says 'Invalid credentials' but I'm sure my password is correct",
      time: "09:07",
      avatar: avatar,
    },
  ],
  "T-1002": [
    {
      sender: "user",
      message: "Payment keeps failing on checkout",
      time: "14:20",
      avatar: avatar,
    },
    {
      sender: "agent",
      message:
        "Let me check the transaction logs. Could you provide the order number?",
      time: "14:25",
      avatar: avatar,
    },
  ],
};

const Support = () => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [newTicketTopic, setNewTicketTopic] = useState("");
  const [newTicketDescription, setNewTicketDescription] = useState("");

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "in-progress":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "resolved":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const filteredTickets = DemoTickets.filter((ticket) => {
    const matchesSearch =
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === "all") return matchesSearch;
    return matchesSearch && ticket.status === activeFilter;
  });

  const handleNewTicketSubmit = () => {
    if (!newTicketTopic.trim() || !newTicketDescription.trim()) {
      return;
    }

    const newTicket = {
      id: `T-${(DemoTickets.length + 1).toString().padStart(4, "0")}`,
      topic: newTicketTopic,
      description: newTicketDescription,
      status: "open",
      lastUpdate: new Date().toLocaleDateString(),
      priority: "medium",
    };
    DemoTickets.push(newTicket);
    setNewTicketTopic("");
    setNewTicketDescription("");
    setIsNewTicketModalOpen(false);
  };

  return (
    <div className="relative flex h-[600px] bg-gray-50 rounded-xl shadow-xl overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-primary">Support Tickets</h2>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button
                  onClick={() => setShowFilterOptions(!showFilterOptions)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <Filter size={16} className="text-gray-600" />
                </button>
                {showFilterOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border">
                    <button
                      onClick={() => {
                        setActiveFilter("open");
                        setShowFilterOptions(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => {
                        setActiveFilter("in-progress");
                        setShowFilterOptions(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      In-progress
                    </button>
                    <button
                      onClick={() => {
                        setActiveFilter("resolved");
                        setShowFilterOptions(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      Resolved
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className={`p-4 border-b cursor-pointer transition-all duration-200 hover:bg-purple-50
                ${
                  selectedTicket?.id === ticket.id
                    ? "bg-purple-50 border-l-4 border-l-primary"
                    : ""
                }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium text-gray-900">{ticket.id}</div>
                  <div className="text-sm font-medium text-gray-800">
                    {ticket.topic}
                  </div>
                </div>
                <div
                  className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(
                    ticket.status
                  )}`}
                >
                  {ticket.status}
                </div>
              </div>
              <div className="text-sm text-gray-500 line-clamp-2">
                {ticket.description}
              </div>
              <div className="flex items-center mt-2 text-xs text-gray-400">
                <Clock className="w-3 h-3 mr-1" />
                {ticket.lastUpdate}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        <button
          onClick={() => setIsNewTicketModalOpen(true)}
          className="absolute top-4 right-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus size={16} className="rounded-full bg-white text-primary" />
          <span>Raise New Ticket</span>
        </button>

        {selectedTicket ? (
          <div className="flex-1 flex flex-col h-full">
            <div className="p-6 border-b bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-primary">
                    {selectedTicket.topic}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Ticket ID: {selectedTicket.id}{" "}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-4">
                {DemoMessages[selectedTicket.id]?.map((message, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-start max-w-md ${
                        message.sender === "user"
                          ? "flex-row-reverse"
                          : "flex-row"
                      }`}
                    >
                      <img
                        src={message.avatar}
                        alt={message.sender}
                        className="w-8 h-8 rounded-full"
                      />
                      <div
                        className={`mx-2 p-3 rounded-lg ${
                          message.sender === "user"
                            ? "bg-primary text-white"
                            : "bg-white text-gray-700"
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Input Area */}
            <div className="p-4 bg-white border-t">
              {selectedTicket.status === "resolved" ? (
                <div className="text-center py-3 bg-gray-50 rounded-lg text-gray-500">
                  This ticket has been resolved and is closed for new messages
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 p-3 h-20 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:primary focus:border-transparent"
                    placeholder="Type your message..."
                  />
                  <button
                    onClick={() => console.log("Message sent:", newMessage)}
                    className="p-3 bg-primary text-white rounded-full hover:bg-primary transition-colors duration-200"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a ticket to view the conversation
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-primary">
                Create New Ticket
              </h3>
              <button
                onClick={() => setIsNewTicketModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  value={newTicketTopic}
                  onChange={(e) => setNewTicketTopic(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter ticket topic"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTicketDescription}
                  onChange={(e) => setNewTicketDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg h-32 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Describe your issue"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t">
              <button
                onClick={() => setIsNewTicketModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleNewTicketSubmit}
                disabled={
                  !newTicketTopic.trim() || !newTicketDescription.trim()
                }
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
