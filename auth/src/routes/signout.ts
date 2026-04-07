import express from "express";

const router = express.Router();

router.post("/api/users/signout", (req: any, res: any) => {
  req.session = null;

  res.status(200).send({ message: "Signed out successfully" });
});

export { router as signoutRouter };
