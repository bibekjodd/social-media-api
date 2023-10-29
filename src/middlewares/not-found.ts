import { RequestHandler } from "express";

export const notFound: RequestHandler = (req, res) => {
  return res.status(400).json({
    message: "The requested url is not found",
  });
};
