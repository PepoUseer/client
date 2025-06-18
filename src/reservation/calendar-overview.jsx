/* TO DO (do budúcna) - umožniť na koniec jednej rezervácie začiatok inej alebo opačne
    s tým, že v jednom políčku budú obidva trojuholníčky vizuálne zobrazené pre príchod aj 
    pre odchod a na ktorý trojuholník sa klikne podľa toho sa uživatelovi vyznačí daná rezervácia.*/

import React, { useState, useEffect } from "react";
import { Tooltip } from 'react-tooltip';
import { DateTime } from "luxon";

const WEEKDAYS = ["po", "út", "st", "čt", "pá", "so", "ne"];
const MONTHS = [
    "leden", "únor", "březen", "duben", "květen", "červen",
    "červenec", "srpen", "září", "říjen", "listopad", "prosinec"
];

const formatDate = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
};

const CalendarOverview = ({ value, onChange, reservations = [], onSelectReservationId, onMonthChange }) => {
    const [currentDate, setCurrentDate] = useState(new Date(value));
    useEffect(() => {
        onMonthChange?.(currentDate);
    }, [currentDate]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    const startDay = startOfMonth.getDay() === 0 ? 6 : startOfMonth.getDay() - 1;
    const daysInMonth = endOfMonth.getDate();

    const getDayType = (date) => {
        const iso = formatDate(date);
        for (let r of reservations) {
        const start = formatDate(new Date(r.startDate));
        const end = formatDate(new Date(r.endDate));
        if (iso === start) return "arrival-day";
        if (iso === end) return "departure-day";
        if (iso > start && iso < end) return "reserved-day";
        }
        return null;
    };

    const handleSelectDay = (date) => {
        onChange(date);
        const selected = formatDate(date);
        const matchedIds = reservations
        .filter((r) => {
            const start = formatDate(new Date(r.startDate));
            const end = formatDate(new Date(r.endDate));
            return selected >= start && selected <= end;
        })
        .map((r) => r.id);
        onSelectReservationId?.(matchedIds);
    };

    const prevMonth = () => {
        const prev = new Date(currentDate);
        prev.setMonth(prev.getMonth() - 1);
        setCurrentDate(prev);
    };

    const nextMonth = () => {
        const next = new Date(currentDate);
        next.setMonth(next.getMonth() + 1);
        setCurrentDate(next);
    };

    const days = [];
    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className="day empty"></div>);
    }
    
    for (let d = 1; d <= daysInMonth; d++) {
        const current = DateTime.local(year, month + 1, d).startOf("day").toJSDate();

        const type = getDayType(current);

        const today = new Date();
        const isToday =
            current.getDate() === today.getDate() &&
            current.getMonth() === today.getMonth() &&
            current.getFullYear() === today.getFullYear();

        const classes = ["day"];
        if (type) classes.push(type);
        if (isToday) classes.push("today");

        const reservationForThisDay = reservations.find(r => {
            const start = formatDate(new Date(r.startDate));
            const end = formatDate(new Date(r.endDate));
            const iso = formatDate(current);
            return iso >= start && iso <= end;
        });

            const tooltipText = reservationForThisDay
                ? `${reservationForThisDay.title} – ${DateTime.fromISO(reservationForThisDay.startDate).toFormat("dd.MM.yyyy")} – ${DateTime.fromISO(reservationForThisDay.endDate).toFormat("dd.MM.yyyy")}`
                : "";

        days.push(
            <div 
                key={d}
                className={classes.join(" ")}
                onClick={() => handleSelectDay(current)}
                data-tooltip-id={`tooltip-${d}`}
                data-tooltip-content={tooltipText}
            >
                <span>{d}</span>
                <Tooltip id={`tooltip-${d}`} place="top" />
            </div>
        );
    }


    const calendarStyle = `
        .calendar-wrapper {
            font-family: 'Nunito', sans-serif;
            font-optical-sizing: auto;
            font-weight: 700;
            font-style: normal;
            max-width: 600px;
            width: 100%;
            margin: 0 0 20px 0;
            padding: 10px 16px;
            box-sizing: border-box;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            border-radius: 15px;
        }

        .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 1.2em;
        }

        .calendar-header button {
            background: none;
            border: none;
            font-size: 1.8em;
            cursor: pointer;
        }

        .calendar-grid,
        .calendar-weekdays {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 4px;
        }

        .weekday {
            text-align: center;
            font-weight: bold;
            font-size: 1em;
        }

        .day {
            position: relative;
            aspect-ratio: 2 / 1.5;
            text-align: center;
            line-height: 1;
            background: #f8f9fa;
            border-radius: 8px;
            font-weight: bold;
            font-size: 1.1em;
            cursor: pointer;
            z-index: 0;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .day.empty {
            background: transparent;
            border: none;
            cursor: default;
        }

        .reserved-day {
            background-color: #ffc107 !important;
            border-radius: 8px;
        }

        .arrival-day::before,
        .departure-day::before {
            content: "";
            position: absolute;
            z-index: 1;
            width: 0;
            height: 0;
        }

        .arrival-day::before {
            bottom: 0;
            right: 0;
            border-bottom: 3.5em solid #ffc107;
            border-left: 4em solid transparent;
            border-top-right-radius: 11px;
            border-bottom-right-radius: 6px;
        }

        .departure-day::before {
            top: 0;
            left: 0;
            border-top: 3.5em solid #ffc107;
            border-right: 4em solid transparent;
            border-top-left-radius: 6px;
            border-bottom-left-radius: 11px;
        }

        .day span {
            position: relative;
            z-index: 2;
            display: inline-block;
        }

        .today {
            outline: 2px solid green;
            outline-offset: -2px;
            font-size: 1.2em;
            font-weight: bold;
            color: green;
        }

        .legend {
            margin-top: 12px;
            display: flex;
            gap: 12px;
            font-size: 0.9em;
            justify-content: center;
            flex-wrap: wrap;
        }

        .legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .legend-square {
            width: 1.2em;
            height: 1.2em;
            background: #ffc107;
            border-radius: 4px;
        }

        .legend-departure::before {
            content: "";
            display: inline-block;
            width: 0;
            height: 0;
            border-top: 1.2em solid #ffc107;
            border-right: 1.2em solid transparent;
            border-top-left-radius: 4px;
            border-bottom-left-radius: 4px;
        }

        .legend-arrival::before {
            content: "";
            display: inline-block;
            width: 0;
            height: 0;
            border-bottom: 1.2em solid #ffc107;
            border-left: 1.2em solid transparent;
            border-top-right-radius: 4px;
            border-bottom-right-radius: 4px;
        }

        @media (max-width: 481px) {
            .calendar-wrapper {
                padding: 0 6px;
            }

            .day {
                font-size: .9em;
            }

            .today {
                font-size: 1em;
            }
            .arrival-day::before {
                border-bottom: 2.5em solid #ffc107;
                border-left: 2.8em solid transparent;
                border-top-right-radius: 11px;
                border-bottom-right-radius: 6px;
            }

            .departure-day::before {
                border-top: 2.5em solid #ffc107;
                border-right: 2.8em solid transparent;
                border-top-left-radius: 6px;
                border-bottom-left-radius: 11px;
            }
        }
        @media (min-width: 481px) and (max-width: 768px) {
            .arrival-day::before {
                border-bottom: 2.8em solid #ffc107;
                border-left: 3.2em solid transparent;
                border-top-right-radius: 11px;
                border-bottom-right-radius: 6px;
            }

            .departure-day::before {
                border-top: 2.8em solid #ffc107;
                border-right: 3.2em solid transparent;
                border-top-left-radius: 6px;
                border-bottom-left-radius: 11px;
            }
        }
        @media (min-width: 768px) and (max-width: 991px) {
            .day {
                font-size: .9em;
            }

            .today {
                font-size: 1em;
            }

            .arrival-day::before {
                border-bottom: 3.1em solid #ffc107;
                border-left: 3.3em solid transparent;
                border-top-right-radius: 11px;
                border-bottom-right-radius: 6px;
            }

            .departure-day::before {
                border-top: 3.1em solid #ffc107;
                border-right: 3.3em solid transparent;
                border-top-left-radius: 6px;
                border-bottom-left-radius: 11px;
            }
        }
    `;

    return (
        <>
        <style>{calendarStyle}</style>
        <div className="calendar-wrapper">
            <div className="calendar-header">
            <button onClick={prevMonth}>&laquo;</button>
            <div>{`${MONTHS[month]} ${year}`}</div>
            <button onClick={nextMonth}>&raquo;</button>
            </div>

            <div className="calendar-weekdays">
            {WEEKDAYS.map((day) => (
                <div key={day} className="weekday">{day}</div>
            ))}
            </div>

            <div className="calendar-grid">
            {days}
            </div>

            <div className="legend">
            <div className="legend-item"><span className="legend-arrival" /> příjezd</div>
            <div className="legend-item"><span className="legend-square" /> obsazeno</div>
            <div className="legend-item"><span className="legend-departure" /> odchod</div>
            </div>
        </div>
        </>
    );
};

export default CalendarOverview;
