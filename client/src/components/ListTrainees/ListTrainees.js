import React, { useEffect, useState } from 'react';
import { Modal } from "react-bootstrap";
import { Trash, PencilSquare, PersonPlusFill } from 'react-bootstrap-icons';
import moment from 'moment';
import { apiService } from '../../api/apiService';
import UpdateTrainee from './UpdateTrainee';
import CreateTrainee from './CreateTrainee';
import "./stylee.css"
const ListTrainees = () => {
    const [trainees, setTrainees] = useState([]); // רשימת מתאמנים
    const [search, setSearch] = useState(""); // טקסט לחיפוש
    const [cu, setCU] = useState(null); // מצב (יצירה/עדכון)
    const [showModal, setShowModal] = useState(false); // פתיחת מודאל
    const [currentTrainee, setCurrentTrainee] = useState(null); // מתאמן נוכחי לעריכה

    // פונקציה למשיכת נתוני המתאמנים מהשרת
    const fetchTrainees = async () => {
        try {
            const response = await apiService.get('/auth/myTrainee', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            const filteredTrainees = Array.isArray(response.data)
                ? response.data.filter(user => user.role === 'trainee')
                : [];
            setTrainees(filteredTrainees);
        } catch (err) {
            console.error('שגיאה במשיכת נתוני המתאמנים:', err);
        }
    };

    // משיכת מתאמנים בהתחלה
    useEffect(() => {
        fetchTrainees();
    }, []);

    // פתיחת מודאל
    const openModal = (cu) => {
        setCU(cu);
        setShowModal(true);
    };

    // סגירת מודאל
    const closeModal = () => {
        setShowModal(false);
    };

    // סינון מתאמנים לפי החיפוש
    const filteredTrainees = trainees.filter(t =>
        t.username.includes(search) ||
        t.fn.includes(search) ||
        t.ln.includes(search)
    );

    return (
        <div className='responsive-container'>
            <h1 className='title'>רשימת מתאמנים <PersonPlusFill className='toClick' size={20} onClick={() => openModal("c")} /></h1>

            {/* שדה חיפוש */}
            <input
                type="search"
                name="s"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="חיפוש"
            />

            {/* טבלה של המתאמנים */}
            <table>
                <thead>
                    <tr>
                        <th>שם משתמש</th>
                        <th>שם פרטי</th>
                        <th>שם משפחה</th>
                        <th>תאריך לידה</th>
                        <th>מספר טלפון</th>
                        <th>פעולות</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTrainees.map((t, i) => (
                        <tr key={t._id}>
                            <td>{t.username}</td>
                            <td>{t.fn}</td>
                            <td>{t.ln}</td>
                            <td>{moment(new Date(t.birthday)).format("DD/MM/YYYY")}</td>
                            <td>{t.phoneNumber}</td>
                            <td className='same-line'>
                                <ul className="flex relative">
                                    <Trash
                                        className="toClick"
                                        size={20}
                                        onClick={async () => {
                                            await apiService.delete(`auth/myTrainee/${t._id}`, {
                                                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                                            });
                                            fetchTrainees();
                                        }}
                                    />
                                    <PencilSquare
                                        className='toClick'
                                        size={20}
                                        onClick={() => {
                                            setCurrentTrainee(t._id);
                                            openModal("u");
                                        }}
                                    />
                                </ul>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* מודאל להוספה או עריכה */}
            <Modal show={showModal} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{cu === "c" ? "הוסף מתאמן" : "ערוך מתאמן"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {cu === "c" ? (
                        <CreateTrainee fetchTrainees={fetchTrainees} />
                    ) : (
                        <UpdateTrainee id={currentTrainee} fetchTrainees={fetchTrainees} />
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ListTrainees;
