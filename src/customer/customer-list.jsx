import React, { useEffect, useState } from "react";
import CustomerForm from "./customer-form";
import PendingItem from "./pending-item";
import FetchHelper from "../fetch-helper";
import CustomerItem from "./customer-item";
import { Modal, Button } from "react-bootstrap";

function CustomerPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await FetchHelper.customer.list();
      setCustomers(res.data || []);
    } catch (err) {
      console.error("Chyba pri načítaní zákazníkov:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Naozaj chcete odstrániť tohto zákazníka?")) return;
    try {
      await FetchHelper.customer.delete({ id });
      fetchCustomers();
    } catch (err) {
      alert("Nepodarilo sa odstrániť zákazníka.");
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingCustomer(null);
    setShowForm(true);
  };

  const handleFormFinish = () => {
    setShowForm(false);
    setEditingCustomer(null);
    fetchCustomers();
  };

  return (
    <div className="container mt-4" style={{ paddingTop: "4rem" }}>
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="mb-0">Zákazníci</h2>
        <div className="ms-auto">
          <Button variant="success" className="mt-2 me-2" onClick={handleCreate}>
            + Nový zákazník
          </Button>
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <PendingItem />
        ) : customers.length === 0 ? (
          <p>Žiadny zákazníci</p>
        ) : (
          customers.map((customer) => (
            <CustomerItem
              key={customer.id}
              customer={customer}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* MODAL pre vytváranie / úpravu zákazníka */}
      <Modal show={showForm} onHide={handleFormFinish} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCustomer ? "Upraviť zákazníka" : "Nový zákazník"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CustomerForm editCustomer={editingCustomer} onFinish={handleFormFinish} />
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default CustomerPage;
