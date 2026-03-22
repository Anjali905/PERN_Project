import express from "express";
import { db } from "./db.js";
import { cars } from "./schema.js";
import { eq } from "drizzle-orm";

const app = express();
const PORT = 3000;

const router = express.Router();

app.use(express.json());

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Hello from Car API!");
});

router.get("/cars", async (req, res, next) => {
  try {
    const allCars = await db.select().from(cars);
    res.json(allCars);
  } catch (error) {
    next(error);
  }
});

router.post("/cars", async (req, res, next) => {
  const { make, model, year, price } = req.body;

  if (!make || !model || year === undefined || price === undefined) {
    return res.status(400).json({
      error: "Please provide make, model, year, and price",
    });
  }

  try {
    const [newCar] = await db
      .insert(cars)
      .values({ make, model, year: Number(year), price: String(price) })
      .returning({
        id: cars.id,
        make: cars.make,
        model: cars.model,
        year: cars.year,
        price: cars.price,
        createdAt: cars.createdAt,
      });

    res.status(201).json(newCar);
  } catch (error) {
    next(error);
  }
});

router.put("/cars/:id", async (req, res, next) => {
  const carId = parseInt(req.params.id);
  const { make, model, year, price } = req.body;

  try {
    const [updatedCar] = await db
      .update(cars)
      .set({
        ...(make !== undefined ? { make } : {}),
        ...(model !== undefined ? { model } : {}),
        ...(year !== undefined ? { year: Number(year) } : {}),
        ...(price !== undefined ? { price: String(price) } : {}),
      })
      .where(eq(cars.id, carId))
      .returning();

    if (!updatedCar) {
      return res.status(404).json({ error: "Car not found" });
    }

    res.json(updatedCar);
  } catch (error) {
    next(error);
  }
});

router.delete("/cars/:id", async (req, res, next) => {
  const carId = parseInt(req.params.id);

  try {
    const [deletedCar] = await db
      .delete(cars)
      .where(eq(cars.id, carId))
      .returning();

    if (!deletedCar) {
      return res.status(404).json({ error: "Car not found" });
    }

    res.json({
      message: "Car deleted successfully",
      car: deletedCar,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/cars/:id", async (req, res, next) => {
  const carId = parseInt(req.params.id);

  try {
    const [car] = await db.select().from(cars).where(eq(cars.id, carId));

    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    res.json(car);
  } catch (error) {
    next(error);
  }
});

app.use("/api/v1", router);

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
