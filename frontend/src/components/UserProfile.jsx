import React, { useEffect, useState } from 'react';
import axios from 'axios';

function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('user'); // Logged-in user ID

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, orderResponse] = await Promise.all([
          axios.get(`https://backend-e-store.onrender.com/api/userprofile/${userId}`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }),
          axios.get(`https://backend-e-store.onrender.com/api/orders/${userId}`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }),
        ]);
        setUserData(userResponse.data);
        setOrderData(orderResponse.data.orders);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchData();
  }, [userId]);

  const styles = {
    container: {
      maxWidth: '600px',
      margin: '50px auto',
      padding: '30px',
      backgroundColor: '#f7f7f7',
      borderRadius: '12px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
    header: {
      marginBottom: '20px',
      textAlign: 'center',
    },
    userInfo: {
      fontSize: '18px',
      marginBottom: '20px',
    },
    orderContainer: {
      marginTop: '20px',
      padding: '15px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    orderItem: {
      marginBottom: '10px',
      borderBottom: '1px solid #eaeaea',
      paddingBottom: '10px',
    },
    loading: { textAlign: 'center', fontSize: '18px', color: '#3498db' },
    error: { textAlign: 'center', fontSize: '18px', color: '#e74c3c' },
  };

  if (loading) return <p style={styles.loading}>Loading...</p>;
  if (error) return <p style={styles.error}>{error}</p>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Welcome, {userData?.name || 'Guest'}!</h1>
        <p>{userData?.email || 'No email available'}</p>
      </div>

      <div style={styles.orderContainer}>
        <h3>Your Orders</h3>
        {orderData.length > 0 ? (
          orderData.map((order) => (
            <div key={order._id} style={styles.orderItem}>
              <p><strong>Order ID:</strong> {order._id}</p>
              <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
              <p><strong>Items Count:</strong> {order.orderItemsCount}</p>
              <p><strong>Total Price:</strong> ${order.totalPrice}</p>
              <p><strong>Status:</strong> {order.isDelivered ? 'Delivered' : 'Pending'}</p>
            </div>
          ))
        ) : (
          <p>No orders found.</p>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
