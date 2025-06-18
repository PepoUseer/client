import React, { useEffect, useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import FetchHelper from "../fetch-helper";

function CustomerForm({ editCustomer, onFinish }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (editCustomer) {
      setFirstName(editCustomer.firstName || "");
      setLastName(editCustomer.lastName || "");
      setEmail(editCustomer.email || "");
      setPhone(editCustomer.phone || "");
    } else {
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
    }
  }, [editCustomer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const payload = { firstName, lastName, email, phone };

    try {
      let res;
      if (editCustomer?.id) {
        res = await FetchHelper.customer.update({...payload}, editCustomer.id);
      } else {
        res = await FetchHelper.customer.create(payload);
      }

      if (!res.ok) {
        const errData = res.data?.error;
        if (Array.isArray(errData)) {
          const mapped = {};
          errData.forEach(err => {
            const field = err.instancePath.replace("/", "");
            mapped[field] = err.message;
          });
          setFieldErrors(mapped);
        } else if (typeof errData === "object" && errData !== null) {
          setFieldErrors(errData);
        } else {
          setError(typeof errData === "string" ? errData : "Neznáma chyba");
        }
        return;
      }

      onFinish();
    } catch (e) {
      setError("Chyba pri odosielaní požiadavky.");
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="firstName">
        <Form.Label>Meno <span className="text-danger">*</span></Form.Label>
        <Form.Control
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          isInvalid={!!fieldErrors.firstName}
          required
        />
        <Form.Control.Feedback type="invalid">
          {fieldErrors.firstName}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="lastName">
        <Form.Label>Priezvisko <span className="text-danger">*</span></Form.Label>
        <Form.Control
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          isInvalid={!!fieldErrors.lastName}
          required
        />
        <Form.Control.Feedback type="invalid">
          {fieldErrors.lastName}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="email">
        <Form.Label>Email <span className="text-danger">*</span></Form.Label>
        <Form.Control
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          isInvalid={!!fieldErrors.email}
          required
        />
        <Form.Control.Feedback type="invalid">
          {fieldErrors.email}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="phone">
        <Form.Label>Telefón <span className="text-danger">*</span></Form.Label>
        <Form.Control
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          isInvalid={!!fieldErrors.phone}
        />
        <Form.Control.Feedback type="invalid">
          {fieldErrors.phone}
        </Form.Control.Feedback>
      </Form.Group>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="d-flex justify-content-end">
        <Button type="submit" variant="primary">
          {editCustomer ? "Uložiť zmeny" : "Vytvoriť"}
        </Button>
      </div>
    </Form>
  );
}

export default CustomerForm;
