import React, { useEffect, useState } from 'react';
import { CalendarClearOutline, LogOutOutline, HappyOutline, PeopleOutline, HomeOutline } from 'react-ionicons';
import "./header.css";
import { useNavigate } from 'react-router-dom';
// import { apiService } from '../../api/apiService';

const Header = ({ onLogout }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    const Menus = [
        { name: "בית", iconClose: <HomeOutline color="#000000" height="20px" width="20px" />, url: "/dashboard" },
        { name: "מתאמנים", iconClose: <PeopleOutline color="#00000" height="20px" width="20px"/>, url: "/trainees" },
        { name: "פגישות", iconClose: <CalendarClearOutline color= "#00000" width= "20px" height= "20px"/>, url: "/calendar" },
    ];

    useEffect(()=>{
        console.log("token: ", localStorage.getItem('token'));
        console.log("role: ", localStorage.getItem("role"));
        console.log("id: ", localStorage.getItem("id"));

        if(!localStorage.getItem('token')){
          onLogout();
        }
        else{
          if(window.location.pathname === "/") {
            navigate("dashboard");
          }
          else navigate(window.location.pathname)
        }
      }, [])
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
            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
            <nav>
                <ul className={menuOpen ? 'active' : ''}>
                    {Menus.map((menu, i) => (
                        ((menu.url === '/trainees' && localStorage.getItem("role") === "coach") || menu.url !== '/trainees') &&
                        <li key={i} onClick={() => { setMenuOpen(false); navigate(menu.url); }}>
                            <a>
                                {menu.iconClose}
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

                    <div style={{display: "flex", justifyContent: "space-between"}}>{localStorage.getItem("name")} -- {localStorage.getItem("username")}</div>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
