import { Book } from "../models/Misc.model.js";
// const { v4: uuidv4 } = require('uuid');
import { v4 as uuidv4 } from "uuid";

/**
 * Book Controller
 * Handles all book-related operations
 */
const bookController = {
  /**
   * Get all books with optional filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllBooks: async (req, res) => {
    try {
      const {
        category,
        author,
        title,
        publisher,
        yearFrom,
        yearTo,
        sort = "title",
        order = "asc",
        page = 1,
        limit = 10,
      } = req.query;

      // Build query based on filters
      const query = {};

      if (category) query.category = category;
      if (author) query.author = { $regex: author, $options: "i" };
      if (title) query.title = { $regex: title, $options: "i" };
      if (publisher) query.publisher = { $regex: publisher, $options: "i" };

      // Handle publication year range
      if (yearFrom || yearTo) {
        query.publicationYear = {};
        if (yearFrom) query.publicationYear.$gte = parseInt(yearFrom);
        if (yearTo) query.publicationYear.$lte = parseInt(yearTo);
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Sort configuration
      const sortConfig = {};
      sortConfig[sort] = order === "desc" ? -1 : 1;

      // Execute query with pagination and sorting
      const books = await Book.find(query)
        .sort(sortConfig)
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count for pagination
      const totalBooks = await Book.countDocuments(query);

      res.status(200).json({
        success: true,
        count: books.length,
        total: totalBooks,
        page: parseInt(page),
        pages: Math.ceil(totalBooks / parseInt(limit)),
        data: books,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve books",
        error: error.message,
      });
    }
  },

  /**
   * Get a single book by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getBookById: async (req, res) => {
    try {
      const book = await Book.findById(req.params.id);

      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Book not found",
        });
      }

      res.status(200).json({
        success: true,
        data: book,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve book",
        error: error.message,
      });
    }
  },

  /**
   * Get a book by ISBN
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getBookByIsbn: async (req, res) => {
    try {
      const book = await Book.findOne({ isbn: req.params.isbn });

      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Book not found with this ISBN",
        });
      }

      res.status(200).json({
        success: true,
        data: book,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve book by ISBN",
        error: error.message,
      });
    }
  },

  /**
   * Create a new book
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createBook: async (req, res) => {
    try {
      const { isbn } = req.body;

      // Check if book with this ISBN already exists
      const existingBook = await Book.findOne({ isbn });

      if (existingBook) {
        return res.status(409).json({
          success: false,
          message: "Book with this ISBN already exists",
        });
      }

      // Generate a unique bookId if not provided
      if (!req.body.bookId) {
        req.body.bookId = `BK-${uuidv4().substring(0, 8).toUpperCase()}`;
      }

      // Create new book
      const book = await Book.create(req.body);

      res.status(201).json({
        success: true,
        message: "Book created successfully",
        data: book,
      });
    } catch (error) {
      // Handle validation errors specifically
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((val) => val.message);
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: messages,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to create book",
        error: error.message,
      });
    }
  },

  /**
   * Update an existing book
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateBook: async (req, res) => {
    try {
      // Prevent updating ISBN or bookId to existing values
      if (req.body.isbn || req.body.bookId) {
        const { isbn, bookId } = req.body;

        if (isbn) {
          const existingIsbn = await Book.findOne({
            isbn,
            _id: { $ne: req.params.id },
          });

          if (existingIsbn) {
            return res.status(409).json({
              success: false,
              message: "Another book with this ISBN already exists",
            });
          }
        }

        if (bookId) {
          const existingBookId = await Book.findOne({
            bookId,
            _id: { $ne: req.params.id },
          });

          if (existingBookId) {
            return res.status(409).json({
              success: false,
              message: "Another book with this bookId already exists",
            });
          }
        }
      }

      // Find and update the book
      const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Book not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Book updated successfully",
        data: book,
      });
    } catch (error) {
      // Handle validation errors
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((val) => val.message);
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: messages,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to update book",
        error: error.message,
      });
    }
  },

  /**
   * Delete a book
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteBook: async (req, res) => {
    try {
      const book = await Book.findByIdAndDelete(req.params.id);

      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Book not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Book deleted successfully",
        data: {},
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete book",
        error: error.message,
      });
    }
  },

  /**
   * Search books by title, author, or ISBN
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  searchBooks: async (req, res) => {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: "Search query is required",
        });
      }

      // Create search query
      const searchQuery = {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { author: { $regex: query, $options: "i" } },
          { isbn: { $regex: query, $options: "i" } },
          { publisher: { $regex: query, $options: "i" } },
        ],
      };

      const books = await Book.find(searchQuery);

      res.status(200).json({
        success: true,
        count: books.length,
        data: books,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Search operation failed",
        error: error.message,
      });
    }
  },

  /**
   * Update book quantity (for inventory management)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateBookQuantity: async (req, res) => {
    try {
      const { quantity } = req.body;

      if (quantity === undefined || isNaN(quantity)) {
        return res.status(400).json({
          success: false,
          message: "Valid quantity is required",
        });
      }

      const book = await Book.findByIdAndUpdate(
        req.params.id,
        { quantity: parseInt(quantity) },
        { new: true }
      );

      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Book not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Book quantity updated successfully",
        data: book,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update book quantity",
        error: error.message,
      });
    }
  },

  /**
   * Get books by category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getBooksByCategory: async (req, res) => {
    try {
      const { category } = req.params;

      // Validate category is one of the allowed enum values
      const validCategories = [
        "Fiction",
        "Non-Fiction",
        "Reference",
        "Textbook",
        "Other",
      ];

      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid category. Must be one of: " + validCategories.join(", "),
        });
      }

      const books = await Book.find({ category });

      res.status(200).json({
        success: true,
        count: books.length,
        data: books,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve books by category",
        error: error.message,
      });
    }
  },

  /**
   * Get books by publication year
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getBooksByYear: async (req, res) => {
    try {
      const { year } = req.params;

      // Validate year
      if (!year || isNaN(year)) {
        return res.status(400).json({
          success: false,
          message: "Valid publication year is required",
        });
      }

      const books = await Book.find({ publicationYear: parseInt(year) });

      res.status(200).json({
        success: true,
        count: books.length,
        data: books,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve books by publication year",
        error: error.message,
      });
    }
  },

  /**
   * Get books by author
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getBooksByAuthor: async (req, res) => {
    try {
      const { author } = req.params;

      const books = await Book.find({
        author: { $regex: author, $options: "i" },
      });

      res.status(200).json({
        success: true,
        count: books.length,
        data: books,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve books by author",
        error: error.message,
      });
    }
  },

  /**
   * Get inventory statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getInventoryStats: async (req, res) => {
    try {
      // Total books count
      const totalBooks = await Book.countDocuments();

      // Books by category
      const categoryCounts = await Book.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      // Books by publication year (top 10 years)
      const yearCounts = await Book.aggregate([
        { $group: { _id: "$publicationYear", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      // Total book quantity (sum of all quantities)
      const totalQuantity = await Book.aggregate([
        { $group: { _id: null, total: { $sum: "$quantity" } } },
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalBooks,
          totalQuantity: totalQuantity.length > 0 ? totalQuantity[0].total : 0,
          categoryCounts,
          yearCounts,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve inventory statistics",
        error: error.message,
      });
    }
  },
};

export default bookController;
