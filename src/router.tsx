import { createBrowserRouter, Navigate } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { ServicesPage } from '@/pages/ServicesPage';
import { MyBookingPage } from '@/pages/MyBookingPage';
import { NotFound } from '@/pages/NotFound';
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { LoginPage } from '@/pages/admin/LoginPage';
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { AdminBookingsPage } from '@/pages/admin/BookingsPage';
import { AdminServicesPage } from '@/pages/admin/ServicesPage';
import { AdminSettingsPage } from '@/pages/admin/SettingsPage';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/s/studio-abc/" replace /> },
  {
    path: '/s/:slug',
    children: [
      { index: true, element: <HomePage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'my-booking', element: <MyBookingPage /> },
      { path: 'admin/login', element: <LoginPage /> },
      {
        path: 'admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'bookings', element: <AdminBookingsPage /> },
          { path: 'services', element: <AdminServicesPage /> },
          { path: 'settings', element: <AdminSettingsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
]);