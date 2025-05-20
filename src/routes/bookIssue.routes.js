import express from "express";
import BookIssueController from "../controllers/bookIssue.controller";

const router = express.Router();

router.post("/issues", BookIssueController.createBookIssue);
router.get("/issues", BookIssueController.getAllBookIssues);
router.get("/issues/:id", BookIssueController.getBookIssueById);
router.put("/issues/:id", BookIssueController.updateBookIssue);
router.delete("/issues/:id", BookIssueController.deleteBookIssue);
router.get("/issues/overdue", BookIssueController.getOverdueBooks);
router.get("/issues/:id/fine", BookIssueController.calculateFine);

export default router;
