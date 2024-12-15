import React, { useEffect, useState } from 'react';
import { CalendarClearOutline, LogOutOutline, HappyOutline, PeopleOutline, HomeOutline } from 'react-ionicons';
import "./header.css";
import { useNavigate } from 'react-router-dom';

const Header = ({ onLogout }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    const Menus = [
        { name: "בית", iconClose: <HomeOutline color={'#00000'} height="20px" width="20px" />, url: "/dashboard" },
        { name: "מתאמנים", iconClose: <PeopleOutline color={'#00000'} height="20px" width="20px" />, url: "/trainees" },
        { name: "פגישות", iconClose: <CalendarClearOutline color={'#00000'} height="20px" width="20px" />, url: "/calendar" },
    ];

    useEffect(()=>{console.log("window.location")},[window.location])
    useEffect(() => {
        // מזהה גלילה ומעדכן את המחלקה
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={scrolled ? 'scrolled' : ''}>
            <div className='System'>
                {/* <img className="logoSystem" src={IconSystem} alt="LOGO SYSTEM" /> */}
                {/* <img className="nameSystem" src={NameSystem} alt="NAME SYSTEM" /> */}
                {/* <h1>מערכת אימונים</h1> */}
            </div>
            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
            <nav>
                <ul className={menuOpen ? 'active' : ''}>
                    {Menus.map((menu, i) => (
                        ((menu.url === '/trainees' && localStorage.getItem("role") === "coach") || menu.url !== '/trainees') &&
                        <li key={i} onClick={() => { setMenuOpen(false); navigate(menu.url); }}>
                            <a>
                                <span>{menu.iconClose}</span>
                                <span>{menu.name}</span>
                            </a>
                        </li>
                    ))}
                    <li key={100} onClick={() => { setMenuOpen(false); navigate('/profile'); }}>
                        <span>{<HappyOutline color={'#00000'} height="20px" width="20px" />}</span>
                        <span>פרופיל</span>
                    </li>
                    <li key={99} onClick={()=> {navigate("/");onLogout()}}>
                        <span>{<LogOutOutline color={'red'} height="20px" width="20px" />}</span>
                        <span>יציאה</span>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
