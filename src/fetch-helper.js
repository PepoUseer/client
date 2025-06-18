async function Call(baseUri, useCase, dtoIn, method) {
    let response;
    const url = method === "get" && dtoIn
        ? `${baseUri}/${useCase}?${new URLSearchParams(dtoIn)}`
        : `${baseUri}/${useCase}`;


    if (!method || method === "get") {
        response = await fetch(url);
    } else {
        response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dtoIn),
        });
    }
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
}

const baseUri = "http://localhost:3000";

const FetchHelper = {
    reservation: {
        get: async (dtoIn) => {
            return await Call(baseUri, `reservation/get/${dtoIn.id}`, null, "get");
        },
        create: async (dtoIn) => {
            return await Call(baseUri, "reservation/create", dtoIn, "post");
        },
        update: async (dtoIn) => {
            return await Call(baseUri, `reservation/update/${dtoIn.id}`, dtoIn, "post");
        },
        createTransaction: async (reservationId, dtoIn) => {
            return await Call(baseUri, `reservation/createTransaction/${reservationId}`, dtoIn, "post");
        },
        updateTransaction: async (dtoIn) => {
            return await Call(baseUri, `reservation/updateTransaction`, dtoIn, "post");
        },
        delete: async (dtoIn) => {
            return await Call(baseUri, `reservation/delete/${dtoIn.id}`, {}, "post");
        },
        deleteTransaction: async (dtoIn) => {
            return await Call(baseUri, `reservation/deleteTransaction/${dtoIn.reservationId}`, { transactionId: dtoIn.transactionId }, "post");
        },
        list: async (dtoIn) => {
            return await Call(baseUri, "reservation/list", null, "get");
        },
    },

    customer: {
        get: async (dtoIn) => {
            return await Call(baseUri, `customer/get/${dtoIn.id}`, null, "get");
        },
        create: async (dtoIn) => {
            return await Call(baseUri, "customer/create", dtoIn, "post");
        },
        update: async (dtoIn, id) => {
            return await Call(baseUri, `customer/update/${id}`, dtoIn, "post");
        },
        delete: async (dtoIn) => {
            return await Call(baseUri, `customer/delete/${dtoIn.id}`, {}, "post");
        },
        list: async () => {
            return await Call(baseUri, "customer/list", null, "get");
        },
    },
};

export default FetchHelper;