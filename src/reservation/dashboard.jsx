import Container from "react-bootstrap/esm/Container";
import ReservationList from "./reservation-list";
import DashboardContent from "./dashboard-content";

function Dashboard() {
  return (
    <Container style={{ paddingTop: "4rem" }}>
      <ReservationList>
        <DashboardContent />
      </ReservationList>
    </Container>
  );
}

export default Dashboard;