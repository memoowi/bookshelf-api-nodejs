import { nanoid } from "nanoid";
import books from "./books.js";

const validateBook = (requestLoad) => {
  let message;
  if (typeof requestLoad.year !== "number" || requestLoad.year === 0) {
    message = "Year wajib number dan tidak boleh 0";
  }
  if (typeof requestLoad.author !== "string" || requestLoad.author === "") {
    message = "Author wajib string dan tidak boleh kosong";
  }
  if (typeof requestLoad.summary !== "string" || requestLoad.summary === "") {
    message = "Summary wajib string dan tidak boleh kosong";
  }
  if (
    typeof requestLoad.publisher !== "string" ||
    requestLoad.publisher === ""
  ) {
    message = "Publisher wajib string dan tidak boleh kosong";
  }
  if (
    typeof requestLoad.pageCount !== "number" ||
    requestLoad.pageCount === 0
  ) {
    message = "pageCount wajib number dan tidak boleh 0";
  }
  if (typeof requestLoad.readPage !== "number" || requestLoad.readPage < 0) {
    message = "readPage wajib number dan tidak boleh negatif";
  }
  if (typeof requestLoad.reading !== "boolean") {
    message = "reading wajib boolean";
  }

  return message;
};

const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const id = nanoid(16);
  const finished = pageCount === readPage;
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  // VALIDATION
  const errorMessage = validateBook(request.payload);

  if (errorMessage !== undefined) {
    const response = h.response({
      status: "fail",
      message: "Gagal menambahkan buku. " + errorMessage,
    });
    response.code(400);
    return response;
  }

  if (name === undefined) {
    const response = h.response({
      status: "fail",
      message: "Gagal menambahkan buku. Mohon isi nama buku",
    });
    response.code(400);
    return response;
  }

  if (pageCount < readPage) {
    const response = h.response({
      status: "fail",
      message:
        "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount",
    });
    response.code(400);
    return response;
  }

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: "success",
      message: "Buku berhasil ditambahkan",
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }

  const response = h.response({
    status: "fail",
    message: "Buku gagal ditambahkan",
  });
  response.code(500);
  return response;
};

const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;

  if (name !== undefined) {
    const filteredBooks = books.filter((book) =>
      book.name.toLowerCase().includes(name.toLowerCase())
    );

    const response = h.response({
      status: "success",
      data: {
        books: filteredBooks.map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher,
        })),
      },
    });
    response.code(200);
    return response;
  }

  if (reading !== undefined) {
    const response = h.response({
      status: "success",
      data: {
        books: books
          .filter((book) => book.reading === (reading === "1" ? true : false))
          .map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
          })),
      },
    });
    response.code(200);
    return response;
  }

  if (finished !== undefined) {
    const response = h.response({
      status: "success",
      data: {
        books: books
          .filter((book) => book.finished === (finished === "1" ? true : false))
          .map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
          })),
      },
    });
    response.code(200);
    return response;
  }


  const response = h.response({
    status: "success",
    data: {
      books: books.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      })),
    },
  });
  response.code(200);
  return response;
};

const getBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const book = books.filter((n) => n.id === id)[0];

  if (book !== undefined) {
    return {
      status: "success",
      data: {
        book,
      },
    };
  }

  const response = h.response({
    status: "fail",
    message: "Buku tidak ditemukan",
  });
  response.code(404);
  return response;
};

const editBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;
  const updatedAt = new Date().toISOString();

  // VALIDATION
  const errorMessage = validateBook(request.payload);

  if (errorMessage !== undefined) {
    const response = h.response({
      status: "fail",
      message: "Gagal menambahkan buku. " + errorMessage,
    });
    response.code(400);
    return response;
  }

  if (name === undefined) {
    const response = h.response({
      status: "fail",
      message: "Gagal memperbarui buku. Mohon isi nama buku",
    });
    response.code(400);
    return response;
  }

  if (pageCount < readPage) {
    const response = h.response({
      status: "fail",
      message:
        "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount",
    });
    response.code(400);
    return response;
  }

  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };

    const response = h.response({
      status: "success",
      message: "Buku berhasil diperbarui",
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: "fail",
    message: "Gagal memperbarui buku. Id tidak ditemukan",
  });
  response.code(404);
  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: "success",
      message: "Buku berhasil dihapus",
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: "fail",
    message: "Buku gagal dihapus. Id tidak ditemukan",
  });
  response.code(404);
  return response;
};

export default {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
