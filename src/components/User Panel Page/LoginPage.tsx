import React, {useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { signIn } from '../../slicers/userSlice';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { Alert, Input, Spinner, Typography } from "@material-tailwind/react";
import { Footer } from "../Footer";
import RegistrationPage from "./RegistrationPage";
import {Helmet} from "react-helmet";
import PhoneInput from 'react-phone-input-2'

type AppDispatch = ThunkDispatch<RootState, undefined, AnyAction>;

type LoginPageProps = {
    isLoading: boolean
};

const LoginPage = ({ isLoading }: LoginPageProps) => {



    const [pageLoading, setPageLoading] = useState(isLoading);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [registrationPage, setRegistration] = useState(false);
    const [password, setPassword] = useState('');
    const dispatch: AppDispatch = useDispatch();
    const loading = useSelector((state: RootState) => state.user.loading);
    const error = useSelector((state: RootState) => state.user.error);

    const handleChangePhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setPhoneNumber(value);
    };

    const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setPassword(value);
    };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await dispatch(signIn({ phone: phoneNumber, password: password }));
        } catch (error) {
            console.error('Error during login:', error);
        }
    };

    const token = useSelector((state: RootState) => state.user.token);
    const tokenValid = useSelector((state: RootState) => state.user.tokenValid);

    useEffect(() => {
        if(!tokenValid)
        {
            setPageLoading(false);
        }else{
            setPageLoading(true);
        }
    }, [tokenValid])

    if (pageLoading === true) {
        console.log(pageLoading);
        return <><div className="flex items-center justify-center h-[calc(100vh-30rem)] w-full"><Spinner className="h-12 w-12" /></div></>;
    }

    function Icon() {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6"
            >
                <path
                    fillRule="evenodd"
                    d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                    clipRule="evenodd"
                />
            </svg>
        );
    }

    if(registrationPage)
        return <RegistrationPage/>

    return (
        <>
            <Helmet>
                <title>OROCHI - Авторизация</title>
            </Helmet>
            <div className="login-container h-dvh flex flex-col items-center justify-center pb-72">
                <div className="login-container-title text-lg uppercase font-bold mb-3 text-center">
                    Авторизация
                    <p className="muted opacity-55 leading-4 mt-1">Войдите в свой личный кабинет для просмотра и управления заказами</p>
                </div>
                <form onSubmit={handleLogin} className="w-72 flex flex-col gap-2">
                        <PhoneInput
                            buttonClass="hidden"
                            dropdownClass="hidden"
                            placeholder="+7 (999) 999-99-99"
                            containerClass="relative w-full min-w-[200px] h-10"
                            inputClass="!ring-0 peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 disabled:cursor-not-allowed transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent placeholder:opacity-0 focus:placeholder:opacity-100 text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 !border-t-blue-gray-200 focus:!border-t-gray-900"
                            country={'ru'}
                            value={phoneNumber}
                            specialLabel=""
                            onChange={phone => setPhoneNumber(phone)}
                            onlyCountries={["ru"]}
                        />
                    <Input
                        crossOrigin
                        label="Пароль"
                        className="focus:ring-0"
                        type="password"
                        value={password}
                        onChange={handleChangePassword}
                    />
                    <button
                        className={`transition ease-in-out cart_add_btn uppercase !flex justify-center align-middle items-center ${loading ? "opacity-50" : "opacity-100"}`}
                        type="submit"
                        disabled={loading}
                    >

                        {loading ? (<><Spinner className="mr-3" /> Войти в аккаунт</>) : (<>Войти в аккаунт</>)}
                    </button>
                    <Typography className="text-center uppercase font-inter font-semibold underline underline-offset-4 cursor-pointer" onClick={() => setRegistration(!registrationPage)} >Создать аккаунт</Typography>
                    {error && (
                        <>
                            <Alert
                                variant="gradient"
                                color="red"
                                icon={<Icon />}
                            >
                                <Typography className="font-bold mb-2">
                                    Ошибка во время авторизации
                                </Typography>
                                <Typography className="text-sm font-inter font-normal">{error}</Typography>
                            </Alert>
                        </>
                    )}
                </form>
            </div>
            <Footer />
        </>
    );
};

export default LoginPage;
