import bookController from "../controllers/book.controller.js";
import express from "express";
import { authorize, protect } from "../middlewares/auth.middleware.js";
/**
 * Book Routes
 * Base path: /api/books
 */

const router = express.Router();
// Public routes (no authentication required)
router.get("/", bookController.getAllBooks);
router.get("/search", bookController.searchBooks);
router.get("/isbn/:isbn", bookController.getBookByIsbn);
router.get("/category/:category", bookController.getBooksByCategory);
router.get("/year/:year", bookController.getBooksByYear);
router.get("/author/:author", bookController.getBooksByAuthor);
router.get("/:id", bookController.getBookById);

// Protected routes (authentication required)
// Note: Use your actual authentication middleware
router.post("/", protect, authorize("admin"), bookController.createBook);
router.put("/:id", protect, authorize("admin"), bookController.updateBook);
router.delete("/:id", protect, authorize("admin"), bookController.deleteBook);
router.patch("/:id/quantity", protect, bookController.updateBookQuantity);

// Admin-only routes
router.get(
  "/stats/inventory",
  protect,
  authorize("admin"),
  bookController.getInventoryStats
);

export default router;
