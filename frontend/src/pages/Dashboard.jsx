import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiFolder, FiImage, FiTrendingUp, FiHeart, FiUpload, FiAlertCircle, FiBell } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import { statsAPI, reportsAPI, notificationsAPI } from '../config/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    categories: 0,
    images: 0,
    activeUsers: 0,
    reports: 0,
    notifications: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, growthRes, trendsRes, reportsRes, notificationsRes] = await Promise.all([
        statsAPI.getDashboard(),
        statsAPI.getUserGrowth(30),
        statsAPI.getUploadTrends(30),
        reportsAPI.getAll({ limit: 1 }).catch(() => ({ data: { pagination: { total: 0 } } })),
        notificationsAPI.getUnreadCount().catch(() => ({ data: { data: { unreadCount: 0 } } }))
      ]);

      const dashboardData = dashboardRes.data.data;

      // Set stats from backend response
      setStats({
        users: dashboardData.overview.totalUsers || 0,
        categories: dashboardData.overview.totalCategories || 0,
        images: dashboardData.overview.totalImages || 0,
        activeUsers: dashboardData.users.active || 0,
        reports: reportsRes.data.pagination?.total || 0,
        notifications: notificationsRes.data.data?.unreadCount || 0,
      });

      // Process growth and trends data for charts
      const growthData = growthRes.data.data.growthData || [];
      const trendsData = trendsRes.data.data.trendsData || [];

      // Merge growth and trends data for charts
      const chartData = [];
      const dateMap = new Map();

      growthData.forEach(item => {
        if (!dateMap.has(item.date)) {
          dateMap.set(item.date, { date: item.date, users: 0, images: 0 });
        }
        dateMap.get(item.date).users = item.newUsers;
      });

      trendsData.forEach(item => {
        if (!dateMap.has(item.date)) {
          dateMap.set(item.date, { date: item.date, users: 0, images: 0 });
        }
        dateMap.get(item.date).images = item.uploads;
      });

      // Convert map to array and format dates
      const formattedData = Array.from(dateMap.values())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-7) // Last 7 days
        .map(item => ({
          month: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          users: item.users,
          images: item.images
        }));

      setChartData(formattedData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: 'Active Users', value: stats.activeUsers || 0 },
    { name: 'Inactive Users', value: (stats.users || 0) - (stats.activeUsers || 0) },
  ];

  const COLORS = ['#4f46e5', '#94a3b8'];

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Header />

        <div className="dashboard-container">
          <div className="stats-grid">
            <StatsCard
              title="Total Users"
              value={loading ? '...' : stats.users}
              icon={FiUsers}
              trend="up"
              trendValue="12"
              color="blue"
            />
            <StatsCard
              title="Categories"
              value={loading ? '...' : stats.categories}
              icon={FiFolder}
              trend="up"
              trendValue="8"
              color="green"
            />
            <StatsCard
              title="Total Images"
              value={loading ? '...' : stats.images}
              icon={FiImage}
              trend="up"
              trendValue="23"
              color="purple"
            />
            <StatsCard
              title="Active Users"
              value={loading ? '...' : stats.activeUsers}
              icon={FiTrendingUp}
              trend="up"
              trendValue="5"
              color="orange"
            />
            <StatsCard
              title="Reports"
              value={loading ? '...' : stats.reports}
              icon={FiAlertCircle}
              trend="neutral"
              trendValue="0"
              color="red"
            />
            <StatsCard
              title="Notifications"
              value={loading ? '...' : stats.notifications}
              icon={FiBell}
              trend="neutral"
              trendValue="0"
              color="indigo"
            />
          </div>

          {/* Quick Action Cards */}
          <div className="quick-actions-grid">
            <div className="action-card" onClick={() => navigate('/images?filter=mostLiked')}>
              <div className="action-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <FiHeart />
              </div>
              <div className="action-content">
                <h3>Most Liked</h3>
                <p>View top rated images</p>
              </div>
            </div>

            <div className="action-card" onClick={() => navigate('/images?filter=newest')}>
              <div className="action-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <FiImage />
              </div>
              <div className="action-content">
                <h3>Latest Images</h3>
                <p>Recently uploaded</p>
              </div>
            </div>

            <div className="action-card" onClick={() => navigate('/images?filter=mostViewed')}>
              <div className="action-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                <FiTrendingUp />
              </div>
              <div className="action-content">
                <h3>Most Viewed</h3>
                <p>Popular content</p>
              </div>
            </div>

            <div className="action-card" onClick={() => navigate('/upload')}>
              <div className="action-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                <FiUpload />
              </div>
              <div className="action-content">
                <h3>Upload Image</h3>
                <p>Share new content</p>
              </div>
            </div>

            <div className="action-card" onClick={() => navigate('/reports')}>
              <div className="action-icon" style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)' }}>
                <FiAlertCircle />
              </div>
              <div className="action-content">
                <h3>Reports</h3>
                <p>View all reports</p>
              </div>
            </div>

            <div className="action-card" onClick={() => navigate('/notifications')}>
              <div className="action-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <FiBell />
              </div>
              <div className="action-content">
                <h3>Notifications</h3>
                <p>Check notifications</p>
              </div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3 className="chart-title">Growth Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="images" fill="#4f46e5" />
                  <Bar dataKey="users" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">User Activity Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#4f46e5" strokeWidth={2} />
                  <Line type="monotone" dataKey="images" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">User Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">Recent Activity</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon blue">
                    <FiImage />
                  </div>
                  <div className="activity-content">
                    <p className="activity-title">New image uploaded</p>
                    <p className="activity-time">2 minutes ago</p>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon green">
                    <FiUsers />
                  </div>
                  <div className="activity-content">
                    <p className="activity-title">New user registered</p>
                    <p className="activity-time">15 minutes ago</p>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon purple">
                    <FiFolder />
                  </div>
                  <div className="activity-content">
                    <p className="activity-title">Category created</p>
                    <p className="activity-time">1 hour ago</p>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon orange">
                    <FiImage />
                  </div>
                  <div className="activity-content">
                    <p className="activity-title">Image moved to new category</p>
                    <p className="activity-time">2 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
