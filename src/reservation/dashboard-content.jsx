import React, { useState, useEffect, useRef } from "react";
import { Button } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import CalendarOverview from "./calendar-overview";
import ReservationItem from "./reservation-item";
import ReservationForm from "./reservation-form";
import FetchHelper from "../fetch-helper";
import PendingItem from "./pending-item";

const Dashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [date, setDate] = useState(new Date());
  const [profit, setProfit] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [highlightedReservationId, setHighlightedReservationId] = useState([]);
  const [displayedMonth, setDisplayedMonth] = useState(new Date());
  const reservationRefs = useRef({});

  useEffect(() => {
    loadReservations();
  }, []);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const highlightId = params.get("highlight");

    if (highlightId && reservations.length > 0) {
      const matched = reservations.find(r => r.id === highlightId);

      if (matched) {
        // 🔁 Zmeň mesiac podľa rezervácie
        const targetDate = new Date(matched.startDate); // alebo matched.endDate
        setDisplayedMonth(targetDate);

        // ⏳ malá pauza, kým sa prepne mesiac, potom zvýrazni
        setTimeout(() => {
          handleSelectReservationId([highlightId]);
        }, 100); // 100 ms delay
      }
    }
  }, [reservations, location]);


  const loadReservations = () => {
    setIsLoading(true);
    FetchHelper.reservation
      .list()
      .then((res) => {
        const data = Array.isArray(res.data?.reservations) ? res.data.reservations : [];
        setReservations(data);
        const total = data.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
        setProfit(total);
      })
      .catch((err) => {
        console.error("Chyba pri načítaní rezervácií:", err);
        setReservations([]);
        setProfit(0);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSelectReservationId = (ids) => {
    setHighlightedReservationId(ids);

    if (ids.length > 0) {
      const id = ids[0];
      const el = reservationRefs.current[id];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("glow-highlight");
        setTimeout(() => {
          el.classList.remove("glow-highlight");
        }, 2000);
      }
    }
  };

  const filteredReservations = reservations.filter((r) => {
    const start = new Date(r.startDate);
    const end = new Date(r.endDate);
    const month = displayedMonth.getMonth();
    const year = displayedMonth.getFullYear();

    return (
      (start.getMonth() === month && start.getFullYear() === year) ||
      (end.getMonth() === month && end.getFullYear() === year) ||
      (start < displayedMonth && end > displayedMonth) // ak sa prekrýva
    );
  });

  const totalProfit = filteredReservations.reduce((sum, r) => {
  const end = new Date(r.endDate);
  const month = displayedMonth.getMonth();
  const year = displayedMonth.getFullYear();

  // Započítaj len rezervácie, ktorých endDate patrí do zobrazeného mesiaca
  if (end.getFullYear() === year && end.getMonth() === month) {
    const totalPrice = r.totalPrice || 0;
    const sumTransactions = r.sumReservation || 0;
    return sum + (sumTransactions + totalPrice);
  }

  return sum;
}, 0);
  return (
    <div className="dashboard container mt-4">
      <h2>Dashboard</h2>

      <div className="row mt-4">
        <div className="col-md-8">
          <CalendarOverview
            value={date}
            onChange={setDate}
            reservations={reservations}
            onSelectReservationId={handleSelectReservationId}
            onMonthChange={(date) => setDisplayedMonth(date)}
          />
        </div>
        <div className="col-md-4 d-flex flex-column align-items-end justify-content-start mt-2">
          <h4>Celkový zisk:&nbsp;
            <span style={{ color: totalProfit >= 0 ? "green" : "red" }}>
              {totalProfit.toLocaleString("cz-CZ")} CZK
            </span>
          </h4>
          <Button
            variant="success"
            className="mb-2"
            onClick={() => setShowCreateModal(true)}
          >
            + Nová rezervácia
          </Button>
        </div>
      </div>

      <div className="reservations mt-4">
        <h4>Rezervácie</h4>
        {isLoading ? (
          <PendingItem />
        ) : filteredReservations.length === 0 ? (
          <p>Žiadne rezervácie</p>
        ) : (
          filteredReservations.map((r) => (
            <div
              key={r.id}
              className="mb-2 border p-2 rounded"
              ref={(el) => (reservationRefs.current[r.id] = el)}
            >
              <ReservationItem
                reservation={r}
                onUpdated={loadReservations}
                highlight={highlightedReservationId.includes(r.id)}
              />
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <ReservationForm
          show={showCreateModal}
          onHide={() => setShowCreateModal(false)}
          onFinish={loadReservations}
          mode="create"
        />
      )}

      <style>{`
        .glow-highlight {
          animation: glow 2s ease-out;
        }

        @keyframes glow {
          0% { box-shadow: 0 0 0px rgba(255, 193, 7, 0); }
          50% { box-shadow: 0 0 15px 5px rgba(255, 193, 7, 0.8); }
          100% { box-shadow: 0 0 0px rgba(255, 193, 7, 0); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
