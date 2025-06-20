import React, { useState, useEffect, useRef } from "react";
import { Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
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
  const [allCustomers, setAllCustomers] = useState([]);

  const reservationRefs = useRef({});
  const highlightRef = useRef(null);
  const hasRedirected = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  const loadReservations = () => {
    setIsLoading(true);
    FetchHelper.reservation
      .list()
      .then((res) => {
        const data = Array.isArray(res.data?.reservations) ? res.data.reservations : [];
        setReservations(data);

        const total = data.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
        setProfit(total);

        // If redirected with highlight
        const params = new URLSearchParams(location.search);
        const highlightId = params.get("highlight");
        const matched = data.find((r) => r.id === highlightId);

        if (highlightId && matched) {
          const matchedDate = new Date(matched.startDate);
          setDisplayedMonth(matchedDate);
          highlightRef.current = highlightId;

          // 🧹 Odstráň highlight z URL
          const cleaned = new URLSearchParams(location.search);
          cleaned.delete("highlight");
          navigate({ pathname: location.pathname, search: cleaned.toString() }, { replace: true });
        }
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

  useEffect(() => {
    FetchHelper.customer.list()
      .then(res => setAllCustomers(res.data || []))
      .catch(() => setAllCustomers([]));
  }, []);

  useEffect(() => {
    loadReservations();
  }, []);

  useEffect(() => {
    if (highlightRef.current && reservations.length > 0) {
      const id = highlightRef.current;
      const exists = reservations.find((r) => r.id === id);
      if (exists) {
        setTimeout(() => {
          handleSelectReservationId([id]);
        }, 200); // slight delay to allow render
      }
      highlightRef.current = null;
    }
  }, [reservations]);

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
      (start < displayedMonth && end > displayedMonth)
    );
  });

  const totalProfit = filteredReservations.reduce((sum, r) => {
    const end = new Date(r.endDate);
    const month = displayedMonth.getMonth();
    const year = displayedMonth.getFullYear();

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
            value={displayedMonth}
            onChange={setDate}
            reservations={reservations}
            onSelectReservationId={handleSelectReservationId}
            onMonthChange={(date) => {
              if (
                date.getMonth() !== displayedMonth.getMonth() ||
                date.getFullYear() !== displayedMonth.getFullYear()
              ) {
                setDisplayedMonth(date);
              }
            }}
          />
        </div>
        <div className="col-md-4 d-flex flex-column align-items-end justify-content-start mt-2">
          <h4>
            Celkový zisk:&nbsp;
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
                customers={allCustomers}
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
