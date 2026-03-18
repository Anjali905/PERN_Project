import express from "express";
const app = express();
const port = 3000;
const router = express.Router();

app.use(express.json());

app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
})
let cars = [
  {
    id: 1,
    make: "Toyota",
    model: "Camry",
    year: 2020,
    price: 30000,
  },
  {
    id: 2,
    make: "Honda",
    model: "Civic",
    year: 2019,
    price: 25000,
  },
  {
    id: 3,
    make: "Ford",
    model: "F-150",
    year: 2021,
    price: 35000,
  },
];
app.get("/", (req, res) => {
  res.send("Welcome to the Car API!");
});

router.get("/", (req, res) => {
  res.json(cars);
});
router.get("/:id", (req, res) => {
  const Id = Number(req.params.id);
  const car = cars.find((c) => c.id === Id);
  if (!car) {
    return res.status(404).json({ message: "Car not found" });
  }
  res.json(car);
});
router.post("/", (req, res) => {
  const { make, model, year, price } = req.body;
  const newCar = {
    id: cars.length + 1,
    make,
    model,
    year: Number(year),
    price: Number(price),
  };
  cars.push(newCar);
  res.status(201).json(newCar);
});
router.put("/:id", (req, res) => {
    const Id = Number(req.params.id);
    const carIndex = cars.findIndex((c) => c.id === Id);
    if (carIndex === -1) {
      return res.status(404).json({ message: "Car not found" });
    }
    const { make, model, year, price } = req.body;
    if(make) cars[carIndex].make = make;
    if(model) cars[carIndex].model = model;
    if(year) cars[carIndex].year = Number(year);
    if(price) cars[carIndex].price = Number(price);
    res.json(cars[carIndex]);
});
router.delete("/:id", (req, res) => {
  const Id = Number(req.params.id);
  const carIndex = cars.findIndex((c) => c.id === Id);
  if (carIndex === -1) {
    return res.status(404).json({ message: "Car not found" });
  }
  cars.splice(carIndex, 1);
  res.json({ message: "Car deleted successfully" });
});
app.use("/api/v1/cars", router);
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
