import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import landRoutes from "./routes/landRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.route("/").get((req, res) => {
  res.send("running");
}
);

app.use("/api/users", userRoutes);
app.use("/api/lands", landRoutes);

export default app;
