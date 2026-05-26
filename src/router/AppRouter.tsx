import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { publicRoutes, privateRoutes } from '@/router/routes';
import { MAIN_ROUTE, PROFILE_ROUTE } from '@/utils/consts';
import { Context, type IStoreContext } from '@/store/context';

const AppRouter = () => {
    const { user } = useContext(Context) as IStoreContext;

    return (
        <Routes>
            <Route path="/store" element={<Navigate to={PROFILE_ROUTE} replace />} />
            {/* Публичные маршруты доступны всем */}
            {publicRoutes.map(({ path, Component }) => (
                <Route key={path} path={path} element={<Component />} />
            ))}

            {/* Приватные маршруты только для авторизованных */}
            {user.isAuth && privateRoutes.map(({ path, Component }) => (
                <Route key={path} path={path} element={<Component />} />
            ))}

            <Route path="*" element={<Navigate to={MAIN_ROUTE} />} />
        </Routes>
    );
};

export default AppRouter;
