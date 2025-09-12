import  { useState } from 'react';
import { Search, Download, Printer, Layout, Menu, Pencil, Trash } from 'lucide-react';

const UserListTable = () => {
  const [users] = useState([
    { id: 1, name: 'rakesh', email: 'aswin@gmail.com', phone: '1111111111', password: '123' },
    { id: 2, name: 'raj', email: 'sksahoosanu7@gmail.com', phone: '3287381292', password: '262838327' },
    { id: 3, name: 'jayram', email: 'jay@gmail.com', phone: '9287831972', password: 'hdhggh27652' },
    { id: 4, name: 'aswiniii', email: 'www@gmail.com', phone: '00009875123', password: '78jbh998' },
    { id: 5, name: 'ttt', email: 'cdf@gmail.com', phone: '6543982074', password: '366327rr' },
    { id: 6, name: 'hfgfh', email: 'anu7@gmail.com', phone: '456789034567', password: '4568yugjhb' },
    { id: 7, name: 'ppp', email: 'asw@gmail.com', phone: '1111111111', password: '199923' }
  ]);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-medium">User List</h1>
        <div className="flex items-center gap-4">
          <Search className="w-5 h-5 text-gray-500 cursor-pointer" />
          <Download className="w-5 h-5 text-gray-500 cursor-pointer" />
          <Printer className="w-5 h-5 text-gray-500 cursor-pointer" />
          <Layout className="w-5 h-5 text-gray-500 cursor-pointer" />
          <Menu className="w-5 h-5 text-gray-500 cursor-pointer" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-4 w-12">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300"
                />
              </th>
              <th className="p-4 text-left font-medium">Name</th>
              <th className="p-4 text-left font-medium">Email</th>
              <th className="p-4 text-left font-medium">Phone Number</th>
              <th className="p-4 text-left font-medium">Password</th>
              <th className="p-4 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </td>
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.phone}</td>
                <td className="p-4">{user.password}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="text-primary hover:text-primary">
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button className="text-primary hover:text-primary">
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserListTable;
