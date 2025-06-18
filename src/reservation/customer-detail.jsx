import React from "react";
import { Modal, ListGroup, Button } from "react-bootstrap";

function CustomerDetailModal({ customer, show, onHide }) {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Detail zákazníka</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {customer ? (
          <ListGroup>
            <ListGroup.Item><strong>Meno:</strong> {customer.firstName} {customer.lastName}</ListGroup.Item>
            <ListGroup.Item><strong>Email:</strong> {customer.email}</ListGroup.Item>
            <ListGroup.Item><strong>Telefón:</strong> {customer.phone}</ListGroup.Item>
            <ListGroup.Item><strong>Registrovaný:</strong> {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString("sk-SK") : "—"}</ListGroup.Item>
          </ListGroup>
        ) : (
          <p>Zákazník sa nenašiel.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Zavrieť</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CustomerDetailModal;
