import React, { useEffect, useState } from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import AddProduct from './AddProduct';
import Sales from './Sales';
import AdminProducts from './AdminProducts';
import EditProducts from './EditProducts';
import axios from 'axios';
import ProfileForm from './ProfileForm';
// import Order from '../../../../backend/model/Orders';

const Dashboard = () => {
  const location = useLocation();
  const isadmin = localStorage.getItem('isadmin');
  const artistId = localStorage.getItem('artid');

  const [adminproducts, setAdminProducts] = useState([]);
  const [artistDetails, setArtistDetails] = useState(null);
  const [earned, setEarned] = useState({});
  const [leader, setLeader] = useState([]);
  const [orders, setOrders] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const isDashboardPage = location.pathname === '/dashboard';

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const fetchArtistData = async (term) => {
    try {
      const response = await axios.get('https://backend-e-store.onrender.com/api/search');
      const artistData = response.data;

      const foundArtist = artistData.find(
        (artist) => artist.name.toLowerCase() === term.toLowerCase()
      );

      if (foundArtist) {
        setArtistDetails(foundArtist);
        console.log('Artist found:', foundArtist);
      } else {
        setArtistDetails(null);
        console.log('Artist not found');
      }
    } catch (err) {
      console.error(err);
      setError('Error fetching artist data');
    }
  };

  const handleSearch = () => {
    fetchArtistData(searchTerm);
  };
  const handleDeliveryChange = async (orderId, newStatus) => {
    try {
      // Send the updated status to the backend
      const response = await axios.patch(`https://backend-e-store.onrender.com/api/orders/${orderId}`, {
        isDelivered: newStatus,
      });
  
      // If successful, update the local state with the new status
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, isDelivered: newStatus } : order
        )
      );
      console.log('Delivery status updated');
    } catch (err) {
      console.error('Error updating delivery status:', err);
    }
  };
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, earnedRes, leaderboardRes, ordersRes] = await Promise.all([
          axios.get(`https://backend-e-store.onrender.com/api/productAdmin/${artistId}`),
          axios.get(`https://backend-e-store.onrender.com/api/earned/${artistId}`),
          axios.get('https://backend-e-store.onrender.com/api/leaderboard'),
          axios.get(`https://backend-e-store.onrender.com/api/ordersAdmin/${artistId}`),
        ]);

        setAdminProducts(productRes.data);
        setCount(productRes.data.length);
        setEarned(earnedRes.data);
        setLeader(leaderboardRes.data);
        setOrders(ordersRes.data.orders);
        console.log('Orders:', ordersRes.data.orders);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Error fetching dashboard data');
        setLoading(false);
      }
    };

    if (artistId) {
      fetchData();
    }
  }, [artistId]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Seller Dashboard</h2>
        <ul className="space-y-2">
          <li>
            <Link to="/dashboard" className="block py-2 px-4 hover:bg-gray-700 rounded-md">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/dashboard/add-product" className="block py-2 px-4 hover:bg-gray-700 rounded-md">
              Add Product
            </Link>
          </li>
          <li>
            <Link to="/dashboard/products" className="block py-2 px-4 hover:bg-gray-700 rounded-md">
              View Products
            </Link>
          </li>
          <li>
            <Link to="/dashboard/sales" className="block py-2 px-4 hover:bg-gray-700 rounded-md">
              Sales & Profit
            </Link>
          </li>
          <li>
            <Link to="/dashboard/profile" className="block py-2 px-4 hover:bg-gray-700 rounded-md">
              Profile
            </Link>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-8">
        {isadmin ? (
          <h2 className="text-2xl font-bold mb-6">Welcome to the Seller Dashboard</h2>
        ) : (
          <h2 className="text-xl text-red-500 font-bold">Access Denied</h2>
        )}

        {isDashboardPage && (
          <>
            <div className="bg-white p-6 rounded-md shadow-md mb-6">
              <h2 className="text-xl font-bold mb-4">Seller Overview</h2>
              <p>Here you can manage your products, track sales, and monitor performance.</p>
            </div>

            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white p-6 rounded-md shadow-md">
                    <h4 className="text-lg font-bold">Total Products</h4>
                    <p className="text-2xl">{count}</p>
                  </div>
                  <div className="bg-white p-6 rounded-md shadow-md">
                    <h4 className="text-lg font-bold">Total Sales</h4>
                    <p className="text-2xl">₹{earned.earnedAmount || 0}</p>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-4">Orders Overview</h3>
                {orders.length > 0 ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {orders.map((order) => (
      <div key={order._id} className="bg-white p-4 rounded-md shadow-md">
        <p><strong>Order ID:</strong> {order._id}</p>
        <p><strong>Total Price:</strong> ₹{order.totalPrice}</p>
        <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
        <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
        
        {/* Editable Delivered Status */}
        <div className="flex items-center">
          <strong>Is Delivered:</strong>
          <input
            type="checkbox"
            checked={order.isDelivered}
            onChange={() => handleDeliveryChange(order._id, !order.isDelivered)}
            className="ml-2"
          />
        </div>

        <p><strong>Is Paid:</strong> {order.isPaid ? 'Yes' : 'No'}</p>
      </div>
    ))}
  </div>
) : (
  <div>No orders found.</div>
)}

              </>
            )}
          </>
        )}

        <Routes>
          <Route path="add-product" element={<AddProduct />} />
          <Route path="sales" element={<Sales />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="edit-product/:id" element={<EditProducts />} />
          <Route path="profile" element={<ProfileForm />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
