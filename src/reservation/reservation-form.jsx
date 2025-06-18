import React, { useState, useEffect, useMemo } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { DateTime } from "luxon";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";

const ReservationForm = ({ show, onHide, mode = "create", initialData = {}, onFinish }) => {
  const isCreate = mode === "create";
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({
    customerId: "",
    startDate: new Date(),
    endDate: new Date(),
    persons: 1,
    pricePerNight: 0,
    note: "",
    ...initialData,
  });

  useEffect(() => {
    if (show) {
      fetch("/customer/list")
        .then((res) => res.json())
        .then((data) => setCustomers(data))
        .catch((err) => console.error("Chyba pri načítaní zákazníkov:", err));
    }
  }, [show]);

  useEffect(() => {
    if (!isCreate && initialData?.id) {
      setForm({
        customerId: initialData.customerId || "",
        startDate: new Date(initialData.startDate),
        endDate: new Date(initialData.endDate),
        persons: initialData.persons || 1,
        pricePerNight: initialData.pricePerNight || 0,
        note: initialData.note || "",
      });
    }
  }, [initialData, isCreate]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "persons" || name === "pricePerNight" ? parseInt(value) : value,
    }));
  };

  const customerOptions = [
    { value: "", name: "Bez zákazníka", email: "" },
    ...customers.map((c) => ({
      value: c.id,
      name: `${c.firstName} ${c.lastName}`, 
      email: c.email,
    }))
  ];

  function calculateNights(startDate, endDate) {
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    return Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / MS_PER_DAY));
  }
  const totalPrice = useMemo(() => {
    return calculateNights(form.startDate, form.endDate) * form.pricePerNight;
  }, [form.startDate, form.endDate, form.pricePerNight]);

  const formatOptionLabel = ({ name, email }) => (
    <div>
      <div>{name}</div>
      {email && <div style={{ fontSize: "0.8em", color: "#666" }}>{email}</div>}
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    console.log("Odosielam:", {
      startDate: form.startDate,
      endDate: form.endDate,
    });


    try {
      const payload = {
        ...form,
        startDate: DateTime.fromJSDate(form.startDate).toFormat("yyyy-MM-dd"),
        endDate: DateTime.fromJSDate(form.endDate).toFormat("yyyy-MM-dd"),
      };
      console.log("Payload to be sent:", payload); // ✏️ debug
      
      const response = await fetch(
        isCreate ? "/reservation/create" : `/reservation/update/${initialData.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        console.error("Server error:", data); // ✏️ debug
        const errData = data?.error;
        if (Array.isArray(errData)) {
          const mapped = {};
          errData.forEach(err => {
            const field = err.instancePath?.replace("/", "") || "general";
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

      if (onFinish) onFinish();
      onHide();
    } catch (err) {
      setError("Chyba pri odosielaní požiadavky.");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isCreate ? "Vytvoriť rezerváciu" : "Upraviť rezerváciu"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Zákazník</Form.Label>
            <Select
            options={customerOptions}
            value={customerOptions.find(opt => opt.value === form.customerId)}
            onChange={(selected) =>
              setForm(prev => ({ ...prev, customerId: selected ? selected.value : "" }))
            }
            formatOptionLabel={formatOptionLabel}
            isClearable
            placeholder="Vyberte zákazníka"
            />
            <Form.Control.Feedback type="invalid">{fieldErrors.customerId}</Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label className="me-3 mb-0" style={{ minWidth: "30px" }}>Od</Form.Label>
            <DatePicker
              selected={new Date(form.startDate)}
              onChange={(date) => setForm({ ...form, startDate: date })}
              dateFormat="dd.MM.yyyy"
              className={`form-control ${fieldErrors.startDate ? "is-invalid" : ""}`}
            />
            {fieldErrors.startDate && (
              <div className="invalid-feedback d-block ms-4">{fieldErrors.startDate}</div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="me-3 mb-0" style={{ minWidth: "30px" }}>Do</Form.Label>
            <DatePicker
              selected={new Date(form.endDate)}
              onChange={(date) => setForm({ ...form, endDate: date })}
              dateFormat="dd.MM.yyyy"
              className={`form-control ${fieldErrors.endDate ? "is-invalid" : ""}`}
            />
            {fieldErrors.endDate && (
              <div className="invalid-feedback d-block ms-4">{fieldErrors.endDate}</div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Počet osôb</Form.Label>
            <Form.Control
              type="number"
              name="persons"
              min="1"
              value={form.persons}
              onChange={handleChange}
              isInvalid={!!fieldErrors.persons}
            />
            <Form.Control.Feedback type="invalid">{fieldErrors.persons}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Cena za noc (CZK)</Form.Label>
            <Form.Control
              type="number"
              name="pricePerNight"
              min="0"
              value={form.pricePerNight}
              onChange={handleChange}
              isInvalid={!!fieldErrors.pricePerNight}
            />
            <Form.Control.Feedback type="invalid">{fieldErrors.pricePerNight}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Poznámka</Form.Label>
            <Form.Control
              as="textarea"
              name="note"
              rows={3}
              value={form.note}
              onChange={handleChange}
              isInvalid={!!fieldErrors.note}
            />
            <Form.Control.Feedback type="invalid">{fieldErrors.note}</Form.Control.Feedback>
          </Form.Group>

          <div className="text-end mt-3">
            <strong>Celková cena: </strong>{totalPrice.toLocaleString("cz-CZ")} CZK
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Button variant="primary" type="submit">
            {isCreate ? "Vytvoriť" : "Uložiť"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ReservationForm;
