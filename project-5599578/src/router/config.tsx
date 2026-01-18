
import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const Home = lazy(() => import('../pages/home/page'));
const Login = lazy(() => import('../pages/login/page'));
const Cart = lazy(() => import('../pages/cart/page'));
const Room = lazy(() => import('../pages/room/page'));
const NotFound = lazy(() => import('../pages/NotFound'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/cart',
    element: <Cart />,
  },
  {
    path: '/room/:id',
    element: <Room />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
