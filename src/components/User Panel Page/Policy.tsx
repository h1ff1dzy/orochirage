import React, {useEffect} from "react";
import axios from "axios";
import {Footer} from "../Footer";
import {Helmet} from "react-helmet";

const Policy = () => {

    const [policyContent, setPolicyContent] = React.useState("")
    const [lastUpdated, setLastUpdated] = React.useState("")

    function formatDateTime(dateTimeString: string) {
        const months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

        const date = new Date(dateTimeString);
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const hours = ('0' + date.getHours()).slice(-2);
        const minutes = ('0' + date.getMinutes()).slice(-2);

        return `${day} ${month}, ${year} года в ${hours}:${minutes} по московскому времени`;
    }

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const response = await axios.get(`https://api.orochirage.ru/api/policy`);
                setPolicyContent(response.data[0].content);
                setLastUpdated(response.data[0].dateUpdated);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchPolicy();
    }, []);

    return (
        <>
            <Helmet>
                <title>OROCHI - Политика конфендициальности</title>
            </Helmet>
            <div className="policy_container p-8">
                <div dangerouslySetInnerHTML={{ __html: policyContent }} />
                <div className="py-4 font-semibold">Дата последнего обновления: {formatDateTime(lastUpdated)}</div>
            </div>
            <Footer/>
        </>
    )
}

export default Policy;