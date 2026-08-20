import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

const products = [
  {
    name: "iPhone 16",
    description: "Latest Apple smartphone",
    price: 1200000,
    image: "/products/iphone-16.jpg",
    category: "phones",
    stock: 15,
  },
  {
    name: "MacBook Air M3",
    description: "Lightweight Apple laptop",
    price: 1800000,
    image: "/products/macbook-air.jpg",
    category: "laptops",
    stock: 10,
  },
  {
    name: "AirPods Pro",
    description: "Wireless noise-cancelling earbuds",
    price: 350000,
    image: "/products/airpods-pro.jpg",
    category: "audio",
    stock: 25,
  },
];

async function seed() {
  try {
    await prisma.product.deleteMany();

    await prisma.product.createMany({
      data: products,
    });

    console.log("Products seeded successfully");
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
