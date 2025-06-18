import { createContext, useContext, useEffect, useState } from "react";
import FetchHelper from "../fetch-helper";

const ReservationListContext = createContext();

export function useReservationList() {
  return useContext(ReservationListContext);
}

function ReservationList({ children }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    FetchHelper.reservation.list()
      .then((res) => {
        if (res.ok) {
          setReservations(res.data.reservations || []);
        } else {
          console.error("Chyba pri načítaní rezervácií:", res.data);
        }
      })
      .catch((err) => {
        console.error("Chyba pri načítaní rezervácií:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <ReservationListContext.Provider value={{ reservations, loading }}>
      {children}
    </ReservationListContext.Provider>
  );
}

export default ReservationList;
