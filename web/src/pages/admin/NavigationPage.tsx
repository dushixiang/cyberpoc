import {useEffect} from "react";
import {useNavigate} from "react-router-dom";

const NavigationPage = () => {

    let navigate = useNavigate();
    useEffect(() => {
        navigate('/adm/dashboard');
    });

    return (
        <div>
            正在跳转...
        </div>
    );
};

export default NavigationPage;