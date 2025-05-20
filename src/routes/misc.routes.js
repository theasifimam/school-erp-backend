import express from "express";
import bookIssueController from "../controllers/bookIssue.controller.js";

const router = express.Router();

router.post("/issues", bookIssueController.createBookIssue);
router.get("/issues", bookIssueController.getAllBookIssues);
router.get("/issues/:id", bookIssueController.getBookIssueById);
router.put("/issues/:id", bookIssueController.updateBookIssue);
router.delete("/issues/:id", bookIssueController.deleteBookIssue);
router.get("/issues/overdue", bookIssueController.getOverdueBooks);
router.get("/issues/:id/fine", bookIssueController.calculateFine);

export default router;
