import React, { useState, useEffect } from "react";
import { Button, Card, Collapse, ListGroup } from "react-bootstrap";
import FetchHelper from "../fetch-helper";
import CustomerDetailModal from "./customer-detail";
import TransactionForm from "./transaction-form";
import ReservationForm from "./reservation-form";
import TransactionItem from "./transaction-item";

const ReservationItem = ({ reservation, onUpdated, highlight }) => {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [transactionMode, setTransactionMode] = useState("create");
  const [transactionData, setTransactionData] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    FetchHelper.customer.list()
      .then(res => setCustomers(res.data || []))
      .catch(() => setCustomers([]));
  }, []);

  const fetchDetail = async () => {
    try {
      const res = await FetchHelper.reservation.get({ id: reservation.id });
      setDetail(res.data);
    } catch {
      setError("Nepodarilo sa načítať detail rezervácie.");
    }
  };

  const handleToggle = () => {
    if (!open && !detail) fetchDetail();
    setOpen(!open);
  };

  const handleDelete = async () => {
    if (!window.confirm("Naozaj chceš zmazať túto rezerváciu?")) return;
    try {
      await FetchHelper.reservation.delete({ id: reservation.id });
      await onUpdated();
    } catch (err) {
      console.error(err);
      alert("Chyba pri mazaní rezervácie.");
    }
  };

  const handleTransactionDelete = async (transactionId) => {
    if (!window.confirm("Naozaj chceš zmazať túto transakciu?")) return;
    try {
      await FetchHelper.reservation.deleteTransaction({
        reservationId: reservation.id,
        transactionId: transactionId
      });
      await fetchDetail();     // Načítaš detail rezervácie znova
      await onUpdated();       // Refreshuješ zobrazenie zoznamu rezervácií
    } catch (err) {
      console.error(err);
      alert("Chyba pri mazaní transakcie.");
    }
  };

  const handleTransactionEdit = (transaction) => {
    setTransactionMode("edit");
    setTransactionData(transaction);
    setShowTransactionModal(true);
  };

  const customer = customers.find(c => c.id === reservation.customerId);
  const customerName = customer ? `${customer.firstName} ${customer.lastName}` : reservation.customerId;
  const revenue = (reservation.sumReservation || 0) + (reservation.totalPrice || 0);

  return (
    <>
      <Card className={`mb-3 ${highlight ? "highlighted-reservation" : ""}`}>
        <Card.Header onClick={handleToggle} style={{ cursor: "pointer" }}>
          <strong>{reservation.title || "Rezervácia"}</strong> — {customerName} | {new Date(reservation.startDate).toLocaleDateString("sk-SK")} – {new Date(reservation.endDate).toLocaleDateString("sk-SK")} | Zisk: {" "}<span style={{ color: revenue >= 0 ? "green" : "red" }}>{revenue.toLocaleString("cz-CZ")} CZK</span>
        </Card.Header>

        <Collapse in={open}>
          <div>
            <Card.Body>
              {error && <p className="text-danger">{error}</p>}
              {detail ? (
                <>
                  <h5>Detaily rezervácie</h5>
                  <ListGroup className="mb-3">
                    <ListGroup.Item><strong>Od:</strong> {new Date(detail.startDate).toLocaleDateString("sk-SK")}</ListGroup.Item>
                    <ListGroup.Item><strong>Do:</strong> {new Date(detail.endDate).toLocaleDateString("sk-SK")}</ListGroup.Item>
                    <ListGroup.Item><strong>Počet osôb:</strong> {detail.persons}</ListGroup.Item>
                    <ListGroup.Item><strong>Cena za noc:</strong> {detail.pricePerNight} CZK</ListGroup.Item>
                    <ListGroup.Item><strong>Cena celkom:</strong> {(reservation.totalPrice || 0).toLocaleString("cz-CZ")} CZK</ListGroup.Item>
                    <ListGroup.Item><strong>Poznámka:</strong> {detail.note || "—"}</ListGroup.Item>
                    <ListGroup.Item><strong>Vytvorená:</strong> {new Date(detail.createdAt).toLocaleString()}</ListGroup.Item>
                  </ListGroup>

                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 mt-1">Tranzakcie</h5>
                    <Button variant="secondary" className="me-2 mb-2" onClick={() => {
                      setTransactionData(null);
                      setTransactionMode("create");
                      setShowTransactionModal(true);
                    }}>
                      + Nová transakcia
                    </Button>
                  </div>

                  <ListGroup className="mb-3">
                    {detail.transactions?.length > 0 ? (
                      detail.transactions.map((tx, idx) => (
                        <TransactionItem
                          key={idx}
                          transaction={tx}
                          onEdit={(transaction) => {
                            console.log("Editing transaction:", transaction); // 🧪 debug
                            setTransactionData(transaction);
                            setTransactionMode("edit");
                            setShowTransactionModal(true);
                          }}
                          onDelete={() => handleTransactionDelete(tx.id)}
                        />
                      ))
                    ) : (
                      <ListGroup.Item>Žiadne tranzakcie</ListGroup.Item>
                    )}
                  </ListGroup>

                  <div className="mb-3">
                    <Button variant="info" className="me-2" onClick={() => setShowCustomerModal(true)}>
                      Detail zákazníka
                    </Button>
                    <Button variant="primary" className="me-2" onClick={() => setShowEditModal(true)}>
                      Upraviť
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                      Zmazať rezerváciu
                    </Button>
                  </div>
                </>
              ) : (
                <p>Načítavam detail...</p>
              )}
            </Card.Body>
          </div>
        </Collapse>
      </Card>

      {/* MODAL – Transakcia */}
      <TransactionForm
        show={showTransactionModal}
        onHide={() => setShowTransactionModal(false)}
        mode={transactionMode}
        initialData={transactionData}
        reservationId={reservation.id}
        onSuccess={async () => {
          await fetchDetail();
          await onUpdated();
        }}
      />

      {/* MODAL – Zákazník */}
      <CustomerDetailModal
        show={showCustomerModal}
        onHide={() => setShowCustomerModal(false)}
        customer={customer}
      />

      {/* MODAL – Úprava rezervácie */}
      <ReservationForm
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        onFinish={async () => {
          await fetchDetail();
          await onUpdated();
        }}
        mode="edit"
        initialData={{ id: reservation.id, ...detail }}
      />
    </>
  );
};

export default ReservationItem;
